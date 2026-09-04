import { NextResponse } from 'next/server'
import { edgeAuth } from '@fetrag/auth/edge'

/** Préfixes réservés aux utilisateurs connectés (site institutionnel). */
const PROTECTED_PREFIXES = ['/espace', '/admin', '/paiement'] as const

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/**
 * Middleware Edge : vérifie la présence d'une session Auth.js sur les zones privées
 * et redirige vers /connexion?callbackUrl=... sinon. Les contrôles de rôle et de portée
 * restent effectués côté serveur par les gardes (`requireRole`, `requireCan`).
 */
export default edgeAuth((request) => {
  const { pathname, search } = request.nextUrl
  if (!isProtectedPath(pathname)) return NextResponse.next()
  if (request.auth?.user?.id) return NextResponse.next()

  const loginUrl = new URL('/connexion', request.nextUrl.origin)
  loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|brand/|favicon|icon-|apple-touch-icon|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|txt|xml|json|woff2?|ttf)$).*)',
  ],
}
