'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle, toast } from '@fetrag/ui'
import type { PublicFormState } from '@/server/public/form-state'

interface FormStatusProps {
  state: PublicFormState<string>
  /** Affiche aussi un toast à chaque changement d'état. */
  withToast?: boolean
  /** Titre affiché au-dessus du message de succès. */
  successTitle?: string
  className?: string
}

/** Message global d'un formulaire public (succès avec référence, ou erreur), annoncé aux lecteurs d'écran. */
export function FormStatus({ state, withToast = true, successTitle, className }: FormStatusProps) {
  useEffect(() => {
    if (!withToast || state.status === 'idle' || !state.message) return
    if (state.status === 'success') toast.success(state.message)
    else toast.error(state.message)
  }, [state, withToast])

  if (state.status === 'idle' || !state.message) return null
  const success = state.status === 'success'
  return (
    <Alert variant={success ? 'success' : 'danger'} className={className}>
      {success && successTitle ? <AlertTitle>{successTitle}</AlertTitle> : null}
      <AlertDescription>
        {state.message}
        {success && state.reference ? (
          <span className="mt-2 block">
            Référence de suivi : <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs font-semibold text-navy">{state.reference}</code>
          </span>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
