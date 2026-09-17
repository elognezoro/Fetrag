import { idSchema, submitAttemptSchema, type AnswerResponse, answerResponseSchema } from '@fetrag/contracts'
import { prisma, type Prisma, type QuestionType } from '@fetrag/db'
import { audit, emit, ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import { z } from 'zod'
import { computeAttemptTotals, gradeAnswer, type GradableOption, type GradableQuestion, type GradeResult } from './grading'
import { completeActivityForEnrollment, recomputeProgress } from './internal/completion'
import { findLearnerEnrollment, resolveActivityContext, type ActivityContext } from './internal/course-tree'
import { assertCan, auditContext, can, requirePrincipal } from './lib/access'
import { safeNotifyUser } from './lib/integrations'
import { asRecord, toJsonValue } from './lib/json'
import { getSetting, settingKeys } from './lib/settings'
import { readQuestionConfig } from './schemas'
import { shuffle } from './lib/text'
import type { Principal, RequestMeta } from './types'

export type SubmitAttemptInput = z.input<typeof submitAttemptSchema>

export const gradeEssaySchema = z.object({
  attemptId: idSchema,
  questionId: idSchema,
  score: z.number().int().min(0),
  feedback: z.string().trim().max(5000).optional(),
})
export type GradeEssayInput = z.input<typeof gradeEssaySchema>

/** Délai de tolérance (secondes) au-delà de la limite de temps d'un quiz. */
const TIME_LIMIT_GRACE_SECONDS = 60

// -----------------------------------------------------------------------------
// Présentation d'un quiz à l'apprenant (sans les réponses)
// -----------------------------------------------------------------------------

export interface PresentedOption {
  id: string
  label: string
  position: number
}

export interface PresentedQuestion {
  id: string
  type: QuestionType
  prompt: string
  points: number
  position: number
  options: PresentedOption[]
  /** MATCHING : valeurs de droite à associer (mélangées, distracteurs inclus). */
  matchValues?: string[]
  /** FILL_BLANK : texte à trous et nombre de trous. */
  blankText?: string
  blankCount?: number
  /** ESSAY : contraintes de longueur. */
  minWords?: number
  maxWords?: number
}

function presentQuestion(
  quizQuestion: { position: number; points: number | null; question: { id: string; type: QuestionType; prompt: string; points: number; config: unknown; options: Array<{ id: string; label: string; position: number; matchValue: string | null }> } },
  shuffleOptions: boolean,
): PresentedQuestion {
  const q = quizQuestion.question
  const base: PresentedQuestion = {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    points: quizQuestion.points ?? q.points,
    position: quizQuestion.position,
    options: [],
  }
  const options = [...q.options].sort((a, b) => a.position - b.position).map((o) => ({ id: o.id, label: o.label, position: o.position }))
  switch (q.type) {
    case 'SINGLE_CHOICE':
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      base.options = shuffleOptions && q.type !== 'TRUE_FALSE' ? shuffle(options) : options
      break
    case 'ORDERING':
      base.options = shuffle(options).map((o, i) => ({ ...o, position: i }))
      break
    case 'MATCHING': {
      const config = readQuestionConfig('MATCHING', q.config)
      const values = q.options.map((o) => o.matchValue).filter((v): v is string => Boolean(v))
      base.options = options
      base.matchValues = shuffle([...new Set([...values, ...(config?.distractors ?? [])])])
      break
    }
    case 'FILL_BLANK': {
      const config = readQuestionConfig('FILL_BLANK', q.config)
      base.blankText = config?.text ?? q.prompt
      base.blankCount = config?.answers.length ?? 0
      break
    }
    case 'ESSAY': {
      const config = readQuestionConfig('ESSAY', q.config)
      base.minWords = config?.minWords
      base.maxWords = config?.maxWords
      break
    }
    default:
      break
  }
  return base
}

const quizWithQuestions = {
  questions: { orderBy: { position: 'asc' as const }, include: { question: { include: { options: { orderBy: { position: 'asc' as const } } } } } },
} satisfies Prisma.QuizInclude

async function loadQuizContext(activityId: string): Promise<{ ctx: ActivityContext; quiz: Prisma.QuizGetPayload<{ include: typeof quizWithQuestions }> }> {
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.activity.type !== 'QUIZ' && ctx.activity.type !== 'SURVEY') throw new PreconditionError("Cette activité n'est pas une évaluation")
  const quiz = await prisma.quiz.findUnique({ where: { activityId }, include: quizWithQuestions })
  if (!quiz) throw new NotFoundError('Quiz', activityId)
  return { ctx, quiz }
}

