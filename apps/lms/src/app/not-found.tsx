import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Home, LayoutDashboard, Search } from 'lucide-react'
import { Button, Emblem, Input, Ribbon } from '@fetrag/ui'
import { siteConfig, webHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

/** Page 404 de la plateforme : emblème, recherche dans le catalogue et liens utiles. */
export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-rings pointer-events-none absolute inset-0 -z-10 opacity-60 [background-position:center_-260px] [background-size:900px_900px]"
      />
      <div className="container-fetrag flex flex-col items-center py-20 text-center sm:py-28">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-green-50">
          <Emblem size={64} decorative />
        </div>
        <Ribbon tone="green">Erreur 404</Ribbon>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          Cette page est <span className="italic text-green-700">introuvable</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          Le contenu demandé n&apos;existe pas ou n&apos;est plus accessible. Recherchez une formation dans le catalogue ou revenez à votre tableau de bord.
        </p>

        <form action="/catalogue" method="get" role="search" className="mt-8 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="q-404" className="sr-only">
            Rechercher une formation
          </label>
          <Input id="q-404" name="q" type="search" leadingIcon={Search} placeholder="Rechercher une formation, un module..." className="h-12 rounded-full" />
          <Button type="submit" variant="primary" size="lg" className="shrink-0">
            Rechercher
          </Button>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline" size="md">
            <Link href="/">
              <Home aria-hidden="true" />
              Accueil
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md">
            <Link href="/catalogue">
              <BookOpen aria-hidden="true" />
              Catalogue
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" />
              Tableau de bord
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md">
            <a href={webHref('/')}>
              {siteConfig.domains.web}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
