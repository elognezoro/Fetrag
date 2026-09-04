/** Locale d'affichage par défaut (français, séparateurs d'espaces fines). */
export const UI_LOCALE = 'fr-FR'

/**
 * Formate un nombre en français (espaces fines insécables pour les milliers).
 * Utilisé par `Counter` et `StatTile`.
 */
export function formatNumber(value: number, decimals = 0, locale: string = UI_LOCALE): string {
  if (!Number.isFinite(value)) return '0'
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch {
    return value.toFixed(decimals)
  }
}

/** Formate un pourcentage entier borné à [0, 100]. */
export function formatPercent(value: number, locale: string = UI_LOCALE): string {
  const bounded = clamp(Math.round(value), 0, 100)
  return `${formatNumber(bounded, 0, locale)} %`
}

/** Borne une valeur numérique. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Initiales d'un nom complet (2 lettres maximum). */
export function initials(name: string | null | undefined): string {
  if (!name) return ''
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

/** Numéro de module sur deux chiffres (« 01 », « 10 »). */
export function padNumber(value: number | string): string {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : value
  if (!Number.isFinite(n)) return String(value)
  return String(n).padStart(2, '0')
}
