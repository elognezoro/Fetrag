// Recherche transverse : GET /search?q= (contenus publiés uniquement).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { MAX_QUERY_LENGTH, searchPublic, searchTypes } from '@fetrag/search'
import { jsonContent, publicErrors } from '../lib/responses'
import { nullableDateSchema } from '../schemas/common'

const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Deux caractères au minimum').max(MAX_QUERY_LENGTH).openapi({ example: 'négociation collective' }),
  types: z
    .string()
    .optional()
    .openapi({ description: 'Types séparés par des virgules : article, page, resource, course, service, event', example: 'course,article' }),
  limit: z.coerce.number().int().min(1).max(20).default(5).openapi({ description: 'Résultats par type' }),
})

const searchItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  href: z.string().openapi({ description: 'Chemin relatif sur fetrag.ga' }),
  badge: z.string().optional(),
  date: nullableDateSchema.optional(),
  score: z.number(),
})

const searchResultSchema = z
  .object({
    query: z.string(),
    total: z.number().int(),
    groups: z.array(
      z.object({
        type: z.enum(searchTypes),
        label: z.string(),
        total: z.number().int(),
        items: z.array(searchItemSchema),
      }),
    ),
  })
  .openapi('SearchResult')

const searchRoute = createRoute({
  method: 'get',
  path: '/search',
  tags: ['Recherche'],
  summary: 'Recherche plein texte (français, désaccentuée) sur les contenus publiés',
  request: { query: searchQuerySchema },
  responses: {
    200: jsonContent(searchResultSchema, 'Résultats groupés par type'),
    ...publicErrors(),
  },
})

export const searchRoutes = createRouter()

searchRoutes.openapi(searchRoute, async (c) => {
  const q = c.req.valid('query')
  const requested = (q.types ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t): t is (typeof searchTypes)[number] => (searchTypes as readonly string[]).includes(t))
  const result = await searchPublic(q.q, { types: requested.length ? requested : undefined, limit: q.limit })
  c.header('Cache-Control', 'public, max-age=30')
  return c.json(result, 200)
})
