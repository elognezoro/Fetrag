import { getEnvSafe } from '@fetrag/config'
import { ConsoleEmailProvider } from './console'
import { SmtpEmailProvider } from './smtp'
import type { EmailProvider } from './types'

let instance: EmailProvider | undefined

/** Fournisseur email courant selon `EMAIL_PROVIDER` (console | smtp), singleton par process. */
export function getEmailProvider(): EmailProvider {
  if (!instance) {
    instance = getEnvSafe().EMAIL_PROVIDER === 'smtp' ? new SmtpEmailProvider() : new ConsoleEmailProvider()
  }
  return instance
}

/** Remplace le fournisseur (tests) ; `undefined` réinitialise. */
export function setEmailProvider(provider: EmailProvider | undefined): void {
  instance = provider
}
