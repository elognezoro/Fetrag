'use server'

import { revalidatePath } from 'next/cache'
import { idSchema, z } from '@fetrag/contracts'
import { formatMoney } from '@fetrag/domain'
import { issueReceipt, reconcile, refundPayment } from '@fetrag/payments'
import { requireActionCan, type ActionState } from './context'
import { successState, text, toErrorState } from './form-helpers'

export type RefundField = 'amount' | 'reason'

const refundSchema = z.object({
  paymentId: idSchema,
  orderId: idSchema,
  amount: z.coerce.number().int().positive('Montant strictement positif requis'),
  reason: z.string().trim().min(3, 'Précisez le motif (3 caractères minimum)').max(500),
})

/** Rembourse tout ou partie d'un paiement réussi (finance.refund). */
export async function refundPaymentAction(_previous: ActionState<RefundField>, formData: FormData): Promise<ActionState<RefundField>> {
  const parsed = refundSchema.safeParse({
    paymentId: text(formData, 'paymentId'),
    orderId: text(formData, 'orderId'),
    amount: text(formData, 'amount').replace(/\s/g, ''),
    reason: text(formData, 'reason'),
  })
  if (!parsed.success) {
    const fieldErrors: Partial<Record<RefundField, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if ((key === 'amount' || key === 'reason') && !(key in fieldErrors)) fieldErrors[key] = issue.message
    }
    return { status: 'error', message: 'Vérifiez le montant et le motif.', fieldErrors }
  }
  try {
    const principal = await requireActionCan('finance.refund')
    const refund = await refundPayment(principal, parsed.data.paymentId, parsed.data.amount, parsed.data.reason)
    revalidatePath('/admin/finance', 'layout')
    revalidatePath(`/espace/paiements/${parsed.data.orderId}`)
    return successState(`Remboursement de ${formatMoney(refund.amount)} ${refund.status === 'PROCESSED' ? 'traité' : 'transmis au fournisseur'}.`)
  } catch (error) {
    return toErrorState<RefundField>(error)
  }
}

/** Rapprochement : re-vérifie auprès des fournisseurs les paiements en attente depuis plus de 15 minutes. */
export async function reconcileAction(): Promise<ActionState> {
  try {
    await requireActionCan('finance.read')
    const result = await reconcile({ limit: 100 })
    revalidatePath('/admin/finance', 'layout')
    return successState(
      result.checked === 0
        ? 'Aucun paiement en attente à rapprocher.'
        : `${result.checked} paiement${result.checked > 1 ? 's' : ''} vérifié${result.checked > 1 ? 's' : ''}, ${result.updated} mis à jour.`,
      { checked: result.checked, updated: result.updated },
    )
  } catch (error) {
    return toErrorState(error)
  }
}

/** Émet (ou ré-émet le rendu du) reçu d'une commande payée. */
export async function issueReceiptAction(orderId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(orderId)
  if (!parsed.success) return { status: 'error', message: 'Commande inconnue.' }
  try {
    await requireActionCan('finance.read')
    const receipt = await issueReceipt(parsed.data)
    revalidatePath(`/admin/finance/commandes/${parsed.data}`)
    revalidatePath(`/espace/paiements/${parsed.data}`)
    return successState(`Reçu ${receipt.number} émis ; le PDF est généré en arrière-plan.`)
  } catch (error) {
    return toErrorState(error)
  }
}
