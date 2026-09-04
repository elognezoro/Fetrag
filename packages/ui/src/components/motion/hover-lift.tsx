'use client'

import * as React from 'react'
import { type HTMLMotionProps } from 'motion/react'

import { cn } from '../../lib/cn'
import { motionTag, type MotionTag } from './reveal'
import { useReducedMotionSafe } from './use-reduced-motion'

export interface HoverLiftProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Translation verticale au survol en pixels (négatif = vers le haut). */
  lift?: number
  /** Réduction d'échelle au clic. */
  pressScale?: number
  /** Désactive l'effet (ex. carte non interactive). */
  disabled?: boolean
  as?: MotionTag
  className?: string
  children?: React.ReactNode
}

/** Survol : translation -2px + ombre `lift` en 180 ms ; léger scale au clic. */
export function HoverLift({ lift = -2, pressScale = 0.99, disabled = false, as = 'div', className, children, ...props }: HoverLiftProps) {
  const reduced = useReducedMotionSafe()
  const Tag = motionTag(as)
  const inactive = disabled || reduced

  return (
    <Tag
      className={cn('transition-shadow duration-180 ease-out-expo', !inactive && 'hover:shadow-lift', className)}
      whileHover={inactive ? undefined : { y: lift }}
      whileTap={inactive ? undefined : { scale: pressScale }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </Tag>
  )
}
