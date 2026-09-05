'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, toast, type ButtonProps } from '@fetrag/ui'
import type { ActionState } from '@/server/staff/action-state'

/**
 * Réagit à l'état renvoyé par une Server Action : toast de succès ou d'erreur,
 * rafraîchissement des données et redirection éventuelle.
 */
export function useActionFeedback(state: ActionState, options: { onSuccess?: (state: Extract<ActionState, { status: 'success' }>) => void; refresh?: boolean } = {}) {
  const router = useRouter()
  const last = useRef<ActionState | null>(null)
  const { onSuccess, refresh = true } = options
  useEffect(() => {
    if (state === last.current || state.status === 'idle') return
    last.current = state
    if (state.status === 'success') {
      if (state.message) toast.success(state.message)
      onSuccess?.(state)
      if (state.redirectTo) router.push(state.redirectTo)
      else if (refresh) router.refresh()
    } else if (state.status === 'error') {
      toast.error(state.message)
    }
  }, [state, router, onSuccess, refresh])
}

/** Message d'erreur global d'un formulaire (les erreurs de champ sont affichées par `FormField`). */
export function ActionAlert({ state, className }: { state: ActionState; className?: string }) {
  if (state.status !== 'error') return null
  const details = state.fieldErrors ? Object.entries(state.fieldErrors).filter(([key]) => key !== '_form') : []
  return (
    <Alert variant="danger" className={className}>
      <AlertTitle>{state.message}</AlertTitle>
      {details.length ? (
        <AlertDescription>
          <ul className="list-disc pl-4">
            {details.slice(0, 6).map(([key, message]) => (
              <li key={key}>
                <span className="font-semibold">{key}</span> : {message}
              </li>
            ))}
          </ul>
        </AlertDescription>
      ) : null}
    </Alert>
  )
}

/** Résumé d'une opération de masse (comptes créés, participants ignorés...). */
export function ActionPayloadSummary({ state }: { state: ActionState }) {
  if (state.status !== 'success' || !state.payload) return null
  const skipped = Array.isArray(state.payload.skipped) ? (state.payload.skipped as Array<{ participant?: string; holderName?: string; id?: string; reason?: string; reasons?: string[] }>) : []
  const errors = Array.isArray(state.payload.errors) ? (state.payload.errors as string[]) : []
  if (!skipped.length && !errors.length) return null
  return (
    <Alert variant="warning" className="mt-4">
      <AlertTitle>Éléments non traités</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {skipped.map((item, index) => (
            <li key={index}>
              {item.participant ?? item.holderName ?? item.id ?? 'Élément'} : {item.reason ?? item.reasons?.join(' ') ?? 'non éligible'}
            </li>
          ))}
          {errors.map((message, index) => (
            <li key={`e-${index}`}>{message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'loading'> {
  pendingLabel?: string
  children: ReactNode
}

/** Bouton de soumission qui reflète l'état `pending` du formulaire parent. */
export function SubmitButton({ pendingLabel = 'Enregistrement...', children, variant = 'primary', ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant={variant} loading={pending} loadingLabel={pendingLabel} {...props}>
      {children}
    </Button>
  )
}

/** Indicateur discret de traitement en cours. */
export function PendingIndicator({ label = 'Traitement en cours' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-500" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </span>
  )
}
