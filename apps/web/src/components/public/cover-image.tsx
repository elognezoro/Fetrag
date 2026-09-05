import Image from 'next/image'
import { Emblem, cn } from '@fetrag/ui'

interface CoverImageProps {
  src: string | null | undefined
  alt: string
  /** Attribut `sizes` de next/image (largeurs responsives). */
  sizes?: string
  priority?: boolean
  className?: string
  /** Tonalité du visuel de repli (sans image). */
  tone?: 'blue' | 'green' | 'gold' | 'navy'
  /** Ratio CSS du conteneur (ex. `aspect-[16/9]`). */
  aspectClassName?: string
}

/** Hôtes autorisés par `next.config.ts` (images.remotePatterns) pour l'optimisation. */
const optimizedHosts = [/(^|\.)fetrag\.ga$/i, /\.public\.blob\.vercel-storage\.com$/i]

function canOptimize(src: string): boolean {
  if (src.startsWith('/')) return true
  try {
    const host = new URL(src).hostname
    return optimizedHosts.some((pattern) => pattern.test(host))
  } catch {
    return false
  }
}

const fallbackTones = {
  blue: 'from-blue-50 via-white to-blue-100 text-blue-500',
  green: 'from-green-50 via-white to-green-100 text-green-600',
  gold: 'from-gold-50 via-white to-gold-100 text-gold-600',
  navy: 'from-blue-900 via-navy to-blue-800 text-white',
} as const

/**
 * Image de couverture (actualité, événement, ressource) avec repli graphique FETRAG :
 * dégradé doux, anneau et emblème lorsque le contenu n'a pas de visuel.
 */
export function CoverImage({ src, alt, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', priority = false, className, tone = 'blue', aspectClassName = 'aspect-[16/10]' }: CoverImageProps) {
  if (src) {
    return (
      <div className={cn('relative w-full overflow-hidden bg-neutral-100', aspectClassName, className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!canOptimize(src)} className="object-cover" />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className={cn('relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br', fallbackTones[tone], aspectClassName, className)}
    >
      <span className="absolute -right-10 -top-10 size-40 rounded-full border-[14px] border-current opacity-10" />
      <span className="absolute -bottom-12 -left-8 size-36 rounded-full border-[10px] border-current opacity-10" />
      <Emblem size={72} variant={tone === 'navy' ? 'white' : 'color'} decorative className="opacity-80" />
    </div>
  )
}
