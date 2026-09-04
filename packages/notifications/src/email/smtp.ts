import nodemailer, { type Transporter } from 'nodemailer'
import { getEnvSafe } from '@fetrag/config'
import { PreconditionError } from '@fetrag/domain'
import type { EmailMessage, EmailProvider, EmailSendResult } from './types'

export interface SmtpOptions {
  host?: string
  port?: number
  user?: string
  password?: string
  from?: string
}

/** Fournisseur SMTP (Nodemailer) configuré par `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. */
export class SmtpEmailProvider implements EmailProvider {
  readonly id = 'smtp' as const
  private readonly transporter: Transporter
  private readonly from: string

  constructor(options: SmtpOptions = {}) {
    const env = getEnvSafe()
    const host = options.host ?? env.SMTP_HOST
    if (!host) throw new PreconditionError('SMTP_HOST est requis pour le fournisseur email smtp')
    const port = options.port ?? env.SMTP_PORT ?? 587
    const user = options.user ?? env.SMTP_USER
    const password = options.password ?? env.SMTP_PASSWORD
    this.from = options.from ?? env.SMTP_FROM ?? 'FETRAG <no-reply@fetrag.ga>'
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && password ? { user, pass: password } : undefined,
      connectionTimeout: 15_000,
      socketTimeout: 30_000,
    })
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const info = await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      headers: message.headers,
    })
    return { providerRef: info.messageId }
  }

  /** Vérifie la connexion SMTP (health check). */
  async verify(): Promise<boolean> {
    return this.transporter.verify()
  }
}
