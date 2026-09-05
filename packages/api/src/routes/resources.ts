// Centre de ressources : GET /resources (publiées, droit d'accès selon le visiteur) et GET /resources/{slug}.
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { accessLevelSchema, idSchema, localeSchema, resourceKinds, slugSchema } from '@fetrag/contracts'
import { resources } from '@fetrag/cms'
import { NotFoundError } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { errorResponses, jsonContent, paginatedSchema, paginationQuerySchema, publicErrors } from '../lib/responses'
import { categoryRefSchema, isoDateSchema, nullableDateSchema, offerSummarySchema, slugParamSchema } from '../schemas/common'

const resourceListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(200).optional(),
  kind: z.enum(resourceKinds).optional(),
  categorySlug: slugSchema.optional(),
  accessLevel: accessLevelSchema.optional(),
})

const publicResourceSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable(),
    kind: z.enum(resourceKinds),
    accessLevel: accessLevelSchema,
    organizationId: z.string().nullable(),
    fileName: z.string().nullable(),
    fileSize: z.number().int().nullable(),
    mimeType: z.string().nullable(),
    previewUrl: z.string().nullable(),
    language: localeSchema,
    source: z.string().nullable(),
    authorName: z.string().nullable(),
    publishedOn: nullableDateSchema,
    keywords: z.array(z.string()),
    downloadCount: z.number().int(),
    isPremium: z.boolean(),
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
    category: categoryRefSchema.nullable(),
    organization: z.object({ id: idSchema, slug: z.string(), name: z.string(), acronym: z.string().nullable() }).nullable(),
    /** Le visiteur courant peut-il télécharger la ressource ? */
    accessible: z.boolean(),
    /** Lien de téléchargement (URL signée temporaire pour les fichiers privés), null si inaccessible. */
    href: z.string().nullable(),
    hasFile: z.boolean(),
    isExternal: z.boolean(),
    offer: offerSummarySchema.nullable(),
  })
  .openapi('PublicResource')

const listRoute = createRoute({
  method: 'get',
  path: '/resources',
  tags: ['Contenus'],
  summary: 'Ressources documentaires publiées',
  description: 'Sans authentification, seules les ressources publiques sont listées. Un membre connecté voit en plus les ressources MEMBER, celles de son organisation et les ressources PREMIUM acquises.',
  request: { query: resourceListQuerySchema },
  responses: {
    200: jsonContent(paginatedSchema(publicResourceSchema, 'ResourcePage'), 'Page de ressources'),
    ...publicErrors(),
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/resources/{slug}',
  tags: ['Contenus'],
  summary: 'Détail d’une ressource publiée',
  request: { params: slugParamSchema },
  responses: {
    200: jsonContent(publicResourceSchema, 'Ressource'),
    ...errorResponses(400, 404, 429, 500),
  },
})

export const resourceRoutes = new OpenAPIHono<ApiEnv>()

resourceRoutes.openapi(listRoute, async (c) => {
  const q = c.req.valid('query')
  const principal = c.get('principal')
  const page = await resources.listPublished({ page: q.page, pageSize: q.pageSize, q: q.q, kind: q.kind, categorySlug: q.categorySlug, accessLevel: q.accessLevel }, principal)
  c.header('Cache-Control', principal ? 'private, no-store' : 'public, max-age=60')
  return c.json(page, 200)
})

resourceRoutes.openapi(detailRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const principal = c.get('principal')
  const resource = await resources.getPublished(slug, principal)
  if (!resource) throw new NotFoundError('Ressource', slug)
  c.header('Cache-Control', principal ? 'private, no-store' : 'public, max-age=60')
  return c.json(resource, 200)
})
