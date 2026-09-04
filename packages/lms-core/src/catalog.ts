import { courseLevels, courseModalitySchema, idSchema, pillarSchema, type PublicCourse } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { NotFoundError, paginationArgs, toPaginated } from '@fetrag/domain'
import { z } from 'zod'
import { readActivityContent } from './schemas'

/** Filtres du catalogue public. */
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  pillar: pillarSchema.optional(),
  modality: courseModalitySchema.optional(),
  level: z.enum(courseLevels).optional(),
  categoryId: idSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})
export type CatalogQuery = z.input<typeof catalogQuerySchema>

type CourseLike = {
  id: string
  slug: string
  code: string
  title: string
  subtitle: string | null
  summary: string | null
  pillar: string | null
  modality: PublicCourse['modality']
  level: PublicCourse['level']
  durationHours: number
  isFree: boolean
  priceAmount: number | null
  currency: string
  coverImageUrl: string | null
  objectives: string[]
  publishedAt: Date | null
}

/** DTO public d'un cours (synchronisation vitrine <- LMS). */
export function toPublicCourse(course: CourseLike): PublicCourse {
  const pillar = pillarSchema.safeParse(course.pillar)
  return {
    id: course.id,
    slug: course.slug,
    code: course.code,
    title: course.title,
    subtitle: course.subtitle,
    summary: course.summary,
    pillar: pillar.success ? pillar.data : null,
    modality: course.modality,
    level: course.level,
    durationHours: course.durationHours,
    isFree: course.isFree,
    priceAmount: course.priceAmount,
    currency: course.currency,
    coverImageUrl: course.coverImageUrl,
    objectives: course.objectives,
    publishedAt: course.publishedAt,
  }
}

const publishedWhere: Prisma.CourseWhereInput = { status: 'PUBLISHED', currentVersionId: { not: null } }

/** Catalogue public paginé et filtrable (LMS-01). */
export async function listPublished(query: CatalogQuery = {}) {
  const q = catalogQuerySchema.parse(query)
  const where: Prisma.CourseWhereInput = {
    ...publishedWhere,
    ...(q.pillar ? { pillar: q.pillar } : {}),
    ...(q.modality ? { modality: q.modality } : {}),
    ...(q.level ? { level: q.level } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.q
      ? {
          OR: [
            { title: { contains: q.q, mode: 'insensitive' } },
            { summary: { contains: q.q, mode: 'insensitive' } },
            { code: { contains: q.q, mode: 'insensitive' } },
            { objectives: { has: q.q } },
          ],
        }
      : {}),
  }
  const [rows, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }],
      ...paginationArgs(q),
      include: {
        category: { select: { id: true, slug: true, name: true, color: true } },
        _count: { select: { enrollments: { where: { status: { in: ['ACTIVE', 'COMPLETED'] } } } } },
        cohorts: {
          where: { status: { in: ['PLANNED', 'OPEN'] }, isPrivate: false, startsAt: { gte: new Date() } },
          orderBy: { startsAt: 'asc' },
          take: 1,
          select: { id: true, code: true, name: true, startsAt: true, mode: true },
        },
      },
    }),
    prisma.course.count({ where }),
  ])
  const items = rows.map((course) => ({
    ...toPublicCourse(course),
    memberPriceAmount: course.memberPriceAmount,
    category: course.category,
    enrollmentCount: course._count.enrollments,
    nextCohort: course.cohorts[0] ?? null,
    audience: course.audience,
    isFeatured: course.isFeatured,
  }))
  return toPaginated(items, total, q)
}

/**
 * Fiche publique complète : version courante (modules, leçons, activités en aperçu),
 * formateurs, prochaines cohortes ouvertes, prérequis.
 */
