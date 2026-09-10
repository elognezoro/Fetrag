import * as React from 'react'

import { cn } from '../lib/cn'
import { type PillarName } from '../lib/contracts'
import { resolveTone, toneClasses, type Tone } from '../lib/tones'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ajoute le filet supérieur signature (3px) coloré par pilier ou tonalité. */
  pillar?: PillarName | Tone
  /** Survol : translation -2px + ombre `lift` + halo de la tonalité. */
  interactive?: boolean
  /** Supprime le padding par défaut des sous-composants (utile pour les images pleine largeur). */
  as?: 'div' | 'article' | 'section' | 'li'
}

/** Carte blanche à bords très arrondis, bordure fine et ombre douce. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, pillar, interactive = false, as = 'div', ...props },
  ref,
) {
  const tone = pillar ? resolveTone(pillar) : undefined
  // Les balises autorisées partagent les mêmes attributs : on les type comme `div` pour JSX.
  const Tag = as as 'div'
  return (
    <Tag
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-neutral-200 bg-white text-ink shadow-soft',
        tone && toneClasses[tone].topRule,
        interactive &&
          'transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift',
        interactive && tone && toneClasses[tone].glow,
        className,
      )}
      {...props}
    />
  )
})

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { /** Titre et action sur une même ligne, repliable sur mobile. */ inline?: boolean }>(
  function CardHeader({ className, inline = false, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-1.5 p-6', inline && 'flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1', className)} {...props} />
  },
)

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'div'
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, as: Tag = 'h3', ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn('font-display text-xl font-semibold leading-tight tracking-tight text-navy', className)}
      {...props}
    />
  )
})

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('text-sm leading-relaxed text-neutral-600', className)} {...props} />
  },
)

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  },
)

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-wrap items-center gap-3 p-6 pt-0', className)} {...props} />
  },
)
