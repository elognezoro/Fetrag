import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { type PillarName } from '../../lib/contracts'
import { padNumber } from '../../lib/format'
import { pillarTone, toneClasses } from '../../lib/tones'

export interface PillarCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Numéro affiché en grand chiffre serif (1 → « 01 »). */
  index: number
  title: React.ReactNode
  description: React.ReactNode
  icon?: LucideIcon
  pillar: PillarName
  /** Rend toute la carte cliquable. */
  href?: string
  /** Libellé du lien (affiché avec une flèche). */
  linkLabel?: string
}

/** Carte de pilier : filet supérieur coloré, grand chiffre serif, icône dans une pastille. */
export function PillarCard({
  index,
  title,
  description,
  icon: Icon,
  pillar,
  href,
  linkLabel = 'En savoir plus',
  className,
  ...props
}: PillarCardProps) {
  const tone = pillarTone[pillar]
  const classes = toneClasses[tone]

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden="true"
          className={cn('font-display text-5xl font-semibold leading-none tracking-tight', classes.text, 'opacity-80')}
        >
          {padNumber(index)}
        </span>
        {Icon ? (
          <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-full', classes.soft, classes.softText)}>
            <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold leading-tight tracking-tight text-navy sm:text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{description}</p>
      {href ? (
        <span className={cn('mt-5 inline-flex items-center gap-1.5 text-sm font-semibold', classes.text)}>
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-180 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
        </span>
      ) : null}
    </>
  )

  const cardClass = cn(
    'group relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-7',
    classes.topRule,
    'transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift',
    classes.glow,
    className,
  )

  if (href) {
    return (
      <div className={cn('h-full', className)} {...props}>
        <Link
          href={href}
          className={cn(cardClass, 'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40')}
        >
          {body}
        </Link>
      </div>
    )
  }

  return (
    <div className={cardClass} {...props}>
      {body}
    </div>
  )
}
