import { prisma, type PaymentStatus } from '@fetrag/db'
import { log as logger } from './log'
import { confirmPayment } from './confirm'
import { isTerminalStatus } from './provider'
import { getPaymentProviderById } from './providers/index'

/** Délai à partir duquel un paiement PENDING est re-vérifié auprès du fournisseur. */
export const RECONCILE_AFTER_MS = 15 * 60_000

export interface ReconcileResult {
  checked: number
  updated: number
  items: Array<{ paymentId: string; providerRef: string; from: PaymentStatus; to: PaymentStatus }>
}

/**
 * Rapprochement : re-vérifie auprès du PSP les paiements PENDING depuis plus de 15 minutes
 * et applique les statuts définitifs via `confirmPayment`. À planifier (cron) toutes les 15-30 minutes.
 */
export async function reconcile(options: { limit?: number } = {}): Promise<ReconcileResult> {
  const limit = Math.min(200, Math.max(1, options.limit ?? 50))
  const pending = await prisma.payment.findMany({
    where: { status: 'PENDING', providerRef: { not: null }, updatedAt: { lt: new Date(Date.now() - RECONCILE_AFTER_MS) } },
    orderBy: { updatedAt: 'asc' },
    take: limit,
    select: { id: true, provider: true, providerRef: true, status: true },
  })
  const result: ReconcileResult = { checked: 0, updated: 0, items: [] }

  for (const payment of pending) {
    if (!payment.providerRef) continue
    result.checked++
    try {
      const provider = getPaymentProviderById(payment.provider)
      const remote = await provider.getStatus(payment.providerRef)
      if (remote.status === payment.status || !isTerminalStatus(remote.status)) {
        // Toujours en attente : on touche la ligne pour la revoir au prochain cycle sans la re-tester en boucle.
        await prisma.payment.update({ where: { id: payment.id }, data: { updatedAt: new Date() } })
        continue
      }
      const confirmation = await confirmPayment(payment.id, remote.status, remote.providerRef, {
        raw: { reconciled: true, ...(remote.raw ?? {}) },
        failureReason: remote.status === 'FAILED' ? 'Paiement non confirmé par le fournisseur (rapprochement)' : null,
      })
      if (confirmation.changed) {
        result.updated++
        result.items.push({ paymentId: payment.id, providerRef: payment.providerRef, from: payment.status, to: remote.status })
      }
    } catch (error) {
      logger.warn('payments.reconcile_failed', { paymentId: payment.id, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return result
}
