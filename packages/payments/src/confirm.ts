import { Prisma, prisma, type OrderStatus, type PaymentStatus } from '@fetrag/db'
import { audit, emit, NotFoundError } from '@fetrag/domain'
import { log as logger } from './log'
import { sendPaymentNotification } from './emails'
import { fulfillOrder } from './fulfill'
import { issueReceipt } from './receipt'

export interface ConfirmPaymentOptions {
  raw?: Record<string, unknown>
  failureReason?: string | null
  actorId?: string | null
  correlationId?: string
}

export interface ConfirmPaymentResult {
  paymentId: string
  orderId: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  /** `false` si l'appel était redondant (statut déjà appliqué). */
  changed: boolean
  receiptNumber?: string
}

function orderStatusFor(status: PaymentStatus, current: OrderStatus): OrderStatus {
  switch (status) {
    case 'SUCCEEDED':
      return 'PAID'
    case 'FAILED':
      return current === 'PAID' || current === 'REFUNDED' || current === 'PARTIALLY_REFUNDED' ? current : 'FAILED'
    case 'CANCELLED':
      return current === 'PAID' || current === 'REFUNDED' || current === 'PARTIALLY_REFUNDED' ? current : 'CANCELLED'
    case 'REFUNDED':
      return 'REFUNDED'
    default:
      return current
  }
}

/** Un paiement réussi ne peut être rétrogradé que vers REFUNDED. */
function isAllowedTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return false
  if (from === 'REFUNDED') return false
  if (from === 'SUCCEEDED') return to === 'REFUNDED'
  if (from === 'FAILED' || from === 'CANCELLED') return to === 'SUCCEEDED' || to === 'PENDING'
  return true
}

/**
 * Applique le statut définitif d'un paiement (webhook, simulation, rapprochement) dans une transaction :
 * Payment + Order + StatusEvent, puis audit, événements, exécution de la commande, reçu et emails.
 */
export async function confirmPayment(
  paymentId: string,
  status: PaymentStatus,
  providerRef?: string | null,
  options: ConfirmPaymentOptions = {},
): Promise<ConfirmPaymentResult> {
  const outcome = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { order: true } })
    if (!payment) throw new NotFoundError('Paiement', paymentId)
    if (!isAllowedTransition(payment.status, status)) {
      return { payment, order: payment.order, changed: false as const, previousStatus: payment.status, previousOrderStatus: payment.order.status }
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status,
        providerRef: providerRef ?? payment.providerRef,
        confirmedAt: status === 'SUCCEEDED' ? new Date() : payment.confirmedAt,
        failureReason: status === 'FAILED' || status === 'CANCELLED' ? (options.failureReason ?? payment.failureReason ?? null) : null,
        rawPayload: options.raw ? (options.raw as Prisma.InputJsonObject) : undefined,
      },
    })

    const nextOrderStatus = orderStatusFor(status, payment.order.status)
    let order = payment.order
    if (nextOrderStatus !== payment.order.status) {
      order = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: nextOrderStatus, paidAt: nextOrderStatus === 'PAID' ? (payment.order.paidAt ?? new Date()) : payment.order.paidAt },
      })
      await tx.statusEvent.create({
        data: {
          entityType: 'Order',
          entityId: order.id,
          orderId: order.id,
          fromStatus: payment.order.status,
          toStatus: nextOrderStatus,
          actorId: options.actorId ?? null,
          comment: `Paiement ${status}${providerRef ? ` (${providerRef})` : ''}`,
        },
      })
    }
    return { payment: updatedPayment, order, changed: true as const, previousStatus: payment.status, previousOrderStatus: payment.order.status }
  })

  const result: ConfirmPaymentResult = {
    paymentId: outcome.payment.id,
    orderId: outcome.order.id,
    paymentStatus: outcome.payment.status,
    orderStatus: outcome.order.status,
    changed: outcome.changed,
  }
  if (!outcome.changed) return result

  const ctx = { actorId: options.actorId ?? null, correlationId: options.correlationId ?? null }
  if (status === 'SUCCEEDED') {
    await audit('payment.succeeded', { type: 'Payment', id: paymentId }, ctx, {
      before: { status: outcome.previousStatus },
      after: { status, providerRef: outcome.payment.providerRef, orderId: outcome.order.id, amount: outcome.payment.amount },
    })
    await emit('payment.succeeded', { paymentId, orderId: outcome.order.id, amount: outcome.payment.amount, currency: outcome.payment.currency }, { correlationId: options.correlationId })

    if (outcome.previousOrderStatus !== 'PAID') {
      try {
        await fulfillOrder(outcome.order.id)
      } catch (error) {
        logger.error('payments.fulfill_failed', { orderId: outcome.order.id, error: error instanceof Error ? error.message : String(error) })
        throw error
      }
      const receipt = await issueReceipt(outcome.order.id)
      result.receiptNumber = receipt.number
      await sendPaymentNotification('payment-succeeded', outcome.order.id, { receiptNumber: receipt.number })
    }
  } else if (status === 'FAILED' || status === 'CANCELLED') {
    await audit('payment.failed', { type: 'Payment', id: paymentId }, ctx, {
      before: { status: outcome.previousStatus },
      after: { status, reason: options.failureReason ?? null, orderId: outcome.order.id },
    })
    await emit('payment.failed', { paymentId, orderId: outcome.order.id, reason: options.failureReason ?? null }, { correlationId: options.correlationId })
    if (status === 'FAILED') await sendPaymentNotification('payment-failed', outcome.order.id, { reason: options.failureReason })
  }

  return result
}
