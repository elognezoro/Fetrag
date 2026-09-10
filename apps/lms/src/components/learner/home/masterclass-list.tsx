import { ArrowUpRight, CalendarDays, MapPin, Mic2 } from 'lucide-react'
import type { EventCard } from '@fetrag/cms'
import { sessionModeLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, EmptyState, Reveal, SectionHeading } from '@fetrag/ui'
import { webHref } from '@/lib/site'

interface MasterclassListProps {
  events: EventCard[]
}

/** Master Class à venir (événements CMS de type MASTERCLASS), inscription sur le site institutionnel. */
export function MasterclassList({ events }: MasterclassListProps) {
  return (
    <section className="border-t border-neutral-200 bg-white py-16 sm:py-20">
      <div className="container-fetrag">
        <SectionHeading
          eyebrow="Master Class"
          tone="navy"
          title={
            <>
              Les rendez-vous <span className="italic text-blue-600">à venir</span>
            </>
          }
          description="Des séances d’approfondissement animées par des praticiens du dialogue social : négociation, droit du travail, communication. Ouvertes aux apprenants et aux responsables des organisations affiliées."
          actions={
            <Button asChild variant="link">
              <a href={webHref('/evenements')}>
                Tout l’agenda
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          }
        />
        {events.length === 0 ? (
          <EmptyState
            compact
            icon={Mic2}
            title="Aucune Master Class programmée pour le moment"
            description="Les prochaines dates seront annoncées ici et sur fetrag.ga. Inscrivez-vous à la lettre d’information pour être prévenu."
            className="mt-8"
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.08}>
                <Card as="article" pillar="navy" interactive className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="gold">Master Class</Badge>
                      {event.isFull ? <Badge variant="danger">Complet</Badge> : null}
                      <Badge variant="outline">{event.isFree ? 'Gratuit' : formatMoney(event.priceAmount ?? 0, event.currency)}</Badge>
                    </div>
                    <h3 className="text-xl">{event.title}</h3>
                    {event.summary ? <p className="text-sm leading-relaxed text-neutral-600">{event.summary}</p> : null}
                    <dl className="mt-auto space-y-1.5 pt-2 text-sm text-neutral-700">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-blue-600" aria-hidden="true" />
                        <dt className="sr-only">Date</dt>
                        <dd>{formatDateTime(event.startsAt)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-green-700" aria-hidden="true" />
                        <dt className="sr-only">Lieu</dt>
                        <dd>{event.mode === 'VIRTUAL' ? sessionModeLabels.VIRTUAL : [event.location, event.city].filter(Boolean).join(', ') || sessionModeLabels[event.mode]}</dd>
                      </div>
                      {event.speakerName ? (
                        <div className="flex items-center gap-2">
                          <Mic2 className="size-4 text-gold-700" aria-hidden="true" />
                          <dt className="sr-only">Intervenant</dt>
                          <dd>
                            {event.speakerName}
                            {event.speakerTitle ? <span className="text-neutral-500"> - {event.speakerTitle}</span> : null}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    <Button asChild variant="secondary" size="sm" className="mt-3 self-start">
                      <a href={webHref(`/evenements/${event.slug}`)}>
                        Détails et inscription
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
