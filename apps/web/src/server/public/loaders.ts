import 'server-only'
import { cache } from 'react'
import { articles, events, pages, resources, services } from '@fetrag/cms'
import { catalog } from '@fetrag/lms-core'
import { isDomainError, type Principal } from '@fetrag/domain'

/**
 * Chargeurs mémoïsés par requête (React `cache`) : `generateMetadata` et la page partagent
 * la même lecture, ce qui évite un double incrément des compteurs de vues.
 */

export const loadArticle = cache(async (slug: string) => articles.getPublished(slug))

export const loadPage = cache(async (slug: string) => pages.getPublished(slug))

export const loadService = cache(async (slug: string) => services.getPublished(slug))

export const loadEvent = cache(async (slug: string, principal: Principal | null) => events.getPublished(slug, principal))

export const loadResource = cache(async (slug: string, principal: Principal | null) => resources.getPublished(slug, principal))

export type CourseDetail = Awaited<ReturnType<typeof catalog.getPublished>>

/** Fiche formation publiée ; `null` si absente (l'erreur NOT_FOUND du domaine est absorbée). */
export const loadCourse = cache(async (slug: string): Promise<CourseDetail | null> => {
  try {
    return await catalog.getPublished(slug)
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return null
    throw error
  }
})
