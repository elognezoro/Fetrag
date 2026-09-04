import * as React from 'react'
import { brand } from '@fetrag/design-tokens'

import { cn } from '../../lib/cn'
import { fr } from '../../i18n/fr'

export interface EmblemProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'width' | 'height'> {
  /** Taille en pixels (carré). */
  size?: number
  /** `color` : couleurs du logo ; `mono` : couleur courante ; `white` : blanc (fonds sombres). */
  variant?: 'color' | 'mono' | 'white'
  /** Titre accessible ; `decorative` masque l'emblème aux lecteurs d'écran. */
  title?: string
  decorative?: boolean
}

/** Étoile à cinq branches centrée en (100, 40), rayon 15. */
const STAR_POINTS = '100,25 103.6,35 114.3,35.4 105.9,41.9 108.8,52.1 100,46.2 91.2,52.1 94.1,41.9 85.7,35.4 96.4,35'

/**
 * Emblème vectoriel original inspiré du logo : anneau bleu, arc vert ouvert vers le haut,
 * étoile or au sommet et deux silhouettes stylisées bras levés (le « V » des travailleurs).
 * Composant serveur, sans dépendance bitmap.
 */
export function Emblem({ size = 64, variant = 'color', title, decorative = false, className, ...props }: EmblemProps) {
  const isColor = variant === 'color'
  const ring = isColor ? brand.blue[500] : 'currentColor'
  const arc = isColor ? brand.green[500] : 'currentColor'
  const star = isColor ? brand.gold[500] : 'currentColor'
  const figure = isColor ? brand.blue[700] : 'currentColor'
  const label = title ?? fr.a11y.emblem

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      className={cn('shrink-0', variant === 'white' && 'text-white', className)}
      {...props}
    >
      {decorative ? null : <title>{label}</title>}
      {/* Anneau extérieur */}
      <circle cx="100" cy="100" r="90" fill="none" stroke={ring} strokeWidth="10" />
      <circle cx="100" cy="100" r="79" fill="none" stroke={ring} strokeWidth="1.5" opacity={isColor ? 0.45 : 0.6} />
      {/* Arc vert ouvert vers le haut (270 degrés, de 315 à 225 degrés par le bas) */}
      <path
        d="M143.8 56.2 A62 62 0 1 1 56.2 56.2"
        fill="none"
        stroke={arc}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Étoile or au sommet, dans l'ouverture de l'arc */}
      <polygon points={STAR_POINTS} fill={star} stroke={isColor ? brand.gold[600] : 'none'} strokeWidth="1" strokeLinejoin="round" />
      {/* Silhouette gauche */}
      <g fill={figure} stroke={figure} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="80" cy="86" r="7.5" stroke="none" />
        <path d="M71 98 h18 l-2.5 30 h-13 Z" stroke="none" />
        <path d="M74 100 L61 80" fill="none" strokeWidth="5.5" />
        <path d="M86 100 L97 79" fill="none" strokeWidth="5.5" />
        <path d="M76.5 128 v14" fill="none" strokeWidth="5.5" />
        <path d="M83.5 128 v14" fill="none" strokeWidth="5.5" />
      </g>
      {/* Silhouette droite */}
      <g fill={figure} stroke={figure} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="86" r="7.5" stroke="none" />
        <path d="M111 98 h18 l-2.5 30 h-13 Z" stroke="none" />
        <path d="M114 100 L103 79" fill="none" strokeWidth="5.5" />
        <path d="M126 100 L139 80" fill="none" strokeWidth="5.5" />
        <path d="M116.5 128 v14" fill="none" strokeWidth="5.5" />
        <path d="M123.5 128 v14" fill="none" strokeWidth="5.5" />
      </g>
    </svg>
  )
}
