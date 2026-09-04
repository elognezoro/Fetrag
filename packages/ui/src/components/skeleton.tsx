import * as React from 'react'

import { cn } from '../lib/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rend plusieurs lignes de texte (la dernière plus courte). */
  lines?: number
  /** Forme circulaire (avatar). */
  circle?: boolean
}

/** Espace réservé animé (effet de brillance) pendant le chargement. */
export function Skeleton({ className, lines, circle = false, ...props }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-hidden="true" {...props}>
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className={cn('skeleton h-4', index === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    )
  }
  return <div className={cn('skeleton h-4 w-full', circle && 'rounded-full', className)} aria-hidden="true" {...props} />
}
