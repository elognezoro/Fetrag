'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '../../lib/cn'
import { fr } from '../../i18n/fr'
import { Emblem } from './emblem'

/** Chemin public du logo officiel (source 1254 x 1254, présent dans chaque app). */
export const LOGO_SRC = '/brand/logo-fetrag.webp'

export interface LogoProps {
  /** Taille de l'image en pixels (carré). */
  size?: number
  /** Affiche « FETRAG » et le nom complet à côté de l'image. */
  withText?: boolean
  /** Enveloppe le logo dans un lien (généralement vers l'accueil). */
  href?: string
  /** Couleurs du texte pour fond sombre. */
  inverted?: boolean
  /** Charge l'image en priorité (en-tête au-dessus de la ligne de flottaison). */
  priority?: boolean
  className?: string
  textClassName?: string
}

/**
 * Logo officiel via `next/image`, avec repli sur l'emblème vectoriel et le texte
 * si l'image ne peut pas être chargée.
 */
export function Logo({ size = 44, withText = true, href, inverted = false, priority = false, className, textClassName }: LogoProps) {
  const [failed, setFailed] = React.useState(false)
  const alt = fr.a11y.logo

  const image = failed ? (
    <Emblem size={size} variant={inverted ? 'white' : 'color'} title={alt} />
  ) : (
    <Image
      src={LOGO_SRC}
      alt={withText ? '' : alt}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full object-contain"
    />
  )

  const content = (
    <>
      {image}
      {withText ? (
        <span className={cn('flex min-w-0 flex-col leading-none', textClassName)}>
          <span
            className={cn('font-display text-lg font-bold tracking-tight', inverted ? 'text-white' : 'text-navy')}
            style={{ fontSize: Math.max(16, Math.round(size * 0.42)) }}
          >
            {fr.common.appName}
          </span>
          <span
            className={cn('eyebrow mt-1 truncate text-[10px] tracking-[0.14em]', inverted ? 'text-white/70' : 'text-neutral-500')}
          >
            {fr.common.fullName}
          </span>
        </span>
      ) : null}
    </>
  )

  const classes = cn('inline-flex items-center gap-3', className)

  if (href) {
    return (
      <Link
        href={href}
        aria-label={alt}
        className={cn(classes, 'rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40')}
      >
        {content}
      </Link>
    )
  }
  return (
    <span className={classes} role={withText ? undefined : 'img'} aria-label={withText ? undefined : alt}>
      {content}
    </span>
  )
}
