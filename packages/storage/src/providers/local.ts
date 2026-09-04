import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getEnvSafe, resolvePublicUrl } from '@fetrag/config'
import { StorageNotFoundError } from '../errors'
import { normalizeKey, stripVisibility, visibilityOf, withVisibility } from '../keys'
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

const META_SUFFIX = '.meta.json'

const contentTypeByExtension: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  csv: 'text/csv; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  json: 'application/json',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

/** Type MIME déduit de l'extension quand aucun sidecar de métadonnées n'existe. */
export function contentTypeFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  return contentTypeByExtension[ext] ?? 'application/octet-stream'
}

/** Remonte l'arborescence depuis `cwd` jusqu'à la racine du monorepo (`pnpm-workspace.yaml`). */
export function findMonorepoRoot(start: string = process.cwd()): string {
  let current = path.resolve(start)
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  return path.resolve(start)
}

export interface LocalStorageOptions {
  /** Dossier racine (par défaut `<racine du monorepo>/.storage`). */
  rootDir?: string
  /** Base absolue des URL signées (par défaut `APP_WEB_URL`). */
  publicBaseUrl?: string
}

/**
 * Fournisseur de développement : fichiers sous `.storage/public` et `.storage/private`.
 * Les objets sont servis par la route applicative `GET /api/storage/[...key]` que chaque
 * application Next doit exposer (voir `serveStorageRequest`). Réservé au développement :
 * le système de fichiers n'est pas persistant sur Vercel.
 */
export class LocalStorageProvider implements ResolvableStorageProvider {
  readonly id = 'local' as const
  readonly rootDir: string
  private readonly baseUrl: string

  constructor(options: LocalStorageOptions = {}) {
    this.rootDir = options.rootDir ?? path.join(findMonorepoRoot(), '.storage')
    this.baseUrl = (options.publicBaseUrl ?? resolvePublicUrl('web')).replace(/\/+$/, '')
    if (getEnvSafe().NODE_ENV === 'production') {
      console.warn('[storage] Le fournisseur local est utilisé en production : les fichiers ne sont pas durables.')
    }
  }

  /** Chemin disque absolu d'une clé, confiné dans `rootDir`. */
  private pathFor(key: string): string {
    const resolved = path.resolve(this.rootDir, ...key.split('/'))
    const root = path.resolve(this.rootDir)
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      throw new StorageNotFoundError(key)
    }
    return resolved
  }

  async put(key: string, data: StorageBody, options: PutOptions): Promise<PutResult> {
    const fullKey = withVisibility(key, options.visibility)
    const target = this.pathFor(fullKey)
    await mkdir(path.dirname(target), { recursive: true })
    const body = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data)
    await writeFile(target, body)
    await writeFile(
      `${target}${META_SUFFIX}`,
      JSON.stringify({ contentType: options.contentType, size: body.byteLength, uploadedAt: new Date().toISOString() }),
      'utf8',
    )
    return { key: fullKey, url: storageRoutePath(fullKey) }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const fullKey = normalizeKey(key)
    const route = `${this.baseUrl}${storageRoutePath(fullKey)}`
    if (visibilityOf(fullKey) === 'PUBLIC') return route
    return signUrl(route, options.expiresInSeconds ?? 900)
  }

  async delete(key: string): Promise<void> {
    const fullKey = normalizeKey(key)
    const target = this.pathFor(fullKey)
    await rm(target, { force: true })
    await rm(`${target}${META_SUFFIX}`, { force: true })
  }

  async list(prefix: string): Promise<StoredObject[]> {
    const normalized = prefix ? normalizeKey(prefix) : ''
    const prefixes =
      normalized && visibilityOf(normalized)
        ? [normalized]
        : [`public/${stripVisibility(normalized)}`, `private/${stripVisibility(normalized)}`].map((p) =>
            p.replace(/\/$/, ''),
          )
    const results: StoredObject[] = []
    for (const p of prefixes) {
      const dir = this.pathFor(p)
      if (!existsSync(dir)) {
        // Le préfixe peut désigner un début de nom de fichier : on parcourt le dossier parent.
        const parent = path.dirname(dir)
        if (!existsSync(parent)) continue
        await this.walk(parent, results, (k) => k.startsWith(p))
        continue
      }
      await this.walk(dir, results, () => true)
    }
    return results
  }

  private async walk(dir: string, out: StoredObject[], accept: (key: string) => boolean): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await this.walk(full, out, accept)
        continue
      }
      if (!entry.isFile() || entry.name.endsWith(META_SUFFIX)) continue
      const key = path.relative(this.rootDir, full).split(path.sep).join('/')
      if (!accept(key)) continue
      const info = await stat(full)
      out.push({ key, size: info.size, url: storageRoutePath(key), uploadedAt: info.mtime })
    }
  }

  /** Lecture directe (utilisée par la route applicative et les tests). */
  async read(key: string): Promise<{ data: Buffer; contentType: string }> {
    const fullKey = normalizeKey(key)
    const target = this.pathFor(fullKey)
    if (!existsSync(target)) throw new StorageNotFoundError(fullKey)
    const data = await readFile(target)
    return { data, contentType: await this.contentTypeOf(target, fullKey) }
  }

  private async contentTypeOf(target: string, key: string): Promise<string> {
    try {
      const meta = JSON.parse(await readFile(`${target}${META_SUFFIX}`, 'utf8')) as { contentType?: unknown }
      if (typeof meta.contentType === 'string' && meta.contentType) return meta.contentType
    } catch {
      // pas de sidecar : type déduit de l'extension
    }
    return contentTypeFromKey(key)
  }

  async resolve(key: string): Promise<StorageResolution | null> {
    const fullKey = normalizeKey(key)
    const target = this.pathFor(fullKey)
    if (!existsSync(target)) return null
    return { kind: 'file', path: target, contentType: await this.contentTypeOf(target, fullKey) }
  }
}
