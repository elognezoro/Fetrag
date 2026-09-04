import type { MetadataRoute } from 'next'
import { resolvePublicUrl } from '@fetrag/config'

export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

/** Routes publiques statiques du site institutionnel (chapitre 38 du CDC). */
const staticRoutes: Array<{ path: string; priority: number; changeFrequency: Entry['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/la-fetrag', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/organisations', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/actualites', priority: 0.9, changeFrequency: 'daily' },
  { path: '/ressources', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/formations', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/evenements', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/adhesion', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/partenariat', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/recherche', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/certificats/verifier', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/mentions-legales', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.2, changeFrequency: 'yearly' },
]

interface SlugRow {
  slug: string
  updatedAt: Date
}

/**
 * Plan de site : routes statiques + contenus publiés (articles, pages, formations, services, événements).
 * L'accès à la base est protégé : en cas d'indisponibilité, seules les routes statiques sont renvoyées.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolvePublicUrl('web')
  const now = new Date()
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const { prisma } = await import('@fetrag/db')
    const select = { slug: true, updatedAt: true } as const
    const [articles, pages, courses, services, events] = await Promise.all([
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, select, orderBy: { publishedAt: 'desc' }, take: 2000 }),
      prisma.page.findMany({ where: { status: 'PUBLISHED', showInSitemap: true }, select, take: 500 }),
      prisma.course.findMany({ where: { status: 'PUBLISHED' }, select, take: 500 }),
      prisma.service.findMany({ where: { status: 'PUBLISHED' }, select, take: 500 }),
      prisma.event.findMany({ where: { status: 'PUBLISHED' }, select, orderBy: { startsAt: 'desc' }, take: 1000 }),
    ])

    const push = (rows: SlugRow[], prefix: string, priority: number, changeFrequency: Entry['changeFrequency']) => {
      for (const row of rows) {
        entries.push({ url: `${base}${prefix}/${row.slug}`, lastModified: row.updatedAt, changeFrequency, priority })
      }
    }
    push(articles, '/actualites', 0.7, 'monthly')
    push(pages, '', 0.6, 'monthly')
    push(courses, '/formations', 0.8, 'monthly')
    push(services, '/services', 0.7, 'monthly')
    push(events, '/evenements', 0.6, 'weekly')
  } catch (error) {
    console.warn('[sitemap] contenus dynamiques indisponibles :', error instanceof Error ? error.message : error)
  }

  return entries
}
