/** Helpers purs de lecture et de construction des paramètres d'URL des listes publiques. */

export type SearchParamsRecord = Record<string, string | string[] | undefined>

/** Première valeur d'un paramètre (les tableaux sont réduits à leur premier élément). */
export function single(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

/** Numéro de page borné (1 par défaut). */
export function pageParam(value: string | string[] | undefined, max = 500): number {
  const n = Number.parseInt(single(value) ?? '1', 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, max)
}

/** Valeur appartenant à une liste fermée, sinon `undefined`. */
export function oneOf<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  const v = single(value)
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined
}

/** Slug valide (minuscules, chiffres, tirets), sinon `undefined`. */
export function slugParam(value: string | string[] | undefined): string | undefined {
  const v = single(value)
  return v && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 120 ? v : undefined
}

/** Terme de recherche borné (200 caractères), sinon `undefined`. */
export function queryParam(value: string | string[] | undefined, max = 200): string | undefined {
  const v = single(value)
  return v ? v.slice(0, max) : undefined
}

/** Booléen d'URL (« 1 », « true », « oui »). */
export function boolParam(value: string | string[] | undefined): boolean {
  const v = single(value)?.toLowerCase()
  return v === '1' || v === 'true' || v === 'oui'
}

/** Étiquette libre (secteur, groupe) : texte court sans balises. */
export function labelParam(value: string | string[] | undefined, max = 80): string | undefined {
  const v = single(value)
  if (!v) return undefined
  const clean = v.replace(/[<>"']/g, '').slice(0, max).trim()
  return clean || undefined
}

/**
 * Construit l'URL d'une liste en conservant les filtres courants et en appliquant des surcharges.
 * Une valeur `undefined`/vide retire le paramètre ; `page` = 1 est omis.
 */
export function buildHref(base: string, current: Record<string, string | number | undefined>, overrides: Record<string, string | number | undefined> = {}): string {
  const params = new URLSearchParams()
  const merged: Record<string, string | number | undefined> = { ...current, ...overrides }
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === '' || value === null) continue
    if (key === 'page' && (value === 1 || value === '1')) continue
    params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
