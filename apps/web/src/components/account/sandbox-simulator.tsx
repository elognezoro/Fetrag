'use client'

import { useActionState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { idleState, type ActionState } from '@/server/account/types'
import { simulateSandboxAction } from '@/server/account/payments'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

interface SandboxSimulatorProps {
  orderId: string
  paymentId: string
}

/** Boutons de simulation du fournisseur sandbox (succès / échec) : génèrent un webhook signé. */
export function SandboxSimulator({ orderId, paymentId }: SandboxSimulatorProps) {
  const [state, action] = useActionState<ActionState, FormData>(simulateSandboxAction, idleState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="paymentId" value={paymentId} />
      <FormStatus state={state} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SubmitButton name="outcome" value="success" variant="accent" size="lg" pendingLabel="Confirmation en cours" leftIcon={<CheckCircle2 aria-hidden="true" />}>
          Simuler un paiement réussi
        </SubmitButton>
        <SubmitButton name="outcome" value="failure" variant="outline" size="lg" pendingLabel="Traitement en cours" leftIcon={<XCircle aria-hidden="true" />}>
          Simuler un échec
        </SubmitButton>
      </div>
    </form>
  )
}
