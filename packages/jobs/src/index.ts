// @fetrag/jobs - File de jobs persistée (BackgroundJob) : enqueue idempotent, processeur verrouillé, backoff, handlers par défaut.

export { JobTypes, jobTypeList, exportKinds } from './types'
export type {
  JobType,
  JobPayload,
  JobHandler,
  JobContext,
  EnqueueOptions,
  EnqueuedJob,
  ProcessOptions,
  ProcessResult,
  JobPayloadMap,
  EmailSendPayload,
  CertificateRenderPayload,
  ReceiptRenderPayload,
  NotificationDispatchPayload,
  WebhookProcessPayload,
  ContentPublishScheduledPayload,
  ReminderSessionPayload,
  ExportGeneratePayload,
  ExportKind,
  EnrollmentExpirePayload,
} from './types'

export {
  parseEmailSend,
  parseCertificateRender,
  parseReceiptRender,
  parseNotificationDispatch,
  parseWebhookProcess,
  parseContentPublishScheduled,
  parseReminderSession,
  parseExportGenerate,
  parseEnrollmentExpire,
} from './payloads'

export { enqueue, processJobs, requeueFailedEmails, getJobStats, listJobs, retryJob, cancelJob } from './queue'
export { runScheduledMaintenance } from './maintenance'
export type { MaintenanceResult } from './maintenance'
export type { JobListQuery } from './queue'
export { registerHandler, unregisterHandler, getHandler, listHandlers, clearHandlers } from './registry'
export { computeBackoffMinutes, nextRunAt, isExhausted, zombieThreshold, MAX_BACKOFF_MINUTES, ZOMBIE_LOCK_MINUTES } from './backoff'

export { registerDefaultHandlers } from './handlers/index'
export { registerWebhookProcessor } from './handlers/webhook-process'
export type { WebhookProcessor } from './handlers/webhook-process'
export { certificateVerifyUrl } from './handlers/certificate-render'
export { sessionReminderKey } from './handlers/reminder-session'

export { renderCertificatePdf } from './pdf/certificate'
export type { CertificateRenderInput } from './pdf/certificate'
export { renderReceiptPdf } from './pdf/receipt'
export type { ReceiptRenderInput, ReceiptLine } from './pdf/receipt'
export { toCsv, CSV_SEPARATOR, BOM } from './csv'
export type { CsvCell } from './csv'
