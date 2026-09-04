'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, useReducedMotionSafe } from './use-reduced-motion'

export interface PageTransitionProps {
  className?: string
  /** Rejoue l'animation à chaque changement de route (clé = pathname). */
  keyed?: boolean
  children: React.ReactNode
}

/** Fondu et léger glissement à l'affichage d'une page (0,32 s). */
export function PageTransition({ className, keyed = true, children }: PageTransitionProps) {
  const pathname = usePathname()
  const reduced = useReducedMotionSafe()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      key={keyed ? pathname : undefined}
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
