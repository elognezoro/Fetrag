/** Marqueur d'un fragment HTML déjà assaini (ex. contenu CMS passé par sanitize-html). */
export interface TrustedHtml {
  readonly __trustedHtml: true
  readonly html: string
}

export function trustedHtml(html: string): TrustedHtml {
  return { __trustedHtml: true, html }
}

export function isTrustedHtml(value: unknown): value is TrustedHtml {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __trustedHtml?: unknown }).__trustedHtml === true &&
    typeof (value as { html?: unknown }).html === 'string'
  )
}

const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Échappe une valeur pour insertion dans du HTML. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, (ch) => entities[ch] ?? ch)
}

/** Échappe puis convertit les retours à la ligne en `<br>`. */
export function nl2br(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

/** Retire les balises d'un fragment HTML pour la version texte. */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
