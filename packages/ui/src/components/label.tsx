'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '../lib/cn'

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Ajoute l'astérisque d'obligation avec son équivalent textuel pour les lecteurs d'écran. */
  required?: boolean
  /** Mention « facultatif » discrète. */
  optional?: boolean
}

/** Libellé de champ (Radix Label : le clic focalise le contrôle associé). */
export const Label = React.forwardRef<React.ComponentRef<typeof LabelPrimitive.Root>, LabelProps>(function Label(
  { className, required, optional, children, ...props },
  ref,
) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-semibold leading-none text-navy peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-danger" aria-hidden="true">
          *
        </span>
      ) : null}
      {required ? <span className="sr-only">(obligatoire)</span> : null}
      {optional && !required ? <span className="ml-1 text-xs font-normal text-neutral-500">(facultatif)</span> : null}
    </LabelPrimitive.Root>
  )
})
