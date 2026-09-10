import type { ReactNode } from 'react'
import { Breadcrumbs, Ribbon, cn, type BreadcrumbItem } from '@fetrag/ui'

export interface DashboardHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  tone?: 'blue' | 'green' | 'gold' | 'navy'
  className?: string
}

/** En-tête de page d'un tableau de bord : fil d'Ariane, ruban, titre serif, accroche et actions. Composant serveur. */
export function DashboardHeading({ eyebrow, title, description, actions, breadcrumbs, tone = 'blue', className }: DashboardHeadingProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-3 sm:gap-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 max-w-3xl flex-col gap-2.5 sm:gap-3">
          {eyebrow ? (
            <Ribbon tone={tone} size="sm">
              {eyebrow}
            </Ribbon>
          ) : null}
          <h1 className="text-balance font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">{description}</p> : null}
        </div>
        {/* Mobile : actions empilées pleine largeur (grille) ; à partir de `sm` : rangée alignée à droite. */}
        {actions ? <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center">{actions}</div> : null}
      </div>
      <div aria-hidden="true" className="h-[3px] w-24 rounded-full bg-[linear-gradient(90deg,var(--color-blue-500),var(--color-green-500),var(--color-gold-500))]" />
    </header>
  )
}
