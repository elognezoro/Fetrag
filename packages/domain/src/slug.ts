/** Slug URL stable et lisible, sans dépendance externe. */
export function slugify(input: string, maxLength = 96): string {
  const base = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return base.slice(0, maxLength).replace(/-+$/g, '') || 'element'
}

/** Ajoute un suffixe court si le slug existe déjà (à utiliser avec une vérification en base). */
export async function uniqueSlug(base: string, exists: (candidate: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base)
  if (!(await exists(root))) return root
  for (let i = 2; i < 1000; i++) {
    const candidate = `${root}-${i}`
    if (!(await exists(candidate))) return candidate
  }
  return `${root}-${Date.now().toString(36)}`
}

export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 40))}…`
}

export function readingTimeMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
