import {
  activityTypeSchema,
  completionRuleSchema,
  completionRulesSchema,
  contentStatusSchema,
  courseLevels,
  courseModalitySchema,
  currencySchema,
  enrollmentPolicySchema,
  idSchema,
  localeSchema,
  moneySchema,
  pillarSchema,
  slugSchema,
  type ActivityTypeName,
} from '@fetrag/contracts'
import { prisma, type ActivityType, type CompletionRule, type ContentStatus, type Prisma } from '@fetrag/db'
import { audit, ConflictError, NotFoundError, paginationArgs, PreconditionError, slugify, toPaginated, uniqueSlug } from '@fetrag/domain'
import { z } from 'zod'
import { resolveActivityContext, resolveLessonCourse, resolveModuleCourse } from './internal/course-tree'
import type { Db } from './internal/db'
import { assertCan, auditContext, can, requirePrincipal } from './lib/access'
import { toJsonInput, toJsonValue } from './lib/json'
import { lowBandwidthSchema, parseActivityContent } from './schemas'
import type { Principal, RequestMeta } from './types'

// -----------------------------------------------------------------------------
// Schémas d'entrée
// -----------------------------------------------------------------------------

export const courseInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  code: z
    .string()
    .trim()
    .min(2)
    .max(24)
    .regex(/^[A-Za-z0-9-]+$/, 'Code invalide (lettres, chiffres, tirets)')
    .transform((v) => v.toUpperCase()),
  slug: slugSchema.optional(),
  subtitle: z.string().trim().max(200).nullable().optional(),
  summary: z.string().trim().max(600).nullable().optional(),
  description: z.string().max(200000).default(''),
  objectives: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  prerequisitesText: z.string().trim().max(2000).nullable().optional(),
  audience: z.string().trim().max(600).nullable().optional(),
  categoryId: idSchema.nullable().optional(),
  modality: courseModalitySchema.default('HYBRID'),
  level: z.enum(courseLevels).default('INITIATION'),
  language: localeSchema.default('fr'),
  durationHours: z.number().int().min(1).max(500).default(12),
  pillar: pillarSchema.nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur hexadécimale attendue').nullable().optional(),
  enrollmentPolicy: enrollmentPolicySchema.default('SELF'),
  isFree: z.boolean().default(true),
  priceAmount: moneySchema.nullable().optional(),
  memberPriceAmount: moneySchema.nullable().optional(),
  currency: currencySchema,
  capacity: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
  trainerIds: z.array(idSchema).max(20).optional(),
  prerequisiteCourseIds: z.array(idSchema).max(20).optional(),
})
export type CourseInput = z.input<typeof courseInputSchema>

export const courseUpdateSchema = courseInputSchema.partial()
export type CourseUpdateInput = z.input<typeof courseUpdateSchema>

export const versionInputSchema = z.object({
  label: z.string().trim().max(120).nullable().optional(),
  changelog: z.string().trim().max(5000).nullable().optional(),
  completionRules: completionRulesSchema.partial().optional(),
})
export type VersionInput = z.input<typeof versionInputSchema>

export const moduleInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(2000).nullable().optional(),
  durationMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  isOptional: z.boolean().default(false),
})
export type ModuleInput = z.input<typeof moduleInputSchema>

export const lessonInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: slugSchema.optional(),
  summary: z.string().trim().max(2000).nullable().optional(),
  durationMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  isPreview: z.boolean().default(false),
})
export type LessonInput = z.input<typeof lessonInputSchema>

export const quizInputSchema = z.object({
  description: z.string().trim().max(5000).nullable().optional(),
  timeLimitMinutes: z.number().int().min(1).max(600).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(20).default(3),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showCorrection: z.boolean().default(true),
  passScore: z.number().int().min(0).max(100).default(60),
  isSurvey: z.boolean().default(false),
})
export type QuizInput = z.input<typeof quizInputSchema>

export const assignmentInputSchema = z.object({
  description: z.string().trim().max(10000).nullable().optional(),
  allowFile: z.boolean().default(true),
  allowText: z.boolean().default(true),
  allowedMimeTypes: z.array(z.string().min(3).max(120)).max(20).optional(),
  maxFileSizeMb: z.number().int().min(1).max(100).default(10),
  dueAt: z.coerce.date().nullable().optional(),
  lateAllowed: z.boolean().default(true),
  maxScore: z.number().int().min(1).max(1000).default(20),
  rubric: z.array(z.object({ label: z.string().trim().min(1).max(200), points: z.number().int().min(0).max(1000) })).nullable().optional(),
})
export type AssignmentInput = z.input<typeof assignmentInputSchema>

export const liveSessionInputSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    speakerName: z.string().trim().max(160).nullable().optional(),
    meetingUrl: z.string().url().nullable().optional(),
    replayUrl: z.string().url().nullable().optional(),
    transcriptUrl: z.string().url().nullable().optional(),
    trainingSessionId: idSchema.nullable().optional(),
  })
  .refine((v) => v.endsAt.getTime() > v.startsAt.getTime(), { path: ['endsAt'], message: 'La fin doit être postérieure au début' })
export type LiveSessionInput = z.input<typeof liveSessionInputSchema>

export const activityInputSchema = z.object({
  type: activityTypeSchema,
  title: z.string().trim().min(2).max(200),
  instructions: z.string().trim().max(20000).nullable().optional(),
  /** Validé selon le type via activityContentSchemas. */
  content: z.unknown().optional(),
  resourceId: idSchema.nullable().optional(),
  durationMinutes: z.number().int().min(0).max(100000).nullable().optional(),
  isRequired: z.boolean().default(true),
  completionRule: completionRuleSchema.optional(),
  maxScore: z.number().int().min(0).max(1000).nullable().optional(),
  passScore: z.number().int().min(0).max(100).nullable().optional(),
  weight: z.number().int().min(1).max(100).default(1),
  lowBandwidthAlternative: lowBandwidthSchema.nullable().optional(),
  availableFrom: z.coerce.date().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  quiz: quizInputSchema.partial().optional(),
  assignment: assignmentInputSchema.partial().optional(),
})
export type ActivityInput = z.input<typeof activityInputSchema>

export const activityUpdateSchema = activityInputSchema.omit({ type: true }).partial()
export type ActivityUpdateInput = z.input<typeof activityUpdateSchema>

export const reorderSchema = z.object({ ids: z.array(idSchema).min(1).max(500) })

export const trainerAssignmentSchema = z.array(z.object({ userId: idSchema, isLead: z.boolean().default(false) })).max(20)
export const prerequisiteAssignmentSchema = z.array(z.object({ prerequisiteCourseId: idSchema, isMandatory: z.boolean().default(true) })).max(20)

export const courseListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: contentStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

