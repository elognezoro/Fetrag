'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { progress } from '@fetrag/lms-core'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, type ActionResult } from './errors'
import { progressInputSchema, type ProgressInput } from './types'

export interface ProgressOutcome {
  completed: boolean
  completedAt: Date | null
  progressPercent: number
  status: string
  justCompletedCourse: boolean
  certificateId: string | null
  timeSpentSeconds: number
}

/**
 * Remontée de progression (temps passé, achèvement) : idempotente côté lms-core
 * (temps plafonné, achèvement non régressif). L'apprenant ne peut agir que sur sa propre inscription.
 */
export async function reportProgressAction(input: ProgressInput): Promise<ActionResult<ProgressOutcome>> {
  const principal = await guards.requireUser()
  try {
    const data = progressInputSchema.parse(input)
    const result = await progress.report(principal, data.enrollmentId, {
      activityId: data.activityId,
      timeSpentSeconds: data.timeSpentSeconds,
      completed: data.completed,
      progressData: data.progressData,
    })
    if (data.completed && data.courseId && data.lessonId) {
      revalidatePath(`/apprendre/${data.courseId}/${data.lessonId}`)
      revalidatePath('/dashboard')
      revalidatePath('/mes-formations')
    }
    return actionSuccess({
      completed: result.completion.completed,
      completedAt: result.completion.completedAt,
      progressPercent: result.progress.progressPercent,
      status: result.progress.status,
      justCompletedCourse: result.progress.justCompleted,
      certificateId: result.progress.certificateId,
      timeSpentSeconds: result.completion.timeSpentSeconds,
    })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}
