import * as React from 'react'

import { cn } from '../../lib/cn'
import { fr } from '../../i18n/fr'
import { type Tone } from '../../lib/tones'
import { Ribbon } from './ribbon'

export interface MottoStripProps extends React.HTMLAttributes<HTMLElement> {
  /** `ribbon` : trois rubans colorés enchaînés ; `inline` : texte séparé par des points médians. */
  variant?: 'ribbon' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  /** Couleurs pour fond sombre (variante `inline`). */
  inverted?: boolean
  /** Inclinaison légère des rubans. */
  tilt?: boolean
}

const words: { key: keyof typeof fr.motto; tone: Tone; inlineClass: string }[] = [
  { key: 'work', tone: 'blue', inlineClass: 'text-blue-600' },
  { key: 'efficiency', tone: 'green', inlineClass: 'text-green-700' },
  { key: 'solidarity', tone: 'gold', inlineClass: 'text-gold-700' },
]

/** La devise « Travail · Efficacité · Solidarité » en ruban tricolore. Composant serveur. */
export function MottoStrip({ variant = 'ribbon', size = 'md', inverted = false, tilt = false, className, ...props }: MottoStripProps) {
  if (variant === 'inline') {
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
    return (
      <p className={cn('eyebrow inline-flex flex-wrap items-center gap-x-2', textSize, className)} {...props}>
        {words.map((word, index) => (
          <React.Fragment key={word.key}>
            {index > 0 ? (
              <span aria-hidden="true" className={inverted ? 'text-white/50' : 'text-neutral-400'}>
                &middot;
              </span>
            ) : null}
            <span className={inverted ? 'text-white' : word.inlineClass}>{fr.motto[word.key]}</span>
          </React.Fragment>
        ))}
      </p>
    )
  }

  return (
    <p className={cn('inline-flex flex-wrap items-center gap-1.5', tilt && '-rotate-1', className)} aria-label={fr.motto.full} {...props}>
      {words.map((word) => (
        <Ribbon key={word.key} tone={word.tone} size={size} aria-hidden="true">
          {fr.motto[word.key]}
        </Ribbon>
      ))}
    </p>
  )
}