/** Règle d'achèvement par défaut selon le type d'activité. */
export function defaultCompletionRule(type: ActivityTypeName): CompletionRule {
  switch (type) {
    case 'QUIZ':
      return 'PASS_SCORE'
    case 'SURVEY':
    case 'ASSIGNMENT':
      return 'SUBMIT'
    case 'LIVE_SESSION':
      return 'ATTEND'
    case 'VIDEO':
    case 'AUDIO':
      return 'TIME_SPENT'
    default:
      return 'VIEW'
  }
}

// -----------------------------------------------------------------------------
// Helpers d'autorisation et d'éditabilité
// -----------------------------------------------------------------------------

async function loadCourseOrThrow(db: Db, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) throw new NotFoundError('Cours', courseId)
  return course
}

function assertAuthor(principal: Principal, courseId: string): Principal {
  return assertCan(principal, 'course.author', { courseId }, "Vous n'êtes pas autorisé à modifier ce cours")
}

/**
 * Une version publiée ou déjà suivie (inscriptions / cohortes) est figée :
 * la modifier exige de créer une nouvelle version (duplicateVersion).
 */
export async function assertVersionEditable(db: Db, courseVersionId: string) {
  const version = await db.courseVersion.findUnique({
    where: { id: courseVersionId },
    include: { _count: { select: { enrollments: true, cohorts: true } } },
  })
  if (!version) throw new NotFoundError('Version de cours', courseVersionId)
  if (version.isPublished || version._count.enrollments > 0 || version._count.cohorts > 0) {
    throw new PreconditionError('Cette version est publiée ou déjà suivie : créez une nouvelle version pour la modifier', {
      courseVersionId,
      isPublished: version.isPublished,
      enrollments: version._count.enrollments,
      cohorts: version._count.cohorts,
    })
  }
  return version
}

/** Version modifiable la plus récente du cours (ou 412 s'il faut en créer une). */
export async function resolveEditableVersion(courseId: string) {
  const versions = await prisma.courseVersion.findMany({
    where: { courseId },
    orderBy: { version: 'desc' },
    include: { _count: { select: { enrollments: true, cohorts: true } } },
  })
  const editable = versions.find((v) => !v.isPublished && v._count.enrollments === 0 && v._count.cohorts === 0)
  if (!editable) {
    throw new PreconditionError('Aucune version modifiable : dupliquez la version courante pour continuer', { courseId })
  }
  return editable
}

// -----------------------------------------------------------------------------
// Cours
// -----------------------------------------------------------------------------

export async function listCourses(principal: Principal, query: z.input<typeof courseListQuerySchema> = {}) {
  assertCan(principal, 'course.author')
  const q = courseListQuerySchema.parse(query)
  const where: Prisma.CourseWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.q ? { OR: [{ title: { contains: q.q, mode: 'insensitive' } }, { code: { contains: q.q, mode: 'insensitive' } }] } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
      ...paginationArgs(q),
      include: {
        category: { select: { id: true, name: true } },
        currentVersion: { select: { id: true, version: true, publishedAt: true } },
        _count: { select: { versions: true, enrollments: true, cohorts: true } },
      },
    }),
    prisma.course.count({ where }),
  ])
  return toPaginated(items, total, q)
}

const versionTreeInclude = {
  modules: {
    orderBy: { position: 'asc' as const },
    include: {
      lessons: {
        orderBy: { position: 'asc' as const },
        include: {
          activities: {
            orderBy: { position: 'asc' as const },
            include: {
              quiz: { include: { questions: { orderBy: { position: 'asc' as const }, include: { question: { include: { options: { orderBy: { position: 'asc' as const } } } } } } } },
              assignment: true,
              liveSessions: { orderBy: { startsAt: 'asc' as const } },
              forum: { select: { id: true, slug: true, title: true } },
              resource: { select: { id: true, title: true, fileUrl: true, kind: true } },
            },
          },
        },
      },
    },
  },
  _count: { select: { enrollments: true, cohorts: true } },
} satisfies Prisma.CourseVersionInclude

/** Arbre complet d'une version (builder). */
export async function getVersionTree(principal: Principal, courseVersionId: string) {
  const version = await prisma.courseVersion.findUnique({ where: { id: courseVersionId }, include: versionTreeInclude })
  if (!version) throw new NotFoundError('Version de cours', courseVersionId)
  const p = requirePrincipal(principal)
  if (!can(p, 'course.author', { courseId: version.courseId }) && !can(p, 'course.teach', { courseId: version.courseId })) {
    throw new NotFoundError('Version de cours', courseVersionId)
  }
  const locked = version.isPublished || version._count.enrollments > 0 || version._count.cohorts > 0
  return { ...version, locked, completionRules: completionRulesSchema.parse(version.completionRules ?? {}) }
}

/** Fiche complète d'un cours pour le builder : versions et arbre de la version demandée (ou courante / dernière). */
export async function getCourse(principal: Principal, courseId: string, options: { versionId?: string } = {}) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: { select: { id: true, name: true } },
      trainers: { include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } } },
      prerequisites: { include: { prerequisiteCourse: { select: { id: true, title: true, code: true } } } },
      versions: { orderBy: { version: 'desc' }, include: { _count: { select: { enrollments: true, cohorts: true, modules: true } } } },
      certificateTemplates: { select: { id: true, name: true, kind: true } },
      _count: { select: { enrollments: true, cohorts: true } },
    },
  })
  if (!course) throw new NotFoundError('Cours', courseId)
  const p = requirePrincipal(principal)
  if (!can(p, 'course.author', { courseId }) && !can(p, 'course.teach', { courseId })) throw new NotFoundError('Cours', courseId)
  const targetVersionId = options.versionId ?? course.currentVersionId ?? course.versions[0]?.id ?? null
  const tree = targetVersionId ? await getVersionTree(principal, targetVersionId) : null
  return { ...course, selectedVersion: tree }
}

