import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Organization, Partner } from '@fetrag/db'
import { Marquee, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { OrganizationSeal, type SealKind } from './organization-seal'

interface PartnersMarqueeProps {
  affiliates: Organization[]
  partners: Partner[]
}

interface SealEntry {
  key: string
  name: string
  acronym: string | null
  logoUrl: string | null
  kind: SealKind
  sector: string | null
}

/** Bandeau défilant des organisations affiliées et partenaires, en sceaux à anneau et étoile. */
export function PartnersMarquee({ affiliates, partners }: PartnersMarqueeProps) {
  const entries: SealEntry[] = [
    ...affiliates.map((org) => ({ key: `org-${org.id}`, name: org.name, acronym: org.acronym, logoUrl: org.logoUrl, kind: 'AFFILIATE' as const, sector: org.sector })),
    ...partners.map((partner) => ({ key: `partner-${partner.id}`, name: partner.name, acronym: partner.acronym, logoUrl: partner.logoUrl, kind: partner.kind, sector: partner.sector })),
  ]
  if (entries.length === 0) return null
  const affiliateCount = affiliates.length + partners.filter((p) => p.kind === 'AFFILIATE').length

  return (
    <Section variant="white" padding="md" bordered container={false} aria-labelledby="partners-title">
      <div className="container-fetrag">
        <Reveal>
          <SectionHeading
            eyebrow="Organisations affiliées et partenaires"
            tone="navy"
            size="md"
            title={
              <span id="partners-title">
                Ensemble, <span className="italic text-green-700">plus forts</span>
              </span>
            }
            description={
              affiliateCount > 0
                ? `${affiliateCount} organisation${affiliateCount > 1 ? 's' : ''} affiliée${affiliateCount > 1 ? 's' : ''} et des partenaires institutionnels engagés aux côtés de la Fédération.`
                : 'Les partenaires institutionnels et techniques qui accompagnent la Fédération.'
            }
            actions={
              <Link href="/organisations" className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Voir l&apos;annuaire
                <ArrowRight className="size-4 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            }
            className="mb-8"
          />
        </Reveal>
      </div>
      <Marquee speed={Math.max(30, entries.length * 6)} label="Organisations affiliées et partenaires" gapClassName="gap-8 sm:gap-12">
        {entries.map((entry) => (
          <Link
            key={entry.key}
            href="/organisations"
            className="flex w-40 shrink-0 flex-col items-center gap-3 rounded-2xl px-2 py-3 text-center transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
          >
            <OrganizationSeal name={entry.name} acronym={entry.acronym} logoUrl={entry.logoUrl} kind={entry.kind} size="md" />
            <span className="line-clamp-2 text-xs font-semibold leading-snug text-navy">{entry.name}</span>
            {entry.sector ? <span className="eyebrow text-[10px] text-neutral-500">{entry.sector}</span> : null}
          </Link>
        ))}
      </Marquee>
    </Section>
  )
}
