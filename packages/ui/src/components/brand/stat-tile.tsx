import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { formatNumber } from '../../lib/format'
import { toneClasses, type Tone } from '../../lib/tones'
import { Counter } from '../motion/counter'

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valeur numérique (animée) ou texte libre. */
  value: number | string
  label: React.ReactNode
  icon?: LucideIcon
  tone?: Tone
  suffix?: string
  prefix?: string
  /** Anime le compteur à l'apparition (valeurs numériques uniquement). */
  animate?: boolean
  /** Décimales affichées pour les valeurs numériques. */
  decimals?: number
  /** Texte secondaire (variation, période). */
  description?: React.ReactNode
  /** Couleurs pour fond sombre. */
  inverted?: boolean
}

/** Tuile d'indicateur : grand chiffre serif animé, libellé et icône dans une pastille. */
export function StatTile({
  value,
  label,
  icon: Icon,
  tone = 'blue',
  suffix,
  prefix,
  animate = true,
  decimals = 0,
  description,
  inverted = false,
  className,
  ...props
}: StatTileProps) {
  const classes = toneClasses[tone]
  const isNumeric = typeof value === 'number'

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2.5 rounded-2xl border p-4 shadow-soft sm:gap-3 sm:p-6',
        classes.topRule,
        inverted ? 'border-white/15 bg-white/5 text-white' : 'border-neutral-200 bg-white text-ink',
        className,
      )}
      {...props}
    >
      {Icon ? (
        <span
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-full',
            inverted ? 'bg-white/10 text-white' : cn(classes.soft, classes.softText),
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
      ) : null}
      <p className={cn('font-display text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl lg:text-5xl', inverted ? 'text-white' : 'text-navy')}>
        {isNumeric && animate ? (
          <Counter to={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        ) : (
          <>
            {prefix}
            {isNumeric ? formatNumber(value, decimals) : value}
            {suffix}
          </>
        )}
      </p>
      <p className={cn('text-sm font-semibold', inverted ? 'text-white/80' : 'text-neutral-600')}>{label}</p>
      {description ? <p className={cn('text-xs', inverted ? 'text-white/60' : 'text-neutral-500')}>{description}</p> : null}
    </div>
  )
}