export async function createCourse(principal: Principal, input: CourseInput, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'course.author')
  const data = courseInputSchema.parse(input)
  const slug = data.slug
    ? data.slug
    : await uniqueSlug(data.title, async (candidate) => Boolean(await prisma.course.findUnique({ where: { slug: candidate }, select: { id: true } })))
  const duplicateCode = await prisma.course.findUnique({ where: { code: data.code }, select: { id: true } })
  if (duplicateCode) throw new ConflictError(`Le code ${data.code} est déjà utilisé`)
  if (data.slug) {
    const duplicateSlug = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (duplicateSlug) throw new ConflictError(`Le slug ${slug} est déjà utilisé`)
  }

  const course = await prisma.$transaction(async (tx) => {
    const created = await tx.course.create({
      data: {
        slug,
        code: data.code,
        title: data.title,
        subtitle: data.subtitle ?? null,
        summary: data.summary ?? null,
        description: data.description,
        objectives: data.objectives,
        prerequisitesText: data.prerequisitesText ?? null,
        audience: data.audience ?? null,
        categoryId: data.categoryId ?? null,
        modality: data.modality,
        level: data.level,
        language: data.language,
        durationHours: data.durationHours,
        pillar: data.pillar ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        color: data.color ?? null,
        enrollmentPolicy: data.enrollmentPolicy,
        isFree: data.isFree,
        priceAmount: data.priceAmount ?? null,
        memberPriceAmount: data.memberPriceAmount ?? null,
        currency: data.currency,
        capacity: data.capacity ?? null,
        isFeatured: data.isFeatured,
        position: data.position,
        status: 'DRAFT',
        createdById: p.id,
        trainers: data.trainerIds?.length ? { create: data.trainerIds.map((userId, i) => ({ userId, isLead: i === 0 })) } : undefined,
        prerequisites: data.prerequisiteCourseIds?.length ? { create: data.prerequisiteCourseIds.map((prerequisiteCourseId) => ({ prerequisiteCourseId })) } : undefined,
      },
    })
    await tx.courseVersion.create({
      data: { courseId: created.id, version: 1, label: 'Version initiale', completionRules: toJsonValue(completionRulesSchema.parse({})) },
    })
    return created
  })
  await audit('content.created', { type: 'Course', id: course.id }, auditContext(p, meta), { after: { title: course.title, code: course.code } })
  return course
}

export async function updateCourse(principal: Principal, courseId: string, input: CourseUpdateInput, meta: RequestMeta = {}) {
  const p = assertAuthor(principal, courseId)
  const existing = await loadCourseOrThrow(prisma, courseId)
  const data = courseUpdateSchema.parse(input)
  if (data.code && data.code !== existing.code) {
    const duplicate = await prisma.course.findUnique({ where: { code: data.code }, select: { id: true } })
    if (duplicate) throw new ConflictError(`Le code ${data.code} est déjà utilisé`)
  }
  if (data.slug && data.slug !== existing.slug) {
    const duplicate = await prisma.course.findUnique({ where: { slug: data.slug }, select: { id: true } })
    if (duplicate) throw new ConflictError(`Le slug ${data.slug} est déjà utilisé`)
  }
  const course = await prisma.$transaction(async (tx) => {
    const updated = await tx.course.update({
      where: { id: courseId },
      data: {
        slug: data.slug,
        code: data.code,
        title: data.title,
        subtitle: data.subtitle,
        summary: data.summary,
        description: data.description,
        objectives: data.objectives,
        prerequisitesText: data.prerequisitesText,
        audience: data.audience,
        categoryId: data.categoryId,
        modality: data.modality,
        level: data.level,
        language: data.language,
        durationHours: data.durationHours,
        pillar: data.pillar,
        coverImageUrl: data.coverImageUrl,
        color: data.color,
        enrollmentPolicy: data.enrollmentPolicy,
        isFree: data.isFree,
        priceAmount: data.priceAmount,
        memberPriceAmount: data.memberPriceAmount,
        currency: data.currency,
        capacity: data.capacity,
        isFeatured: data.isFeatured,
        position: data.position,
      },
    })
    if (data.trainerIds) {
      await tx.courseTrainer.deleteMany({ where: { courseId } })
      if (data.trainerIds.length) await tx.courseTrainer.createMany({ data: data.trainerIds.map((userId, i) => ({ courseId, userId, isLead: i === 0 })) })
    }
    if (data.prerequisiteCourseIds) {
      await tx.prerequisite.deleteMany({ where: { courseId } })
      const ids = data.prerequisiteCourseIds.filter((id) => id !== courseId)
      if (ids.length) await tx.prerequisite.createMany({ data: ids.map((prerequisiteCourseId) => ({ courseId, prerequisiteCourseId })) })
    }
    return updated
  })
  await audit('content.updated', { type: 'Course', id: courseId }, auditContext(p, meta), {
    before: { title: existing.title, status: existing.status },
    after: { title: course.title, status: course.status },
  })
  return course
}

/** Changement de statut du cours : publication / archivage réservés à la coordination. */
export async function setCourseStatus(principal: Principal, courseId: string, status: ContentStatus, meta: RequestMeta = {}) {
  const course = await loadCourseOrThrow(prisma, courseId)
  const p = status === 'PUBLISHED' || status === 'ARCHIVED' ? assertCan(principal, 'course.publish', { courseId }) : assertAuthor(principal, courseId)
  if (status === 'PUBLISHED' && !course.currentVersionId) {
    throw new PreconditionError('Publiez une version du cours avant de rendre le cours visible')
  }
  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { status, publishedAt: status === 'PUBLISHED' ? (course.publishedAt ?? new Date()) : course.publishedAt },
  })
  await audit(status === 'PUBLISHED' ? 'course.published' : status === 'ARCHIVED' ? 'content.archived' : 'content.updated', { type: 'Course', id: courseId }, auditContext(p, meta), {
    before: { status: course.status },
    after: { status },
  })
  return updated
}

/** Supprime un cours sans inscription ; sinon l'archive. */
export async function removeCourse(principal: Principal, courseId: string, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'course.publish', { courseId })
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { _count: { select: { enrollments: true, cohorts: true, requestModules: true } } } })
  if (!course) throw new NotFoundError('Cours', courseId)
  if (course._count.enrollments > 0 || course._count.cohorts > 0 || course._count.requestModules > 0) {
    const archived = await prisma.course.update({ where: { id: courseId }, data: { status: 'ARCHIVED' } })
    await audit('content.archived', { type: 'Course', id: courseId }, auditContext(p, meta), { before: { status: course.status }, after: { status: 'ARCHIVED' } })
    return { deleted: false, course: archived }
  }
  await prisma.$transaction(async (tx) => {
    await tx.course.update({ where: { id: courseId }, data: { currentVersionId: null } })
    await tx.course.delete({ where: { id: courseId } })
  })
  await audit('content.archived', { type: 'Course', id: courseId }, auditContext(p, meta), { before: { title: course.title, deleted: true } })
  return { deleted: true, course }
}

export async function setTrainers(principal: Principal, courseId: string, trainers: z.input<typeof trainerAssignmentSchema>, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'course.publish', { courseId })
  await loadCourseOrThrow(prisma, courseId)
  const data = trainerAssignmentSchema.parse(trainers)
  await prisma.$transaction(async (tx) => {
    await tx.courseTrainer.deleteMany({ where: { courseId } })
    if (data.length) await tx.courseTrainer.createMany({ data: data.map((t) => ({ courseId, userId: t.userId, isLead: t.isLead })) })
  })
  await audit('content.updated', { type: 'Course', id: courseId }, auditContext(p, meta), { after: { trainers: data.map((t) => t.userId) } })
  return prisma.courseTrainer.findMany({ where: { courseId }, include: { user: { select: { id: true, name: true, email: true } } } })
}

