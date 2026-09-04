'use client'

import * as React from 'react'

import { cn } from '../../lib/cn'
import { clamp, formatPercent } from '../../lib/format'
import { t } from '../../i18n/fr'
import { type Tone } from '../../lib/tones'
import { ArcRing } from './arc-ring'

export interface ProgressArcProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Progression en pourcentage (0-100). */
  value: number
  /** Libellé affiché sous le pourcentage et utilisé pour l'accessibilité. */
  label?: string
  size?: number
  stroke?: number
  /** Tonalité forcée ; par défaut : or < 50 %, vert sinon, bleu à 100 %. */
  tone?: Tone
  animate?: boolean
}

/** Progression LMS en arc (motif du logo), avec valeur en serif au centre. */
export function ProgressArc({ value, label, size = 112, stroke, tone, animate = true, className, ...props }: ProgressArcProps) {
  const bounded = clamp(Math.round(value), 0, 100)
  const resolvedTone: Tone = tone ?? (bounded >= 100 ? 'blue' : bounded < 50 ? 'gold' : 'green')
  const strokeWidth = stroke ?? Math.max(6, Math.round(size / 11))
  const valueSize = Math.max(14, Math.round(size * 0.22))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={bounded}
      aria-valuetext={formatPercent(bounded)}
      aria-label={label ?? t('a11y.progress', { value: bounded })}
      className={cn('inline-flex flex-col items-center gap-1', className)}
      {...props}
    >
      <ArcRing size={size} stroke={strokeWidth} progress={bounded} tone={resolvedTone} animate={animate}>
        <span className="font-display font-semibold tabular-nums leading-none text-navy" style={{ fontSize: valueSize }}>
          {bounded}
          <span className="ml-0.5 text-[0.55em] font-sans font-semibold text-neutral-500">%</span>
        </span>
      </ArcRing>
      {label ? <span className="max-w-[12rem] text-center text-xs font-semibold text-neutral-600">{label}</span> : null}
    </div>
  )
}
