import { idSchema, progressReportSchema } from '@fetrag/contracts'
import type { z } from 'zod'

/**
 * Types, schémas et états initiaux partagés entre les Server Actions (fichiers « use server »,
 * qui ne peuvent exporter que des fonctions asynchrones) et les composants client.
 */

export const progressInputSchema = progressReportSchema.extend({
  enrollmentId: idSchema,
  courseId: idSchema.optional(),
  lessonId: idSchema.optional(),
})
export type ProgressInput = z.input<typeof progressInputSchema>

export interface SubmissionFormState {
  status: 'idle' | 'saved' | 'submitted' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
  /** Texte renvoyé pour conserver la saisie après une erreur. */
  text?: string
}

export const initialSubmissionState: SubmissionFormState = { status: 'idle' }

export interface ForumFormState {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: { title?: string; content?: string }
}

export const initialForumFormState: ForumFormState = { status: 'idle' }

/** Élément de la file locale de progression (rejouée au retour en ligne). */
export interface QueuedProgress {
  enrollmentId: string
  activityId: string
  courseId: string
  lessonId: string
  timeSpentSeconds: number
  completed?: boolean
  queuedAt: number
}
