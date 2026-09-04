/**
 * Erreurs du package storage.
 * `@fetrag/storage` ne dépend pas de `@fetrag/domain` (sens des dépendances, BUILD_BRIEF §0bis) :
 * les erreurs reproduisent donc la forme de `DomainError` (`code`, `status`, `details`, `toJSON`)
 * afin d'être converties en réponse API uniforme par la couche API.
 */

export type StorageErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN' | 'PRECONDITION_FAILED' | 'INTERNAL_ERROR'

const statusByCode: Record<StorageErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PRECONDITION_FAILED: 412,
  INTERNAL_ERROR: 500,
}

export class StorageError extends Error {
  readonly code: StorageErrorCode
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(code: StorageErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'StorageError'
    this.code = code
    this.status = statusByCode[code]
    this.details = details
  }

  toJSON() {
    return { error: { code: this.code, message: this.message, details: this.details } }
  }
}

/** Fichier refusé par `validateUpload` (taille, type MIME, extension). */
export class StorageValidationError extends StorageError {
  constructor(message = 'Fichier invalide', details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

/** Fournisseur non configuré (variable d'environnement manquante). */
export class StorageConfigurationError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('PRECONDITION_FAILED', message, details)
    this.name = 'StorageConfigurationError'
  }
}

export class StorageNotFoundError extends StorageError {
  constructor(key: string) {
    super('NOT_FOUND', `Objet introuvable (${key})`, { key })
    this.name = 'StorageNotFoundError'
  }
}

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError
}
