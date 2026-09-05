// Identifiant de corrélation : lu dans `x-correlation-id` / `x-request-id`, sinon généré, toujours renvoyé.
import { createMiddleware } from 'hono/factory'
import { correlationIdFrom, newCorrelationId } from '@fetrag/observability'
import type { ApiEnv } from '../env'

const SAFE_ID = /^[A-Za-z0-9._:-]{1,128}$/

export function sanitizeCorrelationId(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? ''
  return SAFE_ID.test(trimmed) ? trimmed : newCorrelationId()
}

export const correlationMiddleware = createMiddleware<ApiEnv>(async (c, next) => {
  const id = sanitizeCorrelationId(correlationIdFrom(c.req.raw.headers))
  c.set('correlationId', id)
  c.set('requestStartedAt', performance.now())
  await next()
  c.header('x-correlation-id', id)
})
