import { resolvePublicUrl } from '@fetrag/config'
import { idSchema } from '@fetrag/contracts'
import { type EnrollmentStatus, type Prisma } from '@fetrag/db'
import { audit, DomainError, emit, ForbiddenError, NotFoundError, paginationArgs, PreconditionError, toPaginated } from '@fetrag/domain'
import { z } from 'zod'
import { autoIssueForEnrollment } from './certification'
import { prisma as db } from './internal/db'
import { createEnrollmentTx, enrollmentTransitions } from './internal/enrollment-core'
import { assertCan, auditContext, can, isCoordination, requirePrincipal } from './lib/access'
import { emailTemplates, safeNotifyUser, safeSendEmail } from './lib/integrations'
import { displayName } from './lib/text'
import type { Principal, RequestMeta } from './types'

export const enrollOptionsSchema = z.object({
  cohortId: idSchema.optional(),
  organizationId: idSchema.optional(),
  orderId: idSchema.optional(),
  source: z.string().trim().min(1).max(40).default('self'),
  /** Inscription d'un tiers (coordination, formateur de cohorte, responsable d'organisation). */
  userId: idSchema.optional(),
})
export type EnrollOptions = z.input<typeof enrollOptionsSchema>

export const enrollmentStatusSchema = z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'EXPIRED'])

const ACTIVE_LIKE: EnrollmentStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED']

/**
 * Inscription à un cours en appliquant sa politique (`enrollmentPolicy`) :
 * SELF direct, APPROVAL en attente, ORGANIZATION réservée, PAID sur commande payée.
 */
