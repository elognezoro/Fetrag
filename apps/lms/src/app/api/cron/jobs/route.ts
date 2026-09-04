import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getEnvSafe } from '@fetrag/config'
import { logger } from '@fetrag/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ProcessJobs = (options?: { limit?: number; workerId?: string }) => Promise<{
  processed: number
  failed: number
  remaining: number
}>

/** Comparaison à temps constant de deux secrets. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length || a.length === 0) return false
  return timingSafeEqual(a, b)
}

/**
 * Autorise l'appel si le porteur correspond à CRON_SECRET ou si la requête provient
 * du planificateur Vercel (en-tête `x-vercel-cron`, uniquement sur l'infrastructure Vercel).
 */
function isAuthorized(request: NextRequest): boolean {
  const env = getEnvSafe()
  const expected = env.CRON_SECRET ?? process.env.CRON_SECRET ?? ''
  const authorization = request.headers.get('authorization') ?? ''
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (bearer && expected && expected !== 'change-me' && secretsMatch(bearer, expected)) return true
  if (request.headers.get('x-vercel-cron') && process.env.VERCEL === '1') return true
  return false
}

/** Traite un lot de jobs de la file persistée (appelé par Vercel Cron toutes les 5 minutes). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  try {
    const mod: Record<string, unknown> = await import('@fetrag/jobs')
    const registerDefaultHandlers = mod.registerDefaultHandlers
    if (typeof registerDefaultHandlers === 'function') {
      await (registerDefaultHandlers as () => void | Promise<void>)()
    }
    // Le package paiements enregistre le traitement des webhooks (jobs ne peut pas l'importer : cycle).
    try {
      const payments: Record<string, unknown> = await import('@fetrag/payments')
      if (typeof payments.registerPaymentJobHandlers === 'function') {
        ;(payments.registerPaymentJobHandlers as () => void)()
      }
      if (typeof payments.reconcile === 'function') {
        await (payments.reconcile as () => Promise<unknown>)()
      }
    } catch (error) {
      logger.warn('cron.payments.unavailable', { error: error instanceof Error ? error.message : String(error) })
    }
    // Jobs périodiques (publication planifiée, rappels de session, expirations) - idempotents par tranche horaire.
    if (typeof mod.runScheduledMaintenance === 'function') {
      await (mod.runScheduledMaintenance as () => Promise<unknown>)()
    }
    const processJobs = mod.processJobs
    if (typeof processJobs !== 'function') {
      return NextResponse.json(
        { ok: true, skipped: true, reason: 'Le processeur de jobs n’est pas encore disponible.', app: 'lms' },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      )
    }
    const result = await (processJobs as ProcessJobs)({ limit: 25, workerId: `cron-lms-${process.env.VERCEL_REGION ?? 'local'}` })
    logger.info('cron.jobs', { app: 'lms', ...result, durationMs: Date.now() - startedAt })
    return NextResponse.json(
      { ok: true, app: 'lms', ...result, durationMs: Date.now() - startedAt, at: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    logger.error('cron.jobs.failed', { app: 'lms', error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ ok: false, error: 'processing_failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export const POST = GET
