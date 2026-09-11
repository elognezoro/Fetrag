// @fetrag/notifications - Orchestration des notifications : email (console/SMTP), internes, templates FR (ADR-003, chapitre 20).

export type { EmailMessage, EmailProvider, EmailSendResult } from './email/types'
export { maskEmail } from './email/types'
export { ConsoleEmailProvider } from './email/console'
export { SmtpEmailProvider } from './email/smtp'
export { ResendEmailProvider, RESEND_SANDBOX_FROM } from './email/resend'
export type { ResendOptions } from './email/resend'
export type { SmtpOptions } from './email/smtp'
export { getEmailProvider, setEmailProvider } from './email/registry'

export { sendEmail, deliverQueuedEmail, listEmailDeliveries, EMAIL_MAX_ATTEMPTS } from './send-email'
export type { SendEmailInput, SendEmailResult, SendEmailStatus, DeliveryListQuery } from './send-email'

export {
  notifyUser,
  notifyRole,
  listNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  setNotificationPreference,
} from './notify'
export type { NotifyInput, NotifyResult, NotificationListQuery } from './notify'

export { renderTemplate, templates, templateKeys, getTemplate, stringifyVar, CUSTOM_TEMPLATE } from './templates/index'
export type { TemplateKey } from './templates/index'
export { notificationCategories } from './templates/types'
export type {
  NotificationCategory,
  RenderContext,
  RenderedTemplate,
  TemplateDefinition,
  TemplateValue,
  TemplateVars,
} from './templates/types'
export { escapeHtml, nl2br, htmlToText, trustedHtml, isTrustedHtml } from './templates/escape'
export type { TrustedHtml } from './templates/escape'
export { renderLayout, renderTextLayout, brand } from './templates/layout'
export type { LayoutInput } from './templates/layout'

export { registerJobEnqueuer, enqueueEmailJob, emailJobKey } from './queue-bridge'
export type { JobEnqueuer, EnqueueOptionsLike } from './queue-bridge'

export { hasConsent, hasNewsletterConsent } from './consent'
