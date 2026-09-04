import { completionRulesSchema, type CompletionRules } from '@fetrag/contracts'
import { type ActivityCompletion, type EnrollmentStatus } from '@fetrag/db'
import { audit, emit } from '@fetrag/domain'
import { autoIssueForEnrollment } from '../certification'
import { safeNotifyUser } from '../lib/integrations'
import { asRecord, toJsonValue } from '../lib/json'
import { percent } from '../lib/text'
import { computeAttendanceRate } from './attendance-rate'
import { isRequiredActivity, loadVersionActivities, type VersionActivity } from './course-tree'
import { prisma, type Db } from './db'

/** Plafond absolu de temps comptabilisé par activité (8 h). */
export const MAX_TIME_PER_ACTIVITY_SECONDS = 8 * 3600

/** Plafond de temps d'une activité : 4 fois sa durée indicative (minimum 30 min), sans dépasser 8 h. */
export function timeCapFor(durationMinutes: number | null | undefined): number {
  if (!durationMinutes || durationMinutes <= 0) return MAX_TIME_PER_ACTIVITY_SECONDS
  return Math.min(MAX_TIME_PER_ACTIVITY_SECONDS, Math.max(30 * 60, durationMinutes * 60 * 4))
}

export interface CompletionUpdate {
  /** Force l'achèvement (jamais remis à faux une fois acquis). */
  completed?: boolean
  /** Score en % (0-100) ; par défaut le meilleur score est conservé. */
  score?: number | null
  keepBestScore?: boolean
  /** Temps supplémentaire à cumuler (secondes). */
  timeSpentDelta?: number
  progressData?: Record<string, unknown>
}

/** Crée ou met à jour l'ActivityCompletion (unique enrollmentId + activityId). */
export async function upsertCompletion(
  db: Db,
  enrollmentId: string,
  activity: { id: string; durationMinutes: number | null },
  update: CompletionUpdate,
): Promise<ActivityCompletion> {
  const existing = await db.activityCompletion.findUnique({ where: { enrollmentId_activityId: { enrollmentId, activityId: activity.id } } })
  const cap = timeCapFor(activity.durationMinutes)
  const delta = Math.max(0, Math.floor(update.timeSpentDelta ?? 0))
  const timeSpentSeconds = Math.min(cap, (existing?.timeSpentSeconds ?? 0) + delta)
  const completed = Boolean(existing?.completed) || update.completed === true

  let score: number | null = existing?.score ?? null
  if (update.score !== undefined && update.score !== null) {
    const bounded = Math.max(0, Math.min(100, Math.round(update.score)))
    score = (update.keepBestScore ?? true) && existing?.score !== null && existing?.score !== undefined ? Math.max(existing.score, bounded) : bounded
  }

  const progressData = update.progressData ? { ...asRecord(existing?.progressData), ...update.progressData } : undefined
  const completedAt = completed ? (existing?.completedAt ?? new Date()) : null

  return db.activityCompletion.upsert({
    where: { enrollmentId_activityId: { enrollmentId, activityId: activity.id } },
    create: {
      enrollmentId,
      activityId: activity.id,
      completed,
      score,
      timeSpentSeconds,
      progressData: progressData ? toJsonValue(progressData) : undefined,
      completedAt,
    },
    update: {
      completed,
      score,
      timeSpentSeconds,
      progressData: progressData ? toJsonValue(progressData) : undefined,
      completedAt,
    },
  })
}

export interface RulesEvaluation {
  satisfied: boolean
  reasons: string[]
}

/** Évalue les règles d'achèvement d'une version pour un état de progression donné. */
export function evaluateCompletionRules(
  rules: CompletionRules,
  state: {
    activities: VersionActivity[]
    completedIds: Set<string>
    score: number | null
    attendanceRate: number | null
    hasSessions: boolean
  },
): RulesEvaluation {
  const reasons: string[] = []
  const required = state.activities.filter(isRequiredActivity)
  const basis = required.length > 0 ? required : state.activities

  if (rules.requireAllActivities) {
    const missing = basis.filter((a) => !state.completedIds.has(a.id))
    if (missing.length > 0) reasons.push(`${missing.length} activité(s) requise(s) restante(s).`)
  } else if (rules.requiredActivityIds.length > 0) {
    const missing = rules.requiredActivityIds.filter((id) => !state.completedIds.has(id))
    if (missing.length > 0) reasons.push(`${missing.length} activité(s) obligatoire(s) restante(s).`)
  } else {
    const missing = basis.filter((a) => !state.completedIds.has(a.id))
    if (missing.length > 0) reasons.push(`${missing.length} activité(s) restante(s).`)
  }

  if (rules.passScore > 0 && state.score !== null && state.score < rules.passScore) {
    reasons.push(`Score global insuffisant (${state.score} % < ${rules.passScore} %).`)
  }
  if (rules.minAttendanceRate > 0 && state.hasSessions) {
    const rate = state.attendanceRate ?? 0
    if (rate < rules.minAttendanceRate) reasons.push(`Assiduité insuffisante (${rate} % < ${rules.minAttendanceRate} %).`)
  }
  return { satisfied: reasons.length === 0, reasons }
}

export interface ProgressState {
  enrollmentId: string
  status: EnrollmentStatus
  progressPercent: number
  score: number | null
  timeSpentSeconds: number
  totalActivities: number
  completedActivities: number
  requiredTotal: number
  requiredCompleted: number
  justCompleted: boolean
  certificateId: string | null
  remaining: string[]
}

