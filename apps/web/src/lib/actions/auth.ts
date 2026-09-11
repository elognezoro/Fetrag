'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { CredentialsSignin } from 'next-auth'
import { consumeEmailToken, hashPassword } from '@fetrag/auth'
import { features } from '@fetrag/config'
import { emailSchema, loginSchema, passwordSchema, registerSchema, z } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, emit, toDomainError } from '@fetrag/domain'
import { auth, signIn, signOut } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { requestContext, sendPasswordChangedEmail, sendPasswordResetEmail, sendVerificationEmail } from './auth-support'
import {
  credentialsErrorCodes,
  loginMessageFor,
  resendVerificationNeutralMessage,
  safeCallbackUrl,
  type ForgotPasswordState,
  type LoginErrorCode,
  type LoginState,
  type RegisterField,
  type RegisterState,
  type ResendVerificationState,
  type ResetPasswordField,
  type ResetPasswordState,
} from './auth-types'

const MINUTE = 60_000

/** Lit une valeur texte d'un FormData (chaîne vide si absente). */
function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Extrait le code d'erreur Auth.js d'une exception de connexion. */
function credentialsErrorCode(error: unknown): LoginErrorCode {
  const known = (code: unknown): LoginErrorCode =>
    credentialsErrorCodes.includes(code as LoginErrorCode) ? (code as LoginErrorCode) : 'invalid_credentials'
  if (error instanceof CredentialsSignin) return known(error.code)
  if (error && typeof error === 'object') {
    const candidate = error as { type?: unknown; code?: unknown }
    if (candidate.type === 'CredentialsSignin') return known(candidate.code)
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
 * `invalid_credentials`, `mfa_required`, `inactive` et `email_not_verified` en état de formulaire.
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

/**
 * Server Action d'inscription locale : crée l'utilisateur (rôle LEARNER global, adresse non confirmée),
 * enregistre le consentement aux conditions, journalise l'audit puis envoie le lien de confirmation d'adresse.
 * Aucune session n'est ouverte : la connexion exige une adresse confirmée.
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
        // emailVerified reste null jusqu'à l'ouverture du lien de confirmation.
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
    { after: { role: 'LEARNER', newsletter: data.newsletter, emailVerified: false } },
  )
  await emit('user.registered', { userId, email: data.email, firstName: data.firstName }, { actorId: userId })
  await sendVerificationEmail({ email: data.email, firstName: data.firstName })

  redirect(`/inscription/confirmation?email=${encodeURIComponent(data.email)}`)
}

// -----------------------------------------------------------------------------
// Confirmation d'adresse email
// -----------------------------------------------------------------------------

const resendVerificationSchema = z.object({ email: emailSchema, website: z.string().max(0).optional() })

/**
 * Renvoie le lien de confirmation d'adresse (3 demandes par heure et par adresse).
 * Réponse neutre : le résultat ne révèle ni l'existence du compte ni son état de confirmation.
 */
export async function resendVerificationAction(
  _previous: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const parsed = resendVerificationSchema.safeParse({ email: field(formData, 'email'), website: field(formData, 'website') })
  if (!parsed.success) {
    const fieldErrors = firstErrors<'email' | 'website'>(parsed.error.issues)
    if (fieldErrors.website) return { status: 'done', message: resendVerificationNeutralMessage }
    return { status: 'error', message: 'Saisissez une adresse email valide.', fieldErrors: { email: fieldErrors.email } }
  }
  if (!features.localAuth()) return { status: 'done', message: resendVerificationNeutralMessage }

  const email = parsed.data.email
  const limit = checkRateLimit(`verify-resend:${email}`, 3, 60 * MINUTE)
  if (!limit.allowed) return { status: 'done', message: resendVerificationNeutralMessage }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerified: true, isActive: true, passwordHash: true },
    })
    if (user && user.isActive && user.passwordHash && !user.emailVerified) {
      await sendVerificationEmail({ email: user.email, firstName: user.firstName })
    }
  } catch (error) {
    console.error('[auth] renvoi du lien de confirmation impossible', error instanceof Error ? error.message : error)
  }

  return { status: 'done', message: resendVerificationNeutralMessage }
}

// -----------------------------------------------------------------------------
// Mot de passe oublié
// -----------------------------------------------------------------------------

const forgotPasswordSchema = z.object({ email: emailSchema, website: z.string().max(0).optional() })

