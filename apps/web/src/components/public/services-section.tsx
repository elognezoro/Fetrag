import { LifeBuoy } from 'lucide-react'
import type { ServiceCard as ServiceCardData } from '@fetrag/cms'
import { EmptyState, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { SectionLink } from './section-link'
import { ServiceCard } from './service-card'

interface ServicesSectionProps {
  services: ServiceCardData[]
}

/** Section « Services » de l'accueil : six services au plus, en cartes à filet coloré. */
export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <Section variant="muted" padding="lg" bordered rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="services-title">
      <Reveal>
        <SectionHeading
          eyebrow="Services aux travailleurs"
          tone="green"
          title={
            <span id="services-title">
              Un appui <span className="italic text-green-700">concret</span> aux travailleurs et aux organisations
            </span>
          }
          description="Conseil juridique, accompagnement à la création de section, médiation, formation sur mesure : la Fédération met ses compétences au service de ses adhérents."
          actions={<SectionLink href="/services" tone="green">Tous les services</SectionLink>}
          className="mb-10"
        />
      </Reveal>
      {services.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="Le catalogue des services est en préparation" description="Contactez-nous pour toute demande d'appui en attendant sa publication." />
      ) : (
        <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <StaggerItem key={service.id} as="li" className="h-full">
              <ServiceCard service={service} index={index} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Section>
  )
}
