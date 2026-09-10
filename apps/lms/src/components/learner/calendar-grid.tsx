import Link from 'next/link'
import { CalendarClock, ClipboardList } from 'lucide-react'
import { formatTime } from '@fetrag/domain'
import { cn } from '@fetrag/ui'
import { weekDayLabels, type CalendarCell } from '@/server/learner/calendar'
import type { CalendarEvent } from '@/server/learner/queries'

interface CalendarGridProps {
  weeks: CalendarCell[][]
  /** Événements groupés par clé de jour `YYYY-MM-DD` (heure de Libreville). */
  eventsByDay: Record<string, CalendarEvent[]>
  monthLabel: string
}

const MAX_VISIBLE = 3

/** Pastille d'événement dans une case : point coloré sur mobile, étiquette lisible dès `sm`. */
function EventChip({ event }: { event: CalendarEvent }) {
  const Icon = event.kind === 'assignment' ? ClipboardList : CalendarClock
  return (
    <Link
      href={event.href}
      title={`${event.kind === 'assignment' ? 'Échéance' : 'Séance'} : ${event.title} (${event.courseTitle})`}
      className={cn(
        'flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
        event.kind === 'assignment' ? (event.overdue ? 'bg-danger-soft text-danger hover:bg-[#f5c6c6]' : 'bg-gold-50 text-gold-800 hover:bg-gold-100') : 'bg-blue-50 text-blue-800 hover:bg-blue-100',
      )}
    >
      <Icon className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only sm:truncate">
        <span className="sr-only">{event.kind === 'assignment' ? 'Échéance : ' : 'Séance : '}</span>
        {event.kind === 'session' ? `${formatTime(event.startsAt)} ` : ''}
        {event.title}
      </span>
    </Link>
  )
}

/**
 * Vue mensuelle en grille CSS (tableau accessible, semaines du lundi au dimanche) sans bibliothèque.
 * Les jours hors mois sont grisés ; le jour courant est cerclé de bleu (écho de l'anneau du logo).
 */
export function CalendarGrid({ weeks, eventsByDay, monthLabel }: CalendarGridProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-soft">
      <table className="w-full min-w-[20rem] table-fixed border-collapse">
        <caption className="sr-only">Calendrier de {monthLabel} : séances de formation et échéances de devoirs</caption>
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {weekDayLabels.map((label, index) => (
              <th key={label} scope="col" className={cn('px-1 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500', index >= 5 && 'text-neutral-400')}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} className="border-b border-neutral-100 last:border-b-0">
              {week.map((cell) => {
                const events = eventsByDay[cell.key] ?? []
                const hidden = Math.max(0, events.length - MAX_VISIBLE)
                return (
                  <td
                    key={cell.key}
                    className={cn('h-20 min-w-0 border-r border-neutral-100 p-1 align-top last:border-r-0 sm:h-28 sm:p-1.5', !cell.inMonth && 'bg-neutral-50/70', cell.isWeekend && cell.inMonth && 'bg-neutral-50/40')}
                    aria-current={cell.isToday ? 'date' : undefined}
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          'inline-flex size-7 items-center justify-center self-end rounded-full text-xs font-semibold tabular-nums',
                          cell.isToday ? 'bg-blue-600 text-white ring-2 ring-blue-200' : cell.inMonth ? 'text-navy' : 'text-neutral-400',
                        )}
                      >
                        {cell.isToday ? <span className="sr-only">Aujourd&apos;hui, </span> : null}
                        {cell.day}
                      </span>
                      {events.length > 0 ? (
                        <ul className="flex flex-col gap-0.5" aria-label={`${events.length} ${events.length > 1 ? 'événements' : 'événement'}`}>
                          {events.slice(0, MAX_VISIBLE).map((event) => (
                            <li key={`${event.kind}-${event.id}`} className="min-w-0">
                              <EventChip event={event} />
                            </li>
                          ))}
                          {hidden > 0 ? <li className="px-1 text-[11px] font-semibold text-neutral-500">+{hidden}</li> : null}
                        </ul>
                      ) : null}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