/**
 * Envoie un lien de réinitialisation (valable 30 minutes) aux comptes existants et actifs.
 * La réponse est neutre : elle ne révèle pas si l'adresse correspond à un compte.
 */
export async function forgotPasswordAction(_previous: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const neutralMessage =
    'Si un compte est associé à cette adresse, un lien de réinitialisation vient de lui être envoyé. Il est valable 30 minutes : pensez à vérifier votre dossier de courrier indésirable.'
  const parsed = forgotPasswordSchema.safeParse({ email: field(formData, 'email'), website: field(formData, 'website') })
  if (!parsed.success) {
    const fieldErrors = firstErrors<'email' | 'website'>(parsed.error.issues)
    if (fieldErrors.website) return { status: 'done', message: neutralMessage }
    return { status: 'error', message: 'Saisissez une adresse email valide.', fieldErrors: { email: fieldErrors.email } }
  }
  if (!features.localAuth()) return { status: 'done', message: neutralMessage }

  const limit = checkRateLimit(`forgot:${parsed.data.email}`, 3, 60 * MINUTE)
  if (!limit.allowed) return { status: 'done', message: neutralMessage }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, firstName: true, isActive: true },
    })
    if (user && user.isActive) {
      await sendPasswordResetEmail({ id: user.id, email: user.email, firstName: user.firstName })
    }
  } catch (error) {
    console.error('[auth] envoi du lien de réinitialisation impossible', error instanceof Error ? error.message : error)
  }

  return { status: 'done', message: neutralMessage }
}

// -----------------------------------------------------------------------------
// Réinitialisation du mot de passe
// -----------------------------------------------------------------------------

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(16).max(200),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe ne correspondent pas' })

const invalidTokenMessage = 'Ce lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien pour choisir votre mot de passe.'

/**
 * Définit un nouveau mot de passe à partir du jeton reçu par email (usage unique, 30 minutes).
 * La possession de l'adresse est prouvée : l'adresse est confirmée si elle ne l'était pas. La MFA reste inchangée.
 */
export async function resetPasswordAction(_previous: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: field(formData, 'token'),
    password: field(formData, 'password'),
    confirmPassword: field(formData, 'confirmPassword'),
  })
  if (!parsed.success) {
    const fieldErrors = firstErrors<ResetPasswordField | 'token'>(parsed.error.issues)
    if (fieldErrors.token) return { status: 'error', code: 'invalid_token', message: invalidTokenMessage }
    return {
      status: 'error',
      code: 'validation',
      message: 'Vérifiez le mot de passe saisi.',
      fieldErrors: { password: fieldErrors.password, confirmPassword: fieldErrors.confirmPassword },
    }
  }
  if (!features.localAuth()) {
    return { status: 'error', code: 'unknown', message: 'La connexion par mot de passe est désactivée : utilisez le compte FETRAG.' }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`reset:${ctx.ipHash ?? 'anonymous'}`, 10, 15 * MINUTE)
  if (!limit.allowed) {
    return {
      status: 'error',
      code: 'rate_limited',
      message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`,
    }
  }

  try {
    // Le mot de passe est validé avant de consommer le jeton : une simple faute de frappe ne l'invalide pas.
    const email = await consumeEmailToken(parsed.data.token, 'reset-password')
    if (!email) return { status: 'error', code: 'invalid_token', message: invalidTokenMessage }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerified: true, isActive: true },
    })
    if (!user) return { status: 'error', code: 'invalid_token', message: invalidTokenMessage }
    if (!user.isActive) return { status: 'error', code: 'inactive', message: loginMessageFor('inactive') }

    const now = new Date()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.password),
        ...(user.emailVerified ? {} : { emailVerified: now }),
      },
    })
    await audit(
      'auth.password_changed',
      { type: 'User', id: user.id },
      { actorId: user.id, actorEmail: user.email, ip: ctx.ip, userAgent: ctx.userAgent },
      { after: { reason: 'reset', emailVerified: true } },
    )
    await sendPasswordChangedEmail({ id: user.id, email: user.email, firstName: user.firstName }, now)
  } catch (error) {
    unstable_rethrow(error)
    console.error('[auth] réinitialisation du mot de passe impossible', error instanceof Error ? error.message : error)
    return { status: 'error', code: 'unknown', message: 'La réinitialisation a échoué. Réessayez dans quelques instants.' }
  }

  redirect('/connexion?reinitialise=1')
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
