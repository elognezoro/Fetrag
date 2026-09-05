'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { emailSchema, idSchema, phoneSchema, slugSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, ConflictError, PreconditionError, uniqueSlug } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { bool, firstErrors, nullableInt, nullableText, optionalSlug, successState, text, toErrorState } from './form-helpers'

// -----------------------------------------------------------------------------
// Création d'une organisation
// -----------------------------------------------------------------------------

export type OrganizationField = 'name' | 'acronym' | 'slug' | 'sector' | 'description' | 'address' | 'city' | 'country' | 'phone' | 'email' | 'website' | 'memberCount'

const organizationSchema = z.object({
  name: z.string().trim().min(3, 'Nom trop court').max(160),
  acronym: z.string().trim().max(30).nullable(),
  slug: slugSchema.optional(),
  sector: z.string().trim().max(120).nullable(),
  description: z.string().trim().max(2000).nullable(),
  address: z.string().trim().max(200).nullable(),
  city: z.string().trim().max(80).nullable(),
  country: z.string().trim().length(2, 'Code pays ISO à 2 lettres').toUpperCase(),
  phone: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  website: z.string().trim().url('Adresse web invalide').max(200).optional().or(z.literal('')),
  memberCount: z.number().int().min(0).max(1_000_000).nullable(),
  isAffiliate: z.boolean(),
  isActive: z.boolean(),
})

/** Crée une organisation (affiliée ou partenaire) puis ouvre sa fiche (organization.manage). */
export async function createOrganizationAction(_previous: ActionState<OrganizationField>, formData: FormData): Promise<ActionState<OrganizationField>> {
  const parsed = organizationSchema.safeParse({
    name: text(formData, 'name'),
    acronym: nullableText(formData, 'acronym')?.toUpperCase() ?? null,
    slug: optionalSlug(formData),
    sector: nullableText(formData, 'sector'),
    description: nullableText(formData, 'description'),
    address: nullableText(formData, 'address'),
    city: nullableText(formData, 'city'),
    country: text(formData, 'country') || 'GA',
    phone: text(formData, 'phone').trim(),
    email: text(formData, 'email').trim(),
    website: text(formData, 'website').trim(),
    memberCount: nullableInt(formData, 'memberCount'),
    isAffiliate: bool(formData, 'isAffiliate'),
    isActive: bool(formData, 'isActive'),
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations de l’organisation.', fieldErrors: firstErrors<OrganizationField>(parsed.error.issues) }
  }
  const data = parsed.data
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('organization.manage')
    const ctx = await adminRequestContext()
    const slug = data.slug ?? (await uniqueSlug(data.acronym || data.name, async (candidate) => Boolean(await prisma.organization.findUnique({ where: { slug: candidate }, select: { id: true } }))))
    if (data.slug) {
      const taken = await prisma.organization.findUnique({ where: { slug }, select: { id: true } })
      if (taken) throw new ConflictError('Ce slug est déjà utilisé', { fieldErrors: { slug: 'Slug déjà utilisé' } })
    }
    const organization = await prisma.organization.create({
      data: {
        slug,
        name: data.name,
        acronym: data.acronym,
        sector: data.sector,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        memberCount: data.memberCount,
        isAffiliate: data.isAffiliate,
        isActive: data.isActive,
      },
      select: { id: true, name: true, slug: true },
    })
    createdId = organization.id
    await audit('content.created', { type: 'Organization', id: organization.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      after: { name: organization.name, slug: organization.slug, isAffiliate: data.isAffiliate, sector: data.sector },
    })
    revalidatePath('/admin/organisations')
    revalidatePath('/organisations')
  } catch (error) {
    return toErrorState<OrganizationField>(error)
  }
  redirect(`/admin/organisations/${createdId}?cree=1`)
}

// -----------------------------------------------------------------------------
// Membres
// -----------------------------------------------------------------------------

export type MemberField = 'email' | 'title'

const memberSchema = z.object({
  organizationId: idSchema,
  email: emailSchema,
  title: z.string().trim().max(120).nullable(),
  isManager: z.boolean(),
})

/** Rattache un compte existant (recherché par email) à l'organisation (organization.manage). */
export async function addOrganizationMemberAction(_previous: ActionState<MemberField>, formData: FormData): Promise<ActionState<MemberField>> {
  const parsed = memberSchema.safeParse({
    organizationId: text(formData, 'organizationId'),
    email: text(formData, 'email'),
    title: nullableText(formData, 'title'),
    isManager: bool(formData, 'isManager'),
  })
  if (!parsed.success) return { status: 'error', message: 'Vérifiez l’adresse email.', fieldErrors: firstErrors<MemberField>(parsed.error.issues) }
  const data = parsed.data
  try {
    const principal = await requireActionCan('organization.manage', { organizationId: data.organizationId })
    const ctx = await adminRequestContext()
    const [organization, user] = await Promise.all([
      prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true, name: true } }),
      prisma.user.findUnique({ where: { email: data.email }, select: { id: true, email: true, isActive: true } }),
    ])
    if (!organization) return { status: 'error', message: 'Organisation introuvable.' }
    if (!user) return { status: 'error', message: 'Aucun compte ne correspond à cette adresse ; créez d’abord l’utilisateur.', fieldErrors: { email: 'Compte introuvable' } }
    const existing = await prisma.organizationMembership.findUnique({ where: { organizationId_userId: { organizationId: organization.id, userId: user.id } }, select: { id: true } })
    if (existing) throw new ConflictError('Ce compte est déjà membre de l’organisation', { fieldErrors: { email: 'Déjà membre' } })
    const membership = await prisma.organizationMembership.create({ data: { organizationId: organization.id, userId: user.id, title: data.title, isManager: data.isManager } })
    await audit('user.updated', { type: 'User', id: user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      after: { membershipId: membership.id, organizationId: organization.id, organization: organization.name, isManager: data.isManager, title: data.title },
    })
    await notifyUser(user.id, {
      title: `Rattachement à ${organization.name}`,
      body: data.isManager ? `Vous êtes désormais responsable de « ${organization.name} » sur la plateforme FETRAG : vous pouvez déposer des demandes de formation et suivre vos participants.` : `Votre compte a été rattaché à « ${organization.name} » sur la plateforme FETRAG.`,
      href: '/espace',
      category: 'account',
      email: true,
    }).catch(() => undefined)
    revalidatePath(`/admin/organisations/${organization.id}`)
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    return successState(`${user.email} rattaché à ${organization.name}.`)
  } catch (error) {
    return toErrorState<MemberField>(error)
  }
}

