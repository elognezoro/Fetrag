import { paymentWebhookSchema } from '@fetrag/contracts'
import { Prisma, prisma } from '@fetrag/db'
import { NotFoundError, ValidationError } from '@fetrag/domain'
import { enqueue, JobTypes } from '@fetrag/jobs'
import { log as logger } from './log'
import { confirmPayment, type ConfirmPaymentResult } from './confirm'
import { headerValue, type HeadersLike } from './provider'
import { getPaymentProviderById } from './providers/index'

export interface ProcessWebhookResult {
  webhookEventId: string
  duplicate: boolean
  jobId?: string
}

const SIGNATURE_HEADERS = ['x-fetrag-signature', 'x-signature', 'x-hub-signature-256', 'signature']

function findSignature(headers: HeadersLike): string | null {
  for (const name of SIGNATURE_HEADERS) {
    const value = headerValue(headers, name)
    if (value) return value.slice(0, 500)
  }
  return null
}

/**
 * Point d'entrée des webhooks PSP : vérifie la signature via le fournisseur, journalise `WebhookEvent`
 * (unicité provider + externalId : les doublons sont ignorés) puis met en file `webhook.process`.
 * Le corps brut doit être transmis tel quel (la signature porte sur les octets reçus).
 */
export async function processWebhook(providerId: string, headers: HeadersLike, rawBody: string): Promise<ProcessWebhookResult> {
  const provider = getPaymentProviderById(providerId)
  const signature = findSignature(headers)

  let parsed
  try {
    parsed = await provider.handleWebhook(headers, rawBody)
  } catch (error) {
    await prisma.webhookEvent
      .create({
        data: {
          provider: provider.id,
          eventType: 'rejected',
          externalId: null,
          signature,
          verified: false,
          error: (error instanceof Error ? error.message : 'Webhook rejeté').slice(0, 500),
          processedAt: new Date(),
          payload: { raw: rawBody.slice(0, 8000) },
        },
      })
      .catch((e: unknown) => logger.error('webhook.journal_failed', { error: e instanceof Error ? e.message : String(e) }))
    throw error
  }

  let eventId: string
  try {
    const event = await prisma.webhookEvent.create({
      data: {
        provider: provider.id,
        eventType: parsed.eventType,
        externalId: parsed.externalId,
        signature,
        verified: true,
        payload: parsed as unknown as Prisma.InputJsonObject,
      },
      select: { id: true },
    })
    eventId = event.id
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.webhookEvent.findUnique({
        where: { provider_externalId: { provider: provider.id, externalId: parsed.externalId } },
        select: { id: true },
      })
      logger.info('webhook.duplicate', { provider: provider.id, externalId: parsed.externalId })
      return { webhookEventId: existing?.id ?? '', duplicate: true }
    }
    throw error
  }

  const job = await enqueue(JobTypes.webhookProcess, { webhookEventId: eventId }, { idempotencyKey: `webhook.process:${eventId}`, priority: 2 })
  return { webhookEventId: eventId, duplicate: false, jobId: job.id }
}

/**
 * Traitement métier d'un webhook journalisé (appelé par le job `webhook.process` ou par `sandbox.simulate`) :
 * retrouve le paiement par référence fournisseur, contrôle le montant et applique `confirmPayment`.
 */
export async function processWebhookEvent(webhookEventId: string): Promise<ConfirmPaymentResult | { skipped: string }> {
  const event = await prisma.webhookEvent.findUnique({ where: { id: webhookEventId } })
  if (!event) throw new NotFoundError('Webhook', webhookEventId)
  if (event.processedAt) return { skipped: 'already_processed' }
  if (!event.verified) {
    await prisma.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), error: 'Signature non vérifiée' } })
    return { skipped: 'unverified' }
  }

  const parsed = paymentWebhookSchema.safeParse(event.payload)
  if (!parsed.success) {
    await prisma.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), error: 'Charge utile invalide' } })
    throw new ValidationError('Charge utile de webhook invalide', { webhookEventId })
  }
  const data = parsed.data

  const payment =
    (await prisma.payment.findFirst({ where: { provider: event.provider, providerRef: data.paymentRef }, select: { id: true, amount: true, currency: true } })) ??
    (/^[0-9a-f-]{36}$/i.test(data.paymentRef)
      ? await prisma.payment.findFirst({ where: { id: data.paymentRef, provider: event.provider }, select: { id: true, amount: true, currency: true } })
      : null)
  if (!payment) {
    await prisma.webhookEvent.update({ where: { id: event.id }, data: { error: `Paiement introuvable (${data.paymentRef})` } })
    throw new NotFoundError('Paiement', data.paymentRef)
  }
  if (data.amount !== undefined && data.amount !== payment.amount) {
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), error: `Montant incohérent : ${data.amount} reçu, ${payment.amount} attendu` },
    })
    return { skipped: 'amount_mismatch' }
  }

  const rawReason = data.raw && typeof data.raw.reason === 'string' ? data.raw.reason : null
  const result = await confirmPayment(payment.id, data.status, data.paymentRef, {
    raw: { webhookEventId: event.id, eventType: data.eventType, ...(data.raw ?? {}) },
    failureReason: data.status === 'FAILED' || data.status === 'CANCELLED' ? (rawReason ?? 'Paiement refusé par le fournisseur') : null,
    correlationId: event.id,
  })
  await prisma.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), error: null } })
  return result
}
