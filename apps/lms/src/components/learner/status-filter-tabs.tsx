import Link from 'next/link'
import { cn } from '@fetrag/ui'

export interface FilterTab {
  value: string
  label: string
  href: string
  count?: number
}

interface StatusFilterTabsProps {
  tabs: FilterTab[]
  active: string
  label: string
  className?: string
}

/** Onglets de filtre par liens (fonctionnent sans JavaScript) dans une capsule, avec compteurs. */
export function StatusFilterTabs({ tabs, active, label, className }: StatusFilterTabsProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        '-mx-5 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:px-0',
        // Fondu du bord droit sur mobile : indique que la rangée d'onglets se poursuit hors écran.
        '[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] sm:[mask-image:none]',
        className,
      )}
    >
      <ul className="inline-flex min-w-max items-center gap-1 rounded-full bg-neutral-100 p-1">
        {tabs.map((tab) => {
          const isActive = tab.value === active
          return (
            <li key={tab.value}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                  isActive ? 'bg-white text-blue-700 shadow-soft' : 'text-neutral-600 hover:text-navy',
                )}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] tabular-nums', isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-neutral-500')}>{tab.count}</span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
