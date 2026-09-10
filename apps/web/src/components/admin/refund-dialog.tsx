'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'
import { Undo2 } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { refundPaymentAction, type RefundField } from '@/server/admin/finance-actions'

export interface RefundDialogProps {
  paymentId: string
  orderId: string
  /** Montant restant remboursable (entier XAF). */
  remaining: number
  currency: string
  reference: string
}

/** Remboursement total ou partiel d'un paiement réussi (finance.refund). */
export function RefundDialog({ paymentId, orderId, remaining, currency, reference }: RefundDialogProps) {
  const id = useId()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState<RefundField>, FormData>(refundPaymentAction, idleState)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.status === 'success') {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" leftIcon={<Undo2 aria-hidden="true" />}>
          Rembourser
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Rembourser le paiement</DialogTitle>
          <DialogDescription>
            Commande {reference} · reste remboursable : {new Intl.NumberFormat('fr-FR').format(remaining)} {currency}. Le client est informé par email et la commande passe en
            « remboursée » ou « partiellement remboursée ».
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="paymentId" value={paymentId} />
          <input type="hidden" name="orderId" value={orderId} />
          <FormStatus state={state} withToast={false} />
          <FormField label={`Montant (${currency})`} htmlFor={`${id}-amount`} required error={errors.amount}>
            <Input id={`${id}-amount`} name="amount" type="number" min={1} max={remaining} step={1} inputMode="numeric" defaultValue={remaining} required />
          </FormField>
          <FormField label="Motif" htmlFor={`${id}-reason`} required error={errors.reason} hint="Transmis au client et conservé dans le journal d’audit.">
            <Textarea id={`${id}-reason`} name="reason" rows={3} maxLength={500} required />
          </FormField>
          <div className="flex justify-end">
            <SubmitButton variant="danger" pendingLabel="Remboursement en cours" className="w-full sm:w-auto">
              Confirmer le remboursement
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
