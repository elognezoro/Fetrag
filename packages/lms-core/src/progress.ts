import { progressReportSchema, type ProgressReport } from '@fetrag/contracts'
import { prisma, type ActivityType, type CompletionRule } from '@fetrag/db'
import { audit, ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import { completeActivityForEnrollment, recomputeProgress, timeCapFor, type ProgressState } from './internal/completion'
import { isRequiredActivity, loadVersionActivities, resolveActivityContext, type VersionActivity } from './internal/course-tree'
import { assertCan, auditContext, can, requirePrincipal } from './lib/access'
import { readActivityContent } from './schemas'
import type { Principal, RequestMeta } from './types'

/** Part de la durée indicative à atteindre pour la règle TIME_SPENT. */
export const TIME_SPENT_THRESHOLD = 0.8

/** Règles gérées par les services spécialisés (quiz, devoirs, présences, formateur). */
const SERVICE_MANAGED_RULES: CompletionRule[] = ['PASS_SCORE', 'SUBMIT', 'ATTEND', 'MANUAL']

async function loadEnrollmentForLearner(principal: Principal, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, userId: true, courseId: true, courseVersionId: true, cohortId: true, organizationId: true, status: true },
  })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  return enrollment
}

/**
 * Remontée de progression idempotente (LMS-20) : cumule le temps (plafonné),
 * applique VIEW / TIME_SPENT, recalcule la progression et l'achèvement du cours.
 */
export async function report(principal: Principal, enrollmentId: string, input: ProgressReport) {
  const p = requirePrincipal(principal)
  const data = progressReportSchema.parse(input)
  const enrollment = await loadEnrollmentForLearner(p, enrollmentId)
  if (enrollment.userId !== p.id) throw new ForbiddenError("Cette inscription n'est pas la vôtre")
  if (enrollment.status !== 'ACTIVE' && enrollment.status !== 'COMPLETED') {
    throw new PreconditionError("L'inscription n'est pas active", { status: enrollment.status })
  }

  const ctx = await resolveActivityContext(prisma, data.activityId)
  if (ctx.version.id !== enrollment.courseVersionId) throw new PreconditionError("Cette activité n'appartient pas à la version suivie")
  const now = Date.now()
  if (ctx.activity.availableFrom && ctx.activity.availableFrom.getTime() > now) {
    throw new PreconditionError("Cette activité n'est pas encore disponible", { availableFrom: ctx.activity.availableFrom })
  }

  const existing = await prisma.activityCompletion.findUnique({
    where: { enrollmentId_activityId: { enrollmentId, activityId: data.activityId } },
    select: { timeSpentSeconds: true, completed: true },
  })
  const projectedTime = Math.min(timeCapFor(ctx.activity.durationMinutes), (existing?.timeSpentSeconds ?? 0) + data.timeSpentSeconds)

  let completed: boolean | undefined
  const rule = ctx.activity.completionRule
  if (rule === 'VIEW') completed = true
  else if (rule === 'TIME_SPENT') {
    const threshold = ctx.activity.durationMinutes ? Math.ceil(ctx.activity.durationMinutes * 60 * TIME_SPENT_THRESHOLD) : 0
    completed = projectedTime >= threshold || (data.completed === true && threshold === 0)
  } else if (SERVICE_MANAGED_RULES.includes(rule)) {
    completed = undefined
  }

  const progress = await completeActivityForEnrollment(
    enrollmentId,
    { id: ctx.activity.id, durationMinutes: ctx.activity.durationMinutes },
    { completed, timeSpentDelta: data.timeSpentSeconds, progressData: data.progressData },
    { actorId: p.id },
  )
  const completion = await prisma.activityCompletion.findUniqueOrThrow({ where: { enrollmentId_activityId: { enrollmentId, activityId: data.activityId } } })
  return { completion, progress }
}

/** Achèvement manuel par un formateur (règle MANUAL ou régularisation). */
export async function markManual(principal: Principal, enrollmentId: string, activityId: string, options: { completed?: boolean; score?: number | null } = {}, meta: RequestMeta = {}) {
  const enrollment = await loadEnrollmentForLearner(requirePrincipal(principal), enrollmentId)
  const p = assertCan(principal, 'grade.write', { courseId: enrollment.courseId, cohortId: enrollment.cohortId })
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.version.id !== enrollment.courseVersionId) throw new PreconditionError("Cette activité n'appartient pas à la version suivie")
  const completed = options.completed ?? true
  if (!completed) {
    await prisma.activityCompletion.updateMany({ where: { enrollmentId, activityId }, data: { completed: false, completedAt: null } })
  }
  const progress = completed
    ? await completeActivityForEnrollment(enrollmentId, { id: activityId, durationMinutes: ctx.activity.durationMinutes }, { completed: true, score: options.score ?? undefined, keepBestScore: false }, { actorId: p.id })
    : await recomputeProgress(enrollmentId, { actorId: p.id })
  await audit('grade.recorded', { type: 'ActivityCompletion', id: `${enrollmentId}:${activityId}` }, auditContext(p, meta), {
    after: { enrollmentId, activityId, completed, score: options.score ?? null },
  })
  return progress
}

