// @fetrag/api - API REST /v1 (Hono + Zod OpenAPI) montée dans les apps Next.js et dans apps/api.
// Version minimale (lot shells) : uniquement la route de santé. Le lot API remplace ce fichier.
import { Hono } from 'hono'

/** Construit l'application Hono de l'API, préfixée par /api/v1. */
export function createApiApp() {
  const api = new Hono().basePath('/api/v1')
  api.get('/health', (c) => c.json({ ok: true }))
  return api
}

/** Instance partagée montée par `app/api/v1/[[...route]]/route.ts` de chaque application. */
export const app = createApiApp()

/** Alias conservé pour le contrat d'export du lot API. */
export const apiRoutes = app

export type ApiApp = ReturnType<typeof createApiApp>
