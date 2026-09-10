import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarClock, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Download, MapPin, Video } from 'lucide-react'
import { sessionModeLabels } from '@fetrag/contracts'
import { formatRelative, formatTime } from '@fetrag/domain'
import { Button, EmptyState, PageHeader, cn } from '@fetrag/ui'
import { CalendarGrid } from '@/components/learner/calendar-grid'
import { guards } from '@/lib/auth'
import { buildMonthGrid, currentMonth, dayKey, monthFromParam, monthLabel, monthParam, monthRange, shiftMonth } from '@/server/learner/calendar'
import { getCalendarEvents, type CalendarEvent } from '@/server/learner/queries'

export const metadata: Metadata = {
  title: 'Calendrier',
  description: 'Sessions de formation, séances en direct et échéances de devoirs, mois par mois, avec export vers votre agenda.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function modeLabel(mode: string | null): string | null {
  if (!mode) return null
  return (sessionModeLabels as Record<string, string>)[mode] ?? mode
}

function EventRow({ event, showDate }: { event: CalendarEvent; showDate: boolean }) {
  const isAssignment = event.kind === 'assignment'
  const Icon = isAssignment ? ClipboardList : CalendarClock
  return (
    <li>
      <Link
        href={event.href}
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-soft transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
          event.overdue ? 'border-[#f5c6c6]' : 'border-neutral-200',
        )}
      >
        <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-neutral-50 py-1.5 text-center">
          <span className="font-display text-2xl font-semibold leading-none text-navy">{new Intl.DateTimeFormat('fr-GA', { day: 'numeric', timeZone: 'Africa/Libreville' }).format(event.startsAt)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{new Intl.DateTimeFormat('fr-GA', { month: 'short', timeZone: 'Africa/Libreville' }).format(event.startsAt).replace('.', '')}</span>
        </span>
        <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full', isAssignment ? (event.overdue ? 'bg-danger-soft text-danger' : 'bg-gold-50 text-gold-800') : 'bg-blue-50 text-blue-700')}>
          <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-navy">
            {isAssignment ? 'Échéance : ' : ''}
            {event.title}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {event.courseTitle}
            {!isAssignment ? ` · ${formatTime(event.startsAt)}${event.endsAt ? ` - ${formatTime(event.endsAt)}` : ''}` : ` · avant ${formatTime(event.startsAt)}`}
            {modeLabel(event.mode) ? ` · ${modeLabel(event.mode)}` : ''}
            {event.location ? ` · ${event.location}` : ''}
          </span>
          {showDate ? <span className={cn('mt-0.5 block text-xs', event.overdue ? 'font-semibold text-danger' : 'text-neutral-400')}>{event.overdue ? 'En retard' : formatRelative(event.startsAt)}</span> : null}
        </span>
        {event.meetingUrl && !isAssignment ? <Video className="size-4 shrink-0 text-green-700" aria-label="Classe virtuelle" /> : event.location && !isAssignment ? <MapPin className="size-4 shrink-0 text-neutral-400" aria-hidden="true" /> : <ArrowRight className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />}
      </Link>
    </li>
  )
}

