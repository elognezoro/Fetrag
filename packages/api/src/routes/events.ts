// Agenda public : GET /events (à venir ou passés) et GET /events/{slug}.
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { eventKinds, idSchema, sessionModeSchema } from '@fetrag/contracts'
import { events } from '@fetrag/cms'
import { NotFoundError } from '@fetrag/domain'
import { errorResponses, jsonContent, paginatedSchema, paginationQuerySchema, publicErrors } from '../lib/responses'
import { categoryRefSchema, isoDateSchema, nullableDateSchema, offerSummarySchema, slugParamSchema } from '../schemas/common'

const eventListQuerySchema = paginationQuerySchema.extend({
  scope: z.enum(['upcoming', 'past']).default('upcoming').openapi({ description: '`upcoming` : à venir (limité à pageSize), `past` : passés paginés' }),
  kind: z.enum(eventKinds).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .openapi({ description: 'Événements mis en avant uniquement (scope upcoming)' }),
})

const eventCardSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable(),
    kind: z.enum(eventKinds),
    coverImageUrl: z.string().nullable(),
    startsAt: isoDateSchema,
    endsAt: nullableDateSchema,
    location: z.string().nullable(),
    city: z.string().nullable(),
    mode: sessionModeSchema,
    speakerName: z.string().nullable(),
    speakerTitle: z.string().nullable(),
    speakerImageUrl: z.string().nullable(),
    capacity: z.number().int().nullable(),
    isFree: z.boolean(),
    priceAmount: z.number().int().nullable(),
    currency: z.string(),
    issuesCertificate: z.boolean(),
    isFeatured: z.boolean(),
    publishedAt: nullableDateSchema,
    updatedAt: isoDateSchema,
    category: categoryRefSchema.nullable(),
    registeredCount: z.number().int(),
    remainingSeats: z.number().int().nullable(),
    isFull: z.boolean(),
    isPast: z.boolean(),
  })
  .openapi('EventCard')

const eventDetailSchema = eventCardSchema
  .extend({
    description: z.string().openapi({ description: 'HTML assaini' }),
    speakerBio: z.string().nullable(),
    replayUrl: z.string().nullable(),
    /** Lien de visioconférence : exposé uniquement aux inscrits confirmés. */
    meetingUrl: z.string().nullable(),
    waitingCount: z.number().int(),
    viewerRegistration: z.enum(['REGISTERED', 'WAITLISTED', 'CANCELLED', 'ATTENDED']).nullable(),
    offers: z.array(offerSummarySchema),
  })
  .openapi('EventDetail')

const listRoute = createRoute({
  method: 'get',
  path: '/events',
  tags: ['Contenus'],
  summary: 'Agenda : événements, Master Class, webinaires',
  request: { query: eventListQuerySchema },
  responses: {
    200: jsonContent(paginatedSchema(eventCardSchema, 'EventPage'), 'Événements publiés'),
    ...publicErrors(),
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/events/{slug}',
  tags: ['Contenus'],
  summary: 'Détail d’un événement publié',
  request: { params: slugParamSchema },
  responses: {
    200: jsonContent(eventDetailSchema, 'Événement'),
    ...errorResponses(400, 404, 429, 500),
  },
})

export const eventRoutes = createRouter()

eventRoutes.openapi(listRoute, async (c) => {
  const q = c.req.valid('query')
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  if (q.scope === 'past') {
    const page = await events.listPast({ page: q.page, pageSize: q.pageSize, kind: q.kind })
    return c.json(page, 200)
  }
  const items = await events.listUpcoming({ limit: q.pageSize, kind: q.kind, ...(q.featured ? { featured: q.featured === 'true' } : {}) })
  return c.json({ items, page: 1, pageSize: q.pageSize, total: items.length, totalPages: 1 }, 200)
})

eventRoutes.openapi(detailRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const principal = c.get('principal')
  const event = await events.getPublished(slug, principal ?? undefined)
  if (!event) throw new NotFoundError('Événement', slug)
  const registered = event.viewerRegistration === 'REGISTERED' || event.viewerRegistration === 'ATTENDED'
  const { seo: _seo, ...rest } = event
  c.header('Cache-Control', principal ? 'private, no-store' : 'public, max-age=60')
  return c.json({ ...rest, meetingUrl: registered ? event.meetingUrl : null }, 200)
})
