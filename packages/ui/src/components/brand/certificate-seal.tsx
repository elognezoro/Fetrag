import * as React from 'react'
import { brand } from '@fetrag/design-tokens'

import { cn } from '../../lib/cn'
import { fr } from '../../i18n/fr'

export interface CertificateSealProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'width' | 'height'> {
  /** Diamètre en pixels. */
  size?: number
  /** Mention centrale (« CERTIFICAT », « ATTESTATION »). */
  label?: string
  /** Texte circulaire (par défaut le nom complet de la fédération). */
  ringText?: string
  /** `color` : bleu et or ; `mono` : couleur courante (impression, filigrane). */
  variant?: 'color' | 'mono'
  title?: string
  decorative?: boolean
}

/** Étoile centrée en (100, 96), rayon 22. */
const STAR_POINTS = '100,74 105.3,88.7 121,89.2 108.6,98.8 112.9,113.8 100,105.2 87.1,113.8 91.4,98.8 79,89.2 94.7,88.7'

/** Sceau circulaire bleu et or (anneau, texte circulaire, étoile) pour certificats et attestations. */
export function CertificateSeal({
  size = 160,
  label = 'Certificat',
  ringText,
  variant = 'color',
  title,
  decorative = false,
  className,
  ...props
}: CertificateSealProps) {
  const pathId = React.useId()
  const isColor = variant === 'color'
  const blue = isColor ? brand.blue[500] : 'currentColor'
  const navy = isColor ? brand.navy.DEFAULT : 'currentColor'
  const gold = isColor ? brand.gold[500] : 'currentColor'
  const goldDark = isColor ? brand.gold[700] : 'currentColor'
  const accessibleTitle = title ?? fr.a11y.seal
  const text = (ringText ?? fr.common.fullName).toUpperCase()

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : accessibleTitle}
      className={cn('shrink-0', className)}
      {...props}
    >
      {decorative ? null : <title>{accessibleTitle}</title>}
      <defs>
        <path id={pathId} d="M100 100 m-66 0 a66 66 0 1 1 132 0 a66 66 0 1 1 -132 0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="96" fill={isColor ? '#ffffff' : 'none'} stroke={blue} strokeWidth="6" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={gold} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="3 4" />
      <text
        fill={navy}
        fontFamily="Manrope, 'Segoe UI', system-ui, sans-serif"
        fontSize="10.5"
        fontWeight="700"
        letterSpacing="2.2"
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
      <polygon points={STAR_POINTS} fill={gold} stroke={goldDark} strokeWidth="1" strokeLinejoin="round" />
      <text
        x="100"
        y="134"
        textAnchor="middle"
        fill={navy}
        fontFamily="Manrope, 'Segoe UI', system-ui, sans-serif"
        fontSize="9"
        fontWeight="800"
        letterSpacing="2"
      >
        {label.toUpperCase()}
      </text>
      <path d="M64 148 h72" stroke={blue} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
