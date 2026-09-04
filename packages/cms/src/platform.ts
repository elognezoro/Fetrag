// Adaptateur vers les services de plateforme (@fetrag/notifications, @fetrag/storage).
//
// Point d'intégration unique du CMS : conversion des variables de templates, repli « custom »
// lorsqu'aucun template versionné ne correspond, conversion des erreurs de stockage en erreurs
// du domaine, et détection des clés de stockage privées à signer.
import {
  getTemplate,
  notifyRole as platformNotifyRole,
  notifyUser as platformNotifyUser,
  sendEmail as platformSendEmail,
  type NotificationCategory,
  type SendEmailResult,
  type TemplateVars,
} from '@fetrag/notifications'
import {
  buildKey as storageBuildKey,
  getStorage as storageGetStorage,
  isStorageError,
  validateUpload as storageValidateUpload,
  type StorageProvider,
  type StorageVisibility,
  type ValidatedUpload,
} from '@fetrag/storage'
import type { RoleName } from '@fetrag/contracts'
import { PreconditionError, ValidationError } from '@fetrag/domain'

export type { StorageProvider, StorageVisibility, NotificationCategory }

// -----------------------------------------------------------------------------
// Emails et notifications
// -----------------------------------------------------------------------------

export type EmailVariable = string | number | boolean | Date | null | undefined

export interface SendEmailInput {
  to: string
  /** Clé de template (`templateKeys` de @fetrag/notifications) ; `custom` ou clé inconnue → sujet + texte fournis. */
  template: string
  subject: string
  variables?: Record<string, EmailVariable>
  html?: string
  text?: string
  userId?: string | null
}

export interface NotifyInput {
  title: string
  body: string
  href?: string
  category?: NotificationCategory
  email?: boolean
}

function toTemplateVars(vars: Record<string, EmailVariable> | undefined): TemplateVars {
  const out: TemplateVars = {}
  if (!vars) return out
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined || value === null) continue
    out[key] = value
  }
  return out
}

/**
 * Envoie un email via le template versionné s'il existe, sinon en message `custom`
 * (gabarit FETRAG autour du texte fourni). L'envoi crée toujours une `EmailDelivery` rejouable.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const known = input.template !== 'custom' && Boolean(getTemplate(input.template))
  if (known) {
    return platformSendEmail({ to: input.to, template: input.template, variables: toTemplateVars(input.variables), userId: input.userId })
  }
  return platformSendEmail({
    to: input.to,
    template: 'custom',
    subject: input.subject,
    html: input.html,
    text: input.text ?? plainTextEmail([input.subject]),
    userId: input.userId,
  })
}

/** Notification interne (IN_APP) à un utilisateur, email optionnel selon ses préférences. */
export async function notifyUser(userId: string, input: NotifyInput): Promise<void> {
  await platformNotifyUser(userId, { title: input.title, body: input.body, href: input.href, category: input.category ?? 'general', email: input.email })
}

/** Notification interne à tous les titulaires actifs d'un rôle global. */
export async function notifyRole(role: RoleName, input: NotifyInput): Promise<void> {
  await platformNotifyRole(role, { title: input.title, body: input.body, href: input.href, category: input.category ?? 'general', email: input.email })
}

/** Corps texte brut d'un email personnalisé (signature institutionnelle incluse). */
export function plainTextEmail(lines: Array<string | null | undefined>): string {
  return [...lines.filter((l): l is string => typeof l === 'string'), '', 'FETRAG - Travail, Efficacité, Solidarité'].join('\n')
}

// -----------------------------------------------------------------------------
// Stockage
// -----------------------------------------------------------------------------

export interface UploadFile {
  name: string
  type: string
  size: number
  buffer: Buffer | Uint8Array
}

export interface UploadRules {
  maxMb: number
  mimeTypes: readonly string[]
}

/** Convertit une erreur de stockage (forme DomainError sans en hériter) en erreur du domaine. */
function toDomainStorageError(error: unknown): Error {
  if (isStorageError(error)) {
    if (error.code === 'VALIDATION_ERROR') return new ValidationError(error.message, error.details)
    return new PreconditionError(error.message, error.details)
  }
  return error instanceof Error ? error : new Error(String(error))
}

/** Fournisseur de stockage courant (local, Vercel Blob ou S3 selon `STORAGE_PROVIDER`). */
export function getStorage(): StorageProvider {
  try {
    return storageGetStorage()
  } catch (error) {
    throw toDomainStorageError(error)
  }
}

/** Clé de stockage unique et lisible : `dossier/aaaa/mm/<uuid>-<slug>.<ext>`. */
export function buildKey(folder: string, fileName: string): string {
  return storageBuildKey(folder, fileName)
}

/** Valide taille, type MIME et extension ; lève une `ValidationError` du domaine en cas de refus. */
export function validateUpload(file: UploadFile, rules: UploadRules): ValidatedUpload {
  try {
    return storageValidateUpload({ name: file.name, size: file.size, type: file.type }, { maxMb: rules.maxMb, mimeTypes: rules.mimeTypes })
  } catch (error) {
    throw toDomainStorageError(error)
  }
}

/** URL signée d'une clé de stockage ; null si la signature est impossible (journalisé). */
export async function trySignedUrl(key: string, expiresInSeconds = 900): Promise<string | null> {
  try {
    return await getStorage().getSignedUrl(key, { expiresInSeconds })
  } catch (error) {
    console.error('[cms] signature d’URL impossible', key, error)
    return null
  }
}

/** Détermine si une valeur est une clé de stockage (et non une URL absolue ou un chemin public). */
export function isStorageKey(value: string | null | undefined): value is string {
  if (!value) return false
  const v = value.trim()
  if (v.length === 0) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return false
  if (v.startsWith('/')) return false
  return true
}
