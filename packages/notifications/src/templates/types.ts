import type { TrustedHtml } from './escape'

/** Valeur de variable acceptée par les templates (les dates sont formatées en amont). */
export type TemplateValue = string | number | boolean | Date | TrustedHtml | null | undefined

export type TemplateVars = Record<string, TemplateValue>

/** Catégories de notification (préférences utilisateur `NotificationPreference.category`). */
export const notificationCategories = [
  'general',
  'account',
  'training',
  'sessions',
  'assignments',
  'results',
  'certificates',
  'payments',
  'requests',
  'forum',
  'security',
  'marketing',
] as const
export type NotificationCategory = (typeof notificationCategories)[number]

/** Variables accessibles au rendu : `esc` (échappées HTML), `raw` (texte brut), `has` (présence). */
export interface RenderContext {
  esc: Record<string, string>
  raw: Record<string, string>
  has: (key: string) => boolean
  /** URL absolue de la vitrine (liens du pied de page, désinscription). */
  webUrl: string
  /** URL absolue du LMS. */
  lmsUrl: string
}

export interface RenderedTemplate {
  subject: string
  html: string
  text: string
}

export interface TemplateDefinition {
  key: string
  /** Description courte pour l'administration. */
  description: string
  category: NotificationCategory
  /**
   * Un message essentiel (transactionnel) part toujours ; un message non essentiel respecte
   * les préférences de notification et, pour la catégorie `marketing`, le consentement NEWSLETTER.
   */
  essential: boolean
  /** Variables obligatoires ; leur absence lève une ValidationError. */
  requiredVars: readonly string[]
  render: (ctx: RenderContext) => RenderedTemplate
}
