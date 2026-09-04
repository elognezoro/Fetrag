'use client'

import * as React from 'react'
import { type HTMLMotionProps, type Variants } from 'motion/react'

import { cn } from '../../lib/cn'
import { motionTag, type MotionTag } from './reveal'
import { EASE_OUT_EXPO, useReducedMotionSafe } from './use-reduced-motion'

export interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Décalage entre chaque enfant en secondes (70 ms par défaut). */
  stagger?: number
  /** Délai avant le premier enfant. */
  delay?: number
  once?: boolean
  as?: MotionTag
  className?: string
  children?: React.ReactNode
}

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Conteneur révélant ses `StaggerItem` en cascade lorsqu'il entre dans le viewport. */
export function Stagger({ stagger = 0.07, delay = 0, once = true, as = 'div', className, children, ...props }: StaggerProps) {
  const reduced = useReducedMotionSafe()
  const Tag = motionTag(as)

  if (reduced) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={cn(className)}
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: '0px 0px -8% 0px' }}
      {...props}
    >
      {children}
    </Tag>
  )
}

export interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  y?: number
  duration?: number
  as?: MotionTag
  className?: string
  children?: React.ReactNode
}

/** Élément d'un `Stagger` (opacité et translation, sans animation si mouvement réduit). */
export function StaggerItem({ y = 18, duration = 0.7, as = 'div', className, children, ...props }: StaggerItemProps) {
  const reduced = useReducedMotionSafe()
  const Tag = motionTag(as)

  if (reduced) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    )
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT_EXPO } },
  }

  return (
    <Tag className={cn('will-change-[opacity,transform]', className)} variants={variants} {...props}>
      {children}
    </Tag>
  )
}
