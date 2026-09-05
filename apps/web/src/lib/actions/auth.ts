'use server'

import { headers } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { CredentialsSignin } from 'next-auth'
import { hashPassword } from '@fetrag/auth'
import { features } from '@fetrag/config'
import { emailSchema, loginSchema, registerSchema, z } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, emit, hashIp, makeReference, referencePrefixes, toDomainError } from '@fetrag/domain'
import { auth, signIn, signOut } from '@/lib/auth'
import { publicEnv } from '@/lib/env'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import {
  loginMessageFor,
  safeCallbackUrl,
  type ForgotPasswordState,
  type LoginErrorCode,
  type LoginState,
  type RegisterField,
  type RegisterState,
} from './auth-types'

const MINUTE = 60_000

/** Lit une valeur texte d'un FormData (chaîne vide si absente). */
function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Contexte réseau de la requête (IP hachée, agent utilisateur) pour l'audit et les consentements. */
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

// -----------------------------------------------------------------------------
// Connexion
// -----------------------------------------------------------------------------

/**
 * Server Action de connexion (email + mot de passe + code MFA optionnel).
 * Utilise `signIn('credentials', { redirect: false })` et traduit les codes d'erreur
 * `invalid_credentials`, `mfa_required` et `inactive` en état de formulaire.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const callbackUrl = safeCallbackUrl(field(formData, 'callbackUrl'), '/espace')
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
  const callbackUrl = safeCallbackUrl(field(formData, 'callbackUrl'), '/espace')
  if (!features.oidc()) redirect(`/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  await signIn('oidc', { redirectTo: callbackUrl })
}

// -----------------------------------------------------------------------------
// Inscription
// -----------------------------------------------------------------------------

/** Envoie l'email de bienvenue si le package de notifications est disponible (import protégé). */
async function sendWelcomeEmail(user: { email: string; firstName: string }): Promise<void> {
  try {
    const mod: Record<string, unknown> = await import('@fetrag/notifications')
    const sendEmail = mod.sendEmail
    if (typeof sendEmail !== 'function') return
    await (
      sendEmail as (input: {
        to: string
        subject: string
        template: string
        variables: Record<string, unknown>
      }) => Promise<unknown>
    )({
      to: user.email,
      subject: 'Bienvenue à la FETRAG',
      template: 'welcome',
      variables: {
        firstName: user.firstName,
        loginUrl: `${publicEnv.webUrl}/connexion`,
        lmsUrl: publicEnv.lmsUrl,
      },
    })
  } catch (error) {
    console.warn('[auth] email de bienvenue non envoyé', error instanceof Error ? error.message : error)
  }
}

/**
 * Server Action d'inscription locale : crée l'utilisateur (rôle LEARNER global), enregistre le consentement
 * aux conditions, journalise l'audit, envoie l'email de bienvenue puis ouvre la session.
 */
