import type { ReactNode } from 'react'
import { Emblem, Ribbon, cn } from '@fetrag/ui'

interface AuthCardProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  /** Largeur étendue. */
  wide?: boolean
  className?: string
}

/** Carte centrée des pages d'authentification : emblème, ruban, titre serif et contenu. */
export function AuthCard({ title, description, eyebrow, children, footer, wide = false, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        'pillar-top-green w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lift',
        wide ? 'max-w-2xl' : 'max-w-md',
        className,
      )}
    >
      <div className="px-6 pb-6 pt-8 text-center sm:px-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/60">
          <Emblem size={56} decorative />
        </div>
        {eyebrow ? <Ribbon tone="green">{eyebrow}</Ribbon> : null}
        <h1 className="mt-3 text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-neutral-600 sm:text-base">{description}</p> : null}
      </div>
      <div className="px-6 pb-8 sm:px-10">{children}</div>
      {footer ? <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 text-center text-sm text-neutral-600">{footer}</div> : null}
    </section>
  )
}
