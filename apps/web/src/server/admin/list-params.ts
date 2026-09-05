/**
 * Lecture des paramètres de liste (`searchParams`) et construction des liens de pagination / filtres.
 * Fichier pur : utilisable par les pages serveur et les composants.
 */

export type SearchParams = Record<string, string | string[] | undefined>

export interface ListParams {
  page: number
  pageSize: number
  q?: string
  status?: string
  sort?: string
  order: 'asc' | 'desc'
  /** Filtres additionnels (chaînes non vides uniquement). */
  filters: Record<string, string>
}

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  const trimmed = v?.trim()
  return trimmed ? trimmed : undefined
}

/** Extrait pagination, recherche, tri, statut et filtres nommés d'un objet `searchParams`. */
export function readListParams(params: SearchParams, filterKeys: string[] = [], defaults: { pageSize?: number; sort?: string; order?: 'asc' | 'desc' } = {}): ListParams {
  const page = Math.max(1, Number.parseInt(first(params.page) ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(5, Number.parseInt(first(params.taille) ?? String(defaults.pageSize ?? 20), 10) || 20))
  const orderRaw = first(params.ordre)
  const filters: Record<string, string> = {}
  for (const key of filterKeys) {
    const value = first(params[key])
    if (value) filters[key] = value
  }
  return {
    page,
    pageSize,
    q: first(params.q)?.slice(0, 200),
    status: first(params.statut),
    sort: first(params.tri) ?? defaults.sort,
    order: orderRaw === 'asc' || orderRaw === 'desc' ? orderRaw : (defaults.order ?? 'desc'),
    filters,
  }
}

/** Construit un lien conservant les paramètres courants, avec surcharges (valeur vide = suppression). */
export function buildListHref(base: string, params: ListParams, overrides: Record<string, string | number | undefined> = {}): string {
  const search = new URLSearchParams()
  const current: Record<string, string | undefined> = {
    q: params.q,
    statut: params.status,
    tri: params.sort,
    ordre: params.order === 'desc' ? undefined : params.order,
    ...params.filters,
    page: params.page > 1 ? String(params.page) : undefined,
  }
  for (const [key, value] of Object.entries({ ...current, ...overrides })) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

/** Fonction `hrefFor(page)` pour le composant `Pagination`. */
export function pageHref(base: string, params: ListParams): (page: number) => string {
  return (page) => buildListHref(base, params, { page: page > 1 ? page : undefined })
}

/** Convertit les paramètres de liste en requête CMS (`adminListQuerySchema` et dérivés). */
export function toCmsQuery(params: ListParams): { page: number; pageSize: number; q?: string; sort?: string; order: 'asc' | 'desc' } {
  return { page: params.page, pageSize: params.pageSize, q: params.q, sort: params.sort, order: params.order }
}

/** Valeur d'une énumération si elle en fait partie, sinon `undefined`. */
export function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((v) => v === value)
}

/** Date `YYYY-MM-DD` (ou ISO) ; `undefined` si invalide. */
export function toDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) d.setUTCHours(23, 59, 59, 999)
  return d
}

/** Nom de fichier d'export horodaté (sans caractères spéciaux). */
export function exportFileName(prefix: string, extension = 'csv'): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `fetrag-${prefix}-${stamp}.${extension}`
}
