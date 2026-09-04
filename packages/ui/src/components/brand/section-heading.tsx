import * as React from 'react'

import { cn } from '../../lib/cn'
import { type Tone } from '../../lib/tones'
import { Ribbon } from './ribbon'

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Texte du ruban (eyebrow). */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  /** Tonalité du ruban. */
  tone?: Tone
  /** Niveau de titre rendu. */
  as?: 'h1' | 'h2' | 'h3'
  /** Taille du titre. */
  size?: 'md' | 'lg' | 'xl'
  /** Couleurs pour section sombre. */
  inverted?: boolean
  /** Zone d'actions (lien « Tout voir », boutons) alignée à droite sur grand écran. */
  actions?: React.ReactNode
}

const titleSizes = {
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl',
  xl: 'text-4xl sm:text-5xl lg:text-6xl',
} as const

/** En-tête de section : ruban + titre serif + accroche. Composant serveur. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'blue',
  as: Tag = 'h2',
  size = 'lg',
  inverted = false,
  actions,
  className,
  ...props
}: SectionHeadingProps) {
  const centered = align === 'center'
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered ? 'items-center text-center' : 'items-start',
        actions && !centered && 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className={cn('flex max-w-3xl flex-col gap-4', centered && 'items-center')}>
        {eyebrow ? <Ribbon tone={tone}>{eyebrow}</Ribbon> : null}
        <Tag
          className={cn(
            'font-display font-semibold leading-[1.08] tracking-tight text-balance',
            titleSizes[size],
            inverted ? 'text-white' : 'text-navy',
          )}
        >
          {title}
        </Tag>
        {description ? (
          <p className={cn('max-w-2xl text-base leading-relaxed sm:text-lg', inverted ? 'text-white/80' : 'text-neutral-600')}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
