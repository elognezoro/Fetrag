'use server'

import { revalidatePath } from 'next/cache'
import { gradeInputSchema, idSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, ForbiddenError, can } from '@fetrag/domain'
import { assignments, attendance, auditContext, cohorts, forums, quizzes, gradeEssaySchema, sessionInputSchema } from '@fetrag/lms-core'
import { notifyUser } from '@fetrag/notifications'
import { failureState, successState, type ActionState } from './action-state'
import { formBoolean, formDate, formInt, formNullable, formString, runAction } from './context'
import { attendanceFormSchema, cohortMessageSchema, type CohortMessageInput } from './schemas'

function revalidateCohort(cohortId: string) {
  revalidatePath('/formateur')
  revalidatePath(`/formateur/cohortes/${cohortId}`)
  revalidatePath(`/coordination/cohortes/${cohortId}`)
  revalidatePath('/coordination/sessions')
}

/** Émargement en masse d'une session (PRESENT / ABSENT / LATE / EXCUSED). */
export async function recordAttendance(input: z.input<typeof attendanceFormSchema>): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = attendanceFormSchema.parse(input)
    const result = await attendance.record(principal, data, meta)
    const session = await prisma.trainingSession.findUnique({ where: { id: data.sessionId }, select: { cohortId: true } })
    if (session) revalidateCohort(session.cohortId)
    const skipped = result.skipped.length ? ` (${result.skipped.length} ignoré(s))` : ''
    return successState(`Présences enregistrées pour ${result.done.length} participant(s)${skipped}`, { payload: { done: result.done.length, skipped: result.skipped } })
  })
}

/** Notation d'un devoir (note, commentaire, grille). */
export async function gradeSubmission(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const rubricRaw = formString(formData, 'rubricScores')
    let rubricScores: Record<string, number> | undefined
    if (rubricRaw) {
      const parsed = z.record(z.coerce.number().min(0)).safeParse(JSON.parse(rubricRaw))
      rubricScores = parsed.success ? parsed.data : undefined
    }
    const data = gradeInputSchema.parse({
      submissionId: formString(formData, 'submissionId'),
      score: formInt(formData, 'score'),
      feedback: formString(formData, 'feedback') || undefined,
      rubricScores,
    })
    const result = await assignments.grade(principal, data, meta)
    const cohortId = formString(formData, 'cohortId')
    if (cohortId) revalidateCohort(cohortId)
    revalidatePath('/formateur')
    return successState(`Note enregistrée : ${result.submission.grade?.score ?? data.score}/${result.submission.assignment.maxScore}`)
  })
}

/** Renvoi d'un devoir à l'apprenant pour révision. */
export async function returnSubmission(input: { submissionId: string; feedback: string; cohortId?: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const submissionId = idSchema.parse(input.submissionId)
    const feedback = z.string().trim().min(5, 'Précisez ce que l’apprenant doit reprendre').max(5000).parse(input.feedback)
    await assignments.returnForRevision(principal, submissionId, feedback, meta)
    if (input.cohortId) revalidateCohort(input.cohortId)
    revalidatePath('/formateur')
    return successState('Devoir renvoyé à l’apprenant')
  })
}

/** Notation manuelle d'une composition (question ESSAY). */
export async function gradeEssayAnswer(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = gradeEssaySchema.parse({
      attemptId: formString(formData, 'attemptId'),
      questionId: formString(formData, 'questionId'),
      score: formInt(formData, 'score'),
      feedback: formString(formData, 'feedback') || undefined,
    })
    const result = await quizzes.gradeEssay(principal, data, meta)
    const cohortId = formString(formData, 'cohortId')
    if (cohortId) revalidateCohort(cohortId)
    revalidatePath('/formateur')
    return successState(result.finalized ? 'Composition notée : la tentative est corrigée' : `Note enregistrée, ${result.remainingEssays} composition(s) restent à corriger`)
  })
}

/** Message aux participants d'une cohorte : notification interne (+ email) et, à la demande, fil du forum de cohorte. */
export async function sendCohortMessage(input: CohortMessageInput): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = cohortMessageSchema.parse(input)
    const cohort = await prisma.cohort.findUnique({
      where: { id: data.cohortId },
      select: { id: true, courseId: true, organizationId: true, trainerId: true, name: true, members: { where: { role: 'learner' }, select: { userId: true } }, forums: { select: { id: true, slug: true } } },
    })
    if (!cohort) return failureState('Cohorte introuvable')
    const allowed = cohort.trainerId === principal.id || can(principal, 'cohort.teach', { cohortId: cohort.id, courseId: cohort.courseId, organizationId: cohort.organizationId }) || can(principal, 'cohort.manage')
    if (!allowed) throw new ForbiddenError("Vous n'enseignez pas cette cohorte")
    let sent = 0
    for (const member of cohort.members) {
      try {
        await notifyUser(member.userId, { title: data.title, body: data.body, href: '/dashboard', app: 'lms', category: 'training', email: data.email })
        sent++
      } catch (error) {
        console.error('[lms-staff] notification de cohorte impossible', member.userId, error instanceof Error ? error.message : error)
      }
    }
    let threadId: string | null = null
    const forum = cohort.forums[0]
    if (data.forum && forum) {
      const thread = await forums.createThread(principal, { forumId: forum.id, title: data.title, content: data.body }, meta)
      threadId = thread.id
    }
    await audit('content.created', { type: 'Cohort', id: cohort.id }, auditContext(principal, meta), { after: { message: data.title, recipients: sent, email: data.email, threadId } })
    revalidateCohort(cohort.id)
    return successState(`Message envoyé à ${sent} participant(s)${threadId ? ' et publié dans le forum' : ''}`)
  })
}

function sessionInputFromForm(formData: FormData) {
  return {
    title: formString(formData, 'title'),
    description: formNullable(formData, 'description'),
    mode: formString(formData, 'mode') || 'IN_PERSON',
    startsAt: formDate(formData, 'startsAt'),
    endsAt: formDate(formData, 'endsAt'),
    location: formNullable(formData, 'location'),
    meetingUrl: formNullable(formData, 'meetingUrl'),
    trainerName: formNullable(formData, 'trainerName'),
    activityId: formNullable(formData, 'activityId'),
    notify: formBoolean(formData, 'notify'),
  }
}

/** Ajout d'une session de formation (présentiel, classe virtuelle ou hybride) avec convocation. */
export async function createSession(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const cohortId = idSchema.parse(formString(formData, 'cohortId'))
    const data = sessionInputSchema.parse(sessionInputFromForm(formData))
    const session = await cohorts.addSession(principal, cohortId, data, meta)
    revalidateCohort(cohortId)
    revalidatePath('/calendrier')
    return successState(`Session « ${session.title} » ajoutée${data.notify ? ' et convocations envoyées' : ''}`, { id: session.id })
  })
}

export async function updateSession(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const sessionId = idSchema.parse(formString(formData, 'sessionId'))
    const cohortId = idSchema.parse(formString(formData, 'cohortId'))
    const data = sessionInputSchema.parse(sessionInputFromForm(formData))
    await cohorts.updateSession(principal, sessionId, data, meta)
    revalidateCohort(cohortId)
    revalidatePath('/calendrier')
    return successState('Session mise à jour')
  })
}

export async function removeSession(input: { sessionId: string; cohortId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await cohorts.removeSession(principal, idSchema.parse(input.sessionId), meta)
    revalidateCohort(input.cohortId)
    return successState('Session supprimée')
  })
}
