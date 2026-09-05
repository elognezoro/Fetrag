// Limitation de débit en mémoire (fenêtre glissante) par adresse IP et par route.
// Suffisant pour une instance (Vercel / conteneur) ; un magasin partagé pourra être branché via ADR.
import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { RateLimitedError } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { clientIp, resourceSegment } from '../lib/request'

export interface RateLimitOptions {
  /** Nombre maximal de requêtes par fenêtre. */
  limit: number
  /** Durée de la fenêtre glissante (ms). */
  windowMs: number
  /** Nom du compartiment (les compartiments sont indépendants). */
  scope: string
  /** Clé de regroupement : par défaut IP + méthode + route (motif) ou segment de ressource. */
  key?: (c: Context<ApiEnv>) => string
  /** Requêtes exemptées (ex. webhooks pour le limiteur public). */
  skip?: (c: Context<ApiEnv>) => boolean
}

const buckets = new Map<string, number[]>()
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 60_000
const MAX_BUCKETS = 50_000

function sweep(now: number, windowMs: number): void {
  lastSweep = now
  for (const [key, hits] of buckets) {
    const kept = hits.filter((t) => t > now - windowMs)
    if (kept.length === 0) buckets.delete(key)
    else buckets.set(key, kept)
  }
}

/** Vide tous les compartiments (tests). */
export function resetRateLimits(): void {
  buckets.clear()
}

/** Motif de route courant (middleware de route) ou segment de ressource (middleware global). */
function routeKey(c: Context<ApiEnv>): string {
  const pattern = c.req.routePath
  if (pattern && pattern !== '*' && !pattern.endsWith('/*')) return `${c.req.method} ${pattern}`
  return `${c.req.method} /${resourceSegment(c.req.path)}`
}

export function rateLimit(options: RateLimitOptions) {
  const { limit, windowMs, scope } = options
  return createMiddleware<ApiEnv>(async (c, next) => {
    if (options.skip?.(c)) {
      await next()
      return
    }
    const now = Date.now()
    if (now - lastSweep > SWEEP_INTERVAL_MS || buckets.size > MAX_BUCKETS) sweep(now, windowMs)

    const key = `${scope}|${clientIp(c)}|${options.key ? options.key(c) : routeKey(c)}`
    const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs)

    if (hits.length >= limit) {
      const oldest = hits[0] ?? now
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
      buckets.set(key, hits)
      c.header('Retry-After', String(retryAfterSeconds))
      c.header('X-RateLimit-Limit', String(limit))
      c.header('X-RateLimit-Remaining', '0')
      c.header('X-RateLimit-Reset', String(retryAfterSeconds))
      throw new RateLimitedError(`Trop de requêtes : réessayez dans ${retryAfterSeconds} s`)
    }

    hits.push(now)
    buckets.set(key, hits)
    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - hits.length)))
    c.header('X-RateLimit-Reset', String(Math.ceil(windowMs / 1000)))
    await next()
  })
}

const MINUTE = 60_000

function isWebhookPath(path: string): boolean {
  return /\/(payments\/webhooks|webhooks\/payments)\//.test(path)
}

/** 60 requêtes / minute / IP / ressource sur l'ensemble de l'API (webhooks exemptés). */
export const publicRateLimit = rateLimit({ limit: 60, windowMs: MINUTE, scope: 'public', skip: (c) => isWebhookPath(c.req.path) })

/** 10 requêtes / minute / IP sur les formulaires, certificats et paiements. */
export const strictRateLimit = rateLimit({ limit: 10, windowMs: MINUTE, scope: 'strict' })

/** Webhooks PSP : limite large (journalisation systématique, signature vérifiée par le service). */
export const webhookRateLimit = rateLimit({ limit: 300, windowMs: MINUTE, scope: 'webhook' })
