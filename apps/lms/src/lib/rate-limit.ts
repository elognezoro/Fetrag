import 'server-only'

interface Bucket {
  count: number
  resetAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __fetragRateLimit: Map<string, Bucket> | undefined
}

/** Compteurs en mémoire, conservés entre rechargements en développement. */
const buckets: Map<string, Bucket> = globalThis.__fetragRateLimit ?? new Map<string, Bucket>()
globalThis.__fetragRateLimit = buckets

const MAX_BUCKETS = 5000

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Limiteur de débit simple (fenêtre fixe) par clé, en mémoire du processus.
 * Première ligne de défense pour l'authentification (SEC-04) ;
 * sur une plateforme serverless chaque instance possède ses propres compteurs.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) prune(now)
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }
  current.count += 1
  if (current.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 }
}

/** Formule un délai d'attente lisible pour l'utilisateur. */
export function formatRetryDelay(seconds: number): string {
  if (seconds < 60) return `${seconds} seconde${seconds > 1 ? 's' : ''}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}
