import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Home, Search } from 'lucide-react'
import { Button, Emblem, Input, Ribbon } from '@fetrag/ui'
import { mainNavigation } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

/** Page 404 : emblème, recherche transverse et liens vers les sections principales. */
export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-rings pointer-events-none absolute inset-0 -z-10 opacity-60 [background-position:center_-260px] [background-size:900px_900px]"
      />
      <div className="container-fetrag flex flex-col items-center py-20 text-center sm:py-28">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-blue-50">
          <Emblem size={64} decorative />
        </div>
        <Ribbon tone="gold">Erreur 404</Ribbon>
        <h1 className="mt-4 text-4xl sm:text-5xl">
          Cette page est <span className="italic text-blue-600">introuvable</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          L&apos;adresse est peut-être erronée ou le contenu a été déplacé. Utilisez la recherche ou revenez à l&apos;accueil.
        </p>

        <form action="/recherche" method="get" role="search" className="mt-8 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="q-404" className="sr-only">
            Rechercher sur le site
          </label>
          <Input
            id="q-404"
            name="q"
            type="search"
            leadingIcon={Search}
            placeholder="Rechercher une actualité, une formation, un service..."
            className="h-12 rounded-full"
          />
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
          {mainNavigation.slice(0, 4).map((item) => (
            <Button key={item.href} asChild variant="ghost" size="md">
              <Link href={item.href}>
                {item.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