/**
 * Démarre (ou reprend) une tentative : vérifie l'inscription, la disponibilité et le nombre de tentatives.
 * Renvoie la tentative et les questions sans les corrections.
 */
export async function start(principal: Principal, activityId: string) {
  const p = requirePrincipal(principal)
  const { ctx, quiz } = await loadQuizContext(activityId)
  const enrollment = await findLearnerEnrollment(prisma, p.id, ctx.version.id)
  const staff = can(p, 'course.teach', { courseId: ctx.course.id })
  if (!enrollment && !staff) throw new ForbiddenError("Vous n'êtes pas inscrit à ce cours")
  if (enrollment && enrollment.status !== 'ACTIVE' && !staff) throw new PreconditionError("L'inscription n'est plus active")
  const now = Date.now()
  if (ctx.activity.availableFrom && ctx.activity.availableFrom.getTime() > now) throw new PreconditionError("Cette évaluation n'est pas encore disponible")
  if (quiz.questions.length === 0) throw new PreconditionError('Cette évaluation ne contient aucune question')

  const existing = await prisma.attempt.findFirst({ where: { quizId: quiz.id, userId: p.id, status: 'IN_PROGRESS' }, orderBy: { startedAt: 'desc' } })
  let attempt = existing
  if (!attempt) {
    const finished = await prisma.attempt.count({ where: { quizId: quiz.id, userId: p.id, status: { in: ['SUBMITTED', 'GRADED'] } } })
    if (!staff && finished >= quiz.maxAttempts) {
      throw new PreconditionError(`Nombre maximal de tentatives atteint (${quiz.maxAttempts})`, { maxAttempts: quiz.maxAttempts })
    }
    attempt = await prisma.attempt.create({
      data: { quizId: quiz.id, userId: p.id, enrollmentId: enrollment?.id ?? null, number: finished + 1, status: 'IN_PROGRESS' },
    })
  }

  const ordered = quiz.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions
  const questions = ordered.map((qq) => presentQuestion(qq, quiz.shuffleOptions))
  const deadline = quiz.timeLimitMinutes ? new Date(attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60 * 1000) : null
  return {
    attempt: { id: attempt.id, number: attempt.number, startedAt: attempt.startedAt, deadline, status: attempt.status },
    quiz: {
      id: quiz.id,
      activityId,
      title: ctx.activity.title,
      description: quiz.description,
      instructions: ctx.activity.instructions,
      timeLimitMinutes: quiz.timeLimitMinutes,
      maxAttempts: quiz.maxAttempts,
      passScore: quiz.passScore,
      isSurvey: quiz.isSurvey,
      showCorrection: quiz.showCorrection,
      questionCount: quiz.questions.length,
      maxScore: quiz.questions.reduce((s, qq) => s + (qq.points ?? qq.question.points), 0),
    },
    questions,
    enrollmentId: enrollment?.id ?? null,
    course: ctx.course,
    lesson: ctx.lesson,
  }
}

function toGradable(question: { id: string; type: QuestionType; points: number; explanation: string | null; config: unknown }): GradableQuestion {
  return { id: question.id, type: question.type, points: question.points, explanation: question.explanation, config: question.config }
}

function toGradableOptions(options: Array<{ id: string; label: string; isCorrect: boolean; feedback: string | null; position: number; matchValue: string | null }>): GradableOption[] {
  return options.map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect, feedback: o.feedback, position: o.position, matchValue: o.matchValue }))
}

