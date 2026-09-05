// Services aux membres et organisations : GET /services et GET /services/{slug}.
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { idSchema } from '@fetrag/contracts'
import { services } from '@fetrag/cms'
import { NotFoundError } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { jsonValueSchema, toJsonValue } from '../lib/json'
import { errorResponses, jsonContent, publicErrors } from '../lib/responses'
import { categoryRefSchema, offerSummarySchema, slugParamSchema } from '../schemas/common'

const serviceCardSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    name: z.string(),
    summary: z.string().nullable(),
    icon: z.string().nullable().openapi({ description: 'Nom d’icône lucide-react' }),
    isPaid: z.boolean(),
    priceAmount: z.number().int().nullable(),
    currency: z.string(),
    requiresAccount: z.boolean(),
    slaDays: z.number().int().nullable(),
    position: z.number().int(),
    category: categoryRefSchema.nullable(),
    offers: z.array(offerSummarySchema),
  })
  .openapi('ServiceCard')

const serviceDetailSchema = serviceCardSchema
  .extend({
    description: z.string().openapi({ description: 'HTML assaini' }),
    conditions: z.string().nullable(),
    /** Champs du formulaire de demande (schéma défini par le CMS). */
    formSchema: jsonValueSchema.nullable(),
    requestCount: z.number().int(),
  })
  .openapi('ServiceDetail')

const listRoute = createRoute({
  method: 'get',
  path: '/services',
  tags: ['Contenus'],
  summary: 'Services publiés (assistance juridique, formation, accompagnement…)',
  responses: {
    200: jsonContent(z.object({ items: z.array(serviceCardSchema) }), 'Services ordonnés par position'),
    ...publicErrors(),
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/services/{slug}',
  tags: ['Contenus'],
  summary: 'Détail d’un service publié',
  request: { params: slugParamSchema },
  responses: {
    200: jsonContent(serviceDetailSchema, 'Service'),
    ...errorResponses(400, 404, 429, 500),
  },
})

export const serviceRoutes = new OpenAPIHono<ApiEnv>()

serviceRoutes.openapi(listRoute, async (c) => {
  const items = await services.listPublished()
  c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=600')
  return c.json({ items }, 200)
})

serviceRoutes.openapi(detailRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const service = await services.getPublished(slug)
  if (!service) throw new NotFoundError('Service', slug)
  c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=600')
  return c.json(
    {
      id: service.id,
      slug: service.slug,
      name: service.name,
      summary: service.summary,
      icon: service.icon,
      isPaid: service.isPaid,
      priceAmount: service.priceAmount,
      currency: service.currency,
      requiresAccount: service.requiresAccount,
      slaDays: service.slaDays,
      position: service.position,
      category: service.category,
      offers: service.offers,
      description: service.description,
      conditions: service.conditions,
      formSchema: service.formSchema === null ? null : toJsonValue(service.formSchema),
      requestCount: service._count.requests,
    },
    200,
  )
})
