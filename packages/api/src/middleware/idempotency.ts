// Idempotence des POST sensibles (paiements, certificats) : en-tête `Idempotency-Key` obligatoire (428),
// rejeu en mémoire de la réponse pendant 24 h pour un même principal / route / clé.
// Les services métier conservent leur propre idempotence persistante (Order.idempotencyKey, certificat par inscription).
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { DomainError } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { clientIp } from '../lib/request'

export const IDEMPOTENCY_HEADER = 'idempotency-key'
const KEY_MIN = 8
const KEY_MAX = 120
const TTL_MS = 24 * 60 * 60 * 1000
const MAX_ENTRIES = 5_000

interface CachedResponse {
  status: number
  body: string
  contentType: string
  storedAt: number
}

const store = new Map<string, CachedResponse>()

export function resetIdempotencyStore(): void {
  store.clear()
}

/** Clé d'idempotence validée de la requête courante, ou `null`. */
export function readIdempotencyKey(c: Context<ApiEnv>): string | null {
  const raw = c.req.header(IDEMPOTENCY_HEADER)?.trim()
  if (!raw || raw.length < KEY_MIN || raw.length > KEY_MAX) return null
  return raw
}

/** Clé d'idempotence obligatoire (sinon 428). */
export function requireIdempotencyKey(c: Context<ApiEnv>): string {
  const key = readIdempotencyKey(c)
  if (!key) {
    throw new DomainError('IDEMPOTENCY_KEY_REQUIRED', `L'en-tête Idempotency-Key (${KEY_MIN} à ${KEY_MAX} caractères) est obligatoire sur cette opération`)
  }
  return key
}

function cacheKey(c: Context<ApiEnv>, key: string): string {
  const who = c.get('principal')?.id ?? `ip:${clientIp(c)}`
  return `${who}|${c.req.method} ${c.req.path}|${key}`
}

function evictExpired(now: number): void {
  for (const [k, v] of store) if (now - v.storedAt > TTL_MS) store.delete(k)
  if (store.size > MAX_ENTRIES) {
    const oldest = [...store.entries()].sort((a, b) => a[1].storedAt - b[1].storedAt).slice(0, store.size - MAX_ENTRIES)
    for (const [k] of oldest) store.delete(k)
  }
}

export const idempotencyRequired = createMiddleware<ApiEnv>(async (c, next) => {
  const key = requireIdempotencyKey(c)
  const now = Date.now()
  evictExpired(now)
  const id = cacheKey(c, key)
  const cached = store.get(id)
  if (cached && now - cached.storedAt <= TTL_MS) {
    c.header('Idempotency-Replayed', 'true')
    c.header('Idempotency-Key', key)
    c.header('Cache-Control', 'no-store')
    c.header('Content-Type', cached.contentType)
    return c.body(cached.body, cached.status as 200)
  }

  await next()

  const status = c.res.status
  // Seules les réponses définitives sont rejouées : une erreur serveur peut être retentée avec la même clé.
  if (status < 500 && status !== 429) {
    const body = await c.res.clone().text()
    store.set(id, { status, body, contentType: c.res.headers.get('content-type') ?? 'application/json; charset=UTF-8', storedAt: now })
  }
  c.header('Idempotency-Key', key)
})
