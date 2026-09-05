import 'server-only'
import { categories, resources, type CategoryWithCounts, type PublicResource } from '@fetrag/cms'
import type { accessLevels, resourceKinds, Paginated } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { safeQuery } from './safe'

export type ResourceKindName = (typeof resourceKinds)[number]
export type AccessLevelName = (typeof accessLevels)[number]

export interface ResourceFilters {
  page: number
  kind?: ResourceKindName
  categorySlug?: string
  accessLevel?: AccessLevelName
  q?: string
}

export interface ResourcesIndex {
  result: Paginated<PublicResource>
  categories: CategoryWithCounts[]
  /** Vrai si la lecture de la bibliothèque a échoué (base indisponible). */
  degraded: boolean
}

const PAGE_SIZE = 12

const emptyResult = (page: number): Paginated<PublicResource> => ({ items: [], page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 })

/**
 * Bibliothèque documentaire : ressources publiées visibles par le visiteur (niveau d'accès appliqué
 * par `resources.listPublished`) et catégories de ressources pour les filtres.
 */
export async function getResourcesIndex(filters: ResourceFilters, principal: Principal | null): Promise<ResourcesIndex> {
  const [result, cats] = await Promise.all([
    safeQuery(
      'resources.listPublished',
      () =>
        resources.listPublished(
          {
            page: filters.page,
            pageSize: PAGE_SIZE,
            kind: filters.kind,
            categorySlug: filters.categorySlug,
            accessLevel: filters.accessLevel,
            q: filters.q,
          },
          principal,
        ),
      null,
    ),
    safeQuery('categories.listActive(resource)', () => categories.listActive('resource'), []),
  ])
  return {
    result: result ?? emptyResult(filters.page),
    categories: cats.filter((c) => c.counts.resources > 0),
    degraded: result === null,
  }
}

/** Ressources du même type ou de la même catégorie, pour la fiche d'une ressource. */
export async function getRelatedResources(resource: PublicResource, principal: Principal | null, limit = 3): Promise<PublicResource[]> {
  const result = await safeQuery(
    'resources.related',
    () =>
      resources.listPublished(
        { page: 1, pageSize: limit + 1, ...(resource.category ? { categorySlug: resource.category.slug } : { kind: resource.kind }) },
        principal,
      ),
    null,
  )
  if (!result) return []
  return result.items.filter((item) => item.id !== resource.id).slice(0, limit)
}