export async function getPublished(slug: string) {
  const course = await prisma.course.findFirst({
    where: { slug, ...publishedWhere },
    include: {
      category: { select: { id: true, slug: true, name: true, color: true } },
      currentVersion: {
        include: {
          modules: {
            orderBy: { position: 'asc' },
            include: {
              lessons: {
                orderBy: { position: 'asc' },
                include: {
                  activities: {
                    orderBy: { position: 'asc' },
                    select: { id: true, type: true, title: true, position: true, durationMinutes: true, isRequired: true, content: true },
                  },
                },
              },
            },
          },
        },
      },
      trainers: {
        orderBy: { isLead: 'desc' },
        include: { user: { select: { id: true, name: true, firstName: true, lastName: true, image: true, jobTitle: true, employer: true } } },
      },
      prerequisites: { include: { prerequisiteCourse: { select: { id: true, slug: true, title: true, code: true, status: true } } } },
      cohorts: {
        where: { status: { in: ['PLANNED', 'OPEN'] }, isPrivate: false, OR: [{ startsAt: null }, { startsAt: { gte: new Date() } }] },
        orderBy: { startsAt: 'asc' },
        take: 5,
        select: {
          id: true,
          code: true,
          name: true,
          mode: true,
          startsAt: true,
          endsAt: true,
          location: true,
          capacity: true,
          _count: { select: { members: true, sessions: true } },
        },
      },
      offers: { where: { isActive: true, kind: 'COURSE' }, orderBy: { amount: 'asc' } },
      _count: { select: { enrollments: { where: { status: { in: ['ACTIVE', 'COMPLETED'] } } } } },
    },
  })
  if (!course || !course.currentVersion) throw new NotFoundError('Formation', slug)

  const version = course.currentVersion
  const modules = version.modules.map((module) => ({
    id: module.id,
    title: module.title,
    summary: module.summary,
    position: module.position,
    durationMinutes: module.durationMinutes,
    isOptional: module.isOptional,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      position: lesson.position,
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
      activities: lesson.activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        position: activity.position,
        durationMinutes: activity.durationMinutes,
        isRequired: activity.isRequired,
        /** Contenu exposé uniquement pour les leçons en aperçu public. */
        preview: lesson.isPreview ? readActivityContent(activity.type, activity.content) : null,
      })),
    })),
  }))

  const activityCount = modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.activities.length, 0), 0)
  const lessonCount = modules.reduce((n, m) => n + m.lessons.length, 0)

  return {
    ...toPublicCourse(course),
    memberPriceAmount: course.memberPriceAmount,
    description: course.description,
    prerequisitesText: course.prerequisitesText,
    audience: course.audience,
    language: course.language,
    enrollmentPolicy: course.enrollmentPolicy,
    capacity: course.capacity,
    isFeatured: course.isFeatured,
    category: course.category,
    version: { id: version.id, number: version.version, label: version.label, publishedAt: version.publishedAt },
    modules,
    counts: { modules: modules.length, lessons: lessonCount, activities: activityCount, enrollments: course._count.enrollments },
    trainers: course.trainers.map((t) => ({ ...t.user, isLead: t.isLead })),
    prerequisites: course.prerequisites.map((p) => ({ ...p.prerequisiteCourse, isMandatory: p.isMandatory })),
    upcomingCohorts: course.cohorts.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      mode: c.mode,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      location: c.location,
      capacity: c.capacity,
      memberCount: c._count.members,
      sessionCount: c._count.sessions,
      seatsLeft: c.capacity === null ? null : Math.max(0, c.capacity - c._count.members),
    })),
    offers: course.offers.map((o) => ({ id: o.id, name: o.name, tier: o.tier, amount: o.amount, currency: o.currency })),
  }
}

/** Formations mises en avant sur la vitrine et l'accueil LMS. */
export async function listFeatured(limit = 6) {
  const rows = await prisma.course.findMany({
    where: { ...publishedWhere, isFeatured: true },
    orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
    include: { category: { select: { id: true, slug: true, name: true } } },
  })
  return rows.map((course) => ({ ...toPublicCourse(course), category: course.category }))
}

/** Liste courte de tous les cours publiés (sélecteurs, sitemap). */
export async function listPublishedSlugs() {
  return prisma.course.findMany({ where: publishedWhere, select: { slug: true, updatedAt: true, title: true }, orderBy: { position: 'asc' } })
}

/** Catégories utilisées par au moins un cours publié. */
export async function listCategories() {
  return prisma.category.findMany({
    where: { courses: { some: publishedWhere } },
    orderBy: { position: 'asc' },
    select: { id: true, slug: true, name: true, color: true, _count: { select: { courses: { where: publishedWhere } } } },
  })
}