/**
 * Vérification immédiate (mode entraînement) : corrige les réponses fournies d'une tentative
 * en cours SANS la soumettre ni rien enregistrer. Réservée aux évaluations d'entraînement :
 * correction affichée (`showCorrection`), hors questionnaire ET plusieurs tentatives autorisées.
 * Une évaluation à correction masquée ou à tentative unique (examen final, contrôle noté sec)
 * reste inaccessible à cette vérification, y compris côté serveur : sans ce dernier critère,
 * la vérification servirait d'oracle pour composer une tentative unique parfaite avant remise.
 * Le retour (verdict + feedback avec explication) est le même niveau d'information que la
 * revue déjà affichée après chaque tentative de ces quiz — fidèle au « Vérifier » du support source.
 */
export async function check(principal: Principal, input: SubmitAttemptInput) {
  const p = requirePrincipal(principal)
  const data = submitAttemptSchema.parse(input)
  const attempt = await prisma.attempt.findUnique({ where: { id: data.attemptId }, include: { quiz: { include: quizWithQuestions } } })
  if (!attempt) throw new NotFoundError('Tentative', data.attemptId)
  if (attempt.userId !== p.id) throw new ForbiddenError("Cette tentative n'est pas la vôtre")
  if (attempt.status !== 'IN_PROGRESS') throw new PreconditionError('Cette tentative a déjà été soumise')
  const quiz = attempt.quiz
  if (quiz.isSurvey || !quiz.showCorrection || quiz.maxAttempts <= 1) {
    throw new PreconditionError("La vérification immédiate n'est pas disponible pour cette évaluation")
  }
  const elapsed = Math.max(0, Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000))
  if (quiz.timeLimitMinutes && elapsed > quiz.timeLimitMinutes * 60 + TIME_LIMIT_GRACE_SECONDS) {
    throw new PreconditionError('Le temps imparti est dépassé', { timeLimitMinutes: quiz.timeLimitMinutes, elapsedSeconds: elapsed })
  }
  const partialCredit = await getSetting(settingKeys.quizPartialCredit, z.boolean(), false)
  const byId = new Map(quiz.questions.map((qq) => [qq.questionId, qq]))
  // Une seule vérification par question et par appel (dernière réponse fournie), comme submit().
  const responses = new Map<string, AnswerResponse>()
  for (const answer of data.answers) responses.set(answer.questionId, answer.response)
  return [...responses.entries()].flatMap(([questionId, response]) => {
    const qq = byId.get(questionId)
    if (!qq) return []
    const result = gradeAnswer(toGradable(qq.question), toGradableOptions(qq.question.options), response, { partialCredit, points: qq.points })
    return [{ questionId, isCorrect: result.isCorrect, feedback: result.feedback, needsManualGrading: result.needsManualGrading }]
  })
}

/**
 * Soumet une tentative : correction automatique de tous les types sauf ESSAY,
 * calcul score / maxScore / percent / passed, enregistrement des réponses,
 * mise à jour de l'achèvement (PASS_SCORE / SUBMIT) et de la progression.
 */
