import { randomUUID } from 'node:crypto'
import type { StorageVisibility } from './types'

const PUBLIC_PREFIX = 'public/'
const PRIVATE_PREFIX = 'private/'

/** Plage de caractères construite sans littéraux invisibles dans le source. */
function charRange(from: number, to: number): string {
  return `${String.fromCharCode(from)}-${String.fromCharCode(to)}`
}

/** Marques diacritiques combinantes U+0300..U+036F (après normalisation NFKD). */
const COMBINING_MARKS = new RegExp(`[${charRange(0x0300, 0x036f)}]`, 'g')
/** Caractères de contrôle ASCII (U+0000..U+001F et U+007F). */
const CONTROL_CHARS = new RegExp(`[${charRange(0x00, 0x1f)}${String.fromCharCode(0x7f)}]`, 'g')

/** Slug de nom de fichier, sans dépendance externe (miroir minimal de `slugify` du domaine). */
export function slugifyFileName(input: string, maxLength = 80): string {
  const base = input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return base.slice(0, maxLength).replace(/-+$/g, '') || 'fichier'
}

/** Extrait l'extension (minuscules, sans point) d'un nom de fichier. */
export function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  if (idx <= 0 || idx === fileName.length - 1) return ''
  return fileName
    .slice(idx + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10)
}

/** Nettoie un dossier logique : lettres, chiffres, tirets, sous-dossiers autorisés. */
export function sanitizeFolder(folder: string): string {
  const cleaned = folder
    .split('/')
    .map((segment) => slugifyFileName(segment, 40))
    .filter((segment) => segment.length > 0 && segment !== 'fichier')
    .join('/')
  return cleaned || 'uploads'
}

/**
 * Normalise une clé : supprime les slashs de tête, les segments `.`/`..`,
 * les caractères de contrôle et les espaces. Lève si la clé est vide.
 */
export function normalizeKey(key: string): string {
  const segments = key
    .replace(/\\/g, '/')
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '.' && s !== '..')
    .map((s) => s.replace(CONTROL_CHARS, ''))
  const normalized = segments.join('/')
  if (!normalized) throw new Error('Clé de stockage vide')
  return normalized
}

/** Visibilité encodée dans le préfixe de la clé, `null` si la clé n'est pas préfixée. */
export function visibilityOf(key: string): StorageVisibility | null {
  if (key.startsWith(PUBLIC_PREFIX)) return 'PUBLIC'
  if (key.startsWith(PRIVATE_PREFIX)) return 'PRIVATE'
  return null
}

/** Retire un éventuel préfixe de visibilité. */
export function stripVisibility(key: string): string {
  if (key.startsWith(PUBLIC_PREFIX)) return key.slice(PUBLIC_PREFIX.length)
  if (key.startsWith(PRIVATE_PREFIX)) return key.slice(PRIVATE_PREFIX.length)
  return key
}

/** Applique le préfixe de visibilité (`public/` ou `private/`) à une clé normalisée. */
export function withVisibility(key: string, visibility: StorageVisibility): string {
  const bare = stripVisibility(normalizeKey(key))
  return `${visibility === 'PUBLIC' ? PUBLIC_PREFIX : PRIVATE_PREFIX}${bare}`
}

/**
 * Construit une clé unique et lisible : `folder/aaaa/mm/<uuid>-<slug>.<ext>`.
 * Le préfixe de visibilité est ajouté par le fournisseur lors du `put`.
 */
export function buildKey(folder: string, fileName: string, date: Date = new Date()): string {
  const ext = extensionOf(fileName)
  const stem = ext ? fileName.slice(0, fileName.length - ext.length - 1) : fileName
  const slug = slugifyFileName(stem)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const name = ext ? `${randomUUID()}-${slug}.${ext}` : `${randomUUID()}-${slug}`
  return `${sanitizeFolder(folder)}/${year}/${month}/${name}`
}

/** Nom de fichier lisible pour un téléchargement (sans l'uuid technique). */
export function displayNameFromKey(key: string): string {
  const last = key.split('/').pop() ?? key
  return last.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '')
}
