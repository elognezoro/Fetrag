import { MapPin } from 'lucide-react'
import { brand } from '@fetrag/design-tokens'
import { cn } from '@fetrag/ui'

interface StaticMapProps {
  className?: string
}

/**
 * Carte stylisée de Libreville (sans service cartographique tiers) : estuaire du Gabon, tracé côtier,
 * anneaux concentriques et repère du siège de la Fédération. Purement décorative, le texte porte l'information.
 */
export function StaticMap({ className }: StaticMapProps) {
  return (
    <figure className={cn('relative overflow-hidden rounded-2xl border border-neutral-200 bg-blue-50 shadow-soft', className)}>
      <svg viewBox="0 0 600 420" className="block h-auto w-full" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Plan stylisé de Libreville</title>
        <desc id="map-desc">Le siège de la Fédération des Travailleurs du Gabon est situé à Libreville, au bord de l&apos;estuaire du Gabon.</desc>
        <defs>
          <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke={brand.blue[500]} strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
          <linearGradient id="map-sea" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={brand.blue[100]} />
            <stop offset="100%" stopColor={brand.blue[200]} />
          </linearGradient>
        </defs>
        <rect width="600" height="420" fill="url(#map-sea)" />
        <path d="M0 0H600V420H0Z" fill="url(#map-grid)" />
        <path
          d="M175 0 C150 70 190 120 160 190 C135 250 170 300 130 360 C115 385 110 405 100 420 H600 V0 Z"
          fill={brand.neutral[50]}
          stroke={brand.blue[300]}
          strokeWidth="2.5"
        />
        <path d="M230 40 L330 80 M210 110 L340 150 M240 190 L360 230 M200 270 L330 300 M180 340 L310 370" stroke={brand.neutral[200]} strokeWidth="6" strokeLinecap="round" />
        <path d="M300 20 L280 400" stroke={brand.neutral[200]} strokeWidth="6" strokeLinecap="round" />
        <path d="M420 0 L400 420" stroke={brand.neutral[200]} strokeWidth="4" strokeLinecap="round" />
        <g fill={brand.green[100]} stroke={brand.green[300]} strokeWidth="1.5">
          <circle cx="470" cy="90" r="34" />
          <circle cx="520" cy="330" r="46" />
          <circle cx="360" cy="380" r="26" />
        </g>
        <g fill="none" stroke={brand.blue[500]}>
          <circle cx="300" cy="215" r="110" strokeOpacity="0.12" strokeWidth="2" />
          <circle cx="300" cy="215" r="75" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="300" cy="215" r="42" strokeOpacity="0.35" strokeWidth="2.5" />
        </g>
        <path d="M377.8 137.2 A110 110 0 1 1 222.2 137.2" fill="none" stroke={brand.green[500]} strokeWidth="5" strokeLinecap="round" />
        <text x="60" y="70" fill={brand.blue[700]} fontFamily="Manrope, system-ui, sans-serif" fontSize="14" fontWeight="700" letterSpacing="2">
          ESTUAIRE
        </text>
        <text x="60" y="92" fill={brand.blue[700]} fontFamily="Manrope, system-ui, sans-serif" fontSize="14" fontWeight="700" letterSpacing="2">
          DU GABON
        </text>
        <text x="420" y="400" fill={brand.navy.DEFAULT} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700" letterSpacing="2.5">
          LIBREVILLE
        </text>
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[88%]">
        <span className="relative flex flex-col items-center">
          <span aria-hidden="true" className="absolute top-8 size-6 animate-pulse-ring rounded-full bg-blue-500/30" />
          <span className="relative flex size-12 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-white shadow-lift">
            <MapPin className="size-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="mt-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-navy shadow-soft">Siège de la FETRAG</span>
        </span>
      </div>
      <figcaption className="sr-only">Plan indicatif, sans échelle.</figcaption>
    </figure>
  )
}
