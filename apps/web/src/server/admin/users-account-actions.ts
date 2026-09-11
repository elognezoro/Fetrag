'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createEmailToken, hashPassword } from '@fetrag/auth'
import { resolvePublicUrl } from '@fetrag/config'
import { emailSchema, idSchema, phoneSchema, roleLabels, roleSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, ConflictError, isSuperAdmin, PreconditionError } from '@fetrag/domain'
import { notifyUser, sendEmail } from '@fetrag/notifications'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { bool, firstErrors, nullableText, relationId, successState, text, toErrorState } from './form-helpers'

// -----------------------------------------------------------------------------
// Invitation par email (lien « définir mon mot de passe »)
// -----------------------------------------------------------------------------

/** Durée de validité du lien d'invitation envoyé aux comptes créés ou réinitialisés par l'administration. */
const INVITATION_TTL_DAYS = 7

/**
 * Crée un jeton `reset-password` à usage unique (7 jours) et envoie le template `account-invitation`.
 * Le mot de passe temporaire n'est jamais transmis par email. Renvoie `true` si l'envoi a été accepté
 * (immédiat ou mis en file) ; les échecs sont journalisés sans faire échouer l'action.
 */
async function sendAccountInvitation(user: { email: string; firstName: string | null }, organizationName: string | null): Promise<boolean> {
  try {
    const { token } = await createEmailToken(user.email, 'reset-password', INVITATION_TTL_DAYS * 24 * 60)
    const result = await sendEmail({
      to: user.email,
      template: 'account-invitation',
      variables: {
        firstName: user.firstName,
        organizationName,
        setPasswordUrl: `${resolvePublicUrl('web')}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
        expiresDays: String(INVITATION_TTL_DAYS),
      },
    })
    return result.status === 'SENT' || result.status === 'QUEUED'
  } catch (error) {
    console.error('[admin] invitation par email impossible', error instanceof Error ? error.message : error)
    return false
  }
}

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
 * adresse considérée comme validée, invitation par email pour définir le mot de passe (lien 7 jours),
 * mot de passe temporaire affiché une seule fois (canal de secours), rôle global initial, rattachement facultatif à une organisation.
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
    let organizationName: string | null = null
    if (data.organizationId) {
      const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true, name: true } })
      if (!organization) return { status: 'error', message: 'Organisation introuvable.', fieldErrors: { organizationId: 'Organisation inconnue' } }
      organizationName = organization.name
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
        // Adresse saisie par un administrateur : considérée comme validée (pas de lien de confirmation).
        emailVerified: new Date(),
        isActive: true,
        roleAssignments: { create: { role: data.role, scopeType: 'GLOBAL', grantedById: principal.id } },
        ...(data.organizationId ? { memberships: { create: { organizationId: data.organizationId, isManager: data.isManager } } } : {}),
      },
      select: { id: true, email: true, firstName: true },
    })

    const invitationSent = await sendAccountInvitation(user, organizationName)

    const auditCtx = { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }
    await audit('user.registered', { type: 'User', id: user.id }, auditCtx, {
      after: { email: user.email, source: 'admin', organizationId: data.organizationId, isManager: data.isManager, emailVerified: true, invitationSent, invitationDays: INVITATION_TTL_DAYS },
    })
    await audit('role.granted', { type: 'RoleAssignment', id: user.id }, auditCtx, {
      after: { userEmail: user.email, role: data.role, scopeType: 'GLOBAL', scopeId: null, expiresAt: null },
    })
    await notifyUser(user.id, {
      title: 'Bienvenue sur la plateforme FETRAG',
      body: `Votre compte (${roleLabels[data.role]}) a été créé par l’administration de la fédération. Un lien pour définir votre mot de passe vous a été envoyé par email (valable ${INVITATION_TTL_DAYS} jours). Vous pourrez le modifier à tout moment depuis « Sécurité ».`,
      href: '/espace/securite',
      category: 'account',
      email: false,
    }).catch(() => undefined)

    revalidatePath('/admin/utilisateurs')
    const message = invitationSent
      ? `Compte créé. Une invitation à définir son mot de passe (lien valable ${INVITATION_TTL_DAYS} jours) a été envoyée à ${user.email}. Le mot de passe temporaire ci-dessous reste un canal de secours : il ne sera plus affiché.`
      : `Compte créé, mais l’invitation par email n’a pas pu être envoyée à ${user.email}. Transmettez le mot de passe temporaire par un canal sûr : il ne sera plus affiché.`
    return successState(message, {
      id: user.id,
      email: user.email,
      temporaryPassword,
      invitationSent,
    })
  } catch (error) {
    return toErrorState<UserCreateField>(error)
  }
}

// -----------------------------------------------------------------------------
// Réinitialisation forcée du mot de passe
// -----------------------------------------------------------------------------

/**
 * Définit un mot de passe temporaire (affiché une seule fois), ferme les sessions de l'utilisateur et lui envoie
 * une invitation par email pour définir lui-même un nouveau mot de passe (lien 7 jours).
 * Réservé au super administrateur ; le mot de passe temporaire ne transite jamais par email.
 */
export async function forceTemporaryPasswordAction(userId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(userId)
  if (!parsed.success) return { status: 'error', message: 'Utilisateur inconnu.' }
  try {
    const principal = await requireActionCan('users.manage')
    if (!isSuperAdmin(principal)) throw new PreconditionError('Réservé au super administrateur')
    if (parsed.data === principal.id) throw new PreconditionError('Modifiez votre propre mot de passe depuis votre espace personnel')
    const ctx = await adminRequestContext()
    const user = await prisma.user.findUnique({
      where: { id: parsed.data },
      select: { id: true, email: true, firstName: true, isActive: true, passwordHash: true, emailVerified: true },
    })
    if (!user) return { status: 'error', message: 'Utilisateur introuvable.' }
    if (!user.isActive) throw new PreconditionError('Réactivez le compte avant de définir un mot de passe')

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(temporaryPassword)
    await prisma.$transaction([
      // Un administrateur qui réinitialise le compte atteste de l'adresse : elle est considérée comme validée.
      prisma.user.update({ where: { id: user.id }, data: { passwordHash, emailVerified: user.emailVerified ?? new Date() } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])
    const invitationSent = await sendAccountInvitation(user, null)
    await audit('user.updated', { type: 'User', id: user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { hasPassword: Boolean(user.passwordHash), emailVerified: Boolean(user.emailVerified) },
      after: { hasPassword: true, emailVerified: true, reason: 'temporary_password_by_admin', sessionsClosed: true, invitationSent, invitationDays: INVITATION_TTL_DAYS },
    })
    await notifyUser(user.id, {
      title: 'Mot de passe réinitialisé par un administrateur',
      body: `Un administrateur a réinitialisé le mot de passe de votre compte et fermé vos sessions. Un lien pour définir un nouveau mot de passe vous a été envoyé par email (valable ${INVITATION_TTL_DAYS} jours).`,
      href: '/espace/securite',
      category: 'security',
      email: false,
    }).catch(() => undefined)
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    const message = invitationSent
      ? `Mot de passe temporaire défini pour ${user.email} ; ses sessions ont été fermées et une invitation à définir un nouveau mot de passe lui a été envoyée (lien valable ${INVITATION_TTL_DAYS} jours).`
      : `Mot de passe temporaire défini pour ${user.email} ; ses sessions ont été fermées. L’invitation par email n’a pas pu être envoyée : transmettez le mot de passe par un canal sûr.`
    return successState(message, { temporaryPassword, email: user.email, invitationSent })
  } catch (error) {
    return toErrorState(error)
  }
}