export async function registerAction(_previous: RegisterState, formData: FormData): Promise<RegisterState> {
  const values = {
    firstName: field(formData, 'firstName').trim(),
    lastName: field(formData, 'lastName').trim(),
    email: field(formData, 'email').trim(),
    phone: field(formData, 'phone').trim(),
    organizationName: field(formData, 'organizationName').trim(),
    newsletter: formData.get('newsletter') === 'on' || formData.get('newsletter') === 'true',
  }

  // Champ anti-robot : doit rester vide.
  if (field(formData, 'website').length > 0) {
    return { status: 'error', message: 'La demande n’a pas pu être traitée.', values }
  }

  if (!features.localAuth()) {
    return {
      status: 'error',
      message: 'La création de compte par mot de passe est désactivée : utilisez le compte FETRAG pour vous connecter.',
      values,
    }
  }

  const parsed = registerSchema.safeParse({
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    password: field(formData, 'password'),
    confirmPassword: field(formData, 'confirmPassword'),
    organizationName: values.organizationName || undefined,
    acceptTerms: formData.get('acceptTerms') === 'on' || formData.get('acceptTerms') === 'true' ? true : undefined,
    newsletter: values.newsletter,
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Certains champs sont incomplets ou invalides.',
      fieldErrors: firstErrors<RegisterField>(parsed.error.issues),
      values,
    }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`register:${ctx.ipHash ?? 'anonymous'}`, 5, 60 * MINUTE)
  if (!limit.allowed) {
    return {
      status: 'error',
      message: `Trop de créations de compte depuis cette connexion. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`,
      values,
    }
  }

  const data = parsed.data
  const existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })
  if (existing) {
    return {
      status: 'error',
      message: 'Un compte existe déjà avec cette adresse email. Connectez-vous ou réinitialisez votre mot de passe.',
      fieldErrors: { email: 'Adresse déjà utilisée' },
      values,
    }
  }

  let userId: string
  try {
    const passwordHash = await hashPassword(data.password)
    const consents: Prisma.ConsentCreateWithoutUserInput[] = [
      { kind: 'TERMS', granted: true, ipAddress: ctx.ipHash, userAgent: ctx.userAgent?.slice(0, 300) ?? null },
      { kind: 'PRIVACY', granted: true, ipAddress: ctx.ipHash, userAgent: ctx.userAgent?.slice(0, 300) ?? null },
    ]
    if (data.newsletter) {
      consents.push({ kind: 'NEWSLETTER', granted: true, ipAddress: ctx.ipHash, userAgent: ctx.userAgent?.slice(0, 300) ?? null })
    }
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone ? data.phone : null,
        employer: data.organizationName ?? null,
        passwordHash,
        roleAssignments: { create: { role: 'LEARNER', scopeType: 'GLOBAL' } },
        consents: { create: consents },
      },
      select: { id: true },
    })
    userId = user.id
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error('[auth] échec de création de compte', domainError.message)
    return {
      status: 'error',
      message:
        domainError.code === 'CONFLICT'
          ? 'Un compte existe déjà avec cette adresse email.'
          : 'La création du compte a échoué. Réessayez dans quelques instants.',
      values,
    }
  }

  if (data.newsletter) {
    try {
      await prisma.newsletterSubscription.upsert({
        where: { email: data.email },
        create: { email: data.email, userId, confirmedAt: new Date(), source: 'inscription' },
        update: { userId, unsubscribedAt: null, confirmedAt: new Date() },
      })
    } catch (error) {
      console.warn('[auth] abonnement newsletter non enregistré', error instanceof Error ? error.message : error)
    }
  }

  await audit(
    'user.registered',
    { type: 'User', id: userId },
    { actorId: userId, actorEmail: data.email, ip: ctx.ip, userAgent: ctx.userAgent },
    { after: { role: 'LEARNER', newsletter: data.newsletter } },
  )
  await emit('user.registered', { userId, email: data.email, firstName: data.firstName }, { actorId: userId })
  await sendWelcomeEmail({ email: data.email, firstName: data.firstName })

  let signedIn = false
  try {
    await signIn('credentials', { redirect: false, redirectTo: '/espace', email: data.email, password: data.password })
    signedIn = true
  } catch (error) {
    unstable_rethrow(error)
    console.warn('[auth] connexion automatique après inscription impossible', error instanceof Error ? error.message : error)
  }

  redirect(signedIn ? '/espace?bienvenue=1' : '/connexion?inscrit=1')
}

// -----------------------------------------------------------------------------
// Mot de passe oublié
// -----------------------------------------------------------------------------

const forgotPasswordSchema = z.object({ email: emailSchema, website: z.string().max(0).optional() })

/**
 * Enregistre une demande de réinitialisation auprès du support (FormSubmission SUPPORT, sujet « Réinitialisation »).
 * La réponse est neutre : elle ne révèle pas si l'adresse correspond à un compte.
 */
export async function forgotPasswordAction(_previous: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const neutralMessage =
    'Si un compte est associé à cette adresse, le support de la FETRAG vous contactera pour réinitialiser votre mot de passe.'
  const parsed = forgotPasswordSchema.safeParse({ email: field(formData, 'email'), website: field(formData, 'website') })
  if (!parsed.success) {
    const fieldErrors = firstErrors<'email' | 'website'>(parsed.error.issues)
    if (fieldErrors.website) return { status: 'done', message: neutralMessage }
    return { status: 'error', message: 'Saisissez une adresse email valide.', fieldErrors: { email: fieldErrors.email } }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`forgot:${parsed.data.email}`, 3, 60 * MINUTE)
  if (!limit.allowed) return { status: 'done', message: neutralMessage }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, name: true, firstName: true, lastName: true },
    })
    const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || parsed.data.email
    await prisma.formSubmission.create({
      data: {
        reference: makeReference(referencePrefixes.form),
        kind: 'SUPPORT',
        userId: user?.id ?? null,
        fullName,
        email: parsed.data.email,
        subject: 'Réinitialisation',
        message: `Demande de réinitialisation du mot de passe pour ${parsed.data.email}.`,
        payload: { source: 'web:mot-de-passe-oublie', accountFound: Boolean(user), userAgent: ctx.userAgent?.slice(0, 300) ?? null },
      },
    })
  } catch (error) {
    console.error('[auth] demande de réinitialisation non enregistrée', error instanceof Error ? error.message : error)
  }

  return { status: 'done', message: neutralMessage }
}

// -----------------------------------------------------------------------------
// Déconnexion
// -----------------------------------------------------------------------------

/** Ferme la session courante (audit puis Auth.js signOut) et renvoie vers l'accueil. */
export async function logoutAction(): Promise<void> {
  const session = await auth()
  if (session?.user?.id) {
    await audit('auth.logout', { type: 'User', id: session.user.id }, { actorId: session.user.id, actorEmail: session.user.email ?? null })
  }
  await signOut({ redirectTo: '/' })
}
