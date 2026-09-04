'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

import { cn } from '../lib/cn'

export interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Texte centré sur la ligne (« ou », date...). Horizontal uniquement. */
  label?: React.ReactNode
}

/** Séparateur horizontal ou vertical (Radix Separator). */
export const Separator = React.forwardRef<React.ComponentRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  function Separator({ className, orientation = 'horizontal', decorative = true, label, ...props }, ref) {
    if (label && orientation === 'horizontal') {
      return (
        <div className={cn('flex items-center gap-3', className)} role={decorative ? undefined : 'separator'}>
          <SeparatorPrimitive.Root ref={ref} decorative className="h-px flex-1 bg-neutral-200" {...props} />
          <span className="eyebrow text-[11px] text-neutral-500">{label}</span>
          <SeparatorPrimitive.Root decorative className="h-px flex-1 bg-neutral-200" />
        </div>
      )
    }
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-neutral-200',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px self-stretch',
          className,
        )}
        {...props}
      />
    )
  },
)
