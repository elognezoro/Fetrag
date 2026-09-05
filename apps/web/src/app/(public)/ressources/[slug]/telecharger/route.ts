import { NextResponse, type NextRequest } from 'next/server'
import { resources } from '@fetrag/cms'
import { prisma } from '@fetrag/db'
import { isDomainError } from '@fetrag/domain'
import { checkRateLimit } from '@/lib/rate-limit'
import { requestContext } from '@/server/public/request-context'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const TEN_MINUTES = 10 * 60_000

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Téléchargement d'une ressource : `resources.download` vérifie le niveau d'accès du visiteur,
 * incrémente le compteur et renvoie l'URL (signée pour un fichier privé) vers laquelle on redirige.
 * Les refus sont renvoyés vers la fiche avec un motif (`?acces=`), jamais vers une page d'erreur brute.
 */
export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { slug } = await params
  const back = (path: string) => NextResponse.redirect(new URL(path, request.url), 303)
  if (!SLUG_PATTERN.test(slug) || slug.length > 120) return back('/ressources')

  const resourcePath = `/ressources/${slug}`
  const ctx = await requestContext()
  const limit = checkRateLimit(`download:${ctx.ipHash ?? 'anonymous'}`, 60, TEN_MINUTES)
  if (!limit.allowed) return back(`${resourcePath}?acces=limite`)

  const row = await prisma.resource.findFirst({ where: { slug, status: 'PUBLISHED' }, select: { id: true } })
  if (!row) return back('/ressources')

  const principal = await getViewer()
  try {
    const result = await resources.download(row.id, principal, { ip: ctx.ip, userAgent: ctx.userAgent })
    const target = new URL(result.url, request.url)
    return NextResponse.redirect(target, 302)
  } catch (error) {
    if (isDomainError(error)) {
      switch (error.code) {
        case 'UNAUTHENTICATED':
          return back(`/connexion?callbackUrl=${encodeURIComponent(`${resourcePath}/telecharger`)}`)
        case 'PAYMENT_REQUIRED':
          return back(`${resourcePath}?acces=paiement`)
        case 'FORBIDDEN':
          return back(`${resourcePath}?acces=refuse`)
        case 'PRECONDITION_FAILED':
          return back(`${resourcePath}?acces=fichier`)
        case 'NOT_FOUND':
          return back('/ressources')
        default:
          break
      }
    }
    console.error('[web:resources] téléchargement impossible', slug, error instanceof Error ? error.message : error)
    return back(`${resourcePath}?acces=erreur`)
  }
}
