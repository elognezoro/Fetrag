'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { sanitizeHtml } from '@fetrag/cms'
import { idSchema, submitAttemptSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { quizzes } from '@fetrag/lms-core'
import type { z } from 'zod'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, type ActionResult } from './errors'

export type QuizSession = Awaited<ReturnType<typeof quizzes.start>>
export type QuizSubmission = Awaited<ReturnType<typeof quizzes.submit>>
export type QuizReview = Awaited<ReturnType<typeof quizzes.getAttemptReview>>
export type QuizCheck = Awaited<ReturnType<typeof quizzes.check>>

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

/** Vérifie immédiatement les réponses fournies (mode entraînement, correction affichée) sans soumettre la tentative. */
export async function checkQuizAction(input: z.input<typeof submitAttemptSchema>): Promise<ActionResult<QuizCheck>> {
  const principal = await guards.requireUser()
  try {
    const data = submitAttemptSchema.parse(input)
    const result = await quizzes.check(principal, data)
    return actionSuccess(result)
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
    // Les compositions viennent de l'éditeur riche : leur HTML est assaini à l'écriture
    // (les réponses courtes restent du texte brut, comparé tel quel par la correction).
    const essayQuestions = await prisma.question.findMany({
      where: { type: 'ESSAY', quizzes: { some: { quiz: { attempts: { some: { id: data.attemptId } } } } } },
      select: { id: true },
    })
    const essayIds = new Set(essayQuestions.map((q) => q.id))
    if (essayIds.size > 0) {
      data.answers = data.answers.map((answer) =>
        essayIds.has(answer.questionId) && answer.response.type === 'text'
          ? { ...answer, response: { ...answer.response, value: sanitizeHtml(answer.response.value) } }
          : answer,
      )
    }
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
