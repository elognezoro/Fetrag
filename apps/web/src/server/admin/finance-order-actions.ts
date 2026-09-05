'use server'

import { revalidatePath } from 'next/cache'
import { idSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { PreconditionError } from '@fetrag/domain'
import { enqueue, JobTypes } from '@fetrag/jobs'
import { issueReceipt } from '@fetrag/payments'
import { requireActionCan, type ActionState } from './context'
import { successState, toErrorState } from './form-helpers'

/**
 * Régénère le PDF du reçu d'une commande payée : émet le reçu s'il n'existe pas encore (`issueReceipt`),
 * sinon remet son rendu en file avec une nouvelle clé d'idempotence (finance.read).
 */
export async function regenerateReceiptAction(orderId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(orderId)
  if (!parsed.success) return { status: 'error', message: 'Commande inconnue.' }
  try {
    await requireActionCan('finance.read')
    const order = await prisma.order.findUnique({ where: { id: parsed.data }, select: { id: true, status: true, receipt: { select: { id: true, number: true } } } })
    if (!order) return { status: 'error', message: 'Commande introuvable.' }
    if (!order.receipt) {
      const receipt = await issueReceipt(order.id)
      revalidatePath(`/admin/finance/commandes/${order.id}`)
      revalidatePath(`/espace/paiements/${order.id}`)
      return successState(`Reçu ${receipt.number} émis ; le PDF est généré en arrière-plan.`)
    }
    if (!['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.status)) {
      throw new PreconditionError('Le reçu ne peut être régénéré que pour une commande réglée')
    }
    await enqueue(JobTypes.receiptRender, { receiptId: order.receipt.id, orderId: order.id }, { idempotencyKey: `receipt.render:${order.id}:${Date.now()}`, priority: 4 })
    revalidatePath(`/admin/finance/commandes/${order.id}`)
    revalidatePath(`/espace/paiements/${order.id}`)
    return successState(`Nouveau rendu du reçu ${order.receipt.number} mis en file.`)
  } catch (error) {
    return toErrorState(error)
  }
}
