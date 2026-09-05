import Image from 'next/image'
import { Building2, Globe2, Landmark, Star, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@fetrag/ui'

export type SealKind = 'AFFILIATE' | 'PARTNER' | 'INSTITUTION' | 'INTERNATIONAL'

export interface OrganizationSealProps {
  name: string
  acronym?: string | null
  logoUrl?: string | null
  kind?: SealKind
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const kindStyles: Record<SealKind, { ring: string; text: string; dash: string; icon: LucideIcon }> = {
  AFFILIATE: { ring: 'border-blue-500', text: 'text-blue-700', dash: 'border-gold-500', icon: Users },
  PARTNER: { ring: 'border-green-500', text: 'text-green-800', dash: 'border-blue-400', icon: Building2 },
  INSTITUTION: { ring: 'border-navy', text: 'text-navy', dash: 'border-gold-500', icon: Landmark },
  INTERNATIONAL: { ring: 'border-gold-500', text: 'text-gold-800', dash: 'border-blue-500', icon: Globe2 },
}

const sizes = {
  sm: { box: 'size-16', text: 'text-sm', star: 'size-4', pad: 'inset-1' },
  md: { box: 'size-24', text: 'text-xl', star: 'size-5', pad: 'inset-1.5' },
  lg: { box: 'size-32', text: 'text-2xl', star: 'size-6', pad: 'inset-2' },
} as const

/** Initiales (3 lettres maximum) d'un nom d'organisation sans acronyme. */
export function sealInitials(name: string): string {
  const stop = new Set(['de', 'du', 'des', 'la', 'le', 'les', "l'", 'et', 'en', 'au', 'aux', "d'"])
  const words = name
    .replace(/[’']/g, "'")
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !stop.has(w.toLowerCase()))
  const letters = words.slice(0, 3).map((w) => w.charAt(0).toUpperCase())
  return letters.join('') || name.slice(0, 2).toUpperCase()
}

/**
 * « Sceau » d'organisation : anneau coloré selon le type, cercle intérieur en pointillés or,
 * acronyme en serif (ou logo), étoile au sommet. Écho direct de l'anneau et de l'étoile du logo.
 */
export function OrganizationSeal({ name, acronym, logoUrl, kind = 'AFFILIATE', size = 'md', className }: OrganizationSealProps) {
  const style = kindStyles[kind]
  const dims = sizes[size]
  const label = acronym?.trim() || sealInitials(name)
  const fontClass = label.length > 5 ? 'text-xs' : label.length > 3 ? 'text-base' : dims.text

  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center', dims.box, className)} aria-hidden="true">
      <span className={cn('absolute inset-0 rounded-full border-[3px] bg-white shadow-soft', style.ring)} />
      <span className={cn('absolute rounded-full border border-dashed', dims.pad, style.dash)} />
      {logoUrl ? (
        <span className="relative size-[62%] overflow-hidden rounded-full bg-white">
          <Image src={logoUrl} alt="" fill sizes="96px" unoptimized className="object-contain p-1" />
        </span>
      ) : (
        <span className={cn('relative font-display font-semibold tracking-tight', fontClass, style.text)}>{label}</span>
      )}
      <span className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-white p-0.5 shadow-soft">
        <Star className={cn('fill-gold-500 text-gold-500', dims.star)} strokeWidth={1.5} />
      </span>
    </span>
  )
}

export function sealKindIcon(kind: SealKind): LucideIcon {
  return kindStyles[kind].icon
}
