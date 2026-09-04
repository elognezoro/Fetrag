import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '../lib/cn'
import { t } from '../i18n/fr'

export interface PaginationProps {
  /** Page courante (1-indexée). */
  page: number
  totalPages: number
  /** Génère l'URL d'une page (navigation par liens, compatible Server Components). */
  hrefFor?: (page: number) => string
  /** Alternative : rappel côté client (le parent doit être un composant client). */
  onChange?: (page: number) => void
  /** Nombre de pages affichées de part et d'autre de la page courante. */
  siblings?: number
  className?: string
  /** Libellé accessible de la navigation. */
  label?: string
}

type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

/** Calcule la liste des pages à afficher avec des ellipses. */
export function paginationRange(page: number, totalPages: number, siblings = 1): PageToken[] {
  const total = Math.max(1, Math.floor(totalPages))
  const current = Math.min(Math.max(1, Math.floor(page)), total)
  const visible = siblings * 2 + 5
  if (total <= visible) return Array.from({ length: total }, (_, i) => i + 1)

  const left = Math.max(current - siblings, 1)
  const right = Math.min(current + siblings, total)
  const showLeftEllipsis = left > 2
  const showRightEllipsis = right < total - 1

  const tokens: PageToken[] = [1]
  if (showLeftEllipsis) tokens.push('ellipsis-start')
  else for (let i = 2; i < left; i += 1) tokens.push(i)
  for (let i = Math.max(left, 2); i <= Math.min(right, total - 1); i += 1) tokens.push(i)
  if (showRightEllipsis) tokens.push('ellipsis-end')
  else for (let i = right + 1; i < total; i += 1) tokens.push(i)
  tokens.push(total)
  return tokens
}

const itemBase =
  'inline-flex size-11 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-180 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40'
const itemIdle = 'text-navy hover:bg-blue-50 hover:text-blue-700'
const itemActive = 'bg-blue-500 text-white shadow-soft'
const itemDisabled = 'pointer-events-none text-neutral-400'

interface PageLinkProps {
  page: number
  active?: boolean
  disabled?: boolean
  label: string
  hrefFor?: (page: number) => string
  onChange?: (page: number) => void
  children: React.ReactNode
  className?: string
}

function PageLink({ page, active, disabled, label, hrefFor, onChange, children, className }: PageLinkProps) {
  const classes = cn(itemBase, active ? itemActive : itemIdle, disabled && itemDisabled, className)
  if (hrefFor && !disabled) {
    return (
      <Link href={hrefFor(page)} aria-label={label} aria-current={active ? 'page' : undefined} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onChange ? () => onChange(page) : undefined}
      className={classes}
    >
      {children}
    </button>
  )
}

/** Pagination numérotée avec ellipses. Ne rend rien s'il n'y a qu'une page. */
export function Pagination({ page, totalPages, hrefFor, onChange, siblings = 1, className, label }: PaginationProps) {
  if (totalPages <= 1) return null
  const current = Math.min(Math.max(1, page), totalPages)
  const tokens = paginationRange(current, totalPages, siblings)

  return (
    <nav aria-label={label ?? t('pagination.label')} className={cn('flex items-center justify-center', className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <PageLink
            page={current - 1}
            disabled={current <= 1}
            label={t('pagination.previous')}
            hrefFor={hrefFor}
            onChange={onChange}
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </PageLink>
        </li>
        {tokens.map((token) =>
          typeof token === 'number' ? (
            <li key={token}>
              <PageLink
                page={token}
                active={token === current}
                label={token === current ? t('pagination.current', { page: token }) : t('pagination.page', { page: token })}
                hrefFor={hrefFor}
                onChange={onChange}
              >
                {token}
              </PageLink>
            </li>
          ) : (
            <li key={token} aria-hidden="true" className="inline-flex size-11 items-center justify-center text-neutral-400">
              &hellip;
            </li>
          ),
        )}
        <li>
          <PageLink
            page={current + 1}
            disabled={current >= totalPages}
            label={t('pagination.next')}
            hrefFor={hrefFor}
            onChange={onChange}
          >
            <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </PageLink>
        </li>
      </ul>
    </nav>
  )
}
