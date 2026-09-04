import { prisma, type EmailDeliveryStatus, type Prisma } from '@fetrag/db'
import { formatDateTime, NotFoundError, ValidationError } from '@fetrag/domain'
import { hasNewsletterConsent } from './consent'
import { getEmailProvider } from './email/registry'
import type { EmailMessage } from './email/types'
import { enqueueEmailJob } from './queue-bridge'
import { escapeHtml, htmlToText, isTrustedHtml, nl2br } from './templates/escape'
import { paragraph, renderLayout, renderTextLayout } from './templates/layout'
import { CUSTOM_TEMPLATE, getTemplate, renderTemplate } from './templates/index'
import type { RenderedTemplate, TemplateVars } from './templates/types'

/** Nombre maximal de tentatives d'envoi d'une livraison (immédiate + rejeux du worker). */
export const EMAIL_MAX_ATTEMPTS = 5

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface SendEmailInput {
  to: string
  /** Clé de template (`templateKeys`) ou `custom` (sujet + html/texte fournis). */
  template: string
  variables?: TemplateVars
  /** Sujet : obligatoire pour `custom`, remplace le sujet du template sinon. */
  subject?: string
  html?: string
  text?: string
  /** Utilisateur destinataire, pour le contrôle du consentement (marketing). */
  userId?: string | null
  replyTo?: string
}

export type SendEmailStatus = 'SENT' | 'QUEUED' | 'FAILED' | 'SKIPPED'

export interface SendEmailResult {
  deliveryId: string | null
  status: SendEmailStatus
  error?: string
}

/** Variables sérialisées en JSON pour rejouer le rendu depuis la livraison. */
function serializeVars(vars: TemplateVars): Prisma.InputJsonObject {
  const out: Record<string, string | number | boolean | { __trustedHtml: true; html: string }> = {}
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined || v === null) continue
    if (v instanceof Date) out[k] = formatDateTime(v)
    else if (isTrustedHtml(v)) out[k] = { __trustedHtml: true, html: v.html }
    else out[k] = v
  }
  return out
}

function deserializeVars(json: Prisma.JsonValue | null): TemplateVars {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  const out: TemplateVars = {}
  for (const [k, v] of Object.entries(json)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v
    else if (isTrustedHtml(v)) out[k] = { __trustedHtml: true, html: v.html }
  }
  return out
}

/** Rend un message `custom` : gabarit FETRAG autour du HTML/texte fourni. */
function renderCustom(subject: string, html: string | undefined, text: string | undefined): RenderedTemplate {
  const bodyHtml = html ?? paragraph(nl2br(text ?? ''))
  const bodyText = text ?? htmlToText(html ?? '')
  return {
    subject,
    html: html && /<html[\s>]/i.test(html) ? html : renderLayout({ title: subject, contentHtml: bodyHtml }),
    text: renderTextLayout({ title: subject, body: bodyText }),
  }
}

/** Reconstruit le message à partir d'une livraison stockée (template + variables). */
function renderDelivery(delivery: {
  template: string
  subject: string
  variables: Prisma.JsonValue | null
}): RenderedTemplate {
  const vars = deserializeVars(delivery.variables)
  if (delivery.template === CUSTOM_TEMPLATE) {
    const html = typeof vars.__html === 'string' ? vars.__html : undefined
    const text = typeof vars.__text === 'string' ? vars.__text : undefined
    return renderCustom(delivery.subject, html, text)
  }
  const rendered = renderTemplate(delivery.template, vars)
  return { ...rendered, subject: delivery.subject || rendered.subject }
}

async function attempt(
  deliveryId: string,
  message: EmailMessage,
): Promise<{ status: Extract<EmailDeliveryStatus, 'SENT' | 'FAILED'>; error?: string }> {
  const provider = getEmailProvider()
  try {
    const { providerRef } = await provider.send(message)
    await prisma.emailDelivery.update({
      where: { id: deliveryId },
      data: { status: 'SENT', provider: provider.id, providerRef, sentAt: new Date(), error: null, attempts: { increment: 1 } },
    })
    return { status: 'SENT' }
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 500) : 'Envoi impossible'
    await prisma.emailDelivery.update({
      where: { id: deliveryId },
      data: { status: 'FAILED', provider: provider.id, error: reason, attempts: { increment: 1 } },
    })
    return { status: 'FAILED', error: reason }
  }
}

