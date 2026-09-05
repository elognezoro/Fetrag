import Link from 'next/link'
import { Filter, RotateCcw } from 'lucide-react'
import { Button, Input, NativeSelect, cn, type NativeSelectOption } from '@fetrag/ui'

export interface FilterField {
  name: string
  label: string
  /** `select` avec options ou champ texte / date. */
  type?: 'text' | 'select' | 'date'
  options?: NativeSelectOption[]
  placeholder?: string
  value?: string
}

export interface FilterBarProps {
  action: string
  fields: FilterField[]
  /** Paramètres conservés (ex. onglet) transmis en champs cachés. */
  hidden?: Record<string, string | undefined>
  className?: string
  submitLabel?: string
}

/**
 * Barre de filtres GET (sans JavaScript) : sélecteurs natifs, champ de recherche et réinitialisation.
 * Les pages lisent `searchParams` et recalculent leurs listes.
 */
export function FilterBar({ action, fields, hidden = {}, className, submitLabel = 'Filtrer' }: FilterBarProps) {
  const hasValue = fields.some((f) => f.value)
  return (
    <form method="get" action={action} className={cn('flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:flex-row sm:flex-wrap sm:items-end', className)} role="search">
      {Object.entries(hidden).map(([name, value]) => (value ? <input key={name} type="hidden" name={name} value={value} /> : null))}
      {fields.map((field) => {
        const id = `filter-${field.name}`
        return (
          <div key={field.name} className="flex min-w-[10rem] flex-1 flex-col gap-1.5 sm:max-w-xs">
            <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <NativeSelect id={id} name={field.name} defaultValue={field.value ?? ''} options={[{ value: '', label: field.placeholder ?? 'Tous' }, ...(field.options ?? [])]} />
            ) : (
              <Input id={id} name={field.name} type={field.type === 'date' ? 'date' : 'search'} defaultValue={field.value ?? ''} placeholder={field.placeholder} />
            )}
          </div>
        )
      })}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="secondary" size="md" leftIcon={<Filter aria-hidden="true" />}>
          {submitLabel}
        </Button>
        {hasValue ? (
          <Button asChild variant="ghost" size="md">
            <Link href={action}>
              <RotateCcw aria-hidden="true" />
              Réinitialiser
            </Link>
          </Button>
        ) : null}
      </div>
    </form>
  )
}
