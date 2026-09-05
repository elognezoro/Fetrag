import { it, vi } from 'vitest'
import { Hono } from 'hono'

vi.mock('@fetrag/db', () => ({ prisma: {}, Prisma: {} }))
vi.mock('@fetrag/auth', () => ({ loadPrincipal: vi.fn(), sessionCookieName: () => 'authjs.session-token' }))
vi.mock('@fetrag/lms-core', () => ({}))
vi.mock('@fetrag/payments', () => ({}))
vi.mock('@fetrag/cms', () => ({}))
vi.mock('@fetrag/search', () => ({ searchPublic: vi.fn(), searchTypes: ['article'], MAX_QUERY_LENGTH: 100 }))
vi.mock('@fetrag/analytics', () => ({}))
vi.mock('@fetrag/jobs', () => ({}))

import { createApiApp } from '../index'

it('debug', async () => {
  const app = createApiApp()
  const anyApp = app as unknown as { errorHandler: unknown; routes: Array<{ path: string; method: string; handler: unknown }> }
  const defaultHandler = (new Hono() as unknown as { errorHandler: unknown }).errorHandler
  console.info('own props', Object.getOwnPropertyNames(app).join(','))
  console.info('errorHandler is default?', anyApp.errorHandler === defaultHandler)
  const mounted = new Hono()
  mounted.onError((err, c) => {
    console.info('PARENT onError got', err.constructor.name, 'instanceof Error', err instanceof Error)
    return c.text('parent', 500)
  })
  mounted.route('/', app)
  const mountedRoutes = (mounted as unknown as { routes: Array<{ handler: Record<symbol, unknown> }> }).routes
  const wrapped = mountedRoutes.filter((r) => Object.getOwnPropertySymbols(r.handler).length > 0).length
  console.info('mounted routes', mountedRoutes.length, 'wrapped', wrapped)
  const res = await mounted.request('http://localhost/api/v1/me')
  console.info('mounted status', res.status, await res.text())
})
