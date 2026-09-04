import { idSchema, type ActivityTypeName, type QuestionTypeName } from '@fetrag/contracts'
import { z } from 'zod'
import { asRecord } from './lib/json'

// -----------------------------------------------------------------------------
// Formats de Activity.content par type d'activité
// -----------------------------------------------------------------------------

const urlSchema = z.string().trim().url('URL invalide')

export const activityContentSchemas = {
  TEXT: z.object({ html: z.string().default('') }),
  VIDEO: z.object({
    url: urlSchema,
    provider: z.enum(['youtube', 'vimeo', 'file', 'other']).default('other'),
    transcript: z.string().max(200000).optional(),
    posterUrl: urlSchema.optional(),
  }),
  AUDIO: z.object({ url: urlSchema, transcript: z.string().max(200000).optional() }),
  LINK: z.object({ url: urlSchema, label: z.string().trim().max(200).optional() }),
  FILE: z
    .object({
      resourceId: idSchema.optional(),
      fileUrl: urlSchema.optional(),
      label: z.string().trim().max(200).optional(),
      mimeType: z.string().max(120).optional(),
      size: z.number().int().nonnegative().optional(),
    })
    .refine((v) => Boolean(v.resourceId || v.fileUrl), { message: 'Un fichier ou une ressource est requis' }),
  PRESENTATION: z.object({ url: urlSchema, embedUrl: urlSchema.optional() }),
  QUIZ: z.object({ intro: z.string().optional() }).passthrough(),
  ASSIGNMENT: z.object({ intro: z.string().optional() }).passthrough(),
  SURVEY: z.object({ intro: z.string().optional(), anonymous: z.boolean().default(true) }).passthrough(),
  FORUM: z.object({ intro: z.string().optional() }).passthrough(),
  LIVE_SESSION: z.object({ intro: z.string().optional() }).passthrough(),
  H5P: z.object({ embedUrl: urlSchema.optional(), packageUrl: urlSchema.optional(), height: z.number().int().positive().optional() }).passthrough(),
  SCORM: z.object({ packageUrl: urlSchema, launchPath: z.string().default('index.html'), version: z.string().optional() }).passthrough(),
} satisfies Record<ActivityTypeName, z.ZodTypeAny>

export type ActivityContentMap = { [K in ActivityTypeName]: z.infer<(typeof activityContentSchemas)[K]> }
export type ActivityContent = ActivityContentMap[ActivityTypeName]

/** Valide strictement le contenu d'une activité selon son type (à utiliser au bord : builder). */
export function parseActivityContent<T extends ActivityTypeName>(type: T, raw: unknown): ActivityContentMap[T] {
  return activityContentSchemas[type].parse(raw ?? {}) as ActivityContentMap[T]
}

/**
 * Lecture tolérante : renvoie le contenu validé ou, à défaut, un objet minimal
 * (les colonnes Json historiques ou incomplètes ne doivent pas casser l'affichage).
 */
export function readActivityContent<T extends ActivityTypeName>(type: T, raw: unknown): ActivityContentMap[T] | null {
  const result = activityContentSchemas[type].safeParse(raw ?? {})
  if (result.success) return result.data as ActivityContentMap[T]
  const record = asRecord(raw)
  if (type === 'TEXT') return { html: typeof record.html === 'string' ? record.html : '' } as ActivityContentMap[T]
  return null
}

// -----------------------------------------------------------------------------
// Formats de Question.config par type de question
// -----------------------------------------------------------------------------

export const questionConfigSchemas = {
  SINGLE_CHOICE: z.object({ shuffle: z.boolean().default(true) }),
  MULTIPLE_CHOICE: z.object({ shuffle: z.boolean().default(true), partialCredit: z.boolean().default(false) }),
  TRUE_FALSE: z.object({ answer: z.boolean().optional() }),
  /** `text` contient des marqueurs `___` ou `{{1}}` ; `answers[i]` = réponses acceptées du trou i. */
  FILL_BLANK: z.object({
    text: z.string().min(1),
    answers: z.array(z.array(z.string().min(1)).min(1)).min(1),
    partialCredit: z.boolean().default(false),
  }),
  /** Les options portent label (gauche) et matchValue (droite) ; `distractors` = valeurs de droite sans paire. */
  MATCHING: z.object({ distractors: z.array(z.string()).default([]), shuffle: z.boolean().default(true) }),
  /** Les options portent `position` = rang attendu (0 = premier). */
  ORDERING: z.object({ shuffle: z.boolean().default(true) }),
  SHORT_ANSWER: z.object({ accepted: z.array(z.string().min(1)).min(1), caseSensitive: z.boolean().default(false) }),
  ESSAY: z.object({
    minWords: z.number().int().nonnegative().optional(),
    maxWords: z.number().int().positive().optional(),
    rubric: z.array(z.object({ label: z.string(), points: z.number().int().nonnegative() })).optional(),
  }),
} satisfies Record<QuestionTypeName, z.ZodTypeAny>

export type QuestionConfigMap = { [K in QuestionTypeName]: z.infer<(typeof questionConfigSchemas)[K]> }
export type QuestionConfig = QuestionConfigMap[QuestionTypeName]

/** Validation stricte de la configuration d'une question (banque de questions). */
export function parseQuestionConfig<T extends QuestionTypeName>(type: T, raw: unknown): QuestionConfigMap[T] {
  return questionConfigSchemas[type].parse(raw ?? {}) as QuestionConfigMap[T]
}

/** Lecture tolérante : configuration validée ou valeurs par défaut sûres pour la correction. */
export function readQuestionConfig<T extends QuestionTypeName>(type: T, raw: unknown): QuestionConfigMap[T] | null {
  const result = questionConfigSchemas[type].safeParse(raw ?? {})
  if (result.success) return result.data as QuestionConfigMap[T]
  const fallback = questionConfigSchemas[type].safeParse({})
  return fallback.success ? (fallback.data as QuestionConfigMap[T]) : null
}

/** Nombre de trous attendus dans un texte FILL_BLANK (marqueurs `___` ou `{{n}}`). */
export function countBlanks(text: string): number {
  const underscore = text.match(/_{3,}/g)?.length ?? 0
  const braces = text.match(/\{\{\s*\d+\s*\}\}/g)?.length ?? 0
  return Math.max(underscore, braces)
}

// -----------------------------------------------------------------------------
// Alternative bas débit (LMS-20)
// -----------------------------------------------------------------------------

export const lowBandwidthSchema = z.object({
  kind: z.enum(['audio', 'transcript', 'document', 'low-res']),
  url: urlSchema.optional(),
  text: z.string().max(200000).optional(),
  label: z.string().max(200).optional(),
})
export type LowBandwidthAlternative = z.infer<typeof lowBandwidthSchema>
