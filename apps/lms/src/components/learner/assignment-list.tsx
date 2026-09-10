import Link from 'next/link'
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList } from 'lucide-react'
import { formatDate, formatRelative } from '@fetrag/domain'
import { EmptyState, StatusBadge, cn } from '@fetrag/ui'
import type { LearnerAssignmentRow, LearnerAssignmentState } from '@/server/learner/assignment-queries'

export const assignmentFilters = ['all', 'todo', 'submitted', 'graded'] as const
export type AssignmentFilter = (typeof assignmentFilters)[number]

export const assignmentFilterLabels: Record<AssignmentFilter, string> = {
  all: 'Tous',
  todo: 'À rendre',
  submitted: 'Remis',
  graded: 'Notés',
}

const FILTER_STATES: Record<Exclude<AssignmentFilter, 'all'>, LearnerAssignmentState[]> = {
  todo: ['todo', 'draft', 'returned'],
  submitted: ['submitted', 'late'],
  graded: ['graded'],
}

export function parseAssignmentFilter(value: string | undefined): AssignmentFilter {
  return (assignmentFilters as readonly string[]).includes(value ?? '') ? (value as AssignmentFilter) : 'all'
}

export function matchesAssignmentFilter(filter: AssignmentFilter, state: LearnerAssignmentState): boolean {
  return filter === 'all' || FILTER_STATES[filter].includes(state)
}

/** Libellés FR des états côté apprenant (les états sont en minuscules dans lms-core). */
const stateLabels: Record<LearnerAssignmentState, string> = {
  todo: 'À rendre',
  draft: 'Brouillon',
  submitted: 'Remis',
  late: 'Remis en retard',
  graded: 'Noté',
  returned: 'À reprendre',
}

const stateBadge: Record<LearnerAssignmentState, string> = {
  todo: 'PENDING',
  draft: 'DRAFT',
  submitted: 'SUBMITTED',
  late: 'LATE',
  graded: 'GRADED',
  returned: 'RETURNED',
}

interface AssignmentListProps {
  rows: LearnerAssignmentRow[]
  filter: AssignmentFilter
}

/** Liste des devoirs : module, titre, échéance (relative), état et note une fois corrigé. */
export function AssignmentList({ rows, filter }: AssignmentListProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={filter === 'all' ? 'Aucun devoir pour le moment' : `Aucun devoir « ${assignmentFilterLabels[filter].toLowerCase()} »`}
        description="Les travaux pratiques de vos formations (études de cas, plans d'action, notes de synthèse) apparaîtront ici avec leur date limite."
      />
    )
  }
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((row) => {
        const grade = row.grade
        const urgent = row.dueAt && !row.overdue && row.dueAt.getTime() - Date.now() < 3 * 24 * 3600 * 1000 && (row.state === 'todo' || row.state === 'draft' || row.state === 'returned')
        return (
          <li key={row.assignment.id}>
            <Link
              href={`/devoirs/${row.assignment.id}`}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-soft transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 sm:flex-row sm:items-center sm:gap-4 sm:p-5',
                row.overdue ? 'border-[#f5c6c6] pillar-top-gold' : 'border-neutral-200',
              )}
            >
              <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full', row.state === 'graded' ? 'bg-green-50 text-green-700' : row.overdue ? 'bg-danger-soft text-danger' : 'bg-gold-50 text-gold-800')}>
                {row.overdue ? <AlertTriangle className="size-5" strokeWidth={1.75} aria-hidden="true" /> : <ClipboardList className="size-5" strokeWidth={1.75} aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-navy sm:truncate">{row.activity.title}</span>
                <span className="block text-xs text-neutral-500 sm:truncate">
                  {row.course.title} · {row.activity.moduleTitle}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:shrink-0 sm:justify-end">
                {row.dueAt ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                    <CalendarClock className={cn('size-3.5', row.overdue ? 'text-danger' : urgent ? 'text-gold-700' : 'text-neutral-400')} aria-hidden="true" />
                    <span>
                      <span className="sr-only">Date limite : </span>
                      {formatDate(row.dueAt, { day: 'numeric', month: 'short' })}
                      <span className={cn('ml-1', row.overdue ? 'font-semibold text-danger' : urgent ? 'font-semibold text-gold-800' : 'text-neutral-400')}>({row.overdue ? 'en retard' : formatRelative(row.dueAt)})</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">Sans date limite</span>
                )}
                {grade ? (
                  <span className="font-display text-xl font-semibold tabular-nums text-navy">
                    {grade.score}
                    <span className="text-sm text-neutral-500">/{grade.maxScore}</span>
                  </span>
                ) : null}
                <StatusBadge status={stateBadge[row.state]} size="sm" labels={{ [stateBadge[row.state]]: stateLabels[row.state] }} />
                <ArrowRight className="hidden size-4 text-neutral-400 sm:block" aria-hidden="true" />
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
