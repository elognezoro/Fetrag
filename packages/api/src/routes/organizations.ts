// Organisations affiliées : GET /organizations/{id}/report (rapport strictement filtré par organizationId).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { idSchema } from '@fetrag/contracts'
import { reports } from '@fetrag/lms-core'
import { jsonContent, protectedErrors } from '../lib/responses'
import { authenticated, requireCan } from '../middleware/auth'
import { protectedSecurity } from '../openapi'
import { idParamSchema, nullableDateSchema } from '../schemas/common'

const countsSchema = z.record(z.string(), z.number().int()).openapi({ description: 'Effectifs par statut', example: { SUBMITTED: 2, SCHEDULED: 1 } })

const organizationReportSchema = z
  .object({
    organization: z.object({
      id: idSchema,
      name: z.string(),
      acronym: z.string().nullable(),
      sector: z.string().nullable(),
      city: z.string().nullable(),
      isAffiliate: z.boolean(),
    }),
    requests: countsSchema,
    enrollments: z.object({
      total: z.number().int(),
      byStatus: countsSchema,
      averageProgress: z.number().int(),
      averageScore: z.number().int().nullable(),
      totalTimeSeconds: z.number().int(),
    }),
    learners: z.number().int(),
    certificates: z.number().int(),
    cohorts: z.array(
      z.object({
        id: idSchema,
        code: z.string(),
        name: z.string(),
        status: z.string(),
        startsAt: nullableDateSchema,
        endsAt: nullableDateSchema,
        course: z.object({ id: idSchema, title: z.string() }),
        members: z.number().int(),
        sessions: z.number().int(),
      }),
    ),
    courses: z.array(
      z.object({
        course: z.object({ id: idSchema, title: z.string(), code: z.string() }),
        enrolled: z.number().int(),
        completed: z.number().int(),
        completionRate: z.number(),
        averageProgress: z.number().int(),
        averageScore: z.number().int().nullable(),
        certificates: z.number().int(),
      }),
    ),
    generatedAt: z.string(),
  })
  .openapi('OrganizationReport')

const reportRoute = createRoute({
  method: 'get',
  path: '/organizations/{id}/report',
  tags: ['Organisations'],
  summary: 'Rapport de formation d’une organisation',
  description: 'Permission `reports.org` sur l’organisation (responsable d’organisation, coordination). Demandes, inscriptions, progression moyenne, certificats, cohortes et détail par cours.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { params: idParamSchema },
  responses: { 200: jsonContent(organizationReportSchema, 'Rapport'), ...protectedErrors() },
})

export const organizationRoutes = createRouter()

organizationRoutes.openapi(reportRoute, async (c) => {
  const { id } = c.req.valid('param')
  const principal = requireCan(c, 'reports.org', { organizationId: id })
  const report = await reports.organizationReport(id, principal)
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      organization: report.organization,
      requests: compact(report.requests),
      enrollments: { ...report.enrollments, byStatus: compact(report.enrollments.byStatus) },
      learners: report.learners,
      certificates: report.certificates,
      cohorts: report.cohorts.map((cohort) => ({
        id: cohort.id,
        code: cohort.code,
        name: cohort.name,
        status: cohort.status,
        startsAt: cohort.startsAt,
        endsAt: cohort.endsAt,
        course: cohort.course,
        members: cohort._count.members,
        sessions: cohort._count.sessions,
      })),
      courses: report.courses,
      generatedAt: new Date().toISOString(),
    },
    200,
  )
})

/** Retire les entrées indéfinies d'un dictionnaire de compteurs. */
function compact(counts: Partial<Record<string, number>>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(counts)) if (typeof value === 'number') out[key] = value
  return out
}
