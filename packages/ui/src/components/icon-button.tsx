import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '../lib/cn'
import { Button, type ButtonProps } from './button'

const iconSizes = {
  sm: 'size-9 [&_svg]:size-4 pointer-coarse:size-11',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-12 [&_svg]:size-6',
} as const

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'leftIcon' | 'rightIcon' | 'children'> {
  /** Libellé accessible obligatoire (le bouton n'a pas de texte visible). */
  label: string
  /** Icône lucide à afficher. Alternative : passer un élément en `children`. */
  icon?: LucideIcon
  size?: keyof typeof iconSizes
  children?: React.ReactNode
}

/** Bouton circulaire contenant uniquement une icône, avec libellé accessible. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon: Icon, size = 'md', className, children, variant = 'ghost', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      aria-label={label}
      title={label}
      className={cn(iconSizes[size], className)}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" strokeWidth={1.75} /> : children}
    </Button>
  )
})
