import Link from 'next/link'
import { ArrowRight, BookOpen, CalendarDays, FileText, GraduationCap, LifeBuoy, Newspaper, type LucideIcon } from 'lucide-react'
import type { SearchGroup, SearchType } from '@fetrag/search'
import { formatDate } from '@fetrag/domain'
import { Badge, Reveal, Ribbon, Stagger, StaggerItem, cn, toneClasses, type Tone } from '@fetrag/ui'

const typeMeta: Record<SearchType, { icon: LucideIcon; tone: Tone; href: string }> = {
  article: { icon: Newspaper, tone: 'gold', href: '/actualites' },
  page: { icon: FileText, tone: 'navy', href: '/la-fetrag' },
  resource: { icon: BookOpen, tone: 'blue', href: '/ressources' },
  course: { icon: GraduationCap, tone: 'green', href: '/formations' },
  service: { icon: LifeBuoy, tone: 'green', href: '/services' },
  event: { icon: CalendarDays, tone: 'blue', href: '/evenements' },
}

interface SearchResultsProps {
  groups: SearchGroup[]
  query: string
  /** Lien pour restreindre la recherche à un type. */
  hrefForType: (type: SearchType) => string
  /** Vrai si un seul type est déjà sélectionné (masque le lien « Tout voir »). */
  single: boolean
}

/** Résultats de recherche regroupés par type de contenu : ruban, liste de résultats et lien vers le type. */
export function SearchResults({ groups, query, hrefForType, single }: SearchResultsProps) {
  return (
    <div className="flex flex-col gap-12">
      {groups.map((group, groupIndex) => {
        const meta = typeMeta[group.type]
        const classes = toneClasses[meta.tone]
        const Icon = meta.icon
        const more = group.total - group.items.length
        const headingId = `results-${group.type}`
        return (
          <section key={group.type} aria-labelledby={headingId}>
            <Reveal delay={groupIndex * 0.05} className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn('inline-flex size-10 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <Ribbon tone={meta.tone} size="sm">
                    {group.label}
                  </Ribbon>
                  <h2 id={headingId} className="mt-1.5 font-display text-xl font-semibold text-navy">
                    {group.total} résultat{group.total > 1 ? 's' : ''} dans {group.label.toLowerCase()}
                  </h2>
                </div>
              </div>
              {!single && more > 0 ? (
                <Link href={hrefForType(group.type)} className={cn('group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold', classes.text)}>
                  Voir les {group.total} résultats
                  <ArrowRight className="size-4 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ) : null}
            </Reveal>
            <Stagger as="ol" className="flex flex-col gap-3">
              {group.items.map((item) => (
                <StaggerItem key={item.id} as="li">
                  <article
                    className={cn(
                      'group relative flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift',
                      classes.topRule,
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {item.badge ? <Badge variant="neutral">{item.badge}</Badge> : null}
                      {item.date ? (
                        <time dateTime={new Date(item.date).toISOString()} className="text-xs font-semibold text-neutral-500">
                          {formatDate(item.date)}
                        </time>
                      ) : null}
                    </div>
                    <h3 className="font-display text-lg font-semibold leading-tight text-navy">
                      <Link href={item.href} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {item.title}
                      </Link>
                    </h3>
                    {item.excerpt ? <p className="text-sm leading-relaxed text-neutral-600">{item.excerpt}</p> : null}
                    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', classes.text)}>
                      Consulter
                      <ArrowRight className="size-3.5 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
            {single && more > 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                {more} autre{more > 1 ? 's' : ''} résultat{more > 1 ? 's' : ''} pour « {query} » : affinez votre recherche pour les retrouver.
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

/** Raccourcis vers les rubriques du site, affichés sans requête ou sans résultat. */
export function SearchShortcuts() {
  const entries: Array<{ type: SearchType; label: string; description: string }> = [
    { type: 'article', label: 'Actualités', description: 'Communiqués et prises de position' },
    { type: 'course', label: 'Formations', description: 'Les dix modules du programme 2026' },
    { type: 'service', label: 'Services', description: 'Appui juridique, médiation, formation sur mesure' },
    { type: 'resource', label: 'Ressources', description: 'Guides, textes juridiques, rapports' },
    { type: 'event', label: 'Événements', description: 'Master class, assemblées, webinaires' },
    { type: 'page', label: 'La FETRAG', description: 'Histoire, missions, gouvernance' },
  ]
  return (
    <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const meta = typeMeta[entry.type]
        const classes = toneClasses[meta.tone]
        const Icon = meta.icon
        return (
          <StaggerItem key={entry.type} as="li">
            <Link
              href={meta.href}
              className={cn(
                'group flex h-full items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                classes.topRule,
              )}
            >
              <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-lg font-semibold text-navy">{entry.label}</span>
                <span className="text-sm text-neutral-600">{entry.description}</span>
              </span>
              <ArrowRight className={cn('ml-auto mt-1 size-4 shrink-0 transition-transform duration-180 group-hover:translate-x-0.5', classes.text)} aria-hidden="true" />
            </Link>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
