import { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiEnv } from '../env'
import { errorResponse } from '../middleware/errors'

/**
 * Fabrique de routeur : chaque module de routes doit l'utiliser pour hériter du hook de validation
 * (ZodError -> réponse `VALIDATION_ERROR` uniforme). Un `new OpenAPIHono()` nu renverrait le format
 * brut de zod-openapi sur les entrées invalides.
 */
export function createRouter(): OpenAPIHono<ApiEnv> {
  return new OpenAPIHono<ApiEnv>({
    defaultHook: (result, c) => {
      if (!result.success) return errorResponse(c, result.error)
      return undefined
    },
  })
}
