import { createHmac, timingSafeEqual } from 'node:crypto'
import { getEnvSafe } from '@fetrag/config'
import { StorageConfigurationError } from './errors'

/** Paramètres de requête réservés à la signature. */
export const SIGNATURE_PARAM = 'sig'
export const EXPIRES_PARAM = 'exp'

const DUMMY_BASE = 'http://fetrag.local'

export type SignedUrlVerification =
  | { valid: true; expiresAt: Date; pathname: string }
  | { valid: false; reason: 'missing' | 'expired' | 'invalid' | 'malformed'; pathname: string | null }

function signingSecret(): string {
  const secret = getEnvSafe().AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new StorageConfigurationError('AUTH_SECRET est requis pour signer les URL de stockage')
  }
  return secret
}

/** Chaîne canonique signée : chemin + paramètres triés (hors signature). */
function canonicalString(url: URL): string {
  const params = [...url.searchParams.entries()]
    .filter(([k]) => k !== SIGNATURE_PARAM)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return `${url.pathname}?${params}`
}

function computeSignature(canonical: string, secret: string): string {
  return createHmac('sha256', secret).update(canonical).digest('base64url')
}

function parseUrl(input: string): { url: URL; relative: boolean } {
  const relative = input.startsWith('/')
  return { url: new URL(input, relative ? DUMMY_BASE : undefined), relative }
}

function serialize(url: URL, relative: boolean): string {
  return relative ? `${url.pathname}${url.search}` : url.toString()
}

/**
 * Signe une URL (absolue ou relative) : ajoute `exp` (timestamp UNIX) et `sig` (HMAC-SHA256, AUTH_SECRET).
 * La signature couvre le chemin et les paramètres, pas l'hôte : les deux applications peuvent vérifier.
 */
export function signUrl(input: string, expiresInSeconds = 900, now: Date = new Date()): string {
  const { url, relative } = parseUrl(input)
  const ttl = Math.max(1, Math.floor(expiresInSeconds))
  const exp = Math.floor(now.getTime() / 1000) + ttl
  url.searchParams.delete(SIGNATURE_PARAM)
  url.searchParams.set(EXPIRES_PARAM, String(exp))
  url.searchParams.set(SIGNATURE_PARAM, computeSignature(canonicalString(url), signingSecret()))
  return serialize(url, relative)
}

/** Vérifie la signature et l'expiration d'une URL produite par `signUrl`. */
export function verifySignedUrl(input: string, now: Date = new Date()): SignedUrlVerification {
  let url: URL
  try {
    url = parseUrl(input).url
  } catch {
    return { valid: false, reason: 'malformed', pathname: null }
  }
  const sig = url.searchParams.get(SIGNATURE_PARAM)
  const expRaw = url.searchParams.get(EXPIRES_PARAM)
  if (!sig || !expRaw) return { valid: false, reason: 'missing', pathname: url.pathname }
  const exp = Number(expRaw)
  if (!Number.isFinite(exp)) return { valid: false, reason: 'malformed', pathname: url.pathname }

  const expected = computeSignature(canonicalString(url), signingSecret())
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: 'invalid', pathname: url.pathname }
  }
  if (exp * 1000 < now.getTime()) return { valid: false, reason: 'expired', pathname: url.pathname }
  return { valid: true, expiresAt: new Date(exp * 1000), pathname: url.pathname }
}

/** Chemin de la route applicative servant les objets (à exposer par chaque app Next). */
export const STORAGE_ROUTE_PREFIX = '/api/storage/'

/** Chemin (relatif) de la route applicative pour une clé. */
export function storageRoutePath(key: string): string {
  return `${STORAGE_ROUTE_PREFIX}${key.split('/').map(encodeURIComponent).join('/')}`
}

/** Extrait la clé d'une URL de route applicative, ou `null` si le chemin ne correspond pas. */
export function keyFromRoutePath(pathname: string): string | null {
  if (!pathname.startsWith(STORAGE_ROUTE_PREFIX)) return null
  const raw = pathname.slice(STORAGE_ROUTE_PREFIX.length)
  if (!raw) return null
  try {
    return raw.split('/').map(decodeURIComponent).join('/')
  } catch {
    return null
  }
}
