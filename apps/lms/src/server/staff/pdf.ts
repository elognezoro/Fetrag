import 'server-only'

/**
 * Générateur PDF minimal sans dépendance (PDF 1.4, polices standard Helvetica, encodage WinAnsi).
 * Helper local du lot LMS-STAFF : `pdf-lib` n'est pas résolvable depuis apps/lms (dépendance de @fetrag/jobs uniquement).
 * Couvre les besoins des rapports : texte, rectangles, lignes, cercles, pagination.
 */

export type Rgb = readonly [number, number, number]

export const pdfColors = {
  blue: [2 / 255, 89 / 255, 199 / 255] as Rgb,
  green: [156 / 255, 193 / 255, 2 / 255] as Rgb,
  gold: [249 / 255, 200 / 255, 4 / 255] as Rgb,
  navy: [4 / 255, 39 / 255, 104 / 255] as Rgb,
  ink: [11 / 255, 27 / 255, 63 / 255] as Rgb,
  grey: [0.45, 0.48, 0.55] as Rgb,
  border: [0.85, 0.87, 0.92] as Rgb,
  surface: [0.94, 0.95, 0.98] as Rgb,
  white: [1, 1, 1] as Rgb,
} as const

/** Correspondance des caractères typographiques courants vers l'encodage WinAnsi. */
const WINANSI_MAP: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
}

/** Largeurs approximatives (Helvetica, 1000 unités) pour l'ASCII imprimable ; repli 556 pour le reste. */
const HELVETICA_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  '[': 278, '\\': 278, ']': 278, '^': 469, _: 556, '`': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '{': 334, '|': 260, '}': 334, '~': 584,
}

/** Convertit une chaîne en octets WinAnsi (caractères non représentables remplacés par « ? »). */
function toWinAnsi(input: string): string {
  let out = ''
  for (const ch of input.normalize('NFC')) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 0x20 || code === 0x7f) {
      out += ' '
      continue
    }
    if (code <= 0xff) {
      out += ch
      continue
    }
    const mapped = WINANSI_MAP[code]
    if (mapped !== undefined) {
      out += String.fromCharCode(mapped)
      continue
    }
    const stripped = ch.normalize('NFKD').replace(/[^\x20-\x7e]/g, '')
    out += stripped || '?'
  }
  return out
}

function escapePdfString(latin1: string): string {
  return latin1.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function num(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function color(rgb: Rgb): string {
  return `${num(rgb[0])} ${num(rgb[1])} ${num(rgb[2])}`
}

export interface TextOptions {
  x: number
  y: number
  size: number
  bold?: boolean
  color?: Rgb
}

export class SimplePdf {
  readonly width: number
  readonly height: number
  private readonly pages: string[][] = []
  private current: string[] = []

  constructor(width = 595.28, height = 841.89) {
    this.width = width
    this.height = height
    this.addPage()
  }

  get pageCount(): number {
    return this.pages.length
  }

  addPage(): void {
    this.current = []
    this.pages.push(this.current)
  }

  /** Largeur approximative d'un texte (police Helvetica) pour l'alignement et la troncature. */
  static textWidth(text: string, size: number): number {
    let total = 0
    for (const ch of text) total += HELVETICA_WIDTHS[ch] ?? 556
    return (total / 1000) * size
  }

  /** Tronque un texte pour tenir dans `maxWidth` (ajoute « ... »). */
  static fit(text: string, size: number, maxWidth: number): string {
    if (SimplePdf.textWidth(text, size) <= maxWidth) return text
    let out = text
    while (out.length > 1 && SimplePdf.textWidth(`${out}...`, size) > maxWidth) out = out.slice(0, -1)
    return `${out.trimEnd()}...`
  }

  text(text: string, options: TextOptions): void {
    const font = options.bold ? '/F2' : '/F1'
    const fill = color(options.color ?? pdfColors.ink)
    const encoded = escapePdfString(toWinAnsi(text))
    this.current.push(`BT ${font} ${num(options.size)} Tf ${fill} rg ${num(options.x)} ${num(options.y)} Td (${encoded}) Tj ET`)
  }

  /** Écrit un texte sur une page donnée (numérotation de pied de page). */
  textOnPage(pageIndex: number, text: string, options: TextOptions): void {
    const page = this.pages[pageIndex]
    if (!page) return
    const font = options.bold ? '/F2' : '/F1'
    const fill = color(options.color ?? pdfColors.ink)
    const encoded = escapePdfString(toWinAnsi(text))
    page.push(`BT ${font} ${num(options.size)} Tf ${fill} rg ${num(options.x)} ${num(options.y)} Td (${encoded}) Tj ET`)
  }

  rect(options: { x: number; y: number; width: number; height: number; color: Rgb }): void {
    this.current.push(`${color(options.color)} rg ${num(options.x)} ${num(options.y)} ${num(options.width)} ${num(options.height)} re f`)
  }

  line(options: { from: { x: number; y: number }; to: { x: number; y: number }; thickness?: number; color?: Rgb }): void {
    this.current.push(
      `${color(options.color ?? pdfColors.border)} RG ${num(options.thickness ?? 1)} w ${num(options.from.x)} ${num(options.from.y)} m ${num(options.to.x)} ${num(options.to.y)} l S`,
    )
  }

  circle(options: { x: number; y: number; radius: number; fill?: Rgb; stroke?: Rgb; strokeWidth?: number }): void {
    const k = 0.5523 * options.radius
    const { x, y, radius: r } = options
    const path = [
      `${num(x + r)} ${num(y)} m`,
      `${num(x + r)} ${num(y + k)} ${num(x + k)} ${num(y + r)} ${num(x)} ${num(y + r)} c`,
      `${num(x - k)} ${num(y + r)} ${num(x - r)} ${num(y + k)} ${num(x - r)} ${num(y)} c`,
      `${num(x - r)} ${num(y - k)} ${num(x - k)} ${num(y - r)} ${num(x)} ${num(y - r)} c`,
      `${num(x + k)} ${num(y - r)} ${num(x + r)} ${num(y - k)} ${num(x + r)} ${num(y)} c`,
    ].join(' ')
    const parts: string[] = []
    if (options.fill) parts.push(`${color(options.fill)} rg`)
    if (options.stroke) parts.push(`${color(options.stroke)} RG ${num(options.strokeWidth ?? 1)} w`)
    const paint = options.fill && options.stroke ? 'B' : options.stroke ? 'S' : 'f'
    this.current.push(`${parts.join(' ')} ${path} ${paint}`)
  }

  /** Sérialise le document (octets PDF). */
  save(): Uint8Array {
    const objects: string[] = []
    const add = (body: string): number => {
      objects.push(body)
      return objects.length
    }
    add('<< /Type /Catalog /Pages 2 0 R >>')
    add('') // 2 : Pages (rempli ensuite)
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
    const pageIds: number[] = []
    for (const ops of this.pages) {
      const stream = ops.join('\n')
      const length = Buffer.byteLength(stream, 'latin1')
      const contentId = add(`<< /Length ${length} >>\nstream\n${stream}\nendstream`)
      const pageId = add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(this.width)} ${num(this.height)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
      )
      pageIds.push(pageId)
    }
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

    let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'
    const offsets: number[] = []
    objects.forEach((body, index) => {
      offsets.push(Buffer.byteLength(out, 'latin1'))
      out += `${index + 1} 0 obj\n${body}\nendobj\n`
    })
    const xref = Buffer.byteLength(out, 'latin1')
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (const offset of offsets) out += `${String(offset).padStart(10, '0')} 00000 n \n`
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
    return new Uint8Array(Buffer.from(out, 'latin1'))
  }
}
