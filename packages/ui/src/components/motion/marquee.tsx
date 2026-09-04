'use client'

import * as React from 'react'

import { cn } from '../../lib/cn'
import { useReducedMotionSafe } from './use-reduced-motion'

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Durée d'un cycle complet en secondes (plus petit = plus rapide). */
  speed?: number
  /** Met le défilement en pause au survol (défaut) et au focus clavier. */
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
  /** Espace entre les éléments (classe Tailwind, ex. `gap-12`). */
  gapClassName?: string
  /** Fondu sur les bords. */
  fade?: boolean
  /** Libellé accessible du bandeau. */
  label?: string
}

/**
 * Défilement horizontal infini (logos partenaires). Le contenu est dupliqué pour un
 * raccord invisible ; la copie est masquée aux lecteurs d'écran. Si l'utilisateur préfère
 * réduire les animations, le contenu est affiché statiquement, avec défilement manuel.
 */
export function Marquee({
  speed = 40,
  pauseOnHover = true,
  direction = 'left',
  gapClassName = 'gap-10 sm:gap-16',
  fade = true,
  label,
  className,
  children,
  ...props
}: MarqueeProps) {
  const reduced = useReducedMotionSafe()

  if (reduced) {
    return (
      <div
        className={cn('w-full overflow-x-auto scrollbar-none', className)}
        role={label ? 'region' : undefined}
        aria-label={label}
        {...props}
      >
        <div className={cn('flex w-max items-center px-4', gapClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn('group/marquee relative w-full overflow-hidden', className)}
      role={label ? 'region' : undefined}
      aria-label={label}
      style={
        fade
          ? {
              maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
            }
          : undefined
      }
      {...props}
    >
      <div
        className={cn(
          'flex w-max items-center animate-marquee',
          gapClassName,
          direction === 'right' && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${Math.max(5, speed)}s` }}
      >
        <div className={cn('flex shrink-0 items-center', gapClassName)}>{children}</div>
        <div className={cn('flex shrink-0 items-center', gapClassName)} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
