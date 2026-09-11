import type { ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@fetrag/ui'

interface FormAlertProps {
  tone: 'danger' | 'warning' | 'success' | 'info'
  children: ReactNode
  id?: string
  className?: string
}

const styles: Record<FormAlertProps['tone'], { box: string; icon: typeof AlertCircle }> = {
  danger: { box: 'border-danger/30 bg-danger-soft text-danger', icon: AlertCircle },
  warning: { box: 'border-gold-300 bg-gold-50 text-gold-800', icon: AlertTriangle },
  success: { box: 'border-green-300 bg-green-50 text-green-800', icon: CheckCircle2 },
  info: { box: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info },
}

/** Message de formulaire accessible (annoncé par les lecteurs d'écran ; les tons danger et warning sont des alertes). */
export function FormAlert({ tone, children, id, className }: FormAlertProps) {
  const { box, icon: Icon } = styles[tone]
  const assertive = tone === 'danger' || tone === 'warning'
  return (
    <div
      id={id}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={cn('flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium', box, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
