import * as React from 'react'

import { cn } from '../../lib/cn'
import { type Tone } from '../../lib/tones'

const ribbonTones: Record<Tone, string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-navy',
  gold: 'bg-gold-500 text-navy',
  navy: 'bg-navy text-white',
}

const ribbonSizes = {
  sm: 'px-3 py-1 text-[10px]',
  md: 'px-4 py-1.5 text-xs',
  lg: 'px-5 py-2 text-sm',
} as const

/** Ruban à extrémités biseautées (encoche à gauche, pointe à droite), écho du ruban de la devise. */
const ribbonClip = 'polygon(0 0, calc(100% - 0.7em) 0, 100% 50%, calc(100% - 0.7em) 100%, 0 100%, 0.7em 50%)'

export interface RibbonProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone
  size?: keyof typeof ribbonSizes
  as?: 'span' | 'div' | 'p'
  /** Légère inclinaison (-2deg), comme sur le logo. */
  tilt?: boolean
  children: React.ReactNode
}

/** Étiquette de section (eyebrow) en ruban coloré selon le pilier. Composant serveur. */
export function Ribbon({ tone = 'blue', size = 'md', as: Tag = 'span', tilt = false, className, style, children, ...props }: RibbonProps) {
  return (
    <Tag
      className={cn(
        'eyebrow inline-flex max-w-full items-center whitespace-nowrap font-bold leading-none',
        ribbonTones[tone],
        ribbonSizes[size],
        tilt && '-rotate-2',
        className,
      )}
      style={{ clipPath: ribbonClip, ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}
