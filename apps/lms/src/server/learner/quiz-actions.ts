'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { idSchema, submitAttemptSchema } from '@fetrag/contracts'
import { quizzes } from '@fetrag/lms-core'
import type { z } from 'zod'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, type ActionResult } from './errors'

export type QuizSession = Awaited<ReturnType<typeof quizzes.start>>
export type QuizSubmission = Awaited<ReturnType<typeof quizzes.submit>>
export type QuizReview = Awaited<ReturnType<typeof quizzes.getAttemptReview>>

/** Démarre ou reprend une tentative : renvoie les questions sans les corrections. */
export async function startQuizAction(activityId: string): Promise<ActionResult<QuizSession>> {
  const principal = await guards.requireUser(`/evaluations/${activityId}`)
  try {
    const id = idSchema.parse(activityId)
    const session = await quizzes.start(principal, id)
    return actionSuccess(session)
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}

/** Soumet une tentative : correction automatique, progression, revue si autorisée. */
export async function submitQuizAction(input: z.input<typeof submitAttemptSchema> & { activityId: string }): Promise<ActionResult<QuizSubmission>> {
  const principal = await guards.requireUser()
  try {
    const data = submitAttemptSchema.parse({ attemptId: input.attemptId, answers: input.answers })
    const result = await quizzes.submit(principal, data)
    const activityId = idSchema.safeParse(input.activityId)
    if (activityId.success) revalidatePath(`/evaluations/${activityId.data}`)
    revalidatePath('/dashboard')
    return actionSuccess(result)
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}
