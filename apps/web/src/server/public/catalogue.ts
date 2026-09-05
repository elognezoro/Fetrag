import 'server-only'
import type { PillarName } from '@fetrag/contracts'
import { catalog } from '@fetrag/lms-core'
import { programmeFallback, toProgrammeModule, type CatalogItem, type ProgrammeModule } from './programme'
import { safeQuery } from './safe'

export type CatalogueModality = 'ASYNC' | 'SYNC' | 'HYBRID'

export interface CatalogueFilters {
  q?: string
  pillar?: PillarName
  modality?: CatalogueModality
  page?: number
}

export interface CatalogueResult {
  /** Modules prêts pour les `ModuleCard` (numérotés 01-10). */
  modules: ProgrammeModule[]
  /** Éléments bruts du catalogue LMS (vide en repli). */
  items: CatalogItem[]
  total: number
  page: number
  totalPages: number
  /** Vrai lorsque les données proviennent du catalogue LMS publié. */
  fromCatalog: boolean
}

const PAGE_SIZE = 12

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Repli sur le programme officiel 2026 (catalogue LMS vide ou indisponible), filtré localement. */
function fallbackCatalogue(filters: CatalogueFilters): CatalogueResult {
  const term = filters.q ? normalize(filters.q) : null
  const modules = programmeFallback.filter((module) => {
    if (filters.pillar && module.pillar !== filters.pillar) return false
    if (filters.modality && filters.modality !== 'HYBRID') return false
    if (term) {
      const haystack = normalize([module.title, ...module.items].join(' '))
      if (!haystack.includes(term)) return false
    }
    return true
  })
  return { modules, items: [], total: modules.length, page: 1, totalPages: 1, fromCatalog: false }
}

/**
 * Catalogue public synchronisé avec le LMS (`catalog.listPublished`).
 * Sans cours publié (ou base indisponible), le programme officiel sert de repli.
 */
export async function getCatalogue(filters: CatalogueFilters = {}): Promise<CatalogueResult> {
  const result = await safeQuery(
    'catalog.listPublished',
    () =>
      catalog.listPublished({
        q: filters.q,
        pillar: filters.pillar,
        modality: filters.modality,
        page: filters.page ?? 1,
        pageSize: PAGE_SIZE,
      }),
    null,
  )
  const hasFilters = Boolean(filters.q || filters.pillar || filters.modality)
  if (!result || (result.total === 0 && !hasFilters)) return fallbackCatalogue(filters)
  return {
    modules: result.items.map((item, index) => toProgrammeModule(item, (result.page - 1) * PAGE_SIZE + index)),
    items: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    fromCatalog: true,
  }
}

/** Statistiques légères du catalogue pour l'en-tête de la page Formations. */
export async function getCatalogueSummary(): Promise<{ courses: number; hours: number }> {
  const result = await safeQuery('catalog.summary', () => catalog.listPublished({ pageSize: 50 }), null)
  if (!result || result.items.length === 0) {
    return { courses: programmeFallback.length, hours: programmeFallback.reduce((sum, m) => sum + (m.durationHours ?? 0), 0) }
  }
  return { courses: result.total, hours: result.items.reduce((sum, item) => sum + item.durationHours, 0) }
}
