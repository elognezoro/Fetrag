import { randomInt } from 'node:crypto'

/**
 * Normalise un texte pour comparaison tolérante : suppression des accents,
 * minuscules, ponctuation retirée, espaces réduits.
 */
export function normalizeText(input: string, options: { caseSensitive?: boolean } = {}): string {
  let value = input.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  if (!options.caseSensitive) value = value.toLowerCase()
  return value
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Compare deux textes après normalisation. */
export function textEquals(a: string, b: string, options: { caseSensitive?: boolean } = {}): boolean {
  return normalizeText(a, options) === normalizeText(b, options)
}

/** Retire les balises HTML d'un contenu saisi (forums, réponses libres). */
export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

/** Mot de passe aléatoire fort (majuscule, minuscule et chiffre garantis). */
export function randomPassword(length = 14): string {
  const chars: string[] = []
  for (let i = 0; i < Math.max(10, length); i++) {
    chars.push(PASSWORD_ALPHABET[randomInt(0, PASSWORD_ALPHABET.length)] ?? 'a')
  }
  chars[0] = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[randomInt(0, 24)] ?? 'A'
  chars[1] = 'abcdefghjkmnpqrstuvwxyz'[randomInt(0, 23)] ?? 'a'
  chars[2] = '23456789'[randomInt(0, 8)] ?? '2'
  return chars.join('')
}

/** Sépare un nom complet en prénom / nom (le dernier mot est le nom de famille). */
export function splitName(fullName: string): { firstName: string | null; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: null, lastName: null }
  if (parts.length === 1) return { firstName: parts[0] ?? null, lastName: null }
  const lastName = parts.pop() ?? null
  return { firstName: parts.join(' '), lastName }
}

/** Nom affichable d'un utilisateur à partir des champs disponibles. */
export function displayName(user: {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}): string {
  if (user.name && user.name.trim()) return user.name.trim()
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (composed) return composed
  return user.email ?? 'Utilisateur'
}

/** Mélange un tableau (Fisher-Yates) sans muter l'original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1)
    const a = copy[i]
    const b = copy[j]
    if (a !== undefined && b !== undefined) {
      copy[i] = b
      copy[j] = a
    }
  }
  return copy
}

/** Pourcentage entier borné 0-100. */
export function percent(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
}
