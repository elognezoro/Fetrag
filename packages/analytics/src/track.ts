import { createHash } from 'node:crypto'
import { prisma, type Prisma } from '@fetrag/db'

export type AnalyticsApp = 'web' | 'lms' | 'api' | 'worker'

export interface TrackInput {
  app: AnalyticsApp
  /** Chemin sans paramètres de requête (ils sont retirés par sécurité). */
  path?: string | null
  /** Identifiant utilisateur : jamais stocké en clair, uniquement son empreinte SHA-256 salée. */
  userId?: string | null
  sessionId?: string | null
  properties?: Record<string, unknown> | null
}

const NAME_RE = /^[a-z0-9][a-z0-9_.:-]{0,79}$/
const SENSITIVE_KEY = /pass(word)?|secret|token|authorization|cookie|card|cvv|otp|totp|iban|email|phone|tel|password/i
const MAX_PROPERTIES_BYTES = 4096

/**
 * Sel de hachage : `AUTH_SECRET` (lu via process.env car `@fetrag/config` n'est pas une dépendance
 * de ce package) avec repli sur une constante ; l'empreinte reste stable pour un même déploiement.
 */
function salt(): string {
  return process.env.ANALYTICS_SALT ?? process.env.AUTH_SECRET ?? 'fetrag-analytics'
}

/** Empreinte SHA-256 salée (32 hex) d'un identifiant utilisateur. */
export function hashUserId(userId: string): string {
  return createHash('sha256').update(`${salt()}:${userId}`).digest('hex').slice(0, 32)
}

/** Nom d'événement normalisé (`page_view`, `search`, `cta.click`...), `null` si invalide. */
export function normalizeEventName(name: string): string | null {
  const cleaned = name.trim().toLowerCase().replace(/\s+/g, '_')
  return NAME_RE.test(cleaned) ? cleaned : null
}

/** Chemin sans query string ni fragment, tronqué. */
export function sanitizePath(path: string | null | undefined): string | null {
  if (!path) return null
  const bare = path.split('?')[0]?.split('#')[0] ?? ''
  return bare ? bare.slice(0, 300) : null
}

/** Retire les clés sensibles et limite la taille des propriétés (SEC-09). */
export function sanitizeProperties(properties: Record<string, unknown> | null | undefined): Prisma.InputJsonObject | undefined {
  if (!properties) return undefined
  const out: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (SENSITIVE_KEY.test(key)) continue
    if (value === null || typeof value === 'boolean' || typeof value === 'number') out[key.slice(0, 60)] = value
    else if (typeof value === 'string') out[key.slice(0, 60)] = value.slice(0, 300)
    else if (value instanceof Date) out[key.slice(0, 60)] = value.toISOString()
  }
  const json = JSON.stringify(out)
  if (json.length > MAX_PROPERTIES_BYTES) return { truncated: true }
  return out
}

/**
 * Enregistre un événement d'usage (vue de page, recherche, clic...). Ne lève jamais :
 * l'analytique ne doit pas faire échouer une requête utilisateur.
 */
export async function track(name: string, input: TrackInput): Promise<boolean> {
  const eventName = normalizeEventName(name)
  if (!eventName) return false
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: eventName,
        app: input.app,
        path: sanitizePath(input.path),
        userIdHash: input.userId ? hashUserId(input.userId) : null,
        sessionId: input.sessionId ? input.sessionId.slice(0, 80) : null,
        properties: sanitizeProperties(input.properties),
      },
    })
    return true
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', msg: 'analytics.track_failed', name: eventName, error: error instanceof Error ? error.message : String(error) }))
    return false
  }
}
