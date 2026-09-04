// @fetrag/search - Recherche transverse PostgreSQL (full-text `french` + trigram) sur les contenus publiés (ADR-005).

import { Prisma, prisma } from '@fetrag/db'

export const searchTypes = ['article', 'page', 'resource', 'course', 'service', 'event'] as const
export type SearchType = (typeof searchTypes)[number]

export const searchTypeLabels: Record<SearchType, string> = {
  article: 'Actualités',
  page: 'Pages',
  resource: 'Ressources',
  course: 'Formations',
  service: 'Services',
  event: 'Événements',
}

export interface SearchItem {
  id: string
  slug: string
  title: string
  excerpt: string
  href: string
  badge?: string
  /** Date pertinente (publication, début d'événement). */
  date?: Date | null
  /** Pertinence combinée (ts_rank + similarité), pour un tri global éventuel. */
  score: number
}

export interface SearchGroup {
  type: SearchType
  label: string
  items: SearchItem[]
  /** Nombre total de correspondances pour ce type (au-delà de `limit`). */
  total: number
}

export interface SearchResult {
  query: string
  groups: SearchGroup[]
  total: number
}

export interface SearchOptions {
  types?: readonly SearchType[]
  /** Résultats par type (5 par défaut, 20 au plus). */
  limit?: number
}

/** Longueur maximale d'une requête (SEC-04 : limite d'entrée, rate limiting côté route). */
export const MAX_QUERY_LENGTH = 100
const MIN_QUERY_LENGTH = 2
const EXCERPT_LENGTH = 160
const SIMILARITY_THRESHOLD = 0.25

const CONTROL_CHARS = new RegExp(`[${String.fromCharCode(0x00)}-${String.fromCharCode(0x1f)}${String.fromCharCode(0x7f)}]`, 'g')

