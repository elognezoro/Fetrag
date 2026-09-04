import { NextResponse } from 'next/server'
import { edgeAuth } from '@fetrag/auth/edge'

/** Chemins publics exacts de la plateforme de formation. */
const PUBLIC_EXACT = new Set<string>([
  '/',
  '/catalogue',
  '/cours',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/deconnexion',
  '/acces-refuse',
  '/manifest.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
])

/** Préfixes publics (fiches de cours, routes techniques, assets). */
const PUBLIC_PREFIXES = ['/catalogue/', '/cours/', '/connexion/', '/api/', '/_next/', '/brand/'] as const

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Middleware Edge : tout le LMS est réservé aux utilisateurs connectés, sauf l'accueil,
 * le catalogue, les fiches de cours et les écrans d'authentification.
 * Les contrôles de rôle et de portée restent effectués côté serveur par les gardes.
 */
export default edgeAuth((request) => {
  const { pathname, search } = request.nextUrl
  if (isPublicPath(pathname)) return NextResponse.next()
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
