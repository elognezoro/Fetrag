import type { Principal } from '@fetrag/domain/rbac'

export type { Principal }

/** Métadonnées de requête transmises à l'audit (IP hachée, agent, corrélation). */
export interface RequestMeta {
  ip?: string | null
  userAgent?: string | null
  correlationId?: string | null
}

/** Résultat d'une opération de masse (création de comptes, émission de certificats...). */
export interface BulkResult<T> {
  done: T[]
  skipped: Array<{ id: string; reason: string }>
}
