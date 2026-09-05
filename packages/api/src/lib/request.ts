// Helpers de lecture de la requête : adresse IP, agent utilisateur, métadonnées d'audit.
import type { Context } from 'hono'
import type { ApiEnv } from '../env'

/** Métadonnées transmises aux services métier pour l'audit (forme commune cms / lms-core). */
export interface RequestMeta {
  ip: string | null
  userAgent: string | null
  correlationId: string | null
}

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/
const IPV6 = /^[0-9a-f:.]+$/i

function normalizeIp(raw: string | undefined): string | null {
  if (!raw) return null
  const value = raw.trim().replace(/^\[|\]$/g, '')
  if (!value) return null
  if (IPV4.test(value) || IPV6.test(value)) return value.slice(0, 64)
  return null
}

/**
 * Adresse IP du client : `x-forwarded-for` (premier saut), `x-real-ip`, `cf-connecting-ip`.
 * Renvoie `unknown` si aucun en-tête exploitable (utilisé comme clé de limitation de débit).
 */
export function clientIp(c: Context<ApiEnv>): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) {
    const first = normalizeIp(forwarded.split(',')[0])
    if (first) return first
  }
  const direct = normalizeIp(c.req.header('x-real-ip')) ?? normalizeIp(c.req.header('cf-connecting-ip'))
  return direct ?? 'unknown'
}

export function userAgent(c: Context<ApiEnv>): string | null {
  const ua = c.req.header('user-agent')
  return ua ? ua.slice(0, 300) : null
}

export function requestMeta(c: Context<ApiEnv>): RequestMeta {
  const ip = clientIp(c)
  return {
    ip: ip === 'unknown' ? null : ip,
    userAgent: userAgent(c),
    correlationId: c.get('correlationId') ?? null,
  }
}

/** Segment de ressource (`courses`, `me`, `forms`…) après le préfixe `/api/v1`. */
export function resourceSegment(path: string): string {
  const segments = path.split('/').filter(Boolean)
  const start = segments[0] === 'api' && segments[1] === 'v1' ? 2 : 0
  return segments.slice(start, start + 1).join('/') || '/'
}
