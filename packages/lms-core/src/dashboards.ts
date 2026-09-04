import { prisma } from '@fetrag/db'
import { ForbiddenError } from '@fetrag/domain'
import { listForTrainer as listCohortsForTrainer, listUpcomingSessions } from './cohorts'
import { listForUser as listAssignmentsForUser } from './assignments'
import { listPendingEssays } from './quizzes'
import { pendingCoordinationStatuses } from './trainingRequests'
import { assertCan, assertOrganizationAccess, can, isCoordination, requirePrincipal } from './lib/access'
import { displayName, percent } from './lib/text'
import { loadVersionActivities, isRequiredActivity } from './internal/course-tree'
import type { Principal } from './types'

/**
 * Tableaux de bord prêts à afficher : compteurs, listes d'échéances, sessions, résultats,
 * certificats, demandes. Les pages ne contiennent aucune logique métier.
 */

// -----------------------------------------------------------------------------
// Apprenant (LMS-08)
// -----------------------------------------------------------------------------

export async function learner(principal: Principal) {
  const p = requirePrincipal(principal)
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 3600 * 1000)
  const [user, enrollments, upcomingSessions, assignments, recentAttempts, certificates, unreadNotifications, recentSubmissions] = await Promise.all([
    prisma.user.findUnique({ where: { id: p.id }, select: { id: true, name: true, firstName: true, lastName: true, email: true, image: true } }),
    prisma.enrollment.findMany({
      where: { userId: p.id, status: { in: ['ACTIVE', 'PENDING', 'COMPLETED'] } },
      orderBy: [{ status: 'asc' }, { lastActivityAt: 'desc' }],
      include: {
        course: { select: { id: true, slug: true, title: true, code: true, pillar: true, coverImageUrl: true, durationHours: true, modality: true } },
        cohort: { select: { id: true, name: true, startsAt: true, endsAt: true, status: true } },
        certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true } },
      },
    }),
    listUpcomingSessions(p, { limit: 5 }),
    listAssignmentsForUser(p),
    prisma.attempt.findMany({
      where: { userId: p.id, status: { in: ['SUBMITTED', 'GRADED'] }, quiz: { isSurvey: false } },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      select: { id: true, status: true, percent: true, passed: true, submittedAt: true, quiz: { select: { activity: { select: { id: true, title: true, lesson: { select: { module: { select: { courseVersion: { select: { course: { select: { id: true, slug: true, title: true } } } } } } } } } } } } },
    }),
    prisma.certificate.findMany({ where: { userId: p.id }, orderBy: { issuedAt: 'desc' }, take: 5, select: { id: true, number: true, kind: true, status: true, courseTitle: true, issuedAt: true, pdfUrl: true } }),
    prisma.notification.count({ where: { userId: p.id, readAt: null, channel: 'IN_APP' } }),
    prisma.submission.findMany({
      where: { userId: p.id, status: { in: ['GRADED', 'RETURNED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, status: true, assignmentId: true, grade: { select: { score: true, maxScore: true } }, assignment: { select: { activity: { select: { title: true } } } } },
    }),
  ])

  const active = enrollments.filter((e) => e.status === 'ACTIVE')
  const completed = enrollments.filter((e) => e.status === 'COMPLETED')
  const nextSteps = await Promise.all(
    active.slice(0, 6).map(async (e) => {
      const [activities, done] = await Promise.all([
        loadVersionActivities(prisma, e.courseVersionId),
        prisma.activityCompletion.findMany({ where: { enrollmentId: e.id, completed: true }, select: { activityId: true } }),
      ])
      const doneIds = new Set(done.map((d) => d.activityId))
      const next = activities.find((a) => isRequiredActivity(a) && !doneIds.has(a.id) && (!a.availableFrom || a.availableFrom <= now)) ?? activities.find((a) => !doneIds.has(a.id)) ?? null
      return { enrollmentId: e.id, next: next ? { activityId: next.id, title: next.title, type: next.type, lessonId: next.lessonId, href: `/apprendre/${e.courseId}/${next.lessonId}?activite=${next.id}` } : null }
    }),
  )
  const nextByEnrollment = new Map(nextSteps.map((n) => [n.enrollmentId, n.next] as const))

  const deadlines = [
    ...assignments
      .filter((a) => a.dueAt && (a.state === 'todo' || a.state === 'draft' || a.state === 'returned') && a.dueAt <= in30Days)
      .map((a) => ({ kind: 'assignment' as const, title: a.activity.title, courseTitle: a.course.title, dueAt: a.dueAt as Date, href: `/devoirs/${a.assignment.id}`, overdue: a.overdue })),
    ...upcomingSessions.map((s) => ({ kind: 'session' as const, title: s.title, courseTitle: s.cohort.course.title, dueAt: s.startsAt, href: '/calendrier', overdue: false })),
  ].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())

  return {
    user: user ? { ...user, displayName: displayName(user) } : null,
    stats: {
      active: active.length,
      completed: completed.length,
      pending: enrollments.filter((e) => e.status === 'PENDING').length,
      certificates: certificates.filter((c) => c.status === 'ISSUED').length,
      averageProgress: active.length ? Math.round(active.reduce((s, e) => s + e.progressPercent, 0) / active.length) : 0,
      totalTimeSeconds: enrollments.reduce((s, e) => s + e.timeSpentSeconds, 0),
      unreadNotifications,
    },
    enrollments: enrollments.map((e) => ({ ...e, nextActivity: nextByEnrollment.get(e.id) ?? null })),
    continueLearning: active.map((e) => ({ enrollment: e, next: nextByEnrollment.get(e.id) ?? null })).filter((x) => x.next).slice(0, 3),
    deadlines: deadlines.slice(0, 8),
    upcomingSessions,
    recentResults: [
      ...recentAttempts.map((a) => ({ kind: 'quiz' as const, id: a.id, title: a.quiz.activity.title, courseTitle: a.quiz.activity.lesson.module.courseVersion.course.title, percent: a.percent, passed: a.passed, status: a.status, at: a.submittedAt, href: `/evaluations/${a.quiz.activity.id}` })),
      ...recentSubmissions.map((s) => ({ kind: 'assignment' as const, id: s.id, title: s.assignment.activity.title, courseTitle: '', percent: s.grade ? percent(s.grade.score, s.grade.maxScore) : null, passed: null, status: s.status, at: null, href: `/devoirs/${s.assignmentId}` })),
    ].slice(0, 6),
    certificates,
    assignments: assignments.filter((a) => a.state !== 'graded').slice(0, 5),
  }
}