export async function submit(principal: Principal, input: SubmitAttemptInput) {
  const p = requirePrincipal(principal)
  const data = submitAttemptSchema.parse(input)
  const attempt = await prisma.attempt.findUnique({
    where: { id: data.attemptId },
    include: { quiz: { include: quizWithQuestions } },
  })
  if (!attempt) throw new NotFoundError('Tentative', data.attemptId)
  if (attempt.userId !== p.id) throw new ForbiddenError("Cette tentative n'est pas la vôtre")
  if (attempt.status !== 'IN_PROGRESS') throw new PreconditionError('Cette tentative a déjà été soumise')
  const quiz = attempt.quiz
  const ctx = await resolveActivityContext(prisma, quiz.activityId)

  const now = new Date()
  const elapsed = Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000))
  if (quiz.timeLimitMinutes && elapsed > quiz.timeLimitMinutes * 60 + TIME_LIMIT_GRACE_SECONDS) {
    throw new PreconditionError('Le temps imparti est dépassé', { timeLimitMinutes: quiz.timeLimitMinutes, elapsedSeconds: elapsed })
  }

  const partialCredit = await getSetting(settingKeys.quizPartialCredit, z.boolean(), false)
  const responses = new Map<string, AnswerResponse>()
  for (const answer of data.answers) responses.set(answer.questionId, answer.response)

  const results: Array<{ questionId: string; response: AnswerResponse | null; result: GradeResult }> = []
  for (const qq of quiz.questions) {
    const response = responses.get(qq.questionId) ?? null
    const result = quiz.isSurvey
      ? { isCorrect: null, score: null, maxScore: 0, feedback: null, needsManualGrading: false }
      : gradeAnswer(toGradable(qq.question), toGradableOptions(qq.question.options), response, { partialCredit, points: qq.points })
    results.push({ questionId: qq.questionId, response, result })
  }

  const totals = computeAttemptTotals(results.map((r) => r.result), quiz.passScore)
  const hasPending = totals.pending > 0
  const status = hasPending ? 'SUBMITTED' : 'GRADED'
  const scoreValue = quiz.isSurvey ? null : hasPending ? null : totals.score
  const percentValue = quiz.isSurvey ? null : hasPending ? null : totals.percent
  const passedValue = quiz.isSurvey ? null : hasPending ? null : totals.passed

  await prisma.$transaction(async (tx) => {
    for (const row of results) {
      await tx.answer.upsert({
        where: { attemptId_questionId: { attemptId: attempt.id, questionId: row.questionId } },
        create: {
          attemptId: attempt.id,
          questionId: row.questionId,
          response: toJsonValue(row.response ?? { type: 'text', value: '' }),
          isCorrect: row.result.isCorrect,
          score: row.result.score,
          feedback: row.result.feedback,
        },
        update: {
          response: toJsonValue(row.response ?? { type: 'text', value: '' }),
          isCorrect: row.result.isCorrect,
          score: row.result.score,
          feedback: row.result.feedback,
        },
      })
    }
    await tx.attempt.update({
      where: { id: attempt.id },
      data: {
        status,
        score: scoreValue,
        maxScore: quiz.isSurvey ? null : totals.maxScore,
        percent: percentValue,
        passed: passedValue,
        submittedAt: now,
        gradedAt: status === 'GRADED' ? now : null,
        timeSpentSeconds: elapsed,
      },
    })
  })

  let progress = null
  if (attempt.enrollmentId) {
    const rule = ctx.activity.completionRule
    const completed = quiz.isSurvey || rule === 'SUBMIT' ? true : rule === 'PASS_SCORE' ? passedValue === true : undefined
    progress = await completeActivityForEnrollment(
      attempt.enrollmentId,
      { id: ctx.activity.id, durationMinutes: ctx.activity.durationMinutes },
      { completed, score: quiz.isSurvey ? undefined : percentValue, timeSpentDelta: elapsed, progressData: { lastAttemptId: attempt.id, attempts: attempt.number } },
      { actorId: p.id },
    )
  }

  if (!quiz.isSurvey && status === 'GRADED') {
    await emit(
      'quiz.graded',
      { attemptId: attempt.id, quizId: quiz.id, activityId: ctx.activity.id, userId: p.id, enrollmentId: attempt.enrollmentId, percent: totals.percent, passed: totals.passed },
      { actorId: p.id },
    )
  }
  if (hasPending) {
    await notifyGraders(ctx, attempt.enrollmentId, `Une composition attend votre correction : « ${ctx.activity.title} ».`)
  }

  return {
    attemptId: attempt.id,
    status,
    score: scoreValue,
    maxScore: quiz.isSurvey ? null : totals.maxScore,
    percent: percentValue,
    passed: passedValue,
    passScore: quiz.passScore,
    pendingManualGrading: totals.pending,
    isSurvey: quiz.isSurvey,
    showCorrection: quiz.showCorrection,
    progress,
    review: quiz.showCorrection && !quiz.isSurvey ? await getAttemptReview(principal, attempt.id) : null,
  }
}

