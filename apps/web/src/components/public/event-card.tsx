import Link from 'next/link'
import { ArrowRight, MapPin, Mic2, Ticket, Users, Video } from 'lucide-react'
import type { EventCard as EventCardData } from '@fetrag/cms'
import { eventKindLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatMoney, formatTime } from '@fetrag/domain'
import { Badge, cn } from '@fetrag/ui'
import { CoverImage } from './cover-image'
import { DateStamp } from './date-stamp'

interface EventCardProps {
  event: EventCardData
  compact?: boolean
  className?: string
}

const kindTone: Record<EventCardData['kind'], 'blue' | 'green' | 'gold' | 'navy' | 'neutral'> = {
  EVENT: 'blue',
  MASTERCLASS: 'gold',
  WEBINAR: 'green',
  ASSEMBLY: 'navy',
  TRAINING: 'blue',
}

/** Lieu lisible d'un événement (ou « En ligne »). */
export function eventPlace(event: Pick<EventCardData, 'mode' | 'location' | 'city'>): string {
  if (event.mode === 'VIRTUAL') return 'En ligne'
  const place = [event.location, event.city].filter(Boolean).join(', ')
  return place || 'Lieu communiqué ultérieurement'
}

/** Carte d'événement : date en timbre bleu (grisé si passé), type, lieu, intervenant, places restantes. */
export function EventCard({ event, compact = false, className }: EventCardProps) {
  const href = `/evenements/${event.slug}`
  const price = event.isFree ? 'Gratuit' : event.priceAmount ? formatMoney(event.priceAmount, event.currency) : 'Payant'

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift',
        event.isPast ? 'border-t-[3px] border-t-neutral-300' : 'pillar-top-green',
        className,
      )}
    >
      {!compact ? (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
          <CoverImage src={event.coverImageUrl} alt="" tone={event.isPast ? 'navy' : 'green'} aspectClassName="aspect-[16/9]" />
        </Link>
      ) : null}
      <div className="flex flex-1 gap-4 p-5 sm:p-6">
        <DateStamp date={event.startsAt} muted={event.isPast} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={kindTone[event.kind]}>{eventKindLabels[event.kind]}</Badge>
            {event.isFull && !event.isPast ? <Badge variant="warning">Complet</Badge> : null}
            {event.isPast ? <Badge variant="neutral">Terminé</Badge> : null}
          </div>
          <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-navy sm:text-xl">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {event.title}
            </Link>
          </h3>
          {!compact && event.summary ? <p className="line-clamp-2 text-sm text-neutral-600">{event.summary}</p> : null}
          <ul className="mt-1 flex flex-col gap-1 text-xs font-semibold text-neutral-500">
            <li className="flex items-start gap-1.5">
              {event.mode === 'VIRTUAL' ? <Video className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> : <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />}
              <span className="min-w-0 break-words">
                {eventPlace(event)} · {formatTime(event.startsAt)} · {sessionModeLabels[event.mode]}
              </span>
            </li>
            {event.speakerName ? (
              <li className="flex items-start gap-1.5">
                <Mic2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">
                  {event.speakerName}
                  {event.speakerTitle ? `, ${event.speakerTitle}` : ''}
                </span>
              </li>
            ) : null}
            <li className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Ticket className="size-3.5" aria-hidden="true" />
                {price}
              </span>
              {event.remainingSeats !== null && !event.isPast ? (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden="true" />
                  {event.remainingSeats} place{event.remainingSeats > 1 ? 's' : ''} restante{event.remainingSeats > 1 ? 's' : ''}
                </span>
              ) : null}
            </li>
          </ul>
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-blue-600">
            {event.isPast ? 'Voir le compte rendu' : 'Détails et inscription'}
            <ArrowRight className="size-3.5 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}
