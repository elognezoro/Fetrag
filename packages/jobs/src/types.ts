import type { BackgroundJob, Role } from '@fetrag/db'
import type { Logger } from '@fetrag/observability'

/** Types de jobs connus (BUILD_BRIEF §2). Des types personnalisés restent possibles via `registerHandler`. */
export const JobTypes = {
  emailSend: 'email.send',
  certificateRender: 'certificate.render',
  receiptRender: 'receipt.render',
  notificationDispatch: 'notification.dispatch',
  webhookProcess: 'webhook.process',
  contentPublishScheduled: 'content.publish-scheduled',
  reminderSession: 'reminder.session',
  exportGenerate: 'export.generate',
  enrollmentExpire: 'enrollment.expire',
} as const

export type JobType = (typeof JobTypes)[keyof typeof JobTypes]

export const jobTypeList: readonly JobType[] = Object.values(JobTypes)

/** Charge utile JSON d'un job (validée par le handler). */
export type JobPayload = Record<string, unknown>

export interface EnqueueOptions {
  /** Clé unique : un second `enqueue` avec la même clé renvoie le job existant. */
  idempotencyKey?: string
  /** Date d'exécution au plus tôt (par défaut immédiat). */
  runAt?: Date
  /** 1 = le plus urgent, 9 = le moins urgent (5 par défaut). */
  priority?: number
  /** Nombre maximal de tentatives avant le statut DEAD (5 par défaut). */
  maxAttempts?: number
}

export interface EnqueuedJob {
  id: string
  type: string
  status: BackgroundJob['status']
  runAt: Date
  /** `false` si un job portant la même clé d'idempotence existait déjà. */
  created: boolean
}

export interface JobContext {
  jobId: string
  type: string
  /** Numéro de la tentative en cours (1 = première). */
  attempt: number
  maxAttempts: number
  workerId: string
  logger: Logger
}

/** Un handler valide sa charge utile, exécute le travail et renvoie un résultat sérialisable en JSON. */
export type JobHandler = (payload: JobPayload, ctx: JobContext) => Promise<unknown>

export interface ProcessOptions {
  /** Nombre maximal de jobs traités dans ce cycle (10 par défaut, 100 au plus). */
  limit?: number
  workerId?: string
  /** Remet en file les emails FAILED/QUEUED orphelins avant traitement (activé par défaut). */
  sweepEmails?: boolean
}

export interface ProcessResult {
  processed: number
  failed: number
  /** Jobs encore éligibles (QUEUED/FAILED avec runAt échu) après ce cycle. */
  remaining: number
}

// -----------------------------------------------------------------------------
// Charges utiles typées des handlers par défaut
// -----------------------------------------------------------------------------

export interface EmailSendPayload {
  deliveryId: string
}

export interface CertificateRenderPayload {
  certificateId: string
}

export interface ReceiptRenderPayload {
  receiptId?: string
  orderId?: string
}

export interface NotificationDispatchPayload {
  userId?: string
  role?: Role
  title: string
  body: string
  href?: string
  app?: 'web' | 'lms'
  category?: string
  email?: boolean
}

export interface WebhookProcessPayload {
  webhookEventId: string
}

export interface ContentPublishScheduledPayload {
  /** Horodatage de référence ISO (par défaut maintenant) - utile pour les tests. */
  now?: string
}

export interface ReminderSessionPayload {
  /** Session précise à rappeler ; absent = balayage des sessions à venir. */
  sessionId?: string
  /** Fenêtre de balayage en heures (24 par défaut). */
  hoursAhead?: number
}

export const exportKinds = [
  'orders',
  'enrollments',
  'certificates',
  'training-requests',
  'form-submissions',
  'service-requests',
  'users',
] as const
export type ExportKind = (typeof exportKinds)[number]

export interface ExportGeneratePayload {
  kind: ExportKind
  /** Utilisateur qui recevra le lien de téléchargement (permission vérifiée avant la mise en file). */
  requestedBy: string
  /** Restreint l'export à une organisation (obligatoire pour les responsables d'organisation). */
  organizationId?: string
  /** Bornes ISO 8601 optionnelles sur la date de création. */
  from?: string
  to?: string
}

export interface EnrollmentExpirePayload {
  /** Taille de lot (500 par défaut). */
  batchSize?: number
}

export interface JobPayloadMap {
  'email.send': EmailSendPayload
  'certificate.render': CertificateRenderPayload
  'receipt.render': ReceiptRenderPayload
  'notification.dispatch': NotificationDispatchPayload
  'webhook.process': WebhookProcessPayload
  'content.publish-scheduled': ContentPublishScheduledPayload
  'reminder.session': ReminderSessionPayload
  'export.generate': ExportGeneratePayload
  'enrollment.expire': EnrollmentExpirePayload
}