/** Notifie le formateur de la cohorte (ou les formateurs du cours) d'une correction à faire. */
async function notifyGraders(ctx: ActivityContext, enrollmentId: string | null, body: string): Promise<void> {
  const recipients = new Set<string>()
  if (enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { cohort: { select: { id: true, trainerId: true } } } })
    if (enrollment?.cohort?.trainerId) recipients.add(enrollment.cohort.trainerId)
  }
  if (recipients.size === 0) {
    const trainers = await prisma.courseTrainer.findMany({ where: { courseId: ctx.course.id }, select: { userId: true } })
    for (const t of trainers) recipients.add(t.userId)
  }
  for (const userId of recipients) {
    await safeNotifyUser(userId, { title: 'Correction en attente', body, href: '/formateur', category: 'assignments' })
  }
}

/**
 * Note manuelle d'une composition (ESSAY). Quand toutes les compositions de la tentative sont
 * notées, la tentative passe GRADED, le score global est recalculé et la progression mise à jour.
 */
export async function gradeEssay(principal: Principal, input: GradeEssayInput, meta: RequestMeta = {}) {
  const data = gradeEssaySchema.parse(input)
  const attempt = await prisma.attempt.findUnique({
    where: { id: data.attemptId },
    include: { quiz: { include: quizWithQuestions }, answers: true, user: { select: { id: true } } },
  })
  if (!attempt) throw new NotFoundError('Tentative', data.attemptId)
  const ctx = await resolveActivityContext(prisma, attempt.quiz.activityId)
  const enrollment = attempt.enrollmentId ? await prisma.enrollment.findUnique({ where: { id: attempt.enrollmentId }, select: { cohortId: true } }) : null
  const p = assertCan(principal, 'grade.write', { courseId: ctx.course.id, cohortId: enrollment?.cohortId ?? null })

  const quizQuestion = attempt.quiz.questions.find((qq) => qq.questionId === data.questionId)
  if (!quizQuestion) throw new NotFoundError('Question', data.questionId)
  if (quizQuestion.question.type !== 'ESSAY') throw new PreconditionError('Seules les compositions se notent manuellement')
  const maxScore = quizQuestion.points ?? quizQuestion.question.points
  if (data.score > maxScore) throw new PreconditionError(`La note ne peut pas dépasser ${maxScore}`, { maxScore })

  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: data.questionId } },
    create: { attemptId: attempt.id, questionId: data.questionId, response: toJsonValue({ type: 'text', value: '' }), score: data.score, isCorrect: data.score >= maxScore / 2, feedback: data.feedback ?? null },
    update: { score: data.score, isCorrect: data.score >= maxScore / 2, feedback: data.feedback ?? null },
  })

  const answers = await prisma.answer.findMany({ where: { attemptId: attempt.id } })
  const pending = attempt.quiz.questions.filter((qq) => qq.question.type === 'ESSAY').filter((qq) => answers.find((a) => a.questionId === qq.questionId)?.score === null || !answers.some((a) => a.questionId === qq.questionId))
  let finalized = false
  if (pending.length === 0) {
    const results: GradeResult[] = attempt.quiz.questions.map((qq) => {
      const answer = answers.find((a) => a.questionId === qq.questionId)
      return { isCorrect: answer?.isCorrect ?? false, score: answer?.score ?? 0, maxScore: qq.points ?? qq.question.points, feedback: answer?.feedback ?? null, needsManualGrading: false }
    })
    const totals = computeAttemptTotals(results, attempt.quiz.passScore)
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: 'GRADED', score: totals.score, maxScore: totals.maxScore, percent: totals.percent, passed: totals.passed, gradedAt: new Date() },
    })
    finalized = true
    if (attempt.enrollmentId) {
      const rule = ctx.activity.completionRule
      const completed = rule === 'SUBMIT' ? true : rule === 'PASS_SCORE' ? totals.passed : undefined
      await completeActivityForEnrollment(attempt.enrollmentId, { id: ctx.activity.id, durationMinutes: ctx.activity.durationMinutes }, { completed, score: totals.percent }, { actorId: p.id })
    }
    await emit('quiz.graded', { attemptId: attempt.id, quizId: attempt.quizId, activityId: ctx.activity.id, userId: attempt.userId, enrollmentId: attempt.enrollmentId, percent: totals.percent, passed: totals.passed }, { actorId: p.id })
    await safeNotifyUser(attempt.userId, {
      title: 'Résultat disponible',
      body: `Votre évaluation « ${ctx.activity.title} » a été corrigée : ${totals.percent} %.`,
      href: `/evaluations/${ctx.activity.id}`,
      category: 'results',
      email: true,
    })
  }
  await audit('grade.recorded', { type: 'Answer', id: `${attempt.id}:${data.questionId}` }, auditContext(p, meta), {
    after: { attemptId: attempt.id, questionId: data.questionId, score: data.score, maxScore, finalized },
  })
  return { attemptId: attempt.id, questionId: data.questionId, score: data.score, maxScore, finalized, remainingEssays: pending.length }
}

