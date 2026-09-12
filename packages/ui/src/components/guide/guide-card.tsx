import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Clock, ExternalLink } from 'lucide-react'
import { type GuideMeta } from '@fetrag/contracts'

import { cn } from '../../lib/cn'
import { toneClasses } from '../../lib/tones'
import { Badge } from '../badge'
import { Card } from '../card'
import { guideIcon } from './guide-icons'

export interface GuideCardProps {
  meta: GuideMeta
  href: string
  /** Lien vers l'autre application : balise `<a>` ouverte dans un nouvel onglet. */
  external?: boolean
  /** Guide actuellement affiché (bordure bleue, mention « Guide affiché »). */
  current?: boolean
  /** Libellé du rôle visé (badge). */
  roleLabel?: string
  className?: string
}

/** Carte d'un guide (liste « Vos autres guides », page d'accueil des guides). Composant serveur. */
export function GuideCard({ meta, href, external = false, current = false, roleLabel, className }: GuideCardProps) {
  const t = toneClasses[meta.tone]
  const Icon = guideIcon(meta.icon)
  const platformLabel = meta.platform === 'web' ? 'Site institutionnel' : 'Plateforme de formation'
  const linkClassName = cn(
    'font-display text-lg font-semibold leading-tight tracking-tight text-navy text-wrap',
    'after:absolute after:inset-0 after:rounded-2xl after:content-[""]',
    'focus-visible:outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-blue-500/40',
  )

  return (
    <Card
      as="article"
      pillar={meta.tone}
      interactive={!current}
      className={cn('flex h-full flex-col gap-4 p-5', current && 'border-blue-500 ring-2 ring-blue-500/25', className)}
      aria-current={current ? 'page' : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', t.soft, t.softText)}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {current ? (
            <Badge variant="blue" size="sm" dot>
              Guide affiché
            </Badge>
          ) : null}
          {roleLabel ? (
            <Badge variant={meta.tone === 'navy' ? 'navy' : meta.tone} size="sm">
              {roleLabel}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className={cn('eyebrow text-[10px]', t.text)}>{platformLabel}</p>
        <h3 className="text-wrap">
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
              {meta.title}
              <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
            </a>
          ) : (
            <Link href={href} className={linkClassName} aria-current={current ? 'page' : undefined}>
              {meta.title}
            </Link>
          )}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-700">{meta.subtitle}</p>
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">{meta.audience}</p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          {meta.readingMinutes} min de lecture
        </span>
        <span aria-hidden="true" className={cn('inline-flex items-center gap-1 font-semibold', t.text)}>
          {current ? 'En cours' : 'Ouvrir'}
          {external ? <ExternalLink className="size-3.5" strokeWidth={2} /> : <ArrowUpRight className="size-3.5" strokeWidth={2} />}
        </span>
      </div>
    </Card>
  )
}