export async function setPrerequisites(principal: Principal, courseId: string, items: z.input<typeof prerequisiteAssignmentSchema>, meta: RequestMeta = {}) {
  const p = assertAuthor(principal, courseId)
  await loadCourseOrThrow(prisma, courseId)
  const data = prerequisiteAssignmentSchema.parse(items).filter((i) => i.prerequisiteCourseId !== courseId)
  await prisma.$transaction(async (tx) => {
    await tx.prerequisite.deleteMany({ where: { courseId } })
    if (data.length) await tx.prerequisite.createMany({ data: data.map((i) => ({ courseId, prerequisiteCourseId: i.prerequisiteCourseId, isMandatory: i.isMandatory })) })
  })
  await audit('content.updated', { type: 'Course', id: courseId }, auditContext(p, meta), { after: { prerequisites: data } })
  return prisma.prerequisite.findMany({ where: { courseId }, include: { prerequisiteCourse: { select: { id: true, title: true, code: true } } } })
}

// -----------------------------------------------------------------------------
// Versions (LMS-17)
// -----------------------------------------------------------------------------

async function nextVersionNumber(db: Db, courseId: string): Promise<number> {
  const last = await db.courseVersion.findFirst({ where: { courseId }, orderBy: { version: 'desc' }, select: { version: true } })
  return (last?.version ?? 0) + 1
}

/** Nouvelle version vide (structure à construire). */
export async function createVersion(principal: Principal, courseId: string, input: VersionInput = {}, meta: RequestMeta = {}) {
  const p = assertAuthor(principal, courseId)
  await loadCourseOrThrow(prisma, courseId)
  const data = versionInputSchema.parse(input)
  const version = await prisma.courseVersion.create({
    data: {
      courseId,
      version: await nextVersionNumber(prisma, courseId),
      label: data.label ?? null,
      changelog: data.changelog ?? null,
      completionRules: toJsonValue(completionRulesSchema.parse(data.completionRules ?? {})),
    },
  })
  await audit('course.version_created', { type: 'CourseVersion', id: version.id }, auditContext(p, meta), { after: { courseId, version: version.version } })
  return version
}

export async function updateVersion(principal: Principal, courseVersionId: string, input: VersionInput, meta: RequestMeta = {}) {
  const existing = await prisma.courseVersion.findUnique({ where: { id: courseVersionId } })
  if (!existing) throw new NotFoundError('Version de cours', courseVersionId)
  const p = assertAuthor(principal, existing.courseId)
  const data = versionInputSchema.parse(input)
  if (data.completionRules) await assertVersionEditable(prisma, courseVersionId)
  const version = await prisma.courseVersion.update({
    where: { id: courseVersionId },
    data: {
      label: data.label,
      changelog: data.changelog,
      completionRules: data.completionRules
        ? toJsonInput(completionRulesSchema.parse({ ...completionRulesSchema.parse(existing.completionRules ?? {}), ...data.completionRules }))
        : undefined,
    },
  })
  await audit('content.updated', { type: 'CourseVersion', id: courseVersionId }, auditContext(p, meta), { after: { label: version.label } })
  return version
}

/**
 * Duplique une version (modules, leçons, activités, quiz et leurs questions, devoirs, séances) en une nouvelle version
 * modifiable. C'est la voie obligatoire pour faire évoluer un contenu déjà suivi.
 */
export async function duplicateVersion(principal: Principal, courseVersionId: string, input: VersionInput = {}, meta: RequestMeta = {}) {
  const source = await prisma.courseVersion.findUnique({ where: { id: courseVersionId }, include: versionTreeInclude })
  if (!source) throw new NotFoundError('Version de cours', courseVersionId)
  const p = assertAuthor(principal, source.courseId)
  const data = versionInputSchema.parse(input)
  const course = await loadCourseOrThrow(prisma, source.courseId)

  const created = await prisma.$transaction(async (tx) => {
    const version = await tx.courseVersion.create({
      data: {
        courseId: source.courseId,
        version: await nextVersionNumber(tx, source.courseId),
        label: data.label ?? `Copie de la version ${source.version}`,
        changelog: data.changelog ?? null,
        completionRules: toJsonValue(completionRulesSchema.parse({ ...completionRulesSchema.parse(source.completionRules ?? {}), ...(data.completionRules ?? {}) })),
      },
    })
    for (const module of source.modules) {
      const newModule = await tx.courseModule.create({
        data: { courseVersionId: version.id, title: module.title, summary: module.summary, position: module.position, durationMinutes: module.durationMinutes, isOptional: module.isOptional },
      })
      for (const lesson of module.lessons) {
        const newLesson = await tx.lesson.create({
          data: { moduleId: newModule.id, slug: lesson.slug, title: lesson.title, summary: lesson.summary, position: lesson.position, durationMinutes: lesson.durationMinutes, isPreview: lesson.isPreview },
        })
        for (const activity of lesson.activities) {
          const newActivity = await tx.activity.create({
            data: {
              lessonId: newLesson.id,
              type: activity.type,
              title: activity.title,
              instructions: activity.instructions,
              content: toJsonInput(activity.content),
              resourceId: activity.resourceId,
              position: activity.position,
              durationMinutes: activity.durationMinutes,
              isRequired: activity.isRequired,
              completionRule: activity.completionRule,
              maxScore: activity.maxScore,
              passScore: activity.passScore,
              weight: activity.weight,
              lowBandwidthAlternative: toJsonInput(activity.lowBandwidthAlternative),
              availableFrom: activity.availableFrom,
              dueAt: activity.dueAt,
            },
          })
          if (activity.quiz) {
            await tx.quiz.create({
              data: {
                activityId: newActivity.id,
                description: activity.quiz.description,
                timeLimitMinutes: activity.quiz.timeLimitMinutes,
                maxAttempts: activity.quiz.maxAttempts,
                shuffleQuestions: activity.quiz.shuffleQuestions,
                shuffleOptions: activity.quiz.shuffleOptions,
                showCorrection: activity.quiz.showCorrection,
                passScore: activity.quiz.passScore,
                isSurvey: activity.quiz.isSurvey,
                questions: { create: activity.quiz.questions.map((qq) => ({ questionId: qq.questionId, position: qq.position, points: qq.points })) },
              },
            })
          }
          if (activity.assignment) {
            await tx.assignment.create({
              data: {
                activityId: newActivity.id,
                description: activity.assignment.description,
                allowFile: activity.assignment.allowFile,
                allowText: activity.assignment.allowText,
                allowedMimeTypes: activity.assignment.allowedMimeTypes,
                maxFileSizeMb: activity.assignment.maxFileSizeMb,
                dueAt: activity.assignment.dueAt,
                lateAllowed: activity.assignment.lateAllowed,
                maxScore: activity.assignment.maxScore,
                rubric: toJsonInput(activity.assignment.rubric),
              },
            })
          }
          for (const live of activity.liveSessions) {
            await tx.liveSession.create({
              data: {
                activityId: newActivity.id,
                title: live.title,
                startsAt: live.startsAt,
                endsAt: live.endsAt,
                speakerName: live.speakerName,
                meetingUrl: live.meetingUrl,
                replayUrl: live.replayUrl,
                transcriptUrl: live.transcriptUrl,
              },
            })
          }
          if (activity.type === 'FORUM') {
            await tx.forum.create({
              data: {
                slug: await uniqueSlug(`${course.code}-${activity.title}-v${version.version}`, async (c) => Boolean(await tx.forum.findUnique({ where: { slug: c }, select: { id: true } }))),
                title: activity.title,
                courseId: source.courseId,
                activityId: newActivity.id,
              },
            })
          }
        }
      }
    }
    return version
  })
  await audit('course.version_created', { type: 'CourseVersion', id: created.id }, auditContext(p, meta), {
    after: { courseId: source.courseId, version: created.version, duplicatedFrom: source.id },
  })
  return getVersionTree(principal, created.id)
}

