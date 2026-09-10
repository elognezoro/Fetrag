import Link from 'next/link'
import type { ReactNode } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { Button, Input, NativeSelect, cn } from '@fetrag/ui'

export interface FilterSelect {
  name: string
  label: string
  value?: string
  options: Array<{ value: string; label: string }>
  /** Libellé de l'option « tous ». */
  allLabel?: string
}

export interface FilterDateRange {
  fromName: string
  toName: string
  fromValue?: string
  toValue?: string
  label?: string
}

export interface FilterBarProps {
  /** Chemin de la liste (le formulaire est envoyé en GET). */
  action: string
  q?: string
  searchPlaceholder?: string
  selects?: FilterSelect[]
  dateRange?: FilterDateRange
  /** Champs cachés conservés entre les filtres (ex. tri). */
  hidden?: Record<string, string | undefined>
  /** Boutons additionnels (export, création). */
  actions?: ReactNode
  className?: string
}

/**
 * Barre de recherche et de filtres (composant serveur, formulaire GET sans JavaScript) :
 * recherche plein texte, listes déroulantes, plage de dates, réinitialisation.
 */
export function FilterBar({ action, q, searchPlaceholder = 'Rechercher', selects = [], dateRange, hidden = {}, actions, className }: FilterBarProps) {
  const hasFilters = Boolean(q) || selects.some((s) => s.value) || Boolean(dateRange?.fromValue) || Boolean(dateRange?.toValue)
  return (
    <form method="get" action={action} role="search" className={cn('flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft sm:p-4', className)}>
      {Object.entries(hidden).map(([name, value]) => (value ? <input key={name} type="hidden" name={name} value={value} /> : null))}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${action}-q`} className="sr-only">
            Rechercher
          </label>
          <Input id={`${action}-q`} name="q" type="search" defaultValue={q ?? ''} placeholder={searchPlaceholder} leadingIcon={Search} maxLength={200} />
        </div>
        {selects.map((select) => (
          <div key={select.name} className="w-full lg:w-48">
            <label htmlFor={`${action}-${select.name}`} className="mb-1 block text-xs font-semibold text-neutral-600">
              {select.label}
            </label>
            <NativeSelect
              id={`${action}-${select.name}`}
              name={select.name}
              defaultValue={select.value ?? ''}
              options={[{ value: '', label: select.allLabel ?? 'Tous' }, ...select.options]}
            />
          </div>
        ))}
        {dateRange ? (
          <fieldset className="min-w-0">
            <legend className="mb-1 text-xs font-semibold text-neutral-600">{dateRange.label ?? 'Période'}</legend>
            {/* Deux champs de date côte à côte, chacun sur la moitié de la largeur disponible sur mobile. */}
            <div className="grid grid-cols-2 gap-2 lg:flex">
              <div className="min-w-0">
                <label htmlFor={`${action}-${dateRange.fromName}`} className="sr-only">
                  Du
                </label>
                <Input id={`${action}-${dateRange.fromName}`} type="date" name={dateRange.fromName} defaultValue={dateRange.fromValue ?? ''} className="w-full min-w-0 lg:w-40" />
              </div>
              <div className="min-w-0">
                <label htmlFor={`${action}-${dateRange.toName}`} className="sr-only">
                  Au
                </label>
                <Input id={`${action}-${dateRange.toName}`} type="date" name={dateRange.toName} defaultValue={dateRange.toValue ?? ''} className="w-full min-w-0 lg:w-40" />
              </div>
            </div>
          </fieldset>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
          <Button type="submit" variant="secondary" size="md" className="w-full sm:w-auto">
            Filtrer
          </Button>
          {hasFilters ? (
            <Button asChild variant="ghost" size="md" className="w-full sm:w-auto">
              <Link href={action}>
                <RotateCcw aria-hidden="true" />
                Réinitialiser
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 pt-3">{actions}</div> : null}
    </form>
  )
}
