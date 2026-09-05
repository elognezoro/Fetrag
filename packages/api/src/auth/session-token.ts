// Décodage local du cookie de session Auth.js (JWE « dir » + A256CBC-HS512 / A256GCM).
//
// Pourquoi un helper local : `next-auth/jwt` n'est pas une dépendance déclarée de @fetrag/api
// (node-linker isolé, `pnpm add` interdit dans ce lot). Ce module reproduit fidèlement
// `decode()` / `getToken()` de @auth/core/jwt : clé dérivée par HKDF-SHA256 avec pour salt
// le nom du cookie, tolérance d'horloge de 15 s, prise en charge des cookies découpés
// (`nom.0`, `nom.1`, ...). Il ne dépend que de `node:crypto`.
import { createDecipheriv, createHmac, hkdfSync, timingSafeEqual } from 'node:crypto'

/** Charge utile minimale d'un JWT de session Auth.js. */
export interface SessionTokenPayload extends Record<string, unknown> {
  sub?: string
  email?: string | null
  name?: string | null
  picture?: string | null
  mfaVerified?: boolean
  app?: string
  iat?: number
  exp?: number
  jti?: string
}

export interface DecodeSessionTokenParams {
  token: string
  secret: string | string[]
  salt: string
  /** Tolérance d'expiration (secondes), 15 par défaut comme Auth.js. */
  clockTolerance?: number
  now?: () => number
}

export interface ReadSessionTokenParams {
  headers: Headers
  cookieName: string
  secret: string | string[] | undefined
  /** Salt HKDF ; Auth.js utilise le nom du cookie. */
  salt?: string
  now?: () => number
}

const CLOCK_TOLERANCE_SECONDS = 15

function base64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url')
}

function deriveKey(enc: string, secret: string, salt: string): Buffer {
  const length = enc === 'A256CBC-HS512' ? 64 : enc === 'A256GCM' ? 32 : 0
  if (length === 0) throw new Error(`Algorithme de chiffrement non pris en charge : ${enc}`)
  const info = `Auth.js Generated Encryption Key (${salt})`
  return Buffer.from(hkdfSync('sha256', secret, salt, info, length))
}

function decryptCbcHs512(key: Buffer, aad: Buffer, iv: Buffer, ciphertext: Buffer, tag: Buffer): Buffer {
  const macKey = key.subarray(0, 32)
  const encKey = key.subarray(32, 64)
  const al = Buffer.alloc(8)
  al.writeBigUInt64BE(BigInt(aad.length * 8))
  const expected = createHmac('sha512', macKey).update(Buffer.concat([aad, iv, ciphertext, al])).digest().subarray(0, 32)
  if (tag.length !== expected.length || !timingSafeEqual(tag, expected)) throw new Error('Signature du jeton invalide')
  const decipher = createDecipheriv('aes-256-cbc', encKey, iv)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

function decryptGcm(key: Buffer, aad: Buffer, iv: Buffer, ciphertext: Buffer, tag: Buffer): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAAD(aad)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

/**
 * Déchiffre un JWE compact émis par Auth.js et vérifie son expiration.
 * Lève une erreur si le jeton est malformé, altéré ou expiré ; renvoie la charge utile sinon.
 */
export function decodeSessionToken(params: DecodeSessionTokenParams): SessionTokenPayload {
  const parts = params.token.split('.')
  if (parts.length !== 5) throw new Error('Jeton JWE malformé')
  const [protectedHeader, encryptedKey, ivPart, ciphertextPart, tagPart] = parts as [string, string, string, string, string]
  if (encryptedKey.length > 0) throw new Error('Gestion de clé non prise en charge')

  const header = JSON.parse(base64urlDecode(protectedHeader).toString('utf8')) as { alg?: string; enc?: string; zip?: string }
  if (header.alg !== 'dir') throw new Error(`Algorithme de clé non pris en charge : ${header.alg ?? '?'}`)
  if (header.zip) throw new Error('Compression JWE non prise en charge')
  const enc = header.enc ?? ''
  const aad = Buffer.from(protectedHeader, 'ascii')
  const iv = base64urlDecode(ivPart)
  const ciphertext = base64urlDecode(ciphertextPart)
  const tag = base64urlDecode(tagPart)

  const secrets = Array.isArray(params.secret) ? params.secret : [params.secret]
  let plaintext: Buffer | null = null
  let lastError: unknown = null
  for (const secret of secrets) {
    try {
      const key = deriveKey(enc, secret, params.salt)
      plaintext = enc === 'A256GCM' ? decryptGcm(key, aad, iv, ciphertext, tag) : decryptCbcHs512(key, aad, iv, ciphertext, tag)
      break
    } catch (error) {
      lastError = error
    }
  }
  if (!plaintext) throw lastError instanceof Error ? lastError : new Error('Aucun secret ne permet de déchiffrer le jeton')

  const payload = JSON.parse(plaintext.toString('utf8')) as SessionTokenPayload
  const now = Math.floor((params.now ?? Date.now)() / 1000)
  const tolerance = params.clockTolerance ?? CLOCK_TOLERANCE_SECONDS
  if (typeof payload.exp === 'number' && payload.exp + tolerance <= now) throw new Error('Jeton expiré')
  if (typeof payload.nbf === 'number' && payload.nbf - tolerance > now) throw new Error('Jeton pas encore valide')
  return payload
}

/** Analyse l'en-tête Cookie (sans dépendance) en respectant l'encodage des valeurs. */
export function parseCookieHeader(header: string | null | undefined): Map<string, string> {
  const out = new Map<string, string>()
  if (!header) return out
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const name = part.slice(0, index).trim()
    if (!name) continue
    let value = part.slice(index + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    try {
      value = decodeURIComponent(value)
    } catch {
      // valeur non encodée : conservée telle quelle
    }
    if (!out.has(name)) out.set(name, value)
  }
  return out
}

/** Reconstitue la valeur d'un cookie éventuellement découpé (`nom`, `nom.0`, `nom.1`, ...). */
export function readCookieValue(cookies: Map<string, string>, name: string): string | null {
  const direct = cookies.get(name)
  if (direct) return direct
  const chunks: Array<[number, string]> = []
  for (const [key, value] of cookies) {
    if (!key.startsWith(`${name}.`)) continue
    const index = Number(key.slice(name.length + 1))
    if (Number.isInteger(index)) chunks.push([index, value])
  }
  if (chunks.length === 0) return null
  return chunks
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value)
    .join('')
}

/**
 * Équivalent de `getToken()` : lit le cookie de session (ou `Authorization: Bearer`),
 * le déchiffre avec `secret` + `salt` et renvoie la charge utile, ou `null` en cas d'échec.
 */
export function readSessionToken(params: ReadSessionTokenParams): SessionTokenPayload | null {
  const cookies = parseCookieHeader(params.headers.get('cookie'))
  let token = readCookieValue(cookies, params.cookieName)
  if (!token) {
    const authorization = params.headers.get('authorization')
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
      try {
        token = decodeURIComponent(authorization.split(' ')[1] ?? '')
      } catch {
        return null
      }
    }
  }
  if (!token || !params.secret) return null
  try {
    return decodeSessionToken({ token, secret: params.secret, salt: params.salt ?? params.cookieName, now: params.now })
  } catch {
    return null
  }
}
