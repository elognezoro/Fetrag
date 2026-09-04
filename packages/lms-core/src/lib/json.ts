import { Prisma } from '@fetrag/db'

/** Valeur JSON brute telle que renvoyée par Prisma. */
export type JsonValue = Prisma.JsonValue

/** Convertit une valeur quelconque en enregistrement (objet) ou renvoie un objet vide. */
export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  return {}
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

/**
 * Prépare une valeur pour une colonne Json Prisma : `null` devient JsonNull,
 * `undefined` laisse la colonne intacte, le reste est sérialisé (dates -> ISO).
 */
export function toJsonInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

/** Variante stricte : renvoie toujours une valeur JSON écrivable (null -> JsonNull). */
export function toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return toJsonInput(value) ?? Prisma.JsonNull
}
