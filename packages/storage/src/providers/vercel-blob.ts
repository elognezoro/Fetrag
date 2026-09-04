import { randomBytes } from 'node:crypto'
import { del, list, put } from '@vercel/blob'
import { getEnvSafe, resolvePublicUrl } from '@fetrag/config'
import { StorageConfigurationError } from '../errors'
import { normalizeKey, stripVisibility, visibilityOf } from '../keys'
import { signUrl, storageRoutePath } from '../signing'
import type {
  PutOptions,
  PutResult,
  ResolvableStorageProvider,
  SignedUrlOptions,
  StorageBody,
  StorageResolution,
  StoredObject,
} from '../types'

export interface VercelBlobOptions {
  token?: string
  /** Base absolue des URL signées (par défaut `APP_WEB_URL`). */
  publicBaseUrl?: string
}

/**
 * Fournisseur Vercel Blob (ADR-003).
 *
 * Vercel Blob ne propose qu'un accès `public`. Politique retenue :
 * - PUBLIC  : clé `public/<clé>` servie directement par l'URL du blob.
 * - PRIVATE : clé `private/<jeton aléatoire 32 hex>/<clé>` (non devinable), stockée en `public`.
 *   L'accès passe par la route applicative `/api/storage/<clé>?exp=...&sig=...` signée HMAC (AUTH_SECRET)
 *   et vérifiée côté app (`serveStorageRequest`), qui relaie le contenu sans exposer l'URL du blob.
 */
export class VercelBlobProvider implements ResolvableStorageProvider {
  readonly id = 'vercel-blob' as const
  private readonly token: string
  private readonly baseUrl: string

  constructor(options: VercelBlobOptions = {}) {
    const token = options.token ?? getEnvSafe().BLOB_READ_WRITE_TOKEN
    if (!token) throw new StorageConfigurationError('BLOB_READ_WRITE_TOKEN est requis pour le fournisseur vercel-blob')
    this.token = token
    this.baseUrl = (options.publicBaseUrl ?? resolvePublicUrl('web')).replace(/\/+$/, '')
  }

  async put(key: string, data: StorageBody, options: PutOptions): Promise<PutResult> {
    const bare = stripVisibility(normalizeKey(key))
    const fullKey =
      options.visibility === 'PUBLIC' ? `public/${bare}` : `private/${randomBytes(16).toString('hex')}/${bare}`
    const body = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data)
    const result = await put(fullKey, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: options.contentType,
      cacheControlMaxAge: options.visibility === 'PUBLIC' ? options.cacheControlMaxAge : 60,
      token: this.token,
    })
    return {
      key: fullKey,
      url: options.visibility === 'PUBLIC' ? result.url : storageRoutePath(fullKey),
    }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const fullKey = normalizeKey(key)
    if (visibilityOf(fullKey) === 'PUBLIC') {
      const blob = await this.find(fullKey)
      if (blob) return blob.url
    }
    return signUrl(`${this.baseUrl}${storageRoutePath(fullKey)}`, options.expiresInSeconds ?? 900)
  }

  async delete(key: string): Promise<void> {
    const fullKey = normalizeKey(key)
    const blob = await this.find(fullKey)
    if (!blob) return
    await del(blob.url, { token: this.token })
  }

  async list(prefix: string): Promise<StoredObject[]> {
    const normalized = prefix ? normalizeKey(prefix) : ''
    const prefixes =
      normalized && visibilityOf(normalized) ? [normalized] : [`public/${normalized}`, `private/${normalized}`]
    const out: StoredObject[] = []
    for (const p of prefixes) {
      let cursor: string | undefined
      do {
        const page = await list({ prefix: p.replace(/^\/+/, ''), token: this.token, cursor, limit: 1000 })
        for (const blob of page.blobs) {
          out.push({ key: blob.pathname, size: blob.size, url: blob.url, uploadedAt: blob.uploadedAt })
        }
        cursor = page.hasMore ? page.cursor : undefined
      } while (cursor)
    }
    return out
  }

  /** Retrouve un blob exact à partir de sa clé (le SDK travaille par URL). */
  private async find(fullKey: string): Promise<{ url: string; size: number } | null> {
    const page = await list({ prefix: fullKey, token: this.token, limit: 10 })
    const exact = page.blobs.find((b) => b.pathname === fullKey)
    return exact ? { url: exact.url, size: exact.size } : null
  }

  async resolve(key: string): Promise<StorageResolution | null> {
    const fullKey = normalizeKey(key)
    const blob = await this.find(fullKey)
    if (!blob) return null
    return { kind: 'url', url: blob.url, stream: visibilityOf(fullKey) !== 'PUBLIC' }
  }
}
