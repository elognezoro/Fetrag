import { ValidationError } from '@fetrag/domain'
import {
  exportKinds,
  type CertificateRenderPayload,
  type ContentPublishScheduledPayload,
  type EmailSendPayload,
  type EnrollmentExpirePayload,
  type ExportGeneratePayload,
  type ExportKind,
  type JobPayload,
  type NotificationDispatchPayload,
  type ReceiptRenderPayload,
  type ReminderSessionPayload,
  type WebhookProcessPayload,
} from './types'

/**
 * Validateurs de charges utiles écrits à la main : `zod` n'est pas une dépendance installée de
 * `@fetrag/jobs` (voir package.json). Chaque validateur lève `ValidationError` avec le champ fautif.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/

function fail(type: string, field: string, message: string): never {
  throw new ValidationError(`Charge utile invalide pour ${type} : ${message}`, { type, field })
}

function optionalString(payload: JobPayload, key: string, type: string, max = 4000): string | undefined {
  const v = payload[key]
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'string') fail(type, key, `${key} doit être une chaîne`)
  if (v.length > max) fail(type, key, `${key} trop long`)
  return v
}

function requiredString(payload: JobPayload, key: string, type: string, max = 4000): string {
  const v = optionalString(payload, key, type, max)
  if (!v || v.trim().length === 0) fail(type, key, `${key} est obligatoire`)
  return v
}

function optionalUuid(payload: JobPayload, key: string, type: string): string | undefined {
  const v = optionalString(payload, key, type, 64)
  if (v !== undefined && !UUID_RE.test(v)) fail(type, key, `${key} doit être un identifiant UUID`)
  return v
}

function requiredUuid(payload: JobPayload, key: string, type: string): string {
  const v = optionalUuid(payload, key, type)
  if (!v) fail(type, key, `${key} est obligatoire`)
  return v
}

function optionalBoolean(payload: JobPayload, key: string, type: string): boolean | undefined {
  const v = payload[key]
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'boolean') fail(type, key, `${key} doit être un booléen`)
  return v
}

function optionalInt(payload: JobPayload, key: string, type: string, min: number, max: number): number | undefined {
  const v = payload[key]
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    fail(type, key, `${key} doit être un entier entre ${min} et ${max}`)
  }
  return v
}

function optionalIso(payload: JobPayload, key: string, type: string): string | undefined {
  const v = optionalString(payload, key, type, 40)
  if (v !== undefined && (!ISO_RE.test(v) || Number.isNaN(new Date(v).getTime()))) {
    fail(type, key, `${key} doit être une date ISO 8601`)
  }
  return v
}

export function parseEmailSend(payload: JobPayload): EmailSendPayload {
  return { deliveryId: requiredUuid(payload, 'deliveryId', 'email.send') }
}

export function parseCertificateRender(payload: JobPayload): CertificateRenderPayload {
  return { certificateId: requiredUuid(payload, 'certificateId', 'certificate.render') }
}

export function parseReceiptRender(payload: JobPayload): ReceiptRenderPayload {
  const receiptId = optionalUuid(payload, 'receiptId', 'receipt.render')
  const orderId = optionalUuid(payload, 'orderId', 'receipt.render')
  if (!receiptId && !orderId) fail('receipt.render', 'orderId', 'receiptId ou orderId est obligatoire')
  return { receiptId, orderId }
}

const roleNames = new Set([
  'LEARNER',
  'ORG_MANAGER',
  'TRAINER',
  'COORDINATOR',
  'EDITOR',
  'SERVICES_MANAGER',
  'FINANCE',
  'SUPPORT',
  'SUPER_ADMIN',
])

export function parseNotificationDispatch(payload: JobPayload): NotificationDispatchPayload {
  const type = 'notification.dispatch'
  const userId = optionalUuid(payload, 'userId', type)
  const role = optionalString(payload, 'role', type, 40)
  if (role !== undefined && !roleNames.has(role)) fail(type, 'role', 'rôle inconnu')
  if (!userId && !role) fail(type, 'userId', 'userId ou role est obligatoire')
  const app = optionalString(payload, 'app', type, 10)
  if (app !== undefined && app !== 'web' && app !== 'lms') fail(type, 'app', 'app doit valoir web ou lms')
  return {
    userId,
    role: role as NotificationDispatchPayload['role'],
    title: requiredString(payload, 'title', type, 160),
    body: requiredString(payload, 'body', type, 4000),
    href: optionalString(payload, 'href', type, 600),
    app: app as 'web' | 'lms' | undefined,
    category: optionalString(payload, 'category', type, 40),
    email: optionalBoolean(payload, 'email', type),
  }
}

export function parseWebhookProcess(payload: JobPayload): WebhookProcessPayload {
  return { webhookEventId: requiredUuid(payload, 'webhookEventId', 'webhook.process') }
}

export function parseContentPublishScheduled(payload: JobPayload): ContentPublishScheduledPayload {
  return { now: optionalIso(payload, 'now', 'content.publish-scheduled') }
}

export function parseReminderSession(payload: JobPayload): ReminderSessionPayload {
  return {
    sessionId: optionalUuid(payload, 'sessionId', 'reminder.session'),
    hoursAhead: optionalInt(payload, 'hoursAhead', 'reminder.session', 1, 168),
  }
}

export function parseExportGenerate(payload: JobPayload): ExportGeneratePayload {
  const type = 'export.generate'
  const kind = requiredString(payload, 'kind', type, 40)
  if (!(exportKinds as readonly string[]).includes(kind)) fail(type, 'kind', 'type d’export inconnu')
  return {
    kind: kind as ExportKind,
    requestedBy: requiredUuid(payload, 'requestedBy', type),
    organizationId: optionalUuid(payload, 'organizationId', type),
    from: optionalIso(payload, 'from', type),
    to: optionalIso(payload, 'to', type),
  }
}

export function parseEnrollmentExpire(payload: JobPayload): EnrollmentExpirePayload {
  return { batchSize: optionalInt(payload, 'batchSize', 'enrollment.expire', 1, 5000) }
}
