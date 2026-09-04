import { StorageValidationError } from './errors'
import { extensionOf } from './keys'

/** Forme minimale d'un fichier à valider (compatible avec `File` du Web et les objets métier). */
export interface UploadCandidate {
  name: string
  size: number
  type: string
}

export interface UploadRules {
  /** Taille maximale en mégaoctets. */
  maxMb: number
  /** Types MIME autorisés ; jokers `image/*` acceptés. */
  mimeTypes: readonly string[]
}

export interface ValidatedUpload {
  fileName: string
  mimeType: string
  size: number
  extension: string
}

/** Taille maximale par défaut, alignée sur `serverActions.bodySizeLimit` des apps (12 Mo). */
export const DEFAULT_MAX_UPLOAD_MB = 12

export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] as const
export const documentMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
] as const
export const mediaMimeTypes = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'video/mp4', 'video/webm'] as const

/** Extensions exécutables toujours refusées, quel que soit le type MIME déclaré. */
const ALWAYS_BLOCKED_EXTENSIONS = new Set(['exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif', 'sh', 'ps1', 'jar'])

/** Extensions à risque (scripts, HTML, SVG) refusées sauf si leur type MIME est explicitement autorisé. */
const RISKY_EXTENSIONS = new Set(['js', 'mjs', 'cjs', 'html', 'htm', 'php', 'phtml', 'asp', 'aspx', 'jsp', 'svg', 'xml'])

const extensionByMime: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/avif': ['avif'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'text/plain': ['txt', 'md'],
  'text/csv': ['csv'],
  'audio/mpeg': ['mp3'],
  'audio/mp4': ['m4a', 'mp4'],
  'audio/ogg': ['ogg', 'oga'],
  'audio/wav': ['wav'],
  'video/mp4': ['mp4', 'm4v'],
  'video/webm': ['webm'],
}

/** Caractères de contrôle (U+0000..U+001F, U+007F) et caractères interdits dans un nom de fichier. */
const FILENAME_FORBIDDEN = new RegExp(
  `[${String.fromCharCode(0x00)}-${String.fromCharCode(0x1f)}${String.fromCharCode(0x7f)}<>:"|?*]`,
  'g',
)

function mimeMatches(mime: string, allowed: string): boolean {
  if (allowed === '*/*') return true
  if (allowed.endsWith('/*')) return mime.startsWith(allowed.slice(0, -1))
  return mime === allowed
}

/** Nom de fichier sûr pour l'affichage et le stockage du nom d'origine. */
export function sanitizeFileName(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? name
  const cleaned = base.replace(FILENAME_FORBIDDEN, '').trim()
  return cleaned.slice(0, 180) || 'fichier'
}

/**
 * Valide un fichier reçu (taille, type MIME, extension) et lève `StorageValidationError`
 * (forme identique à `ValidationError` du domaine) en cas de refus.
 */
export function validateUpload(file: UploadCandidate, rules: UploadRules): ValidatedUpload {
  const fileName = sanitizeFileName(file.name ?? '')
  const mimeType = (file.type ?? '').trim().toLowerCase().split(';')[0] ?? ''
  const size = Number(file.size)
  const maxMb = rules.maxMb > 0 ? rules.maxMb : DEFAULT_MAX_UPLOAD_MB
  const maxBytes = Math.round(maxMb * 1024 * 1024)

  if (!Number.isFinite(size) || size <= 0) {
    throw new StorageValidationError('Le fichier est vide', { field: 'file', reason: 'empty' })
  }
  if (size > maxBytes) {
    throw new StorageValidationError(`Le fichier dépasse la taille maximale de ${maxMb} Mo`, {
      field: 'file',
      reason: 'too_large',
      maxMb,
      size,
    })
  }
  if (!mimeType || !rules.mimeTypes.some((allowed) => mimeMatches(mimeType, allowed))) {
    throw new StorageValidationError('Type de fichier non autorisé', {
      field: 'file',
      reason: 'mime_type',
      mimeType: mimeType || null,
      allowed: [...rules.mimeTypes],
    })
  }

  const extension = extensionOf(fileName)
  if (ALWAYS_BLOCKED_EXTENSIONS.has(extension)) {
    throw new StorageValidationError('Extension de fichier refusée', { field: 'file', reason: 'extension', extension })
  }
  if (RISKY_EXTENSIONS.has(extension) && !rules.mimeTypes.includes(mimeType)) {
    throw new StorageValidationError('Extension de fichier refusée', { field: 'file', reason: 'extension', extension })
  }
  const expected = extensionByMime[mimeType]
  if (expected && extension && !expected.includes(extension)) {
    throw new StorageValidationError("L'extension ne correspond pas au type de fichier", {
      field: 'file',
      reason: 'extension_mismatch',
      extension,
      mimeType,
    })
  }

  return { fileName, mimeType, size, extension }
}