/** Nettoie la requête : espaces normalisés, caractères de contrôle et ponctuation d'opérateurs retirés, 100 caractères au plus. */
export function sanitizeQuery(input: string): string {
  return input
    .replace(CONTROL_CHARS, ' ')
    .replace(/[<>"'`\\;()[\]{}|&!:*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .trim()
}

/** Extrait texte tronqué à la limite d'un mot. */
export function truncateExcerpt(text: string | null | undefined, max = EXCERPT_LENGTH): string {
  const clean = (text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const boundary = cut.lastIndexOf(' ')
  return `${cut.slice(0, boundary > 40 ? boundary : max).trim()}…`
}

const resourceKindLabels: Record<string, string> = {
  DOCUMENT: 'Document',
  GUIDE: 'Guide pratique',
  REPORT: 'Rapport',
  LEGAL_TEXT: 'Texte juridique',
  FORM: 'Formulaire',
  VIDEO: 'Vidéo',
  AUDIO: 'Audio',
  PRESENTATION: 'Présentation',
}
const eventKindLabels: Record<string, string> = {
  EVENT: 'Événement',
  MASTERCLASS: 'Master Class',
  WEBINAR: 'Webinaire',
  ASSEMBLY: 'Assemblée',
  TRAINING: 'Formation',
}
const courseLevelLabels: Record<string, string> = { INITIATION: 'Initiation', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé' }

interface Row {
  id: string
  slug: string
  title: string
  excerpt: string | null
  badge: string | null
  date: Date | null
  rank: number
  sim: number
  total: number
}

/** Prédicat de recherche : vecteur `french` désaccentué OU similarité trigram du titre. */
function matchClause(titleCol: Prisma.Sql, textCol: Prisma.Sql, term: string): Prisma.Sql {
  return Prisma.sql`(
    to_tsvector('french', unaccent(coalesce(${titleCol}, '') || ' ' || coalesce(${textCol}, '')))
      @@ plainto_tsquery('french', unaccent(${term}))
    OR similarity(${titleCol}, ${term}) > ${SIMILARITY_THRESHOLD}
  )`
}

function rankColumns(titleCol: Prisma.Sql, textCol: Prisma.Sql, term: string): Prisma.Sql {
  return Prisma.sql`
    ts_rank(
      to_tsvector('french', unaccent(coalesce(${titleCol}, '') || ' ' || coalesce(${textCol}, ''))),
      plainto_tsquery('french', unaccent(${term}))
    ) AS rank,
    similarity(${titleCol}, ${term}) AS sim,
    COUNT(*) OVER()::int AS total`
}

const orderAndLimit = (limit: number) => Prisma.sql`ORDER BY rank DESC, sim DESC LIMIT ${limit}`

function queryFor(type: SearchType, term: string, limit: number): Prisma.Sql {
  switch (type) {
    case 'article': {
      const title = Prisma.sql`a."title"`
      const text = Prisma.sql`a."excerpt"`
      return Prisma.sql`
        SELECT a."id", a."slug", a."title", a."excerpt", c."name" AS badge, a."publishedAt" AS date,
          ${rankColumns(title, text, term)}
        FROM "Article" a LEFT JOIN "Category" c ON c."id" = a."categoryId"
        WHERE a."status" = 'PUBLISHED' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
    case 'page': {
      const title = Prisma.sql`p."title"`
      const text = Prisma.sql`p."excerpt"`
      return Prisma.sql`
        SELECT p."id", p."slug", p."title", p."excerpt", NULL::text AS badge, p."publishedAt" AS date,
          ${rankColumns(title, text, term)}
        FROM "Page" p
        WHERE p."status" = 'PUBLISHED' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
    case 'resource': {
      const title = Prisma.sql`r."title"`
      const text = Prisma.sql`r."summary"`
      return Prisma.sql`
        SELECT r."id", r."slug", r."title", r."summary" AS excerpt, r."kind"::text AS badge, r."publishedOn" AS date,
          ${rankColumns(title, text, term)}
        FROM "Resource" r
        WHERE r."status" = 'PUBLISHED' AND r."accessLevel" = 'PUBLIC' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
    case 'course': {
      const title = Prisma.sql`k."title"`
      const text = Prisma.sql`k."summary"`
      return Prisma.sql`
        SELECT k."id", k."slug", k."title", k."summary" AS excerpt, k."level"::text AS badge, k."publishedAt" AS date,
          ${rankColumns(title, text, term)}
        FROM "Course" k
        WHERE k."status" = 'PUBLISHED' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
    case 'service': {
      const title = Prisma.sql`s."name"`
      const text = Prisma.sql`s."summary"`
      return Prisma.sql`
        SELECT s."id", s."slug", s."name" AS title, s."summary" AS excerpt, c."name" AS badge, NULL::timestamp AS date,
          ${rankColumns(title, text, term)}
        FROM "Service" s LEFT JOIN "Category" c ON c."id" = s."categoryId"
        WHERE s."status" = 'PUBLISHED' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
    case 'event': {
      const title = Prisma.sql`e."title"`
      const text = Prisma.sql`e."summary"`
      return Prisma.sql`
        SELECT e."id", e."slug", e."title", e."summary" AS excerpt, e."kind"::text AS badge, e."startsAt" AS date,
          ${rankColumns(title, text, term)}
        FROM "Event" e
        WHERE e."status" = 'PUBLISHED' AND ${matchClause(title, text, term)}
        ${orderAndLimit(limit)}`
    }
  }
}

function hrefFor(type: SearchType, slug: string): string {
  const encoded = encodeURIComponent(slug)
  switch (type) {
    case 'article':
      return `/actualites/${encoded}`
    case 'resource':
      return `/ressources/${encoded}`
    case 'course':
      return `/formations/${encoded}`
    case 'service':
      return `/services/${encoded}`
    case 'event':
      return `/evenements/${encoded}`
    case 'page':
      return `/${encoded}`
  }
}

function badgeFor(type: SearchType, raw: string | null): string | undefined {
  if (!raw) return undefined
  if (type === 'resource') return resourceKindLabels[raw] ?? raw
  if (type === 'event') return eventKindLabels[raw] ?? raw
  if (type === 'course') return courseLevelLabels[raw] ?? raw
  return raw
}

function toItem(type: SearchType, row: Row): SearchItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: truncateExcerpt(row.excerpt),
    href: hrefFor(type, row.slug),
    badge: badgeFor(type, row.badge),
    date: row.date,
    score: Number(row.rank) + Number(row.sim),
  }
}

async function searchType(type: SearchType, term: string, limit: number): Promise<SearchGroup> {
  try {
    const rows = await prisma.$queryRaw<Row[]>(queryFor(type, term, limit))
    return { type, label: searchTypeLabels[type], items: rows.map((r) => toItem(type, r)), total: rows[0]?.total ?? 0 }
  } catch (error) {
    // Une erreur sur un type (ex. extension manquante) ne doit pas faire échouer toute la recherche.
    console.error(JSON.stringify({ level: 'error', msg: 'search.type_failed', type, error: error instanceof Error ? error.message : String(error) }))
    return { type, label: searchTypeLabels[type], items: [], total: 0 }
  }
}

/**
 * Recherche publique sur les contenus publiés uniquement (pages, actualités, ressources publiques,
 * formations, services, événements). Tri par pertinence full-text puis similarité trigram.
 */
export async function searchPublic(q: string, options: SearchOptions = {}): Promise<SearchResult> {
  const term = sanitizeQuery(q ?? '')
  const types = (options.types?.length ? options.types.filter((t) => searchTypes.includes(t)) : searchTypes) as SearchType[]
  if (term.length < MIN_QUERY_LENGTH || types.length === 0) return { query: term, groups: [], total: 0 }
  const limit = Math.min(20, Math.max(1, Math.round(options.limit ?? 5)))

  const groups = await Promise.all(types.map((type) => searchType(type, term, limit)))
  const kept = groups.filter((g) => g.items.length > 0)
  return { query: term, groups: kept, total: kept.reduce((sum, g) => sum + g.total, 0) }
}

/** Suggestions rapides (titre uniquement) pour un champ de recherche instantanée. */
export async function suggest(q: string, limit = 6): Promise<SearchItem[]> {
  const result = await searchPublic(q, { limit: Math.min(10, Math.max(1, limit)) })
  return result.groups
    .flatMap((g) => g.items)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
