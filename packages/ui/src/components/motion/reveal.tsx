'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'

import { cn } from '../../lib/cn'
import { EASE_OUT_EXPO, useReducedMotionSafe } from './use-reduced-motion'

/** Balises HTML supportées par les composants de mouvement. */
export const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  span: motion.span,
  p: motion.p,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  header: motion.header,
  footer: motion.footer,
  aside: motion.aside,
  figure: motion.figure,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const

export type MotionTag = keyof typeof motionTags

/** Retourne le composant motion correspondant à la balise (typé comme `motion.div`). */
export function motionTag(tag: MotionTag): typeof motion.div {
  return motionTags[tag] as typeof motion.div
}

export interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Délai en secondes. */
  delay?: number
  /** Translation verticale initiale en pixels. */
  y?: number
  /** N'anime qu'une seule fois (défaut) ou à chaque entrée dans le viewport. */
  once?: boolean
  /** Durée en secondes. */
  duration?: number
  as?: MotionTag
  className?: string
  children?: React.ReactNode
}

/** Apparition au scroll : opacité 0 → 1 et translation y → 0 (0,7 s, ease-out-expo). */
export function Reveal({ delay = 0, y = 18, once = true, duration = 0.7, as = 'div', className, children, ...props }: RevealProps) {
  const reduced = useReducedMotionSafe()
  const Tag = motionTag(as)

  if (reduced) {
    return (
      <Tag className={cn(className)} {...props}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={cn('will-change-[opacity,transform]', className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 'some', margin: '0px 0px -8% 0px' }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      {...props}
    >
      {children}
    </Tag>
  )
}
