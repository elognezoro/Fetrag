import { CalendarDays } from 'lucide-react'
import type { EventCard as EventCardData } from '@fetrag/cms'
import { EmptyState, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { EventCard } from './event-card'
import { SectionLink } from './section-link'

interface EventsSectionProps {
  events: EventCardData[]
}

/** Section « Événements à venir » de l'accueil : cartes avec date en timbre bleu. */
export function EventsSection({ events }: EventsSectionProps) {
  return (
    <Section variant="white" padding="lg" bordered aria-labelledby="events-title">
      <Reveal>
        <SectionHeading
          eyebrow="Agenda"
          tone="blue"
          title={
            <span id="events-title">
              Prochains <span className="italic text-blue-600">rendez-vous</span>
            </span>
          }
          description="Master class, assemblées, webinaires et sessions de formation : retrouvez les temps forts de la Fédération et inscrivez-vous en ligne."
          actions={<SectionLink href="/evenements">Tout l&apos;agenda</SectionLink>}
          className="mb-10"
        />
      </Reveal>
      {events.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Aucun événement programmé" description="L'agenda de la Fédération sera mis à jour prochainement." />
      ) : (
        <Stagger as="ul" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <StaggerItem key={event.id} as="li" className="h-full">
              <EventCard event={event} compact />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Section>
  )
}
