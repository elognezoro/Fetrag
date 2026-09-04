import { resolvePublicUrl } from '@fetrag/config'
import { gradeInputSchema, submissionInputSchema } from '@fetrag/contracts'
import { prisma, type Prisma, type SubmissionStatus } from '@fetrag/db'
import { audit, emit, ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import type { z } from 'zod'
import { completeActivityForEnrollment } from './internal/completion'
import { findLearnerEnrollment, resolveActivityContext, type ActivityContext } from './internal/course-tree'
import { assertCan, auditContext, can, requirePrincipal } from './lib/access'
import { emailTemplates, safeNotifyUser, safeSendEmail } from './lib/integrations'
import { toJsonValue } from './lib/json'
import { displayName, percent } from './lib/text'
import type { Principal, RequestMeta } from './types'

export type SubmissionInput = z.input<typeof submissionInputSchema>
export type GradeInput = z.input<typeof gradeInputSchema>

/** Seuil de réussite par défaut (en %) d'un devoir noté quand l'activité ne précise pas de passScore. */
const DEFAULT_ASSIGNMENT_PASS_PERCENT = 50

const submissionInclude = {
  user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
  grader: { select: { id: true, name: true } },
  grade: true,
  assignment: { select: { id: true, maxScore: true, dueAt: true, lateAllowed: true, rubric: true, activity: { select: { id: true, title: true, dueAt: true, completionRule: true } } } },
} satisfies Prisma.SubmissionInclude

async function loadAssignmentContext(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) throw new NotFoundError('Devoir', assignmentId)
  const ctx = await resolveActivityContext(prisma, assignment.activityId)
  return { assignment, ctx }
}

function effectiveDueAt(assignment: { dueAt: Date | null }, ctx: ActivityContext): Date | null {
  return assignment.dueAt ?? ctx.activity.dueAt
}

/**
 * Enregistre un brouillon ou soumet un devoir (LMS-19) : vérifie l'inscription, les formats
 * autorisés, la date limite (retard toléré ou refusé) et met à jour l'achèvement (SUBMIT).
 */
export async function save(principal: Principal, input: SubmissionInput) {
  const p = requirePrincipal(principal)
  const data = submissionInputSchema.parse(input)
  const { assignment, ctx } = await loadAssignmentContext(data.assignmentId)
  const enrollment = await findLearnerEnrollment(prisma, p.id, ctx.version.id)
  if (!enrollment) throw new ForbiddenError("Vous n'êtes pas inscrit à ce cours")
  if (enrollment.status !== 'ACTIVE') throw new PreconditionError("L'inscription n'est plus active")
  const now = new Date()
  if (ctx.activity.availableFrom && ctx.activity.availableFrom.getTime() > now.getTime()) throw new PreconditionError("Ce devoir n'est pas encore disponible")

  const text = data.text?.trim() ? data.text.trim() : null
  const fileUrl = data.fileUrl ?? null
  if (text && !assignment.allowText) throw new PreconditionError("Ce devoir n'accepte pas de réponse texte")
  if (fileUrl && !assignment.allowFile) throw new PreconditionError("Ce devoir n'accepte pas de fichier")

  const existing = await prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId: assignment.id, userId: p.id } }, include: { grade: true } })
  if (existing && existing.status === 'GRADED') throw new PreconditionError('Ce devoir a déjà été noté')

  let status: SubmissionStatus = existing?.status === 'RETURNED' && !data.submit ? 'RETURNED' : 'DRAFT'
  let isLate = existing?.isLate ?? false
  let submittedAt = existing?.submittedAt ?? null
  if (data.submit) {
    if (!text && !fileUrl) throw new PreconditionError('Ajoutez un texte ou un fichier avant de soumettre')
    const dueAt = effectiveDueAt(assignment, ctx)
    isLate = Boolean(dueAt && now.getTime() > dueAt.getTime())
    if (isLate && !assignment.lateAllowed) throw new PreconditionError('La date limite est dépassée et les remises tardives sont refusées', { dueAt })
    status = isLate ? 'LATE' : 'SUBMITTED'
    submittedAt = now
  } else if (existing && (existing.status === 'SUBMITTED' || existing.status === 'LATE')) {
    status = existing.status
  }

  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId: assignment.id, userId: p.id } },
    create: {
      assignmentId: assignment.id,
      userId: p.id,
      enrollmentId: enrollment.id,
      text,
      fileUrl,
      fileName: data.fileName ?? null,
      status,
      submittedAt,
      isLate,
    },
    update: {
      enrollmentId: enrollment.id,
      text: text ?? (fileUrl ? existing?.text ?? null : null),
      fileUrl: fileUrl ?? (text ? existing?.fileUrl ?? null : null),
      fileName: data.fileName ?? (fileUrl ? existing?.fileName ?? null : existing?.fileName ?? null),
      status,
      submittedAt,
      isLate,
    },
    include: submissionInclude,
  })

  let progress = null
  if (data.submit) {
    const rule = ctx.activity.completionRule
    progress = await completeActivityForEnrollment(
      enrollment.id,
      { id: ctx.activity.id, durationMinutes: ctx.activity.durationMinutes },
      { completed: rule === 'SUBMIT' ? true : undefined, progressData: { submissionId: submission.id, submittedAt: now.toISOString(), isLate } },
      { actorId: p.id },
    )
    await emit('assignment.submitted', { submissionId: submission.id, assignmentId: assignment.id, activityId: ctx.activity.id, userId: p.id, enrollmentId: enrollment.id, isLate }, { actorId: p.id })
    await notifyGraders(ctx, enrollment.cohortId, `${displayName(submission.user)} a remis le devoir « ${ctx.activity.title} »${isLate ? ' (en retard)' : ''}.`)
  }
  return { submission, progress }
}