export interface ActivityProgressItem {
  id: string
  title: string
  type: ActivityType
  position: number
  isRequired: boolean
  completionRule: CompletionRule
  durationMinutes: number | null
  dueAt: Date | null
  availableFrom: Date | null
  isAvailable: boolean
  completed: boolean
  completedAt: Date | null
  score: number | null
  timeSpentSeconds: number
}

export interface ProgressSummary {
  enrollment: {
    id: string
    userId: string
    courseId: string
    courseVersionId: string
    cohortId: string | null
    status: string
    progressPercent: number
    score: number | null
    timeSpentSeconds: number
    startedAt: Date | null
    completedAt: Date | null
    lastActivityId: string | null
    lastActivityAt: Date | null
  }
  course: { id: string; slug: string; title: string; code: string }
  counts: { total: number; completed: number; required: number; requiredCompleted: number }
  modules: Array<{
    id: string
    title: string
    position: number
    isOptional: boolean
    completed: number
    total: number
    lessons: Array<{ id: string; slug: string; title: string; position: number; completed: number; total: number; activities: ActivityProgressItem[] }>
  }>
  nextActivity: NextActivity | null
}

export interface NextActivity {
  activityId: string
  title: string
  type: ActivityType
  lessonId: string
  lessonSlug: string
  moduleId: string
  courseId: string
  href: string
}

function pickNext(activities: VersionActivity[], completedIds: Set<string>, courseId: string): NextActivity | null {
  const now = Date.now()
  const available = activities.filter((a) => !a.availableFrom || a.availableFrom.getTime() <= now)
  const candidate =
    available.find((a) => isRequiredActivity(a) && !completedIds.has(a.id)) ??
    available.find((a) => !completedIds.has(a.id)) ??
    null
  if (!candidate) return null
  return {
    activityId: candidate.id,
    title: candidate.title,
    type: candidate.type,
    lessonId: candidate.lessonId,
    lessonSlug: candidate.lessonSlug,
    moduleId: candidate.moduleId,
    courseId,
    href: `/apprendre/${courseId}/${candidate.lessonId}?activite=${candidate.id}`,
  }
}

/** Vue complète de la progression d'une inscription (apprenant, formateur, coordination, organisation). */
export async function summary(enrollmentId: string, principal?: Principal | null): Promise<ProgressSummary> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { select: { id: true, slug: true, title: true, code: true } }, cohort: { select: { trainerId: true } } },
  })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  if (principal) {
    const allowed =
      enrollment.userId === principal.id ||
      enrollment.cohort?.trainerId === principal.id ||
      can(principal, 'course.teach', { courseId: enrollment.courseId, cohortId: enrollment.cohortId }) ||
      (enrollment.organizationId ? can(principal, 'organization.read', { organizationId: enrollment.organizationId }) : false)
    if (!allowed) throw new NotFoundError('Inscription', enrollmentId)
  }

  const [activities, completions] = await Promise.all([
    loadVersionActivities(prisma, enrollment.courseVersionId),
    prisma.activityCompletion.findMany({ where: { enrollmentId } }),
  ])
  const byActivity = new Map(completions.map((c) => [c.activityId, c] as const))
  const completedIds = new Set(completions.filter((c) => c.completed).map((c) => c.activityId))
  const now = Date.now()

  const modulesMap = new Map<string, ProgressSummary['modules'][number]>()
  for (const a of activities) {
    let module = modulesMap.get(a.moduleId)
    if (!module) {
      module = { id: a.moduleId, title: a.moduleTitle, position: a.modulePosition, isOptional: a.moduleIsOptional, completed: 0, total: 0, lessons: [] }
      modulesMap.set(a.moduleId, module)
    }
    let lesson = module.lessons.find((l) => l.id === a.lessonId)
    if (!lesson) {
      lesson = { id: a.lessonId, slug: a.lessonSlug, title: a.lessonTitle, position: a.lessonPosition, completed: 0, total: 0, activities: [] }
      module.lessons.push(lesson)
    }
    const completion = byActivity.get(a.id)
    const item: ActivityProgressItem = {
      id: a.id,
      title: a.title,
      type: a.type,
      position: a.position,
      isRequired: isRequiredActivity(a),
      completionRule: a.completionRule,
      durationMinutes: a.durationMinutes,
      dueAt: a.dueAt,
      availableFrom: a.availableFrom,
      isAvailable: !a.availableFrom || a.availableFrom.getTime() <= now,
      completed: completion?.completed ?? false,
      completedAt: completion?.completedAt ?? null,
      score: completion?.score ?? null,
      timeSpentSeconds: completion?.timeSpentSeconds ?? 0,
    }
    lesson.activities.push(item)
    lesson.total++
    module.total++
    if (item.completed) {
      lesson.completed++
      module.completed++
    }
  }

  const required = activities.filter(isRequiredActivity)
  return {
    enrollment: {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      courseVersionId: enrollment.courseVersionId,
      cohortId: enrollment.cohortId,
      status: enrollment.status,
      progressPercent: enrollment.progressPercent,
      score: enrollment.score,
      timeSpentSeconds: enrollment.timeSpentSeconds,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      lastActivityId: enrollment.lastActivityId,
      lastActivityAt: enrollment.lastActivityAt,
    },
    course: enrollment.course,
    counts: {
      total: activities.length,
      completed: completedIds.size,
      required: required.length,
      requiredCompleted: required.filter((a) => completedIds.has(a.id)).length,
    },
    modules: [...modulesMap.values()].sort((a, b) => a.position - b.position),
    nextActivity: pickNext(activities, completedIds, enrollment.courseId),
  }
}