/**
 * Publie une version : la fige (isPublished), en fait la version courante du cours
 * et, par défaut, rend le cours visible s'il était en brouillon ou relecture.
 */
export async function publishVersion(principal: Principal, courseVersionId: string, options: { publishCourse?: boolean } = {}, meta: RequestMeta = {}) {
  const version = await prisma.courseVersion.findUnique({
    where: { id: courseVersionId },
    include: { course: true, modules: { include: { lessons: { include: { _count: { select: { activities: true } } } } } } },
  })
  if (!version) throw new NotFoundError('Version de cours', courseVersionId)
  const p = assertCan(principal, 'course.publish', { courseId: version.courseId })
  const activityCount = version.modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l._count.activities, 0), 0)
  if (version.modules.length === 0 || activityCount === 0) {
    throw new PreconditionError('La version doit contenir au moins un module, une leçon et une activité avant publication')
  }
  const publishCourse = options.publishCourse ?? true
  const now = new Date()
  const result = await prisma.$transaction(async (tx) => {
    const published = await tx.courseVersion.update({
      where: { id: courseVersionId },
      data: { isPublished: true, publishedAt: version.publishedAt ?? now },
    })
    const course = await tx.course.update({
      where: { id: version.courseId },
      data: {
        currentVersionId: courseVersionId,
        ...(publishCourse && (version.course.status === 'DRAFT' || version.course.status === 'REVIEW')
          ? { status: 'PUBLISHED' as const, publishedAt: version.course.publishedAt ?? now }
          : {}),
      },
    })
    return { version: published, course }
  })
  await audit('course.published', { type: 'CourseVersion', id: courseVersionId }, auditContext(p, meta), {
    before: { currentVersionId: version.course.currentVersionId, status: version.course.status },
    after: { currentVersionId: courseVersionId, version: version.version, status: result.course.status },
  })
  return result
}

/** Supprime une version brouillon non suivie. */
export async function removeVersion(principal: Principal, courseVersionId: string, meta: RequestMeta = {}) {
  const version = await assertVersionEditable(prisma, courseVersionId)
  const p = assertAuthor(principal, version.courseId)
  const course = await loadCourseOrThrow(prisma, version.courseId)
  if (course.currentVersionId === courseVersionId) throw new PreconditionError('La version courante ne peut pas être supprimée')
  await prisma.courseVersion.delete({ where: { id: courseVersionId } })
  await audit('content.archived', { type: 'CourseVersion', id: courseVersionId }, auditContext(p, meta), { before: { version: version.version } })
}

// -----------------------------------------------------------------------------
// Modules
// -----------------------------------------------------------------------------

export async function addModule(principal: Principal, courseVersionId: string, input: ModuleInput, meta: RequestMeta = {}) {
  const version = await assertVersionEditable(prisma, courseVersionId)
  const p = assertAuthor(principal, version.courseId)
  const data = moduleInputSchema.parse(input)
  const position = await prisma.courseModule.count({ where: { courseVersionId } })
  const module = await prisma.courseModule.create({
    data: { courseVersionId, title: data.title, summary: data.summary ?? null, durationMinutes: data.durationMinutes ?? null, isOptional: data.isOptional, position },
  })
  await audit('content.created', { type: 'CourseModule', id: module.id }, auditContext(p, meta), { after: { title: module.title, courseVersionId } })
  return module
}

