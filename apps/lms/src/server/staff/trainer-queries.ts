import 'server-only'
import { prisma } from '@fetrag/db'
import { NotFoundError, type Principal } from '@fetrag/domain'
import { assignments, attendance, cohorts, quizzes, reports } from '@fetrag/lms-core'

/**
 * Lecteurs composés de l'espace formateur : une cohorte avec ses participants, présences,
 * corrections en attente, statistiques et sessions. Les contrôles d'accès sont ceux des services.
 */

export type TrainerCohort = Awaited<ReturnType<typeof cohorts.get>>
export type CohortSubmission = Awaited<ReturnType<typeof assignments.listForTrainer>>[number]
export type PendingEssay = Awaited<ReturnType<typeof quizzes.listPendingEssays>>[number]
export type AttendanceSummary = Awaited<ReturnType<typeof attendance.summaryForCohort>>
export type CohortReport = Awaited<ReturnType<typeof reports.cohortReport>>
export type AttendanceSheet = Awaited<ReturnType<typeof attendance.sheet>>

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.warn('[lms-staff] lecture partielle de la cohorte', error instanceof Error ? error.message : error)
    return fallback
  }
}

/** Cohorte enseignée par le principal, avec tout ce qu'il faut pour les onglets de la fiche. */
export async function loadTrainerCohort(principal: Principal, cohortId: string) {
  const cohort = await cohorts.get(principal, cohortId)
  if (!cohort.canTeach) throw new NotFoundError('Cohorte', cohortId)
  const [attendanceSummary, submissions, essays, report, liveActivities] = await Promise.all([
    safe(attendance.summaryForCohort(principal, cohortId), null),
    safe(assignments.listForTrainer(principal, { cohortId }), [] as CohortSubmission[]),
    safe(quizzes.listPendingEssays(principal, { cohortId }), [] as PendingEssay[]),
    safe(reports.cohortReport(cohortId, principal), null),
    prisma.activity.findMany({
      where: { type: 'LIVE_SESSION', lesson: { module: { courseVersionId: cohort.courseVersionId } } },
      orderBy: [{ lesson: { module: { position: 'asc' } } }, { lesson: { position: 'asc' } }, { position: 'asc' }],
      select: { id: true, title: true, liveSessions: { select: { id: true, trainingSessionId: true } } },
    }),
  ])
  return { cohort, attendanceSummary, submissions, essays, report, liveActivities }
}

/** Feuille d'émargement d'une session (null si introuvable ou hors portée). */
export async function loadAttendanceSheet(principal: Principal, sessionId: string): Promise<AttendanceSheet | null> {
  try {
    return await attendance.sheet(principal, sessionId)
  } catch {
    return null
  }
}

/** Remise à corriger avec le contexte du devoir. */
export async function loadSubmission(principal: Principal, submissionId: string) {
  return assignments.get(principal, submissionId)
}
export type SubmissionDetail = Awaited<ReturnType<typeof loadSubmission>>

/** Tentative avec compositions à corriger. */
export async function loadEssayReview(principal: Principal, attemptId: string) {
  return quizzes.getAttemptReview(principal, attemptId)
}
export type EssayReview = Awaited<ReturnType<typeof loadEssayReview>>

/** Corrections en attente sur l'ensemble des cohortes du formateur (tableau de bord). */
export async function loadTrainerCorrections(principal: Principal) {
  const [submissions, essays] = await Promise.all([
    safe(assignments.listForTrainer(principal, { status: ['SUBMITTED', 'LATE'] }), [] as CohortSubmission[]),
    safe(quizzes.listPendingEssays(principal, {}), [] as PendingEssay[]),
  ])
  return { submissions, essays }
}
