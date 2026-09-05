import Link from 'next/link'
import { ArrowLeft, Home, Search, type LucideIcon } from 'lucide-react'
import { Button, Emblem, Input, Ribbon } from '@fetrag/ui'

interface PublicNotFoundProps {
  eyebrow: string
  title: React.ReactNode
  description: string
  backHref: string
  backLabel: string
  icon?: LucideIcon
  /** Termes de recherche suggérés (texte de l'espace réservé). */
  searchPlaceholder?: string
}

/** Page introuvable d'une section publique : emblème, message ciblé, recherche et retour à la liste. */
export function PublicNotFound({ eyebrow, title, description, backHref, backLabel, icon: Icon, searchPlaceholder = 'Rechercher sur le site…' }: PublicNotFoundProps) {
  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-rings pointer-events-none absolute inset-0 -z-10 opacity-60 [background-position:center_-220px] [background-size:800px_800px]" />
      <div className="container-fetrag flex flex-col items-center py-20 text-center sm:py-28">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-blue-50">
          <Emblem size={60} decorative />
          {Icon ? (
            <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy">
              <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <Ribbon tone="gold">{eyebrow}</Ribbon>
        <h1 className="mt-4 font-display text-4xl font-semibold text-navy sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">{description}</p>
        <form action="/recherche" method="get" role="search" className="mt-8 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="q-not-found" className="sr-only">
            Rechercher sur le site
          </label>
          <Input id="q-not-found" name="q" type="search" leadingIcon={Search} placeholder={searchPlaceholder} className="h-12 rounded-full" />
          <Button type="submit" variant="primary" size="lg" className="shrink-0">
            Rechercher
          </Button>
        </form>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline" size="md">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md">
            <Link href="/">
              <Home aria-hidden="true" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
