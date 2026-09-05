import { ArrowUpRight, MapPin, Users } from 'lucide-react'
import { Badge, cn, toneClasses, type Tone } from '@fetrag/ui'
import { OrganizationSeal, type SealKind } from './organization-seal'

export interface OrganizationCardData {
  id: string
  name: string
  acronym: string | null
  logoUrl: string | null
  sector: string | null
  city: string | null
  description: string | null
  website: string | null
  memberCount?: number | null
  kind: SealKind
}

interface OrganizationCardProps {
  organization: OrganizationCardData
  className?: string
}

const kindTone: Record<SealKind, Tone> = { AFFILIATE: 'blue', PARTNER: 'green', INSTITUTION: 'navy', INTERNATIONAL: 'gold' }

function websiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Carte « sceau » d'une organisation affiliée ou d'un partenaire : anneau, acronyme, secteur, ville, site web. */
export function OrganizationCard({ organization, className }: OrganizationCardProps) {
  const classes = toneClasses[kindTone[organization.kind]]
  return (
    <article
      className={cn(
        'flex h-full flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift',
        classes.topRule,
        className,
      )}
    >
      <OrganizationSeal name={organization.name} acronym={organization.acronym} logoUrl={organization.logoUrl} kind={organization.kind} size="lg" />
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-display text-lg font-semibold leading-tight text-navy text-balance">{organization.name}</h3>
        {organization.acronym ? (
          <Badge variant="outline" size="sm">
            {organization.acronym}
          </Badge>
        ) : null}
      </div>
      {organization.sector || organization.city ? (
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-neutral-500">
          {organization.sector ? <span className={classes.text}>{organization.sector}</span> : null}
          {organization.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {organization.city}
            </span>
          ) : null}
        </p>
      ) : null}
      {organization.description ? <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{organization.description}</p> : null}
      <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-1 text-xs font-semibold">
        {organization.memberCount ? (
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <Users className="size-3.5" aria-hidden="true" />
            {new Intl.NumberFormat('fr-FR').format(organization.memberCount)} adhérents
          </span>
        ) : null}
        {organization.website ? (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('inline-flex min-h-9 items-center gap-1 rounded-full px-2 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40', classes.text)}
          >
            {websiteLabel(organization.website)}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(site externe, nouvelle fenêtre)</span>
          </a>
        ) : null}
      </div>
    </article>
  )
}