export async function updateModule(principal: Principal, moduleId: string, input: Partial<ModuleInput>, meta: RequestMeta = {}) {
  const ctx = await resolveModuleCourse(prisma, moduleId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const data = moduleInputSchema.partial().parse(input)
  const module = await prisma.courseModule.update({
    where: { id: moduleId },
    data: { title: data.title, summary: data.summary, durationMinutes: data.durationMinutes, isOptional: data.isOptional },
  })
  await audit('content.updated', { type: 'CourseModule', id: moduleId }, auditContext(p, meta), { after: { title: module.title } })
  return module
}

export async function removeModule(principal: Principal, moduleId: string, meta: RequestMeta = {}) {
  const ctx = await resolveModuleCourse(prisma, moduleId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  await prisma.courseModule.delete({ where: { id: moduleId } })
  await renumber(prisma, 'module', ctx.courseVersionId)
  await audit('content.archived', { type: 'CourseModule', id: moduleId }, auditContext(p, meta))
}

export async function reorderModules(principal: Principal, courseVersionId: string, ids: string[], meta: RequestMeta = {}) {
  const version = await assertVersionEditable(prisma, courseVersionId)
  const p = assertAuthor(principal, version.courseId)
  const { ids: ordered } = reorderSchema.parse({ ids })
  const existing = await prisma.courseModule.findMany({ where: { courseVersionId }, select: { id: true } })
  assertSameSet(existing.map((m) => m.id), ordered)
  await prisma.$transaction(ordered.map((id, position) => prisma.courseModule.update({ where: { id }, data: { position } })))
  await audit('content.updated', { type: 'CourseVersion', id: courseVersionId }, auditContext(p, meta), { after: { moduleOrder: ordered } })
}

// -----------------------------------------------------------------------------
// Leçons
// -----------------------------------------------------------------------------

export async function addLesson(principal: Principal, moduleId: string, input: LessonInput, meta: RequestMeta = {}) {
  const ctx = await resolveModuleCourse(prisma, moduleId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const data = lessonInputSchema.parse(input)
  const slug = await uniqueSlug(data.slug ?? data.title, async (candidate) =>
    Boolean(await prisma.lesson.findUnique({ where: { moduleId_slug: { moduleId, slug: candidate } }, select: { id: true } })),
  )
  const position = await prisma.lesson.count({ where: { moduleId } })
  const lesson = await prisma.lesson.create({
    data: { moduleId, slug, title: data.title, summary: data.summary ?? null, durationMinutes: data.durationMinutes ?? null, isPreview: data.isPreview, position },
  })
  await audit('content.created', { type: 'Lesson', id: lesson.id }, auditContext(p, meta), { after: { title: lesson.title, moduleId } })
  return lesson
}

export async function updateLesson(principal: Principal, lessonId: string, input: Partial<LessonInput>, meta: RequestMeta = {}) {
  const ctx = await resolveLessonCourse(prisma, lessonId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const data = lessonInputSchema.partial().parse(input)
  if (data.slug) {
    const clash = await prisma.lesson.findUnique({ where: { moduleId_slug: { moduleId: ctx.moduleId, slug: data.slug } }, select: { id: true } })
    if (clash && clash.id !== lessonId) throw new ConflictError('Ce slug est déjà utilisé dans le module')
  }
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { title: data.title, slug: data.slug, summary: data.summary, durationMinutes: data.durationMinutes, isPreview: data.isPreview },
  })
  await audit('content.updated', { type: 'Lesson', id: lessonId }, auditContext(p, meta), { after: { title: lesson.title } })
  return lesson
}

export async function removeLesson(principal: Principal, lessonId: string, meta: RequestMeta = {}) {
  const ctx = await resolveLessonCourse(prisma, lessonId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  await prisma.lesson.delete({ where: { id: lessonId } })
  await renumber(prisma, 'lesson', ctx.moduleId)
  await audit('content.archived', { type: 'Lesson', id: lessonId }, auditContext(p, meta))
}

export async function reorderLessons(principal: Principal, moduleId: string, ids: string[], meta: RequestMeta = {}) {
  const ctx = await resolveModuleCourse(prisma, moduleId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const { ids: ordered } = reorderSchema.parse({ ids })
  const existing = await prisma.lesson.findMany({ where: { moduleId }, select: { id: true } })
  assertSameSet(existing.map((l) => l.id), ordered)
  await prisma.$transaction(ordered.map((id, position) => prisma.lesson.update({ where: { id }, data: { position } })))
  await audit('content.updated', { type: 'CourseModule', id: moduleId }, auditContext(p, meta), { after: { lessonOrder: ordered } })
}

/** Déplace une leçon vers un autre module de la même version. */
export async function moveLesson(principal: Principal, lessonId: string, targetModuleId: string, meta: RequestMeta = {}) {
  const ctx = await resolveLessonCourse(prisma, lessonId)
  const target = await resolveModuleCourse(prisma, targetModuleId)
  if (ctx.courseVersionId !== target.courseVersionId) throw new PreconditionError('Le module cible appartient à une autre version')
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } })
  const slug = await uniqueSlug(lesson.slug, async (candidate) =>
    Boolean(await prisma.lesson.findUnique({ where: { moduleId_slug: { moduleId: targetModuleId, slug: candidate } }, select: { id: true } })),
  )
  const position = await prisma.lesson.count({ where: { moduleId: targetModuleId } })
  const moved = await prisma.lesson.update({ where: { id: lessonId }, data: { moduleId: targetModuleId, slug, position } })
  await renumber(prisma, 'lesson', ctx.moduleId)
  await audit('content.updated', { type: 'Lesson', id: lessonId }, auditContext(p, meta), { after: { moduleId: targetModuleId } })
  return moved
}

// -----------------------------------------------------------------------------
// Activités (+ Quiz, Assignment, LiveSession, Forum)
// -----------------------------------------------------------------------------

function contentFor(type: ActivityType, raw: unknown) {
  return toJsonValue(parseActivityContent(type, raw ?? {}))
}

export async function addActivity(principal: Principal, lessonId: string, input: ActivityInput, meta: RequestMeta = {}) {
  const ctx = await resolveLessonCourse(prisma, lessonId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const data = activityInputSchema.parse(input)
  const course = await loadCourseOrThrow(prisma, ctx.courseId)
  const position = await prisma.activity.count({ where: { lessonId } })
  const completionRule = data.completionRule ?? defaultCompletionRule(data.type)

  const activity = await prisma.$transaction(async (tx) => {
    const created = await tx.activity.create({
      data: {
        lessonId,
        type: data.type,
        title: data.title,
        instructions: data.instructions ?? null,
        content: contentFor(data.type, data.content),
        resourceId: data.resourceId ?? null,
        position,
        durationMinutes: data.durationMinutes ?? null,
        isRequired: data.isRequired,
        completionRule,
        maxScore: data.maxScore ?? null,
        passScore: data.passScore ?? null,
        weight: data.weight,
        lowBandwidthAlternative: data.lowBandwidthAlternative === undefined ? undefined : toJsonValue(data.lowBandwidthAlternative),
        availableFrom: data.availableFrom ?? null,
        dueAt: data.dueAt ?? null,
      },
    })
    if (data.type === 'QUIZ' || data.type === 'SURVEY') {
      const quiz = quizInputSchema.parse({ ...(data.quiz ?? {}), isSurvey: data.type === 'SURVEY' ? true : (data.quiz?.isSurvey ?? false) })
      await tx.quiz.create({
        data: {
          activityId: created.id,
          description: quiz.description ?? null,
          timeLimitMinutes: quiz.timeLimitMinutes ?? null,
          maxAttempts: quiz.maxAttempts,
          shuffleQuestions: quiz.shuffleQuestions,
          shuffleOptions: quiz.shuffleOptions,
          showCorrection: quiz.showCorrection,
          passScore: quiz.passScore,
          isSurvey: quiz.isSurvey,
        },
      })
    }
    if (data.type === 'ASSIGNMENT') {
      const assignment = assignmentInputSchema.parse(data.assignment ?? {})
      await tx.assignment.create({
        data: {
          activityId: created.id,
          description: assignment.description ?? null,
          allowFile: assignment.allowFile,
          allowText: assignment.allowText,
          allowedMimeTypes: assignment.allowedMimeTypes,
          maxFileSizeMb: assignment.maxFileSizeMb,
          dueAt: assignment.dueAt ?? data.dueAt ?? null,
          lateAllowed: assignment.lateAllowed,
          maxScore: assignment.maxScore,
          rubric: assignment.rubric === undefined ? undefined : toJsonValue(assignment.rubric),
        },
      })
    }
    if (data.type === 'FORUM') {
      await tx.forum.create({
        data: {
          slug: await uniqueSlug(`${course.code}-${data.title}`, async (c) => Boolean(await tx.forum.findUnique({ where: { slug: c }, select: { id: true } }))),
          title: data.title,
          courseId: ctx.courseId,
          activityId: created.id,
        },
      })
    }
    return created
  })
  await audit('content.created', { type: 'Activity', id: activity.id }, auditContext(p, meta), { after: { title: activity.title, type: activity.type, lessonId } })
  return getActivity(principal, activity.id)
}

/** Activité avec ses extensions (quiz + questions, devoir, séances, forum). */
export async function getActivity(principal: Principal, activityId: string) {
  const ctx = await resolveActivityContext(prisma, activityId)
  const p = requirePrincipal(principal)
  if (!can(p, 'course.author', { courseId: ctx.course.id }) && !can(p, 'course.teach', { courseId: ctx.course.id })) {
    throw new NotFoundError('Activité', activityId)
  }
  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id: activityId },
    include: {
      quiz: { include: { questions: { orderBy: { position: 'asc' }, include: { question: { include: { options: { orderBy: { position: 'asc' } } } } } } } },
      assignment: true,
      liveSessions: { orderBy: { startsAt: 'asc' }, include: { trainingSession: { select: { id: true, title: true, cohortId: true, startsAt: true } } } },
      forum: { select: { id: true, slug: true, title: true, isLocked: true } },
      resource: { select: { id: true, title: true, fileUrl: true, kind: true, mimeType: true } },
    },
  })
  return { ...activity, context: { course: ctx.course, version: ctx.version, module: ctx.module, lesson: ctx.lesson } }
}

