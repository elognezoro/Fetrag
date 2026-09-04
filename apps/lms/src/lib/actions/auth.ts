'use server'

import { headers } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { CredentialsSignin } from 'next-auth'
import { features } from '@fetrag/config'
import { loginSchema, type z } from '@fetrag/contracts'
import { audit, hashIp } from '@fetrag/domain'
import { auth, signIn, signOut } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { loginMessageFor, safeCallbackUrl, type LoginErrorCode, type LoginState } from './auth-types'

const MINUTE = 60_000

/** Lit une valeur texte d'un FormData (chaîne vide si absente). */
function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Contexte réseau de la requête (IP hachée, agent utilisateur) pour l'audit et la limitation de débit. */
async function requestContext(): Promise<{ ip: string | null; ipHash: string | null; userAgent: string | null }> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  return { ip, ipHash: hashIp(ip), userAgent: h.get('user-agent') }
}

/** Extrait le code d'erreur Auth.js d'une exception de connexion. */
function credentialsErrorCode(error: unknown): LoginErrorCode {
  const known: LoginErrorCode[] = ['invalid_credentials', 'mfa_required', 'inactive']
  if (error instanceof CredentialsSignin) {
    return known.includes(error.code as LoginErrorCode) ? (error.code as LoginErrorCode) : 'invalid_credentials'
  }
  if (error && typeof error === 'object') {
    const candidate = error as { type?: unknown; code?: unknown }
    if (candidate.type === 'CredentialsSignin') {
      return known.includes(candidate.code as LoginErrorCode) ? (candidate.code as LoginErrorCode) : 'invalid_credentials'
    }
  }
  return 'unknown'
}

/** Première erreur Zod par champ. */
function firstErrors<T extends string>(issues: z.ZodIssue[]): Partial<Record<T, string>> {
  const out: Partial<Record<T, string>> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in out)) out[key as T] = issue.message
  }
  return out
}

/**
 * Server Action de connexion (email + mot de passe + code MFA optionnel).
 * Utilise `signIn('credentials', { redirect: false })` et traduit les codes d'erreur
 * `invalid_credentials`, `mfa_required` et `inactive` en état de formulaire.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const callbackUrl = safeCallbackUrl(field(formData, 'callbackUrl'), '/dashboard')
  const mfaCode = field(formData, 'code').trim()
  const parsed = loginSchema.safeParse({
    email: field(formData, 'email'),
    password: field(formData, 'password'),
    callbackUrl,
  })
  if (!parsed.success) {
    return {
      status: 'error',
      code: 'validation',
      message: loginMessageFor('validation'),
      fieldErrors: firstErrors<'email' | 'password'>(parsed.error.issues),
      email: field(formData, 'email'),
    }
  }

  if (!features.localAuth()) {
    return {
      status: 'error',
      code: 'unknown',
      message: 'La connexion par mot de passe est désactivée : utilisez le compte FETRAG.',
      email: parsed.data.email,
    }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`login:${ctx.ipHash ?? 'anonymous'}:${parsed.data.email}`, 10, 15 * MINUTE)
  if (!limit.allowed) {
    return {
      status: 'error',
      code: 'rate_limited',
      message: `${loginMessageFor('rate_limited')} (${formatRetryDelay(limit.retryAfterSeconds)})`,
      email: parsed.data.email,
    }
  }

  try {
    await signIn('credentials', {
      redirect: false,
      redirectTo: callbackUrl,
      email: parsed.data.email,
      password: parsed.data.password,
      code: mfaCode,
    })
  } catch (error) {
    unstable_rethrow(error)
    const code = credentialsErrorCode(error)
    if (code === 'unknown') console.error('[auth] connexion impossible', error instanceof Error ? error.message : error)
    return {
      status: 'error',
      code,
      message: loginMessageFor(code, mfaCode.length > 0),
      email: parsed.data.email,
      mfaRequired: code === 'mfa_required',
    }
  }

  redirect(callbackUrl)
}

/** Démarre la connexion via le fournisseur d'identité OIDC (si configuré). */
export async function oidcSignInAction(formData: FormData): Promise<void> {
  const callbackUrl = safeCallbackUrl(field(formData, 'callbackUrl'), '/dashboard')
  if (!features.oidc()) redirect(`/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  await signIn('oidc', { redirectTo: callbackUrl })
}

/** Ferme la session courante (audit puis Auth.js signOut) et renvoie vers l'accueil de la plateforme. */
export async function logoutAction(): Promise<void> {
  const session = await auth()
  if (session?.user?.id) {
    await audit('auth.logout', { type: 'User', id: session.user.id }, { actorId: session.user.id, actorEmail: session.user.email ?? null })
  }
  await signOut({ redirectTo: '/' })
}
