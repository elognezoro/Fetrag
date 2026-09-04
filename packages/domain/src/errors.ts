import type { ApiErrorCode } from '@fetrag/contracts'

/** Erreur métier typée, convertible en réponse API uniforme. */
export class DomainError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(code: ApiErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.status = statusForCode(code)
    this.details = details
  }

  toJSON() {
    return { error: { code: this.code, message: this.message, details: this.details } }
  }
}

export class ValidationError extends DomainError {
  constructor(message = 'Données invalides', details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

export class UnauthenticatedError extends DomainError {
  constructor(message = 'Authentification requise') {
    super('UNAUTHENTICATED', message)
    this.name = 'UnauthenticatedError'
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Accès refusé', details?: Record<string, unknown>) {
    super('FORBIDDEN', message, details)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends DomainError {
  constructor(entity = 'Ressource', id?: string) {
    super('NOT_FOUND', id ? `${entity} introuvable (${id})` : `${entity} introuvable`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Conflit', details?: Record<string, unknown>) {
    super('CONFLICT', message, details)
    this.name = 'ConflictError'
  }
}

export class PreconditionError extends DomainError {
  constructor(message = 'Condition préalable non remplie', details?: Record<string, unknown>) {
    super('PRECONDITION_FAILED', message, details)
    this.name = 'PreconditionError'
  }
}

export class RateLimitedError extends DomainError {
  constructor(message = 'Trop de requêtes, réessayez plus tard') {
    super('RATE_LIMITED', message)
    this.name = 'RateLimitedError'
  }
}

export function statusForCode(code: ApiErrorCode): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400
    case 'UNAUTHENTICATED':
      return 401
    case 'PAYMENT_REQUIRED':
      return 402
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'CONFLICT':
      return 409
    case 'PRECONDITION_FAILED':
      return 412
    case 'IDEMPOTENCY_KEY_REQUIRED':
      return 428
    case 'RATE_LIMITED':
      return 429
    default:
      return 500
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}

/** Convertit n'importe quelle erreur en DomainError sans fuiter de détails internes. */
export function toDomainError(error: unknown): DomainError {
  if (isDomainError(error)) return error
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
    return new ConflictError('Cette valeur existe déjà')
  }
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
    return new NotFoundError()
  }
  return new DomainError('INTERNAL_ERROR', 'Une erreur interne est survenue')
}
