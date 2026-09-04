'use client'

import * as React from 'react'
import { animate, useInView } from 'motion/react'

import { cn } from '../../lib/cn'
import { formatNumber, UI_LOCALE } from '../../lib/format'
import { EASE_OUT_EXPO, useReducedMotionSafe } from './use-reduced-motion'

export interface CounterProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Valeur finale. */
  to: number
  /** Valeur de départ. */
  from?: number
  /** Durée en secondes. */
  duration?: number
  suffix?: string
  prefix?: string
  /** Décimales affichées. */
  decimals?: number
  /** Locale Intl (français par défaut). */
  locale?: string
  /** Délai avant le départ, en secondes. */
  delay?: number
}

/**
 * Compteur animé (Intl français) déclenché lorsqu'il devient visible.
 * La valeur finale est toujours exposée aux technologies d'assistance.
 */
export function Counter({
  to,
  from = 0,
  duration = 1.6,
  suffix = '',
  prefix = '',
  decimals = 0,
  locale = UI_LOCALE,
  delay = 0,
  className,
  ...props
}: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const displayRef = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotionSafe()
  const finalText = `${prefix}${formatNumber(to, decimals, locale)}${suffix}`
  const initialText = `${prefix}${formatNumber(reduced ? to : from, decimals, locale)}${suffix}`

  React.useEffect(() => {
    const node = displayRef.current
    if (!node) return
    if (reduced || !inView) {
      if (reduced) node.textContent = finalText
      return
    }
    const controls = animate(from, to, {
      duration,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        node.textContent = `${prefix}${formatNumber(latest, decimals, locale)}${suffix}`
      },
      onComplete: () => {
        node.textContent = finalText
      },
    })
    return () => controls.stop()
  }, [inView, reduced, from, to, duration, delay, prefix, suffix, decimals, locale, finalText])

  return (
    <span ref={ref} className={cn('tabular-nums', className)} {...props}>
      <span ref={displayRef} aria-hidden="true">
        {initialText}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  )
}