/** Tentatives d'un utilisateur sur une évaluation (les siennes, ou celles d'un tiers pour un formateur). */
export async function listAttempts(principal: Principal, activityId: string, options: { userId?: string } = {}) {
  const p = requirePrincipal(principal)
  const { ctx, quiz } = await loadQuizContext(activityId)
  const target = options.userId ?? p.id
  if (target !== p.id) assertCan(p, 'course.teach', { courseId: ctx.course.id })
  const attempts = await prisma.attempt.findMany({
    where: { quizId: quiz.id, userId: target },
    orderBy: { number: 'asc' },
    select: { id: true, number: true, status: true, score: true, maxScore: true, percent: true, passed: true, startedAt: true, submittedAt: true, gradedAt: true, timeSpentSeconds: true },
  })
  const finished = attempts.filter((a) => a.status !== 'IN_PROGRESS').length
  return {
    attempts,
    quiz: { id: quiz.id, maxAttempts: quiz.maxAttempts, passScore: quiz.passScore, isSurvey: quiz.isSurvey, showCorrection: quiz.showCorrection, title: ctx.activity.title },
    remainingAttempts: Math.max(0, quiz.maxAttempts - finished),
    bestPercent: attempts.reduce<number | null>((best, a) => (a.percent !== null && (best === null || a.percent > best) ? a.percent : best), null),
  }
}

/** Toutes les tentatives d'une évaluation (formateur / coordination), avec l'apprenant. */
export async function listAttemptsForTrainer(principal: Principal, activityId: string, options: { cohortId?: string; status?: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' } = {}) {
  const { ctx, quiz } = await loadQuizContext(activityId)
  assertCan(principal, 'course.teach', { courseId: ctx.course.id, cohortId: options.cohortId ?? null })
  return prisma.attempt.findMany({
    where: {
      quizId: quiz.id,
      ...(options.status ? { status: options.status } : {}),
      ...(options.cohortId ? { user: { cohortMembers: { some: { cohortId: options.cohortId } } } } : {}),
    },
    orderBy: [{ submittedAt: 'desc' }],
    include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } },
  })
}

/**
 * Revue d'une tentative : réponses données, correction (si autorisée) et feedback.
 * Accessible au titulaire (si showCorrection) et aux formateurs du cours.
 */
