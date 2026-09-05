import { isDomainError } from '@fetrag/domain'
import { ZodError } from 'zod'

/**
 * Résultat uniforme des Server Actions de l'espace apprenant.
 * Ce fichier ne porte pas « use server » : il exporte des types et des fonctions pures.
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; fieldErrors?: Record<string, string> }

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

/** Première erreur Zod par champ (chemin de premier niveau). */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in out)) out[key] = issue.message
  }
  return out
}

/** Traduit une erreur (domaine, validation, inconnue) en résultat d'action sans fuiter de détails internes. */
export function actionFailure(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: 'Vérifiez les informations saisies.', code: 'VALIDATION_ERROR', fieldErrors: zodFieldErrors(error) }
  }
  if (isDomainError(error)) {
    return { ok: false, error: error.message, code: error.code }
  }
  if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'VALIDATION_ERROR' && 'message' in error) {
    // StorageValidationError (même forme que ValidationError du domaine)
    return { ok: false, error: String((error as { message: string }).message), code: 'VALIDATION_ERROR' }
  }
  console.error('[learner] action échouée', error instanceof Error ? error.message : error)
  return { ok: false, error: 'Une erreur est survenue. Réessayez dans quelques instants.', code: 'INTERNAL_ERROR' }
}
