import Link from 'next/link'
import { cn } from '@fetrag/ui'

const items = [
  { href: '/admin/finance', label: 'Tableau de bord' },
  { href: '/admin/finance/commandes', label: 'Commandes' },
  { href: '/admin/finance/prises-en-charge', label: 'Prises en charge' },
] as const

export type FinanceSection = (typeof items)[number]['href']

/** Navigation secondaire de la section Finance (pastilles, écho de l'anneau). Composant serveur. */
export function FinanceSubnav({ current }: { current: FinanceSection }) {
  return (
    <nav aria-label="Sections de la finance" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.href === current
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
              active ? 'border-blue-500 bg-blue-500 text-white shadow-soft' : 'border-neutral-200 bg-white text-navy hover:border-blue-300 hover:text-blue-700',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
