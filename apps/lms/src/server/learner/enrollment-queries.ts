import 'server-only'
import type { EnrollmentStatus } from '@fetrag/db'
import type { Principal } from '@fetrag/domain'
import { enrollments, progress } from '@fetrag/lms-core'

/**
 * Lecture des inscriptions de l'apprenant (page « Mes formations ») : filtre par état,
 * compteurs par onglet et lien de reprise (prochaine activité) pour les parcours actifs.
 */

export type EnrollmentRow = Awaited<ReturnType<typeof enrollments.listForUser>>[number]

export const enrollmentFilters = ['all', 'active', 'completed', 'pending', 'other'] as const
export type EnrollmentFilter = (typeof enrollmentFilters)[number]

export const enrollmentFilterLabels: Record<EnrollmentFilter, string> = {
  all: 'Toutes',
  active: 'En cours',
  completed: 'Terminées',
  pending: 'En attente',
  other: 'Clôturées',
}

const FILTER_STATUSES: Record<Exclude<EnrollmentFilter, 'all'>, EnrollmentStatus[]> = {
  active: ['ACTIVE'],
  completed: ['COMPLETED'],
  pending: ['PENDING'],
  other: ['SUSPENDED', 'CANCELLED', 'EXPIRED'],
}

export interface EnrollmentListItem {
  enrollment: EnrollmentRow
  /** Lien direct vers la prochaine activité (parcours actifs uniquement). */
  nextHref: string | null
}

export interface EnrollmentListView {
  filter: EnrollmentFilter
  items: EnrollmentListItem[]
  counts: Record<EnrollmentFilter, number>
}

/** Lit `?statut=` ; repli sur « Toutes ». */
export function parseEnrollmentFilter(value: string | undefined): EnrollmentFilter {
  return (enrollmentFilters as readonly string[]).includes(value ?? '') ? (value as EnrollmentFilter) : 'all'
}

function matches(filter: EnrollmentFilter, status: EnrollmentStatus): boolean {
  return filter === 'all' || FILTER_STATUSES[filter].includes(status)
}

export async function listMyEnrollments(principal: Principal, filter: EnrollmentFilter): Promise<EnrollmentListView> {
  const rows = await enrollments.listForUser(principal)
  const counts = enrollmentFilters.reduce(
    (acc, key) => {
      acc[key] = rows.filter((row) => matches(key, row.status)).length
      return acc
    },
    {} as Record<EnrollmentFilter, number>,
  )
  const filtered = rows.filter((row) => matches(filter, row.status))
  const items = await Promise.all(
    filtered.map(async (enrollment) => {
      const next = enrollment.status === 'ACTIVE' ? await progress.nextActivity(enrollment.id).catch(() => null) : null
      return { enrollment, nextHref: next?.href ?? null }
    }),
  )
  return { filter, items, counts }
}
