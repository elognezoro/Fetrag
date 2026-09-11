import 'server-only'
import { headers } from 'next/headers'
import { consumeEmailToken, createEmailToken } from '@fetrag/auth'
import { prisma } from '@fetrag/db'
import { audit, formatDateTime, hashIp } from '@fetrag/domain'
import { sendEmail } from '@fetrag/notifications'
import { resolvePublicUrl } from '@/lib/env'

/**
 * Helpers serveur des parcours d'authentification (inscription, confirmation d'adresse, mot de passe).
 * Ce module ne porte pas la directive « use server » : ses fonctions ne sont pas exposées comme actions.
 */

/** Durées de validité communiquées dans les emails (alignées sur `createEmailToken`). */
export const VERIFY_EMAIL_TTL_HOURS = 24
export const RESET_PASSWORD_TTL_MINUTES = 30

/** URL publique absolue du site institutionnel, sans barre oblique finale. */
export function webBaseUrl(): string {
  return resolvePublicUrl('web').replace(/\/+$/, '')
}

/** Contexte réseau de la requête (IP hachée, agent utilisateur) pour l'audit et les consentements. */
export async function requestContext(): Promise<{ ip: string | null; ipHash: string | null; userAgent: string | null }> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  return { ip, ipHash: hashIp(ip), userAgent: h.get('user-agent') }
}

interface Recipient {
  email: string
  firstName: string | null
}

/**
 * Crée un jeton de confirmation d'adresse (24 h) et envoie le template `email-verification`.
 * Les erreurs d'envoi sont journalisées sans interrompre le parcours : l'utilisateur peut redemander un lien.
 */
export async function sendVerificationEmail(user: Recipient): Promise<boolean> {
  try {
    const { token } = await createEmailToken(user.email, 'verify-email', VERIFY_EMAIL_TTL_HOURS * 60)
    const result = await sendEmail({
      to: user.email,
      template: 'email-verification',
      variables: {
        firstName: user.firstName ?? '',
        verifyUrl: `${webBaseUrl()}/verifier-email?token=${encodeURIComponent(token)}`,
        expiresHours: String(VERIFY_EMAIL_TTL_HOURS),
      },
    })
    return result.status !== 'FAILED'
  } catch (error) {
    console.error('[auth] email de confirmation non envoyé', error instanceof Error ? error.message : error)
    return false
  }
}

/** Email de bienvenue, envoyé une fois l'adresse confirmée. */
export async function sendWelcomeEmail(user: Recipient & { id?: string }): Promise<void> {
  try {
    await sendEmail({
      to: user.email,
      userId: user.id ?? null,
      template: 'welcome',
      variables: { firstName: user.firstName ?? '', loginUrl: `${webBaseUrl()}/connexion` },
    })
  } catch (error) {
    console.warn('[auth] email de bienvenue non envoyé', error instanceof Error ? error.message : error)
  }
}

/**
 * Crée un jeton de réinitialisation (30 min) et envoie le template `password-reset`.
 * À n'appeler que pour un compte existant et actif ; l'appelant conserve une réponse neutre.
 */
export async function sendPasswordResetEmail(user: Recipient & { id: string }): Promise<void> {
  const { token } = await createEmailToken(user.email, 'reset-password', RESET_PASSWORD_TTL_MINUTES)
  await sendEmail({
    to: user.email,
    userId: user.id,
    template: 'password-reset',
    variables: {
      firstName: user.firstName ?? '',
      resetUrl: `${webBaseUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
      expiresMinutes: String(RESET_PASSWORD_TTL_MINUTES),
    },
  })
}

/** Confirmation de changement de mot de passe (`password-changed`), date affichée en heure de Libreville. */
export async function sendPasswordChangedEmail(user: Recipient & { id: string }, changedAt: Date): Promise<void> {
  try {
    await sendEmail({
      to: user.email,
      userId: user.id,
      template: 'password-changed',
      variables: {
        firstName: user.firstName ?? '',
        loginUrl: `${webBaseUrl()}/connexion`,
        changedAt: formatDateTime(changedAt),
      },
    })
  } catch (error) {
    console.warn('[auth] email de confirmation de mot de passe non envoyé', error instanceof Error ? error.message : error)
  }
}

export type EmailConfirmationResult =
  | { status: 'verified'; firstName: string | null }
  | { status: 'already_verified' }
  | { status: 'invalid' }

/**
 * Consomme un jeton `verify-email` : marque l'adresse comme confirmée (si elle ne l'était pas),
 * journalise l'audit et envoie l'email de bienvenue. Le jeton est à usage unique.
 */
export async function confirmEmailWithToken(rawToken: string): Promise<EmailConfirmationResult> {
  const email = await consumeEmailToken(rawToken, 'verify-email')
  if (!email) return { status: 'invalid' }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true, emailVerified: true },
  })
  if (!user) return { status: 'invalid' }
  if (user.emailVerified) return { status: 'already_verified' }

  const now = new Date()
  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: now } })
  const ctx = await requestContext()
  await audit(
    'user.updated',
    { type: 'User', id: user.id },
    { actorId: user.id, actorEmail: user.email, ip: ctx.ip, userAgent: ctx.userAgent },
    { before: { emailVerified: null }, after: { emailVerified: now.toISOString(), reason: 'email_verified' } },
  )
  await sendWelcomeEmail({ id: user.id, email: user.email, firstName: user.firstName })
  return { status: 'verified', firstName: user.firstName }
}
