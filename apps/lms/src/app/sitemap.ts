import type { MetadataRoute } from 'next'
import { resolvePublicUrl } from '@fetrag/config'

export const revalidate = 3600

/**
 * Plan de site de la plateforme : accueil, catalogue et fiches de cours publiées.
 * L'accès à la base est protégé : en cas d'indisponibilité, seules les routes statiques sont renvoyées.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolvePublicUrl('lms')
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/catalogue`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ]

  try {
    const { prisma } = await import('@fetrag/db')
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { position: 'asc' },
      take: 500,
    })
    for (const course of courses) {
      entries.push({ url: `${base}/cours/${course.slug}`, lastModified: course.updatedAt, changeFrequency: 'monthly', priority: 0.8 })
    }
  } catch (error) {
    console.warn('[sitemap] fiches de cours indisponibles :', error instanceof Error ? error.message : error)
  }

  return entries
}
