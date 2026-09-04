import { registerWebhookProcessor } from '@fetrag/jobs'
import { processWebhookEvent } from './webhooks'

let registered = false

/**
 * Branche le traitement des webhooks sur le job `webhook.process` de `@fetrag/jobs`
 * (jobs ne peut pas importer payments : cycle). Appelé au chargement du module et
 * à appeler explicitement dans le worker / la route cron après `registerDefaultHandlers()`.
 */
export function registerPaymentJobHandlers(): void {
  if (registered) return
  registerWebhookProcessor(processWebhookEvent)
  registered = true
}
