import type { ActivityType, CompletionRule, EnrollmentStatus } from '@fetrag/db'
import { NotFoundError } from '@fetrag/domain'
import { prisma, type Db } from './db'

/** Activité aplatie avec sa position dans l'arbre de la version. */
export interface VersionActivity {
  id: string
  title: string
  type: ActivityType
  position: number
  isRequired: boolean
  completionRule: CompletionRule
  weight: number
  maxScore: number | null
  passScore: number | null
  durationMinutes: number | null
  availableFrom: Date | null
  dueAt: Date | null
  lessonId: string
  lessonTitle: string
  lessonSlug: string
  lessonPosition: number
  moduleId: string
  moduleTitle: string
  modulePosition: number
  moduleIsOptional: boolean
}

/** Charge toutes les activités d'une version dans l'ordre pédagogique (module, leçon, activité). */
export async function loadVersionActivities(db: Db, courseVersionId: string): Promise<VersionActivity[]> {
  const modules = await db.courseModule.findMany({
    where: { courseVersionId },
    orderBy: { position: 'asc' },
    include: {
      lessons: {
        orderBy: { position: 'asc' },
        include: {
          activities: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              position: true,
              isRequired: true,
              completionRule: true,
              weight: true,
              maxScore: true,
              passScore: true,
              durationMinutes: true,
              availableFrom: true,
              dueAt: true,
            },
          },
        },
      },
    },
  })
  const out: VersionActivity[] = []
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const activity of lesson.activities) {
        out.push({
          ...activity,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          lessonPosition: lesson.position,
          moduleId: module.id,
          moduleTitle: module.title,
          modulePosition: module.position,
          moduleIsOptional: module.isOptional,
        })
      }
    }
  }
  return out
}

/** Une activité est requise pour l'achèvement si elle est marquée requise dans un module non optionnel. */
export function isRequiredActivity(activity: Pick<VersionActivity, 'isRequired' | 'moduleIsOptional'>): boolean {
  return activity.isRequired && !activity.moduleIsOptional
}

export interface ActivityContext {
  activity: {
    id: string
    lessonId: string
    type: ActivityType
    title: string
    instructions: string | null
    content: unknown
    resourceId: string | null
    position: number
    durationMinutes: number | null
    isRequired: boolean
    completionRule: CompletionRule
    maxScore: number | null
    passScore: number | null
    weight: number
    availableFrom: Date | null
    dueAt: Date | null
  }
  lesson: { id: string; title: string; slug: string; moduleId: string }
  module: { id: string; title: string; courseVersionId: string; isOptional: boolean }
  version: { id: string; courseId: string; version: number; isPublished: boolean; completionRules: unknown }
  course: { id: string; slug: string; title: string; code: string; status: string; currentVersionId: string | null }
}

/** Remonte l'arbre depuis une activité : leçon, module, version et cours (404 si absent). */
export async function resolveActivityContext(db: Db, activityId: string): Promise<ActivityContext> {
  const activity = await db.activity.findUnique({
    where: { id: activityId },
    include: {
      lesson: {
        include: {
          module: {
            include: {
              courseVersion: {
                include: { course: { select: { id: true, slug: true, title: true, code: true, status: true, currentVersionId: true } } },
              },
            },
          },
        },
      },
    },
  })
  if (!activity) throw new NotFoundError('Activité', activityId)
  const { lesson } = activity
  const { module } = lesson
  const { courseVersion } = module
  return {
    activity: {
      id: activity.id,
      lessonId: activity.lessonId,
      type: activity.type,
      title: activity.title,
      instructions: activity.instructions,
      content: activity.content,
      resourceId: activity.resourceId,
      position: activity.position,
      durationMinutes: activity.durationMinutes,
      isRequired: activity.isRequired,
      completionRule: activity.completionRule,
      maxScore: activity.maxScore,
      passScore: activity.passScore,
      weight: activity.weight,
      availableFrom: activity.availableFrom,
      dueAt: activity.dueAt,
    },
    lesson: { id: lesson.id, title: lesson.title, slug: lesson.slug, moduleId: lesson.moduleId },
    module: { id: module.id, title: module.title, courseVersionId: module.courseVersionId, isOptional: module.isOptional },
    version: {
      id: courseVersion.id,
      courseId: courseVersion.courseId,
      version: courseVersion.version,
      isPublished: courseVersion.isPublished,
      completionRules: courseVersion.completionRules,
    },
    course: courseVersion.course,
  }
}

/** Identifiant de cours d'un module (404 si absent). */
export async function resolveModuleCourse(db: Db, moduleId: string): Promise<{ courseId: string; courseVersionId: string }> {
  const module = await db.courseModule.findUnique({
    where: { id: moduleId },
    select: { courseVersionId: true, courseVersion: { select: { courseId: true } } },
  })
  if (!module) throw new NotFoundError('Module', moduleId)
  return { courseId: module.courseVersion.courseId, courseVersionId: module.courseVersionId }
}

/** Identifiant de cours d'une leçon (404 si absent). */
export async function resolveLessonCourse(db: Db, lessonId: string): Promise<{ courseId: string; courseVersionId: string; moduleId: string }> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true, module: { select: { courseVersionId: true, courseVersion: { select: { courseId: true } } } } },
  })
  if (!lesson) throw new NotFoundError('Leçon', lessonId)
  return { courseId: lesson.module.courseVersion.courseId, courseVersionId: lesson.module.courseVersionId, moduleId: lesson.moduleId }
}

const LEARNING_STATUSES: EnrollmentStatus[] = ['ACTIVE', 'COMPLETED']

/**
 * Inscription d'un apprenant sur une version de cours (ACTIVE en priorité, sinon COMPLETED).
 * Renvoie null si l'utilisateur n'est pas inscrit.
 */
export async function findLearnerEnrollment(db: Db, userId: string, courseVersionId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId, courseVersionId, status: { in: LEARNING_STATUSES } },
    orderBy: { createdAt: 'desc' },
  })
  return enrollments.find((e) => e.status === 'ACTIVE') ?? enrollments[0] ?? null
}

export { prisma }
