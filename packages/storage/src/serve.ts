import { readFile } from 'node:fs/promises'
import { getStorage } from './registry'
import { displayNameFromKey, normalizeKey, visibilityOf } from './keys'
import { keyFromRoutePath, verifySignedUrl } from './signing'
import type { ResolvableStorageProvider, StorageProvider } from './types'

export type StorageServeResult =
  | { status: 200; body: Uint8Array; headers: Record<string, string> }
  | { status: 302; location: string; headers: Record<string, string> }
  | { status: 400 | 403 | 404 | 502; message: string; headers: Record<string, string> }

function isResolvable(provider: StorageProvider): provider is ResolvableStorageProvider {
  return typeof (provider as Partial<ResolvableStorageProvider>).resolve === 'function'
}

function contentDisposition(key: string, download: boolean): string {
  const name = displayNameFromKey(key).replace(/["\\]/g, '')
  return `${download ? 'attachment' : 'inline'}; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`
}

/**
 * Sert un objet pour la route applicative `GET /api/storage/[...key]` (à créer par le lot shells) :
 *
 * ```ts
 * export async function GET(req: Request) {
 *   const r = await serveStorageRequest(req.url)
 *   if (r.status === 200) return new Response(r.body, { status: 200, headers: r.headers })
 *   if (r.status === 302) return Response.redirect(r.location, 302)
 *   return new Response(r.message, { status: r.status, headers: r.headers })
 * }
 * ```
 *
 * Les clés `private/...` exigent une URL signée valide (`exp` + `sig`) ; les clés `public/...` sont servies telles quelles.
 */
export async function serveStorageRequest(requestUrl: string): Promise<StorageServeResult> {
  const baseHeaders: Record<string, string> = { 'X-Content-Type-Options': 'nosniff' }
  let url: URL
  try {
    url = new URL(requestUrl, 'http://fetrag.local')
  } catch {
    return { status: 400, message: 'URL invalide', headers: baseHeaders }
  }
  const rawKey = keyFromRoutePath(url.pathname)
  if (!rawKey) return { status: 404, message: 'Objet introuvable', headers: baseHeaders }

  let key: string
  try {
    key = normalizeKey(rawKey)
  } catch {
    return { status: 400, message: 'Clé invalide', headers: baseHeaders }
  }

  const visibility = visibilityOf(key)
  if (visibility !== 'PUBLIC') {
    const verification = verifySignedUrl(requestUrl)
    if (!verification.valid) {
      return { status: 403, message: 'Lien invalide ou expiré', headers: { ...baseHeaders, 'Cache-Control': 'no-store' } }
    }
  }

  const provider = getStorage()
  if (!isResolvable(provider)) {
    return { status: 404, message: 'Objet introuvable', headers: baseHeaders }
  }
  const resolution = await provider.resolve(key)
  if (!resolution) return { status: 404, message: 'Objet introuvable', headers: baseHeaders }

  const download = url.searchParams.get('download') === '1'
  const cacheControl = visibility === 'PUBLIC' ? 'public, max-age=86400, immutable' : 'private, no-store'

  if (resolution.kind === 'file') {
    const body = await readFile(resolution.path)
    return {
      status: 200,
      body: new Uint8Array(body),
      headers: {
        ...baseHeaders,
        'Content-Type': resolution.contentType,
        'Content-Length': String(body.byteLength),
        'Content-Disposition': contentDisposition(key, download),
        'Cache-Control': cacheControl,
      },
    }
  }

  if (!resolution.stream) {
    return { status: 302, location: resolution.url, headers: { ...baseHeaders, 'Cache-Control': cacheControl } }
  }

  const upstream = await fetch(resolution.url)
  if (!upstream.ok) return { status: 502, message: 'Stockage indisponible', headers: baseHeaders }
  const buffer = new Uint8Array(await upstream.arrayBuffer())
  return {
    status: 200,
    body: buffer,
    headers: {
      ...baseHeaders,
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Length': String(buffer.byteLength),
      'Content-Disposition': contentDisposition(key, download),
      'Cache-Control': cacheControl,
    },
  }
}