// -----------------------------------------------------------------------------
// Formateur (LMS-10)
// -----------------------------------------------------------------------------

export async function trainer(principal: Principal) {
  const p = requirePrincipal(principal)
  if (!can(p, 'course.teach') && !can(p, 'cohort.teach') && p.roles.every((r) => r.role !== 'TRAINER')) throw new ForbiddenError('Espace formateur réservé aux formateurs')
  const cohorts = await listCohortsForTrainer(p)
  const cohortIds = cohorts.map((c) => c.id)
  const [upcomingSessions, pendingSubmissions, pendingEssays, enrollmentAgg, recentThreads] = await Promise.all([
    listUpcomingSessions(p, { limit: 5 }),
    prisma.submission.findMany({
      where: { status: { in: ['SUBMITTED', 'LATE'] }, ...(cohortIds.length ? { user: { cohortMembers: { some: { cohortId: { in: cohortIds } } } } } : { id: { in: [] } }) },
      orderBy: { submittedAt: 'asc' },
      take: 10,
      include: { user: { select: { id: true, name: true, firstName: true, lastName: true } }, assignment: { select: { id: true, activity: { select: { title: true } } } } },
    }),
    cohortIds.length ? listPendingEssays(p, {}).catch(() => []) : Promise.resolve([]),
    prisma.enrollment.aggregate({ where: { cohortId: { in: cohortIds } }, _avg: { progressPercent: true, score: true }, _count: { _all: true } }),
    prisma.forumThread.findMany({
      where: { forum: { cohortId: { in: cohortIds } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, updatedAt: true, forum: { select: { slug: true } }, author: { select: { name: true } }, _count: { select: { posts: true } } },
    }),
  ])
  const running = cohorts.filter((c) => c.status === 'RUNNING' || c.status === 'OPEN')
  return {
    stats: {
      cohorts: cohorts.length,
      running: running.length,
      learners: enrollmentAgg._count._all,
      averageProgress: Math.round(enrollmentAgg._avg.progressPercent ?? 0),
      averageScore: enrollmentAgg._avg.score === null ? null : Math.round(enrollmentAgg._avg.score),
      pendingCorrections: pendingSubmissions.length + pendingEssays.length,
    },
    cohorts,
    upcomingSessions,
    pendingSubmissions: pendingSubmissions.map((s) => ({ id: s.id, learner: displayName(s.user), activityTitle: s.assignment.activity.title, submittedAt: s.submittedAt, status: s.status, assignmentId: s.assignment.id })),
    pendingEssays,
    recentThreads,
  }
}

// -----------------------------------------------------------------------------
// Organisation (LMS-09)
// -----------------------------------------------------------------------------

export async function organization(principal: Principal, organizationId: string) {
  const p = assertOrganizationAccess(principal, organizationId)
  const [org, requestsByStatus, pendingRequests, memberships, enrollmentAgg, enrollmentsByStatus, certificates, cohorts, recentDecisions, upcomingSessions] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true, acronym: true, sector: true, city: true, logoUrl: true } }),
    prisma.trainingRequest.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.trainingRequest.findMany({
      where: { organizationId, status: { in: ['DRAFT', 'SUBMITTED', 'INFO_REQUESTED', 'RESCHEDULED', 'ACCEPTED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, reference: true, status: true, submittedAt: true, updatedAt: true, modules: { include: { course: { select: { title: true } } } }, _count: { select: { participants: true } } },
    }),
    prisma.organizationMembership.count({ where: { organizationId } }),
    prisma.enrollment.aggregate({ where: { organizationId }, _avg: { progressPercent: true, score: true }, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.certificate.count({ where: { status: 'ISSUED', enrollment: { organizationId } } }),
    prisma.cohort.findMany({
      where: { organizationId, status: { in: ['PLANNED', 'OPEN', 'RUNNING'] } },
      orderBy: { startsAt: 'asc' },
      take: 5,
      select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true, course: { select: { title: true } }, _count: { select: { members: true } } },
    }),
    prisma.decisionHistory.findMany({
      where: { request: { organizationId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, toStatus: true, comment: true, createdAt: true, request: { select: { id: true, reference: true } } },
    }),
    prisma.trainingSession.findMany({
      where: { cohort: { organizationId }, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 5,
      select: { id: true, title: true, startsAt: true, endsAt: true, mode: true, location: true, cohort: { select: { id: true, name: true } } },
    }),
  ])
  const distinctLearners = await prisma.enrollment.findMany({ where: { organizationId }, distinct: ['userId'], select: { userId: true } })
  const completed = enrollmentsByStatus.find((s) => s.status === 'COMPLETED')?._count._all ?? 0
  return {
    organization: org,
    canManage: can(p, 'training_request.create', { organizationId }),
    stats: {
      requests: requestsByStatus.reduce((s, r) => s + r._count._all, 0),
      pendingRequests: requestsByStatus.filter((r) => ['SUBMITTED', 'INFO_REQUESTED', 'RESCHEDULED', 'ACCEPTED'].includes(r.status)).reduce((s, r) => s + r._count._all, 0),
      members: memberships,
      learners: distinctLearners.length,
      enrollments: enrollmentAgg._count._all,
      completionRate: percent(completed, enrollmentAgg._count._all),
      averageProgress: Math.round(enrollmentAgg._avg.progressPercent ?? 0),
      averageScore: enrollmentAgg._avg.score === null ? null : Math.round(enrollmentAgg._avg.score),
      certificates,
    },
    requestsByStatus: Object.fromEntries(requestsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    pendingRequests,
    cohorts,
    upcomingSessions,
    recentDecisions,
  }
}

// -----------------------------------------------------------------------------
// Coordination
// -----------------------------------------------------------------------------

export async function coordination(principal: Principal) {
  const p = requirePrincipal(principal)
  if (!isCoordination(p) && !can(p, 'training_request.decide')) throw new ForbiddenError('Espace coordination réservé')
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const [requestsByStatus, pendingRequests, cohortsByStatus, upcomingSessions, certificatesThisMonth, enrollmentsThisMonth, pendingEnrollments, recentCertificates, activeLearners, coursesByStatus] = await Promise.all([
    prisma.trainingRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.trainingRequest.findMany({
      where: { status: { in: [...pendingCoordinationStatuses, 'INFO_REQUESTED'] } },
      orderBy: [{ submittedAt: 'asc' }],
      take: 10,
      select: { id: true, reference: true, status: true, submittedAt: true, preferredStart: true, organization: { select: { id: true, name: true, acronym: true } }, modules: { include: { course: { select: { title: true } } } }, _count: { select: { participants: true } } },
    }),
    prisma.cohort.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.trainingSession.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 8,
      select: { id: true, title: true, startsAt: true, endsAt: true, mode: true, location: true, cohort: { select: { id: true, code: true, name: true, trainer: { select: { name: true } }, course: { select: { title: true } } } } },
    }),
    prisma.certificate.count({ where: { issuedAt: { gte: monthStart } } }),
    prisma.enrollment.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.certificate.findMany({ orderBy: { issuedAt: 'desc' }, take: 5, select: { id: true, number: true, holderName: true, courseTitle: true, issuedAt: true, status: true } }),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  const countStatus = <T extends { status: string; _count: { _all: number } }>(rows: T[], status: string) => rows.find((r) => r.status === status)?._count._all ?? 0
  return {
    stats: {
      pendingRequests: pendingCoordinationStatuses.reduce((s, st) => s + countStatus(requestsByStatus, st), 0) + countStatus(requestsByStatus, 'INFO_REQUESTED'),
      scheduledRequests: countStatus(requestsByStatus, 'SCHEDULED') + countStatus(requestsByStatus, 'IN_PROGRESS'),
      runningCohorts: countStatus(cohortsByStatus, 'RUNNING') + countStatus(cohortsByStatus, 'OPEN'),
      plannedCohorts: countStatus(cohortsByStatus, 'PLANNED'),
      activeLearners,
      pendingEnrollments,
      enrollmentsThisMonth,
      certificatesThisMonth,
      publishedCourses: countStatus(coursesByStatus, 'PUBLISHED'),
    },
    requestsByStatus: Object.fromEntries(requestsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    cohortsByStatus: Object.fromEntries(cohortsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    pendingRequests,
    upcomingSessions,
    recentCertificates,
  }
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

export async function admin(principal: Principal) {
  const p = assertCan(principal, 'reports.read')
  const last24h = new Date(Date.now() - 24 * 3600 * 1000)
  const [users, activeUsers, roles, coursesByStatus, enrollmentsByStatus, certificatesByStatus, jobsByStatus, failedEmails, recentAudit, questions, organizations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } }),
    prisma.roleAssignment.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.certificate.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.backgroundJob.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.emailDelivery.count({ where: { status: { in: ['FAILED', 'BOUNCED'] }, createdAt: { gte: last24h } } }),
    can(p, 'audit.read') || isCoordination(p)
      ? prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, action: true, entityType: true, entityId: true, actorEmail: true, createdAt: true } })
      : Promise.resolve([]),
    prisma.question.count({ where: { isActive: true } }),
    prisma.organization.count({ where: { isActive: true } }),
  ])
  return {
    stats: {
      users,
      activeUsers30Days: activeUsers,
      organizations,
      questions,
      failedEmails24h: failedEmails,
      deadJobs: jobsByStatus.find((j) => j.status === 'DEAD')?._count._all ?? 0,
      queuedJobs: jobsByStatus.find((j) => j.status === 'QUEUED')?._count._all ?? 0,
    },
    roles: Object.fromEntries(roles.map((r) => [r.role, r._count._all])) as Partial<Record<string, number>>,
    courses: Object.fromEntries(coursesByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    enrollments: Object.fromEntries(enrollmentsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    certificates: Object.fromEntries(certificatesByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    jobs: Object.fromEntries(jobsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    recentAudit,
  }
}
