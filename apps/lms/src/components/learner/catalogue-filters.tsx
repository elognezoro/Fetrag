'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { courseModalityLabels, pillarLabels, pillars } from '@fetrag/contracts'
import { Button, Checkbox, FormField, Input, NativeSelect, cn } from '@fetrag/ui'

const sortOptions = [
  { value: 'programme', label: 'Ordre du programme (01 à 10)' },
  { value: 'titre', label: 'Titre (A à Z)' },
  { value: 'duree', label: 'Durée croissante' },
  { value: 'recent', label: 'Publication la plus récente' },
]

interface CatalogueFiltersProps {
  total: number
}

/** Barre de filtres du catalogue : recherche, pilier, modalité, gratuit, tri. Navigation par URL (partageable). */
export function CatalogueFilters({ total }: CatalogueFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      }
      const qs = next.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [pathname, router, searchParams],
  )

  const hasFilters = ['q', 'pilier', 'modalite', 'gratuit', 'tri'].some((key) => searchParams.has(key))

  return (
    <form
      role="search"
      aria-label="Filtrer le catalogue"
      className={cn('rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:p-5', pending && 'opacity-80')}
      onSubmit={(event) => {
        event.preventDefault()
        update({ q: query.trim() })
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <FormField label="Rechercher" htmlFor="catalogue-q">
          <Input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leadingIcon={Search}
            placeholder="Module, thème, mot clé..."
            autoComplete="off"
          />
        </FormField>
        <FormField label="Pilier" htmlFor="catalogue-pilier">
          <NativeSelect
            name="pilier"
            value={searchParams.get('pilier') ?? ''}
            onChange={(event) => update({ pilier: event.target.value })}
            options={[{ value: '', label: 'Tous les piliers' }, ...pillars.map((p) => ({ value: p, label: pillarLabels[p] }))]}
          />
        </FormField>
        <FormField label="Modalité" htmlFor="catalogue-modalite">
          <NativeSelect
            name="modalite"
            value={searchParams.get('modalite') ?? ''}
            onChange={(event) => update({ modalite: event.target.value })}
            options={[
              { value: '', label: 'Toutes les modalités' },
              { value: 'ASYNC', label: courseModalityLabels.ASYNC },
              { value: 'SYNC', label: courseModalityLabels.SYNC },
              { value: 'HYBRID', label: courseModalityLabels.HYBRID },
            ]}
          />
        </FormField>
        <FormField label="Trier par" htmlFor="catalogue-tri">
          <NativeSelect name="tri" value={searchParams.get('tri') ?? 'programme'} onChange={(event) => update({ tri: event.target.value === 'programme' ? null : event.target.value })} options={sortOptions} />
        </FormField>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <FormField label="Formations gratuites uniquement" htmlFor="catalogue-gratuit" inline>
          <Checkbox checked={searchParams.get('gratuit') === '1'} onCheckedChange={(checked) => update({ gratuit: checked === true ? '1' : null })} />
        </FormField>
        <div className="flex items-center gap-2">
          <p className="text-sm text-neutral-600" aria-live="polite">
            <SlidersHorizontal className="mr-1 inline size-4 align-text-bottom text-neutral-400" aria-hidden="true" />
            {total} {total > 1 ? 'formations' : 'formation'}
          </p>
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            Rechercher
          </Button>
          {hasFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))} leftIcon={<X aria-hidden="true" />}>
              Réinitialiser
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}
