import type { ReactNode } from 'react'
import { Breadcrumbs, GradientDivider, Reveal, Ribbon, cn, type BreadcrumbItem, type Tone } from '@fetrag/ui'

export interface StaffPageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  /** Métadonnées (statut, référence, dates). */
  meta?: ReactNode
  tone?: Tone
  className?: string
}

/** En-tête de page d'un espace institutionnel : fil d'Ariane, ruban, titre serif, filet tricolore. */
export function StaffPageHeader({ eyebrow, title, description, breadcrumbs, actions, meta, tone = 'blue', className }: StaffPageHeaderProps) {
  return (
    <Reveal as="header" className={cn('mb-8 flex flex-col gap-4', className)}>
      {breadcrumbs && breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-3">
          {eyebrow ? (
            <Ribbon tone={tone} size="sm">
              {eyebrow}
            </Ribbon>
          ) : null}
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-navy text-balance sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-base leading-relaxed text-neutral-600">{description}</p> : null}
          {meta ? <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <GradientDivider width="lg" />
    </Reveal>
  )
}

export interface StaffSectionProps {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  tone?: Tone
  className?: string
  children: ReactNode
  /** Numéro d'ordre affiché en grand chiffre serif (« 01 »). */
  number?: string
}

/** Section d'une page d'espace : titre h2 serif avec numéro optionnel, actions à droite. */
export function StaffSection({ title, eyebrow, description, actions, tone = 'blue', className, children, number }: StaffSectionProps) {
  const toneText = tone === 'green' ? 'text-green-700' : tone === 'gold' ? 'text-gold-700' : tone === 'navy' ? 'text-navy' : 'text-blue-600'
  return (
    <section className={cn('mb-10', className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          {number ? (
            <span aria-hidden="true" className={cn('font-display text-4xl font-semibold leading-none tracking-tight', toneText)}>
              {number}
            </span>
          ) : null}
          <div className="flex flex-col gap-1.5">
            {eyebrow ? <p className={cn('eyebrow text-[11px]', toneText)}>{eyebrow}</p> : null}
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-navy sm:text-2xl">{title}</h2>
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

/** Paire libellé / valeur pour les fiches (demande, cohorte, organisation). */
export function DetailItem({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="eyebrow text-[11px] text-neutral-500">{label}</dt>
      <dd className="text-sm font-medium text-ink">{children ?? <span className="text-neutral-400">Non renseigné</span>}</dd>
    </div>
  )
}

/** Liste de définitions en grille responsive. */
export function DetailList({ children, className, columns = 2 }: { children: ReactNode; className?: string; columns?: 2 | 3 | 4 }) {
  const cols = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return <dl className={cn('grid gap-4', cols, className)}>{children}</dl>
}
