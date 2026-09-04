import { site } from '@fetrag/config'
import { escapeHtml } from './escape'

/** Couleurs de la charte FETRAG (DESIGN_SYSTEM.md). */
export const brand = {
  blue: '#0259C7',
  green: '#9CC102',
  gold: '#F9C804',
  navy: '#042768',
  ink: '#0B1B3F',
  surface: '#F7F8FC',
  border: '#E3E7F2',
  muted: '#5B6B8C',
} as const

export interface LayoutInput {
  /** Titre affiché en tête du message. */
  title: string
  /** Texte d'aperçu (masqué dans le corps, visible dans la boîte de réception). */
  preheader?: string
  /** Contenu principal, déjà échappé / assaini. */
  contentHtml: string
  /** Bouton d'action principal. */
  cta?: { label: string; url: string }
  /** Note discrète sous le bouton (ex. validité du lien). */
  note?: string
  /** Lien de désinscription (messages non essentiels uniquement). */
  unsubscribeUrl?: string
}

/** Bouton d'action compatible clients mail (table + inline CSS). */
export function button(label: string, url: string, color: string = brand.blue): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
  <tr>
    <td align="center" bgcolor="${color}" style="border-radius:999px;">
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 28px;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`
}

/** Paragraphe standard. */
export function paragraph(html: string): string {
  return `<p style="margin:0 0 14px 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${brand.ink};">${html}</p>`
}

/** Bloc récapitulatif (libellé / valeur) sur fond clair avec filet bleu. */
export function summaryTable(rows: Array<[label: string, valueHtml: string]>): string {
  const body = rows
    .filter(([, value]) => value.trim().length > 0)
    .map(
      ([label, value]) => `<tr>
      <td style="padding:8px 12px;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:14px;color:${brand.muted};vertical-align:top;width:38%;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:14px;color:${brand.ink};font-weight:600;vertical-align:top;">${value}</td>
    </tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0;background:${brand.surface};border-left:4px solid ${brand.blue};border-radius:12px;">
  ${body}
</table>`
}

/** Liste à puces avec la puce étoile or (motif « solidarité »). */
export function bulletList(itemsHtml: string[]): string {
  const rows = itemsHtml
    .map(
      (item) => `<tr>
      <td style="padding:4px 10px 4px 0;color:${brand.gold};font-size:16px;vertical-align:top;">&#9733;</td>
      <td style="padding:4px 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${brand.ink};">${item}</td>
    </tr>`,
    )
    .join('')
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 16px 0;">${rows}</table>`
}

/**
 * Gabarit HTML des emails FETRAG : tableau responsive 600px, CSS inline, sans emoji.
 * Bandeau bleu avec logo texte « FETRAG », ruban tricolore (bleu, vert, or), pied marine avec coordonnées.
 */
export function renderLayout(input: LayoutInput): string {
  const preheader = input.preheader ? escapeHtml(input.preheader) : ''
  const cta = input.cta ? button(input.cta.label, input.cta.url) : ''
  const note = input.note
    ? `<p style="margin:0 0 12px 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${brand.muted};">${escapeHtml(input.note)}</p>`
    : ''
  const unsubscribe = input.unsubscribeUrl
    ? `<p style="margin:12px 0 0 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#B7C3E0;">Vous recevez ce message car vous avez accepté les communications de la FETRAG. <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#ffffff;text-decoration:underline;">Se désinscrire</a></p>`
    : ''
  const phones = site.contact.phones.map(escapeHtml).join(' / ')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.surface};">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${brand.surface};">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.surface};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid ${brand.border};">
        <tr>
          <td bgcolor="${brand.blue}" style="padding:22px 28px;background:${brand.blue};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;letter-spacing:0.08em;color:#ffffff;">FETRAG</td>
                <td align="right" style="font-family:Manrope,Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#D7E4FA;">${escapeHtml(site.fullName)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;line-height:0;font-size:0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="34%" bgcolor="${brand.blue}" style="height:5px;background:${brand.blue};"></td>
                <td width="33%" bgcolor="${brand.green}" style="height:5px;background:${brand.green};"></td>
                <td width="33%" bgcolor="${brand.gold}" style="height:5px;background:${brand.gold};"></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px 12px 28px;">
            <h1 style="margin:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;font-weight:700;color:${brand.navy};">${escapeHtml(input.title)}</h1>
            ${input.contentHtml}
            ${cta}
            ${note}
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 24px 28px;">
            <p style="margin:0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${brand.muted};">${site.motto.join(' &middot; ')}</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="${brand.navy}" style="padding:22px 28px;background:${brand.navy};">
            <p style="margin:0 0 6px 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#ffffff;font-weight:700;">${escapeHtml(site.fullName)}</p>
            <p style="margin:0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#B7C3E0;">${escapeHtml(site.contact.address)}<br>${escapeHtml(site.contact.email)}<br>${phones}</p>
            ${unsubscribe}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

/** Version texte brut : titre, corps, action, pied avec coordonnées. */
export function renderTextLayout(input: {
  title: string
  body: string
  cta?: { label: string; url: string }
  note?: string
  unsubscribeUrl?: string
}): string {
  const lines: string[] = [`FETRAG - ${site.fullName}`, '', input.title.toUpperCase(), '', input.body.trim()]
  if (input.cta) lines.push('', `${input.cta.label} : ${input.cta.url}`)
  if (input.note) lines.push('', input.note)
  lines.push('', '--', site.motto.join(' - '), site.contact.address, site.contact.email, site.contact.phones.join(' / '))
  if (input.unsubscribeUrl) lines.push('', `Se désinscrire : ${input.unsubscribeUrl}`)
  return lines.join('\n')
}
