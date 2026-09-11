import { emailProvider } from '@fetrag/config'
import { ConsoleEmailProvider } from './console'
import { ResendEmailProvider } from './resend'
import { SmtpEmailProvider } from './smtp'
import type { EmailProvider } from './types'

let instance: EmailProvider | undefined

/**
 * Fournisseur email courant, singleton par process.
 * Sélection : `EMAIL_PROVIDER` explicite, sinon `resend` si `RESEND_API_KEY` est défini,
 * sinon `smtp` si `SMTP_HOST` est défini, sinon `console` (journal, aucun envoi).
 */
export function getEmailProvider(): EmailProvider {
  if (!instance) {
    const kind = emailProvider()
    instance = kind === 'resend' ? new ResendEmailProvider() : kind === 'smtp' ? new SmtpEmailProvider() : new ConsoleEmailProvider()
  }
  return instance
}

/** Remplace le fournisseur (tests) ; `undefined` réinitialise. */
export function setEmailProvider(provider: EmailProvider | undefined): void {
  instance = provider
}
