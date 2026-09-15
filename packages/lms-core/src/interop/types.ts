import type { QuestionTypeName } from '@fetrag/contracts'

/**
 * Forme canonique d'une question pour l'échange avec des plateformes externes (Moodle).
 * C'est un sur-ensemble sérialisable de `QuestionInput` : l'import produit ces objets
 * (validés ensuite par `questionInputSchema`), l'export les consomme depuis la banque de questions.
 */
export interface InteropOption {
  label: string
  isCorrect: boolean
  feedback?: string | null
  /** Rang attendu pour ORDERING (0 = premier). */
  position?: number
  /** Valeur de droite pour MATCHING. */
  matchValue?: string | null
}

export interface InteropQuestion {
  type: QuestionTypeName
  prompt: string
  explanation?: string | null
  category?: string | null
  points?: number
  tags?: string[]
  config?: Record<string, unknown>
  options?: InteropOption[]
}

export interface InteropWarning {
  /** Index de la question concernée dans le fichier (0 = première), ou null pour un avertissement global. */
  index: number | null
  message: string
}

export interface ImportResult {
  questions: InteropQuestion[]
  warnings: InteropWarning[]
}

export interface ExportResult {
  content: string
  /** Types non exportables dans ce format (ex. ORDERING en GIFT) : questions ignorées. */
  skipped: Array<{ type: QuestionTypeName; prompt: string; reason: string }>
}

export type InteropFormat = 'moodle-xml' | 'gift'

export const interopFormatLabels: Record<InteropFormat, string> = {
  'moodle-xml': 'Moodle XML',
  gift: 'GIFT',
}

export const interopFormatExtensions: Record<InteropFormat, string> = {
  'moodle-xml': 'xml',
  gift: 'txt',
}
