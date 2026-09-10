import * as React from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'

import { cn } from '../lib/cn'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Bouton ou lien d'action. */
  action?: React.ReactNode
  /** Version compacte (dans une carte ou un tableau). */
  compact?: boolean
}

/** État vide : icône dans un anneau, titre serif, description et action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-4 py-10 sm:px-6 sm:py-14',
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          'relative flex items-center justify-center rounded-full bg-blue-50 text-blue-600',
          'before:absolute before:inset-[-6px] before:rounded-full before:border-2 before:border-dashed before:border-blue-200',
          compact ? 'size-12' : 'size-16',
        )}
      >
        <Icon className={compact ? 'size-5' : 'size-7'} strokeWidth={1.75} />
      </div>
      <h3 className={cn('font-display font-semibold text-navy', compact ? 'text-lg' : 'mt-2 text-xl')}>{title}</h3>
      {description ? <p className="max-w-md text-sm leading-relaxed text-neutral-600">{description}</p> : null}
      {action ? <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{action}</div> : null}
    </div>
  )
}
