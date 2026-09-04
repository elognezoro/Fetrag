import { Prisma, prisma, type Receipt } from '@fetrag/db'
import { makeReference, NotFoundError, PreconditionError, referencePrefixes } from '@fetrag/domain'
import { enqueue, JobTypes } from '@fetrag/jobs'

const RECEIPT_STATUSES = new Set(['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'])

/**
 * Émet le reçu numéroté (REC-AAAA-XXXXXX) d'une commande payée et met en file son rendu PDF.
 * Idempotent : renvoie le reçu existant.
 */
export async function issueReceipt(orderId: string): Promise<Receipt> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, status: true, receipt: true } })
  if (!order) throw new NotFoundError('Commande', orderId)
  if (order.receipt) return order.receipt
  if (!RECEIPT_STATUSES.has(order.status)) {
    throw new PreconditionError('Un reçu ne peut être émis que pour une commande payée', { status: order.status })
  }

  let receipt: Receipt | null = null
  for (let attempt = 0; attempt < 5 && !receipt; attempt++) {
    try {
      receipt = await prisma.receipt.create({ data: { orderId, number: makeReference(referencePrefixes.receipt) } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await prisma.receipt.findUnique({ where: { orderId } })
        if (existing) return existing
        continue
      }
      throw error
    }
  }
  if (!receipt) throw new PreconditionError('Impossible de générer un numéro de reçu unique')

  await enqueue(JobTypes.receiptRender, { receiptId: receipt.id, orderId }, { idempotencyKey: `receipt.render:${orderId}`, priority: 4 })
  return receipt
}
