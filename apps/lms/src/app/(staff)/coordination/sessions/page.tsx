import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatTime } from '@fetrag/domain'
import { Badge, Button, Card, EmptyState } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listCohortsForSelect } from '@/server/staff/coordination-queries'
import { listSessionsPlanning, listTrainers } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Planning des sessions' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ semaine?: string; cohorte?: string; formateur?: string }>
}

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(-1, 0, 0, 0) // minuit à Libreville (UTC+1)
  return d
}

function isoDate(date: Date): string {
  return new Date(date.getTime() + 3600 * 1000).toISOString().slice(0, 10)
}

/** Planning global des sessions par semaine, filtrable par cohorte et formateur. */
export default async function CoordinationSessionsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('cohort.manage', {}, '/coordination/sessions')
  const params = await searchParams
  const anchor = params.semaine && /^\d{4}-\d{2}-\d{2}$/.test(params.semaine) ? new Date(`${params.semaine}T12:00:00Z`) : new Date()
  const from = startOfWeek(anchor)
  const to = new Date(from.getTime() + 7 * 24 * 3600 * 1000 - 1)
  const [sessions, cohorts, trainers] = await Promise.all([
    listSessionsPlanning(principal, { from, to }, { cohortId: params.cohorte || undefined, trainerId: params.formateur || undefined }),
    listCohortsForSelect(),
    listTrainers(),
  ])
  const days = Array.from({ length: 7 }, (_, i) => new Date(from.getTime() + i * 24 * 3600 * 1000 + 3600 * 1000))
  const prev = isoDate(new Date(from.getTime() - 7 * 24 * 3600 * 1000))
  const next = isoDate(new Date(from.getTime() + 7 * 24 * 3600 * 1000))
  const weekHref = (week: string) => buildHref('/coordination/sessions', { semaine: week, cohorte: params.cohorte, formateur: params.formateur })

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Sessions' }]}
        eyebrow="Planning"
        title={
          <>
            Semaine du <span className="italic text-blue-600">{formatDate(days[0] ?? from)}</span>
          </>
        }
        description="Vue globale des sessions de toutes les cohortes : présentiel, classes virtuelles, hybride. Les sessions se créent depuis la fiche de chaque cohorte."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={weekHref(prev)}>
                <ChevronLeft aria-hidden="true" />
                Semaine précédente
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/coordination/sessions">Aujourd&apos;hui</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={weekHref(next)}>
                Semaine suivante
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        }
      />

      <FilterBar
        action="/coordination/sessions"
        className="mb-6"
        hidden={{ semaine: params.semaine }}
        fields={[
          { name: 'cohorte', label: 'Cohorte', type: 'select', value: params.cohorte, placeholder: 'Toutes', options: cohorts.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}` })) },
          { name: 'formateur', label: 'Formateur', type: 'select', value: params.formateur, placeholder: 'Tous', options: trainers.map((t) => ({ value: t.id, label: t.label })) },
        ]}
      />

      {sessions.length ? (
        <ol className="grid gap-4 lg:grid-cols-7">
          {days.map((day) => {
            const key = isoDate(new Date(day.getTime() - 3600 * 1000))
            const items = sessions.filter((s) => isoDate(new Date(s.startsAt.getTime())) === key)
            const isToday = key === isoDate(new Date())
            return (
              <li key={key} className={`flex flex-col gap-2 rounded-2xl border p-3 ${isToday ? 'border-blue-500 bg-blue-50/40' : 'border-neutral-200 bg-white'} shadow-soft`}>
                <p className="eyebrow text-[11px] text-neutral-500">{formatDate(day, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                {items.length ? (
                  items.map((s) => (
                    <article key={s.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
                      <p className="font-semibold text-navy">
                        {formatTime(s.startsAt)} - {formatTime(s.endsAt)}
                      </p>
                      <p className="text-ink">{s.title}</p>
                      <p className="text-xs text-neutral-500">
                        {s.cohort.course.title} · {s.cohort.name}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline" size="sm">
                          {sessionModeLabels[s.mode]}
                        </Badge>
                        <Badge variant={s._count.attendances ? 'success' : 'neutral'} size="sm">
                          {s._count.attendances}/{s.cohort._count.members} présents
                        </Badge>
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">{s.cohort.trainer?.name ?? 'Formateur à désigner'}</p>
                      <Link href={`/coordination/cohortes/${s.cohort.id}?onglet=sessions`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
                        Cohorte <ExternalLink className="size-3" aria-hidden="true" />
                      </Link>
                    </article>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">Aucune session</p>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <Card>
          <EmptyState icon={CalendarDays} title="Aucune session cette semaine" description="Changez de semaine ou planifiez des sessions depuis les fiches de cohortes." />
        </Card>
      )}
    </>
  )
}
