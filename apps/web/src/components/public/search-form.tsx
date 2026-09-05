import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { Button, Input, NativeSelect, cn, type NativeSelectOption } from '@fetrag/ui'

export interface SearchFormSelect {
  name: string
  label: string
  options: NativeSelectOption[]
  value?: string
  placeholder?: string
}

interface SearchFormProps {
  /** Route cible du formulaire GET. */
  action: string
  /** Valeur courante du champ `q`. */
  query?: string
  placeholder?: string
  /** Sélecteurs supplémentaires (type, catégorie…), envoyés en paramètres GET. */
  selects?: SearchFormSelect[]
  /** Paramètres conservés en champs cachés (ex. onglet courant). */
  hidden?: Record<string, string | undefined>
  /** Lien de réinitialisation affiché lorsqu'un filtre est actif. */
  resetHref?: string
  submitLabel?: string
  className?: string
}

/** Barre de recherche et de filtres fonctionnant sans JavaScript (formulaire GET, Server Components). */
export function SearchForm({ action, query, placeholder = 'Rechercher…', selects = [], hidden = {}, resetHref, submitLabel = 'Rechercher', className }: SearchFormProps) {
  const active = Boolean(query) || selects.some((s) => Boolean(s.value))
  return (
    <form action={action} method="get" role="search" className={cn('flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft lg:flex-row lg:items-end', className)}>
      {Object.entries(hidden).map(([name, value]) => (value ? <input key={name} type="hidden" name={name} value={value} /> : null))}
      <div className="flex-1">
        <label htmlFor={`${action}-q`} className="mb-1.5 block text-sm font-semibold text-navy">
          Recherche
        </label>
        <Input id={`${action}-q`} name="q" type="search" defaultValue={query} placeholder={placeholder} leadingIcon={Search} maxLength={200} />
      </div>
      {selects.map((select) => (
        <div key={select.name} className="lg:w-56">
          <label htmlFor={`${action}-${select.name}`} className="mb-1.5 block text-sm font-semibold text-navy">
            {select.label}
          </label>
          <NativeSelect id={`${action}-${select.name}`} name={select.name} defaultValue={select.value ?? ''} options={select.options} placeholder={select.placeholder} />
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" className="flex-1 lg:flex-none">
          {submitLabel}
        </Button>
        {active && resetHref ? (
          <Button asChild variant="ghost" size="md">
            <Link href={resetHref}>
              <X aria-hidden="true" />
              Réinitialiser
            </Link>
          </Button>
        ) : null}
      </div>
    </form>
  )
}
