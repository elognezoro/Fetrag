/** Construction d'URL avec paramètres de requête (filtres, pagination), utilisable côté client et serveur. */
export function buildHref(base: string, params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${base}?${query}` : base
}

/** Lit un entier positif dans un paramètre de requête (page, taille). */
export function readPage(value: string | undefined, fallback = 1): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isInteger(n) && n > 0 ? n : fallback
}