export async function saveDraft(principal: Principal, input: SubmissionInput) {
  return save(principal, { ...input, submit: false })
}

export async function submit(principal: Principal, input: SubmissionInput) {
  return save(principal, { ...input, submit: true })
}

async function notifyGraders(ctx: ActivityContext, cohortId: string | null, body: string): Promise<void> {
  const recipients = new Set<string>()
  if (cohortId) {
    const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { trainerId: true } })
    if (cohort?.trainerId) recipients.add(cohort.trainerId)
  }
  if (recipients.size === 0) {
    const trainers = await prisma.courseTrainer.findMany({ where: { courseId: ctx.course.id }, select: { userId: true } })
    for (const t of trainers) recipients.add(t.userId)
  }
  for (const userId of recipients) {
    await safeNotifyUser(userId, { title: 'Devoir à corriger', body, href: '/formateur', category: 'assignments' })
  }
}

/**
 * Notation d'un devoir : barème, feedback, grille, statut GRADED, achèvement
 * (SUBMIT ou PASS_SCORE selon l'activité), notification et audit.
 */
export async function grade(principal: Principal, input: GradeInput, meta: RequestMeta = {}) {
  const data = gradeInputSchema.parse(input)
  const submission = await prisma.submission.findUnique({ where: { id: data.submissionId }, include: submissionInclude })
  if (!submission) throw new NotFoundError('Remise', data.submissionId)
  const { assignment, ctx } = await loadAssignmentContext(submission.assignmentId)
  const enrollment = submission.enrollmentId ? await prisma.enrollment.findUnique({ where: { id: submission.enrollmentId }, select: { id: true, cohortId: true } }) : null
  const p = assertCan(principal, 'grade.write', { courseId: ctx.course.id, cohortId: enrollment?.cohortId ?? null })
  if (submission.status === 'DRAFT') throw new PreconditionError("Ce devoir n'a pas encore été remis")
  if (data.score > assignment.maxScore) throw new PreconditionError(`La note ne peut pas dépasser ${assignment.maxScore}`, { maxScore: assignment.maxScore })

  const graded = await prisma.$transaction(async (tx) => {
    await tx.grade.upsert({
      where: { submissionId: submission.id },
      create: { submissionId: submission.id, score: data.score, maxScore: assignment.maxScore, feedback: data.feedback ?? null, rubricScores: data.rubricScores ? toJsonValue(data.rubricScores) : undefined },
      update: { score: data.score, maxScore: assignment.maxScore, feedback: data.feedback ?? null, rubricScores: data.rubricScores ? toJsonValue(data.rubricScores) : undefined, gradedAt: new Date() },
    })
    return tx.submission.update({ where: { id: submission.id }, data: { status: 'GRADED', graderId: p.id }, include: submissionInclude })
  })

  const pct = percent(data.score, assignment.maxScore)
  let progress = null
  if (enrollment) {
    const rule = ctx.activity.completionRule
    const passPercent = ctx.activity.passScore ?? DEFAULT_ASSIGNMENT_PASS_PERCENT
    const completed = rule === 'PASS_SCORE' ? pct >= passPercent : rule === 'SUBMIT' ? true : undefined
    progress = await completeActivityForEnrollment(enrollment.id, { id: ctx.activity.id, durationMinutes: ctx.activity.durationMinutes }, { completed, score: pct, keepBestScore: false }, { actorId: p.id })
  }

  await audit('grade.recorded', { type: 'Submission', id: submission.id }, auditContext(p, meta), {
    before: { status: submission.status, score: submission.grade?.score ?? null },
    after: { status: 'GRADED', score: data.score, maxScore: assignment.maxScore },
  })
  await emit('assignment.graded', { submissionId: submission.id, assignmentId: assignment.id, userId: submission.userId, score: data.score, maxScore: assignment.maxScore, percent: pct }, { actorId: p.id })
  await safeNotifyUser(submission.userId, {
    title: 'Devoir corrigé',
    body: `Votre devoir « ${ctx.activity.title} » a été noté ${data.score}/${assignment.maxScore}.`,
    href: `/devoirs/${assignment.id}`,
    category: 'results',
    email: true,
  })
  await safeSendEmail({
    to: submission.user.email,
    userId: submission.userId,
    template: emailTemplates.result,
    variables: {
      firstName: submission.user.firstName ?? displayName(submission.user),
      activityTitle: ctx.activity.title,
      courseTitle: ctx.course.title,
      score: data.score,
      maxScore: assignment.maxScore,
      percent: pct,
      passed: pct >= (ctx.activity.passScore ?? DEFAULT_ASSIGNMENT_PASS_PERCENT),
      feedback: data.feedback ?? null,
      resultUrl: `${resolvePublicUrl('lms')}/devoirs/${assignment.id}`,
    },
  })
  return { submission: graded, progress }
}