export async function enroll(principal: Principal, courseId: string, options: EnrollOptions = {}, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const opts = enrollOptionsSchema.parse(options)
  const targetUserId = opts.userId ?? p.id
  const onBehalf = targetUserId !== p.id

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      prerequisites: { where: { isMandatory: true }, include: { prerequisiteCourse: { select: { id: true, title: true } } } },
      _count: { select: { enrollments: { where: { status: { in: ACTIVE_LIKE } } } } },
    },
  })
  if (!course) throw new NotFoundError('Cours', courseId)

  const staffEnroll =
    isCoordination(p) ||
    can(p, 'cohort.teach', { courseId, cohortId: opts.cohortId ?? null }) ||
    (opts.organizationId ? p.managedOrganizationIds.includes(opts.organizationId) : false)
  if (onBehalf && !staffEnroll) throw new ForbiddenError("Vous ne pouvez pas inscrire un autre utilisateur")
  if (onBehalf) {
    const target = await db.user.findUnique({ where: { id: targetUserId }, select: { id: true, isActive: true } })
    if (!target || !target.isActive) throw new NotFoundError('Utilisateur', targetUserId)
  }

  if (course.status !== 'PUBLISHED' && !staffEnroll) throw new PreconditionError("Ce cours n'est pas ouvert aux inscriptions")

  let courseVersionId = course.currentVersionId
  let cohort: { id: string; organizationId: string | null; capacity: number | null; isPrivate: boolean; memberCount: number } | null = null
  if (opts.cohortId) {
    const found = await db.cohort.findUnique({ where: { id: opts.cohortId }, include: { _count: { select: { members: true } } } })
    if (!found || found.courseId !== courseId) throw new NotFoundError('Cohorte', opts.cohortId)
    if (!['PLANNED', 'OPEN', 'RUNNING'].includes(found.status)) throw new PreconditionError("Cette cohorte n'accepte plus d'inscriptions")
    if (found.isPrivate && !staffEnroll) {
      const member = found.organizationId ? p.organizationIds.includes(found.organizationId) : false
      if (!member) throw new ForbiddenError('Cette cohorte est réservée à une organisation')
    }
    courseVersionId = found.courseVersionId
    cohort = { id: found.id, organizationId: found.organizationId, capacity: found.capacity, isPrivate: found.isPrivate, memberCount: found._count.members }
  }
  if (!courseVersionId) throw new PreconditionError("Ce cours n'a pas de version publiée")

  // Politique d'inscription
  let status: EnrollmentStatus = 'ACTIVE'
  switch (course.enrollmentPolicy) {
    case 'SELF':
      if (!onBehalf) assertCan(p, 'course.enroll_self', { courseId })
      break
    case 'APPROVAL':
      status = staffEnroll ? 'ACTIVE' : 'PENDING'
      break
    case 'ORGANIZATION':
      if (!staffEnroll) throw new ForbiddenError('Inscription réservée aux organisations affiliées (demande de formation)')
      if (!opts.organizationId && !cohort?.organizationId) throw new PreconditionError("L'organisation bénéficiaire est requise")
      break
    case 'PAID': {
      if (staffEnroll) break
      if (!opts.orderId) throw new DomainError('PAYMENT_REQUIRED', 'Cette formation est payante : un paiement est requis')
      const order = await db.order.findUnique({ where: { id: opts.orderId }, include: { lines: { include: { offer: { select: { courseId: true } } } } } })
      if (!order || order.userId !== targetUserId) throw new NotFoundError('Commande', opts.orderId)
      if (order.status !== 'PAID') throw new DomainError('PAYMENT_REQUIRED', "La commande n'est pas réglée")
      if (!order.lines.some((l) => l.offer?.courseId === courseId)) throw new PreconditionError('La commande ne concerne pas ce cours')
      break
    }
  }

  // Prérequis obligatoires (auto-inscription uniquement)
  if (!staffEnroll && course.prerequisites.length > 0) {
    const completed = await db.enrollment.findMany({
      where: { userId: targetUserId, status: 'COMPLETED', courseId: { in: course.prerequisites.map((pr) => pr.prerequisiteCourseId) } },
      select: { courseId: true },
    })
    const done = new Set(completed.map((c) => c.courseId))
    const missing = course.prerequisites.filter((pr) => !done.has(pr.prerequisiteCourseId)).map((pr) => pr.prerequisiteCourse.title)
    if (missing.length) throw new PreconditionError('Prérequis non validés : ' + missing.join(', '), { missing })
  }

  // Capacités
  const existing = await db.enrollment.findFirst({ where: { userId: targetUserId, courseId, cohortId: opts.cohortId ?? null, status: { in: ACTIVE_LIKE } } })
  if (!existing) {
    if (course.capacity !== null && course._count.enrollments >= course.capacity) throw new PreconditionError('Ce cours est complet')
    if (cohort && cohort.capacity !== null && cohort.memberCount >= cohort.capacity) throw new PreconditionError('Cette cohorte est complète')
  }

  const organizationId = opts.organizationId ?? cohort?.organizationId ?? null
  const result = await db.$transaction((tx) =>
    createEnrollmentTx(tx, {
      userId: targetUserId,
      courseId,
      courseVersionId: courseVersionId as string,
      cohortId: opts.cohortId ?? null,
      organizationId,
      orderId: opts.orderId ?? null,
      source: onBehalf && opts.source === 'self' ? 'staff' : opts.source,
      status,
      actorId: p.id,
    }),
  )

  if (result.created || result.reactivated) {
    await audit('enrollment.created', { type: 'Enrollment', id: result.enrollment.id }, auditContext(p, meta), {
      after: { userId: targetUserId, courseId, cohortId: opts.cohortId ?? null, status },
    })
    await emit('enrollment.created', { enrollmentId: result.enrollment.id, userId: targetUserId, courseId, cohortId: opts.cohortId ?? null, status }, { actorId: p.id })
    await notifyEnrollment(result.enrollment.id, status)
  }
  return result.enrollment
}

async function notifyEnrollment(enrollmentId: string, status: EnrollmentStatus): Promise<void> {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } }, course: { select: { title: true, slug: true, durationHours: true } }, cohort: { select: { name: true, startsAt: true } } },
  })
  if (!enrollment) return
  if (status === 'ACTIVE') {
    await safeNotifyUser(enrollment.userId, {
      title: 'Inscription confirmée',
      body: `Vous êtes inscrit à « ${enrollment.course.title} ».`,
      href: `/cours/${enrollment.course.slug}`,
      category: 'training',
      email: false,
    })
    await safeSendEmail({
      to: enrollment.user.email,
      userId: enrollment.userId,
      template: emailTemplates.enrollmentConfirmed,
      variables: {
        firstName: enrollment.user.firstName ?? displayName(enrollment.user),
        courseTitle: enrollment.course.title,
        cohortName: enrollment.cohort?.name ?? null,
        startsAt: enrollment.cohort?.startsAt ?? null,
        durationHours: enrollment.course.durationHours,
        courseUrl: `${resolvePublicUrl('lms')}/cours/${enrollment.course.slug}`,
      },
    })
  } else if (status === 'PENDING') {
    await safeNotifyUser(enrollment.userId, {
      title: 'Inscription en attente',
      body: `Votre demande d'inscription à « ${enrollment.course.title} » sera examinée par la coordination.`,
      href: `/cours/${enrollment.course.slug}`,
      category: 'training',
    })
  }
}