export async function updateActivity(principal: Principal, activityId: string, input: ActivityUpdateInput, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  await assertVersionEditable(prisma, ctx.version.id)
  const p = assertAuthor(principal, ctx.course.id)
  const data = activityUpdateSchema.parse(input)
  const activity = await prisma.$transaction(async (tx) => {
    const updated = await tx.activity.update({
      where: { id: activityId },
      data: {
        title: data.title,
        instructions: data.instructions,
        content: data.content === undefined ? undefined : contentFor(ctx.activity.type, data.content),
        resourceId: data.resourceId,
        durationMinutes: data.durationMinutes,
        isRequired: data.isRequired,
        completionRule: data.completionRule,
        maxScore: data.maxScore,
        passScore: data.passScore,
        weight: data.weight,
        lowBandwidthAlternative: data.lowBandwidthAlternative === undefined ? undefined : toJsonValue(data.lowBandwidthAlternative),
        availableFrom: data.availableFrom,
        dueAt: data.dueAt,
      },
    })
    if (data.quiz && (ctx.activity.type === 'QUIZ' || ctx.activity.type === 'SURVEY')) await upsertQuizTx(tx, activityId, data.quiz, ctx.activity.type === 'SURVEY')
    if (data.assignment && ctx.activity.type === 'ASSIGNMENT') await upsertAssignmentTx(tx, activityId, data.assignment)
    return updated
  })
  await audit('content.updated', { type: 'Activity', id: activityId }, auditContext(p, meta), { after: { title: activity.title } })
  return getActivity(principal, activityId)
}

async function upsertQuizTx(tx: Db, activityId: string, input: Partial<QuizInput>, forceSurvey: boolean) {
  const existing = await tx.quiz.findUnique({ where: { activityId } })
  const merged = quizInputSchema.parse({
    ...(existing
      ? {
          description: existing.description,
          timeLimitMinutes: existing.timeLimitMinutes,
          maxAttempts: existing.maxAttempts,
          shuffleQuestions: existing.shuffleQuestions,
          shuffleOptions: existing.shuffleOptions,
          showCorrection: existing.showCorrection,
          passScore: existing.passScore,
          isSurvey: existing.isSurvey,
        }
      : {}),
    ...input,
    ...(forceSurvey ? { isSurvey: true } : {}),
  })
  const data = {
    description: merged.description ?? null,
    timeLimitMinutes: merged.timeLimitMinutes ?? null,
    maxAttempts: merged.maxAttempts,
    shuffleQuestions: merged.shuffleQuestions,
    shuffleOptions: merged.shuffleOptions,
    showCorrection: merged.showCorrection,
    passScore: merged.passScore,
    isSurvey: merged.isSurvey,
  }
  return tx.quiz.upsert({ where: { activityId }, create: { activityId, ...data }, update: data })
}

async function upsertAssignmentTx(tx: Db, activityId: string, input: Partial<AssignmentInput>) {
  const existing = await tx.assignment.findUnique({ where: { activityId } })
  const merged = assignmentInputSchema.parse({
    ...(existing
      ? {
          description: existing.description,
          allowFile: existing.allowFile,
          allowText: existing.allowText,
          allowedMimeTypes: existing.allowedMimeTypes,
          maxFileSizeMb: existing.maxFileSizeMb,
          dueAt: existing.dueAt,
          lateAllowed: existing.lateAllowed,
          maxScore: existing.maxScore,
          rubric: existing.rubric,
        }
      : {}),
    ...input,
  })
  const data = {
    description: merged.description ?? null,
    allowFile: merged.allowFile,
    allowText: merged.allowText,
    allowedMimeTypes: merged.allowedMimeTypes,
    maxFileSizeMb: merged.maxFileSizeMb,
    dueAt: merged.dueAt ?? null,
    lateAllowed: merged.lateAllowed,
    maxScore: merged.maxScore,
    rubric: toJsonValue(merged.rubric ?? null),
  }
  return tx.assignment.upsert({ where: { activityId }, create: { activityId, ...data }, update: data })
}

/** Paramètres du quiz (les questions se gèrent via questionBank.addToQuiz). */
export async function upsertQuiz(principal: Principal, activityId: string, input: Partial<QuizInput>, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.activity.type !== 'QUIZ' && ctx.activity.type !== 'SURVEY') throw new PreconditionError("Cette activité n'est pas une évaluation")
  await assertVersionEditable(prisma, ctx.version.id)
  const p = assertAuthor(principal, ctx.course.id)
  const quiz = await upsertQuizTx(prisma, activityId, input, ctx.activity.type === 'SURVEY')
  await audit('content.updated', { type: 'Quiz', id: quiz.id }, auditContext(p, meta), { after: { activityId } })
  return quiz
}

export async function upsertAssignment(principal: Principal, activityId: string, input: Partial<AssignmentInput>, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.activity.type !== 'ASSIGNMENT') throw new PreconditionError("Cette activité n'est pas un devoir")
  await assertVersionEditable(prisma, ctx.version.id)
  const p = assertAuthor(principal, ctx.course.id)
  const assignment = await upsertAssignmentTx(prisma, activityId, input)
  await audit('content.updated', { type: 'Assignment', id: assignment.id }, auditContext(p, meta), { after: { activityId } })
  return assignment
}

