import * as React from 'react'
import { brand } from '@fetrag/design-tokens'

import { cn } from '../../lib/cn'

export interface GradientDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `line` : filet court bleu → vert → or ; `arc` : arc large et plat (séparateur de section). */
  variant?: 'line' | 'arc'
  align?: 'left' | 'center' | 'right'
  /** Largeur du filet. */
  width?: 'sm' | 'md' | 'lg' | 'full'
}

const widths = { sm: 'w-12', md: 'w-20', lg: 'w-32', full: 'w-full' } as const
const aligns = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' } as const

/** Séparateur dégradé tricolore (bleu, vert, or). Composant serveur. */
export function GradientDivider({ variant = 'line', align = 'left', width = 'md', className, ...props }: GradientDividerProps) {
  const gradientId = React.useId()

  if (variant === 'arc') {
    return (
      <div role="separator" aria-orientation="horizontal" className={cn('w-full overflow-hidden', className)} {...props}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="block h-10 w-full sm:h-14" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={brand.blue[500]} />
              <stop offset="50%" stopColor={brand.green[500]} />
              <stop offset="100%" stopColor={brand.gold[500]} />
            </linearGradient>
          </defs>
          <path d="M0 70 Q600 -30 1200 70" fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('h-[3px] rounded-full', widths[width], aligns[align], className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${brand.blue[500]}, ${brand.green[500]}, ${brand.gold[500]})`,
      }}
      {...props}
    />
  )
}
