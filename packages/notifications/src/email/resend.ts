import { getEnvSafe } from '@fetrag/config'
import { PreconditionError } from '@fetrag/domain'
import type { EmailMessage, EmailProvider, EmailSendResult } from './types'

export interface ResendOptions {
  apiKey?: string
  from?: string
  /** Point d'entrée de l'API (tests). */
  endpoint?: string
}

/** Expéditeur utilisable sans domaine vérifié chez Resend (uniquement vers l'adresse du compte Resend). */
export const RESEND_SANDBOX_FROM = 'FETRAG <onboarding@resend.dev>'

/**
 * Fournisseur Resend (https://resend.com) via son API HTTP, sans SDK.
 * Variables : RESEND_API_KEY (obligatoire), EMAIL_FROM (expéditeur, domaine vérifié chez Resend).
 */
export class ResendEmailProvider implements EmailProvider {
  readonly id = 'resend' as const
  private readonly apiKey: string
  private readonly from: string
  private readonly endpoint: string

  constructor(options: ResendOptions = {}) {
    const env = getEnvSafe()
    const apiKey = options.apiKey ?? env.RESEND_API_KEY
    if (!apiKey) throw new PreconditionError('RESEND_API_KEY est requis pour le fournisseur email resend')
    this.apiKey = apiKey
    this.from = options.from ?? env.EMAIL_FROM ?? env.SMTP_FROM ?? RESEND_SANDBOX_FROM
    this.endpoint = options.endpoint ?? 'https://api.resend.com/emails'
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          reply_to: message.replyTo,
          headers: message.headers,
          tags: message.template ? [{ name: 'template', value: message.template.replace(/[^a-zA-Z0-9_-]/g, '_') }] : undefined,
        }),
        signal: controller.signal,
      })
      const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string; name?: string }
      if (!response.ok) {
        throw new Error(`Resend ${response.status} ${payload.name ?? ''}: ${payload.message ?? 'envoi refusé'}`.trim())
      }
      return { providerRef: payload.id ?? `resend-${Date.now()}` }
    } finally {
      clearTimeout(timer)
    }
  }
}
