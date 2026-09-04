import { deliverQueuedEmail } from '@fetrag/notifications'
import { parseEmailSend } from '../payloads'
import type { JobHandler } from '../types'

/** Rejoue l'envoi d'une `EmailDelivery` via le fournisseur courant (console / SMTP). */
export const emailSendHandler: JobHandler = async (payload, ctx) => {
  const { deliveryId } = parseEmailSend(payload)
  const result = await deliverQueuedEmail(deliveryId)
  ctx.logger.info('email.send.done', { deliveryId, status: result.status })
  return result
}