/**
 * Envoie un email : crée `EmailDelivery` (QUEUED), tente l'envoi immédiat (SENT / FAILED),
 * et en cas d'échec met en file le job `email.send` rejouable avec backoff.
 * Les messages de catégorie `marketing` non essentiels exigent un consentement NEWSLETTER.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim().toLowerCase()
  if (!EMAIL_RE.test(to)) throw new ValidationError('Adresse email destinataire invalide', { field: 'to' })

  let rendered: RenderedTemplate
  let variables: Prisma.InputJsonObject
  if (input.template === CUSTOM_TEMPLATE) {
    if (!input.subject) throw new ValidationError('Le sujet est obligatoire pour un email personnalisé', { field: 'subject' })
    if (!input.html && !input.text) throw new ValidationError('Fournir html ou text pour un email personnalisé', { field: 'html' })
    rendered = renderCustom(input.subject, input.html, input.text)
    variables = {
      ...(input.html ? { __html: input.html } : {}),
      ...(input.text ? { __text: input.text } : {}),
    }
  } else {
    const def = getTemplate(input.template)
    if (!def) throw new ValidationError(`Template email inconnu : ${input.template}`, { template: input.template })
    if (def.category === 'marketing' && !def.essential) {
      const consented = await hasNewsletterConsent({ userId: input.userId, email: to })
      if (!consented) {
        console.info(JSON.stringify({ level: 'info', msg: 'email.skipped', reason: 'consent', template: input.template }))
        return { deliveryId: null, status: 'SKIPPED', error: 'Consentement newsletter absent' }
      }
    }
    rendered = renderTemplate(input.template, input.variables ?? {})
    if (input.subject) rendered = { ...rendered, subject: input.subject }
    variables = serializeVars(input.variables ?? {})
  }

  const delivery = await prisma.emailDelivery.create({
    data: {
      to,
      subject: rendered.subject.slice(0, 250),
      template: input.template,
      variables,
      status: 'QUEUED',
      provider: getEmailProvider().id,
    },
    select: { id: true },
  })

  const result = await attempt(delivery.id, {
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    template: input.template,
    replyTo: input.replyTo,
  })
  if (result.status === 'SENT') return { deliveryId: delivery.id, status: 'SENT' }

  const queued = await enqueueEmailJob(delivery.id, new Date(Date.now() + 60_000))
  return { deliveryId: delivery.id, status: queued ? 'QUEUED' : 'FAILED', error: result.error }
}

/**
 * Rejoue l'envoi d'une livraison depuis la file (handler `email.send`).
 * Lève si l'envoi échoue afin que le job applique son backoff ; abandonne après `EMAIL_MAX_ATTEMPTS`.
 */
export async function deliverQueuedEmail(deliveryId: string): Promise<{ status: SendEmailStatus; error?: string }> {
  const delivery = await prisma.emailDelivery.findUnique({ where: { id: deliveryId } })
  if (!delivery) throw new NotFoundError('Livraison email', deliveryId)
  if (delivery.status === 'SENT') return { status: 'SENT' }
  if (delivery.attempts >= EMAIL_MAX_ATTEMPTS) {
    return { status: 'FAILED', error: `Abandon après ${delivery.attempts} tentatives` }
  }

  const rendered = renderDelivery(delivery)
  const result = await attempt(delivery.id, {
    to: delivery.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    template: delivery.template,
  })
  if (result.status === 'FAILED') {
    throw new Error(result.error ?? 'Envoi impossible')
  }
  return { status: 'SENT' }
}

export interface DeliveryListQuery {
  status?: EmailDeliveryStatus
  to?: string
  page?: number
  pageSize?: number
}

/** Liste des livraisons pour l'écran support (état d'envoi visible, chapitre 20). */
export async function listEmailDeliveries(query: DeliveryListQuery = {}) {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20))
  const where: Prisma.EmailDeliveryWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.to ? { to: { contains: query.to.trim().toLowerCase() } } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.emailDelivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        to: true,
        subject: true,
        template: true,
        status: true,
        provider: true,
        providerRef: true,
        error: true,
        attempts: true,
        sentAt: true,
        createdAt: true,
      },
    }),
    prisma.emailDelivery.count({ where }),
  ])
  return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

/** Échappe une chaîne pour un email personnalisé (réexport pratique). */
export { escapeHtml }
