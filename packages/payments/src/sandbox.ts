import { prisma } from '@fetrag/db'
import { NotFoundError, PreconditionError, ValidationError } from '@fetrag/domain'
import type { ConfirmPaymentResult } from './confirm'
import { getPaymentProviderById, SandboxProvider } from './providers/index'
import { processWebhook, processWebhookEvent } from './webhooks'

export type SandboxOutcome = 'success' | 'failure'

export interface SimulateResult {
  webhookEventId: string
  duplicate: boolean
  confirmation: ConfirmPaymentResult | { skipped: string } | null
}

/**
 * Simule l'issue d'un paiement sandbox : génère un webhook signé (HMAC `PAYMENT_WEBHOOK_SECRET`),
 * le journalise via `processWebhook` puis le traite immédiatement (le job en file constatera
 * l'événement déjà traité). Utilisé par la page `/paiement/[orderId]/sandbox` et les tests E2E.
 */
export async function simulate(paymentId: string, outcome: SandboxOutcome): Promise<SimulateResult> {
  if (outcome !== 'success' && outcome !== 'failure') throw new ValidationError('Issue de simulation invalide', { outcome })
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, provider: true, providerRef: true, status: true, amount: true, currency: true },
  })
  if (!payment) throw new NotFoundError('Paiement', paymentId)
  if (payment.provider !== 'sandbox') throw new PreconditionError('Ce paiement n’est pas un paiement de démonstration', { provider: payment.provider })
  if (!payment.providerRef) throw new PreconditionError('Paiement sandbox sans référence')
  if (payment.status !== 'PENDING' && payment.status !== 'INITIATED') {
    throw new PreconditionError('Ce paiement a déjà une issue définitive', { status: payment.status })
  }

  const provider = getPaymentProviderById('sandbox')
  if (!(provider instanceof SandboxProvider)) throw new PreconditionError('Fournisseur sandbox indisponible')
  const webhook = provider.buildWebhook({ paymentRef: payment.providerRef, amount: payment.amount, currency: payment.currency, outcome })
  const journal = await processWebhook('sandbox', webhook.headers, webhook.body)
  const confirmation = journal.duplicate ? null : await processWebhookEvent(journal.webhookEventId)
  return { webhookEventId: journal.webhookEventId, duplicate: journal.duplicate, confirmation }
}

export const sandbox = { simulate }
