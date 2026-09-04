import { brand } from '@fetrag/design-tokens'

import { type PillarName } from './contracts'

/** Tonalités de marque utilisées par les composants signatures. */
export type Tone = 'blue' | 'green' | 'gold' | 'navy'

export const tones: readonly Tone[] = ['blue', 'green', 'gold', 'navy'] as const

/** Règle du triptyque : Protection = bleu, Prévention = vert, Défense = or. */
export const pillarTone: Record<PillarName, Tone> = {
  protection: 'blue',
  prevention: 'green',
  defense: 'gold',
}

/** Couleur hexadécimale d'une tonalité (pour les attributs SVG). */
export const toneHex: Record<Tone, string> = {
  blue: brand.blue[500],
  green: brand.green[500],
  gold: brand.gold[500],
  navy: brand.navy.DEFAULT,
}

/** Couleur de piste (fond) d'un anneau selon la tonalité. */
export const toneTrackHex: Record<Tone, string> = {
  blue: brand.blue[100],
  green: brand.green[100],
  gold: brand.gold[100],
  navy: brand.neutral[200],
}

export interface ToneClasses {
  /** Couleur de texte lisible sur fond clair. */
  text: string
  /** Fond plein. */
  bg: string
  /** Texte posé sur le fond plein (contraste AA). */
  onTone: string
  /** Fond très clair (pastille, icône). */
  soft: string
  /** Texte sur fond très clair. */
  softText: string
  /** Bordure. */
  border: string
  /** Filet supérieur signature (3px). */
  topRule: string
  /** Halo au survol. */
  glow: string
  /** Anneau de focus / sélection. */
  ring: string
}

/** Classes Tailwind par tonalité (scannées par Tailwind via `@source`). */
export const toneClasses: Record<Tone, ToneClasses> = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-500',
    onTone: 'text-white',
    soft: 'bg-blue-50',
    softText: 'text-blue-700',
    border: 'border-blue-500',
    topRule: 'pillar-top-blue',
    glow: 'hover:shadow-glow-blue',
    ring: 'ring-blue-500/40',
  },
  green: {
    text: 'text-green-700',
    bg: 'bg-green-500',
    onTone: 'text-navy',
    soft: 'bg-green-50',
    softText: 'text-green-800',
    border: 'border-green-500',
    topRule: 'pillar-top-green',
    glow: 'hover:shadow-glow-green',
    ring: 'ring-green-500/40',
  },
  gold: {
    text: 'text-gold-700',
    bg: 'bg-gold-500',
    onTone: 'text-navy',
    soft: 'bg-gold-50',
    softText: 'text-gold-800',
    border: 'border-gold-500',
    topRule: 'pillar-top-gold',
    glow: 'hover:shadow-glow-gold',
    ring: 'ring-gold-500/50',
  },
  navy: {
    text: 'text-navy',
    bg: 'bg-navy',
    onTone: 'text-white',
    soft: 'bg-neutral-100',
    softText: 'text-navy',
    border: 'border-navy',
    topRule: 'border-t-[3px] border-t-navy',
    glow: 'hover:shadow-glow-blue',
    ring: 'ring-blue-500/40',
  },
}

/** Résout une tonalité à partir d'une tonalité explicite ou d'un pilier. */
export function resolveTone(value: Tone | PillarName | null | undefined, fallback: Tone = 'blue'): Tone {
  if (!value) return fallback
  if (value in pillarTone) return pillarTone[value as PillarName]
  if ((tones as readonly string[]).includes(value)) return value as Tone
  return fallback
}

/** Tonalité du n-ième élément d'une liste (alternance bleu, vert, or). */
export function toneAt(index: number): Tone {
  const cycle: Tone[] = ['blue', 'green', 'gold']
  return cycle[((index % cycle.length) + cycle.length) % cycle.length] ?? 'blue'
}
