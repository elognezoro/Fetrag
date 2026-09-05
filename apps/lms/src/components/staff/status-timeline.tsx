import { Check, Circle, X } from 'lucide-react'
import { trainingRequestStatusLabels, type TrainingRequestStatusName } from '@fetrag/contracts'
import { formatDateTime } from '@fetrag/domain'
import { cn } from '@fetrag/ui'

/** Parcours nominal d'une demande institutionnelle (chapitre 14). */
const MAIN_PATH: TrainingRequestStatusName[] = ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

const TERMINAL: TrainingRequestStatusName[] = ['REJECTED', 'CANCELLED']

export interface StatusTimelineProps {
  status: TrainingRequestStatusName
  /** Historique (du plus récent au plus ancien) pour dater chaque étape. */
  history?: Array<{ toStatus: TrainingRequestStatusName; createdAt: Date | string }>
  className?: string
}

/**
 * Frise des statuts d'une demande de formation : étapes du parcours nominal avec les
 * détours (complément demandé, autre date proposée) et les issues terminales.
 */
export function StatusTimeline({ status, history = [], className }: StatusTimelineProps) {
  const reached = new Set<TrainingRequestStatusName>(history.map((h) => h.toStatus))
  reached.add(status)
  const terminal = TERMINAL.includes(status)
  const currentIndex = MAIN_PATH.indexOf(status)
  const lastMainIndex = terminal ? Math.max(...MAIN_PATH.map((s, i) => (reached.has(s) ? i : -1))) : currentIndex
  const dateOf = (s: TrainingRequestStatusName) => {
    const entry = history.find((h) => h.toStatus === s)
    return entry ? formatDateTime(entry.createdAt) : null
  }
  const detours = (['INFO_REQUESTED', 'RESCHEDULED'] as TrainingRequestStatusName[]).filter((s) => reached.has(s))

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Avancement de la demande">
        {MAIN_PATH.map((step, index) => {
          const done = index < lastMainIndex || (index === lastMainIndex && !terminal && step !== status) || (terminal && index <= lastMainIndex)
          const current = !terminal && step === status
          const pending = !done && !current
          const date = dateOf(step)
          return (
            <li key={step} className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    current && 'border-green-500 bg-green-500 text-navy shadow-glow-green',
                    done && !current && 'border-blue-500 bg-blue-500 text-white',
                    pending && 'border-neutral-300 bg-white text-neutral-400',
                  )}
                >
                  {done && !current ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                </span>
                {index < MAIN_PATH.length - 1 ? (
                  <span aria-hidden="true" className={cn('hidden h-0.5 flex-1 rounded-full lg:block', done && !current ? 'bg-blue-500' : 'bg-neutral-200')} />
                ) : null}
              </div>
              <div>
                <p className={cn('text-sm font-semibold', current ? 'text-green-800' : done ? 'text-navy' : 'text-neutral-500')}>
                  {trainingRequestStatusLabels[step]}
                  {current ? <span className="sr-only"> (étape actuelle)</span> : null}
                </p>
                {date ? <p className="text-xs text-neutral-500">{date}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
      {detours.length || terminal ? (
        <ul className="flex flex-wrap gap-2" aria-label="Événements particuliers">
          {detours.map((step) => (
            <li key={step} className="inline-flex items-center gap-2 rounded-full border border-gold-500/60 bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-800">
              <Circle className="size-3 fill-current" aria-hidden="true" />
              {trainingRequestStatusLabels[step]}
              {dateOf(step) ? <span className="font-normal text-gold-700">- {dateOf(step)}</span> : null}
            </li>
          ))}
          {terminal ? (
            <li className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
              <X className="size-3" strokeWidth={2.5} aria-hidden="true" />
              {trainingRequestStatusLabels[status]}
              {dateOf(status) ? <span className="font-normal">- {dateOf(status)}</span> : null}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
