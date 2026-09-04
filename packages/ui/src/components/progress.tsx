'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '../lib/cn'
import { clamp, formatPercent } from '../lib/format'
import { toneClasses, type Tone } from '../lib/tones'

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Valeur en pourcentage (0-100). */
  value?: number
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  /** Affiche le pourcentage à droite de la barre. */
  showValue?: boolean
  /** Libellé accessible (obligatoire si aucun libellé visible n'est associé). */
  label?: string
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' } as const

/** Barre de progression linéaire (Radix Progress). */
export const Progress = React.forwardRef<React.ComponentRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  function Progress({ className, value = 0, tone = 'green', size = 'md', showValue = false, label, ...props }, ref) {
    const bounded = clamp(Math.round(value), 0, 100)
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <ProgressPrimitive.Root
          ref={ref}
          value={bounded}
          max={100}
          aria-label={label}
          aria-valuetext={formatPercent(bounded)}
          className={cn('relative w-full flex-1 overflow-hidden rounded-full bg-neutral-200', heights[size])}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn('h-full rounded-full transition-[width] duration-700 ease-out-expo', toneClasses[tone].bg)}
            style={{ width: `${bounded}%` }}
          />
        </ProgressPrimitive.Root>
        {showValue ? (
          <span className="min-w-[3ch] text-right text-sm font-semibold tabular-nums text-navy">{formatPercent(bounded)}</span>
        ) : null}
      </div>
    )
  },
)