/** Prochaine activité à réaliser (première activité requise non achevée, sinon première non achevée). */
export async function nextActivity(enrollmentId: string): Promise<NextActivity | null> {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { courseId: true, courseVersionId: true } })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  const [activities, completions] = await Promise.all([
    loadVersionActivities(prisma, enrollment.courseVersionId),
    prisma.activityCompletion.findMany({ where: { enrollmentId, completed: true }, select: { activityId: true } }),
  ])
  return pickNext(activities, new Set(completions.map((c) => c.activityId)), enrollment.courseId)
}

/**
 * Contenu d'une activité pour l'apprenant (page /apprendre) : vérifie l'inscription,
 * la disponibilité, et renvoie le contenu typé, l'alternative bas débit et l'état d'achèvement.
 */
export async function activityView(principal: Principal, enrollmentId: string, activityId: string) {
  const p = requirePrincipal(principal)
  const enrollment = await loadEnrollmentForLearner(p, enrollmentId)
  const trainer = enrollment.cohortId ? await prisma.cohort.findUnique({ where: { id: enrollment.cohortId }, select: { trainerId: true } }) : null
  const allowed = enrollment.userId === p.id || trainer?.trainerId === p.id || can(p, 'course.teach', { courseId: enrollment.courseId, cohortId: enrollment.cohortId })
  if (!allowed) throw new ForbiddenError("Cette inscription n'est pas la vôtre")
  const ctx = await resolveActivityContext(prisma, activityId)
  if (ctx.version.id !== enrollment.courseVersionId) throw new NotFoundError('Activité', activityId)

  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id: activityId },
    include: {
      quiz: { select: { id: true, description: true, timeLimitMinutes: true, maxAttempts: true, passScore: true, isSurvey: true, showCorrection: true, _count: { select: { questions: true } } } },
      assignment: { select: { id: true, description: true, allowFile: true, allowText: true, allowedMimeTypes: true, maxFileSizeMb: true, dueAt: true, lateAllowed: true, maxScore: true } },
      liveSessions: { orderBy: { startsAt: 'asc' }, include: { trainingSession: { select: { id: true, cohortId: true, location: true, meetingUrl: true } } } },
      forum: { select: { id: true, slug: true, title: true, isLocked: true } },
      resource: { select: { id: true, title: true, fileUrl: true, fileName: true, mimeType: true, kind: true, externalUrl: true } },
    },
  })
  const completion = await prisma.activityCompletion.findUnique({ where: { enrollmentId_activityId: { enrollmentId, activityId } } })
  const isAvailable = !activity.availableFrom || activity.availableFrom.getTime() <= Date.now()
  const activities = await loadVersionActivities(prisma, enrollment.courseVersionId)
  const index = activities.findIndex((a) => a.id === activityId)
  const previous = index > 0 ? activities[index - 1] ?? null : null
  const next = index >= 0 ? activities[index + 1] ?? null : null

  return {
    activity: {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      instructions: activity.instructions,
      content: isAvailable ? readActivityContent(activity.type, activity.content) : null,
      lowBandwidthAlternative: activity.lowBandwidthAlternative,
      durationMinutes: activity.durationMinutes,
      isRequired: activity.isRequired,
      completionRule: activity.completionRule,
      maxScore: activity.maxScore,
      passScore: activity.passScore,
      availableFrom: activity.availableFrom,
      dueAt: activity.dueAt,
      isAvailable,
      quiz: activity.quiz,
      assignment: activity.assignment,
      liveSessions: activity.liveSessions,
      forum: activity.forum,
      resource: activity.resource,
    },
    lesson: ctx.lesson,
    module: ctx.module,
    course: ctx.course,
    completion,
    navigation: {
      previous: previous ? { activityId: previous.id, lessonId: previous.lessonId, title: previous.title } : null,
      next: next ? { activityId: next.id, lessonId: next.lessonId, title: next.title } : null,
    },
  }
}

export type { ProgressState }
export { recomputeProgress }
