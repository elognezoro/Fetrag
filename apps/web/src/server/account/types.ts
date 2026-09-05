/**
 * Types et constantes partagés entre les Server Actions et les formulaires client.
 * Ce fichier ne porte ni « use server » ni « server-only » : il est importable partout.
 */

export interface ActionState<F extends string = string> {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Partial<Record<F, string>>
  /** Données de retour optionnelles (identifiant créé, URL, codes de secours...). */
  data?: Record<string, unknown>
}

export const idleState: ActionState = { status: 'idle' }

/** Signature d'une Server Action compatible `useActionState`. */
export type FormAction<F extends string = string> = (previous: ActionState<F>, formData: FormData) => Promise<ActionState<F>>
