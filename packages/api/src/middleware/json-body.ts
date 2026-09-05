// Contrôle précoce du corps JSON : un JSON malformé produit une VALIDATION_ERROR uniforme
// (au lieu de la réponse par défaut du validateur). Les webhooks lisent le corps brut : exemptés.
import { createMiddleware } from 'hono/factory'
import { ValidationError } from '@fetrag/domain'
import type { ApiEnv } from '../env'

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH'])
const MAX_JSON_BYTES = 1024 * 1024

function isWebhook(path: string): boolean {
  return /\/(payments\/webhooks|webhooks\/payments)\//.test(path)
}

export const jsonBodyGuard = createMiddleware<ApiEnv>(async (c, next) => {
  if (METHODS_WITH_BODY.has(c.req.method) && !isWebhook(c.req.path)) {
    const contentType = c.req.header('content-type') ?? ''
    const length = Number(c.req.header('content-length') ?? '0')
    if (Number.isFinite(length) && length > MAX_JSON_BYTES) {
      throw new ValidationError('Corps de requête trop volumineux (1 Mo maximum)', { maxBytes: MAX_JSON_BYTES })
    }
    if (contentType.includes('application/json')) {
      try {
        await c.req.json()
      } catch {
        throw new ValidationError('Corps JSON malformé')
      }
    }
  }
  await next()
})
