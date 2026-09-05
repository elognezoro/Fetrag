// Évaluations : POST /quizzes/{activityId}/attempts (démarrer / reprendre) et POST /attempts/{id}/submit (correction).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { idSchema, questionTypeSchema, submitAttemptSchema } from '@fetrag/contracts'
import { quizzes } from '@fetrag/lms-core'

/** Statuts de tentative (miroir de l'enum Prisma AttemptStatus). */
const attemptStatuses = ['IN_PROGRESS', 'SUBMITTED', 'GRADED'] as const
type AttemptStatusName = (typeof attemptStatuses)[number]

function toAttemptStatus(value: string): AttemptStatusName {
  return (attemptStatuses as readonly string[]).includes(value) ? (value as AttemptStatusName) : 'SUBMITTED'
}
import { errorResponses, jsonContent, protectedErrors } from '../lib/responses'
import { authenticated, requirePrincipal } from '../middleware/auth'
import { protectedSecurity } from '../openapi'
import { enrollmentStatusSchema, idParamSchema, isoDateSchema, nullableDateSchema } from '../schemas/common'

const presentedQuestionSchema = z
  .object({
    id: idSchema,
    type: questionTypeSchema,
    prompt: z.string(),
    points: z.number().int(),
    position: z.number().int(),
    options: z.array(z.object({ id: idSchema, label: z.string(), position: z.number().int() })),
    matchValues: z.array(z.string()).optional(),
    blankText: z.string().optional(),
    blankCount: z.number().int().optional(),
    minWords: z.number().int().optional(),
    maxWords: z.number().int().optional(),
  })
  .openapi('PresentedQuestion', { description: 'Question présentée à l’apprenant, sans les corrections' })

const attemptStartSchema = z
  .object({
    attempt: z.object({
      id: idSchema,
      number: z.number().int(),
      startedAt: isoDateSchema,
      deadline: nullableDateSchema,
      status: z.enum(attemptStatuses),
    }),
    quiz: z.object({
      id: idSchema,
      activityId: idSchema,
      title: z.string(),
      description: z.string().nullable(),
      instructions: z.string().nullable(),
      timeLimitMinutes: z.number().int().nullable(),
      maxAttempts: z.number().int(),
      passScore: z.number().int(),
      isSurvey: z.boolean(),
      showCorrection: z.boolean(),
      questionCount: z.number().int(),
      maxScore: z.number().int(),
    }),
    questions: z.array(presentedQuestionSchema),
    enrollmentId: z.string().nullable(),
    course: z.object({ id: idSchema, slug: z.string(), title: z.string(), code: z.string() }),
    lesson: z.object({ id: idSchema, title: z.string(), slug: z.string(), moduleId: idSchema }),
  })
  .openapi('AttemptStart')

const activityParams = z.object({ activityId: idSchema.openapi({ param: { name: 'activityId', in: 'path' } }) })

const startRoute = createRoute({
  method: 'post',
  path: '/quizzes/{activityId}/attempts',
  tags: ['Apprentissage'],
  summary: 'Démarrer ou reprendre une tentative d’évaluation',
  description: 'Vérifie l’inscription, la disponibilité et le nombre maximal de tentatives ; renvoie les questions sans les corrections.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { params: activityParams },
  responses: {
    201: jsonContent(attemptStartSchema, 'Tentative en cours'),
    ...protectedErrors(),
    ...errorResponses(412),
  },
})

const submitBodySchema = submitAttemptSchema.omit({ attemptId: true }).openapi('SubmitAttemptInput')

const progressStateSchema = z.object({
  enrollmentId: z.string(),
  status: enrollmentStatusSchema,
  progressPercent: z.number().int(),
  score: z.number().int().nullable(),
  timeSpentSeconds: z.number().int(),
  totalActivities: z.number().int(),
  completedActivities: z.number().int(),
  requiredTotal: z.number().int(),
  requiredCompleted: z.number().int(),
  justCompleted: z.boolean(),
  certificateId: z.string().nullable(),
  remaining: z.array(z.string()),
})

const submitResultSchema = z
  .object({
    attemptId: idSchema,
    status: z.enum(attemptStatuses),
    score: z.number().int().nullable(),
    maxScore: z.number().int().nullable(),
    percent: z.number().int().nullable(),
    passed: z.boolean().nullable(),
    passScore: z.number().int(),
    pendingManualGrading: z.number().int().openapi({ description: 'Compositions (ESSAY) en attente de correction manuelle' }),
    isSurvey: z.boolean(),
    showCorrection: z.boolean(),
    progress: progressStateSchema.nullable(),
  })
  .openapi('AttemptResult')

const submitRoute = createRoute({
  method: 'post',
  path: '/attempts/{id}/submit',
  tags: ['Apprentissage'],
  summary: 'Soumettre une tentative',
  description: 'Correction automatique de tous les types de questions sauf les compositions (notées par le formateur). Met à jour l’achèvement et la progression.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: {
    params: idParamSchema,
    body: { content: { 'application/json': { schema: submitBodySchema } }, required: true },
  },
  responses: {
    200: jsonContent(submitResultSchema, 'Tentative corrigée (ou en attente de correction manuelle)'),
    ...protectedErrors(),
    ...errorResponses(412),
  },
})

export const quizRoutes = createRouter()

quizRoutes.openapi(startRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { activityId } = c.req.valid('param')
  const started = await quizzes.start(principal, activityId)
  c.header('Cache-Control', 'no-store')
  return c.json(started, 201)
})

quizRoutes.openapi(submitRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const result = await quizzes.submit(principal, { attemptId: id, answers: body.answers })
  c.header('Cache-Control', 'no-store')
  return c.json(
    {
      attemptId: result.attemptId,
      status: toAttemptStatus(result.status),
      score: result.score,
      maxScore: result.maxScore,
      percent: result.percent,
      passed: result.passed,
      passScore: result.passScore,
      pendingManualGrading: result.pendingManualGrading,
      isSurvey: result.isSurvey,
      showCorrection: result.showCorrection,
      progress: result.progress,
    },
    200,
  )
})