const enrollmentListInclude = {
  course: { select: { id: true, slug: true, title: true, code: true, pillar: true, coverImageUrl: true, durationHours: true, modality: true, level: true } },
  cohort: { select: { id: true, code: true, name: true, startsAt: true, endsAt: true, status: true, mode: true } },
  certificates: { where: { status: 'ISSUED' as const }, select: { id: true, number: true, kind: true, issuedAt: true } },
  courseVersion: { select: { id: true, version: true } },
} satisfies Prisma.EnrollmentInclude

/** Inscriptions d'un utilisateur (les siennes par défaut). */
export async function listForUser(principal: Principal, userId?: string, filter: { status?: EnrollmentStatus[] } = {}) {
  const p = requirePrincipal(principal)
  const target = userId ?? p.id
  if (target !== p.id) assertCan(p, 'users.read', {}, "Consultation des inscriptions d'un tiers refusée")
  return db.enrollment.findMany({
    where: { userId: target, ...(filter.status ? { status: { in: filter.status } } : {}) },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    include: enrollmentListInclude,
  })
}

/** Détail d'une inscription : titulaire, formateur du cours / de la cohorte, coordination ou organisation. */
export async function get(principal: Principal, enrollmentId: string) {
  const p = requirePrincipal(principal)
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      ...enrollmentListInclude,
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
      organization: { select: { id: true, name: true } },
      history: { orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { completions: { where: { completed: true } } } },
    },
  })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  if (!canReadEnrollment(p, enrollment, await cohortTrainerId(enrollment.cohortId))) throw new NotFoundError('Inscription', enrollmentId)
  return enrollment
}

async function cohortTrainerId(cohortId: string | null): Promise<string | null> {
  if (!cohortId) return null
  const cohort = await db.cohort.findUnique({ where: { id: cohortId }, select: { trainerId: true } })
  return cohort?.trainerId ?? null
}

/** Règle de lecture d'une inscription. */
export function canReadEnrollment(
  p: Principal,
  enrollment: { userId: string; courseId: string; cohortId: string | null; organizationId: string | null },
  trainerId: string | null,
): boolean {
  if (enrollment.userId === p.id) return true
  if (trainerId && trainerId === p.id) return true
  if (can(p, 'course.teach', { courseId: enrollment.courseId, cohortId: enrollment.cohortId })) return true
  if (enrollment.organizationId && can(p, 'organization.read', { organizationId: enrollment.organizationId })) return true
  return false
}

/** Règle de modification du statut d'une inscription. */
function canManageEnrollment(
  p: Principal,
  enrollment: { userId: string; courseId: string; cohortId: string | null; organizationId: string | null; status: EnrollmentStatus },
  trainerId: string | null,
  target: EnrollmentStatus,
): boolean {
  if (isCoordination(p)) return true
  if (can(p, 'cohort.teach', { courseId: enrollment.courseId, cohortId: enrollment.cohortId })) return true
  if (trainerId && trainerId === p.id) return true
  if (target === 'CANCELLED') {
    if (enrollment.userId === p.id && enrollment.status === 'PENDING') return true
    if (enrollment.organizationId && p.managedOrganizationIds.includes(enrollment.organizationId)) return true
  }
  return false
}