/** Renvoie un devoir à l'apprenant pour révision (statut RETURNED) avec un commentaire. */
export async function returnForRevision(principal: Principal, submissionId: string, feedback: string, meta: RequestMeta = {}) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: submissionInclude })
  if (!submission) throw new NotFoundError('Remise', submissionId)
  const { ctx } = await loadAssignmentContext(submission.assignmentId)
  const enrollment = submission.enrollmentId ? await prisma.enrollment.findUnique({ where: { id: submission.enrollmentId }, select: { cohortId: true } }) : null
  const p = assertCan(principal, 'grade.write', { courseId: ctx.course.id, cohortId: enrollment?.cohortId ?? null })
  if (submission.status === 'DRAFT') throw new PreconditionError("Ce devoir n'a pas encore été remis")
  const comment = feedback.trim().slice(0, 5000)
  const updated = await prisma.$transaction(async (tx) => {
    await tx.grade.upsert({
      where: { submissionId },
      create: { submissionId, score: 0, maxScore: submission.assignment.maxScore, feedback: comment },
      update: { feedback: comment },
    })
    return tx.submission.update({ where: { id: submissionId }, data: { status: 'RETURNED', graderId: p.id }, include: submissionInclude })
  })
  await audit('grade.recorded', { type: 'Submission', id: submissionId }, auditContext(p, meta), { before: { status: submission.status }, after: { status: 'RETURNED' } })
  await safeNotifyUser(submission.userId, {
    title: 'Devoir à reprendre',
    body: `Votre devoir « ${ctx.activity.title} » vous est renvoyé : ${comment}`,
    href: `/devoirs/${submission.assignmentId}`,
    category: 'results',
    email: true,
  })
  return updated
}

export interface TrainerSubmissionFilter {
  cohortId?: string
  courseId?: string
  assignmentId?: string
  status?: SubmissionStatus[]
}

/** Remises à corriger pour un formateur (cohorte et/ou cours), hors brouillons par défaut. */
export async function listForTrainer(principal: Principal, filter: TrainerSubmissionFilter = {}) {
  const p = requirePrincipal(principal)
  if (!filter.cohortId && !filter.courseId && !filter.assignmentId) assertCan(p, 'grade.write')
  let courseId = filter.courseId ?? null
  let cohortOrganizationId: string | null = null
  let trainerId: string | null = null
  if (filter.cohortId) {
    const cohort = await prisma.cohort.findUnique({ where: { id: filter.cohortId }, select: { courseId: true, trainerId: true, organizationId: true } })
    if (!cohort) throw new NotFoundError('Cohorte', filter.cohortId)
    courseId = courseId ?? cohort.courseId
    trainerId = cohort.trainerId
    cohortOrganizationId = cohort.organizationId
  }
  if (filter.assignmentId && !courseId) {
    const { ctx } = await loadAssignmentContext(filter.assignmentId)
    courseId = ctx.course.id
  }
  const allowed = trainerId === p.id || can(p, 'grade.write', { courseId, cohortId: filter.cohortId ?? null, organizationId: cohortOrganizationId })
  if (!allowed) throw new ForbiddenError('Accès aux remises refusé')

  const where: Prisma.SubmissionWhereInput = {
    status: { in: filter.status ?? ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] },
    ...(filter.assignmentId ? { assignmentId: filter.assignmentId } : {}),
    ...(filter.cohortId ? { user: { cohortMembers: { some: { cohortId: filter.cohortId } } } } : {}),
    ...(courseId ? { assignment: { activity: { lesson: { module: { courseVersion: { courseId } } } } } } : {}),
  }
  const submissions = await prisma.submission.findMany({
    where,
    orderBy: [{ status: 'asc' }, { submittedAt: 'asc' }],
    include: submissionInclude,
    take: 500,
  })
  return submissions.map((s) => ({ ...s, dueAt: s.assignment.dueAt ?? s.assignment.activity.dueAt }))
}

