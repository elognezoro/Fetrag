import * as React from 'react'
import { HeartHandshake, Scale, ShieldCheck, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { pillarLabels, pillars, type PillarName } from '../../lib/contracts'
import { padNumber } from '../../lib/format'
import { pillarTone, toneClasses } from '../../lib/tones'

export interface TriptychItem {
  pillar: PillarName
  label?: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  href?: string
}

export interface TriptychStripProps extends React.HTMLAttributes<HTMLElement> {
  /** `cards` : trois cartes ; `inline` : bandeau compact (pastilles colorées) ; `bar` : barre tricolore avec libellés. */
  variant?: 'cards' | 'inline' | 'bar'
  /** Surcharge des libellés / descriptions (par défaut : `pillarLabels` de contracts). */
  items?: Partial<Record<PillarName, Omit<TriptychItem, 'pillar'>>>
  /** Couleurs pour fond sombre. */
  inverted?: boolean
}

const defaultIcons: Record<PillarName, LucideIcon> = {
  protection: ShieldCheck,
  prevention: HeartHandshake,
  defense: Scale,
}

/** Les trois piliers fondateurs (Protection = bleu, Prévention = vert, Défense = or). Composant serveur. */
export function TriptychStrip({ variant = 'cards', items, inverted = false, className, ...props }: TriptychStripProps) {
  const entries: TriptychItem[] = pillars.map((pillar) => ({
    pillar,
    label: items?.[pillar]?.label ?? pillarLabels[pillar],
    description: items?.[pillar]?.description,
    icon: items?.[pillar]?.icon ?? defaultIcons[pillar],
  }))

  if (variant === 'bar') {
    return (
      <div className={cn('overflow-hidden rounded-full border border-neutral-200 shadow-soft', className)} {...props}>
        <ol className="grid grid-cols-3">
          {entries.map((entry, index) => {
            const tone = pillarTone[entry.pillar]
            return (
              <li
                key={entry.pillar}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] sm:text-xs',
                  toneClasses[tone].bg,
                  toneClasses[tone].onTone,
                )}
              >
                <span className="font-display text-sm font-semibold normal-case tracking-tight opacity-80">{padNumber(index + 1)}</span>
                <span className="truncate">{entry.label}</span>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <ol className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)} {...props}>
        {entries.map((entry) => {
          const tone = pillarTone[entry.pillar]
          return (
            <li key={entry.pillar} className="inline-flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden="true" className={cn('size-2.5 rounded-full', toneClasses[tone].bg)} />
              <span className={inverted ? 'text-white' : 'text-navy'}>{entry.label}</span>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className={cn('grid gap-4 sm:grid-cols-3 sm:gap-6', className)} {...props}>
      {entries.map((entry, index) => {
        const tone = pillarTone[entry.pillar]
        const classes = toneClasses[tone]
        const Icon = entry.icon ?? defaultIcons[entry.pillar]
        return (
          <li
            key={entry.pillar}
            className={cn(
              'relative flex flex-col gap-4 rounded-2xl border p-6 shadow-soft',
              classes.topRule,
              inverted ? 'border-white/15 bg-white/5 text-white' : 'border-neutral-200 bg-white text-ink',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('inline-flex size-11 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', inverted ? 'text-white/40' : classes.text)}>
                {padNumber(index + 1)}
              </span>
            </div>
            <h3 className={cn('font-display text-lg font-semibold leading-snug tracking-tight', inverted ? 'text-white' : 'text-navy')}>
              {entry.label}
            </h3>
            {entry.description ? (
              <p className={cn('text-sm leading-relaxed', inverted ? 'text-white/75' : 'text-neutral-600')}>{entry.description}</p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
