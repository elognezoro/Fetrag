'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { ArrowUpRight, ExternalLink, Menu, X } from 'lucide-react'
import { AppShell, Dialog, DialogContent, DialogTitle, Emblem, IconButton, Ribbon, RingBackdrop, cn } from '@fetrag/ui'
import { adminTitleFor } from '@/server/admin/navigation'

export interface AdminShellProps {
  /** Nom et rôle de l'administrateur connecté. */
  user: { name: string; email: string; roleLabel: string }
  /** Navigation latérale (composant client `AdminNav`). */
  nav: ReactNode
  lmsUrl: string
  children: ReactNode
}

/**
 * Adapte `SidebarNav` (conçu pour un fond clair) à la barre latérale marine : texte blanc atténué,
 * survol translucide, entrée active blanche avec icône or (variantes arbitraires Tailwind, plus spécifiques
 * que les utilitaires du composant).
 */
const navClassName = cn(
  'flex-1 overflow-y-auto px-3 py-4',
  '[&_nav>p]:text-white/50',
  '[&_nav_a]:text-white/80 [&_nav_a:hover]:bg-white/10 [&_nav_a:hover]:text-white',
  '[&_nav_a[aria-current=page]]:bg-white/15 [&_nav_a[aria-current=page]]:text-white',
  '[&_nav_a_svg]:text-white/60 [&_nav_a:hover_svg]:text-white [&_nav_a[aria-current=page]_svg]:text-gold-400',
  '[&_nav_a>span:first-child]:bg-gold-400',
  '[&_nav_a>span:last-child:not(:only-child)]:bg-white/20 [&_nav_a>span:last-child:not(:only-child)]:text-white',
  '[&_nav_a[aria-current=page]>span:last-child:not(:only-child)]:bg-gold-500 [&_nav_a[aria-current=page]>span:last-child:not(:only-child)]:text-navy',
)

/**
 * Coquille du back-office : reprend la grammaire d'`AppShell` (contexte du tiroir mobile, `SidebarNav`)
 * dans une mise en page intégrée au site institutionnel (le header et le footer du layout racine sont conservés,
 * ce qui exclut la barre latérale fixe plein écran). Barre latérale marine collante sur grand écran, tiroir sur mobile,
 * barre supérieure avec le titre de la section courante.
 */
export function AdminShell({ user, nav, lmsUrl, children }: AdminShellProps) {
  const pathname = usePathname() ?? '/admin'
  const [open, setOpen] = useState(false)
  const title = adminTitleFor(pathname)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const brand = (
    <div className="relative overflow-hidden border-b border-white/10 px-5 py-5 text-white">
      <RingBackdrop position="top-right" opacity={0.12} scheme="light" className="pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-soft">
          <Emblem size={28} decorative />
        </span>
        <div className="min-w-0">
          <Ribbon tone="gold" size="sm">
            Administration
          </Ribbon>
          <p className="mt-1 truncate font-display text-base font-semibold leading-tight">fetrag.ga</p>
        </div>
      </div>
    </div>
  )

  const footer = (
    <div className="flex flex-col gap-3 border-t border-white/10 p-4 text-white">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-white/70">{user.email}</p>
        <span className="mt-1.5 inline-flex rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">{user.roleLabel}</span>
      </div>
      <a
        href={`${lmsUrl}/coordination`}
        className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gold-500/60"
      >
        Coordination LMS
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </div>
  )

  return (
    <AppShell className="min-h-0 bg-transparent lg:[&>div]:pl-0">
      {/* `overflow-x-clip` (et non `overflow-hidden`) : un conteneur à défilement casserait le `position: sticky` de la barre supérieure mobile. */}
      <div className="relative isolate min-h-[calc(100dvh-var(--header-height))] overflow-x-clip bg-neutral-50">
        <RingBackdrop position="top-right" opacity={0.04} className="-z-10" />
        <div className="mx-auto flex w-full max-w-[100rem] gap-0 px-0 lg:px-6 lg:py-6">
          <aside
            aria-label="Navigation administration"
            className={cn(
              'sticky top-[calc(var(--header-height)+1.5rem)] hidden max-h-[calc(100dvh-var(--header-height)-3rem)] w-[17rem] shrink-0 flex-col overflow-hidden rounded-2xl shadow-lift lg:flex',
              'bg-[linear-gradient(180deg,var(--color-navy-deep),var(--color-blue-800))]',
            )}
          >
            {brand}
            <div className={navClassName}>{nav}</div>
            {footer}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col lg:pl-8">
            {/* Décalage = hauteur de l'en-tête du site (bande tricolore de 4px comprise). */}
            <div className="sticky top-[calc(var(--header-height)+0.25rem)] z-20 flex min-h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6 lg:static lg:mb-6 lg:rounded-2xl lg:border lg:py-3 lg:shadow-soft">
              <div className="flex min-w-0 items-center gap-3">
                <IconButton label="Ouvrir la navigation" icon={Menu} variant="outline" className="lg:hidden" onClick={() => setOpen(true)} aria-expanded={open} />
                <div className="min-w-0">
                  <p className="eyebrow text-[10px] text-blue-700">Back-office</p>
                  <p className="truncate font-display text-lg font-semibold leading-tight text-navy">{title}</p>
                </div>
              </div>
              <Link href="/" target="_blank" rel="noopener" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-navy sm:inline-flex">
                Voir le site
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <section aria-label={title} className="min-w-0 px-4 py-6 sm:px-6 lg:px-0 lg:py-0">
              {children}
            </section>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          size="sm"
          className="left-0 top-0 h-dvh max-h-dvh w-[min(20rem,88vw)] translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-[linear-gradient(180deg,var(--color-navy-deep),var(--color-blue-800))] p-0 text-white data-[state=open]:animate-none lg:hidden"
        >
          <DialogTitle className="sr-only">Navigation administration</DialogTitle>
          <div className="flex items-start justify-between pr-2">
            <div className="min-w-0 flex-1">{brand}</div>
            <IconButton label="Fermer la navigation" icon={X} size="sm" className="mt-3 text-white hover:bg-white/10" onClick={() => setOpen(false)} />
          </div>
          <div className={navClassName}>{nav}</div>
          {footer}
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
