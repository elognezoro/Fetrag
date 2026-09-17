'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, LogIn, Menu, X } from 'lucide-react'
import { Button, Logo, cn } from '@fetrag/ui'
import { isActivePath, mainNavigation, siteConfig, webHref } from '@/lib/site'
import { UserMenuClient, type UserMenuUser } from './user-menu-client'

interface LmsTopbarProps {
  user: UserMenuUser | null
}

/**
 * Barre de navigation de la plateforme : logo + « Formation », liens principaux,
 * retour vers fetrag.ga, menu utilisateur et tiroir mobile.
 */
export function LmsTopbar({ user }: LmsTopbarProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const items = mainNavigation.filter((item) => !item.requiresAuth || user)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const close = useCallback(() => setOpen(false), [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200',
        scrolled ? 'bg-white/90 shadow-soft backdrop-blur-md' : 'bg-white/75 backdrop-blur-sm',
      )}
    >
      <div aria-hidden="true" className="tricolor-band h-1 w-full" />
      <div className="container-fetrag flex h-[var(--header-height)] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40" aria-label={`${siteConfig.name} - accueil`}>
          <Logo size={38} withText={false} priority />
          <span className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-navy">{siteConfig.brand}</span>
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy">{siteConfig.shortName}</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-0.5 lg:flex">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-blue-600',
                  'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-green-500 after:transition-transform after:duration-200 hover:after:scale-x-100',
                  active && 'text-blue-700 after:scale-x-100',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden min-w-0 shrink items-center gap-2 lg:flex">
          {/* Le lien vers le site institutionnel attend l'écran xl : à 1024 px, il faisait déborder l'en-tête. */}
          <a
            href={webHref('/')}
            className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-navy xl:inline-flex"
          >
            {siteConfig.domains.web}
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden="true" />
          </a>
          {user ? (
            <UserMenuClient user={user} />
          ) : (
            <Button asChild variant="primary" size="sm">
              <Link href="/connexion">
                <LogIn aria-hidden="true" />
                Connexion
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user ? <UserMenuClient user={user} compact /> : null}
          <button
            type="button"
            className="touch-target inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white text-navy shadow-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <MobileDrawer open={open} onClose={close} user={user} pathname={pathname} />
    </header>
  )
}

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  user: UserMenuUser | null
  pathname: string
}

/** Tiroir de navigation mobile : verrouille le défilement, se ferme à Échap, gère le focus. */
function MobileDrawer({ open, onClose, user, pathname }: MobileDrawerProps) {
  const reduceMotion = useReducedMotion()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // Rendu dans un portail : l'en-tête (backdrop-filter) créerait sinon un bloc conteneur pour position:fixed
  // et le tiroir serait réduit à la hauteur de l'en-tête.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const items = mainNavigation.filter((item) => !item.requiresAuth || user)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 30)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(focusTimer)
    }
  }, [open, onClose])

  const panelTransition = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 32 }

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-menu"
          id="menu-mobile"
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <button type="button" className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]" aria-label="Fermer le menu" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-white shadow-lift"
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '100%' }}
            transition={panelTransition}
          >
            <div aria-hidden="true" className="tricolor-band h-1 w-full" />
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2.5">
                <Logo size={34} withText={false} />
                <span className="font-display text-lg font-bold text-navy">{siteConfig.name}</span>
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className="touch-target inline-flex items-center justify-center rounded-full border border-neutral-200 text-navy focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
                aria-label="Fermer le menu"
                onClick={onClose}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Navigation mobile" className="flex flex-col px-3 py-2">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-xl px-3 py-3 text-base font-semibold text-neutral-800 transition hover:bg-blue-50 hover:text-blue-700',
                      active && 'bg-blue-50 text-blue-700',
                    )}
                    onClick={onClose}
                  >
                    {item.label}
                    {item.description ? <span className="mt-0.5 block text-xs font-normal text-neutral-500">{item.description}</span> : null}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto space-y-3 border-t border-neutral-200 bg-neutral-50 px-5 py-5">
              <a
                href={webHref('/')}
                className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"
              >
                <span>Retour sur {siteConfig.domains.web}</span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              {user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="primary" size="md">
                    <Link href={user.homeHref} onClick={onClose}>
                      Mon espace
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="md">
                    <Link href="/deconnexion" onClick={onClose}>
                      Déconnexion
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="primary" size="md">
                    <Link href="/connexion" onClick={onClose}>
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="md">
                    <a href={webHref('/inscription')}>Créer un compte</a>
                  </Button>
                </div>
              )}
              <p className="eyebrow text-center text-[11px] text-neutral-500">{siteConfig.mottoText}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
