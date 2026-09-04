import type { Paginated, PaginationQuery } from '@fetrag/contracts'

export function paginationArgs(q: Pick<PaginationQuery, 'page' | 'pageSize'>): { skip: number; take: number } {
  return { skip: (q.page - 1) * q.pageSize, take: q.pageSize }
}

export function toPaginated<T>(items: T[], total: number, q: Pick<PaginationQuery, 'page' | 'pageSize'>): Paginated<T> {
  return {
    items,
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  }
}

/** Tri whitelisté : renvoie un orderBy Prisma sûr ou la valeur par défaut. */
export function safeOrderBy<T extends string>(
  sort: string | undefined,
  order: 'asc' | 'desc',
  allowed: readonly T[],
  fallback: T,
): Record<T, 'asc' | 'desc'> {
  const key = (allowed as readonly string[]).includes(sort ?? '') ? (sort as T) : fallback
  return { [key]: order } as Record<T, 'asc' | 'desc'>
}
