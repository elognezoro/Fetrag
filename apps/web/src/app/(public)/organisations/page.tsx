import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Handshake } from 'lucide-react'
import type { PartnerKind } from '@fetrag/cms'
import { Button, EmptyState, PageHeader, Reveal, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { FilterChips, type FilterChip } from '@/components/public/filter-chips'
import { MembershipCta } from '@/components/public/membership-cta'
import { OrganizationCard, type OrganizationCardData } from '@/components/public/organization-card'
import { sealKindIcon } from '@/components/public/organization-seal'
import { siteConfig } from '@/lib/site'
import { getOrganizationsDirectory } from '@/server/public/organizations'
import { buildHref, labelParam, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Organisations affiliées et partenaires',
  description: `Annuaire des organisations syndicales affiliées à la ${siteConfig.fullName} et des partenaires institutionnels, techniques et internationaux qui accompagnent son action.`,
  alternates: { canonical: '/organisations' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const BASE = '/organisations'

/** Annuaire public : organisations affiliées (cartes « sceau ») et partenaires regroupés par type, filtrables par secteur. */
export default async function OrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sector = labelParam(params.secteur)
  const directory = await getOrganizationsDirectory(sector)

  const chips: FilterChip[] = [
    { label: 'Tous les secteurs', href: BASE, active: !sector },
    ...directory.sectors.map((value) => ({ label: value, href: buildHref(BASE, {}, { secteur: value }), active: sector?.toLowerCase() === value.toLowerCase() })),
  ]

  const affiliates: OrganizationCardData[] = directory.affiliates.map((org) => ({
    id: org.id,
    name: org.name,
    acronym: org.acronym,
    logoUrl: org.logoUrl,
    sector: org.sector,
    city: org.city,
    description: org.description,
    website: org.website,
    memberCount: org.memberCount,
    kind: 'AFFILIATE',
  }))

  const hasContent = affiliates.length > 0 || directory.groups.length > 0

  return (
    <>
      <PageHeader
        eyebrow="Annuaire"
        tone="navy"
        title={
          <>
            Organisations affiliées et <span className="italic text-green-700">partenaires</span>
          </>
        }
        description="La force de la Fédération vient de ses organisations membres et des institutions qui l'accompagnent. Retrouvez-les par secteur d'activité et prenez contact avec elles."
        breadcrumbs={[{ label: 'Organisations' }]}
        homeHref="/"
        meta={
          <span>
            {directory.total} organisation{directory.total > 1 ? 's' : ''} référencée{directory.total > 1 ? 's' : ''}
            {sector ? ` dans le secteur « ${sector} »` : ''}
          </span>
        }
        actions={
          <>
            <Button asChild variant="primary" size="md">
              <Link href="/adhesion">
                <Building2 aria-hidden="true" />
                Affilier mon organisation
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/partenariat">
                <Handshake aria-hidden="true" />
                Devenir partenaire
              </Link>
            </Button>
          </>
        }
      />

      <Section variant="default" padding="md" containerClassName="flex flex-col gap-12">
        {chips.length > 1 ? <FilterChips label="Secteur" chips={chips} /> : null}

        {!hasContent ? (
          <EmptyState
            icon={Building2}
            title={sector ? `Aucune organisation dans le secteur « ${sector} »` : "L'annuaire est en cours de constitution"}
            description={
              sector
                ? 'Essayez un autre secteur ou consultez l’ensemble de l’annuaire.'
                : 'Les organisations affiliées et les partenaires de la Fédération apparaîtront ici dès leur référencement.'
            }
            action={
              sector ? (
                <Button asChild variant="outline" size="md">
                  <Link href={BASE}>Voir tout l&apos;annuaire</Link>
                </Button>
              ) : (
                <Button asChild variant="primary" size="md">
                  <Link href="/adhesion">Demander l&apos;affiliation</Link>
                </Button>
              )
            }
          />
        ) : null}

        {affiliates.length > 0 ? (
          <div aria-labelledby="affiliates-title">
            <Reveal>
              <SectionHeading
                eyebrow="Organisations affiliées"
                tone="blue"
                size="md"
                title={
                  <span id="affiliates-title">
                    Les syndicats <span className="italic text-blue-600">membres</span> de la Fédération
                  </span>
                }
                description="Organisations syndicales affiliées, représentées dans les instances de la FETRAG et bénéficiaires de ses services et de son programme de formation."
                className="mb-8"
              />
            </Reveal>
            <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {affiliates.map((organization) => (
                <StaggerItem key={organization.id} as="li" className="h-full">
                  <OrganizationCard organization={organization} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ) : null}

        {directory.groups.map((group) => {
          const Icon = sealKindIcon(group.kind)
          const tone: Record<PartnerKind, 'blue' | 'green' | 'navy' | 'gold'> = { AFFILIATE: 'blue', PARTNER: 'green', INSTITUTION: 'navy', INTERNATIONAL: 'gold' }
          const headingId = `group-${group.kind.toLowerCase()}`
          return (
            <div key={group.kind} aria-labelledby={headingId}>
              <Reveal>
                <SectionHeading
                  eyebrow={
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="size-3.5" aria-hidden="true" />
                      {group.label}
                    </span>
                  }
                  tone={tone[group.kind]}
                  size="md"
                  title={<span id={headingId}>{group.label}</span>}
                  description={group.description}
                  className="mb-8"
                />
              </Reveal>
              <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((partner) => (
                  <StaggerItem key={partner.id} as="li" className="h-full">
                    <OrganizationCard
                      organization={{
                        id: partner.id,
                        name: partner.name,
                        acronym: partner.acronym,
                        logoUrl: partner.logoUrl,
                        sector: partner.sector,
                        city: partner.city,
                        description: partner.description,
                        website: partner.website,
                        kind: partner.kind,
                      }}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )
        })}
      </Section>

      <MembershipCta
        eyebrow="Rejoindre l'annuaire"
        title={
          <>
            Votre organisation a sa place <span className="italic text-gold-400">à nos côtés</span>
          </>
        }
        description="Affiliation d'un syndicat, partenariat institutionnel, technique ou international : chaque demande est examinée par le Secrétariat général et présentée aux instances de la Fédération."
      />
    </>
  )
}
