import { attendanceInputSchema, type attendanceStatusSchema } from '@fetrag/contracts'
import { prisma, type AttendanceStatus } from '@fetrag/db'
import { audit, emit, ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import type { z } from 'zod'

type AttendanceStatusName = z.infer<typeof attendanceStatusSchema>
import { computeAttendanceRate, computeCohortAttendance, type AttendanceRateResult } from './internal/attendance-rate'
import { completeActivityForEnrollment } from './internal/completion'
import { canTeachCohort } from './cohorts'
import { auditContext, can, requirePrincipal } from './lib/access'
import type { BulkResult, Principal, RequestMeta } from './types'

export type AttendanceInput = z.input<typeof attendanceInputSchema>

/** Retard toléré (minutes) avant qu'un auto-émargement soit marqué LATE. */
const LATE_AFTER_MINUTES = 15
/** Ouverture de l'auto-émargement avant le début (minutes). */
const CHECKIN_WINDOW_BEFORE_MINUTES = 15

const PRESENT_LIKE: AttendanceStatus[] = ['PRESENT', 'LATE']

async function loadSession(sessionId: string) {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      cohort: { select: { id: true, code: true, name: true, courseId: true, courseVersionId: true, organizationId: true, trainerId: true } },
      liveSession: { select: { id: true, activityId: true, activity: { select: { id: true, completionRule: true, durationMinutes: true, title: true } } } },
    },
  })
  if (!session) throw new NotFoundError('Session', sessionId)
  return session
}

function assertRecorder(principal: Principal, cohort: { id: string; courseId: string; organizationId: string | null; trainerId: string | null }): Principal {
  const p = requirePrincipal(principal)
  if (can(p, 'attendance.record', { cohortId: cohort.id, courseId: cohort.courseId, organizationId: cohort.organizationId }) || cohort.trainerId === p.id) return p
  throw new ForbiddenError("Vous n'êtes pas autorisé à émarger cette session")
}

/** Achève l'activité LIVE_SESSION liée (règle ATTEND) pour un participant présent ou en retard. */
async function completeLinkedActivity(session: Awaited<ReturnType<typeof loadSession>>, userId: string, actorId: string | null): Promise<void> {
  const live = session.liveSession
  if (!live || live.activity.completionRule !== 'ATTEND') return
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, cohortId: session.cohort.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
    select: { id: true },
  })
  if (!enrollment) return
  await completeActivityForEnrollment(enrollment.id, { id: live.activity.id, durationMinutes: live.activity.durationMinutes }, { completed: true, progressData: { sessionId: session.id } }, { actorId })
}

/**
 * Émargement d'une session par le formateur (LMS-06) : upsert des présences,
 * achèvement de l'activité en direct liée pour les présents/retards, audit et événement.
 */
export async function record(principal: Principal, input: AttendanceInput, meta: RequestMeta = {}): Promise<BulkResult<{ userId: string; status: AttendanceStatusName }>> {
  const data = attendanceInputSchema.parse(input)
  const session = await loadSession(data.sessionId)
  const p = assertRecorder(principal, session.cohort)
  const members = await prisma.cohortMember.findMany({ where: { cohortId: session.cohort.id }, select: { userId: true } })
  const memberIds = new Set(members.map((m) => m.userId))
  const done: Array<{ userId: string; status: AttendanceStatusName }> = []
  const skipped: Array<{ id: string; reason: string }> = []
  const now = new Date()

  for (const entry of data.entries) {
    if (!memberIds.has(entry.userId)) {
      skipped.push({ id: entry.userId, reason: "N'est pas membre de la cohorte" })
      continue
    }
    const present = PRESENT_LIKE.includes(entry.status)
    await prisma.attendance.upsert({
      where: { sessionId_userId: { sessionId: session.id, userId: entry.userId } },
      create: { sessionId: session.id, userId: entry.userId, status: entry.status, note: entry.note ?? null, recordedById: p.id, checkedInAt: present ? now : null },
      update: { status: entry.status, note: entry.note ?? null, recordedById: p.id, checkedInAt: present ? now : null },
    })
    if (present) await completeLinkedActivity(session, entry.userId, p.id)
    done.push({ userId: entry.userId, status: entry.status })
  }

  await audit('attendance.recorded', { type: 'TrainingSession', id: session.id }, auditContext(p, meta), {
    after: { cohortId: session.cohort.id, entries: done.length, skipped: skipped.length },
  })
  await emit('session.attendance.recorded', { sessionId: session.id, cohortId: session.cohort.id, entries: done }, { actorId: p.id })
  return { done, skipped }
}

