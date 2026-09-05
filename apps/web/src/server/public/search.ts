import 'server-only'
import { searchPublic, searchTypes, sanitizeQuery, type SearchResult, type SearchType } from '@fetrag/search'
import { safeQuery } from './safe'

export interface SearchPageData {
  /** Terme nettoyé réellement utilisé pour la recherche. */
  query: string
  type: SearchType | undefined
  result: SearchResult
  /** Vrai si la recherche n'a pas pu être exécutée (base indisponible). */
  degraded: boolean
  /** Vrai si le terme est trop court pour lancer une recherche. */
  tooShort: boolean
}

const RESULTS_PER_TYPE = 8
const RESULTS_SINGLE_TYPE = 20

/** Type de contenu valide, sinon `undefined` (tous les types). */
export function parseSearchType(value: string | undefined): SearchType | undefined {
  return value && (searchTypes as readonly string[]).includes(value) ? (value as SearchType) : undefined
}

/** Recherche transverse sur les contenus publiés, tolérante à l'indisponibilité de la base. */
export async function runSearch(rawQuery: string | undefined, type: SearchType | undefined): Promise<SearchPageData> {
  const query = sanitizeQuery(rawQuery ?? '')
  const tooShort = query.length > 0 && query.length < 2
  const empty: SearchResult = { query, groups: [], total: 0 }
  if (query.length < 2) return { query, type, result: empty, degraded: false, tooShort }

  const result = await safeQuery(
    'searchPublic',
    () => searchPublic(query, { types: type ? [type] : undefined, limit: type ? RESULTS_SINGLE_TYPE : RESULTS_PER_TYPE }),
    null,
  )
  return { query, type, result: result ?? empty, degraded: result === null, tooShort: false }
}
