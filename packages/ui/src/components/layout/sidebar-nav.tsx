'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'
import { useAppShell } from './app-shell'

export interface SidebarNavItem {
  label: string
  href: string
  icon?: LucideIcon
  /** Compteur ou étiquette affiché à droite. */
  badge?: React.ReactNode
  /** Actif uniquement si le chemin est strictement égal (sinon : préfixe). */
  exact?: boolean
  /** Lien externe (ouvre dans le même onglet, sans état actif). */
  external?: boolean
  disabled?: boolean
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[]
  /** Titre de groupe (eyebrow). */
  title?: string
}

/** Indique si un lien est actif pour le chemin courant. */
export function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Navigation latérale : état actif via `usePathname`, icônes lucide, badges, fermeture du tiroir mobile. */
export function SidebarNav({ items, title, className, ...props }: SidebarNavProps) {
  const pathname = usePathname() ?? ''
  const shell = useAppShell()

  return (
    <nav aria-label={title} className={cn('flex flex-col gap-1', className)} {...props}>
      {title ? <p className="eyebrow mb-2 px-3 text-[11px] text-neutral-500">{title}</p> : null}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = !item.external && isActivePath(pathname, item.href, item.exact)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.disabled ? -1 : undefined}
                onClick={() => shell?.close()}
                className={cn(
                  'group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-180',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                  active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-neutral-700 hover:bg-neutral-100 hover:text-navy',
                  item.disabled && 'pointer-events-none opacity-50',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-green-500 transition-opacity duration-180',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {Icon ? (
                  <Icon
                    className={cn('size-5 shrink-0', active ? 'text-blue-600' : 'text-neutral-500 group-hover:text-navy')}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge !== null ? (
                  <span
                    className={cn(
                      'inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
                      active ? 'bg-blue-500 text-white' : 'bg-neutral-200 text-neutral-700',
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
