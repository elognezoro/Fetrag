// GET /health : état de l'API et de la base de données (supervision, sonde Vercel / conteneur).
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { prisma } from '@fetrag/db'
import { runHealthChecks } from '@fetrag/observability'
import type { ApiEnv } from '../env'
import { jsonContent } from '../lib/responses'
import { API_VERSION } from '../openapi'

const healthSchema = z
  .object({
    ok: z.boolean(),
    service: z.literal('api-fetrag'),
    version: z.string(),
    timestamp: z.string(),
    checks: z.array(
      z.object({
        name: z.string(),
        ok: z.boolean(),
        detail: z.string().optional(),
        durationMs: z.number(),
      }),
    ),
  })
  .openapi('Health')

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Santé'],
  summary: 'État de la plateforme',
  description: 'Vérifie la disponibilité de l’API et la connexion à PostgreSQL. Renvoie 503 si un contrôle échoue.',
  responses: {
    200: jsonContent(healthSchema, 'Plateforme opérationnelle'),
    503: jsonContent(healthSchema, 'Au moins un contrôle en échec'),
  },
})

export const healthRoutes = new OpenAPIHono<ApiEnv>()

healthRoutes.openapi(healthRoute, async (c) => {
  const result = await runHealthChecks([
    {
      name: 'database',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
        return { ok: true }
      },
    },
  ])
  const body = { ok: result.ok, service: 'api-fetrag' as const, version: API_VERSION, timestamp: result.timestamp, checks: result.checks }
  c.header('Cache-Control', 'no-store')
  return result.ok ? c.json(body, 200) : c.json(body, 503)
})
