import Link from 'next/link'
import { cn } from '@fetrag/ui'

export interface FilterChip {
  label: string
  href: string
  active: boolean
  count?: number
}

interface FilterChipsProps {
  label: string
  chips: FilterChip[]
  className?: string
}

/**
 * Filtres en pastilles (liens GET) : la pastille active est bleue, les autres blanches à bordure.
 * Sur mobile, la rangée défile horizontalement d'un bord à l'autre de l'écran (gouttière du conteneur
 * compensée par `-mx-5`) ; à partir de `sm`, les pastilles passent à la ligne.
 */
export function FilterChips({ label, chips, className }: FilterChipsProps) {
  if (chips.length === 0) return null
  return (
    <nav
      aria-label={label}
      className={cn(
        'scrollbar-none -mx-5 flex items-center gap-2 overflow-x-auto px-5 py-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0',
        className,
      )}
    >
      <span className="eyebrow mr-1 shrink-0 text-[11px] text-neutral-500">{label}</span>
      {chips.map((chip) => (
        <Link
          key={chip.href + chip.label}
          href={chip.href}
          aria-current={chip.active ? 'page' : undefined}
          className={cn(
            'inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
            chip.active ? 'border-blue-500 bg-blue-500 text-white shadow-soft' : 'border-neutral-200 bg-white text-navy hover:border-blue-300 hover:text-blue-700',
          )}
        >
          {chip.label}
          {chip.count !== undefined ? <span className={cn('text-xs', chip.active ? 'text-white/80' : 'text-neutral-500')}>{chip.count}</span> : null}
        </Link>
      ))}
    </nav>
  )
}
