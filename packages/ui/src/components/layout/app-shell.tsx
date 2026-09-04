'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '../../lib/cn'
import { t } from '../../i18n/fr'
import { IconButton } from '../icon-button'
import { EASE_OUT_EXPO, useReducedMotionSafe } from '../motion/use-reduced-motion'

/** Largeur de la barre latérale sur grand écran. */
export const SIDEBAR_WIDTH = 272

interface AppShellContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  /** Ferme le tiroir mobile (à appeler après une navigation). */
  close: () => void
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null)

/** Accès à l'état du tiroir mobile ; `null` hors d'un `AppShell`. */
export function useAppShell(): AppShellContextValue | null {
  return React.useContext(AppShellContext)
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Coquille de tableau de bord : barre latérale fixe de 272px sur `lg+`,
 * tiroir (Radix Dialog) sur mobile, barre supérieure collante.
 * Structure attendue : `<AppShell><AppShellSidebar/><AppShellTopbar/><AppShellMain/></AppShell>`.
 */
export function AppShell({ className, children, ...props }: AppShellProps) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo<AppShellContextValue>(
    () => ({ open, setOpen, close: () => setOpen(false) }),
    [open],
  )
  return (
    <AppShellContext.Provider value={value}>
      <div
        className={cn('flex min-h-dvh flex-col bg-neutral-50 text-ink', className)}
        style={{ ['--sidebar-width' as string]: `${SIDEBAR_WIDTH}px` }}
        {...props}
      >
        <div className="flex min-h-dvh flex-col lg:pl-[var(--sidebar-width)]">{children}</div>
      </div>
    </AppShellContext.Provider>
  )
}

export interface AppShellSidebarProps {
  /** Bloc supérieur (logo). */
  brand?: React.ReactNode
  /** Bloc inférieur (utilisateur, déconnexion). */
  footer?: React.ReactNode
  /** Contenu de navigation (`SidebarNav`). */
  children: React.ReactNode
  /** Titre accessible du tiroir mobile. */
  label?: string
  className?: string
}

/** Barre latérale : `aside` fixe sur grand écran, tiroir Radix Dialog sur mobile. */
export function AppShellSidebar({ brand, footer, children, label, className }: AppShellSidebarProps) {
  const shell = useAppShell()
  const reduced = useReducedMotionSafe()
  const open = shell?.open ?? false
  const setOpen = shell?.setOpen ?? (() => undefined)
  const title = label ?? t('nav.sidebarNavigation')

  const inner = (closeButton?: React.ReactNode) => (
    <>
      <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5">
        <div className="min-w-0 flex-1">{brand}</div>
        {closeButton}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
      {footer ? <div className="shrink-0 border-t border-neutral-200 p-4">{footer}</div> : null}
    </>
  )

  return (
    <>
      <aside
        aria-label={title}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-neutral-200 bg-white lg:flex',
          className,
        )}
      >
        {inner()}
      </aside>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm lg:hidden" />
          <DialogPrimitive.Content asChild aria-describedby={undefined}>
            <motion.div
              className={cn(
                'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col bg-white shadow-lift outline-none lg:hidden',
                className,
              )}
              initial={reduced ? false : { x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            >
              <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
              {inner(
                <DialogPrimitive.Close asChild>
                  <IconButton label={t('nav.closeMenu')} icon={X} size="sm" />
                </DialogPrimitive.Close>,
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}

export interface AppShellTopbarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Titre de la page ou logo compact (affiché après le bouton menu). */
  title?: React.ReactNode
  /** Zone centrale (recherche, fil d'Ariane). */
  children?: React.ReactNode
  /** Actions à droite (notifications, liens). */
  actions?: React.ReactNode
  /** Slot utilisateur (avatar + menu). */
  user?: React.ReactNode
}

/** Barre supérieure collante avec bouton d'ouverture du tiroir sur mobile. */
export function AppShellTopbar({ title, children, actions, user, className, ...props }: AppShellTopbarProps) {
  const shell = useAppShell()
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[var(--header-height)] shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    >
      <IconButton
        label={t('nav.openMenu')}
        icon={Menu}
        className="lg:hidden"
        onClick={() => shell?.setOpen(true)}
        aria-expanded={shell?.open ?? false}
      />
      {title ? <div className="min-w-0 truncate font-display text-lg font-semibold text-navy">{title}</div> : null}
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      {user ? <div className="flex shrink-0 items-center">{user}</div> : null}
    </header>
  )
}

export interface AppShellMainProps extends React.HTMLAttributes<HTMLElement> {
  /** Largeur maximale du contenu. */
  size?: 'default' | 'wide' | 'full'
}

/** Zone de contenu principale (cible du lien d'évitement `#contenu`). */
export function AppShellMain({ size = 'default', className, children, ...props }: AppShellMainProps) {
  return (
    <main
      id="contenu"
      tabIndex={-1}
      className={cn('flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8', className)}
      {...props}
    >
      <div className={cn('mx-auto w-full', size === 'default' && 'max-w-6xl', size === 'wide' && 'max-w-[90rem]')}>{children}</div>
    </main>
  )
}
