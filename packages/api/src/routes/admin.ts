// Administration : GET /admin/stats (reports.read) et GET /jobs/status (super administrateur).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { financeStats, lmsStats, webStats } from '@fetrag/analytics'
import { getJobStats, listHandlers } from '@fetrag/jobs'
import { dashboards } from '@fetrag/lms-core'
import { can } from '@fetrag/domain'
import { jsonObjectSchema, toJsonObject } from '../lib/json'
import { jsonContent, protectedErrors } from '../lib/responses'
import { authenticated, requireCan, requireSuperAdmin } from '../middleware/auth'
import { protectedSecurity } from '../openapi'

const adminStatsSchema = z
  .object({
    generatedAt: z.string(),
    /** Synthèse plateforme (utilisateurs, rôles, cours, inscriptions, certificats, jobs, audit récent). */
    platform: jsonObjectSchema,
    /** Fréquentation du site et formulaires sur 30 jours. */
    web: jsonObjectSchema,
    /** Activité d’apprentissage sur 30 jours. */
    lms: jsonObjectSchema,
    /** Chiffre d’affaires et commandes (permission finance.read), sinon null. */
    finance: jsonObjectSchema.nullable(),
  })
  .openapi('AdminStats')

const statsRoute = createRoute({
  method: 'get',
  path: '/admin/stats',
  tags: ['Administration'],
  summary: 'Statistiques consolidées de la plateforme',
  description: 'Permission `reports.read` (coordination, finance, éditeur, super administrateur). Le bloc finance exige `finance.read`.',
  security: protectedSecurity,
  middleware: [authenticated],
  responses: { 200: jsonContent(adminStatsSchema, 'Statistiques'), ...protectedErrors() },
})

const jobStatusSchema = z
  .object({
    counts: z.object({
      QUEUED: z.number().int(),
      RUNNING: z.number().int(),
      SUCCEEDED: z.number().int(),
      FAILED: z.number().int(),
      DEAD: z.number().int(),
      dueNow: z.number().int(),
    }),
    handlers: z.array(z.string()).openapi({ description: 'Types de jobs enregistrés dans ce processus' }),
    generatedAt: z.string(),
  })
  .openapi('JobStatus')

const jobsRoute = createRoute({
  method: 'get',
  path: '/jobs/status',
  tags: ['Administration'],
  summary: 'État de la file de jobs',
  description: 'Réservé au super administrateur. Compteurs par statut (BackgroundJob) et handlers enregistrés.',
  security: protectedSecurity,
  middleware: [authenticated],
  responses: { 200: jsonContent(jobStatusSchema, 'File de jobs'), ...protectedErrors() },
})

export const adminRoutes = createRouter()

adminRoutes.openapi(statsRoute, async (c) => {
  const principal = requireCan(c, 'reports.read')
  const [platform, web, lms, finance] = await Promise.all([
    dashboards.admin(principal),
    webStats(),
    lmsStats(),
    can(principal, 'finance.read') ? financeStats() : Promise.resolve(null),
  ])
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      generatedAt: new Date().toISOString(),
      platform: toJsonObject(platform),
      web: toJsonObject(web),
      lms: toJsonObject(lms),
      finance: finance ? toJsonObject(finance) : null,
    },
    200,
  )
})

adminRoutes.openapi(jobsRoute, async (c) => {
  requireSuperAdmin(c)
  const stats = await getJobStats()
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      counts: { QUEUED: stats.QUEUED, RUNNING: stats.RUNNING, SUCCEEDED: stats.SUCCEEDED, FAILED: stats.FAILED, DEAD: stats.DEAD, dueNow: stats.dueNow },
      handlers: listHandlers(),
      generatedAt: new Date().toISOString(),
    },
    200,
  )
})