/** Score global : moyenne pondérée (Activity.weight) des activités notées. */
export function computeWeightedScore(activities: VersionActivity[], completions: Array<{ activityId: string; score: number | null }>): number | null {
  const byId = new Map(activities.map((a) => [a.id, a] as const))
  let weighted = 0
  let weights = 0
  for (const completion of completions) {
    if (completion.score === null) continue
    const activity = byId.get(completion.activityId)
    if (!activity) continue
    const weight = Math.max(1, activity.weight)
    weighted += completion.score * weight
    weights += weight
  }
  return weights > 0 ? Math.round(weighted / weights) : null
}

/**
 * Recalcule la progression d'une inscription à partir des ActivityCompletion,
 * met à jour l'inscription, applique les règles d'achèvement (COMPLETED), émet
 * `course.completed`, notifie l'apprenant et déclenche l'émission automatique du certificat.
 */
export async function recomputeProgress(
  enrollmentId: string,
  options: { lastActivityId?: string | null; actorId?: string | null } = {},
): Promise<ProgressState> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      courseVersion: { select: { id: true, completionRules: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  })
  if (!enrollment) {
    return {
      enrollmentId,
      status: 'CANCELLED',
      progressPercent: 0,
      score: null,
      timeSpentSeconds: 0,
      totalActivities: 0,
      completedActivities: 0,
      requiredTotal: 0,
      requiredCompleted: 0,
      justCompleted: false,
      certificateId: null,
      remaining: [],
    }
  }

  const [activities, completions] = await Promise.all([
    loadVersionActivities(prisma, enrollment.courseVersionId),
    prisma.activityCompletion.findMany({ where: { enrollmentId }, select: { activityId: true, completed: true, score: true, timeSpentSeconds: true } }),
  ])
  const completedIds = new Set(completions.filter((c) => c.completed).map((c) => c.activityId))
  const required = activities.filter(isRequiredActivity)
  const basis = required.length > 0 ? required : activities
  const basisCompleted = basis.filter((a) => completedIds.has(a.id)).length
  const progressPercent = basis.length > 0 ? percent(basisCompleted, basis.length) : 0
  const score = computeWeightedScore(activities, completions)
  const timeSpentSeconds = completions.reduce((sum, c) => sum + c.timeSpentSeconds, 0)
  const now = new Date()

  let attendanceRate: number | null = null
  let hasSessions = false
  if (enrollment.cohortId) {
    const attendance = await computeAttendanceRate(prisma, enrollment.userId, enrollment.cohortId, now)
    attendanceRate = attendance.rate
    hasSessions = attendance.totalSessions > 0
  }

  const rules = completionRulesSchema.parse(asRecord(enrollment.courseVersion.completionRules))
  const evaluation = evaluateCompletionRules(rules, { activities, completedIds, score, attendanceRate, hasSessions })
  const justCompleted = enrollment.status === 'ACTIVE' && evaluation.satisfied

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercent,
      score,
      timeSpentSeconds,
      lastActivityId: options.lastActivityId ?? enrollment.lastActivityId,
      lastActivityAt: options.lastActivityId ? now : enrollment.lastActivityAt,
      startedAt: enrollment.startedAt ?? now,
      ...(justCompleted ? { status: 'COMPLETED' as const, completedAt: now } : {}),
    },
  })

  let certificateId: string | null = null
  if (justCompleted) {
    await prisma.statusEvent.create({
      data: {
        entityType: 'Enrollment',
        entityId: enrollmentId,
        enrollmentId,
        fromStatus: 'ACTIVE',
        toStatus: 'COMPLETED',
        actorId: options.actorId ?? null,
        comment: "Règles d'achèvement satisfaites",
      },
    })
    await audit('enrollment.status_changed', { type: 'Enrollment', id: enrollmentId }, { actorId: options.actorId ?? null }, {
      before: { status: 'ACTIVE' },
      after: { status: 'COMPLETED', progressPercent, score },
    })
    await emit(
      'course.completed',
      {
        enrollmentId,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        courseVersionId: enrollment.courseVersionId,
        cohortId: enrollment.cohortId,
        organizationId: enrollment.organizationId,
        score,
        progressPercent,
      },
      options.actorId ? { actorId: options.actorId } : {},
    )
    await safeNotifyUser(enrollment.userId, {
      title: 'Formation terminée',
      body: `Félicitations, vous avez terminé « ${enrollment.course.title} ».`,
      href: `/cours/${enrollment.course.slug}`,
      category: 'training',
      email: true,
    })
    const certificate = await autoIssueForEnrollment(enrollmentId)
    certificateId = certificate?.id ?? null
  }

  return {
    enrollmentId,
    status: justCompleted ? 'COMPLETED' : enrollment.status,
    progressPercent,
    score,
    timeSpentSeconds,
    totalActivities: activities.length,
    completedActivities: activities.filter((a) => completedIds.has(a.id)).length,
    requiredTotal: basis.length,
    requiredCompleted: basisCompleted,
    justCompleted,
    certificateId,
    remaining: evaluation.reasons,
  }
}

/** Marque une activité comme achevée pour une inscription puis recalcule la progression. */
export async function completeActivityForEnrollment(
  enrollmentId: string,
  activity: { id: string; durationMinutes: number | null },
  update: CompletionUpdate,
  options: { actorId?: string | null } = {},
): Promise<ProgressState> {
  await upsertCompletion(prisma, enrollmentId, activity, update)
  return recomputeProgress(enrollmentId, { lastActivityId: activity.id, actorId: options.actorId })
}
