/**
 * État standard renvoyé par les Server Actions des espaces institutionnels.
 * Module sans directive « use server » : importable côté client (types, constantes, helpers purs).
 */

export type FieldErrors = Record<string, string>

export type ActionState =
  | { status: 'idle' }
  | {
      status: 'success'
      message?: string
      /** Identifiant de l'entité créée ou modifiée. */
      id?: string
      /** Redirection à effectuer côté client après succès. */
      redirectTo?: string
      /** Données complémentaires sérialisables (résumés d'opérations de masse, etc.). */
      payload?: Record<string, unknown>
    }
  | { status: 'error'; message: string; fieldErrors?: FieldErrors }

export const idleState: ActionState = { status: 'idle' }

export function successState(message?: string, extra: Omit<Extract<ActionState, { status: 'success' }>, 'status' | 'message'> = {}): ActionState {
  return { status: 'success', message, ...extra }
}

export function failureState(message: string, fieldErrors?: FieldErrors): ActionState {
  return { status: 'error', message, fieldErrors }
}

/** Lit l'erreur d'un champ dans un état d'action (utilitaire pour `FormField`). */
export function fieldError(state: ActionState, name: string): string | undefined {
  return state.status === 'error' ? state.fieldErrors?.[name] : undefined
}
