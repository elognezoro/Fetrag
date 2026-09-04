'use client'

import * as React from 'react'
import { motion } from 'motion/react'

import { cn } from '../../lib/cn'
import { clamp } from '../../lib/format'
import { toneHex, toneTrackHex, type Tone } from '../../lib/tones'
import { useReducedMotionSafe } from '../motion/use-reduced-motion'

export interface ArcRingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Diamètre en pixels. */
  size?: number
  /** Épaisseur du trait. */
  stroke?: number
  /** Portion dessinée de l'arc (0-100). */
  progress?: number
  tone?: Tone
  /** Anime le tracé à l'apparition (désactivé si `prefers-reduced-motion`). */
  animate?: boolean
  /** Affiche la piste claire derrière l'arc. */
  track?: boolean
  /** Durée de l'animation en secondes. */
  duration?: number
  /** Contenu centré dans l'anneau (chiffre, icône). */
  children?: React.ReactNode
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Arc de 270 degrés ouvert vers le haut (motif du logo), dessiné progressivement
 * via `stroke-dasharray` / `stroke-dashoffset` (`pathLength` normalisé à 100).
 * Le tracé part du haut à gauche, passe par le bas et remonte à droite.
 */
export const ArcRing = React.forwardRef<HTMLDivElement, ArcRingProps>(function ArcRing(
  { size = 120, stroke = 10, progress = 100, tone = 'green', animate = true, track = true, duration = 1.6, children, className, style, ...props },
  ref,
) {
  const reduced = useReducedMotionSafe()
  const value = clamp(progress, 0, 100)
  const radius = 50 - stroke / 2
  const startX = 50 + radius * Math.cos((225 * Math.PI) / 180)
  const startY = 50 + radius * Math.sin((225 * Math.PI) / 180)
  const endX = 50 + radius * Math.cos((315 * Math.PI) / 180)
  const endY = 50 + radius * Math.sin((315 * Math.PI) / 180)
  // Sens anti-horaire (sweep 0) : de 225 degrés vers 315 degrés en passant par le bas.
  const d = `M ${startX.toFixed(3)} ${startY.toFixed(3)} A ${radius} ${radius} 0 1 0 ${endX.toFixed(3)} ${endY.toFixed(3)}`
  const shouldAnimate = animate && !reduced
  const targetOffset = 100 - value

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="absolute inset-0">
        {track ? (
          <path d={d} fill="none" stroke={toneTrackHex[tone]} strokeWidth={stroke} strokeLinecap="round" />
        ) : null}
        {shouldAnimate ? (
          <motion.path
            d={d}
            fill="none"
            stroke={toneHex[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 100"
            initial={{ strokeDashoffset: 100 }}
            whileInView={{ strokeDashoffset: targetOffset }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration, ease: EASE_OUT_EXPO }}
          />
        ) : (
          <path
            d={d}
            fill="none"
            stroke={toneHex[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={targetOffset}
          />
        )}
      </svg>
      {children ? (
        <div className="relative z-10 flex max-w-[70%] flex-col items-center justify-center text-center">{children}</div>
      ) : null}
    </div>
  )
})
