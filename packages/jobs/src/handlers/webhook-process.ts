import { prisma } from '@fetrag/db'
import { NotFoundError, PreconditionError } from '@fetrag/domain'
import { parseWebhookProcess } from '../payloads'
import type { JobHandler } from '../types'

/** Traitement métier d'un `WebhookEvent` journalisé (fourni par `@fetrag/payments`). */
export type WebhookProcessor = (webhookEventId: string) => Promise<unknown>

let registered: WebhookProcessor | null = null

/**
 * Enregistre le processeur de webhooks. `@fetrag/payments` l'appelle à son chargement
 * (`registerPaymentJobHandlers`) : jobs ne peut pas importer payments statiquement (cycle).
 */
export function registerWebhookProcessor(processor: WebhookProcessor | null): void {
  registered = processor
}

async function resolveProcessor(): Promise<WebhookProcessor | null> {
  if (registered) return registered
  try {
    const specifier = '@fetrag/payments'
    const mod = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ specifier)) as { processWebhookEvent?: unknown }
    if (typeof mod.processWebhookEvent === 'function') {
      registered = mod.processWebhookEvent as WebhookProcessor
      return registered
    }
  } catch {
    // Module non résolvable depuis ce processus.
  }
  return null
}

/**
 * Relit le `WebhookEvent`, ignore les événements déjà traités et délègue à `payments.processWebhookEvent`
 * (qui appelle `confirmPayment`). Sans processeur disponible, le job échoue avec backoff.
 */
export const webhookProcessHandler: JobHandler = async (payload, ctx) => {
  const { webhookEventId } = parseWebhookProcess(payload)
  const event = await prisma.webhookEvent.findUnique({
    where: { id: webhookEventId },
    select: { id: true, provider: true, eventType: true, verified: true, processedAt: true },
  })
  if (!event) throw new NotFoundError('Webhook', webhookEventId)
  if (event.processedAt) return { skipped: 'already_processed' }
  if (!event.verified) {
    await prisma.webhookEvent.update({ where: { id: event.id }, data: { error: 'Signature non vérifiée', processedAt: new Date() } })
    ctx.logger.warn('webhook.process.unverified', { webhookEventId })
    return { skipped: 'unverified' }
  }

  const processor = await resolveProcessor()
  if (!processor) {
    throw new PreconditionError(
      'Aucun processeur de webhook : importer @fetrag/payments (registerPaymentJobHandlers) dans le worker ou la route cron',
    )
  }
  try {
    const result = await processor(event.id)
    ctx.logger.info('webhook.process.done', { webhookEventId, provider: event.provider, eventType: event.eventType })
    return result ?? { processed: true }
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { error: (error instanceof Error ? error.message : String(error)).slice(0, 500) },
    })
    throw error
  }
}
