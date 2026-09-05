// Aides à la description OpenAPI : contenus JSON, réponses d'erreur uniformes, pagination.
import { z } from '@hono/zod-openapi'
import { apiErrorSchema, paginated } from '@fetrag/contracts'

export const apiErrorResponseSchema = apiErrorSchema.openapi('ApiError', {
  example: {
    error: {
      code: 'NOT_FOUND',
      message: 'Formation introuvable (droit-du-travail)',
      correlationId: '4b3c2a1e-6f7d-4e8a-9b0c-1d2e3f4a5b6c',
    },
  },
})

export function jsonContent<T extends z.ZodTypeAny>(schema: T, description: string) {
  return { description, content: { 'application/json': { schema } } } as const
}

const errorDescriptions = {
  400: 'Données invalides (VALIDATION_ERROR)',
  401: 'Authentification requise (UNAUTHENTICATED)',
  402: 'Paiement requis (PAYMENT_REQUIRED)',
  403: 'Permission ou portée insuffisante (FORBIDDEN)',
  404: 'Ressource introuvable (NOT_FOUND)',
  409: 'Conflit (CONFLICT)',
  412: 'Condition préalable non remplie (PRECONDITION_FAILED)',
  428: 'En-tête Idempotency-Key obligatoire (IDEMPOTENCY_KEY_REQUIRED)',
  429: 'Trop de requêtes (RATE_LIMITED)',
  500: 'Erreur interne (INTERNAL_ERROR)',
  503: 'Service indisponible',
} as const

export type ErrorStatus = keyof typeof errorDescriptions

/** Réponses d'erreur documentées pour une route (le format est produit par le gestionnaire global). */
export function errorResponses<S extends ErrorStatus>(...statuses: S[]) {
  const out = {} as Record<S, ReturnType<typeof jsonContent<typeof apiErrorResponseSchema>>>
  for (const status of statuses) out[status] = jsonContent(apiErrorResponseSchema, errorDescriptions[status])
  return out
}

/** Erreurs communes à toute route publique. */
export const publicErrors = () => errorResponses(400, 429, 500)
/** Erreurs communes à toute route authentifiée. */
export const protectedErrors = () => errorResponses(400, 401, 403, 404, 429, 500)

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
  pageSize: z.coerce.number().int().min(1).max(50).default(12).openapi({ example: 12 }),
})

export function paginatedSchema<T extends z.ZodTypeAny>(item: T, name?: string) {
  const schema = paginated(item)
  return name ? schema.openapi(name) : schema
}

export const okSchema = z.object({ ok: z.literal(true) })