export type LearnerAssignmentState = 'todo' | 'draft' | 'submitted' | 'late' | 'graded' | 'returned'

/** Devoirs de l'apprenant sur ses inscriptions actives, avec l'état de sa remise et l'échéance. */
export async function listForUser(principal: Principal, userId?: string) {
  const p = requirePrincipal(principal)
  const target = userId ?? p.id
  if (target !== p.id) assertCan(p, 'users.read', {}, "Consultation des devoirs d'un tiers refusée")
  const assignments = await prisma.assignment.findMany({
    where: { activity: { lesson: { module: { courseVersion: { enrollments: { some: { userId: target, status: { in: ['ACTIVE', 'COMPLETED'] } } } } } } } },
    include: {
      activity: {
        select: {
          id: true,
          title: true,
          dueAt: true,
          availableFrom: true,
          completionRule: true,
          lesson: { select: { id: true, title: true, module: { select: { title: true, courseVersion: { select: { course: { select: { id: true, slug: true, title: true } } } } } } } },
        },
      },
      submissions: { where: { userId: target }, include: { grade: true } },
    },
  })
  const now = Date.now()
  return assignments
    .map((a) => {
      const submission = a.submissions[0] ?? null
      const dueAt = a.dueAt ?? a.activity.dueAt
      let state: LearnerAssignmentState = 'todo'
      if (submission) {
        state =
          submission.status === 'GRADED' ? 'graded' : submission.status === 'RETURNED' ? 'returned' : submission.status === 'LATE' ? 'late' : submission.status === 'SUBMITTED' ? 'submitted' : 'draft'
      }
      const overdue = state === 'todo' || state === 'draft' ? Boolean(dueAt && dueAt.getTime() < now) : false
      return {
        assignment: { id: a.id, description: a.description, allowFile: a.allowFile, allowText: a.allowText, maxScore: a.maxScore, lateAllowed: a.lateAllowed, maxFileSizeMb: a.maxFileSizeMb, allowedMimeTypes: a.allowedMimeTypes },
        activity: { id: a.activity.id, title: a.activity.title, availableFrom: a.activity.availableFrom, lessonId: a.activity.lesson.id, lessonTitle: a.activity.lesson.title, moduleTitle: a.activity.lesson.module.title },
        course: a.activity.lesson.module.courseVersion.course,
        dueAt,
        overdue,
        state,
        submission,
        grade: submission?.grade ?? null,
      }
    })
    .sort((a, b) => (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER))
}

/** Détail d'une remise : titulaire ou correcteur habilité. */
export async function get(principal: Principal, submissionId: string) {
  const p = requirePrincipal(principal)
  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: submissionInclude })
  if (!submission) throw new NotFoundError('Remise', submissionId)
  const { assignment, ctx } = await loadAssignmentContext(submission.assignmentId)
  const enrollment = submission.enrollmentId ? await prisma.enrollment.findUnique({ where: { id: submission.enrollmentId }, select: { cohortId: true, cohort: { select: { trainerId: true } } } }) : null
  const allowed = submission.userId === p.id || enrollment?.cohort?.trainerId === p.id || can(p, 'grade.write', { courseId: ctx.course.id, cohortId: enrollment?.cohortId ?? null })
  if (!allowed) throw new NotFoundError('Remise', submissionId)
  return { ...submission, dueAt: effectiveDueAt(assignment, ctx), course: ctx.course, activity: ctx.activity, lesson: ctx.lesson }
}

/** Vue apprenant d'un devoir : consignes, contraintes, sa remise et sa note. */
export async function getForLearner(principal: Principal, assignmentId: string) {
  const p = requirePrincipal(principal)
  const { assignment, ctx } = await loadAssignmentContext(assignmentId)
  const enrollment = await findLearnerEnrollment(prisma, p.id, ctx.version.id)
  if (!enrollment && !can(p, 'course.teach', { courseId: ctx.course.id })) throw new ForbiddenError("Vous n'êtes pas inscrit à ce cours")
  const submission = await prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId, userId: p.id } }, include: { grade: true } })
  const dueAt = effectiveDueAt(assignment, ctx)
  return {
    assignment,
    activity: ctx.activity,
    lesson: ctx.lesson,
    module: ctx.module,
    course: ctx.course,
    enrollmentId: enrollment?.id ?? null,
    dueAt,
    isOverdue: Boolean(dueAt && dueAt.getTime() < Date.now()),
    canSubmit: enrollment?.status === 'ACTIVE' && submission?.status !== 'GRADED' && (!dueAt || dueAt.getTime() >= Date.now() || assignment.lateAllowed),
    submission,
  }
}
