import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-sans font-semibold leading-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        blue: 'border-blue-100 bg-blue-50 text-blue-700',
        green: 'border-green-200 bg-green-50 text-green-800',
        gold: 'border-gold-200 bg-gold-50 text-gold-800',
        navy: 'border-navy bg-navy text-white',
        neutral: 'border-neutral-200 bg-neutral-100 text-neutral-700',
        success: 'border-green-200 bg-green-50 text-green-800',
        warning: 'border-gold-200 bg-gold-50 text-gold-800',
        danger: 'border-[#f5c6c6] bg-danger-soft text-danger',
        outline: 'border-neutral-300 bg-transparent text-neutral-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'blue',
      size: 'md',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Affiche un point coloré avant le texte. */
  dot?: boolean
}

/** Étiquette compacte (statut, catégorie, compteur). */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, size, dot = false, children, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
})
