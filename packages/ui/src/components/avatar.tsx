'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '../lib/cn'

const avatarSizes = {
  xs: 'size-7 text-[11px]',
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
} as const

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: keyof typeof avatarSizes
  /** Anneau bleu autour de l'avatar (écho du logo). */
  ring?: boolean
}

/** Avatar circulaire (Radix Avatar) avec repli sur les initiales. */
export const Avatar = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Root>, AvatarProps>(function Avatar(
  { className, size = 'md', ring = false, ...props },
  ref,
) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-blue-50',
        ring && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white',
        avatarSizes[size],
        className,
      )}
      {...props}
    />
  )
})

export const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return <AvatarPrimitive.Image ref={ref} className={cn('aspect-square size-full object-cover', className)} {...props} />
})

export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-blue-50 font-display font-semibold uppercase text-blue-700',
        className,
      )}
      {...props}
    />
  )
})
