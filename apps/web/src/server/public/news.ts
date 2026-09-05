import 'server-only'
import { articles, categories, type ArticleCard, type CategoryWithCounts } from '@fetrag/cms'
import type { Paginated } from '@fetrag/contracts'
import { safeQuery } from './safe'

export interface NewsFilters {
  page: number
  categorySlug?: string
  tag?: string
  q?: string
  communique?: boolean
}

export interface NewsIndex {
  result: Paginated<ArticleCard>
  categories: CategoryWithCounts[]
  tags: Array<{ tag: string; count: number }>
  /** Vrai si la lecture des actualités a échoué (base indisponible). */
  degraded: boolean
}

const PAGE_SIZE = 12

const emptyResult = (page: number): Paginated<ArticleCard> => ({ items: [], page, pageSize: PAGE_SIZE, total: 0, totalPages: 0 })

/** Index des actualités : page paginée, catégories d'articles et tags les plus utilisés. */
export async function getNewsIndex(filters: NewsFilters): Promise<NewsIndex> {
  const [result, cats, tags] = await Promise.all([
    safeQuery(
      'articles.listPublished',
      () =>
        articles.listPublished({
          page: filters.page,
          pageSize: PAGE_SIZE,
          categorySlug: filters.categorySlug,
          tag: filters.tag,
          q: filters.q,
          communique: filters.communique ? true : undefined,
        }),
      null,
    ),
    safeQuery('categories.listActive', () => categories.listActive('article'), []),
    safeQuery('articles.listTags', () => articles.listTags(12), []),
  ])
  return {
    result: result ?? emptyResult(filters.page),
    categories: cats.filter((c) => c.counts.articles > 0),
    tags,
    degraded: result === null,
  }
}