/** Changement de statut avec validation des transitions et historisation. */
export async function setStatus(
  principal: Principal,
  enrollmentId: string,
  status: EnrollmentStatus,
  options: { comment?: string } = {},
  meta: RequestMeta = {},
) {
  const p = requirePrincipal(principal)
  const target = enrollmentStatusSchema.parse(status)
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { select: { title: true, slug: true, currentVersionId: true } }, user: { select: { id: true, email: true } } },
  })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  const trainerId = await cohortTrainerId(enrollment.cohortId)
  if (!canManageEnrollment(p, enrollment, trainerId, target)) throw new ForbiddenError("Modification de l'inscription refusée")
  if (enrollment.status === target) return enrollment
  const allowed = enrollmentTransitions[enrollment.status]
  if (!allowed.includes(target)) {
    throw new PreconditionError(`Transition ${enrollment.status} → ${target} non autorisée`, { from: enrollment.status, to: target })
  }
  const now = new Date()
  const updated = await db.$transaction(async (tx) => {
    const row = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: target,
        completedAt: target === 'COMPLETED' ? now : enrollment.completedAt,
        startedAt: target === 'ACTIVE' ? (enrollment.startedAt ?? now) : enrollment.startedAt,
        progressPercent: target === 'COMPLETED' ? 100 : enrollment.progressPercent,
      },
    })
    await tx.statusEvent.create({
      data: {
        entityType: 'Enrollment',
        entityId: enrollmentId,
        enrollmentId,
        fromStatus: enrollment.status,
        toStatus: target,
        actorId: p.id,
        comment: options.comment ?? null,
      },
    })
    return row
  })
  await audit('enrollment.status_changed', { type: 'Enrollment', id: enrollmentId }, auditContext(p, meta), {
    before: { status: enrollment.status },
    after: { status: target, comment: options.comment ?? null },
  })

  const labels: Record<EnrollmentStatus, string> = {
    PENDING: 'en attente',
    ACTIVE: 'validée',
    COMPLETED: 'terminée',
    SUSPENDED: 'suspendue',
    CANCELLED: 'annulée',
    EXPIRED: 'expirée',
  }
  if (enrollment.userId !== p.id) {
    await safeNotifyUser(enrollment.userId, {
      title: `Inscription ${labels[target]}`,
      body: `Votre inscription à « ${enrollment.course.title} » est ${labels[target]}.${options.comment ? ' ' + options.comment : ''}`,
      href: `/cours/${enrollment.course.slug}`,
      category: 'training',
      email: target === 'ACTIVE' || target === 'CANCELLED',
    })
  }
  if (target === 'ACTIVE' && enrollment.status === 'PENDING') {
    await emit('enrollment.created', { enrollmentId, userId: enrollment.userId, courseId: enrollment.courseId, status: 'ACTIVE' }, { actorId: p.id })
    await notifyEnrollment(enrollmentId, 'ACTIVE')
  }
  if (target === 'COMPLETED') {
    await emit('course.completed', { enrollmentId, userId: enrollment.userId, courseId: enrollment.courseId, manual: true }, { actorId: p.id })
    await autoIssueForEnrollment(enrollmentId)
  }
  return updated
}

/** Validation d'une inscription en attente (politique APPROVAL). */
export async function approve(principal: Principal, enrollmentId: string, meta: RequestMeta = {}) {
  return setStatus(principal, enrollmentId, 'ACTIVE', { comment: 'Validation par la coordination' }, meta)
}

export const enrollmentListQuerySchema = z.object({
  status: enrollmentStatusSchema.optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

/** Inscriptions d'un cours (formateurs du cours et coordination). */
export async function listForCourse(principal: Principal, courseId: string, query: z.input<typeof enrollmentListQuerySchema> = {}) {
  assertCan(principal, 'course.teach', { courseId })
  const q = enrollmentListQuerySchema.parse(query)
  const where: Prisma.EnrollmentWhereInput = {
    courseId,
    ...(q.status ? { status: q.status } : {}),
    ...(q.q ? { user: { OR: [{ email: { contains: q.q, mode: 'insensitive' } }, { name: { contains: q.q, mode: 'insensitive' } }, { lastName: { contains: q.q, mode: 'insensitive' } }] } } : {}),
  }
  const [items, total] = await Promise.all([
    db.enrollment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs(q),
      include: {
        user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
        cohort: { select: { id: true, code: true, name: true } },
        organization: { select: { id: true, name: true } },
        certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true } },
      },
    }),
    db.enrollment.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Inscriptions d'une cohorte (formateur de la cohorte, coordination, organisation). */
export async function listForCohort(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await db.cohort.findUnique({ where: { id: cohortId }, select: { id: true, courseId: true, organizationId: true, trainerId: true } })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  const allowed =
    cohort.trainerId === p.id ||
    can(p, 'cohort.teach', { cohortId, courseId: cohort.courseId }) ||
    (cohort.organizationId ? can(p, 'organization.read', { organizationId: cohort.organizationId }) : false)
  if (!allowed) throw new ForbiddenError('Accès à la cohorte refusé')
  return db.enrollment.findMany({
    where: { cohortId },
    orderBy: { user: { lastName: 'asc' } },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true } },
      certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true, kind: true } },
      _count: { select: { completions: { where: { completed: true } } } },
    },
  })
}

/** File des inscriptions en attente de validation (coordination). */
export async function listPending(principal: Principal, query: { page?: number; pageSize?: number } = {}) {
  assertCan(principal, 'cohort.manage')
  const q = enrollmentListQuerySchema.parse({ ...query, status: 'PENDING' })
  const where: Prisma.EnrollmentWhereInput = { status: 'PENDING' }
  const [items, total] = await Promise.all([
    db.enrollment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      ...paginationArgs(q),
      include: {
        user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true, code: true } },
        organization: { select: { id: true, name: true } },
      },
    }),
    db.enrollment.count({ where }),
  ])
  return toPaginated(items, total, q)
}

export { enrollmentTransitions }
