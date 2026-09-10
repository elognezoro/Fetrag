import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, LogIn } from 'lucide-react'
import { accessLevelLabels, accessLevels, resourceKindLabels, resourceKinds } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Pagination, Reveal, Section, Stagger, StaggerItem } from '@fetrag/ui'
import { FilterChips, type FilterChip } from '@/components/public/filter-chips'
import { NewsletterSection } from '@/components/public/newsletter-section'
import { ResourceCard } from '@/components/public/resource-card'
import { SearchForm } from '@/components/public/search-form'
import { siteConfig } from '@/lib/site'
import { getResourcesIndex } from '@/server/public/resources'
import { buildHref, oneOf, pageParam, queryParam, slugParam, type SearchParamsRecord } from '@/server/public/search-params'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ressources documentaires',
  description: `Guides pratiques, textes juridiques, rapports, formulaires et supports de formation de la ${siteConfig.fullName}, en accès libre ou réservés aux membres.`,
  alternates: { canonical: '/ressources' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/ressources'

/** Bibliothèque documentaire : recherche, filtres (type, catégorie, accès), cartes avec cadenas et téléchargement. */
export default async function ResourcesPage({ searchParams }: PageProps) {
  const [params, viewer] = await Promise.all([searchParams, getViewer()])
  const page = pageParam(params.page)
  const kind = oneOf(params.type, resourceKinds)
  const categorySlug = slugParam(params.categorie)
  const accessLevel = oneOf(params.acces, accessLevels)
  const q = queryParam(params.q)

  const index = await getResourcesIndex({ page, kind, categorySlug, accessLevel, q }, viewer)
  const current = { page, type: kind, categorie: categorySlug, acces: accessLevel, q }
  const hasFilters = Boolean(kind || categorySlug || accessLevel || q)
  const { items, total, totalPages } = index.result

  const kindChips: FilterChip[] = [
    { label: 'Tous les types', href: buildHref(BASE, current, { type: undefined, page: undefined }), active: !kind },
    ...resourceKinds.map((value) => ({
      label: resourceKindLabels[value],
      href: buildHref(BASE, current, { type: value, page: undefined }),
      active: kind === value,
    })),
  ]
  const categoryChips: FilterChip[] = [
    { label: 'Toutes les catégories', href: buildHref(BASE, current, { categorie: undefined, page: undefined }), active: !categorySlug },
    ...index.categories.map((category) => ({
      label: category.name,
      href: buildHref(BASE, current, { categorie: category.slug, page: undefined }),
      active: categorySlug === category.slug,
      count: category.counts.resources,
    })),
  ]
  const accessChips: FilterChip[] = [
    { label: 'Tous les accès', href: buildHref(BASE, current, { acces: undefined, page: undefined }), active: !accessLevel },
    ...accessLevels.map((value) => ({
      label: accessLevelLabels[value],
      href: buildHref(BASE, current, { acces: value, page: undefined }),
      active: accessLevel === value,
    })),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Bibliothèque"
        tone="blue"
        title={
          <>
            Ressources <span className="italic text-blue-600">documentaires</span>
          </>
        }
        description="Guides pratiques, textes juridiques commentés, rapports, formulaires et supports de formation : les documents de référence de la Fédération pour les travailleurs et leurs représentants."
        breadcrumbs={[{ label: 'Ressources' }]}
        homeHref="/"
        meta={
          <span>
            {total} document{total > 1 ? 's' : ''}
            {q ? ` pour « ${q} »` : ''}
            {kind ? ` · ${resourceKindLabels[kind]}` : ''}
          </span>
        }
        actions={
          !viewer ? (
            <Button asChild variant="outline" size="md" className="h-auto min-h-11 max-w-full whitespace-normal py-2.5 text-center sm:h-11 sm:whitespace-nowrap sm:py-0">
              <Link href={`/connexion?callbackUrl=${encodeURIComponent(BASE)}`}>
                <LogIn aria-hidden="true" />
                Se connecter pour les documents réservés
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-8">
        <SearchForm
          action={BASE}
          query={q}
          placeholder="Rechercher un titre, un auteur, une source, un mot clé…"
          hidden={{ type: kind, categorie: categorySlug, acces: accessLevel }}
          resetHref={BASE}
        />
        <div className="flex flex-col gap-4">
          <FilterChips label="Type" chips={kindChips} />
          {categoryChips.length > 1 ? <FilterChips label="Catégorie" chips={categoryChips} /> : null}
          <FilterChips label="Accès" chips={accessChips} />
        </div>

        {index.degraded ? (
          <Alert variant="warning">
            <AlertTitle>Bibliothèque momentanément indisponible</AlertTitle>
            <AlertDescription>La liste des documents n&apos;a pas pu être chargée. Réessayez dans quelques instants.</AlertDescription>
          </Alert>
        ) : null}

        {items.length === 0 && !index.degraded ? (
          <EmptyState
            icon={BookOpen}
            title={hasFilters ? 'Aucun document ne correspond à ces critères' : 'La bibliothèque est en cours de constitution'}
            description={
              hasFilters
                ? 'Élargissez votre recherche ou revenez à l’ensemble des ressources.'
                : 'Les premiers guides, textes juridiques et rapports de la Fédération seront publiés ici prochainement.'
            }
            action={
              hasFilters ? (
                <Button asChild variant="outline" size="md">
                  <Link href={BASE}>Toutes les ressources</Link>
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {items.length > 0 ? (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((resource) => (
              <StaggerItem key={resource.id} as="li" className="h-full">
                <ResourceCard resource={resource} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}

        <Pagination page={page} totalPages={totalPages} hrefFor={(target) => buildHref(BASE, current, { page: target })} label="Pages de la bibliothèque" />

        <Reveal className="rounded-2xl border border-blue-100 bg-white p-5 text-sm leading-relaxed text-neutral-600 shadow-soft">
          <p>
            <strong className="font-semibold text-navy">Niveaux d&apos;accès.</strong> Les documents en accès libre sont téléchargeables par tous. Les documents
            « Membres » nécessitent un compte FETRAG, les documents « Organisation » sont réservés aux adhérents de l&apos;organisation concernée et les documents
            « Premium » sont accessibles après achat.
          </p>
        </Reveal>
      </Section>

      <NewsletterSection />
    </>
  )
}
