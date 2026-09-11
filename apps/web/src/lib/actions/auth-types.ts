/**
 * Types et helpers purs partagés entre les Server Actions d'authentification et les formulaires client.
 * Ce fichier ne porte pas la directive « use server » : il peut exporter des constantes et des types.
 */

export type LoginErrorCode =
  | 'invalid_credentials'
  | 'mfa_required'
  | 'inactive'
  | 'email_not_verified'
  | 'validation'
  | 'rate_limited'
  | 'unknown'

/** Codes renvoyés par Auth.js (CredentialsSignin.code) et traduits en état de formulaire. */
export const credentialsErrorCodes: readonly LoginErrorCode[] = ['invalid_credentials', 'mfa_required', 'inactive', 'email_not_verified']

export interface LoginState {
  status: 'idle' | 'error'
  code?: LoginErrorCode
  message?: string
  fieldErrors?: Partial<Record<'email' | 'password' | 'code', string>>
  /** Email saisi, renvoyé pour pré-remplir le formulaire. */
  email?: string
  /** Vrai lorsque le compte exige un code de vérification (MFA). */
  mfaRequired?: boolean
}

export const initialLoginState: LoginState = { status: 'idle' }

export type RegisterField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'organizationName'
  | 'acceptTerms'
  | 'newsletter'

export interface RegisterState {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: Partial<Record<RegisterField, string>>
  /** Valeurs non sensibles renvoyées pour pré-remplir le formulaire après une erreur. */
  values?: Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'organizationName', string>> & {
    newsletter?: boolean
  }
}

export const initialRegisterState: RegisterState = { status: 'idle' }

export interface ForgotPasswordState {
  status: 'idle' | 'done' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'email', string>>
}

export const initialForgotPasswordState: ForgotPasswordState = { status: 'idle' }

/** Renvoi du lien de confirmation d'adresse (réponse neutre : ne révèle jamais l'existence d'un compte). */
export interface ResendVerificationState {
  status: 'idle' | 'done' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'email', string>>
}

export const initialResendVerificationState: ResendVerificationState = { status: 'idle' }

/** Message neutre affiché après une demande de renvoi du lien de confirmation. */
export const resendVerificationNeutralMessage =
  'Si un compte en attente de confirmation est associé à cette adresse, un nouveau lien vient de lui être envoyé. Pensez à vérifier votre dossier de courrier indésirable.'

export type ResetPasswordErrorCode = 'validation' | 'invalid_token' | 'rate_limited' | 'inactive' | 'unknown'

export type ResetPasswordField = 'password' | 'confirmPassword'

export interface ResetPasswordState {
  status: 'idle' | 'error'
  code?: ResetPasswordErrorCode
  message?: string
  fieldErrors?: Partial<Record<ResetPasswordField, string>>
}

export const initialResetPasswordState: ResetPasswordState = { status: 'idle' }

/** Règles du mot de passe (miroir de `passwordSchema` de @fetrag/contracts) pour l'indicateur en direct. */
export const passwordRules: ReadonlyArray<{ id: string; label: string; test: (value: string) => boolean }> = [
  { id: 'length', label: 'Au moins 8 caractères', test: (value) => value.length >= 8 },
  { id: 'upper', label: 'Au moins une lettre majuscule', test: (value) => /[A-Z]/.test(value) },
  { id: 'digit', label: 'Au moins un chiffre', test: (value) => /[0-9]/.test(value) },
]

/**
 * N'accepte qu'un chemin relatif interne (protection contre les redirections ouvertes).
 * Tout autre format (URL absolue, « // », caractères de contrôle) retombe sur la valeur par défaut.
 */
export function safeCallbackUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const candidate = value.trim()
  if (candidate.length === 0 || candidate.length > 2000) return fallback
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback
  if (/[\r\n]/.test(candidate) || candidate.includes("\u0000")) return fallback
  return candidate
}

/** Message utilisateur associé à un code d'erreur de connexion. */
export function loginMessageFor(code: LoginErrorCode, hasMfaCode = false): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Adresse email ou mot de passe incorrect.'
    case 'mfa_required':
      return hasMfaCode
        ? 'Le code de vérification est invalide ou expiré. Réessayez avec un nouveau code.'
        : 'Ce compte est protégé par une vérification en deux étapes : saisissez le code de votre application d’authentification.'
    case 'inactive':
      return 'Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver.'
    case 'email_not_verified':
      return 'Confirmez d’abord votre adresse email : ouvrez le lien reçu lors de votre inscription. Vous ne le retrouvez pas ? Demandez un nouvel envoi ci-dessous.'
    case 'validation':
      return 'Vérifiez les informations saisies.'
    case 'rate_limited':
      return 'Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer.'
    default:
      return 'La connexion est momentanément indisponible. Réessayez dans quelques instants.'
  }
}

/**
 * Traduit les paramètres d'erreur ajoutés par Auth.js lors d'une redirection
 * (`/connexion?error=CredentialsSignin&code=invalid_credentials`, `?error=AccessDenied`...).
 */
export function authQueryErrorMessage(error?: string, code?: string): string | null {
  if (!error) return null
  switch (error) {
    case 'CredentialsSignin':
      if (credentialsErrorCodes.includes(code as LoginErrorCode)) return loginMessageFor(code as LoginErrorCode)
      return loginMessageFor('invalid_credentials')
    case 'AccessDenied':
      return 'L’accès a été refusé par le fournisseur d’identité.'
    case 'OAuthSignin':
    case 'OAuthCallbackError':
    case 'OAuthAccountNotLinked':
    case 'Callback':
      return 'La connexion via le fournisseur d’identité a échoué. Réessayez ou utilisez votre email et votre mot de passe.'
    case 'Configuration':
      return 'Le service d’authentification est mal configuré. Contactez l’administrateur.'
    case 'SessionRequired':
      return 'Connectez-vous pour accéder à cette page.'
    default:
      return 'Une erreur est survenue lors de la connexion.'
  }
}
