/** Message prêt à l'envoi (déjà rendu). */
export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
  /** Clé de template, pour la journalisation uniquement. */
  template?: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface EmailSendResult {
  providerRef: string
}

/** Adaptateur d'envoi (ADR-003) : console en développement, Resend ou SMTP en production. */
export interface EmailProvider {
  readonly id: 'console' | 'smtp' | 'resend'
  send(message: EmailMessage): Promise<EmailSendResult>
}

/** Masque une adresse email pour les journaux : `j***@exemple.ga`. */
export function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return '***'
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  return `${local.charAt(0)}***@${domain}`
}
