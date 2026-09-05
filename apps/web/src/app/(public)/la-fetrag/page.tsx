import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { seo, type PublicPage } from '@fetrag/cms'
import { Button, PageHeader, Prose, Reveal, Section, SectionHeading, TriptychStrip } from '@fetrag/ui'
import { BlockRenderer } from '@/components/public/blocks/block-renderer'
import { Timeline } from '@/components/public/blocks/timeline'
import { ValuesGrid } from '@/components/public/blocks/values-grid'
import { GovernanceSection } from '@/components/public/governance-section'
import { InstitutionHero } from '@/components/public/institution-hero'
import { JsonLd } from '@/components/public/json-ld'
import { MembershipCta } from '@/components/public/membership-cta'
import { MissionsList } from '@/components/public/missions-list'
import { StatsBand } from '@/components/public/stats-band'
import { lmsHref, siteConfig } from '@/lib/site'
import { getHomeStats } from '@/server/public/home'
import { HISTORY_TIMELINE, MISSION_TEXT, PILLAR_DESCRIPTIONS, VALUES } from '@/server/public/institution'
import { loadPage } from '@/server/public/loaders'
import { toMetadata } from '@/server/public/metadata'
import { PROGRAMME_SLOGAN } from '@/server/public/programme'
import { safeQuery } from '@/server/public/safe'

export const revalidate = 600

const SLUG = 'la-fetrag'

const staticMetadata: Metadata = {
  title: 'La FETRAG',
  description: `${MISSION_TEXT} Histoire, missions, valeurs, triptyque fondateur et gouvernance de la ${siteConfig.fullName}.`,
  alternates: { canonical: '/la-fetrag' },
  openGraph: { type: 'website', url: '/la-fetrag', title: `La FETRAG | ${siteConfig.name}`, description: MISSION_TEXT },
}

async function getPage(): Promise<PublicPage | null> {
  return safeQuery(`pages.getPublished(${SLUG})`, () => loadPage(SLUG), null)
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage()
  if (!page) return staticMetadata
  return { ...toMetadata(seo.buildMetadata('page', page)), alternates: { canonical: '/la-fetrag' } }
}

/** Section triptyque fondateur (partagée entre la version CMS sans bloc dédié et le repli statique). */
function TriptychSection() {
  return (
    <Section variant="white" padding="md" rings={{ position: 'left', opacity: 0.05, rings: 3 }} aria-labelledby="triptych-title">
      <Reveal>
        <SectionHeading
          eyebrow="Triptyque fondateur"
          tone="green"
          title={
            <span id="triptych-title">
              Protection, prévention, <span className="italic text-gold-700">défense</span>
            </span>
          }
          description="Trois engagements indissociables, inscrits dans l'acte fondateur de la Fédération, qui structurent son action et son programme de formation."
          className="mb-10"
        />
        <TriptychStrip
          variant="cards"
          items={{
            protection: { description: PILLAR_DESCRIPTIONS.protection },
            prevention: { description: PILLAR_DESCRIPTIONS.prevention },
            defense: { description: PILLAR_DESCRIPTIONS.defense },
          }}
        />
      </Reveal>
    </Section>
  )
}

/** Passerelle vers le programme de formation 2026 et la plateforme. */
function ProgrammeBridge() {
  return (
    <Section variant="soft" padding="md" bordered aria-labelledby="programme-bridge-title">
      <Reveal className="flex flex-col items-start gap-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-[11px] text-blue-700">Programme de formation 2026</p>
          <h2 id="programme-bridge-title" className="mt-2 font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
            {PROGRAMME_SLOGAN}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Dix modules pour les leaders syndicaux, du droit du travail à la santé-sécurité, dispensés sur la plateforme formation.fetrag.ga avec des
            certificats vérifiables.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="primary" size="lg">
            <Link href="/formations">
              Voir les dix modules
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="accent" size="lg">
            <a href={lmsHref('/')}>
              <GraduationCap aria-hidden="true" />
              Plateforme de formation
            </a>
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}

/**
 * Page « La FETRAG » : rendue depuis les blocs de la page CMS `la-fetrag` lorsqu'elle est publiée,
 * sinon à partir des contenus institutionnels officiels (repli statique complet).
 */
export default async function InstitutionPage() {
  const [page, stats] = await Promise.all([getPage(), getHomeStats()])

  if (page && page.blocks && page.blocks.length > 0) {
    return (
      <>
        <JsonLd data={seo.jsonLd('page', page)} />
        <BlockRenderer blocks={page.blocks} />
        {page.content.trim().length > 0 ? (
          <Section variant="white" padding="md" containerSize="wide" bordered>
            <Prose html={page.content} as="article" />
          </Section>
        ) : null}
        <MembershipCta />
      </>
    )
  }

  if (page && page.content.trim().length > 0) {
    return (
      <>
        <JsonLd data={seo.jsonLd('page', page)} />
        <PageHeader
          eyebrow={siteConfig.fullName}
          title={page.title}
          description={page.excerpt ?? MISSION_TEXT}
          breadcrumbs={[{ label: page.title }]}
          homeHref="/"
          size="lg"
        />
        <Section variant="white" padding="md" containerSize="wide">
          <Prose html={page.content} as="article" size="lg" />
        </Section>
        <TriptychSection />
        <GovernanceSection />
        <MembershipCta />
      </>
    )
  }

  return (
    <>
      <JsonLd data={seo.organizationJsonLd()} />
      <InstitutionHero />
      <StatsBand stats={stats} />
      <MissionsList />
      <Timeline
        eyebrow="Notre histoire"
        title="Du mouvement ouvrier à la fédération intersectorielle"
        description="Les repères qui ont façonné le syndicalisme gabonais et conduit à la création de la FETRAG."
        items={HISTORY_TIMELINE}
      />
      <ValuesGrid
        eyebrow="Nos valeurs"
        title="Travail, efficacité, solidarité"
        description="Les trois mots de notre devise ne sont pas un slogan : ils guident chaque négociation, chaque formation et chaque décision de la Fédération."
        items={VALUES.map((value, index) => ({
          title: value.title,
          description: value.description,
          icon: index === 0 ? 'award' : index === 1 ? 'target' : 'heart-handshake',
        }))}
      />
      <TriptychSection />
      <GovernanceSection />
      <ProgrammeBridge />
      <MembershipCta />
    </>
  )
}
