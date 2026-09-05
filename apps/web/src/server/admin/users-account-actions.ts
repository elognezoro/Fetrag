'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@fetrag/auth'
import { emailSchema, idSchema, phoneSchema, roleLabels, roleSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, ConflictError, isSuperAdmin, PreconditionError } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { bool, firstErrors, nullableText, relationId, successState, text, toErrorState } from './form-helpers'

// -----------------------------------------------------------------------------
// Mot de passe temporaire
// -----------------------------------------------------------------------------

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%*-_'

function pick(set: string): string {
  return set[randomInt(set.length)] ?? set[0]!
}

/** Mot de passe temporaire aléatoire conforme à `passwordSchema` (majuscule, minuscule, chiffre, symbole). */
function generateTemporaryPassword(length = 14): string {
  const all = UPPER + LOWER + DIGITS + SYMBOLS
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)]
  while (chars.length < length) chars.push(pick(all))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
  }
  return chars.join('')
}

// -----------------------------------------------------------------------------
// Création manuelle d'un compte
// -----------------------------------------------------------------------------

export type UserCreateField = 'email' | 'firstName' | 'lastName' | 'phone' | 'jobTitle' | 'employer' | 'organizationId' | 'role'

const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().min(2, 'Prénom trop court').max(60),
  lastName: z.string().trim().min(2, 'Nom trop court').max(60),
  phone: phoneSchema.optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).nullable(),
  employer: z.string().trim().max(160).nullable(),
  organizationId: idSchema.nullable(),
  isManager: z.boolean(),
  role: roleSchema,
})

/**
 * Création manuelle d'un compte par l'administration (users.manage + roles.manage pour le rôle initial) :
 * mot de passe temporaire affiché une seule fois, rôle global initial, rattachement facultatif à une organisation.
 */
export async function createUserAction(_previous: ActionState<UserCreateField>, formData: FormData): Promise<ActionState<UserCreateField>> {
  const parsed = createUserSchema.safeParse({
    email: text(formData, 'email'),
    firstName: text(formData, 'firstName'),
    lastName: text(formData, 'lastName'),
    phone: text(formData, 'phone').trim(),
    jobTitle: nullableText(formData, 'jobTitle'),
    employer: nullableText(formData, 'employer'),
    organizationId: relationId(formData, 'organizationId'),
    isManager: bool(formData, 'isManager'),
    role: text(formData, 'role') || 'LEARNER',
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations du compte.', fieldErrors: firstErrors<UserCreateField>(parsed.error.issues) }
  }
  const data = parsed.data
  try {
    const principal = await requireActionCan('users.manage')
    await requireActionCan('roles.manage')
    const ctx = await adminRequestContext()

    const existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })
    if (existing) throw new ConflictError('Un compte existe déjà avec cette adresse email', { fieldErrors: { email: 'Adresse déjà utilisée' } })
    if (data.organizationId) {
      const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true } })
      if (!organization) return { status: 'error', message: 'Organisation introuvable.', fieldErrors: { organizationId: 'Organisation inconnue' } }
    }

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(temporaryPassword)
    const name = `${data.firstName} ${data.lastName}`.trim()

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        jobTitle: data.jobTitle,
        employer: data.employer,
        passwordHash,
        isActive: true,
        roleAssignments: { create: { role: data.role, scopeType: 'GLOBAL', grantedById: principal.id } },
        ...(data.organizationId ? { memberships: { create: { organizationId: data.organizationId, isManager: data.isManager } } } : {}),
      },
      select: { id: true, email: true },
    })

    const auditCtx = { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }
    await audit('user.registered', { type: 'User', id: user.id }, auditCtx, {
      after: { email: user.email, source: 'admin', organizationId: data.organizationId, isManager: data.isManager },
    })
    await audit('role.granted', { type: 'RoleAssignment', id: user.id }, auditCtx, {
      after: { userEmail: user.email, role: data.role, scopeType: 'GLOBAL', scopeId: null, expiresAt: null },
    })
    await notifyUser(user.id, {
      title: 'Bienvenue sur la plateforme FETRAG',
      body: `Votre compte (${roleLabels[data.role]}) a été créé par l’administration de la fédération. Connectez-vous avec le mot de passe temporaire transmis par votre administrateur, puis modifiez-le depuis « Sécurité ».`,
      href: '/espace/securite',
      category: 'account',
      email: true,
    }).catch(() => undefined)

    revalidatePath('/admin/utilisateurs')
    return successState('Compte créé. Transmettez le mot de passe temporaire par un canal sûr : il ne sera plus affiché.', {
      id: user.id,
      email: user.email,
      temporaryPassword,
    })
  } catch (error) {
    return toErrorState<UserCreateField>(error)
  }
}

// -----------------------------------------------------------------------------
// Réinitialisation forcée du mot de passe
// -----------------------------------------------------------------------------

/**
 * Définit un mot de passe temporaire (affiché une seule fois) et ferme les sessions de l'utilisateur.
 * Réservé au super administrateur ; l'utilisateur est informé sans que le mot de passe transite par email.
 */
export async function forceTemporaryPasswordAction(userId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(userId)
  if (!parsed.success) return { status: 'error', message: 'Utilisateur inconnu.' }
  try {
    const principal = await requireActionCan('users.manage')
    if (!isSuperAdmin(principal)) throw new PreconditionError('Réservé au super administrateur')
    if (parsed.data === principal.id) throw new PreconditionError('Modifiez votre propre mot de passe depuis votre espace personnel')
    const ctx = await adminRequestContext()
    const user = await prisma.user.findUnique({ where: { id: parsed.data }, select: { id: true, email: true, isActive: true, passwordHash: true } })
    if (!user) return { status: 'error', message: 'Utilisateur introuvable.' }
    if (!user.isActive) throw new PreconditionError('Réactivez le compte avant de définir un mot de passe')

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(temporaryPassword)
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])
    await audit('user.updated', { type: 'User', id: user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { hasPassword: Boolean(user.passwordHash) },
      after: { hasPassword: true, reason: 'temporary_password_by_admin', sessionsClosed: true },
    })
    await notifyUser(user.id, {
      title: 'Mot de passe temporaire défini',
      body: 'Un administrateur a défini un mot de passe temporaire sur votre compte et fermé vos sessions. Connectez-vous avec ce mot de passe puis choisissez-en un nouveau depuis « Sécurité ».',
      href: '/espace/securite',
      category: 'security',
      email: true,
    }).catch(() => undefined)
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    return successState(`Mot de passe temporaire défini pour ${user.email} ; ses sessions ont été fermées.`, { temporaryPassword, email: user.email })
  } catch (error) {
    return toErrorState(error)
  }
}