/** Calendrier mensuel (grille CSS, sans bibliothèque) + liste du mois + prochaines échéances + export .ics. */
export default async function CalendarPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/calendrier')
  const sp = await searchParams
  const now = new Date()
  const ref = monthFromParam(first(sp.mois), now)
  const range = monthRange(ref)
  const upcomingRange = { from: now, to: new Date(now.getTime() + 90 * 24 * 3600 * 1000) }
  const [monthEvents, upcoming] = await Promise.all([getCalendarEvents(principal, range), getCalendarEvents(principal, upcomingRange)])

  const weeks = buildMonthGrid(ref, now)
  const eventsByDay = monthEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = dayKey(event.startsAt)
    ;(acc[key] ??= []).push(event)
    return acc
  }, {})
  const label = monthLabel(ref)
  const previous = shiftMonth(ref, -1)
  const next = shiftMonth(ref, 1)
  const today = currentMonth(now)
  const isCurrentMonth = ref.year === today.year && ref.month === today.month
  const sessionCount = monthEvents.filter((e) => e.kind === 'session').length
  const assignmentCount = monthEvents.length - sessionCount

  return (
    <>
      <PageHeader
        eyebrow="Calendrier"
        tone="green"
        title={
          <>
            Vos <span className="italic text-green-700">séances</span> et échéances
          </>
        }
        description="Sessions en présentiel, classes virtuelles et dates limites de vos devoirs, affichées à l’heure de Libreville. Exportez-les vers votre agenda personnel."
        breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Calendrier' }]}
        homeHref="/"
        actions={
          <Button asChild variant="outline" size="md">
            <a href="/calendrier/export">
              <Download aria-hidden="true" />
              Exporter (.ics)
            </a>
          </Button>
        }
      />

      <div className="container-fetrag grid grid-cols-1 gap-10 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section aria-labelledby="month-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="icon" aria-label={`Mois précédent : ${monthLabel(previous)}`}>
                <Link href={`/calendrier?mois=${monthParam(previous)}`}>
                  <ChevronLeft aria-hidden="true" />
                </Link>
              </Button>
              <h2 id="month-title" className="min-w-[11rem] text-center text-xl sm:text-2xl">
                {label}
              </h2>
              <Button asChild variant="outline" size="icon" aria-label={`Mois suivant : ${monthLabel(next)}`}>
                <Link href={`/calendrier?mois=${monthParam(next)}`}>
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-neutral-500" aria-live="polite">
                {sessionCount} séance{sessionCount > 1 ? 's' : ''} · {assignmentCount} échéance{assignmentCount > 1 ? 's' : ''}
              </p>
              {!isCurrentMonth ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/calendrier">Aujourd&apos;hui</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <CalendarGrid weeks={weeks} eventsByDay={eventsByDay} monthLabel={label} />

          <ul className="flex flex-wrap gap-4 text-xs text-neutral-600" aria-label="Légende">
            <li className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-blue-100 ring-1 ring-blue-300" aria-hidden="true" />
              Séance de formation
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-gold-100 ring-1 ring-gold-300" aria-hidden="true" />
              Échéance de devoir
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-danger-soft ring-1 ring-danger/40" aria-hidden="true" />
              En retard
            </li>
          </ul>

          <div className="mt-4">
            <h3 className="text-lg">Ce mois-ci</h3>
            {monthEvents.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">Aucune séance ni échéance en {label.toLowerCase()}.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-2" aria-label={`Événements de ${label}`}>
                {monthEvents.map((event) => (
                  <EventRow key={`${event.kind}-${event.id}`} event={event} showDate={false} />
                ))}
              </ol>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-green-700">
              90
              <span className="text-base">j</span>
            </span>
            <div>
              <h2 className="flex items-center gap-2 text-xl">
                <CalendarDays className="size-5 text-green-700" aria-hidden="true" />À venir
              </h2>
              <p className="mt-1 text-sm text-neutral-600">Vos prochains rendez-vous sur trois mois.</p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState compact icon={CalendarClock} title="Rien de programmé" description="Les convocations de vos cohortes et les dates limites de vos devoirs apparaîtront ici." />
          ) : (
            <ol className="flex flex-col gap-2" aria-label="Prochains événements">
              {upcoming.slice(0, 6).map((event) => (
                <EventRow key={`${event.kind}-${event.id}`} event={event} showDate />
              ))}
            </ol>
          )}
          <p className="text-xs leading-relaxed text-neutral-500">
            Astuce : l&apos;export .ics ajoute les séances des six prochains mois et vos échéances à Google Agenda, Outlook ou votre téléphone. Les dates sont exprimées en heure de Libreville.
          </p>
        </aside>
      </div>
    </>
  )
}
