// Actualités et communiqués : GET /articles (paginé) et GET /articles/{slug}.
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { idSchema, localeSchema, slugSchema } from '@fetrag/contracts'
import { articles } from '@fetrag/cms'
import { NotFoundError } from '@fetrag/domain'
import { errorResponses, jsonContent, paginatedSchema, paginationQuerySchema, publicErrors } from '../lib/responses'
import { categoryRefSchema, isoDateSchema, nullableDateSchema, slugParamSchema } from '../schemas/common'

const articleListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(200).optional(),
  categorySlug: slugSchema.optional(),
  tag: z.string().trim().max(40).optional(),
  communique: z.enum(['true', 'false']).optional().openapi({ description: 'Communiqués officiels uniquement' }),
  featured: z.enum(['true', 'false']).optional(),
})

const articleCardSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().nullable(),
    coverImageUrl: z.string().nullable(),
    coverAlt: z.string().nullable(),
    isCommunique: z.boolean(),
    isFeatured: z.boolean(),
    locale: localeSchema,
    tags: z.array(z.string()),
    readingTime: z.number().int().nullable(),
    publishedAt: nullableDateSchema,
    updatedAt: isoDateSchema,
    category: categoryRefSchema.nullable(),
  })
  .openapi('ArticleCard')

const articleDetailSchema = articleCardSchema
  .extend({
    content: z.string().openapi({ description: 'HTML assaini côté serveur' }),
    author: z.object({ id: idSchema, name: z.string().nullable() }).nullable(),
    viewCount: z.number().int(),
    related: z.array(articleCardSchema),
  })
  .openapi('ArticleDetail')

const listRoute = createRoute({
  method: 'get',
  path: '/articles',
  tags: ['Contenus'],
  summary: 'Actualités et communiqués publiés',
  request: { query: articleListQuerySchema },
  responses: {
    200: jsonContent(paginatedSchema(articleCardSchema, 'ArticlePage'), 'Page d’actualités'),
    ...publicErrors(),
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/articles/{slug}',
  tags: ['Contenus'],
  summary: 'Article publié (contenu HTML assaini et articles liés)',
  request: { params: slugParamSchema },
  responses: {
    200: jsonContent(articleDetailSchema, 'Article'),
    ...errorResponses(400, 404, 429, 500),
  },
})

export const articleRoutes = createRouter()

articleRoutes.openapi(listRoute, async (c) => {
  const q = c.req.valid('query')
  const page = await articles.listPublished({
    page: q.page,
    pageSize: q.pageSize,
    q: q.q,
    categorySlug: q.categorySlug,
    tag: q.tag,
    ...(q.communique ? { communique: q.communique === 'true' } : {}),
    ...(q.featured ? { featured: q.featured === 'true' } : {}),
  })
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return c.json(page, 200)
})

articleRoutes.openapi(detailRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const article = await articles.getPublished(slug)
  if (!article) throw new NotFoundError('Article', slug)
  const related = await articles.related(article.id)
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return c.json(
    {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImageUrl: article.coverImageUrl,
      coverAlt: article.coverAlt,
      isCommunique: article.isCommunique,
      isFeatured: article.isFeatured,
      locale: article.locale,
      tags: article.tags,
      readingTime: article.readingTime,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      category: article.category,
      content: article.content,
      author: article.author ? { id: article.author.id, name: article.author.name } : null,
      viewCount: article.viewCount,
      related,
    },
    200,
  )
})
