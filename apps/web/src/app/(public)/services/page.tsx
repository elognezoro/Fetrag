import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardCheck, LifeBuoy, Mail, Search, Send } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { ServiceCard } from '@/components/public/service-card'
import { StepsList } from '@/components/public/steps-list'
import { siteConfig } from '@/lib/site'
import { getServicesIndex } from '@/server/public/services'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services aux travailleurs et aux organisations',
  description: `Conseil juridique, accompagnement à la création de section syndicale, médiation, appui à la négociation et formation sur mesure : les services de la ${siteConfig.fullName}.`,
  alternates: { canonical: '/services' },
}

const steps = [
  { title: 'Choisir un service', description: 'Chaque fiche précise à qui le service s’adresse, les conditions, le délai indicatif et le tarif éventuel.', icon: Search },
  { title: 'Déposer la demande', description: 'Un formulaire adapté au service, une référence SRV-… et un accusé de réception par email.', icon: Send },
  { title: 'Suivre le traitement', description: 'Le responsable des services instruit la demande ; vous suivez chaque étape depuis votre espace personnel.', icon: ClipboardCheck },
]

/** Catalogue public des services : cartes à filet coloré, parcours de demande, contact. */
export default async function ServicesPage() {
  const index = await getServicesIndex()
  const { services } = index

  return (
    <>
      <PageHeader
        eyebrow="Services"
        tone="green"
        title={
          <>
            Un appui <span className="italic text-green-700">concret</span> aux travailleurs et aux organisations
          </>
        }
        description="Conseil juridique en droit du travail, accompagnement à la création d'une section syndicale, médiation et prévention des conflits, appui à la négociation collective, formation sur mesure : la Fédération met ses compétences au service de ses adhérents."
        breadcrumbs={[{ label: 'Services' }]}
        homeHref="/"
        meta={services.length > 0 ? <span>{services.length} service{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}</span> : undefined}
        actions={
          <Button asChild variant="outline" size="md">
            <Link href="/contact">
              <Mail aria-hidden="true" />
              Une question avant de demander ?
            </Link>
          </Button>
        }
      />

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-8" aria-labelledby="services-list-title">
        <h2 id="services-list-title" className="sr-only">
          Liste des services
        </h2>
        {index.degraded ? (
          <Alert variant="warning">
            <AlertTitle>Catalogue momentanément indisponible</AlertTitle>
            <AlertDescription>La liste des services n&apos;a pas pu être chargée. Réessayez dans quelques instants ou contactez-nous directement.</AlertDescription>
          </Alert>
        ) : null}
        {services.length === 0 && !index.degraded ? (
          <EmptyState
            icon={LifeBuoy}
            title="Le catalogue des services est en préparation"
            description="En attendant sa publication, la Fédération répond à toute demande d'appui juridique ou syndical par le formulaire de contact."
            action={
              <Button asChild variant="primary" size="md">
                <Link href="/contact">Nous contacter</Link>
              </Button>
            }
          />
        ) : null}
        {services.length > 0 ? (
          <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, position) => (
              <StaggerItem key={service.id} as="li" className="h-full">
                <ServiceCard service={service} index={position} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </Section>

      <Section variant="white" padding="lg" bordered rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="how-title">
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            tone="blue"
            title={
              <span id="how-title">
                Une demande, une référence, un <span className="italic text-blue-600">suivi</span>
              </span>
            }
            description="Les demandes de service sont instruites par le Secrétariat général et les responsables de service de la Fédération. Les services payants sont réglés en ligne, par Mobile Money ou carte bancaire."
            className="mb-10"
          />
        </Reveal>
        <StepsList steps={steps} columns={3} />
        <Reveal delay={0.1} className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-gold-200 bg-gold-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
            <strong className="font-semibold text-navy">Situation urgente ?</strong> Licenciement en cours, accident du travail, conflit collectif : appelez la permanence de la
            Fédération aux numéros indiqués en bas de page, du lundi au vendredi.
          </p>
          <Button asChild variant="gold" size="lg" className="shrink-0">
            <Link href="/contact">Joindre la permanence</Link>
          </Button>
        </Reveal>
      </Section>
    </>
  )
}
