import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Building2 } from 'lucide-react'
import { Button, PageHeader, TriptychStrip } from '@fetrag/ui'
import { CatalogueFilters } from '@/components/learner/catalogue-filters'
import { CourseGrid } from '@/components/learner/course-grid'
import { getCatalogue } from '@/server/learner/queries'

export const metadata: Metadata = {
  title: 'Catalogue des formations',
  description:
    'Les dix modules du Programme de formation des Leaders Syndicaux 2026 de la FETRAG : filtrez par pilier, modalité et gratuité, puis inscrivez-vous en ligne.',
  alternates: { canonical: '/catalogue' },
}

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

/** Catalogue public : recherche, filtres pilier / modalité / gratuit, tri, grille des modules numérotés. */
export default async function CataloguePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const { items, total } = await getCatalogue({
    q: first(sp.q),
    pillar: first(sp.pilier),
    modality: first(sp.modalite),
    free: first(sp.gratuit) === '1',
    sort: first(sp.tri),
  })

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        tone="green"
        title={
          <>
            Les formations du <span className="italic text-green-700">programme 2026</span>
          </>
        }
        description="Dix modules numérotés, classés selon les trois piliers du triptyque fondateur. Chaque fiche détaille les objectifs, le programme, les formateurs et les prochaines sessions."
        breadcrumbs={[{ label: 'Catalogue' }]}
        homeHref="/"
        actions={
          <Button asChild variant="outline" size="md">
            <Link href="/demande-formation">
              <Building2 aria-hidden="true" />
              Demande pour une organisation
            </Link>
          </Button>
        }
      >
        {/* Sur mobile, la barre tricolore tronque les libellés : on affiche la variante compacte (pastilles). */}
        <TriptychStrip variant="inline" className="sm:hidden" aria-label="Légende des piliers" />
        <TriptychStrip variant="bar" className="hidden max-w-3xl sm:block" aria-label="Légende des piliers" />
      </PageHeader>

      <div className="container-fetrag flex flex-col gap-8 py-10 sm:py-12">
        <Suspense fallback={<div className="h-40 rounded-2xl border border-neutral-200 bg-white shadow-soft" aria-hidden="true" />}>
          <CatalogueFilters total={total} />
        </Suspense>
        <CourseGrid courses={items} label="Résultats du catalogue" />
      </div>
    </>
  )
}
