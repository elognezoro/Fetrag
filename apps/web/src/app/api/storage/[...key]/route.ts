import { serveStorageRequest } from '@fetrag/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Sert les objets du stockage pour le fournisseur local (`.storage/public`, `.storage/private`) et relaie les objets
 * privés des fournisseurs distants. Les clés `private/...` exigent une URL signée (`exp` + `sig`, vérifiée par
 * `verifySignedUrl` via `serveStorageRequest`) ; les clés `public/...` sont servies avec un cache long.
 */
export async function GET(request: Request): Promise<Response> {
  const result = await serveStorageRequest(request.url)
  if (result.status === 200) {
    return new Response(new Uint8Array(result.body), { status: 200, headers: result.headers })
  }
  if (result.status === 302) {
    return new Response(null, { status: 302, headers: { ...result.headers, Location: result.location } })
  }
  return new Response(result.message, {
    status: result.status,
    headers: { ...result.headers, 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

/** Les vérifications d'existence (HEAD) renvoient les mêmes en-têtes sans le corps. */
export async function HEAD(request: Request): Promise<Response> {
  const result = await serveStorageRequest(request.url)
  if (result.status === 200) return new Response(null, { status: 200, headers: result.headers })
  if (result.status === 302) return new Response(null, { status: 302, headers: { ...result.headers, Location: result.location } })
  return new Response(null, { status: result.status, headers: result.headers })
}
