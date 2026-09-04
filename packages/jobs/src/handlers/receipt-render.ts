import { prisma } from '@fetrag/db'
import { NotFoundError, PreconditionError } from '@fetrag/domain'
import { buildKey, getStorage } from '@fetrag/storage'
import { parseReceiptRender } from '../payloads'
import { renderReceiptPdf } from '../pdf/receipt'
import type { JobHandler } from '../types'

const methodLabels: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement',
  CASH: 'Espèces',
  SPONSORSHIP: 'Prise en charge',
  FREE: 'Gratuit',
}

/** Génère le PDF d'un reçu (commande payée) en stockage privé et renseigne `Receipt.pdfUrl`. */
export const receiptRenderHandler: JobHandler = async (payload, ctx) => {
  const { receiptId, orderId } = parseReceiptRender(payload)
  const receipt = await prisma.receipt.findFirst({
    where: receiptId ? { id: receiptId } : { orderId },
    include: {
      order: {
        include: {
          user: { select: { name: true, firstName: true, lastName: true, email: true } },
          organization: { select: { name: true } },
          lines: { orderBy: { label: 'asc' } },
          payments: { where: { status: 'SUCCEEDED' }, orderBy: { confirmedAt: 'desc' }, take: 1 },
          coupon: { select: { code: true } },
          sponsorship: { select: { label: true } },
        },
      },
    },
  })
  if (!receipt) throw new NotFoundError('Reçu', receiptId ?? orderId)
  const order = receipt.order
  if (order.status !== 'PAID' && order.status !== 'PARTIALLY_REFUNDED' && order.status !== 'REFUNDED') {
    throw new PreconditionError('Le reçu ne peut être généré que pour une commande payée', { status: order.status })
  }
  const payment = order.payments[0]
  const customerName =
    order.user.name ?? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') ?? order.user.email

  const pdf = await renderReceiptPdf({
    number: receipt.number,
    issuedAt: receipt.issuedAt,
    orderReference: order.reference,
    orderDate: order.createdAt,
    customerName: customerName || order.user.email,
    customerEmail: order.user.email,
    organizationName: order.organization?.name,
    lines: order.lines.map((l) => ({ label: l.label, quantity: l.quantity, unitAmount: l.unitAmount, totalAmount: l.totalAmount })),
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentMethod: payment ? (methodLabels[payment.method] ?? payment.method) : 'Sans paiement',
    paymentRef: payment?.providerRef,
    paidAt: order.paidAt ?? payment?.confirmedAt,
    couponCode: order.coupon?.code,
    sponsorshipLabel: order.sponsorship?.label,
  })

  const { key } = await getStorage().put(buildKey('receipts', `${receipt.number}.pdf`), pdf, {
    contentType: 'application/pdf',
    visibility: 'PRIVATE',
  })
  await prisma.receipt.update({ where: { id: receipt.id }, data: { pdfUrl: key } })
  ctx.logger.info('receipt.render.done', { receiptId: receipt.id, key })
  return { key, receiptId: receipt.id }
}
