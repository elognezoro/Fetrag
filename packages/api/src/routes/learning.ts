// Apprentissage : POST /enrollments (inscription selon la politique du cours) et POST /progress (remontée idempotente).
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { idSchema, progressReportSchema } from '@fetrag/contracts'
import { enrollments, progress } from '@fetrag/lms-core'
import type { ApiEnv } from '../env'
import { errorResponses, jsonContent, protectedErrors } from '../lib/responses'
import { requestMeta } from '../lib/request'
import { authenticated, requirePrincipal } from '../middleware/auth'
import { protectedSecurity } from '../openapi'
import { enrollmentStatusSchema, isoDateSchema, nullableDateSchema } from '../schemas/common'

const enrollBodySchema = z
  .object({
    courseId: idSchema,
    cohortId: idSchema.optional(),
    organizationId: idSchema.optional().openapi({ description: 'Organisation bénéficiaire (politique ORGANIZATION ou inscription pour un tiers)' }),
    orderId: idSchema.optional().openapi({ description: 'Commande payée (politique PAID)' }),
    userId: idSchema.optional().openapi({ description: 'Inscription d’un tiers (coordination, formateur de cohorte, responsable d’organisation)' }),
  })
  .openapi('EnrollInput')

export const enrollmentSchema = z
  .object({
    id: idSchema,
    userId: idSchema,
    courseId: idSchema,
    courseVersionId: idSchema,
    cohortId: z.string().nullable(),
    organizationId: z.string().nullable(),
    orderId: z.string().nullable(),
    status: enrollmentStatusSchema,
    source: z.string(),
    progressPercent: z.number().int(),
    score: z.number().int().nullable(),
    timeSpentSeconds: z.number().int(),
    startedAt: nullableDateSchema,
    completedAt: nullableDateSchema,
    expiresAt: nullableDateSchema,
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
  })
  .openapi('Enrollment')

const enrollRoute = createRoute({
  method: 'post',
  path: '/enrollments',
  tags: ['Apprentissage'],
  summary: 'S’inscrire à une formation',
  description:
    'Applique la politique d’inscription du cours : SELF (immédiate), APPROVAL (en attente de la coordination), ' +
    'ORGANIZATION (réservée aux organisations affiliées via une demande de formation), PAID (commande réglée requise, 402 sinon). ' +
    'Vérifie les prérequis obligatoires et les capacités.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { body: { content: { 'application/json': { schema: enrollBodySchema } }, required: true } },
  responses: {
    201: jsonContent(enrollmentSchema, 'Inscription créée (ou réactivée)'),
    ...protectedErrors(),
    ...errorResponses(402, 412),
  },
})

const progressBodySchema = progressReportSchema
  .extend({ enrollmentId: idSchema })
  .openapi('ProgressInput', { description: 'Rapport de progression idempotent pour une activité de l’inscription' })

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

const progressResultSchema = z
  .object({
    completion: z.object({
      activityId: idSchema,
      completed: z.boolean(),
      score: z.number().int().nullable(),
      timeSpentSeconds: z.number().int(),
      completedAt: nullableDateSchema,
      updatedAt: isoDateSchema,
    }),
    progress: progressStateSchema,
  })
  .openapi('ProgressResult')

const progressRoute = createRoute({
  method: 'post',
  path: '/progress',
  tags: ['Apprentissage'],
  summary: 'Remonter la progression sur une activité',
  description: 'Cumule le temps passé (plafonné), applique les règles VIEW / TIME_SPENT, recalcule la progression et l’achèvement du cours (émission automatique du certificat le cas échéant).',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { body: { content: { 'application/json': { schema: progressBodySchema } }, required: true } },
  responses: {
    200: jsonContent(progressResultSchema, 'Progression mise à jour'),
    ...protectedErrors(),
    ...errorResponses(412),
  },
})

export const learningRoutes = new OpenAPIHono<ApiEnv>()

learningRoutes.openapi(enrollRoute, async (c) => {
  const principal = requirePrincipal(c)
  const body = c.req.valid('json')
  const enrollment = await enrollments.enroll(
    principal,
    body.courseId,
    { cohortId: body.cohortId, organizationId: body.organizationId, orderId: body.orderId, userId: body.userId, source: 'api' },
    requestMeta(c),
  )
  c.header('Cache-Control', 'no-store')
  return c.json(
    {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      courseVersionId: enrollment.courseVersionId,
      cohortId: enrollment.cohortId,
      organizationId: enrollment.organizationId,
      orderId: enrollment.orderId,
      status: enrollment.status,
      source: enrollment.source,
      progressPercent: enrollment.progressPercent,
      score: enrollment.score,
      timeSpentSeconds: enrollment.timeSpentSeconds,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      expiresAt: enrollment.expiresAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    },
    201,
  )
})

learningRoutes.openapi(progressRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { enrollmentId, ...report } = c.req.valid('json')
  const result = await progress.report(principal, enrollmentId, report)
  c.header('Cache-Control', 'no-store')
  return c.json(
    {
      completion: {
        activityId: result.completion.activityId,
        completed: result.completion.completed,
        score: result.completion.score,
        timeSpentSeconds: result.completion.timeSpentSeconds,
        completedAt: result.completion.completedAt,
        updatedAt: result.completion.updatedAt,
      },
      progress: result.progress,
    },
    200,
  )
})