/** Auto-émargement d'un participant (classe virtuelle / hybride) dans la fenêtre de la session. */
export async function selfCheckIn(principal: Principal, sessionId: string, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const session = await loadSession(sessionId)
  const member = await prisma.cohortMember.findUnique({ where: { cohortId_userId: { cohortId: session.cohort.id, userId: p.id } }, select: { id: true } })
  if (!member) throw new ForbiddenError("Vous n'êtes pas membre de cette cohorte")
  if (session.mode === 'IN_PERSON') throw new PreconditionError("L'émargement en présentiel est réalisé par le formateur")
  const now = Date.now()
  const opensAt = session.startsAt.getTime() - CHECKIN_WINDOW_BEFORE_MINUTES * 60 * 1000
  if (now < opensAt || now > session.endsAt.getTime()) throw new PreconditionError("L'émargement n'est pas ouvert pour cette session")
  const status: AttendanceStatus = now > session.startsAt.getTime() + LATE_AFTER_MINUTES * 60 * 1000 ? 'LATE' : 'PRESENT'
  const attendance = await prisma.attendance.upsert({
    where: { sessionId_userId: { sessionId, userId: p.id } },
    create: { sessionId, userId: p.id, status, checkedInAt: new Date(now), recordedById: p.id },
    update: { status, checkedInAt: new Date(now), recordedById: p.id },
  })
  await completeLinkedActivity(session, p.id, p.id)
  await audit('attendance.recorded', { type: 'TrainingSession', id: sessionId }, auditContext(p, meta), { after: { self: true, status } })
  return attendance
}

/** Assiduité d'une inscription : (présents + retards) / sessions passées. */
export async function rateFor(enrollment: { userId: string; cohortId: string | null }): Promise<AttendanceRateResult> {
  if (!enrollment.cohortId) return { rate: null, pastSessions: 0, totalSessions: 0, attended: 0 }
  return computeAttendanceRate(prisma, enrollment.userId, enrollment.cohortId)
}

/** Feuille d'émargement : membres de la cohorte et statut enregistré (null = non renseigné). */
export async function sheet(principal: Principal, sessionId: string) {
  const p = requirePrincipal(principal)
  const session = await loadSession(sessionId)
  const canRead =
    canTeachCohort(p, session.cohort) ||
    can(p, 'attendance.record', { cohortId: session.cohort.id, courseId: session.cohort.courseId }) ||
    (session.cohort.organizationId ? can(p, 'organization.read', { organizationId: session.cohort.organizationId }) : false)
  if (!canRead) throw new ForbiddenError('Accès à la feuille de présence refusé')
  const [members, attendances] = await Promise.all([
    prisma.cohortMember.findMany({
      where: { cohortId: session.cohort.id, role: 'learner' },
      orderBy: { user: { lastName: 'asc' } },
      include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, jobTitle: true, employer: true } } },
    }),
    prisma.attendance.findMany({ where: { sessionId }, include: { recordedBy: { select: { id: true, name: true } } } }),
  ])
  const byUser = new Map(attendances.map((a) => [a.userId, a] as const))
  const rows = members.map((m) => {
    const a = byUser.get(m.userId)
    return { user: m.user, status: a?.status ?? null, checkedInAt: a?.checkedInAt ?? null, note: a?.note ?? null, signatureUrl: a?.signatureUrl ?? null, recordedBy: a?.recordedBy ?? null }
  })
  const counts = { present: 0, late: 0, absent: 0, excused: 0, pending: 0 }
  for (const row of rows) {
    if (row.status === 'PRESENT') counts.present++
    else if (row.status === 'LATE') counts.late++
    else if (row.status === 'ABSENT') counts.absent++
    else if (row.status === 'EXCUSED') counts.excused++
    else counts.pending++
  }
  return {
    session: { id: session.id, title: session.title, mode: session.mode, startsAt: session.startsAt, endsAt: session.endsAt, location: session.location, meetingUrl: session.meetingUrl },
    cohort: session.cohort,
    linkedActivity: session.liveSession?.activity ?? null,
    rows,
    counts,
    canRecord: canTeachCohort(p, session.cohort) || can(p, 'attendance.record', { cohortId: session.cohort.id, courseId: session.cohort.courseId }),
  }
}

/** Synthèse d'assiduité d'une cohorte : par session et par membre. */
export async function summaryForCohort(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true, courseId: true, organizationId: true, trainerId: true } })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  const canRead = canTeachCohort(p, cohort) || (cohort.organizationId ? can(p, 'organization.read', { organizationId: cohort.organizationId }) : false)
  if (!canRead) throw new ForbiddenError("Accès à l'assiduité refusé")
  const [sessions, members, aggregate] = await Promise.all([
    prisma.trainingSession.findMany({
      where: { cohortId },
      orderBy: { startsAt: 'asc' },
      include: { attendances: { select: { status: true } } },
    }),
    prisma.cohortMember.findMany({ where: { cohortId, role: 'learner' }, include: { user: { select: { id: true, name: true, firstName: true, lastName: true } } } }),
    computeCohortAttendance(prisma, cohortId),
  ])
  return {
    pastSessions: aggregate.pastSessions,
    totalSessions: aggregate.totalSessions,
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      present: s.attendances.filter((a) => a.status === 'PRESENT').length,
      late: s.attendances.filter((a) => a.status === 'LATE').length,
      absent: s.attendances.filter((a) => a.status === 'ABSENT').length,
      excused: s.attendances.filter((a) => a.status === 'EXCUSED').length,
    })),
    members: members.map((m) => ({ user: m.user, rate: aggregate.pastSessions > 0 ? (aggregate.byUser.get(m.userId) ?? 0) : null })),
    averageRate: aggregate.pastSessions > 0 && members.length > 0 ? Math.round(members.reduce((s, m) => s + (aggregate.byUser.get(m.userId) ?? 0), 0) / members.length) : null,
  }
}
