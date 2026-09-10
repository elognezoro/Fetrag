import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Award, Clock, GraduationCap, Layers, ShieldCheck } from 'lucide-react'
import { courseModalities, courseModalityLabels, pillarLabels, pillars } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, PageHeader, Pagination, Reveal, Section, SectionHeading, Stagger, StaggerItem, StatTile, TriptychStrip } from '@fetrag/ui'
import { FilterChips, type FilterChip } from '@/components/public/filter-chips'
import { ModuleGrid } from '@/components/public/module-grid'
import { SearchForm } from '@/components/public/search-form'
import { StepsList } from '@/components/public/steps-list'
import { lmsHref, siteConfig } from '@/lib/site'
import { getCatalogue, getCatalogueSummary } from '@/server/public/catalogue'
import { PROGRAMME_SLOGAN } from '@/server/public/programme'
import { buildHref, oneOf, pageParam, queryParam, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Formations - Programme des Leaders Syndicaux 2026',
  description: `Les dix modules du Programme de formation des Leaders Syndicaux de la ${siteConfig.fullName} : droit du travail, négociation collective, gestion syndicale, leadership, santé et sécurité au travail.`,
  alternates: { canonical: '/formations' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/formations'

const enrolSteps = [
  { title: 'Créer un compte', description: 'Un seul compte FETRAG pour le site et la plateforme de formation, en quelques minutes.', icon: GraduationCap },
  { title: 'Choisir un module', description: 'Dix modules numérotés, du droit du travail à la santé-sécurité, avec objectifs et contenus détaillés.', icon: Layers },
  { title: 'Suivre la formation', description: 'À distance, en direct ou en hybride : leçons, évaluations, devoirs et forums accompagnés par un formateur.', icon: Clock },
  { title: 'Obtenir son certificat', description: 'Attestation ou certificat vérifiable par QR code, délivré au nom de la Fédération.', icon: Award },
]

/** Catalogue public des formations, synchronisé avec le LMS : filtres pilier et modalité, cartes numérotées 01-10. */
export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = pageParam(params.page)
  const pillar = oneOf(params.pilier, pillars)
  const modality = oneOf(params.modalite, courseModalities)
  const q = queryParam(params.q)

  const [catalogue, summary] = await Promise.all([getCatalogue({ q, pillar, modality, page }), getCatalogueSummary()])
  const current = { page, pilier: pillar, modalite: modality, q }
  const hasFilters = Boolean(pillar || modality || q)

  const pillarChips: FilterChip[] = [
    { label: 'Tous les piliers', href: buildHref(BASE, current, { pilier: undefined, page: undefined }), active: !pillar },
    ...pillars.map((value) => ({ label: pillarLabels[value], href: buildHref(BASE, current, { pilier: value, page: undefined }), active: pillar === value })),
  ]
  const modalityChips: FilterChip[] = [
    { label: 'Toutes les modalités', href: buildHref(BASE, current, { modalite: undefined, page: undefined }), active: !modality },
    ...courseModalities.map((value) => ({
      label: courseModalityLabels[value],
      href: buildHref(BASE, current, { modalite: value, page: undefined }),
      active: modality === value,
    })),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Programme de formation 2026"
        tone="green"
        size="lg"
        title={
          <>
            Former les <span className="italic text-green-700">leaders syndicaux</span> de demain
          </>
        }
        description={`${PROGRAMME_SLOGAN}. Dix modules conçus par la Fédération pour les responsables syndicaux, les délégués du personnel et les militants : des fondamentaux du syndicalisme gabonais à la santé et sécurité au travail.`}
        breadcrumbs={[{ label: 'Formations' }]}
        homeHref="/"
        actions={
          <>
            <Button asChild variant="accent" size="lg">
              <a href={lmsHref('/catalogue')}>
                <GraduationCap aria-hidden="true" />
                <span className="sm:hidden">S&apos;inscrire à la formation</span>

                <span className="hidden sm:inline">S&apos;inscrire sur formation.fetrag.ga</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/certificats/verifier">
                <ShieldCheck aria-hidden="true" />
                Vérifier un certificat
              </Link>
            </Button>
          </>
        }
        aside={
          <Stagger className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <StaggerItem>
              <StatTile value={summary.courses} label="modules" tone="blue" icon={Layers} />
            </StaggerItem>
            <StaggerItem>
              <StatTile value={summary.hours} label="heures de formation" tone="green" icon={Clock} suffix=" h" />
            </StaggerItem>
            <StaggerItem>
              <StatTile value={3} label="piliers fondateurs" tone="gold" icon={Award} />
            </StaggerItem>
          </Stagger>
        }
      >
        <TriptychStrip variant="bar" />
      </PageHeader>

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-8" aria-labelledby="catalogue-title">
        <h2 id="catalogue-title" className="sr-only">
          Catalogue des modules
        </h2>
        <SearchForm action={BASE} query={q} placeholder="Rechercher un module, un thème, un objectif…" hidden={{ pilier: pillar, modalite: modality }} resetHref={BASE} />
        <div className="flex flex-col gap-4">
          <FilterChips label="Pilier" chips={pillarChips} />
          <FilterChips label="Modalité" chips={modalityChips} />
        </div>

        {!catalogue.fromCatalog && !hasFilters ? (
          <Alert variant="info">
            <AlertTitle>Programme officiel 2026</AlertTitle>
            <AlertDescription>
              Le catalogue en ligne est en cours de publication. Vous consultez le programme officiel des dix modules ; les inscriptions ouvrent sur la plateforme de formation.
            </AlertDescription>
          </Alert>
        ) : null}

        {catalogue.modules.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Aucun module ne correspond à ces critères"
            description="Modifiez les filtres ou consultez l'ensemble du programme."
            action={
              <Button asChild variant="outline" size="md">
                <Link href={BASE}>Tout le programme</Link>
              </Button>
            }
          />
        ) : (
          <ModuleGrid modules={catalogue.modules} />
        )}

        <Pagination page={catalogue.page} totalPages={catalogue.totalPages} hrefFor={(target) => buildHref(BASE, current, { page: target })} label="Pages du catalogue" />
      </Section>

      <Section variant="white" padding="lg" bordered rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="enrol-title">
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            tone="blue"
            title={
              <span id="enrol-title">
                De l&apos;inscription au <span className="italic text-gold-700">certificat</span>
              </span>
            }
            description="Le parcours est le même pour un militant qui s'inscrit seul et pour une organisation qui forme ses responsables : la plateforme suit la progression, les évaluations et délivre les attestations."
            className="mb-10"
          />
        </Reveal>
        <StepsList steps={enrolSteps} />
        <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow text-[11px] text-blue-700">Organisations affiliées</p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-navy">Former vos responsables en groupe</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Une organisation affiliée peut déposer une demande de formation pour plusieurs participants : la coordination de la Fédération planifie une cohorte
              dédiée, en présentiel, en classe virtuelle ou en hybride, et crée les comptes des participants.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild variant="primary" size="lg">
              <a href={lmsHref('/demande-formation')}>
                Déposer une demande de formation
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/adhesion">Affilier mon organisation</Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
