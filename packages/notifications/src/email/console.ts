import { randomUUID } from 'node:crypto'
import { getEnvSafe } from '@fetrag/config'
import { maskEmail, type EmailMessage, type EmailProvider, type EmailSendResult } from './types'

const SENSITIVE_LINE = /mot de passe|password|code de v|otp/i

/** Retire les lignes potentiellement sensibles du texte affiché en développement. */
function redactText(text: string): string {
  return text
    .split('\n')
    .map((line) => (SENSITIVE_LINE.test(line) ? '[ligne masquée]' : line))
    .join('\n')
    .slice(0, 4000)
}

/**
 * Fournisseur de développement / recette : journalise un objet JSON structuré.
 * Aucune donnée sensible : destinataire masqué, corps HTML jamais journalisé,
 * texte brut (expurgé) uniquement hors production pour retrouver les liens de test.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly id = 'console' as const

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const providerRef = `console-${randomUUID()}`
    const isProduction = getEnvSafe().NODE_ENV === 'production'
    const entry: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level: 'info',
      msg: 'email.console',
      providerRef,
      to: maskEmail(message.to),
      subject: message.subject,
      template: message.template ?? 'custom',
      htmlLength: message.html.length,
    }
    if (!isProduction) entry.text = redactText(message.text)
    console.info(JSON.stringify(entry))
    return { providerRef }
  }
}
