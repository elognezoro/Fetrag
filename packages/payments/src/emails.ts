import { resolvePublicUrl } from '@fetrag/config'
import { paymentMethodLabels } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { formatMoney } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { log } from './log'

export type PaymentEmailKind = 'payment-succeeded' | 'payment-failed' | 'payment-refunded'

/** Notification interne + email pour un événement de paiement (jamais bloquant pour le flux métier). */
export async function sendPaymentNotification(
  kind: PaymentEmailKind,
  orderId: string,
  extra: { reason?: string | null; amount?: number; receiptNumber?: string | null } = {},
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, firstName: true, name: true } },
        lines: { select: { label: true, quantity: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 1, select: { method: true } },
        receipt: { select: { number: true } },
      },
    })
    if (!order) return
    const webUrl = resolvePublicUrl('web')
    const amount = formatMoney(extra.amount ?? order.totalAmount, order.currency)
    const items = order.lines.map((l) => (l.quantity > 1 ? `${l.label} x${l.quantity}` : l.label)).join('\n')
    const method = order.payments[0] ? paymentMethodLabels[order.payments[0].method] : undefined
    const orderUrl = `${webUrl}/espace/paiements/${order.id}`

    const texts: Record<PaymentEmailKind, { title: string; body: string }> = {
      'payment-succeeded': {
        title: `Paiement confirmé - ${order.reference}`,
        body: `Votre paiement de ${amount} pour la commande ${order.reference} est confirmé. Votre reçu est disponible dans votre espace.`,
      },
      'payment-failed': {
        title: `Paiement non abouti - ${order.reference}`,
        body: `Le paiement de ${amount} pour la commande ${order.reference} n’a pas abouti. Vous pouvez réessayer depuis votre espace.`,
      },
      'payment-refunded': {
        title: `Remboursement effectué - ${order.reference}`,
        body: `Un remboursement de ${amount} a été effectué sur la commande ${order.reference}.`,
      },
    }
    await notifyUser(order.user.id, {
      ...texts[kind],
      href: `/espace/paiements/${order.id}`,
      app: 'web',
      category: 'payments',
      email: true,
      emailTemplate: kind,
      emailVariables: {
        firstName: order.user.firstName ?? order.user.name?.split(' ')[0] ?? '',
        orderReference: order.reference,
        amount,
        items,
        method,
        receiptNumber: extra.receiptNumber ?? order.receipt?.number ?? undefined,
        reason: extra.reason ?? undefined,
        orderUrl,
        retryUrl: `${webUrl}/paiement/${order.id}`,
      },
    })
  } catch (error) {
    log.error('payments.notification_failed', { kind, orderId, error: error instanceof Error ? error.message : String(error) })
  }
}
