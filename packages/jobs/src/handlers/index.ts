import { registerJobEnqueuer } from '@fetrag/notifications'
import { enqueue } from '../queue'
import { registerHandler } from '../registry'
import { JobTypes } from '../types'
import { certificateRenderHandler } from './certificate-render'
import { contentPublishScheduledHandler } from './content-publish-scheduled'
import { emailSendHandler } from './email-send'
import { enrollmentExpireHandler } from './enrollment-expire'
import { exportGenerateHandler } from './export-generate'
import { notificationDispatchHandler } from './notification-dispatch'
import { receiptRenderHandler } from './receipt-render'
import { reminderSessionHandler } from './reminder-session'
import { webhookProcessHandler } from './webhook-process'

/**
 * Enregistre les handlers par défaut et branche `@fetrag/notifications` sur la file
 * (les envois d'email en échec sont remis en file sans import statique de jobs).
 * À appeler une fois au démarrage du worker ou de la route cron.
 */
export function registerDefaultHandlers(): void {
  registerHandler(JobTypes.emailSend, emailSendHandler)
  registerHandler(JobTypes.certificateRender, certificateRenderHandler)
  registerHandler(JobTypes.receiptRender, receiptRenderHandler)
  registerHandler(JobTypes.notificationDispatch, notificationDispatchHandler)
  registerHandler(JobTypes.webhookProcess, webhookProcessHandler)
  registerHandler(JobTypes.contentPublishScheduled, contentPublishScheduledHandler)
  registerHandler(JobTypes.reminderSession, reminderSessionHandler)
  registerHandler(JobTypes.exportGenerate, exportGenerateHandler)
  registerHandler(JobTypes.enrollmentExpire, enrollmentExpireHandler)
  registerJobEnqueuer((type, payload, options) => enqueue(type, payload, options))
}

export {
  certificateRenderHandler,
  contentPublishScheduledHandler,
  emailSendHandler,
  enrollmentExpireHandler,
  exportGenerateHandler,
  notificationDispatchHandler,
  receiptRenderHandler,
  reminderSessionHandler,
  webhookProcessHandler,
}
