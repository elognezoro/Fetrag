'use server'

import { revalidatePath } from 'next/cache'
import { disableMfa, enableMfa, generateTotpSecret, hashPassword, totpQrDataUrl, verifyMfaForUser, verifyPassword } from '@fetrag/auth'
import { passwordSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, formatDateTime } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { guards } from '@/lib/auth'
import { publicEnv } from '@/lib/env'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { firstErrors, requestContext, successState, text, toErrorState, type ActionState } from './common'

export type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword'
export type MfaField = 'code' | 'password'

/** Génère un secret TOTP et le QR code à scanner ; le secret est renvoyé au client pour l'étape de confirmation. */
export async function startMfaSetupAction(): Promise<ActionState<MfaField>> {
  const principal = await guards.requireUser('/espace/securite')
  try {
    const user = await prisma.user.findUnique({ where: { id: principal.id }, select: { totpEnabled: true } })
    if (user?.totpEnabled) return { status: 'error', message: 'La vérification en deux étapes est déjà activée sur ce compte.' }
    const secret = generateTotpSecret()
    const qrDataUrl = await totpQrDataUrl(principal.email, secret)
    return successState('Scannez le QR code avec votre application d’authentification.', { secret, qrDataUrl })
  } catch (error) {
    return toErrorState<MfaField>(error)
  }
}

const confirmMfaSchema = z.object({
  secret: z.string().min(16).max(128),
  code: z.string().trim().regex(/^[0-9 ]{6,8}$/, 'Saisissez le code à 6 chiffres de votre application'),
})

/** Vérifie le premier code TOTP puis active la MFA ; les codes de secours sont renvoyés une seule fois. */
export async function confirmMfaAction(_previous: ActionState<MfaField>, formData: FormData): Promise<ActionState<MfaField>> {
  const principal = await guards.requireUser('/espace/securite')
  const parsed = confirmMfaSchema.safeParse({ secret: text(formData, 'secret'), code: text(formData, 'code') })
  if (!parsed.success) {
    return { status: 'error', message: 'Le code saisi est invalide.', fieldErrors: firstErrors<MfaField>(parsed.error.issues) }
  }
  const limit = checkRateLimit(`mfa-confirm:${principal.id}`, 8, 10 * 60_000)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.` }
  }
  try {
    const result = await enableMfa(principal.id, parsed.data.secret, parsed.data.code)
    if (!result) {
      return { status: 'error', message: 'Le code ne correspond pas. Vérifiez l’heure de votre appareil et réessayez.', fieldErrors: { code: 'Code incorrect' } }
    }
    await notifyUser(principal.id, {
      title: 'Vérification en deux étapes activée',
      body: 'La vérification en deux étapes a été activée sur votre compte FETRAG. Si vous n’êtes pas à l’origine de cette action, contactez le support.',
      href: '/espace/securite',
      category: 'security',
      email: true,
    }).catch(() => undefined)
    revalidatePath('/espace/securite')
    return successState('La vérification en deux étapes est activée. Conservez vos codes de secours en lieu sûr.', { backupCodes: result.backupCodes })
  } catch (error) {
    return toErrorState<MfaField>(error)
  }
}

const disableMfaSchema = z.object({ code: z.string().trim().min(6).max(12) })

/** Désactive la MFA après vérification d'un code TOTP ou d'un code de secours. */
export async function disableMfaAction(_previous: ActionState<MfaField>, formData: FormData): Promise<ActionState<MfaField>> {
  const principal = await guards.requireUser('/espace/securite')
  const parsed = disableMfaSchema.safeParse({ code: text(formData, 'code') })
  if (!parsed.success) {
    return { status: 'error', message: 'Saisissez un code de vérification valide.', fieldErrors: { code: 'Code requis' } }
  }
  const limit = checkRateLimit(`mfa-disable:${principal.id}`, 6, 10 * 60_000)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.` }
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: principal.id }, select: { id: true, totpEnabled: true, totpSecret: true, backupCodes: true } })
    if (!user?.totpEnabled) return { status: 'error', message: 'La vérification en deux étapes n’est pas activée.' }
    const valid = await verifyMfaForUser(user, parsed.data.code)
    if (!valid) return { status: 'error', message: 'Le code est invalide.', fieldErrors: { code: 'Code incorrect' } }
    await disableMfa(principal.id)
    const ctx = await requestContext()
    await audit('user.updated', { type: 'User', id: principal.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { totpEnabled: true },
      after: { totpEnabled: false },
    })
    await notifyUser(principal.id, {
      title: 'Vérification en deux étapes désactivée',
      body: 'La vérification en deux étapes a été désactivée sur votre compte FETRAG. Nous vous recommandons de la réactiver.',
      href: '/espace/securite',
      category: 'security',
      email: true,
    }).catch(() => undefined)
    revalidatePath('/espace/securite')
    return successState('La vérification en deux étapes a été désactivée.')
  } catch (error) {
    return toErrorState<MfaField>(error)
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas' })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ['newPassword'], message: 'Le nouveau mot de passe doit être différent de l’actuel' })

/** Change le mot de passe local après vérification de l'actuel (passwordSchema). */
export async function changePasswordAction(_previous: ActionState<PasswordField>, formData: FormData): Promise<ActionState<PasswordField>> {
  const principal = await guards.requireUser('/espace/securite')
  const parsed = changePasswordSchema.safeParse({
    currentPassword: text(formData, 'currentPassword'),
    newPassword: text(formData, 'newPassword'),
    confirmPassword: text(formData, 'confirmPassword'),
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations saisies.', fieldErrors: firstErrors<PasswordField>(parsed.error.issues) }
  }
  const limit = checkRateLimit(`password-change:${principal.id}`, 5, 15 * 60_000)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.` }
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: principal.id }, select: { passwordHash: true } })
    if (!user?.passwordHash) {
      return { status: 'error', message: 'Ce compte utilise un fournisseur d’identité externe : le mot de passe se gère depuis ce fournisseur.' }
    }
    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash)
    if (!ok) return { status: 'error', message: 'Le mot de passe actuel est incorrect.', fieldErrors: { currentPassword: 'Mot de passe incorrect' } }
    const changedAt = new Date()
    await prisma.user.update({ where: { id: principal.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } })
    const ctx = await requestContext()
    await audit('auth.password_changed', { type: 'User', id: principal.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent })
    // Notification interne + email dédié `password-changed` (date en heure de Libreville).
    await notifyUser(principal.id, {
      title: 'Mot de passe modifié',
      body: 'Votre mot de passe FETRAG vient d’être modifié. Si vous n’êtes pas à l’origine de ce changement, contactez immédiatement le support.',
      href: '/espace/securite',
      category: 'security',
      email: true,
      emailTemplate: 'password-changed',
      emailVariables: { loginUrl: `${publicEnv.webUrl}/connexion`, changedAt: formatDateTime(changedAt) },
    }).catch(() => undefined)
    revalidatePath('/espace/securite')
    return successState('Votre mot de passe a été modifié.')
  } catch (error) {
    return toErrorState<PasswordField>(error)
  }
}
