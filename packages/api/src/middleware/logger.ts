// Journalisation JSON structurée par requête (@fetrag/observability), sans données personnelles brutes.
import { createMiddleware } from 'hono/factory'
import { createLogger } from '@fetrag/observability'
import { hashIp } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { clientIp } from '../lib/request'

export const requestLogger = createMiddleware<ApiEnv>(async (c, next) => {
  const started = c.get('requestStartedAt') ?? performance.now()
  const log = createLogger({
    service: 'api',
    correlationId: c.get('correlationId'),
    method: c.req.method,
    path: c.req.path,
  })
  c.set('logger', log)
  try {
    await next()
  } finally {
    const durationMs = Math.round(performance.now() - started)
    const status = c.res?.status ?? 0
    const ip = clientIp(c)
    const data = {
      status,
      durationMs,
      ipHash: ip === 'unknown' ? null : hashIp(ip),
      auth: c.get('authMethod') ?? 'none',
      principalId: c.get('principal')?.id ?? null,
      apiKeyId: c.get('apiKey')?.id ?? null,
    }
    if (status >= 500) log.error('http.request', data)
    else if (status >= 400) log.warn('http.request', data)
    else log.info('http.request', data)
  }
})
