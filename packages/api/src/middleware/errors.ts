// Gestion uniforme des erreurs : DomainError -> statut + ApiError JSON, ZodError -> VALIDATION_ERROR,
// erreurs « forme DomainError » (ex. @fetrag/storage) -> statut porté, autres -> 500 sans fuite.
import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { apiErrorCodes, type ApiError, type ApiErrorCode } from '@fetrag/contracts'
import { isDomainError, statusForCode } from '@fetrag/domain'
import { logger as rootLogger } from '@fetrag/observability'
import type { ApiEnv } from '../env'

interface NormalizedError {
  status: number
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
  /** Erreur inattendue : journalisée avec sa pile. */
  unexpected: boolean
}

const codeSet = new Set<string>(apiErrorCodes)

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && codeSet.has(value)
}

function isZodError(error: unknown): error is ZodError {
  if (error instanceof ZodError) return true
  return Boolean(error && typeof error === 'object' && (error as { name?: string }).name === 'ZodError' && Array.isArray((error as { issues?: unknown }).issues))
}

/** Objet portant `{ code, status, message }` (DomainError d'un autre package, StorageError…). */
function isErrorLike(error: unknown): error is { code: string; status: number; message: string; details?: Record<string, unknown> } {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: unknown; status?: unknown; message?: unknown }
  return typeof e.code === 'string' && typeof e.status === 'number' && typeof e.message === 'string'
}

function isPrismaKnownError(error: unknown): error is { code: string; meta?: Record<string, unknown> } {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: unknown; clientVersion?: unknown }
  return typeof e.code === 'string' && /^P\d{4}$/.test(e.code) && typeof e.clientVersion === 'string'
}

function codeForHttpStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR'
    case 401:
      return 'UNAUTHENTICATED'
    case 402:
      return 'PAYMENT_REQUIRED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 412:
      return 'PRECONDITION_FAILED'
    case 413:
      return 'VALIDATION_ERROR'
    case 428:
      return 'IDEMPOTENCY_KEY_REQUIRED'
    case 429:
      return 'RATE_LIMITED'
    default:
      return 'INTERNAL_ERROR'
  }
}

export function zodDetails(error: ZodError): Record<string, unknown> {
  const flat = error.flatten()
  return {
    fieldErrors: flat.fieldErrors,
    formErrors: flat.formErrors,
    issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message, code: issue.code })),
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (isDomainError(error)) {
    return { status: error.status, code: error.code, message: error.message, details: error.details, unexpected: false }
  }
  if (isZodError(error)) {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Données invalides', details: zodDetails(error), unexpected: false }
  }
  if (error instanceof HTTPException) {
    const status = error.status
    const code = codeForHttpStatus(status)
    const message = status === 413 ? 'Corps de requête trop volumineux' : error.message || 'Requête refusée'
    return { status, code, message, unexpected: status >= 500 }
  }
  if (isPrismaKnownError(error)) {
    if (error.code === 'P2002') return { status: 409, code: 'CONFLICT', message: 'Cette valeur existe déjà', unexpected: false }
    if (error.code === 'P2025') return { status: 404, code: 'NOT_FOUND', message: 'Ressource introuvable', unexpected: false }
    return { status: 500, code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue', unexpected: true }
  }
  if (isErrorLike(error)) {
    const code = isApiErrorCode(error.code) ? error.code : codeForHttpStatus(error.status)
    const status = error.status >= 400 && error.status < 600 ? error.status : statusForCode(code)
    return { status, code, message: status >= 500 ? 'Une erreur interne est survenue' : error.message, details: status >= 500 ? undefined : error.details, unexpected: status >= 500 }
  }
  if (error instanceof SyntaxError && /JSON/i.test(error.message)) {
    return { status: 400, code: 'VALIDATION_ERROR', message: 'Corps JSON malformé', unexpected: false }
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue', unexpected: true }
}

export function toApiError(normalized: NormalizedError, correlationId: string | undefined): ApiError {
  return {
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {}),
      ...(correlationId ? { correlationId } : {}),
    },
  }
}

/** Construit la réponse d'erreur JSON pour un contexte donné (utilisable dans un hook de validation). */
export function errorResponse(c: Context<ApiEnv>, error: unknown): Response {
  const normalized = normalizeError(error)
  const correlationId = c.get('correlationId')
  const log = c.get('logger') ?? rootLogger
  if (normalized.unexpected) {
    log.error('api.unexpected_error', {
      correlationId,
      path: c.req.path,
      method: c.req.method,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    })
  } else if (normalized.status >= 400) {
    log.debug('api.error', { correlationId, status: normalized.status, code: normalized.code, message: normalized.message })
  }
  if (correlationId) c.header('x-correlation-id', correlationId)
  c.header('Cache-Control', 'no-store')
  return c.json(toApiError(normalized, correlationId), normalized.status as 400)
}

export const onError: ErrorHandler<ApiEnv> = (error, c) => errorResponse(c, error)

export const notFound: NotFoundHandler<ApiEnv> = (c) => {
  const correlationId = c.get('correlationId')
  if (correlationId) c.header('x-correlation-id', correlationId)
  return c.json(
    toApiError({ status: 404, code: 'NOT_FOUND', message: `Route introuvable : ${c.req.method} ${c.req.path}`, unexpected: false }, correlationId),
    404,
  )
}
