import { serveStorageRequest } from '@fetrag/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Sert les objets du stockage (fournisseur local et objets privés relayés).
 * Les clés `private/...` exigent une URL signée (`exp` + `sig`) produite par `getStorage().getSignedUrl`.
 */
export async function GET(request: Request): Promise<Response> {
  const result = await serveStorageRequest(request.url)
  if (result.status === 200) {
    // Copie dans un tampon dédié : `BodyInit` exige un Uint8Array adossé à un ArrayBuffer (pas SharedArrayBuffer).
    const body = new Uint8Array(result.body)
    return new Response(body, { status: 200, headers: result.headers })
  }
  if (result.status === 302) {
    return new Response(null, { status: 302, headers: { ...result.headers, Location: result.location } })
  }
  return new Response(result.message, { status: result.status, headers: { ...result.headers, 'Content-Type': 'text/plain; charset=utf-8' } })
}
