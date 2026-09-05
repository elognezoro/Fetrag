import 'server-only'
import { articles, events, partners, services, type ArticleCard, type EventCard, type ServiceCard } from '@fetrag/cms'
import { prisma, type Organization, type Partner } from '@fetrag/db'
import { catalog } from '@fetrag/lms-core'
import { programmeFallback, toProgrammeModule, type ProgrammeModule } from './programme'
import { safeQuery } from './safe'

export interface HomeStats {
  affiliates: number
  modules: number
  learners: number
  sessions: number
}

export interface HomeData {
  stats: HomeStats
  modules: ProgrammeModule[]
  /** Vrai lorsque le catalogue LMS a répondu (sinon programme officiel en repli). */
  modulesFromCatalog: boolean
  articles: ArticleCard[]
  services: ServiceCard[]
  events: EventCard[]
  affiliates: Organization[]
  partners: Partner[]
}

/**
 * Chiffres clés de l'accueil, calculés directement en base (helper local : aucun package
 * n'expose ces agrégats publics). Chaque compteur est tolérant à l'indisponibilité de la base.
 */
export async function getHomeStats(): Promise<HomeStats> {
  const [affiliates, modules, learners, sessions] = await Promise.all([
    safeQuery('stats.affiliates', () => prisma.organization.count({ where: { isAffiliate: true, isActive: true } }), 0),
    safeQuery('stats.modules', () => prisma.course.count({ where: { status: 'PUBLISHED', currentVersionId: { not: null } } }), 0),
    safeQuery('stats.learners', () => prisma.user.count({ where: { isActive: true, enrollments: { some: {} } } }), 0),
    safeQuery('stats.sessions', () => prisma.trainingSession.count(), 0),
  ])
  return { affiliates, modules: modules > 0 ? modules : programmeFallback.length, learners, sessions }
}

/** Modules du programme : catalogue LMS publié, sinon programme officiel 2026. */
export async function getProgrammeModules(): Promise<{ modules: ProgrammeModule[]; fromCatalog: boolean }> {
  const result = await safeQuery('catalog.listPublished', () => catalog.listPublished({ pageSize: 10 }), null)
  if (!result || result.items.length === 0) return { modules: programmeFallback, fromCatalog: false }
  return { modules: result.items.map(toProgrammeModule), fromCatalog: true }
}

/** Organisations affiliées actives (annuaire institutionnel). */
export async function listAffiliates(sector?: string): Promise<Organization[]> {
  return safeQuery(
    'organizations.affiliates',
    () =>
      prisma.organization.findMany({
        where: { isAffiliate: true, isActive: true, ...(sector ? { sector: { equals: sector, mode: 'insensitive' } } : {}) },
        orderBy: [{ memberCount: 'desc' }, { name: 'asc' }],
        take: 200,
      }),
    [],
  )
}

/** Secteurs distincts des organisations affiliées et des partenaires actifs (filtre de l'annuaire). */
export async function listSectors(): Promise<string[]> {
  const [orgs, partnerRows] = await Promise.all([
    safeQuery(
      'organizations.sectors',
      () => prisma.organization.findMany({ where: { isAffiliate: true, isActive: true, sector: { not: null } }, select: { sector: true }, distinct: ['sector'] }),
      [],
    ),
    safeQuery('partners.sectors', () => prisma.partner.findMany({ where: { isActive: true, sector: { not: null } }, select: { sector: true }, distinct: ['sector'] }), []),
  ])
  const set = new Set<string>()
  for (const row of [...orgs, ...partnerRows]) if (row.sector) set.add(row.sector.trim())
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
}

/** Toutes les données de la page d'accueil, chargées en parallèle et tolérantes aux pannes. */
export async function getHomeData(): Promise<HomeData> {
  const [stats, programme, news, serviceList, upcoming, affiliates, partnerList] = await Promise.all([
    getHomeStats(),
    getProgrammeModules(),
    safeQuery('articles.listPublished', () => articles.listPublished({ page: 1, pageSize: 3 }), null),
    safeQuery('services.listPublished', () => services.listPublished(), []),
    safeQuery('events.listUpcoming', () => events.listUpcoming({ limit: 3 }), []),
    listAffiliates(),
    safeQuery('partners.listActive', () => partners.listActive(), []),
  ])
  return {
    stats,
    modules: programme.modules,
    modulesFromCatalog: programme.fromCatalog,
    articles: news?.items ?? [],
    services: serviceList.slice(0, 6),
    events: upcoming,
    affiliates,
    partners: partnerList,
  }
}
