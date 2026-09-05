// Clés API (SystemSetting `api.keys`) : lecture mise en cache, comparaison par hachage SHA-256,
// conversion en Principal. Le secret n'est jamais stocké ni journalisé, seul son hachage l'est.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@fetrag/db'
import { roleSchema, type RoleName } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { loadPrincipal } from '@fetrag/auth'

export const API_KEYS_SETTING = 'api.keys'
export const API_KEY_PREFIX = 'fetrag_'
const CACHE_TTL_MS = 30_000

export const apiKeyRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** SHA-256 hexadécimal de la clé brute. */
  hash: z.string().regex(/^[a-f0-9]{64}$/i),
  /** Rôles globaux exercés par la clé (vide = tous les rôles de l'utilisateur lié). */
  scopes: z.array(z.string()).default([]),
  /** Utilisateur au nom duquel la clé agit (obligatoire pour les opérations d'écriture). */
  userId: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
  expiresAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
})
export type ApiKeyRecord = z.infer<typeof apiKeyRecordSchema>

let cache: { loadedAt: number; keys: ApiKeyRecord[] } | null = null

/** Vide le cache (tests, rotation de clé). */
export function resetApiKeyCache(): void {
  cache = null
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw.trim()).digest('hex')
}

/** Génère une clé brute (à remettre une seule fois) et son hachage à stocker. */
export function createApiKeyMaterial(): { raw: string; hash: string; id: string } {
  const raw = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`
  return { raw, hash: hashApiKey(raw), id: randomBytes(8).toString('hex') }
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const now = Date.now()
  if (cache && now - cache.loadedAt < CACHE_TTL_MS) return cache.keys
  let keys: ApiKeyRecord[] = []
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: API_KEYS_SETTING } })
    const parsed = z.array(apiKeyRecordSchema).safeParse(setting?.value ?? [])
    keys = parsed.success ? parsed.data : []
  } catch {
    keys = []
  }
  cache = { loadedAt: now, keys }
  return keys
}

function isActive(record: ApiKeyRecord, now = Date.now()): boolean {
  if (record.revokedAt) return false
  if (record.expiresAt && new Date(record.expiresAt).getTime() <= now) return false
  return true
}

function matches(record: ApiKeyRecord, hash: string): boolean {
  const a = Buffer.from(record.hash.toLowerCase(), 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

function scopedRoles(scopes: string[]): RoleName[] {
  return scopes.map((s) => roleSchema.safeParse(s)).flatMap((r) => (r.success ? [r.data] : []))
}

/** Principal représentant la clé : utilisateur lié (rôles restreints aux scopes) ou compte de service. */
export async function principalForApiKey(record: ApiKeyRecord): Promise<Principal | null> {
  const roles = scopedRoles(record.scopes)
  if (record.userId) {
    const user = await loadPrincipal(record.userId, true)
    if (!user) return null
    if (roles.length === 0) return user
    return { ...user, roles: user.roles.filter((r) => roles.includes(r.role)) }
  }
  return {
    id: `api-key:${record.id}`,
    email: `${record.id}@api-key.fetrag.ga`,
    name: record.name,
    roles: roles.map((role) => ({ role, scopeType: 'GLOBAL' as const, scopeId: null })),
    organizationIds: [],
    managedOrganizationIds: [],
    mfaVerified: true,
  }
}

export interface ResolvedApiKey {
  record: ApiKeyRecord
  principal: Principal
}

/** Recherche la clé brute parmi les clés actives ; `null` si inconnue, révoquée, expirée ou sans principal. */
export async function resolveApiKey(raw: string): Promise<ResolvedApiKey | null> {
  const trimmed = raw.trim()
  if (trimmed.length < 16 || trimmed.length > 256) return null
  const hash = hashApiKey(trimmed)
  const keys = await listApiKeys()
  const record = keys.find((k) => isActive(k) && matches(k, hash))
  if (!record) return null
  const principal = await principalForApiKey(record)
  return principal ? { record, principal } : null
}