export async function getAttemptReview(principal: Principal, attemptId: string) {
  const p = requirePrincipal(principal)
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: quizWithQuestions }, answers: true, user: { select: { id: true, name: true, firstName: true, lastName: true } } },
  })
  if (!attempt) throw new NotFoundError('Tentative', attemptId)
  const ctx = await resolveActivityContext(prisma, attempt.quiz.activityId)
  const staff = can(p, 'course.teach', { courseId: ctx.course.id })
  if (attempt.userId !== p.id && !staff) throw new ForbiddenError("Cette tentative n'est pas la vôtre")
  if (attempt.status === 'IN_PROGRESS') throw new PreconditionError("La tentative n'est pas encore soumise")
  const revealCorrection = staff || attempt.quiz.showCorrection

  const questions = attempt.quiz.questions.map((qq) => {
    const answer = attempt.answers.find((a) => a.questionId === qq.questionId)
    const parsed = answer ? answerResponseSchema.safeParse(answer.response) : null
    const response: AnswerResponse | null = parsed && parsed.success ? parsed.data : null
    const options = qq.question.options.map((o) => ({
      id: o.id,
      label: o.label,
      position: o.position,
      matchValue: revealCorrection ? o.matchValue : undefined,
      isCorrect: revealCorrection ? o.isCorrect : undefined,
      feedback: revealCorrection ? o.feedback : undefined,
    }))
    return {
      questionId: qq.questionId,
      type: qq.question.type,
      prompt: qq.question.prompt,
      points: qq.points ?? qq.question.points,
      position: qq.position,
      options,
      config: revealCorrection ? asRecord(qq.question.config) : undefined,
      response,
      isCorrect: revealCorrection ? (answer?.isCorrect ?? null) : null,
      score: revealCorrection ? (answer?.score ?? null) : null,
      feedback: revealCorrection ? (answer?.feedback ?? null) : null,
      explanation: revealCorrection ? qq.question.explanation : null,
      needsManualGrading: qq.question.type === 'ESSAY' && (answer?.score === null || answer === undefined),
    }
  })

  return {
    attempt: {
      id: attempt.id,
      number: attempt.number,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percent: attempt.percent,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      gradedAt: attempt.gradedAt,
      timeSpentSeconds: attempt.timeSpentSeconds,
      user: attempt.user,
    },
    quiz: { id: attempt.quiz.id, passScore: attempt.quiz.passScore, isSurvey: attempt.quiz.isSurvey, showCorrection: attempt.quiz.showCorrection, title: ctx.activity.title, activityId: ctx.activity.id },
    course: ctx.course,
    questions,
    revealCorrection,
  }
}

/** Compositions en attente de correction pour un formateur (cours ou cohorte). */
export async function listPendingEssays(principal: Principal, filter: { courseId?: string; cohortId?: string } = {}) {
  const p = requirePrincipal(principal)
  if (filter.courseId) assertCan(p, 'course.teach', { courseId: filter.courseId, cohortId: filter.cohortId ?? null })
  else if (filter.cohortId) assertCan(p, 'cohort.teach', { cohortId: filter.cohortId })
  else assertCan(p, 'grade.write')
  const attempts = await prisma.attempt.findMany({
    where: {
      status: 'SUBMITTED',
      ...(filter.cohortId ? { user: { cohortMembers: { some: { cohortId: filter.cohortId } } } } : {}),
      ...(filter.courseId ? { quiz: { activity: { lesson: { module: { courseVersion: { courseId: filter.courseId } } } } } } : {}),
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
      quiz: { select: { id: true, activity: { select: { id: true, title: true, lesson: { select: { module: { select: { courseVersion: { select: { course: { select: { id: true, title: true } } } } } } } } } } } },
      answers: { where: { score: null }, select: { questionId: true } },
    },
    take: 200,
  })
  return attempts.map((a) => ({
    attemptId: a.id,
    submittedAt: a.submittedAt,
    user: a.user,
    activity: { id: a.quiz.activity.id, title: a.quiz.activity.title },
    course: a.quiz.activity.lesson.module.courseVersion.course,
    pendingQuestions: a.answers.length,
  }))
}

/** Recalcule la progression liée à une tentative (utilitaire d'administration). */
export async function resyncProgress(principal: Principal, enrollmentId: string) {
  assertCan(principal, 'cohort.manage')
  return recomputeProgress(enrollmentId, { actorId: principal.id })
}
