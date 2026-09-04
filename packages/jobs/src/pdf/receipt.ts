import { PDFDocument, StandardFonts } from 'pdf-lib'
import { site } from '@fetrag/config'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { drawHeaderBand, drawRight, pdfColors, safeText, wrapText } from './common'

export interface ReceiptLine {
  label: string
  quantity: number
  unitAmount: number
  totalAmount: number
}

export interface ReceiptRenderInput {
  number: string
  issuedAt: Date
  orderReference: string
  orderDate: Date
  customerName: string
  customerEmail: string
  organizationName?: string | null
  lines: ReceiptLine[]
  subtotalAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentMethod: string
  paymentRef?: string | null
  paidAt?: Date | null
  couponCode?: string | null
  sponsorshipLabel?: string | null
}

const A4_PORTRAIT: [number, number] = [595.28, 841.89]

/** Reçu de paiement numéroté (A4 portrait) : en-tête FETRAG, parties, lignes, totaux, mentions. */
export async function renderReceiptPdf(input: ReceiptRenderInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Reçu ${input.number}`)
  pdf.setAuthor(site.fullName)
  pdf.setCreator('FETRAG - paiements')

  const page = pdf.addPage(A4_PORTRAIT)
  const [width, height] = A4_PORTRAIT
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const margin = 48
  const money = (amount: number) => safeText(formatMoney(amount, input.currency))

  drawHeaderBand(page, { bold, regular }, site.fullName)

  page.drawText('REÇU DE PAIEMENT', { x: margin, y: height - 110, size: 24, font: serifBold, color: pdfColors.navy })
  page.drawText(`N° ${safeText(input.number)}`, { x: margin, y: height - 130, size: 12, font: bold, color: pdfColors.blue })
  drawRight(page, `Émis le ${formatDateTime(input.issuedAt)}`, { x: width - margin, y: height - 110, font: regular, size: 10, color: pdfColors.muted })
  drawRight(page, `Commande ${safeText(input.orderReference)} du ${formatDateTime(input.orderDate)}`, {
    x: width - margin,
    y: height - 124,
    font: regular,
    size: 10,
    color: pdfColors.muted,
  })

  // Parties.
  let y = height - 175
  page.drawRectangle({ x: margin, y: y - 52, width: width - margin * 2, height: 68, color: pdfColors.surface })
  page.drawRectangle({ x: margin, y: y - 52, width: 4, height: 68, color: pdfColors.blue })
  page.drawText('Reçu de', { x: margin + 16, y, size: 9, font: bold, color: pdfColors.muted })
  page.drawText(safeText(input.customerName), { x: margin + 16, y: y - 16, size: 12, font: bold, color: pdfColors.ink })
  page.drawText(safeText(input.customerEmail), { x: margin + 16, y: y - 31, size: 10, font: regular, color: pdfColors.ink })
  if (input.organizationName) {
    page.drawText(safeText(input.organizationName), { x: margin + 16, y: y - 45, size: 10, font: regular, color: pdfColors.muted })
  }
  page.drawText('Émis par', { x: width / 2 + 10, y, size: 9, font: bold, color: pdfColors.muted })
  page.drawText(safeText(site.fullName), { x: width / 2 + 10, y: y - 16, size: 11, font: bold, color: pdfColors.ink })
  page.drawText(safeText(site.contact.address), { x: width / 2 + 10, y: y - 31, size: 10, font: regular, color: pdfColors.ink })
  page.drawText(safeText(site.contact.email), { x: width / 2 + 10, y: y - 45, size: 10, font: regular, color: pdfColors.muted })

  // Tableau des lignes.
  y -= 90
  const colLabel = margin
  const colQty = width - margin - 250
  const colUnit = width - margin - 150
  const colTotal = width - margin
  page.drawRectangle({ x: margin, y: y - 6, width: width - margin * 2, height: 22, color: pdfColors.navy })
  page.drawText('Désignation', { x: colLabel + 8, y, size: 9.5, font: bold, color: pdfColors.white })
  page.drawText('Qté', { x: colQty, y, size: 9.5, font: bold, color: pdfColors.white })
  page.drawText('Prix unitaire', { x: colUnit, y, size: 9.5, font: bold, color: pdfColors.white })
  drawRight(page, 'Total', { x: colTotal - 8, y, font: bold, size: 9.5, color: pdfColors.white })
  y -= 26

  for (const line of input.lines) {
    const labelLines = wrapText(line.label, regular, 10, colQty - colLabel - 20).slice(0, 3)
    const rowHeight = Math.max(18, labelLines.length * 13 + 6)
    page.drawLine({ start: { x: margin, y: y - rowHeight + 10 }, end: { x: width - margin, y: y - rowHeight + 10 }, thickness: 0.5, color: pdfColors.border })
    labelLines.forEach((text, i) => {
      page.drawText(text, { x: colLabel + 8, y: y - i * 13, size: 10, font: regular, color: pdfColors.ink })
    })
    page.drawText(String(line.quantity), { x: colQty, y, size: 10, font: regular, color: pdfColors.ink })
    page.drawText(money(line.unitAmount), { x: colUnit, y, size: 10, font: regular, color: pdfColors.ink })
    drawRight(page, money(line.totalAmount), { x: colTotal - 8, y, font: bold, size: 10, color: pdfColors.ink })
    y -= rowHeight
  }

  // Totaux.
  y -= 10
  const totals: Array<[string, string, boolean]> = [['Sous-total', money(input.subtotalAmount), false]]
  if (input.discountAmount > 0) {
    const label = input.couponCode
      ? `Remise (code ${input.couponCode})`
      : input.sponsorshipLabel
        ? `Prise en charge (${input.sponsorshipLabel})`
        : 'Remise'
    totals.push([label, `- ${money(input.discountAmount)}`, false])
  }
  totals.push(['Total payé', money(input.totalAmount), true])
  for (const [label, value, strong] of totals) {
    if (strong) {
      page.drawRectangle({ x: colUnit - 80, y: y - 7, width: colTotal - colUnit + 80, height: 24, color: pdfColors.surface })
    }
    page.drawText(safeText(label), { x: colUnit - 70, y, size: strong ? 12 : 10, font: strong ? bold : regular, color: strong ? pdfColors.navy : pdfColors.muted })
    drawRight(page, value, { x: colTotal - 8, y, font: strong ? bold : regular, size: strong ? 12 : 10, color: strong ? pdfColors.navy : pdfColors.ink })
    y -= strong ? 30 : 18
  }

  // Paiement.
  y -= 8
  page.drawText('Paiement', { x: margin, y, size: 11, font: bold, color: pdfColors.navy })
  y -= 16
  page.drawText(`Moyen : ${safeText(input.paymentMethod)}`, { x: margin, y, size: 10, font: regular, color: pdfColors.ink })
  if (input.paymentRef) {
    y -= 14
    page.drawText(`Référence opérateur : ${safeText(input.paymentRef)}`, { x: margin, y, size: 10, font: regular, color: pdfColors.ink })
  }
  if (input.paidAt) {
    y -= 14
    page.drawText(`Réglé le ${formatDateTime(input.paidAt)}`, { x: margin, y, size: 10, font: regular, color: pdfColors.ink })
  }

  // Mentions.
  page.drawLine({ start: { x: margin, y: 92 }, end: { x: width - margin, y: 92 }, thickness: 1, color: pdfColors.green })
  page.drawText('Reçu généré électroniquement par la plateforme FETRAG ; il est valable sans signature.', {
    x: margin,
    y: 76,
    size: 8.5,
    font: regular,
    color: pdfColors.muted,
  })
  page.drawText(`${safeText(site.fullName)} - ${safeText(site.contact.address)} - ${site.contact.phones.join(' / ')}`, {
    x: margin,
    y: 62,
    size: 8.5,
    font: regular,
    color: pdfColors.muted,
  })
  page.drawText(site.motto.join(' - '), { x: margin, y: 48, size: 8.5, font: bold, color: pdfColors.blue })

  return pdf.save()
}
