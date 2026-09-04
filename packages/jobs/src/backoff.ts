/** Délai maximal entre deux tentatives : 24 heures. */
export const MAX_BACKOFF_MINUTES = 24 * 60

/** Durée au-delà de laquelle un job RUNNING est considéré abandonné (zombie) et repris. */
export const ZOMBIE_LOCK_MINUTES = 10

/**
 * Backoff exponentiel : 2^attempts minutes (2, 4, 8, 16, 32...), plafonné à 24 h.
 * `attempts` est le nombre de tentatives déjà effectuées (au moins 1 après un échec).
 */
export function computeBackoffMinutes(attempts: number): number {
  const n = Number.isFinite(attempts) ? Math.max(0, Math.floor(attempts)) : 0
  const minutes = Math.pow(2, Math.min(n, 30))
  return Math.min(MAX_BACKOFF_MINUTES, Math.max(1, minutes))
}

/** Date de prochaine exécution après un échec. */
export function nextRunAt(attempts: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + computeBackoffMinutes(attempts) * 60_000)
}

/** Un job est mort lorsque le nombre de tentatives atteint le maximum autorisé. */
export function isExhausted(attempts: number, maxAttempts: number): boolean {
  return attempts >= Math.max(1, maxAttempts)
}

/** Seuil de verrou au-delà duquel un job RUNNING est repris par un autre worker. */
export function zombieThreshold(now: Date = new Date()): Date {
  return new Date(now.getTime() - ZOMBIE_LOCK_MINUTES * 60_000)
}
