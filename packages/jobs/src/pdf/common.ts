import { rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'

/** Couleurs de la charte (DESIGN_SYSTEM.md) en composantes 0-1. */
export const pdfColors = {
  blue: rgb(2 / 255, 89 / 255, 199 / 255),
  green: rgb(156 / 255, 193 / 255, 2 / 255),
  gold: rgb(249 / 255, 200 / 255, 4 / 255),
  navy: rgb(4 / 255, 39 / 255, 104 / 255),
  ink: rgb(11 / 255, 27 / 255, 63 / 255),
  muted: rgb(91 / 255, 107 / 255, 140 / 255),
  border: rgb(227 / 255, 231 / 255, 242 / 255),
  surface: rgb(247 / 255, 248 / 255, 252 / 255),
  white: rgb(1, 1, 1),
} as const

/** Points de code hors Latin-1 acceptés par l'encodage WinAnsi des polices standard. */
const WINANSI_EXTRA = new Set([
  0x152, 0x153, 0x160, 0x161, 0x178, 0x17d, 0x17e, 0x192, 0x2c6, 0x2dc, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a,
  0x201c, 0x201d, 0x201e, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203a, 0x20ac, 0x2122,
])

/** Tout caractère hors ASCII imprimable (0x20-0x7E), construit sans littéral invisible. */
const NON_ASCII_PRINTABLE = new RegExp(`[^${String.fromCharCode(0x20)}-${String.fromCharCode(0x7e)}]`, 'g')

/** Rend un texte encodable par les polices standard (Helvetica, Times) : remplace les caractères non supportés. */
export function safeText(input: string): string {
  let out = ''
  for (const ch of input.normalize('NFC')) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 0x20 || code === 0x7f) {
      out += ' '
      continue
    }
    if (code <= 0xff || WINANSI_EXTRA.has(code)) {
      out += ch
      continue
    }
    const stripped = ch.normalize('NFKD').replace(NON_ASCII_PRINTABLE, '')
    out += stripped || '?'
  }
  return out
}

/** Découpe un texte en lignes tenant dans `maxWidth` pour la police et la taille données. */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safeText(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Écrit une ligne centrée horizontalement. */
export function drawCentered(
  page: PDFPage,
  text: string,
  options: { y: number; font: PDFFont; size: number; color?: RGB; centerX?: number },
): void {
  const safe = safeText(text)
  const width = options.font.widthOfTextAtSize(safe, options.size)
  const centerX = options.centerX ?? page.getWidth() / 2
  page.drawText(safe, { x: centerX - width / 2, y: options.y, size: options.size, font: options.font, color: options.color ?? pdfColors.ink })
}

/** Écrit une ligne alignée à droite (x = bord droit). */
export function drawRight(
  page: PDFPage,
  text: string,
  options: { x: number; y: number; font: PDFFont; size: number; color?: RGB },
): void {
  const safe = safeText(text)
  const width = options.font.widthOfTextAtSize(safe, options.size)
  page.drawText(safe, { x: options.x - width, y: options.y, size: options.size, font: options.font, color: options.color ?? pdfColors.ink })
}

/** Chemin SVG d'une étoile à cinq branches centrée sur (0,0) de rayon `outer`. */
export function starPath(outer: number, inner: number = outer * 0.42): string {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    points.push(`${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`)
  }
  return `M ${points.join(' L ')} Z`
}

/** Étoile or vectorielle (motif « solidarité » du logo) centrée en (x, y). */
export function drawStar(page: PDFPage, x: number, y: number, radius: number, color: RGB = pdfColors.gold): void {
  page.drawSvgPath(starPath(radius), { x, y, color, borderWidth: 0 })
}

/**
 * Arc de cercle épais (motif « efficacité » : arc vert ouvert vers le haut), tracé par segments.
 * Angles en degrés, sens trigonométrique, 0 = droite.
 */
export function drawArc(
  page: PDFPage,
  options: { cx: number; cy: number; radius: number; startDeg: number; endDeg: number; thickness: number; color: RGB; opacity?: number },
): void {
  const steps = 48
  const start = (options.startDeg * Math.PI) / 180
  const end = (options.endDeg * Math.PI) / 180
  let prev = { x: options.cx + Math.cos(start) * options.radius, y: options.cy + Math.sin(start) * options.radius }
  for (let i = 1; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps
    const next = { x: options.cx + Math.cos(t) * options.radius, y: options.cy + Math.sin(t) * options.radius }
    page.drawLine({ start: prev, end: next, thickness: options.thickness, color: options.color, opacity: options.opacity ?? 1 })
    prev = next
  }
}

/** Sceau circulaire bleu/or avec étoile centrale (composant `CertificateSeal`). */
export function drawSeal(page: PDFPage, cx: number, cy: number, radius: number): void {
  page.drawCircle({ x: cx, y: cy, size: radius, borderColor: pdfColors.blue, borderWidth: 3, color: pdfColors.white })
  page.drawCircle({ x: cx, y: cy, size: radius * 0.8, borderColor: pdfColors.gold, borderWidth: 1.2, color: pdfColors.white })
  drawArc(page, { cx, cy, radius: radius * 0.62, startDeg: 200, endDeg: 340, thickness: 3, color: pdfColors.green })
  drawStar(page, cx, cy + radius * 0.05, radius * 0.38)
}

/** Bandeau bleu avec logo texte FETRAG et ruban tricolore. */
export function drawHeaderBand(page: PDFPage, fonts: { bold: PDFFont; regular: PDFFont }, subtitle: string): void {
  const width = page.getWidth()
  const height = page.getHeight()
  const bandHeight = 58
  page.drawRectangle({ x: 0, y: height - bandHeight, width, height: bandHeight, color: pdfColors.blue })
  page.drawText('FETRAG', { x: 40, y: height - 38, size: 24, font: fonts.bold, color: pdfColors.white })
  drawRight(page, safeText(subtitle), { x: width - 40, y: height - 34, font: fonts.regular, size: 10, color: rgb(0.85, 0.9, 0.98) })
  const stripY = height - bandHeight - 5
  page.drawRectangle({ x: 0, y: stripY, width: width * 0.34, height: 5, color: pdfColors.blue })
  page.drawRectangle({ x: width * 0.34, y: stripY, width: width * 0.33, height: 5, color: pdfColors.green })
  page.drawRectangle({ x: width * 0.67, y: stripY, width: width * 0.33, height: 5, color: pdfColors.gold })
}
