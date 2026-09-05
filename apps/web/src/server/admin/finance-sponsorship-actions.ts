'use server'

import { revalidatePath } from 'next/cache'
import { emailSchema, idSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, PreconditionError } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { firstErrors, nullableDate, relationId, successState, text, toErrorState } from './form-helpers'

export type SponsorshipField = 'email' | 'label' | 'percent' | 'organizationId' | 'target' | 'validUntil'

const sponsorshipSchema = z
  .object({
    email: emailSchema,
    label: z.string().trim().min(3, 'Libellé trop court').max(120),
    percent: z.coerce.number().int().min(1, 'Entre 1 et 100').max(100, 'Entre 1 et 100'),
    organizationId: idSchema.nullable(),
    target: z.string().regex(/^(course|event):[0-9a-f-]{36}$/i).nullable(),
    validUntil: z.date().nullable(),
  })
  .refine((d) => !d.validUntil || d.validUntil.getTime() > Date.now(), { path: ['validUntil'], message: 'La date de validité doit être future' })

/**
 * Accorde une prise en charge (pourcentage du montant) à un bénéficiaire identifié par email,
 * éventuellement au nom d'une organisation et limitée à une formation ou un événement (finance.refund).
 */
export async function createSponsorshipAction(_previous: ActionState<SponsorshipField>, formData: FormData): Promise<ActionState<SponsorshipField>> {
  const parsed = sponsorshipSchema.safeParse({
    email: text(formData, 'email'),
    label: text(formData, 'label'),
    percent: text(formData, 'percent') || '100',
    organizationId: relationId(formData, 'organizationId'),
    target: relationId(formData, 'target'),
    validUntil: nullableDate(formData, 'validUntil') ?? null,
  })
  if (!parsed.success) return { status: 'error', message: 'Vérifiez les informations de la prise en charge.', fieldErrors: firstErrors<SponsorshipField>(parsed.error.issues) }
  const data = parsed.data
  try {
    const principal = await requireActionCan('finance.refund')
    const ctx = await adminRequestContext()
    const beneficiary = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true, email: true, isActive: true } })
    if (!beneficiary) return { status: 'error', message: 'Aucun compte ne correspond à cette adresse.', fieldErrors: { email: 'Compte introuvable' } }
    if (!beneficiary.isActive) throw new PreconditionError('Le compte du bénéficiaire est désactivé')
    if (data.organizationId) {
      const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true } })
      if (!organization) return { status: 'error', message: 'Organisation introuvable.', fieldErrors: { organizationId: 'Organisation inconnue' } }
    }
    let courseId: string | null = null
    let eventId: string | null = null
    if (data.target) {
      const [kind, id] = data.target.split(':') as ['course' | 'event', string]
      if (kind === 'course') {
        const course = await prisma.course.findUnique({ where: { id }, select: { id: true } })
        if (!course) return { status: 'error', message: 'Formation introuvable.', fieldErrors: { target: 'Formation inconnue' } }
        courseId = course.id
      } else {
        const event = await prisma.event.findUnique({ where: { id }, select: { id: true } })
        if (!event) return { status: 'error', message: 'Événement introuvable.', fieldErrors: { target: 'Événement inconnu' } }
        eventId = event.id
      }
    }
    const sponsorship = await prisma.sponsorship.create({
      data: { beneficiaryId: beneficiary.id, grantedById: principal.id, organizationId: data.organizationId, label: data.label, percent: data.percent, courseId, eventId, validUntil: data.validUntil },
      select: { id: true },
    })
    await audit('user.updated', { type: 'Sponsorship', id: sponsorship.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      after: { beneficiaryId: beneficiary.id, beneficiaryEmail: beneficiary.email, label: data.label, percent: data.percent, organizationId: data.organizationId, courseId, eventId, validUntil: data.validUntil?.toISOString() ?? null },
    })
    await notifyUser(beneficiary.id, {
      title: 'Prise en charge accordée',
      body: `Une prise en charge de ${data.percent} % (« ${data.label} ») a été accordée sur votre compte${data.validUntil ? ' ; elle est valable jusqu’à la date indiquée dans votre espace' : ''}. Elle s’applique automatiquement lors du paiement.`,
      href: '/espace/paiements',
      category: 'payments',
      email: true,
    }).catch(() => undefined)
    revalidatePath('/admin/finance/prises-en-charge')
    revalidatePath('/admin/finance')
    return successState(`Prise en charge de ${data.percent} % accordée à ${beneficiary.email}.`)
  } catch (error) {
    return toErrorState<SponsorshipField>(error)
  }
}

/** Supprime une prise en charge non encore utilisée par une commande (finance.refund). */
export async function deleteSponsorshipAction(sponsorshipId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(sponsorshipId)
  if (!parsed.success) return { status: 'error', message: 'Prise en charge inconnue.' }
  try {
    const principal = await requireActionCan('finance.refund')
    const ctx = await adminRequestContext()
    const sponsorship = await prisma.sponsorship.findUnique({ where: { id: parsed.data }, select: { id: true, label: true, percent: true, beneficiaryId: true, _count: { select: { orders: true } } } })
    if (!sponsorship) return { status: 'error', message: 'Prise en charge introuvable.' }
    if (sponsorship._count.orders > 0) throw new PreconditionError('Cette prise en charge a déjà été appliquée à une commande ; limitez plutôt sa validité')
    await prisma.sponsorship.delete({ where: { id: sponsorship.id } })
    await audit('user.updated', { type: 'Sponsorship', id: sponsorship.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { beneficiaryId: sponsorship.beneficiaryId, label: sponsorship.label, percent: sponsorship.percent },
      after: { deleted: true },
    })
    revalidatePath('/admin/finance/prises-en-charge')
    return successState(`Prise en charge « ${sponsorship.label} » supprimée.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Clôture immédiatement une prise en charge déjà utilisée (validité ramenée à maintenant). */
export async function expireSponsorshipAction(sponsorshipId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(sponsorshipId)
  if (!parsed.success) return { status: 'error', message: 'Prise en charge inconnue.' }
  try {
    const principal = await requireActionCan('finance.refund')
    const ctx = await adminRequestContext()
    const sponsorship = await prisma.sponsorship.findUnique({ where: { id: parsed.data }, select: { id: true, label: true, validUntil: true } })
    if (!sponsorship) return { status: 'error', message: 'Prise en charge introuvable.' }
    if (sponsorship.validUntil && sponsorship.validUntil.getTime() < Date.now()) return successState('Cette prise en charge est déjà expirée.')
    const now = new Date()
    await prisma.sponsorship.update({ where: { id: sponsorship.id }, data: { validUntil: now } })
    await audit('user.updated', { type: 'Sponsorship', id: sponsorship.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { validUntil: sponsorship.validUntil?.toISOString() ?? null },
      after: { validUntil: now.toISOString(), reason: 'closed_by_admin' },
    })
    revalidatePath('/admin/finance/prises-en-charge')
    return successState(`Prise en charge « ${sponsorship.label} » clôturée.`)
  } catch (error) {
    return toErrorState(error)
  }
}
