import 'server-only'
import { isDomainError, type Principal } from '@fetrag/domain'
import { orders } from '@fetrag/payments'
import { getStorage } from '@fetrag/storage'

export type AdminOrderDetail = Awaited<ReturnType<typeof orders.get>>

/** URL signée (15 minutes) du PDF d'un reçu stocké en privé ; `null` si absent ou si la signature échoue. */
async function signedReceiptUrl(key: string | null | undefined): Promise<string | null> {
  if (!key) return null
  if (/^https?:\/\//i.test(key)) return key
  try {
    return await getStorage().getSignedUrl(key, { expiresInSeconds: 900 })
  } catch (error) {
    console.error('[admin/finance] signature du reçu impossible', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Détail d'une commande pour l'administration (`finance.read` vérifié par `orders.get`) :
 * lignes, paiements et remboursements, reçu (URL signée), historique de statut et livrables.
 * Renvoie `null` si la commande n'existe pas ou n'est pas accessible.
 */
export async function loadAdminOrder(principal: Principal, orderId: string): Promise<{ order: AdminOrderDetail; receiptUrl: string | null } | null> {
  try {
    const order = await orders.get(principal, orderId)
    const receiptUrl = await signedReceiptUrl(order.receipt?.pdfUrl)
    return { order, receiptUrl }
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) return null
    throw error
  }
}

/** Reste remboursable d'un paiement réussi (montant moins remboursements traités, approuvés ou en attente). */
export function refundableAmount(payment: { amount: number; status: string; refunds: Array<{ amount: number; status: string }> }): number {
  if (payment.status !== 'SUCCEEDED') return 0
  const used = payment.refunds.filter((r) => r.status === 'PROCESSED' || r.status === 'APPROVED' || r.status === 'REQUESTED').reduce((sum, r) => sum + r.amount, 0)
  return Math.max(0, payment.amount - used)
}