/** Donne ou retire la qualité de responsable d'organisation à un membre (organization.manage). */
export async function setMembershipManagerAction(membershipId: string, isManager: boolean): Promise<ActionState> {
  const parsed = idSchema.safeParse(membershipId)
  if (!parsed.success) return { status: 'error', message: 'Membre inconnu.' }
  try {
    const membership = await prisma.organizationMembership.findUnique({ where: { id: parsed.data }, include: { user: { select: { id: true, email: true } }, organization: { select: { id: true, name: true } } } })
    if (!membership) return { status: 'error', message: 'Membre introuvable.' }
    const principal = await requireActionCan('organization.manage', { organizationId: membership.organizationId })
    const ctx = await adminRequestContext()
    if (membership.isManager === isManager) return successState(isManager ? 'Ce membre est déjà responsable.' : 'Ce membre n’est pas responsable.')
    await prisma.organizationMembership.update({ where: { id: membership.id }, data: { isManager } })
    await audit('user.updated', { type: 'User', id: membership.user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { organizationId: membership.organizationId, isManager: membership.isManager },
      after: { organizationId: membership.organizationId, isManager },
    })
    revalidatePath(`/admin/organisations/${membership.organizationId}`)
    revalidatePath(`/admin/utilisateurs/${membership.user.id}`)
    return successState(isManager ? `${membership.user.email} est désormais responsable de ${membership.organization.name}.` : `${membership.user.email} n’est plus responsable de ${membership.organization.name}.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Retire un membre de l'organisation (organization.manage). Ses inscriptions et demandes sont conservées. */
export async function removeMembershipAction(membershipId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(membershipId)
  if (!parsed.success) return { status: 'error', message: 'Membre inconnu.' }
  try {
    const membership = await prisma.organizationMembership.findUnique({ where: { id: parsed.data }, include: { user: { select: { id: true, email: true } }, organization: { select: { id: true, name: true } } } })
    if (!membership) return { status: 'error', message: 'Membre introuvable.' }
    const principal = await requireActionCan('organization.manage', { organizationId: membership.organizationId })
    const ctx = await adminRequestContext()
    if (membership.isManager) {
      const managers = await prisma.organizationMembership.count({ where: { organizationId: membership.organizationId, isManager: true, id: { not: membership.id } } })
      if (managers === 0) throw new PreconditionError('Désignez un autre responsable avant de retirer celui-ci')
    }
    await prisma.organizationMembership.delete({ where: { id: membership.id } })
    await audit('user.updated', { type: 'User', id: membership.user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { membershipId: membership.id, organizationId: membership.organizationId, isManager: membership.isManager },
      after: { organizationId: null },
    })
    revalidatePath(`/admin/organisations/${membership.organizationId}`)
    revalidatePath(`/admin/utilisateurs/${membership.user.id}`)
    return successState(`${membership.user.email} retiré de ${membership.organization.name}.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Active ou désactive une organisation (organization.manage). Une organisation inactive n'apparaît plus dans les listes de choix. */
export async function setOrganizationActiveAction(organizationId: string, active: boolean): Promise<ActionState> {
  const parsed = idSchema.safeParse(organizationId)
  if (!parsed.success) return { status: 'error', message: 'Organisation inconnue.' }
  try {
    const principal = await requireActionCan('organization.manage', { organizationId: parsed.data })
    const ctx = await adminRequestContext()
    const organization = await prisma.organization.findUnique({ where: { id: parsed.data }, select: { id: true, name: true, isActive: true } })
    if (!organization) return { status: 'error', message: 'Organisation introuvable.' }
    if (organization.isActive === active) return successState(active ? 'L’organisation est déjà active.' : 'L’organisation est déjà inactive.')
    await prisma.organization.update({ where: { id: organization.id }, data: { isActive: active } })
    await audit('content.updated', { type: 'Organization', id: organization.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { isActive: organization.isActive },
      after: { isActive: active },
    })
    revalidatePath(`/admin/organisations/${organization.id}`)
    revalidatePath('/admin/organisations')
    revalidatePath('/organisations')
    return successState(active ? `${organization.name} réactivée.` : `${organization.name} désactivée.`)
  } catch (error) {
    return toErrorState(error)
  }
}
