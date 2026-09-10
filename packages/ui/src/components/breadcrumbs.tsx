import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

import { cn } from '../lib/cn'
import { t } from '../i18n/fr'

export interface BreadcrumbItem {
  label: React.ReactNode
  /** Absent pour le dernier élément (page courante). */
  href?: string
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  /** Ajoute automatiquement « Accueil » en tête. */
  homeHref?: string
  /** Couleurs pour fond sombre. */
  inverted?: boolean
}

/** Fil d'Ariane accessible (`nav` + `ol`, dernier élément `aria-current="page"`). */
export function Breadcrumbs({ items, homeHref, inverted = false, className, ...props }: BreadcrumbsProps) {
  const all: BreadcrumbItem[] = homeHref ? [{ label: t('common.home'), href: homeHref }, ...items] : items
  if (all.length === 0) return null

  const linkClass = cn(
    'inline-flex min-h-6 items-center gap-1 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
    inverted ? 'text-white/75 hover:text-white' : 'text-neutral-600 hover:text-blue-700',
  )

  return (
    <nav aria-label={t('common.breadcrumb')} className={cn('text-sm', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((item, index) => {
          const isLast = index === all.length - 1
          const isHome = Boolean(homeHref) && index === 0
          return (
            <li key={index} className="inline-flex items-center gap-1.5 max-sm:[&:not(:first-child):not(:nth-last-child(-n+2))]:hidden">
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className={cn('size-3.5', inverted ? 'text-white/50' : 'text-neutral-400')}
                  strokeWidth={2}
                />
              ) : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('font-semibold', inverted ? 'text-white' : 'text-navy')}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {isHome ? <Home className="size-4" strokeWidth={1.75} aria-hidden="true" /> : null}
                  {isHome ? <span className="sr-only sm:not-sr-only">{item.label}</span> : item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
