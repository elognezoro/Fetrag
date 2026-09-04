// Helpers partagés par les namespaces du CMS : autorisation, validation, pagination, JSON, CSV.
import { z } from 'zod'
import { Prisma } from '@fetrag/db'
import { contentStatusSchema, paginationQuerySchema, type PaginationQuery } from '@fetrag/contracts'
import {
  can,
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
  type Action,
  type AuditContext,
  type Principal,
  type Resource,
} from '@fetrag/domain'

export type Maybe<T> = T | null | undefined

/** Contexte de requête optionnel transmis par les Server Actions (adresse IP hachée à l'audit). */
export interface RequestContext {
  ip?: string | null
  userAgent?: string | null
  correlationId?: string | null
}

/** Exige un principal authentifié. */
export function requirePrincipal(principal: Maybe<Principal>): Principal {
  if (!principal) throw new UnauthenticatedError()
  return principal
}

/** Exige une permission (identité + rôle + portée) et renvoie le principal. */
export function assertCan(principal: Maybe<Principal>, action: Action, resource: Resource = {}): Principal {
  const p = requirePrincipal(principal)
  if (!can(p, action, resource)) throw new ForbiddenError('Permission insuffisante', { action })
  return p
}

/** Exige au moins une des permissions listées. */
export function assertAny(principal: Maybe<Principal>, actions: Action[], resource: Resource = {}): Principal {
  const p = requirePrincipal(principal)
  if (!actions.some((a) => can(p, a, resource))) {
    throw new ForbiddenError('Permission insuffisante', { actions })
  }
  return p
}

/** Contexte d'audit dérivé du principal et du contexte de requête. */
export function auditCtx(principal: Maybe<Principal>, ctx: RequestContext = {}): AuditContext {
  return {
    actorId: principal?.id ?? null,
    actorEmail: principal?.email ?? null,
    ip: ctx.ip ?? null,
    userAgent: ctx.userAgent ?? null,
    correlationId: ctx.correlationId ?? null,
  }
}

/** Validation Zod au bord : convertit les erreurs en ValidationError exploitable par l'UI. */
export function parseInput<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input)
  if (result.success) return result.data as z.output<S>
  const flat = result.error.flatten()
  return raise(
    new ValidationError('Données invalides', {
      fieldErrors: flat.fieldErrors,
      formErrors: flat.formErrors,
      issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    }),
  )
}

function raise(error: Error): never {
  throw error
}

/** Requête de liste d'administration : pagination + recherche + tri + statut. */
export const adminListQuerySchema = paginationQuerySchema.extend({
  status: contentStatusSchema.optional(),
})
export type AdminListQuery = z.input<typeof adminListQuerySchema>

/** Requête de liste publique (pas de tri libre). */
export const publicListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(200).optional(),
})
export type PublicListQuery = z.input<typeof publicListQuerySchema>

/** Filtre Prisma « contient » insensible à la casse. */
export function contains(q: string): Prisma.StringFilter {
  return { contains: q, mode: 'insensitive' }
}

/** Convertit une valeur en entrée JSON Prisma (null explicite → JsonNull). */
export function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

/** Argument de pagination + tri whitelisté à partir d'une requête validée. */
export function pageOf(q: Pick<PaginationQuery, 'page' | 'pageSize'>): { page: number; pageSize: number } {
  return { page: q.page, pageSize: q.pageSize }
}

export type CsvCell = string | number | boolean | Date | null | undefined

/** Génère un CSV (séparateur « ; », BOM UTF-8) lisible par Excel en français. */
export function toCsv(headers: string[], rows: CsvCell[][], separator = ';'): string {
  const escape = (cell: CsvCell): string => {
    if (cell === null || cell === undefined) return ''
    const raw = cell instanceof Date ? cell.toISOString() : typeof cell === 'boolean' ? (cell ? 'oui' : 'non') : String(cell)
    const needsQuote = raw.includes(separator) || raw.includes('"') || raw.includes('\n') || raw.includes('\r')
    return needsQuote ? `"${raw.replace(/"/g, '""')}"` : raw
  }
  const lines = [headers.map(escape).join(separator), ...rows.map((r) => r.map(escape).join(separator))]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

/** Normalise une liste de mots-clés / tags (trim, dédoublonnage, longueur bornée). */
export function normalizeTags(tags: readonly string[] | undefined, max = 20): string[] {
  if (!tags) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const tag = raw.trim().replace(/\s+/g, ' ').slice(0, 40)
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
    if (out.length >= max) break
  }
  return out
}

/** Sous-chaîne sûre d'un objet pour l'audit (évite de journaliser les contenus complets). */
export function auditSnapshot<T extends Record<string, unknown>>(entity: T, keys: Array<keyof T>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    const value = entity[key]
    out[String(key)] = value instanceof Date ? value.toISOString() : value
  }
  return out
}
