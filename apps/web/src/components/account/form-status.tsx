'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, toast } from '@fetrag/ui'
import type { ActionState } from '@/server/account/types'

interface FormStatusProps {
  state: ActionState
  /** Affiche aussi un toast à chaque changement d'état. */
  withToast?: boolean
  className?: string
}

/** Message global d'un formulaire piloté par `useActionState` (succès ou erreur), annoncé aux lecteurs d'écran. */
export function FormStatus({ state, withToast = true, className }: FormStatusProps) {
  useEffect(() => {
    if (!withToast || state.status === 'idle' || !state.message) return
    if (state.status === 'success') toast.success(state.message)
    else toast.error(state.message)
  }, [state, withToast])

  if (state.status === 'idle' || !state.message) return null
  return (
    <Alert variant={state.status === 'success' ? 'success' : 'danger'} className={className}>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )
}
