import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react'

import { cn } from '../lib/cn'

const alertVariants = cva('relative flex w-full gap-3 rounded-xl border p-4 text-sm leading-relaxed [&_svg]:size-5 [&_svg]:shrink-0', {
  variants: {
    variant: {
      info: 'border-blue-200 bg-blue-50 text-blue-900 [&_svg]:text-blue-600',
      success: 'border-green-200 bg-green-50 text-green-900 [&_svg]:text-green-700',
      warning: 'border-gold-200 bg-gold-50 text-gold-900 [&_svg]:text-gold-700',
      danger: 'border-[#f5c6c6] bg-danger-soft text-[#7a1c1c] [&_svg]:text-danger',
    },
  },
  defaultVariants: { variant: 'info' },
})

const icons: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Icône personnalisée ; `null` pour ne pas en afficher. */
  icon?: LucideIcon | null
}

/** Message contextuel. Les variantes `warning` et `danger` sont annoncées immédiatement (`role="alert"`). */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = 'info', icon, children, ...props },
  ref,
) {
  const resolved = variant ?? 'info'
  const Icon = icon === null ? null : (icon ?? icons[resolved])
  const role = resolved === 'danger' || resolved === 'warning' ? 'alert' : 'status'
  return (
    <div ref={ref} role={role} className={cn(alertVariants({ variant: resolved }), className)} {...props}>
      {Icon ? <Icon strokeWidth={1.75} aria-hidden="true" className="mt-0.5" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
})

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <p className={cn('mb-1 font-semibold leading-snug', className)} {...props} />
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm opacity-90 [&_a]:font-semibold [&_a]:underline', className)} {...props} />
}