/** Les séances en direct restent modifiables sur une version suivie (dates, liens, replay). */
export async function addLiveSession(principal: Principal, activityId: string, input: LiveSessionInput, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.activity.type !== 'LIVE_SESSION') throw new PreconditionError("Cette activité n'est pas une séance en direct")
  const p = assertCan(principal, 'course.teach', { courseId: ctx.course.id })
  const data = liveSessionInputSchema.parse(input)
  const live = await prisma.liveSession.create({
    data: {
      activityId,
      title: data.title,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      speakerName: data.speakerName ?? null,
      meetingUrl: data.meetingUrl ?? null,
      replayUrl: data.replayUrl ?? null,
      transcriptUrl: data.transcriptUrl ?? null,
      trainingSessionId: data.trainingSessionId ?? null,
    },
  })
  await audit('content.created', { type: 'LiveSession', id: live.id }, auditContext(p, meta), { after: { activityId, startsAt: live.startsAt } })
  return live
}

export async function updateLiveSession(principal: Principal, liveSessionId: string, input: Partial<LiveSessionInput>, meta: RequestMeta = {}) {
  const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId } })
  if (!live) throw new NotFoundError('Séance', liveSessionId)
  const ctx = await resolveActivityContext(prisma, live.activityId)
  const p = assertCan(principal, 'course.teach', { courseId: ctx.course.id })
  const merged = liveSessionInputSchema.parse({
    title: live.title,
    startsAt: live.startsAt,
    endsAt: live.endsAt,
    speakerName: live.speakerName,
    meetingUrl: live.meetingUrl,
    replayUrl: live.replayUrl,
    transcriptUrl: live.transcriptUrl,
    trainingSessionId: live.trainingSessionId,
    ...input,
  })
  const updated = await prisma.liveSession.update({
    where: { id: liveSessionId },
    data: {
      title: merged.title,
      startsAt: merged.startsAt,
      endsAt: merged.endsAt,
      speakerName: merged.speakerName ?? null,
      meetingUrl: merged.meetingUrl ?? null,
      replayUrl: merged.replayUrl ?? null,
      transcriptUrl: merged.transcriptUrl ?? null,
      trainingSessionId: merged.trainingSessionId ?? null,
    },
  })
  await audit('content.updated', { type: 'LiveSession', id: liveSessionId }, auditContext(p, meta), { after: { startsAt: updated.startsAt } })
  return updated
}

export async function removeLiveSession(principal: Principal, liveSessionId: string, meta: RequestMeta = {}) {
  const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId } })
  if (!live) throw new NotFoundError('Séance', liveSessionId)
  const ctx = await resolveActivityContext(prisma, live.activityId)
  const p = assertCan(principal, 'course.teach', { courseId: ctx.course.id })
  await prisma.liveSession.delete({ where: { id: liveSessionId } })
  await audit('content.archived', { type: 'LiveSession', id: liveSessionId }, auditContext(p, meta))
}

export async function removeActivity(principal: Principal, activityId: string, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  await assertVersionEditable(prisma, ctx.version.id)
  const p = assertAuthor(principal, ctx.course.id)
  await prisma.activity.delete({ where: { id: activityId } })
  await renumber(prisma, 'activity', ctx.lesson.id)
  await audit('content.archived', { type: 'Activity', id: activityId }, auditContext(p, meta), { before: { title: ctx.activity.title } })
}

export async function reorderActivities(principal: Principal, lessonId: string, ids: string[], meta: RequestMeta = {}) {
  const ctx = await resolveLessonCourse(prisma, lessonId)
  await assertVersionEditable(prisma, ctx.courseVersionId)
  const p = assertAuthor(principal, ctx.courseId)
  const { ids: ordered } = reorderSchema.parse({ ids })
  const existing = await prisma.activity.findMany({ where: { lessonId }, select: { id: true } })
  assertSameSet(existing.map((a) => a.id), ordered)
  await prisma.$transaction(ordered.map((id, position) => prisma.activity.update({ where: { id }, data: { position } })))
  await audit('content.updated', { type: 'Lesson', id: lessonId }, auditContext(p, meta), { after: { activityOrder: ordered } })
}

/** Déplace une activité vers une autre leçon de la même version. */
export async function moveActivity(principal: Principal, activityId: string, targetLessonId: string, meta: RequestMeta = {}) {
  const ctx = await resolveActivityContext(prisma, activityId)
  const target = await resolveLessonCourse(prisma, targetLessonId)
  if (target.courseVersionId !== ctx.version.id) throw new PreconditionError('La leçon cible appartient à une autre version')
  await assertVersionEditable(prisma, ctx.version.id)
  const p = assertAuthor(principal, ctx.course.id)
  const position = await prisma.activity.count({ where: { lessonId: targetLessonId } })
  const moved = await prisma.activity.update({ where: { id: activityId }, data: { lessonId: targetLessonId, position } })
  await renumber(prisma, 'activity', ctx.lesson.id)
  await audit('content.updated', { type: 'Activity', id: activityId }, auditContext(p, meta), { after: { lessonId: targetLessonId } })
  return moved
}

// -----------------------------------------------------------------------------
// Utilitaires
// -----------------------------------------------------------------------------

function assertSameSet(existing: string[], ordered: string[]): void {
  const a = new Set(existing)
  const b = new Set(ordered)
  if (a.size !== b.size || [...a].some((id) => !b.has(id))) {
    throw new PreconditionError("La liste d'identifiants ne correspond pas aux éléments existants")
  }
}

/** Renumérote les positions après suppression ou déplacement. */
async function renumber(db: Db, kind: 'module' | 'lesson' | 'activity', parentId: string): Promise<void> {
  if (kind === 'module') {
    const rows = await db.courseModule.findMany({ where: { courseVersionId: parentId }, orderBy: { position: 'asc' }, select: { id: true } })
    for (const [position, row] of rows.entries()) await db.courseModule.update({ where: { id: row.id }, data: { position } })
  } else if (kind === 'lesson') {
    const rows = await db.lesson.findMany({ where: { moduleId: parentId }, orderBy: { position: 'asc' }, select: { id: true } })
    for (const [position, row] of rows.entries()) await db.lesson.update({ where: { id: row.id }, data: { position } })
  } else {
    const rows = await db.activity.findMany({ where: { lessonId: parentId }, orderBy: { position: 'asc' }, select: { id: true } })
    for (const [position, row] of rows.entries()) await db.activity.update({ where: { id: row.id }, data: { position } })
  }
}

export { slugify }
