import { resolvePublicUrl } from '@fetrag/config'
import { formatDateTime, ValidationError } from '@fetrag/domain'
import { accountCreated, accountInvitation, emailVerification, passwordChanged, passwordReset, welcome } from './account'
import { escapeHtml, isTrustedHtml, htmlToText } from './escape'
import { eventRegistered, formReceived, serviceRequestReceived, serviceRequestStatus } from './forms'
import { notification } from './generic'
import { assignmentLate, certificateIssued, enrollmentConfirmed, resultAvailable } from './learning'
import { newsletter, newsletterConfirmation } from './newsletter'
import { paymentFailed, paymentRefunded, paymentSucceeded } from './payments'
import { sessionConvocation, sessionReminder } from './sessions'
import {
  trainingRequestAccepted,
  trainingRequestInfoRequested,
  trainingRequestRejected,
  trainingRequestScheduled,
  trainingRequestSubmitted,
} from './training-request'
import type { RenderedTemplate, TemplateDefinition, TemplateValue, TemplateVars } from './types'

const definitions: TemplateDefinition[] = [
  welcome,
  accountCreated,
  accountInvitation,
  emailVerification,
  passwordReset,
  passwordChanged,
  trainingRequestSubmitted,
  trainingRequestInfoRequested,
  trainingRequestAccepted,
  trainingRequestRejected,
  trainingRequestScheduled,
  sessionConvocation,
  sessionReminder,
  enrollmentConfirmed,
  assignmentLate,
  resultAvailable,
  certificateIssued,
  paymentSucceeded,
  paymentFailed,
  paymentRefunded,
  formReceived,
  serviceRequestReceived,
  serviceRequestStatus,
  eventRegistered,
  newsletterConfirmation,
  newsletter,
  notification,
]

/** Registre des templates versionnés (clé → définition). */
export const templates: ReadonlyMap<string, TemplateDefinition> = new Map(definitions.map((d) => [d.key, d]))

/** Clés de templates disponibles. */
export const templateKeys = definitions.map((d) => d.key)
export type TemplateKey = (typeof templateKeys)[number]

/** Template `custom` : sujet/HTML/texte fournis directement par l'appelant. */
export const CUSTOM_TEMPLATE = 'custom'

export function getTemplate(key: string): TemplateDefinition | undefined {
  return templates.get(key)
}

/** Convertit une variable en texte brut affichable (dates formatées en `Africa/Libreville`). */
export function stringifyVar(value: TemplateValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return formatDateTime(value)
  if (isTrustedHtml(value)) return htmlToText(value.html)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

/**
 * Rend un template : sujet, HTML (gabarit FETRAG) et texte brut.
 * Toutes les variables sont échappées pour le HTML, sauf les fragments marqués `trustedHtml`.
 * Lève `ValidationError` si le template est inconnu ou si une variable obligatoire manque.
 */
export function renderTemplate(key: string, vars: TemplateVars = {}): RenderedTemplate {
  const def = templates.get(key)
  if (!def) throw new ValidationError(`Template email inconnu : ${key}`, { template: key })

  const missing = def.requiredVars.filter((name) => {
    const v = vars[name]
    return v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)
  })
  if (missing.length > 0) {
    throw new ValidationError(`Variables manquantes pour le template ${key}`, { template: key, missing })
  }

  const esc: Record<string, string> = {}
  const raw: Record<string, string> = {}
  for (const [name, value] of Object.entries(vars)) {
    if (value === undefined || value === null) continue
    if (isTrustedHtml(value)) {
      esc[name] = value.html
      raw[name] = htmlToText(value.html)
      continue
    }
    const text = stringifyVar(value)
    raw[name] = text
    esc[name] = escapeHtml(text)
  }

  return def.render({
    esc,
    raw,
    has: (name) => (raw[name] ?? '').trim().length > 0,
    webUrl: resolvePublicUrl('web'),
    lmsUrl: resolvePublicUrl('lms'),
  })
}
