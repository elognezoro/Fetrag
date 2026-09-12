'use client'

import * as React from 'react'
import { ChevronDown, ListTree, Search, X } from 'lucide-react'
import { type GuideIconKey, type GuideTone } from '@fetrag/contracts'

import { cn } from '../../lib/cn'
import { toneClasses } from '../../lib/tones'
import { IconButton } from '../icon-button'
import { Input } from '../input'
import { guideIcon } from './guide-icons'
import { guideOrdinal } from './guide-text'

export interface GuideTocEntry {
  id: string
  title: string
  icon?: GuideIconKey
  /** Position dans le guide (numérotation « 01 »), indépendante du filtre. */
  index: number
}

export interface GuideTocProps {
  entries: GuideTocEntry[]
  /** Identifiant de la section visible à l'écran. */
  activeId?: string | null
  tone: GuideTone
  query: string
  onQueryChange: (value: string) => void
  /** Nombre de sections correspondant à la requête (toutes si la requête est vide). */
  total: number
  onNavigate?: (id: string) => void
  className?: string
}

function TocSearch({ query, onQueryChange, total, entriesCount, id }: { query: string; onQueryChange: (v: string) => void; total: number; entriesCount: number; id: string }) {
  const active = query.trim().length > 0
  return (
    <div className="flex flex-col gap-2" data-print-hide="">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        Rechercher dans le guide
      </label>
      <Input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Un mot, un bouton, un écran..."
        leadingIcon={Search}
        aria-describedby={`${id}-count`}
        trailing={
          active ? <IconButton size="sm" label="Effacer la recherche" icon={X} onClick={() => onQueryChange('')} /> : undefined
        }
      />
      <p id={`${id}-count`} role="status" aria-live="polite" className="min-h-5 text-xs text-neutral-500">
        {active
          ? total === 0
            ? 'Aucune section ne correspond'
            : `${total} ${total > 1 ? 'sections correspondent' : 'section correspond'}`
          : `${entriesCount} ${entriesCount > 1 ? 'sections' : 'section'}`}
      </p>
      {active ? (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-full px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-4" />
          Effacer
        </button>
      ) : null}
    </div>
  )
}

function TocList({ entries, activeId, tone, onNavigate, query }: Pick<GuideTocProps, 'entries' | 'activeId' | 'tone' | 'onNavigate' | 'query'>) {
  const t = toneClasses[tone]
  if (entries.length === 0) {
    return <p className="rounded-xl bg-neutral-50 px-3 py-3 text-sm text-neutral-600">Aucune section ne contient « {query.trim()} ». Essayez un autre mot.</p>
  }
  return (
    <ol className="flex flex-col gap-0.5">
      {entries.map((entry) => {
        const Icon = guideIcon(entry.icon, ListTree)
        const active = entry.id === activeId
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={active ? 'location' : undefined}
              onClick={() => onNavigate?.(entry.id)}
              className={cn(
                'group flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-neutral-700 transition-colors',
                'hover:bg-neutral-100 hover:text-navy focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                active && cn('font-semibold text-navy', t.soft),
              )}
            >
              <span aria-hidden="true" className={cn('w-6 shrink-0 font-display text-sm font-semibold tabular-nums', active ? t.text : 'text-neutral-400')}>
                {guideOrdinal(entry.index)}
              </span>
              <Icon aria-hidden="true" strokeWidth={1.75} className={cn('size-4 shrink-0', active ? t.text : 'text-neutral-400 group-hover:text-neutral-600')} />
              <span className="min-w-0 flex-1 text-wrap leading-snug">{entry.title}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Sommaire du guide : colonne collante sur grand écran, bloc repliable « Sommaire » sur mobile,
 * recherche accent-insensible dans les sections, section active suivie au défilement.
 */
export function GuideToc({ entries, activeId, tone, query, onQueryChange, total, onNavigate, className }: GuideTocProps) {
  const mobileId = React.useId()
  const desktopId = React.useId()
  const entriesCount = entries.length
  const t = toneClasses[tone]

  return (
    <>
      {/* Mobile et tablette : bloc repliable au-dessus du contenu. */}
      <details className={cn('group rounded-2xl border border-neutral-200 bg-white shadow-soft lg:hidden', className)} data-print-hide="">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 font-semibold text-navy marker:content-none [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className={cn('flex size-8 items-center justify-center rounded-full', t.soft, t.softText)}>
            <ListTree className="size-4" strokeWidth={1.75} />
          </span>
          <span className="flex-1">Sommaire</span>
          <ChevronDown aria-hidden="true" strokeWidth={1.75} className="size-5 text-neutral-500 transition-transform duration-180 ease-out-expo group-open:rotate-180" />
        </summary>
        <nav aria-label="Sommaire du guide" className="flex flex-col gap-4 border-t border-neutral-100 px-3 pb-4 pt-3">
          <TocSearch id={`${mobileId}-search`} query={query} onQueryChange={onQueryChange} total={total} entriesCount={entriesCount} />
          <TocList entries={entries} activeId={activeId} tone={tone} onNavigate={onNavigate} query={query} />
        </nav>
      </details>

      {/* Grand écran : colonne collante. */}
      <aside className={cn('hidden lg:block', className)} data-print-hide="">
        <nav
          aria-label="Sommaire du guide"
          className="sticky top-[calc(var(--header-height)+1rem)] flex max-h-[calc(100dvh-var(--header-height)-2rem)] flex-col gap-4 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft"
        >
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
            <ListTree aria-hidden="true" strokeWidth={1.75} className={cn('size-5', t.text)} />
            Sommaire
          </p>
          <TocSearch id={`${desktopId}-search`} query={query} onQueryChange={onQueryChange} total={total} entriesCount={entriesCount} />
          <TocList entries={entries} activeId={activeId} tone={tone} onNavigate={onNavigate} query={query} />
        </nav>
      </aside>
    </>
  )
}
