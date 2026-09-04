import * as React from 'react'
import { brand } from '@fetrag/design-tokens'

import { cn } from '../../lib/cn'

export interface RingBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position du centre des anneaux dans le conteneur parent (qui doit être `relative`). */
  position?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'right' | 'left'
  /** Nombre d'anneaux concentriques. */
  rings?: number
  /** Opacité globale (0-1). Recommandé : 0.04 à 0.08. */
  opacity?: number
  /** Ajoute l'arc vert ouvert vers le haut sur l'anneau extérieur. */
  arc?: boolean
  /** Palette : couleurs de marque sur fond clair, blanc sur fond sombre. */
  scheme?: 'brand' | 'light'
  /** Diamètre de l'anneau extérieur (classe de taille Tailwind, ex. `size-[40rem]`). */
  sizeClassName?: string
}

const positions: Record<NonNullable<RingBackdropProps['position']>, string> = {
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'right-0 top-0 translate-x-1/3 -translate-y-1/3',
  'top-left': 'left-0 top-0 -translate-x-1/3 -translate-y-1/3',
  'bottom-right': 'bottom-0 right-0 translate-x-1/3 translate-y-1/3',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/3 translate-y-1/3',
  right: 'right-0 top-1/2 translate-x-1/3 -translate-y-1/2',
  left: 'left-0 top-1/2 -translate-x-1/3 -translate-y-1/2',
}

/**
 * Trame décorative d'anneaux concentriques (motif de l'anneau du logo), en SVG absolu,
 * faible opacité, insensible aux interactions. Composant serveur.
 */
export function RingBackdrop({
  position = 'top-right',
  rings = 4,
  opacity = 0.06,
  arc = true,
  scheme = 'brand',
  sizeClassName = 'size-[36rem] sm:size-[44rem]',
  className,
  ...props
}: RingBackdropProps) {
  const count = Math.max(1, Math.min(8, Math.floor(rings)))
  const blue = scheme === 'brand' ? brand.blue[500] : '#ffffff'
  const green = scheme === 'brand' ? brand.green[500] : brand.green[300]
  const gold = scheme === 'brand' ? brand.gold[500] : brand.gold[300]

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...props}
    >
      <svg
        viewBox="0 0 200 200"
        className={cn('absolute', positions[position], sizeClassName)}
        style={{ opacity }}
      >
        {Array.from({ length: count }, (_, index) => {
          const r = 96 - index * (72 / count)
          return (
            <circle
              key={index}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={index % 3 === 1 ? green : index % 3 === 2 ? gold : blue}
              strokeWidth={index === 0 ? 3 : 1.25}
            />
          )
        })}
        {arc ? (
          <path
            d="M167.9 32.1 A96 96 0 1 1 32.1 32.1"
            fill="none"
            stroke={green}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </div>
  )
}
