import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { type PillarName } from '../../lib/contracts'
import { padNumber } from '../../lib/format'
import { pillarTone, toneClasses, type Tone } from '../../lib/tones'
import { Badge } from '../badge'

export interface ModuleCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Numéro du module (« 01 » à « 10 »). */
  number: string | number
  title: React.ReactNode
  /** Les contenus du module (généralement trois). */
  items: string[]
  pillar: PillarName | Tone
  href?: string
  /** Durée affichée (ex. « 6 h »). */
  duration?: string
  /** Étiquette (ex. « Nouveau », « À la une »). */
  badge?: React.ReactNode
  /** Icône des éléments de la liste (défaut : coche cerclée). */
  itemIcon?: LucideIcon
  linkLabel?: string
}

/**
 * Carte de module du programme : grand chiffre serif, filet vertical coloré par pilier,
 * liste des contenus avec icône lucide, survol relevé. Composant serveur.
 */
export function ModuleCard({
  number,
  title,
  items,
  pillar,
  href,
  duration,
  badge,
  itemIcon: ItemIcon = CheckCircle2,
  linkLabel = 'Découvrir le module',
  className,
  ...props
}: ModuleCardProps) {
  const tone: Tone = pillar in pillarTone ? pillarTone[pillar as PillarName] : (pillar as Tone)
  const classes = toneClasses[tone]

  const content = (
    <>
      <div className="flex gap-5">
        <div className="flex shrink-0 flex-col items-center">
          <span aria-hidden="true" className={cn('font-display text-5xl font-semibold leading-none tracking-tight', classes.text)}>
            {padNumber(number)}
          </span>
          <span aria-hidden="true" className={cn('mt-3 w-1 flex-1 rounded-full', classes.bg)} />
        </div>
        <div className="min-w-0 flex-1">
          {badge || duration ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {badge ? typeof badge === 'string' ? <Badge variant={tone === 'navy' ? 'navy' : tone}>{badge}</Badge> : badge : null}
              {duration ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500">
                  <Clock className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  {duration}
                </span>
              ) : null}
            </div>
          ) : null}
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-navy">
            <span className="sr-only">Module {padNumber(number)} : </span>
            {title}
          </h3>
          {items.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-700">
                  <ItemIcon className={cn('mt-0.5 size-4 shrink-0', classes.text)} strokeWidth={2} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {href ? (
            <span className={cn('mt-5 inline-flex items-center gap-1.5 text-sm font-semibold', classes.text)}>
              {linkLabel}
              <ArrowRight className="size-4 transition-transform duration-180 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </div>
    </>
  )

  const cardClass = cn(
    'group relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft',
    'transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift',
    classes.glow,
  )

  if (href) {
    return (
      <article className={cn('h-full', className)} {...props}>
        <Link href={href} className={cn(cardClass, 'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40')}>
          {content}
        </Link>
      </article>
    )
  }

  return (
    <article className={cn(cardClass, className)} {...props}>
      {content}
    </article>
  )
}
