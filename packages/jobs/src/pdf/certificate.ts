import QRCode from 'qrcode'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { site } from '@fetrag/config'
import { formatDate } from '@fetrag/domain'
import { drawArc, drawCentered, drawHeaderBand, drawRight, drawSeal, drawStar, pdfColors, safeText, wrapText } from './common'

export interface CertificateRenderInput {
  kind: 'CERTIFICATE' | 'ATTESTATION'
  number: string
  verifyCode: string
  verifyUrl: string
  holderName: string
  courseTitle: string
  /** Titre affiché (par défaut selon le type). */
  titleText?: string | null
  /** Phrase d'introduction (par défaut « a suivi avec succès la formation »). */
  bodyText?: string | null
  score?: number | null
  attendanceRate?: number | null
  issuedAt: Date
  expiresAt?: Date | null
  cohortName?: string | null
  sessionStart?: Date | null
  sessionEnd?: Date | null
  durationHours?: number | null
  signatoryName?: string | null
  signatoryTitle?: string | null
  organizationName?: string | null
}

/** Dimensions A4 paysage en points. */
const A4_LANDSCAPE: [number, number] = [841.89, 595.28]

/**
 * Génère le PDF d'attestation / certificat (A4 paysage) : bandeau bleu, filet vert, titre,
 * nom du titulaire, intitulé, mentions (score, assiduité), date, numéro, signataire, QR de vérification,
 * étoile or vectorielle. Polices standard (Helvetica, Times) : aucune ressource externe.
 */
