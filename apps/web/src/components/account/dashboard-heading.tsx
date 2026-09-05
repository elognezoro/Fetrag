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
    <header className={cn('mb-6 flex flex-col gap-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-3xl flex-col gap-3">
          {eyebrow ? (
            <Ribbon tone={tone} size="sm">
              {eyebrow}
            </Ribbon>
          ) : null}
          <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-base leading-relaxed text-neutral-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div aria-hidden="true" className="h-[3px] w-24 rounded-full bg-[linear-gradient(90deg,var(--color-blue-500),var(--color-green-500),var(--color-gold-500))]" />
    </header>
  )
}
