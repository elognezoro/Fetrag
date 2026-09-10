import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Award, CalendarDays, Clock, ExternalLink, MapPin, Mic2, PlayCircle, Ticket, Users, Video } from 'lucide-react'
import { seo } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { eventKindLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatMoney, formatTime } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Breadcrumbs, Button, Container, GradientDivider, Prose, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem, cn, initials } from '@fetrag/ui'
import { CoverImage } from '@/components/public/cover-image'
import { DateStamp } from '@/components/public/date-stamp'
import { EventCard, eventPlace } from '@/components/public/event-card'
import { EventRegistration } from '@/components/public/event-registration'
import { JsonLd } from '@/components/public/json-ld'
import { ShareButtons } from '@/components/public/share-buttons'
import { getOtherUpcomingEvents } from '@/server/public/events'
import { loadEvent } from '@/server/public/loaders'
import { toMetadata } from '@/server/public/metadata'
import { safeQuery } from '@/server/public/safe'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

const kindTone = { EVENT: 'blue', MASTERCLASS: 'gold', WEBINAR: 'green', ASSEMBLY: 'navy', TRAINING: 'blue' } as const

function sameDay(a: Date, b: Date): boolean {
  return new Intl.DateTimeFormat('fr-GA', { timeZone: 'Africa/Libreville', dateStyle: 'short' }).format(a) === new Intl.DateTimeFormat('fr-GA', { timeZone: 'Africa/Libreville', dateStyle: 'short' }).format(b)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await safeQuery('events.getPublished(metadata)', () => loadEvent(slug, null), null)
  if (!event) return { title: 'Événement introuvable', robots: { index: false, follow: false } }
  return toMetadata(seo.buildMetadata('event', event))
}

