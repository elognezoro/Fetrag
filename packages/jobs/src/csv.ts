/** Marque d'ordre des octets UTF-8 (Excel détecte l'encodage). */
export const BOM = String.fromCharCode(0xfeff)

/** Séparateur adapté à Excel en environnement francophone. */
export const CSV_SEPARATOR = ';'

export type CsvCell = string | number | boolean | Date | null | undefined

function formatCell(value: CsvCell): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'boolean') return value ? 'oui' : 'non'
  let text = String(value)
  // Neutralise l'injection de formules (=, +, -, @) dans les tableurs.
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  if (/[";\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

/** Sérialise des lignes en CSV (UTF-8 avec BOM, séparateur `;`, retours CRLF). */
export function toCsv(headers: readonly string[], rows: readonly CsvCell[][]): string {
  const lines = [headers.map(formatCell).join(CSV_SEPARATOR)]
  for (const row of rows) lines.push(row.map(formatCell).join(CSV_SEPARATOR))
  return `${BOM}${lines.join('\r\n')}\r\n`
}
