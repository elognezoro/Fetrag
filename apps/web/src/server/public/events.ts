import 'server-only'
import { events, type EventCard } from '@fetrag/cms'
import type { eventKinds, Paginated } from '@fetrag/contracts'
import { safeQuery } from './safe'

export type EventKindName = (typeof eventKinds)[number]

export interface EventsFilters {
  kind?: EventKindName
  /** Page de l'archive des événements passés. */
  page: number
}

export interface EventsIndex {
  upcoming: EventCard[]
  past: Paginated<EventCard>
  /** Vrai si l'agenda n'a pas pu être lu (base indisponible). */
  degraded: boolean
}

const PAST_PAGE_SIZE = 9
const UPCOMING_LIMIT = 24

const emptyPast = (page: number): Paginated<EventCard> => ({ items: [], page, pageSize: PAST_PAGE_SIZE, total: 0, totalPages: 0 })

/** Agenda public : événements à venir (jusqu'à 24) et archive paginée des événements passés. */
export async function getEventsIndex(filters: EventsFilters): Promise<EventsIndex> {
  const [upcoming, past] = await Promise.all([
    safeQuery('events.listUpcoming', () => events.listUpcoming({ limit: UPCOMING_LIMIT, kind: filters.kind }), null),
    safeQuery('events.listPast', () => events.listPast({ page: filters.page, pageSize: PAST_PAGE_SIZE, kind: filters.kind }), null),
  ])
  return {
    upcoming: upcoming ?? [],
    past: past ?? emptyPast(filters.page),
    degraded: upcoming === null && past === null,
  }
}

/** Autres événements à venir (hors événement courant), pour la fiche d'un événement. */
export async function getOtherUpcomingEvents(excludeId: string, limit = 3): Promise<EventCard[]> {
  const rows = await safeQuery('events.listUpcoming(other)', () => events.listUpcoming({ limit: limit + 1 }), [])
  return rows.filter((event) => event.id !== excludeId).slice(0, limit)
}
