import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, History } from 'lucide-react'
import { eventKindLabels, eventKinds } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Pagination, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { EventCard } from '@/components/public/event-card'
import { FilterChips, type FilterChip } from '@/components/public/filter-chips'
import { NewsletterSection } from '@/components/public/newsletter-section'
import { siteConfig } from '@/lib/site'
import { getEventsIndex } from '@/server/public/events'
import { buildHref, oneOf, pageParam, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Événements et agenda',
  description: `Master class, assemblées, webinaires et sessions de formation de la ${siteConfig.fullName} : inscrivez-vous en ligne aux prochains rendez-vous et retrouvez les comptes rendus des événements passés.`,
  alternates: { canonical: '/evenements' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/evenements'

/** Agenda public : événements à venir (cartes avec date en timbre bleu) et archive paginée des événements passés. */
export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const kind = oneOf(params.type, eventKinds)
  const page = pageParam(params.page)
  const index = await getEventsIndex({ kind, page })
  const current = { type: kind, page }

  const chips: FilterChip[] = [
    { label: 'Tous les types', href: buildHref(BASE, current, { type: undefined, page: undefined }), active: !kind },
    ...eventKinds.map((value) => ({ label: eventKindLabels[value], href: buildHref(BASE, current, { type: value, page: undefined }), active: kind === value })),
  ]

  const { upcoming, past } = index
  const nextEvent = upcoming[0]

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        tone="blue"
        title={
          <>
            Les <span className="italic text-blue-600">rendez-vous</span> de la Fédération
          </>
        }
        description="Master class, assemblées générales, webinaires et sessions de formation : les temps forts qui rassemblent les travailleurs et leurs organisations. Inscription en ligne, rappel avant l'événement, liste d'attente lorsque les places sont épuisées."
        breadcrumbs={[{ label: 'Événements' }]}
        homeHref="/"
        meta={
          <span>
            {upcoming.length} à venir · {past.total} passé{past.total > 1 ? 's' : ''}
            {kind ? ` · ${eventKindLabels[kind]}` : ''}
          </span>
        }
        actions={
          nextEvent ? (
            <Button asChild variant="primary" size="md">
              <Link href={`/evenements/${nextEvent.slug}`}>
                <CalendarDays aria-hidden="true" />
                Prochain rendez-vous
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-10" aria-labelledby="upcoming-title">
        <FilterChips label="Type" chips={chips} />

        {index.degraded ? (
          <Alert variant="warning">
            <AlertTitle>Agenda momentanément indisponible</AlertTitle>
            <AlertDescription>Les événements n&apos;ont pas pu être chargés. Réessayez dans quelques instants.</AlertDescription>
          </Alert>
        ) : null}

        <div>
          <Reveal>
            <SectionHeading
              eyebrow="À venir"
              tone="green"
              size="md"
              title={
                <span id="upcoming-title">
                  Prochains <span className="italic text-green-700">événements</span>
                </span>
              }
              className="mb-8"
            />
          </Reveal>
          {upcoming.length === 0 && !index.degraded ? (
            <EmptyState
              icon={CalendarDays}
              title={kind ? `Aucun événement de type « ${eventKindLabels[kind]} » programmé` : 'Aucun événement programmé pour le moment'}
              description="L'agenda est mis à jour régulièrement. Abonnez-vous à la lettre d'information pour être prévenu des prochains rendez-vous."
              action={
                kind ? (
                  <Button asChild variant="outline" size="md">
                    <Link href={BASE}>Tout l&apos;agenda</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : null}
          {upcoming.length > 0 ? (
            <Stagger as="ul" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((event) => (
                <StaggerItem key={event.id} as="li" className="h-full">
                  <EventCard event={event} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}
        </div>
      </Section>

      <Section variant="white" padding="md" bordered aria-labelledby="past-title" id="passes" className="scroll-mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Archives"
            tone="navy"
            size="md"
            title={
              <span id="past-title">
                Événements <span className="italic text-neutral-500">passés</span>
              </span>
            }
            description="Comptes rendus, replays et supports des rencontres organisées par la Fédération."
            className="mb-8"
          />
        </Reveal>
        {past.items.length === 0 ? (
          <EmptyState icon={History} title="Aucun événement passé" description="Les archives s'enrichiront au fil des rencontres de la Fédération." compact />
        ) : (
          <Stagger as="ul" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {past.items.map((event) => (
              <StaggerItem key={event.id} as="li" className="h-full">
                <EventCard event={event} compact />
              </StaggerItem>
            ))}
          </Stagger>
        )}
        <Pagination page={page} totalPages={past.totalPages} hrefFor={(target) => `${buildHref(BASE, current, { page: target })}#passes`} label="Pages des événements passés" className="mt-8" />
      </Section>

      <NewsletterSection />
    </>
  )
}
