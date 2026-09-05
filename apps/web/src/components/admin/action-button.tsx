'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button, type ButtonProps, toast } from '@fetrag/ui'
import type { ActionState } from '@/server/account/types'

export interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'type'> {
  /** Server Action exécutée au clic ; le message de retour est affiché en toast. */
  action: () => Promise<ActionState>
  pendingLabel?: string
  /** Rafraîchit la route après succès (par défaut). */
  refresh?: boolean
  onDone?: (state: ActionState) => void
}

/** Bouton relié à une Server Action sans formulaire (marquer, relancer, activer...). */
export function ActionButton({ action, pendingLabel = 'Traitement en cours', refresh = true, onDone, children, ...props }: ActionButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      const result = await action()
      if (result.status === 'error') toast.error(result.message ?? 'L’opération a échoué')
      else toast.success(result.message ?? 'Opération effectuée')
      onDone?.(result)
      if (refresh && result.status !== 'error') router.refresh()
    })
  }

  return (
    <Button type="button" onClick={run} loading={pending} loadingLabel={pendingLabel} {...props}>
      {children}
    </Button>
  )
}
