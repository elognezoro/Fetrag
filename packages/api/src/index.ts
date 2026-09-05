// @fetrag/api - API REST /api/v1 (Hono + Zod OpenAPI) montée dans apps/web, apps/lms et servie seule par apps/api.
//
// Chaîne de middlewares : corrélation -> journalisation -> en-têtes de sécurité -> CORS -> limitation de débit
// -> garde JSON -> authentification (principal injecté, clé API, cookie de session). Les erreurs métier
// (DomainError, ZodError, erreurs « forme DomainError ») sont converties en réponse ApiError uniforme.
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { getEnvSafe } from '@fetrag/config'
import type { ApiEnv } from './env'
import { authMiddleware } from './middleware/auth'
import { correlationMiddleware } from './middleware/correlation'
import { errorResponse, notFound, onError } from './middleware/errors'
import { jsonBodyGuard } from './middleware/json-body'
import { requestLogger } from './middleware/logger'
import { publicRateLimit } from './middleware/rate-limit'
import { API_BASE_PATH, registerOpenApi } from './openapi'
import { adminRoutes } from './routes/admin'
import { articleRoutes } from './routes/articles'
import { certificateRoutes } from './routes/certificates'
import { commerceRoutes } from './routes/commerce'
import { courseRoutes } from './routes/courses'
import { eventRoutes } from './routes/events'
import { formRoutes } from './routes/forms'
import { healthRoutes } from './routes/health'
import { learningRoutes } from './routes/learning'
import { meRoutes } from './routes/me'
import { organizationRoutes } from './routes/organizations'
import { quizRoutes } from './routes/quizzes'
import { resourceRoutes } from './routes/resources'
import { searchRoutes } from './routes/search'
import { serviceRoutes } from './routes/services'
import { trainingRequestRoutes } from './routes/training-requests'
import { webhookRoutes } from './routes/webhooks'

export type { ApiEnv, ApiVariables, AuthMethod, ApiKeyContext } from './env'
export { requirePrincipal, requireCan, requireSuperAdmin, authenticated, authorize, API_KEY_HEADER } from './middleware/auth'
export { readIdempotencyKey, requireIdempotencyKey, IDEMPOTENCY_HEADER } from './middleware/idempotency'
export { rateLimit, resetRateLimits } from './middleware/rate-limit'
export { normalizeError, toApiError, errorResponse } from './middleware/errors'
export { createApiKeyMaterial, hashApiKey, listApiKeys, resolveApiKey, resetApiKeyCache, API_KEYS_SETTING, apiKeyRecordSchema } from './lib/api-keys'
export type { ApiKeyRecord } from './lib/api-keys'
export { API_BASE_PATH, API_VERSION } from './openapi'

/** Origines autorisées (CORS) : les deux applications Next.js (+ localhost en développement). */
export function allowedOrigins(): string[] {
  const env = getEnvSafe()
  const origins = new Set<string>()
  for (const url of [env.APP_WEB_URL, env.APP_LMS_URL, env.API_URL]) {
    if (url) origins.add(url.replace(/\/+$/, ''))
  }
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://localhost:3001')
  }
  return [...origins]
}

/** Construit l'application Hono de l'API, préfixée par /api/v1. */
export function createApiApp() {
  const app = new OpenAPIHono<ApiEnv>({
    defaultHook: (result, c) => {
      if (!result.success) return errorResponse(c, result.error)
      return undefined
    },
  }).basePath(API_BASE_PATH)

  app.onError(onError)
  app.notFound(notFound)

  app.use('*', correlationMiddleware)
  app.use('*', requestLogger)
  app.use(
    '*',
    secureHeaders({
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginResourcePolicy: 'same-site',
      // Swagger UI charge ses ressources depuis un CDN : la CSP est laissée aux applications hôtes.
      contentSecurityPolicy: undefined,
    }),
  )
  app.use(
    '*',
    cors({
      origin: (origin) => (allowedOrigins().includes(origin) ? origin : null),
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Correlation-Id', 'Idempotency-Key'],
      exposeHeaders: ['X-Correlation-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After', 'Idempotency-Replayed'],
      maxAge: 600,
    }),
  )
  app.use('*', publicRateLimit)
  app.use('*', jsonBodyGuard)
  app.use('*', authMiddleware)

  registerOpenApi(app)

  app.route('/', healthRoutes)
  app.route('/', courseRoutes)
  app.route('/', eventRoutes)
  app.route('/', articleRoutes)
  app.route('/', serviceRoutes)
  app.route('/', resourceRoutes)
  app.route('/', searchRoutes)
  app.route('/', certificateRoutes)
  app.route('/', formRoutes)
  app.route('/', meRoutes)
  app.route('/', learningRoutes)
  app.route('/', quizRoutes)
  app.route('/', trainingRequestRoutes)
  app.route('/', organizationRoutes)
  app.route('/', commerceRoutes)
  app.route('/', webhookRoutes)
  app.route('/', adminRoutes)

  return app
}

/** Instance partagée montée par `app/api/v1/[[...route]]/route.ts` de chaque application. */
export const app = createApiApp()

/** Alias conservé pour le contrat d'export du lot API. */
export const apiRoutes = app

export type ApiApp = ReturnType<typeof createApiApp>