/** Fiche événement : date en timbre, lieu, intervenant, description, inscription (gratuite, payante, liste d'attente). */
export default async function EventPage({ params }: PageProps) {
  const [{ slug }, viewer] = await Promise.all([params, getViewer()])
  const event = await loadEvent(slug, viewer)
  if (!event) notFound()

  const others = await getOtherUpcomingEvents(event.id)
  const canonical = `${resolvePublicUrl('web')}/evenements/${event.slug}`
  const priceLabel = event.isFree ? null : event.priceAmount ? formatMoney(event.priceAmount, event.currency) : null
  const tone = kindTone[event.kind]
  const registered = event.viewerRegistration === 'REGISTERED' || event.viewerRegistration === 'ATTENDED'
  const showMeetingUrl = Boolean(event.meetingUrl) && registered && !event.isPast
  const when = event.endsAt && !sameDay(event.startsAt, event.endsAt) ? `Du ${formatDate(event.startsAt)} au ${formatDate(event.endsAt)}` : formatDate(event.startsAt)
  const hours = event.endsAt && sameDay(event.startsAt, event.endsAt) ? `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}` : `À partir de ${formatTime(event.startsAt)}`

  return (
    <>
      <JsonLd data={seo.jsonLd('event', event)} />
      <article>
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <RingBackdrop position="top-right" rings={4} opacity={0.06} />
          <Container size="wide" className="relative py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Événements', href: '/evenements' }, { label: event.title }]} homeHref="/" className="mb-6" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Reveal>
                <DateStamp date={event.startsAt} muted={event.isPast} />
              </Reveal>
              <Reveal delay={0.05} className="flex max-w-3xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Ribbon tone={tone}>{eventKindLabels[event.kind]}</Ribbon>
                  {event.isPast ? <Badge variant="neutral">Terminé</Badge> : event.isFull ? <Badge variant="warning">Complet</Badge> : null}
                  {event.isFeatured && !event.isPast ? <Badge variant="gold">À la une</Badge> : null}
                  {event.issuesCertificate ? (
                    <Badge variant="green">
                      <Award aria-hidden="true" />
                      Attestation de participation
                    </Badge>
                  ) : null}
                </div>
                <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">{event.title}</h1>
                {event.summary ? <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">{event.summary}</p> : null}
                <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-blue-600" aria-hidden="true" />
                    <dt className="sr-only">Date</dt>
                    <dd>
                      <time dateTime={event.startsAt.toISOString()}>{when}</time>
                    </dd>
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-blue-600" aria-hidden="true" />
                    <dt className="sr-only">Horaires</dt>
                    <dd>{hours}</dd>
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    {event.mode === 'VIRTUAL' ? <Video className="size-4 text-blue-600" aria-hidden="true" /> : <MapPin className="size-4 text-blue-600" aria-hidden="true" />}
                    <dt className="sr-only">Lieu</dt>
                    <dd>
                      {eventPlace(event)} · {sessionModeLabels[event.mode]}
                    </dd>
                  </div>
                </dl>
                <GradientDivider width="lg" />
              </Reveal>
            </div>
          </Container>
        </header>

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              {event.coverImageUrl ? (
                <Reveal className="overflow-hidden rounded-2xl border border-neutral-200 shadow-soft">
                  <CoverImage src={event.coverImageUrl} alt="" priority sizes="(min-width: 1024px) 60vw, 100vw" aspectClassName="aspect-[16/9]" tone={tone === 'navy' ? 'navy' : tone} />
                </Reveal>
              ) : null}

              {event.isPast && event.replayUrl ? (
                <Alert variant="info" icon={PlayCircle}>
                  <AlertTitle>Replay disponible</AlertTitle>
                  <AlertDescription>
                    Cet événement est terminé : vous pouvez{' '}
                    <a href={event.replayUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                      revoir l&apos;enregistrement
                    </a>
                    .
                  </AlertDescription>
                </Alert>
              ) : null}

              {event.description.trim() ? (
                <Reveal as="section" aria-labelledby="event-description-title">
                  <SectionHeading eyebrow="Programme" tone={tone} size="md" title={<span id="event-description-title">Au programme</span>} className="mb-6" />
                  <Prose html={event.description} />
                </Reveal>
              ) : null}

              {event.speakerName ? (
                <Reveal as="section" aria-labelledby="speaker-title">
                  <SectionHeading eyebrow="Intervenant" tone="gold" size="md" title={<span id="speaker-title">Avec {event.speakerName}</span>} className="mb-6" />
                  <div className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row sm:items-start">
                    <span className="relative block size-28 shrink-0">
                      <span aria-hidden="true" className="absolute inset-0 rounded-full border-[3px] border-blue-500" />
                      <span aria-hidden="true" className="absolute inset-1.5 rounded-full border border-dashed border-gold-500" />
                      <span className="absolute inset-3 overflow-hidden rounded-full bg-blue-50">
                        {event.speakerImageUrl ? (
                          <Image src={event.speakerImageUrl} alt="" fill sizes="112px" unoptimized className="object-cover object-top" />
                        ) : (
                          <span className="flex size-full items-center justify-center font-display text-2xl font-semibold text-blue-700">{initials(event.speakerName)}</span>
                        )}
                      </span>
                      <span aria-hidden="true" className="absolute -right-1 -top-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy">
                        <Mic2 className="size-4" strokeWidth={2} />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-semibold text-navy">{event.speakerName}</p>
                      {event.speakerTitle ? <p className="eyebrow mt-1 text-[11px] text-blue-700">{event.speakerTitle}</p> : null}
                      {event.speakerBio ? <Prose html={event.speakerBio} className="mt-3 text-sm" /> : null}
                    </div>
                  </div>
                </Reveal>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={canonical} title={event.title} />
                <Button asChild variant="ghost" size="md">
                  <Link href="/evenements">
                    <ArrowLeft aria-hidden="true" />
                    Tout l&apos;agenda
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6 shadow-lift', event.isPast ? 'border-t-[3px] border-t-neutral-300' : 'pillar-top-green')}>
                <p className="eyebrow text-[11px] text-neutral-500">Inscription</p>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Ticket className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Participation</dt>
                      <dd className="font-semibold text-navy">{event.isFree ? 'Gratuite' : (priceLabel ?? 'Payante')}</dd>
                    </div>
                  </div>
                  {event.capacity !== null ? (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-semibold text-neutral-500">Places</dt>
                        <dd className="font-semibold text-navy">
                          {event.isPast
                            ? `${event.registeredCount} participant${event.registeredCount > 1 ? 's' : ''}`
                            : event.isFull
                              ? `Complet (${event.waitingCount} en liste d'attente)`
                              : `${event.remainingSeats} place${(event.remainingSeats ?? 0) > 1 ? 's' : ''} restante${(event.remainingSeats ?? 0) > 1 ? 's' : ''} sur ${event.capacity}`}
                        </dd>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Quand</dt>
                      <dd className="font-semibold text-navy">
                        {when}
                        <span className="block text-xs font-medium text-neutral-500">{hours} (heure de Libreville)</span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-semibold text-neutral-500">Où</dt>
                      <dd className="font-semibold text-navy">{eventPlace(event)}</dd>
                    </div>
                  </div>
                </dl>
                {showMeetingUrl && event.meetingUrl ? (
                  <Button asChild variant="primary" size="lg" className="mt-5 w-full">
                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <Video aria-hidden="true" />
                      Rejoindre la séance en ligne
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </Button>
                ) : null}
                <div className="mt-5">
                  <EventRegistration
                    eventId={event.id}
                    slug={event.slug}
                    isPast={event.isPast}
                    isFull={event.isFull}
                    isFree={event.isFree}
                    priceLabel={priceLabel}
                    remainingSeats={event.remainingSeats}
                    authenticated={Boolean(viewer)}
                    viewerRegistration={event.viewerRegistration}
                  />
                </div>
              </div>
              {event.issuesCertificate ? (
                <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                  <p className="eyebrow text-[11px] text-gold-800">Attestation</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">Une attestation de participation, vérifiable en ligne, est délivrée aux participants présents.</p>
                </div>
              ) : null}
            </aside>
          </div>
        </Section>
      </article>

      {others.length > 0 ? (
        <Section variant="muted" padding="md" bordered aria-labelledby="other-events-title">
          <Reveal>
            <SectionHeading
              eyebrow="Agenda"
              tone="blue"
              size="md"
              title={
                <span id="other-events-title">
                  D&apos;autres <span className="italic text-blue-600">rendez-vous</span> à venir
                </span>
              }
              className="mb-8"
            />
          </Reveal>
          <Stagger as="ul" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {others.map((item) => (
              <StaggerItem key={item.id} as="li" className="h-full">
                <EventCard event={item} compact />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  )
}
