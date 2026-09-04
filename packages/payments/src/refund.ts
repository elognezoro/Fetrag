import { z } from '@fetrag/contracts'
import { prisma, type Refund } from '@fetrag/db'
import { audit, can, emit, ForbiddenError, NotFoundError, PreconditionError, ValidationError, type Principal } from '@fetrag/domain'
import { sendPaymentNotification } from './emails'
import { getPaymentProviderById } from './providers/index'

export const refundInputSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
})

/**
 * Rembourse tout ou partie d'un paiement réussi (permission `finance.refund`) :
 * Refund REQUESTED → PROCESSED via le PSP, Payment REFUNDED si total, Order REFUNDED / PARTIALLY_REFUNDED,
 * historique, audit, événement `payment.refunded` et email au client.
 */
export async function refundPayment(principal: Principal, paymentId: string, amount: number, reason: string): Promise<Refund> {
  if (!can(principal, 'finance.refund')) throw new ForbiddenError('Permission insuffisante', { action: 'finance.refund' })
  const parsed = refundInputSchema.safeParse({ paymentId, amount, reason })
  if (!parsed.success) throw new ValidationError('Demande de remboursement invalide', { issues: parsed.error.flatten().fieldErrors })

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { select: { id: true, status: true, totalAmount: true } }, refunds: { where: { status: { in: ['PROCESSED', 'APPROVED', 'REQUESTED'] } } } },
  })
  if (!payment) throw new NotFoundError('Paiement', paymentId)
  if (payment.status !== 'SUCCEEDED') throw new PreconditionError('Seul un paiement réussi peut être remboursé', { status: payment.status })
  if (!payment.providerRef) throw new PreconditionError('Paiement sans référence fournisseur')

  const alreadyRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0)
  const remaining = payment.amount - alreadyRefunded
  if (amount > remaining) {
    throw new ValidationError('Le montant dépasse le reste remboursable', { remaining })
  }

  const refund = await prisma.refund.create({ data: { paymentId, amount, reason: parsed.data.reason, status: 'REQUESTED' } })
  const provider = getPaymentProviderById(payment.provider)
  let processed: Refund
  try {
    const result = await provider.refund(payment.providerRef, amount)
    processed = await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: result.status === 'PROCESSED' ? 'PROCESSED' : result.status === 'REQUESTED' ? 'APPROVED' : 'REJECTED',
        providerRef: result.providerRef,
        processedAt: result.status === 'PROCESSED' ? new Date() : null,
      },
    })
    if (result.status === 'REJECTED') throw new PreconditionError('Le fournisseur a refusé le remboursement')
  } catch (error) {
    await prisma.refund.update({ where: { id: refund.id }, data: { status: 'REJECTED' } }).catch(() => undefined)
    throw error
  }

  const totalRefunded = alreadyRefunded + amount
  const fullyRefunded = totalRefunded >= payment.amount
  await prisma.$transaction(async (tx) => {
    if (fullyRefunded) {
      await tx.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } })
    }
    const nextOrderStatus = fullyRefunded && totalRefunded >= payment.order.totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    if (payment.order.status !== nextOrderStatus) {
      await tx.order.update({ where: { id: payment.order.id }, data: { status: nextOrderStatus } })
      await tx.statusEvent.create({
        data: {
          entityType: 'Order',
          entityId: payment.order.id,
          orderId: payment.order.id,
          fromStatus: payment.order.status,
          toStatus: nextOrderStatus,
          actorId: principal.id,
          comment: `Remboursement ${amount} ${payment.currency} : ${parsed.data.reason}`,
        },
      })
    }
  })

  await audit('payment.refunded', { type: 'Payment', id: paymentId }, { actorId: principal.id, actorEmail: principal.email }, {
    after: { refundId: processed.id, amount, reason: parsed.data.reason, providerRef: processed.providerRef, fullyRefunded },
  })
  await emit('payment.refunded', { paymentId, orderId: payment.order.id, refundId: processed.id, amount, fullyRefunded }, { actorId: principal.id })
  await sendPaymentNotification('payment-refunded', payment.order.id, { amount, reason: parsed.data.reason })
  return processed
}
