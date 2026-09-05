import 'server-only'
import { prisma } from '@fetrag/db'
import { isDomainError, type Principal } from '@fetrag/domain'
import { quizzes } from '@fetrag/lms-core'

/**
 * Lecture de l'entrée d'une évaluation (page /evaluations/[activityId]) sans démarrer de tentative :
 * métadonnées du quiz, tentatives passées, revue de la dernière tentative si la correction est autorisée.
 * Helper local prisma : lms-core n'expose la fiche du quiz qu'au démarrage d'une tentative.
 */

export type QuizAttemptRow = Awaited<ReturnType<typeof quizzes.listAttempts>>['attempts'][number]
export type QuizAttemptReview = Awaited<ReturnType<typeof quizzes.getAttemptReview>>

export interface QuizEntry {
  activity: {
    id: string
    title: string
    instructions: string | null
    type: 'QUIZ' | 'SURVEY'
    durationMinutes: number | null
    availableFrom: Date | null
    isAvailable: boolean
    lessonId: string
  }
  quiz: {
    id: string
    description: string | null
    timeLimitMinutes: number | null
    maxAttempts: number
    passScore: number
    isSurvey: boolean
    showCorrection: boolean
    questionCount: number
  }
  course: { id: string; slug: string; title: string }
  lesson: { id: string; title: string }
  attempts: QuizAttemptRow[]
  remainingAttempts: number
  bestPercent: number | null
  inProgressAttemptId: string | null
  enrolled: boolean
  lastReview: QuizAttemptReview | null
}

export async function getQuizEntry(principal: Principal, activityId: string): Promise<QuizEntry | null> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      type: true,
      title: true,
      instructions: true,
      durationMinutes: true,
      availableFrom: true,
      quiz: {
        select: { id: true, description: true, timeLimitMinutes: true, maxAttempts: true, passScore: true, isSurvey: true, showCorrection: true, _count: { select: { questions: true } } },
      },
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { courseVersionId: true, courseVersion: { select: { course: { select: { id: true, slug: true, title: true } } } } } },
        },
      },
    },
  })
  if (!activity || !activity.quiz || (activity.type !== 'QUIZ' && activity.type !== 'SURVEY')) return null

  const [enrollment, listing] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { userId: principal.id, courseVersionId: activity.lesson.module.courseVersionId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      select: { id: true },
    }),
    quizzes.listAttempts(principal, activityId).catch((error: unknown) => {
      if (isDomainError(error)) return null
      throw error
    }),
  ])
  if (!listing) return null

  const inProgress = listing.attempts.find((a) => a.status === 'IN_PROGRESS') ?? null
  const finished = [...listing.attempts].reverse().find((a) => a.status !== 'IN_PROGRESS') ?? null
  let lastReview: QuizAttemptReview | null = null
  if (finished && activity.quiz.showCorrection && !activity.quiz.isSurvey) {
    lastReview = await quizzes.getAttemptReview(principal, finished.id).catch(() => null)
  }

  return {
    activity: {
      id: activity.id,
      title: activity.title,
      instructions: activity.instructions,
      type: activity.type,
      durationMinutes: activity.durationMinutes,
      availableFrom: activity.availableFrom,
      isAvailable: !activity.availableFrom || activity.availableFrom.getTime() <= Date.now(),
      lessonId: activity.lesson.id,
    },
    quiz: {
      id: activity.quiz.id,
      description: activity.quiz.description,
      timeLimitMinutes: activity.quiz.timeLimitMinutes,
      maxAttempts: activity.quiz.maxAttempts,
      passScore: activity.quiz.passScore,
      isSurvey: activity.quiz.isSurvey,
      showCorrection: activity.quiz.showCorrection,
      questionCount: activity.quiz._count.questions,
    },
    course: activity.lesson.module.courseVersion.course,
    lesson: { id: activity.lesson.id, title: activity.lesson.title },
    attempts: listing.attempts,
    remainingAttempts: listing.remainingAttempts,
    bestPercent: listing.bestPercent,
    inProgressAttemptId: inProgress?.id ?? null,
    enrolled: Boolean(enrollment),
    lastReview,
  }
}
