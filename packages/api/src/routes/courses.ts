// Catalogue public de formation : GET /courses (paginé, filtres) et GET /courses/{slug} (fiche complète).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import { activityTypeSchema, courseLevels, courseModalitySchema, enrollmentPolicySchema, idSchema, localeSchema, pillarSchema, publicCourseSchema, sessionModeSchema } from '@fetrag/contracts'
import { catalog } from '@fetrag/lms-core'
import { jsonValueSchema, toJsonValue } from '../lib/json'
import { errorResponses, jsonContent, paginatedSchema, paginationQuerySchema, publicErrors } from '../lib/responses'
import { categoryRefSchema, nullableDateSchema, slugParamSchema } from '../schemas/common'

// -----------------------------------------------------------------------------
// Schémas
// -----------------------------------------------------------------------------

const courseListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(200).optional().openapi({ description: 'Recherche plein texte (titre, résumé, code)' }),
  pillar: pillarSchema.optional().openapi({ description: 'Pilier du triptyque fondateur' }),
  modality: courseModalitySchema.optional(),
  level: z.enum(courseLevels).optional(),
  categoryId: idSchema.optional(),
})

const courseSummarySchema = publicCourseSchema
  .extend({
    memberPriceAmount: z.number().int().nullable(),
    category: categoryRefSchema.nullable(),
    enrollmentCount: z.number().int(),
    nextCohort: z
      .object({ id: idSchema, code: z.string(), name: z.string(), startsAt: nullableDateSchema, mode: sessionModeSchema })
      .nullable(),
    audience: z.string().nullable(),
    isFeatured: z.boolean(),
  })
  .openapi('CourseSummary')

const activityPreviewSchema = z.object({
  id: idSchema,
  type: activityTypeSchema,
  title: z.string(),
  position: z.number().int(),
  durationMinutes: z.number().int().nullable(),
  isRequired: z.boolean(),
  /** Contenu exposé uniquement pour les leçons en aperçu public. */
  preview: jsonValueSchema.nullable(),
})

const lessonPreviewSchema = z.object({
  id: idSchema,
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  position: z.number().int(),
  durationMinutes: z.number().int().nullable(),
  isPreview: z.boolean(),
  activities: z.array(activityPreviewSchema),
})

const modulePreviewSchema = z.object({
  id: idSchema,
  title: z.string(),
  summary: z.string().nullable(),
  position: z.number().int(),
  durationMinutes: z.number().int().nullable(),
  isOptional: z.boolean(),
  lessons: z.array(lessonPreviewSchema),
})

const courseDetailSchema = publicCourseSchema
  .extend({
    memberPriceAmount: z.number().int().nullable(),
    description: z.string(),
    prerequisitesText: z.string().nullable(),
    audience: z.string().nullable(),
    language: localeSchema,
    enrollmentPolicy: enrollmentPolicySchema,
    capacity: z.number().int().nullable(),
    isFeatured: z.boolean(),
    category: categoryRefSchema.nullable(),
    version: z.object({ id: idSchema, number: z.number().int(), label: z.string().nullable(), publishedAt: nullableDateSchema }),
    modules: z.array(modulePreviewSchema),
    counts: z.object({ modules: z.number().int(), lessons: z.number().int(), activities: z.number().int(), enrollments: z.number().int() }),
    trainers: z.array(
      z.object({
        id: idSchema,
        name: z.string().nullable(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        image: z.string().nullable(),
        jobTitle: z.string().nullable(),
        employer: z.string().nullable(),
        isLead: z.boolean(),
      }),
    ),
    prerequisites: z.array(z.object({ id: idSchema, slug: z.string(), title: z.string(), code: z.string(), isMandatory: z.boolean() })),
    upcomingCohorts: z.array(
      z.object({
        id: idSchema,
        code: z.string(),
        name: z.string(),
        mode: sessionModeSchema,
        startsAt: nullableDateSchema,
        endsAt: nullableDateSchema,
        location: z.string().nullable(),
        capacity: z.number().int().nullable(),
        memberCount: z.number().int(),
        sessionCount: z.number().int(),
        seatsLeft: z.number().int().nullable(),
      }),
    ),
    offers: z.array(z.object({ id: idSchema, name: z.string(), tier: z.enum(['STANDARD', 'MEMBER', 'ORGANIZATION', 'GROUP']), amount: z.number().int(), currency: z.string() })),
  })
  .openapi('CourseDetail')

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

const listRoute = createRoute({
  method: 'get',
  path: '/courses',
  tags: ['Formations'],
  summary: 'Catalogue des formations publiées',
  description: 'Les 10 modules du programme 2026 et les autres formations publiées, paginés et filtrables par pilier, modalité, niveau et texte.',
  request: { query: courseListQuerySchema },
  responses: {
    200: jsonContent(paginatedSchema(courseSummarySchema, 'CoursePage'), 'Page du catalogue'),
    ...publicErrors(),
  },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/courses/{slug}',
  tags: ['Formations'],
  summary: 'Fiche d’une formation',
  description: 'Version courante (modules, leçons, activités en aperçu), formateurs, prochaines cohortes ouvertes, prérequis et offres tarifaires.',
  request: { params: slugParamSchema },
  responses: {
    200: jsonContent(courseDetailSchema, 'Fiche de formation'),
    ...errorResponses(400, 404, 429, 500),
  },
})

export const courseRoutes = createRouter()

courseRoutes.openapi(listRoute, async (c) => {
  const query = c.req.valid('query')
  const page = await catalog.listPublished(query)
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return c.json(page, 200)
})

courseRoutes.openapi(detailRoute, async (c) => {
  const { slug } = c.req.valid('param')
  const course = await catalog.getPublished(slug)
  const modules = course.modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({
      ...lesson,
      activities: lesson.activities.map((activity) => ({ ...activity, preview: activity.preview === null ? null : toJsonValue(activity.preview) })),
    })),
  }))
  c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return c.json({ ...course, modules }, 200)
})
