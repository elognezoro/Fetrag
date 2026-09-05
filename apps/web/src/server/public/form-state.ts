/**
 * Types et helpers purs partagés entre les Server Actions publiques et les formulaires client.
 * Ce module ne porte pas la directive « use server » : il peut exporter des constantes et des types.
 */
import type { z } from '@fetrag/contracts'

export type FormStatus = 'idle' | 'success' | 'error'

export interface PublicFormState<F extends string = string> {
  status: FormStatus
  /** Message global (succès ou erreur). */
  message?: string
  /** Référence de suivi renvoyée après un dépôt réussi (MSG-…, SRV-…). */
  reference?: string
  /** Première erreur par champ. */
  fieldErrors?: Partial<Record<F, string>>
  /** Valeurs non sensibles renvoyées pour pré-remplir le formulaire après une erreur. */
  values?: Record<string, string>
}

export const initialFormState: PublicFormState = { status: 'idle' }

/** Lit une valeur texte d'un FormData (chaîne vide si absente). */
export function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Lit une case à cocher (Radix envoie « on », un input natif peut envoyer « true »). */
export function checked(formData: FormData, name: string): boolean {
  const value = formData.get(name)
  return value === 'on' || value === 'true' || value === '1'
}

/** Première erreur Zod par champ (clé = premier segment du chemin). */
export function firstErrors<F extends string>(issues: z.ZodIssue[]): Partial<Record<F, string>> {
  const out: Partial<Record<F, string>> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in out)) out[key as F] = issue.message
  }
  return out
}

/** Conserve uniquement les champs texte listés pour re-remplir le formulaire. */
export function pickValues(formData: FormData, names: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {}
  for (const name of names) values[name] = field(formData, name).trim()
  return values
}
