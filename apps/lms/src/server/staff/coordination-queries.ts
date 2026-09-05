import 'server-only'
import { prisma } from '@fetrag/db'
import { ForbiddenError, can, type Principal } from '@fetrag/domain'
import { attendance, certification, cohorts, enrollments } from '@fetrag/lms-core'

/**
 * Lecteurs composés de l'espace coordination (cohortes, certificats, sélecteurs).
 */

export type CoordinationCohort = Awaited<ReturnType<typeof cohorts.get>>
export type CertificateTemplateSummary = Awaited<ReturnType<typeof certification.listTemplates>>[number]

/** Cohorte pour la coordination : détail, modèles de certificats disponibles, assiduité. */
export async function loadCoordinationCohort(principal: Principal, cohortId: string) {
  if (!can(principal, 'cohort.manage')) throw new ForbiddenError('Gestion des cohortes réservée à la coordination')
  const cohort = await cohorts.get(principal, cohortId)
  const [templates, attendanceSummary, liveActivities] = await Promise.all([
    certification.listTemplates(principal).catch(() => [] as CertificateTemplateSummary[]),
    attendance.summaryForCohort(principal, cohortId).catch(() => null),
    prisma.activity.findMany({
      where: { type: 'LIVE_SESSION', lesson: { module: { courseVersionId: cohort.courseVersionId } } },
      orderBy: [{ lesson: { module: { position: 'asc' } } }, { lesson: { position: 'asc' } }, { position: 'asc' }],
      select: { id: true, title: true, liveSessions: { select: { id: true, trainingSessionId: true } } },
    }),
  ])
  const courseTemplates = templates.filter((t) => !t.courseId || t.courseId === cohort.courseId)
  return { cohort, templates: courseTemplates, attendanceSummary, liveActivities }
}

/** Inscriptions en attente de validation (politique APPROVAL). */
export async function listPendingEnrollments(principal: Principal, query: { page?: number; pageSize?: number } = {}) {
  return enrollments.listPending(principal, query)
}

/** Cohortes actives pour les sélecteurs (planning, portées de rôle). */
export async function listCohortsForSelect() {
  return prisma.cohort.findMany({
    where: { status: { not: 'CANCELLED' } },
    orderBy: [{ startsAt: 'desc' }, { name: 'asc' }],
    take: 300,
    select: { id: true, code: true, name: true, status: true, course: { select: { title: true } } },
  })
}

/** Sessions du jour (fuseau Libreville) pour le tableau de bord de la coordination. */
export async function listSessionsToday(principal: Principal) {
  if (!can(principal, 'cohort.manage') && !can(principal, 'reports.read')) return []
  const now = new Date()
  const libreville = new Date(now.getTime() + 60 * 60 * 1000)
  const start = new Date(Date.UTC(libreville.getUTCFullYear(), libreville.getUTCMonth(), libreville.getUTCDate(), -1, 0, 0))
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return prisma.trainingSession.findMany({
    where: { startsAt: { gte: start, lt: end } },
    orderBy: { startsAt: 'asc' },
    include: { cohort: { select: { id: true, code: true, name: true, trainer: { select: { name: true } }, course: { select: { title: true } }, _count: { select: { members: true } } } }, _count: { select: { attendances: true } } },
  })
}

/** Cohortes clôturées ou en cours dont des membres terminés n'ont pas encore de certificat (alerte « certificats à émettre »). */
export async function countCertificatesToIssue(): Promise<number> {
  return prisma.enrollment.count({ where: { status: 'COMPLETED', cohortId: { not: null }, certificates: { none: { status: 'ISSUED' } } } })
}

/** Alertes de pilotage : demandes anciennes sans réponse, cohortes sans formateur, sessions sans émargement. */
export async function coordinationAlerts() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000)
  const [staleRequests, cohortsWithoutTrainer, pastSessionsWithoutAttendance, certificatesToIssue] = await Promise.all([
    prisma.trainingRequest.count({ where: { status: 'SUBMITTED', submittedAt: { lte: tenDaysAgo } } }),
    prisma.cohort.count({ where: { status: { in: ['PLANNED', 'OPEN', 'RUNNING'] }, trainerId: null } }),
    prisma.trainingSession.count({ where: { endsAt: { lt: new Date() }, attendances: { none: {} }, cohort: { status: { in: ['OPEN', 'RUNNING'] } } } }),
    countCertificatesToIssue(),
  ])
  return { staleRequests, cohortsWithoutTrainer, pastSessionsWithoutAttendance, certificatesToIssue }
}
