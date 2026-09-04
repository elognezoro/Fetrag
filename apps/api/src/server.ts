import { serve } from '@hono/node-server'
import { createApiApp } from '@fetrag/api'
import { getEnv } from '@fetrag/config'

/**
 * Serveur API autonome (déploiement conteneurisé, ADR-001).
 * Sur Vercel, le même routeur est monté dans apps/web et apps/lms sous /api/v1.
 */
const env = getEnv()
const port = Number(process.env.PORT ?? 4000)
const app = createApiApp()

serve({ fetch: app.fetch, port }, (info) => {
  console.info(
    JSON.stringify({
      level: 'info',
      msg: 'API FETRAG démarrée',
      port: info.port,
      env: env.NODE_ENV,
      docs: `http://localhost:${info.port}/api/v1/docs`,
    }),
  )
})
