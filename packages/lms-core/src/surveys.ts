import { answerResponseSchema, type AnswerResponse } from '@fetrag/contracts'
import { prisma, type QuestionType } from '@fetrag/db'
import { ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import { resolveActivityContext } from './internal/course-tree'
import { canTeachCohort } from './cohorts'
import { assertCan, can, requirePrincipal } from './lib/access'
import { percent } from './lib/text'
import type { Principal } from './types'

/**
 * Questionnaires de satisfaction et d'impact (LMS-16) : un quiz `isSurvey` dont les réponses
 * sont agrégées par question (anonymisées), par cours ou par cohorte.
 */

export interface OptionAggregate {
  optionId: string
  label: string
  count: number
  percent: number
}

export interface QuestionAggregate {
  questionId: string
  type: QuestionType
  prompt: string
  position: number
  respondents: number
  options: OptionAggregate[]
  /** Moyenne sur une échelle numérique (libellés numériques, ex. 1 à 5). */
  average: number | null
  trueCount: number
  falseCount: number
  /** Réponses libres (anonymes), limitées. */
  texts: string[]
}

export interface SurveyResults {
  activity: { id: string; title: string; courseId: string; courseTitle: string }
  quiz: { id: string; isSurvey: boolean }
  respondents: number
  invited: number | null
  responseRate: number | null
  questions: QuestionAggregate[]
}

const TEXT_LIMIT = 200

function parseResponse(raw: unknown): AnswerResponse | null {
  const parsed = answerResponseSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

function numericLabel(label: string): number | null {
  const match = label.trim().match(/^(\d+(?:[.,]\d+)?)/)
  if (!match?.[1]) return null
  const value = Number(match[1].replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

/** Agrège les réponses d'un questionnaire par question. */
export async function results(principal: Principal, activityId: string, filter: { cohortId?: string } = {}): Promise<SurveyResults> {
  const p = requirePrincipal(principal)
  const ctx = await resolveActivityContext(prisma, activityId)
  if (!can(p, 'reports.read') && !can(p, 'course.teach', { courseId: ctx.course.id, cohortId: filter.cohortId ?? null })) {
    throw new ForbiddenError('Accès aux résultats refusé')
  }
  const quiz = await prisma.quiz.findUnique({
    where: { activityId },
    include: { questions: { orderBy: { position: 'asc' }, include: { question: { include: { options: { orderBy: { position: 'asc' } } } } } } },
  })
  if (!quiz) throw new NotFoundError('Questionnaire', activityId)
  if (!quiz.isSurvey) throw new PreconditionError("Cette évaluation n'est pas un questionnaire")

  const attempts = await prisma.attempt.findMany({
    where: {
      quizId: quiz.id,
      status: { in: ['SUBMITTED', 'GRADED'] },
      ...(filter.cohortId ? { user: { cohortMembers: { some: { cohortId: filter.cohortId } } } } : {}),
    },
    orderBy: { submittedAt: 'desc' },
    select: { id: true, userId: true, answers: { select: { questionId: true, response: true } } },
  })
  // Une seule réponse par personne (la plus récente)
  const seen = new Set<string>()
  const unique = attempts.filter((a) => {
    if (seen.has(a.userId)) return false
    seen.add(a.userId)
    return true
  })

  const invited = filter.cohortId
    ? await prisma.cohortMember.count({ where: { cohortId: filter.cohortId, role: 'learner' } })
    : await prisma.enrollment.count({ where: { courseVersionId: ctx.version.id, status: { in: ['ACTIVE', 'COMPLETED'] } } })

  const questions: QuestionAggregate[] = quiz.questions.map((qq) => {
    const q = qq.question
    const counts = new Map<string, number>(q.options.map((o) => [o.id, 0] as const))
    let trueCount = 0
    let falseCount = 0
    let respondents = 0
    const texts: string[] = []
    let numericSum = 0
    let numericCount = 0

    for (const attempt of unique) {
      const answer = attempt.answers.find((a) => a.questionId === q.id)
      if (!answer) continue
      const response = parseResponse(answer.response)
      if (!response) continue
      respondents++
      switch (response.type) {
        case 'choice':
          for (const optionId of response.optionIds) {
            if (!counts.has(optionId)) continue
            counts.set(optionId, (counts.get(optionId) ?? 0) + 1)
            const option = q.options.find((o) => o.id === optionId)
            const numeric = option ? numericLabel(option.label) : null
            if (numeric !== null && q.type === 'SINGLE_CHOICE') {
              numericSum += numeric
              numericCount++
            }
          }
          break
        case 'boolean':
          if (response.value) trueCount++
          else falseCount++
          break
        case 'text':
          if (response.value.trim() && texts.length < TEXT_LIMIT) texts.push(response.value.trim().slice(0, 2000))
          break
        case 'blanks':
          for (const value of response.values) if (value.trim() && texts.length < TEXT_LIMIT) texts.push(value.trim().slice(0, 500))
          break
        case 'matching':
        case 'ordering':
        default:
          break
      }
    }
    return {
      questionId: q.id,
      type: q.type,
      prompt: q.prompt,
      position: qq.position,
      respondents,
      options: q.options.map((o) => ({ optionId: o.id, label: o.label, count: counts.get(o.id) ?? 0, percent: percent(counts.get(o.id) ?? 0, respondents) })),
      average: numericCount > 0 ? Math.round((numericSum / numericCount) * 100) / 100 : null,
      trueCount,
      falseCount,
      texts,
    }
  })

  return {
    activity: { id: ctx.activity.id, title: ctx.activity.title, courseId: ctx.course.id, courseTitle: ctx.course.title },
    quiz: { id: quiz.id, isSurvey: quiz.isSurvey },
    respondents: unique.length,
    invited: invited || null,
    responseRate: invited ? percent(unique.length, invited) : null,
    questions,
  }
}

/** Questionnaires d'un cours (toutes versions) avec nombre de répondants. */
export async function listForCourse(principal: Principal, courseId: string) {
  const p = requirePrincipal(principal)
  if (!can(p, 'reports.read') && !can(p, 'course.teach', { courseId })) throw new ForbiddenError('Accès aux questionnaires refusé')
  const quizzes = await prisma.quiz.findMany({
    where: { isSurvey: true, activity: { lesson: { module: { courseVersion: { courseId } } } } },
    include: {
      activity: { select: { id: true, title: true, lesson: { select: { module: { select: { courseVersion: { select: { id: true, version: true, isPublished: true } } } } } } } },
      _count: { select: { attempts: { where: { status: { in: ['SUBMITTED', 'GRADED'] } } }, questions: true } },
    },
  })
  return quizzes.map((q) => ({
    quizId: q.id,
    activityId: q.activity.id,
    title: q.activity.title,
    version: q.activity.lesson.module.courseVersion,
    questions: q._count.questions,
    responses: q._count.attempts,
  }))
}

/** Synthèse des questionnaires d'une cohorte (par module/session). */
export async function summaryForCohort(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true, courseId: true, courseVersionId: true, organizationId: true, trainerId: true, _count: { select: { members: { where: { role: 'learner' } } } } } })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  if (!canTeachCohort(p, cohort) && !can(p, 'reports.read') && !(cohort.organizationId && can(p, 'reports.org', { organizationId: cohort.organizationId }))) {
    throw new ForbiddenError('Accès aux questionnaires refusé')
  }
  const quizzes = await prisma.quiz.findMany({
    where: { isSurvey: true, activity: { lesson: { module: { courseVersionId: cohort.courseVersionId } } } },
    select: { id: true, activity: { select: { id: true, title: true } } },
  })
  const out = []
  for (const quiz of quizzes) {
    const attempts = await prisma.attempt.findMany({
      where: { quizId: quiz.id, status: { in: ['SUBMITTED', 'GRADED'] }, user: { cohortMembers: { some: { cohortId } } } },
      distinct: ['userId'],
      select: { id: true },
    })
    out.push({ quizId: quiz.id, activityId: quiz.activity.id, title: quiz.activity.title, responses: attempts.length, invited: cohort._count.members, responseRate: percent(attempts.length, cohort._count.members) })
  }
  return out
}

/** Vérifie qu'un principal peut consulter les résultats agrégés (helper pour l'API). */
export function assertSurveyReader(principal: Principal, courseId: string) {
  return can(principal, 'reports.read') ? principal : assertCan(principal, 'course.teach', { courseId })
}
