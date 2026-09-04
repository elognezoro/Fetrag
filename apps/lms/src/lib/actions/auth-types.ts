/**
 * Types et helpers purs partagés entre les Server Actions d'authentification et les formulaires client.
 * Ce fichier ne porte pas la directive « use server » : il peut exporter des constantes et des types.
 */

export type LoginErrorCode = 'invalid_credentials' | 'mfa_required' | 'inactive' | 'validation' | 'rate_limited' | 'unknown'

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

/**
 * N'accepte qu'un chemin relatif interne (protection contre les redirections ouvertes).
 * Tout autre format (URL absolue, « // », caractères de contrôle) retombe sur la valeur par défaut.
 */
export function safeCallbackUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const candidate = value.trim()
  if (candidate.length === 0 || candidate.length > 2000) return fallback
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback
  if (/[\r\n ]/.test(candidate)) return fallback
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
      if (code === 'invalid_credentials' || code === 'mfa_required' || code === 'inactive') return loginMessageFor(code)
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
