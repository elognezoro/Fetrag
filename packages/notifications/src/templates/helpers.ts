import { bulletList, paragraph, renderLayout, renderTextLayout, summaryTable } from './layout'
import type { RenderContext, RenderedTemplate, TemplateDefinition } from './types'

/** Bloc de contenu rendu à la fois en HTML et en texte brut. */
export interface Block {
  html: string
  text: string
}

/** Paragraphe (le HTML doit déjà être échappé). */
export function p(html: string, text: string = html.replace(/<[^>]+>/g, '')): Block {
  return { html: paragraph(html), text }
}

/** Tableau récapitulatif libellé / valeur (valeurs échappées en amont). */
export function summary(rows: Array<[label: string, valueHtml: string, valueText?: string]>): Block {
  const kept = rows.filter(([, value]) => value.trim().length > 0)
  return {
    html: summaryTable(kept.map(([label, value]) => [label, value])),
    text: kept.map(([label, value, text]) => `- ${label} : ${text ?? value.replace(/<[^>]+>/g, '')}`).join('\n'),
  }
}

/** Liste à puces. */
export function list(items: string[]): Block {
  return { html: bulletList(items), text: items.map((i) => `* ${i.replace(/<[^>]+>/g, '')}`).join('\n') }
}

export interface ComposeInput {
  subject: string
  title: string
  preheader?: string
  blocks: Block[]
  cta?: { label: string; url: string }
  note?: string
  /** Ajoute le lien de désinscription (messages non essentiels). */
  unsubscribeUrl?: string
}

/** Assemble sujet, HTML (gabarit FETRAG) et texte brut. */
export function compose(input: ComposeInput): RenderedTemplate {
  const html = renderLayout({
    title: input.title,
    preheader: input.preheader,
    contentHtml: input.blocks.map((b) => b.html).join('\n'),
    cta: input.cta,
    note: input.note,
    unsubscribeUrl: input.unsubscribeUrl,
  })
  const text = renderTextLayout({
    title: input.title,
    body: input.blocks.map((b) => b.text).join('\n\n'),
    cta: input.cta,
    note: input.note,
    unsubscribeUrl: input.unsubscribeUrl,
  })
  return { subject: input.subject, html, text }
}

/** Formule d'appel : « Bonjour Prénom, » ou « Bonjour, ». */
export function greeting(ctx: RenderContext, key = 'firstName'): string {
  const name = ctx.esc[key]
  return name ? `Bonjour ${name},` : 'Bonjour,'
}

/** URL des préférences de notification (désinscription des messages non essentiels). */
export function preferencesUrl(ctx: RenderContext): string {
  return `${ctx.webUrl}/espace/notifications`
}

export function defineTemplate(def: TemplateDefinition): TemplateDefinition {
  return def
}
