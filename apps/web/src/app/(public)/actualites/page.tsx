import type { Metadata } from 'next'
import Link from 'next/link'
import { Megaphone, Newspaper, Rss } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Pagination, Section, Stagger, StaggerItem, cn } from '@fetrag/ui'
import { ArticleCard } from '@/components/public/article-card'
import { FilterChips, type FilterChip } from '@/components/public/filter-chips'
import { NewsletterSection } from '@/components/public/newsletter-section'
import { SearchForm } from '@/components/public/search-form'
import { siteConfig } from '@/lib/site'
import { getNewsIndex } from '@/server/public/news'
import { boolParam, buildHref, labelParam, pageParam, queryParam, slugParam, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Actualités et communiqués',
  description: `Communiqués, prises de position, comptes rendus de négociations et informations pratiques de la ${siteConfig.fullName} pour les travailleurs et leurs organisations.`,
  alternates: { canonical: '/actualites' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/actualites'

/** Index des actualités : recherche, filtres (catégorie, tag, communiqués), grille paginée. */
export default async function NewsIndexPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = pageParam(params.page)
  const categorySlug = slugParam(params.categorie)
  const tag = labelParam(params.tag, 40)
  const q = queryParam(params.q)
  const communique = boolParam(params.communiques)

  const index = await getNewsIndex({ page, categorySlug, tag, q, communique })
  const current = { page, categorie: categorySlug, tag, q, communiques: communique ? '1' : undefined }
  const hasFilters = Boolean(categorySlug || tag || q || communique)
  const { items, total, totalPages } = index.result

  const categoryChips: FilterChip[] = [
    { label: 'Toutes', href: buildHref(BASE, current, { categorie: undefined, communiques: undefined, page: undefined }), active: !categorySlug && !communique },
    { label: 'Communiqués', href: buildHref(BASE, current, { categorie: undefined, communiques: '1', page: undefined }), active: communique },
    ...index.categories.map((category) => ({
      label: category.name,
      href: buildHref(BASE, current, { categorie: category.slug, communiques: undefined, page: undefined }),
      active: categorySlug === category.slug,
      count: category.counts.articles,
    })),
  ]

  const tagChips: FilterChip[] = index.tags.map((entry) => ({
    label: `#${entry.tag}`,
    href: buildHref(BASE, current, { tag: tag === entry.tag ? undefined : entry.tag, page: undefined }),
    active: tag === entry.tag,
    count: entry.count,
  }))

  const featureFirst = page === 1 && !hasFilters && items.length >= 3

  return (
    <>
      <PageHeader
        eyebrow="Actualités"
        tone="gold"
        title={
          <>
            La vie de la <span className="italic text-gold-700">Fédération</span>
          </>
        }
        description="Communiqués officiels, prises de position, comptes rendus de négociations et informations pratiques pour les travailleurs et leurs organisations."
        breadcrumbs={[{ label: 'Actualités' }]}
        homeHref="/"
        meta={
          <span>
            {total} publication{total > 1 ? 's' : ''}
            {communique ? ' (communiqués)' : ''}
            {q ? ` pour « ${q} »` : ''}
          </span>
        }
        actions={
          <Button asChild variant="outline" size="md">
            <Link href={buildHref(BASE, {}, { communiques: '1' })}>
              <Megaphone aria-hidden="true" />
              Communiqués officiels
            </Link>
          </Button>
        }
      />

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-8">
        <SearchForm
          action={BASE}
          query={q}
          placeholder="Rechercher un titre, un mot clé, un thème…"
          hidden={{ categorie: categorySlug, tag, communiques: communique ? '1' : undefined }}
          resetHref={BASE}
        />
        <div className="flex flex-col gap-4">
          <FilterChips label="Rubrique" chips={categoryChips} />
          {tagChips.length > 0 ? <FilterChips label="Mots clés" chips={tagChips} /> : null}
        </div>

        {index.degraded ? (
          <Alert variant="warning">
            <AlertTitle>Actualités momentanément indisponibles</AlertTitle>
            <AlertDescription>La liste des publications n&apos;a pas pu être chargée. Réessayez dans quelques instants.</AlertDescription>
          </Alert>
        ) : null}

        {items.length === 0 && !index.degraded ? (
          <EmptyState
            icon={Newspaper}
            title={hasFilters ? 'Aucune publication ne correspond à ces critères' : 'Aucune actualité publiée pour le moment'}
            description={hasFilters ? 'Élargissez votre recherche ou revenez à l’ensemble des actualités.' : 'Les prochaines publications de la Fédération apparaîtront ici.'}
            action={
              hasFilters ? (
                <Button asChild variant="outline" size="md">
                  <Link href={BASE}>Toutes les actualités</Link>
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {items.length > 0 ? (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article, index) => {
              const featured = featureFirst && index === 0
              return (
                <StaggerItem key={article.id} as="li" className={cn('h-full', featured && 'sm:col-span-2')}>
                  <ArticleCard article={article} featured={featured} priority={index < 3} />
                </StaggerItem>
              )
            })}
          </Stagger>
        ) : null}

        <Pagination page={page} totalPages={totalPages} hrefFor={(target) => buildHref(BASE, current, { page: target })} label="Pages des actualités" />

        <p className="inline-flex items-center gap-2 text-xs text-neutral-500">
          <Rss className="size-3.5" aria-hidden="true" />
          Recevez les nouvelles publications par email grâce à la lettre d&apos;information ci-dessous.
        </p>
      </Section>

      <NewsletterSection />
    </>
  )
}
