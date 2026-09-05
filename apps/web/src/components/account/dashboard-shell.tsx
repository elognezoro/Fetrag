'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, IconButton, Ribbon, RingBackdrop, cn } from '@fetrag/ui'

export interface DashboardShellProps {
  /** Eyebrow du bloc de marque (ex. « Espace personnel »). */
  eyebrow: string
  /** Titre du bloc de marque (nom de l'utilisateur, « Administration »). */
  brandTitle: ReactNode
  brandDescription?: ReactNode
  /** Navigation latérale (composant client contenant `SidebarNav`). */
  nav: ReactNode
  /** Bloc inférieur de la barre latérale (lien vers le LMS, aide...). */
  footer?: ReactNode
  /** Tonalité du ruban de marque. */
  tone?: 'blue' | 'green' | 'gold' | 'navy'
  children: ReactNode
}

/**
 * Coquille de tableau de bord intégrée au site institutionnel (header et footer du site conservés) :
 * barre latérale collante sur grand écran, tiroir accessible sur mobile, trame d'anneaux en fond.
 * Elle reprend la grammaire d'`AppShell` sans dupliquer la balise `main` du layout racine.
 */
export function DashboardShell({ eyebrow, brandTitle, brandDescription, nav, footer, tone = 'blue', children }: DashboardShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Ferme le tiroir mobile après chaque navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const brand = (
    <div className="flex flex-col gap-2 border-b border-neutral-200 px-5 py-5">
      <Ribbon tone={tone} size="sm">
        {eyebrow}
      </Ribbon>
      <p className="truncate font-display text-lg font-semibold leading-tight text-navy">{brandTitle}</p>
      {brandDescription ? <p className="truncate text-xs text-neutral-500">{brandDescription}</p> : null}
    </div>
  )

  return (
    <div className="relative isolate min-h-[calc(100dvh-var(--header-height))] overflow-hidden bg-neutral-50">
      <RingBackdrop position="top-right" opacity={0.05} className="-z-10" />
      <div className="container-fetrag py-6 lg:grid lg:grid-cols-[var(--dashboard-sidebar,17rem)_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside
          aria-label={`Navigation ${eyebrow.toLowerCase()}`}
          className={cn(
            'sticky top-[calc(var(--header-height)+1.5rem)] hidden max-h-[calc(100dvh-var(--header-height)-3rem)] flex-col self-start overflow-y-auto',
            'rounded-2xl border border-neutral-200 bg-white shadow-soft pillar-top-blue lg:flex',
          )}
        >
          {brand}
          <div className="flex-1 px-3 py-4">{nav}</div>
          {footer ? <div className="border-t border-neutral-200 p-4">{footer}</div> : null}
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-soft lg:hidden">
            <div className="min-w-0">
              <p className="eyebrow text-[10px] text-blue-700">{eyebrow}</p>
              <p className="truncate font-display text-base font-semibold text-navy">{brandTitle}</p>
            </div>
            <IconButton label="Ouvrir la navigation" icon={Menu} variant="outline" onClick={() => setOpen(true)} aria-expanded={open} />
          </div>
          <section aria-label={eyebrow} className="min-w-0">
            {children}
          </section>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          size="sm"
          className="left-0 top-0 h-dvh max-h-dvh w-[min(20rem,88vw)] translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 data-[state=open]:animate-none lg:hidden"
        >
          <div aria-hidden="true" className="tricolor-band h-1 w-full" />
          <div className="flex items-center justify-between pr-3">
            <div className="min-w-0 flex-1">{brand}</div>
            <IconButton label="Fermer la navigation" icon={X} size="sm" onClick={() => setOpen(false)} />
          </div>
          <DialogTitle className="sr-only">Navigation {eyebrow}</DialogTitle>
          <div className="flex-1 overflow-y-auto px-3 py-4">{nav}</div>
          {footer ? <div className="border-t border-neutral-200 p-4">{footer}</div> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
