import 'server-only'
import { sanitizeHtml } from '@fetrag/cms'
import { prisma } from '@fetrag/db'
import { NotFoundError, type Principal } from '@fetrag/domain'
import { assignments, attendance, cohorts, quizzes, reports } from '@fetrag/lms-core'

/** La réponse vient-elle de l'éditeur riche (HTML) plutôt que d'un texte simple hérité ? */
function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(text)
}

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

/** Remise à corriger avec le contexte du devoir (HTML de la remise assaini côté serveur). */
export async function loadSubmission(principal: Principal, submissionId: string) {
  const submission = await assignments.get(principal, submissionId)
  return {
    ...submission,
    /** Remise de l'éditeur riche, assainie pour affichage ; null si texte simple hérité. */
    textHtml: submission.text && looksLikeHtml(submission.text) ? sanitizeHtml(submission.text) : null,
  }
}
export type SubmissionDetail = Awaited<ReturnType<typeof loadSubmission>>

/** Tentative avec compositions à corriger (réponses HTML assainies côté serveur). */
export async function loadEssayReview(principal: Principal, attemptId: string) {
  const review = await quizzes.getAttemptReview(principal, attemptId)
  return {
    ...review,
    questions: review.questions.map((question) => ({
      ...question,
      /** Composition de l'éditeur riche, assainie pour affichage ; null si texte simple hérité. */
      answerHtml: question.response?.type === 'text' && looksLikeHtml(question.response.value) ? sanitizeHtml(question.response.value) : null,
    })),
  }
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
