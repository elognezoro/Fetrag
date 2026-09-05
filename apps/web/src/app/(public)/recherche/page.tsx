import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { searchTypeLabels, searchTypes, type SearchType } from '@fetrag/search'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { SearchForm } from '@/components/public/search-form'
import { SearchResults, SearchShortcuts } from '@/components/public/search-results'
import { siteConfig } from '@/lib/site'
import { parseSearchType, runSearch } from '@/server/public/search'
import { buildHref, queryParam, single, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Recherche',
  description: `Rechercher une actualité, une formation, un service, une ressource ou un événement sur le site de la ${siteConfig.fullName}.`,
  alternates: { canonical: '/recherche' },
  robots: { index: false, follow: true },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/recherche'

/** Recherche transverse (formulaire GET) : résultats groupés par type de contenu, filtre par type. */
export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawQuery = queryParam(params.q, 100)
  const type = parseSearchType(single(params.type))
  const data = await runSearch(rawQuery, type)
  const { query, result } = data
  const hasQuery = query.length >= 2

  const typeOptions = [{ value: '', label: 'Tous les contenus' }, ...searchTypes.map((value) => ({ value, label: searchTypeLabels[value] }))]
  const hrefForType = (target: SearchType) => buildHref(BASE, { q: query }, { type: target })

  return (
    <>
      <PageHeader
        eyebrow="Recherche"
        tone="navy"
        title={
          hasQuery ? (
            <>
              Résultats pour « <span className="italic text-blue-600">{query}</span> »
            </>
          ) : (
            <>
              Que <span className="italic text-blue-600">cherchez-vous</span> ?
            </>
          )
        }
        description={
          hasQuery
            ? `${result.total} résultat${result.total > 1 ? 's' : ''}${type ? ` dans ${searchTypeLabels[type].toLowerCase()}` : ' sur l’ensemble du site'}.`
            : "Actualités, formations, services, ressources documentaires, événements et pages institutionnelles : la recherche couvre tous les contenus publiés de la Fédération."
        }
        breadcrumbs={[{ label: 'Recherche' }]}
        homeHref="/"
      >
        <SearchForm
          action={BASE}
          query={query}
          placeholder="Ex. convention collective, licenciement, master class…"
          selects={[{ name: 'type', label: 'Type de contenu', options: typeOptions, value: type ?? '' }]}
          resetHref={BASE}
        />
      </PageHeader>

      <Section variant="default" padding="md" containerSize="wide" containerClassName="flex flex-col gap-10">
        {data.degraded ? (
          <Alert variant="warning">
            <AlertTitle>Recherche momentanément indisponible</AlertTitle>
            <AlertDescription>Le moteur de recherche n&apos;a pas répondu. Réessayez dans quelques instants ou parcourez les rubriques ci-dessous.</AlertDescription>
          </Alert>
        ) : null}

        {data.tooShort ? (
          <Alert variant="info">
            <AlertTitle>Recherche trop courte</AlertTitle>
            <AlertDescription>Saisissez au moins deux caractères pour lancer une recherche.</AlertDescription>
          </Alert>
        ) : null}

        {hasQuery && !data.degraded && result.groups.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`Aucun résultat pour « ${query} »`}
            description="Vérifiez l'orthographe, essayez un terme plus général ou parcourez les rubriques du site."
            action={
              type ? (
                <Button asChild variant="outline" size="md">
                  <Link href={buildHref(BASE, { q: query })}>Chercher dans tous les contenus</Link>
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {result.groups.length > 0 ? <SearchResults groups={result.groups} query={query} hrefForType={hrefForType} single={Boolean(type)} /> : null}

        {!hasQuery || result.groups.length === 0 ? (
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Parcourir"
                tone="blue"
                size="md"
                title={
                  <>
                    Les <span className="italic text-blue-600">rubriques</span> du site
                  </>
                }
                className="mb-8"
              />
            </Reveal>
            <SearchShortcuts />
          </div>
        ) : null}
      </Section>
    </>
  )
}
