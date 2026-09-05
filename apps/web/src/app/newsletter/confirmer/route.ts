import { NextResponse, type NextRequest } from 'next/server'
import { newsletter } from '@fetrag/cms'
import { isDomainError } from '@fetrag/domain'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Jeton UUID émis à l'inscription (colonne `NewsletterSubscription.token`). */
const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function redirectTo(request: NextRequest, state: string): NextResponse {
  const url = new URL('/', request.nextUrl.origin)
  url.searchParams.set('newsletter', state)
  url.hash = 'newsletter'
  return NextResponse.redirect(url, { status: 303 })
}

/**
 * Confirmation d'abonnement à la lettre d'information (double opt-in) : `/newsletter/confirmer?token=...`.
 * Redirige vers l'accueil avec un indicateur d'état (`confirmee`, `deja-confirmee`, `lien-invalide`).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token')?.trim() ?? ''
  if (!TOKEN_PATTERN.test(token)) return redirectTo(request, 'lien-invalide')
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
    const result = await newsletter.confirm(token, { ip, userAgent: request.headers.get('user-agent') })
    return redirectTo(request, result.alreadyConfirmed ? 'deja-confirmee' : 'confirmee')
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return redirectTo(request, 'lien-invalide')
    console.error('[newsletter] confirmation impossible', error instanceof Error ? error.message : error)
    return redirectTo(request, 'erreur')
  }
}
