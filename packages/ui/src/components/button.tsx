import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '../lib/cn'

/**
 * Variantes du bouton FETRAG : pilule pleine (écho de l'anneau), focus visible,
 * cible tactile de 44px, légère réduction d'échelle au clic.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold',
    'transition-[transform,box-shadow,background-color,color,border-color] duration-180 ease-out-expo select-none',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white shadow-soft hover:-translate-y-px hover:bg-blue-600 hover:shadow-lift',
        secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800',
        accent: 'bg-green-500 text-navy shadow-soft hover:-translate-y-px hover:bg-green-400 hover:shadow-lift',
        gold: 'bg-gold-500 text-navy shadow-soft hover:-translate-y-px hover:bg-gold-400 hover:shadow-lift',
        outline: 'border-2 border-blue-500 bg-transparent text-blue-700 hover:bg-blue-50',
        ghost: 'bg-transparent text-navy hover:bg-neutral-100',
        link: 'h-auto rounded-none bg-transparent px-0 text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline',
        danger: 'bg-danger text-white shadow-soft hover:bg-[#a52121] hover:shadow-lift',
      },
      size: {
        sm: 'h-10 px-4 text-sm [&_svg]:size-4 pointer-coarse:min-h-11',
        md: 'h-11 px-5 text-sm [&_svg]:size-[18px]',
        lg: 'h-12 px-6 text-base [&_svg]:size-5',
        xl: 'h-14 px-8 text-base [&_svg]:size-5',
        icon: 'size-11 p-0 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Rend l'enfant (ex. `<Link>`) avec les styles du bouton. Les icônes ne sont pas injectées dans ce mode. */
  asChild?: boolean
  /** Affiche un indicateur de chargement et désactive le bouton. */
  loading?: boolean
  /** Texte annoncé aux lecteurs d'écran pendant le chargement. */
  loadingLabel?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/** Bouton principal du design system. `type="button"` par défaut. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingLabel = 'Chargement en cours',
    leftIcon,
    rightIcon,
    disabled,
    children,
    type,
    ...props
  },
  ref,
) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} aria-busy={loading || undefined} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  )
})