export async function renderCertificatePdf(input: CertificateRenderInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${input.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'} ${input.number}`)
  pdf.setAuthor(site.fullName)
  pdf.setSubject(input.courseTitle)
  pdf.setCreator('FETRAG - plateforme de formation')
  pdf.setProducer('pdf-lib')

  const page = pdf.addPage(A4_LANDSCAPE)
  const [width, height] = A4_LANDSCAPE
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold)

  // Cadre : bordure bleue épaisse et filet or intérieur (anneau institutionnel).
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: pdfColors.blue, borderWidth: 3 })
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: pdfColors.gold, borderWidth: 0.8 })

  // Bandeau bleu + ruban tricolore.
  drawHeaderBand(page, { bold: helveticaBold, regular: helvetica }, site.fullName)

  // Arc vert décoratif (efficacité) en filigrane à droite.
  drawArc(page, { cx: width - 150, cy: 250, radius: 150, startDeg: 205, endDeg: 335, thickness: 9, color: pdfColors.green, opacity: 0.18 })

  // Sceau bleu/or avec étoile (en haut à droite, sous le bandeau).
  drawSeal(page, width - 92, height - 130, 42)

  // Titre.
  const title = (input.titleText?.trim() || (input.kind === 'CERTIFICATE' ? 'CERTIFICAT' : 'ATTESTATION DE FORMATION')).toUpperCase()
  drawCentered(page, title, { y: height - 150, font: timesBold, size: 34, color: pdfColors.navy })
  // Filet vert sous le titre.
  page.drawLine({ start: { x: width / 2 - 120, y: height - 162 }, end: { x: width / 2 + 120, y: height - 162 }, thickness: 3, color: pdfColors.green })
  drawStar(page, width / 2, height - 162, 7)

  // Organisme émetteur.
  drawCentered(page, 'La Fédération des Travailleurs du Gabon certifie que', { y: height - 200, font: helvetica, size: 13, color: pdfColors.muted })

  // Nom du titulaire.
  const holder = safeText(input.holderName)
  const holderSize = helveticaBold.widthOfTextAtSize(holder, 32) > width - 200 ? 24 : 32
  drawCentered(page, holder, { y: height - 245, font: timesBold, size: holderSize, color: pdfColors.blue })
  if (input.organizationName) {
    drawCentered(page, safeText(input.organizationName), { y: height - 266, font: helvetica, size: 12, color: pdfColors.muted })
  }

  // Corps.
  const body = input.bodyText?.trim() || 'a suivi avec succès la formation'
  drawCentered(page, body, { y: height - 296, font: helvetica, size: 14, color: pdfColors.ink })
  const courseLines = wrapText(input.courseTitle, timesBold, 20, width - 220).slice(0, 2)
  let y = height - 326
  for (const line of courseLines) {
    drawCentered(page, line, { y, font: timesBold, size: 20, color: pdfColors.navy })
    y -= 26
  }

  // Mentions : durée, session, score, assiduité.
  const mentions: string[] = []
  if (input.durationHours) mentions.push(`Durée : ${input.durationHours} heures`)
  if (input.sessionStart) {
    mentions.push(
      input.sessionEnd && input.sessionEnd.getTime() !== input.sessionStart.getTime()
        ? `Session du ${formatDate(input.sessionStart)} au ${formatDate(input.sessionEnd)}`
        : `Session du ${formatDate(input.sessionStart)}`,
    )
  } else if (input.cohortName) {
    mentions.push(`Cohorte : ${input.cohortName}`)
  }
  if (typeof input.score === 'number') mentions.push(`Score obtenu : ${input.score} %`)
  if (typeof input.attendanceRate === 'number') mentions.push(`Assiduité : ${input.attendanceRate} %`)
  if (mentions.length > 0) {
    drawCentered(page, mentions.join('   |   '), { y: y - 6, font: helvetica, size: 11.5, color: pdfColors.muted })
  }

  // Date d'émission et validité.
  const issuedLine = `Fait à Libreville, le ${formatDate(input.issuedAt)}`
  drawCentered(page, issuedLine, { y: 178, font: helvetica, size: 12, color: pdfColors.ink })
  if (input.expiresAt) {
    drawCentered(page, `Valable jusqu'au ${formatDate(input.expiresAt)}`, { y: 162, font: helvetica, size: 10, color: pdfColors.muted })
  }

  // QR code de vérification (bas gauche).
  const qrPng = await QRCode.toBuffer(input.verifyUrl, {
    type: 'png',
    width: 360,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#042768', light: '#ffffff' },
  })
  const qrImage = await pdf.embedPng(qrPng)
  const qrSize = 92
  page.drawImage(qrImage, { x: 48, y: 44, width: qrSize, height: qrSize })
  page.drawText('Vérifier l’authenticité', { x: 150, y: 116, size: 10, font: helveticaBold, color: pdfColors.navy })
  page.drawText(safeText(input.verifyUrl), { x: 150, y: 102, size: 8.5, font: helvetica, color: pdfColors.muted })
  page.drawText(`N° ${safeText(input.number)}`, { x: 150, y: 80, size: 11, font: helveticaBold, color: pdfColors.ink })
  page.drawText(`Code de vérification : ${safeText(input.verifyCode)}`, { x: 150, y: 64, size: 9.5, font: helvetica, color: pdfColors.muted })

  // Signataire (bas droite).
  const signatoryName = input.signatoryName?.trim() || site.secretaryGeneral
  const signatoryTitle = input.signatoryTitle?.trim() || 'Secrétaire Général'
  page.drawLine({ start: { x: width - 300, y: 108 }, end: { x: width - 60, y: 108 }, thickness: 1, color: pdfColors.blue })
  drawRight(page, signatoryName, { x: width - 60, y: 90, font: timesBold, size: 14, color: pdfColors.navy })
  drawRight(page, signatoryTitle, { x: width - 60, y: 74, font: helvetica, size: 10.5, color: pdfColors.muted })
  drawRight(page, site.fullName, { x: width - 60, y: 60, font: helvetica, size: 9, color: pdfColors.muted })

  // Pied : devise et coordonnées.
  drawCentered(page, `${site.motto.join('  ·  ')}`, { y: 38, font: helvetica, size: 9, color: pdfColors.blue })
  drawCentered(page, `${site.contact.address}  -  ${site.contact.email}  -  ${site.contact.phones.join(' / ')}`, {
    y: 26,
    font: helvetica,
    size: 8,
    color: pdfColors.muted,
  })

  return pdf.save()
}
