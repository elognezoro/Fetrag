import { NextResponse, type NextRequest } from 'next/server'
import { newsletter } from '@fetrag/cms'
import { isDomainError } from '@fetrag/domain'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function redirectTo(request: NextRequest, state: string): NextResponse {
  const url = new URL('/', request.nextUrl.origin)
  url.searchParams.set('newsletter', state)
  url.hash = 'newsletter'
  return NextResponse.redirect(url, { status: 303 })
}

function clientContext(request: NextRequest): { ip: string | null; userAgent: string | null } {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
  return { ip, userAgent: request.headers.get('user-agent') }
}

async function handle(request: NextRequest, token: string): Promise<NextResponse> {
  if (!TOKEN_PATTERN.test(token)) return redirectTo(request, 'lien-invalide')
  try {
    await newsletter.unsubscribe(token, clientContext(request))
    return redirectTo(request, 'desinscrite')
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return redirectTo(request, 'lien-invalide')
    console.error('[newsletter] désinscription impossible', error instanceof Error ? error.message : error)
    return redirectTo(request, 'erreur')
  }
}

/** Désinscription par lien (présent dans chaque envoi) : `/newsletter/desinscrire?token=...`. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request, request.nextUrl.searchParams.get('token')?.trim() ?? '')
}

/** Variante « List-Unsubscribe-Post » (RFC 8058) : les clients mail envoient un POST sur le même lien. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request, request.nextUrl.searchParams.get('token')?.trim() ?? '')
}
