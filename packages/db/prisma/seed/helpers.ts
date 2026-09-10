import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { Prisma } from '../../generated/client'

/**
 * Utilitaires communs du seed : identifiants stables, dates relatives,
 * conversions JSON, journalisation et petites fonctions de texte.
 *
 * Le seed est idempotent : chaque enregistrement possède soit une clé naturelle
 * (email, slug, code, key, reference) soit un identifiant déterministe calculé
 * par `stableId()` à partir d'une clé métier. Relancer le script met à jour
 * les enregistrements existants au lieu de les dupliquer.
 */

/** Année de référence des numéros (certificats, références) du jeu de démonstration. */
export const SEED_YEAR = 2026

/** Coût bcrypt demandé pour les comptes de démonstration. */
const BCRYPT_COST = 10

/**
 * UUID déterministe (forme v5) dérivé d'une clé métier.
 * Permet d'upserter des entités sans clé naturelle (activités, questions, options...).
 */
export function stableId(...parts: Array<string | number>): string {
  const hex = createHash('sha256').update(`fetrag-seed:${parts.join(':')}`).digest('hex')
  const variant = ['8', '9', 'a', 'b'][parseInt(hex[16] ?? '0', 16) % 4] ?? '8'
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

/** Hash bcrypt du mot de passe de démonstration (calculé une seule fois par exécution). */
let cachedHash: Promise<string> | undefined
export function hashDemoPassword(plain: string): Promise<string> {
  if (!cachedHash) cachedHash = bcrypt.hash(plain, BCRYPT_COST)
  return cachedHash
}

/** Date UTC = aujourd'hui + n jours, à l'heure indiquée (heure de Libreville, UTC+1). */
export function daysFromNow(days: number, hourLibreville = 9, minute = 0): Date {
  const d = new Date()
  d.setUTCHours(hourLibreville - 1, minute, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

/** Date fixe (UTC) pour les contenus datés de manière stable (articles, historique). */
export function fixedDate(year: number, month: number, day: number, hour = 9): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0))
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

/** Conversion explicite vers le type JSON d'entrée Prisma. */
export function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

/** Slug URL stable (même algorithme que @fetrag/domain, redéfini ici pour éviter une dépendance circulaire). */
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

/** Temps de lecture estimé en minutes (200 mots / minute). */
export function readingTimeMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Extrait texte brut d'un HTML, coupé au dernier espace. */
export function excerptOf(html: string, max = 200): string {
  const clean = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 40))}…`
}

/** Numéro de certificat séquentiel : FETRAG-2026-000001. */
export function certificateNumber(sequence: number, year = SEED_YEAR): string {
  return `FETRAG-${year}-${String(sequence).padStart(6, '0')}`
}

/** Accès sûr à un élément de tableau (noUncheckedIndexedAccess). */
export function at<T>(items: readonly T[], index: number, label = 'élément'): T {
  const value = items[index]
  if (value === undefined) throw new Error(`Seed : ${label} manquant à l'index ${index}`)
  return value
}

/** Accès sûr à une entrée de dictionnaire. */
export function get<T>(map: Record<string, T>, key: string, label = 'entrée'): T {
  const value = map[key]
  if (value === undefined) throw new Error(`Seed : ${label} introuvable pour la clé « ${key} »`)
  return value
}

/** Exécute une fonction asynchrone sur chaque élément avec une concurrence bornée. */
export async function inBatches<T, R>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 6,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency)
    const batch = await Promise.all(slice.map((item, j) => fn(item, i + j)))
    results.push(...batch)
  }
  return results
}

/** Journalisation lisible du seed. */
export const log = {
  step(title: string): void {
    console.info(`\n== ${title} ==`)
  },
  info(message: string): void {
    console.info(`   - ${message}`)
  },
  done(message: string): void {
    console.info(`   OK ${message}`)
  },
  warn(message: string): void {
    console.warn(`   !! ${message}`)
  },
}

/** Paragraphes HTML à partir d'un tableau de textes. */
export function paragraphs(...texts: string[]): string {
  return texts.map((t) => `<p>${t}</p>`).join('\n')
}

/** Liste HTML à partir d'éléments. */
export function list(items: string[]): string {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join('\n')}\n</ul>`
}
