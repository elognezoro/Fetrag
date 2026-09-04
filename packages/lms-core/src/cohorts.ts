import { resolvePublicUrl } from '@fetrag/config'
import { idSchema, sessionModeLabels, sessionModeSchema } from '@fetrag/contracts'
import { prisma, type CohortStatus, type Prisma } from '@fetrag/db'
import { audit, ForbiddenError, makeCohortCode, NotFoundError, paginationArgs, PreconditionError, toPaginated, uniqueSlug } from '@fetrag/domain'
import { z } from 'zod'
import { createEnrollmentTx } from './internal/enrollment-core'
import { assertCan, assertOrganizationAccess, auditContext, can, isCoordination, requirePrincipal, scopedOrganizationFilter } from './lib/access'
import { emailTemplates, safeNotifyUser, safeSendEmail } from './lib/integrations'
import { displayName } from './lib/text'
import type { BulkResult, Principal, RequestMeta } from './types'

// -----------------------------------------------------------------------------
// Schémas d'entrée
// -----------------------------------------------------------------------------

export const cohortStatusSchema = z.enum(['PLANNED', 'OPEN', 'RUNNING', 'CLOSED', 'CANCELLED'])

export const cohortInputSchema = z.object({
  courseId: idSchema,
  courseVersionId: idSchema.optional(),
  name: z.string().trim().min(2).max(160).optional(),
  organizationId: idSchema.nullable().optional(),
  trainerId: idSchema.nullable().optional(),
  trainingRequestId: idSchema.nullable().optional(),
  mode: sessionModeSchema.default('HYBRID'),
  capacity: z.number().int().positive().max(1000).nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  isPrivate: z.boolean().default(false),
  status: cohortStatusSchema.default('PLANNED'),
})
export type CohortInput = z.input<typeof cohortInputSchema>
export const cohortUpdateSchema = cohortInputSchema.omit({ courseId: true, courseVersionId: true }).partial()

export const sessionInputSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    mode: sessionModeSchema.default('IN_PERSON'),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    location: z.string().trim().max(200).nullable().optional(),
    meetingUrl: z.string().url().nullable().optional(),
    trainerName: z.string().trim().max(160).nullable().optional(),
    /** Activité LIVE_SESSION de la version suivie à lier (présence -> achèvement ATTEND). */
    activityId: idSchema.nullable().optional(),
    /** Envoyer la convocation aux membres (par défaut oui). */
    notify: z.boolean().default(true),
  })
  .refine((v) => v.endsAt.getTime() > v.startsAt.getTime(), { path: ['endsAt'], message: 'La fin doit être postérieure au début' })
export type SessionInput = z.input<typeof sessionInputSchema>

export const cohortListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: cohortStatusSchema.optional(),
  courseId: idSchema.optional(),
  organizationId: idSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const cohortSummaryInclude = {
  course: { select: { id: true, slug: true, title: true, code: true, pillar: true } },
  organization: { select: { id: true, name: true, acronym: true } },
  trainer: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
  _count: { select: { members: true, sessions: true, enrollments: true } },
} satisfies Prisma.CohortInclude

// -----------------------------------------------------------------------------
// Accès
// -----------------------------------------------------------------------------

type CohortAccess = { id: string; courseId: string; organizationId: string | null; trainerId: string | null }

/** Le principal enseigne-t-il cette cohorte (formateur désigné, rôle formateur du cours, coordination) ? */
export function canTeachCohort(p: Principal, cohort: CohortAccess): boolean {
  return cohort.trainerId === p.id || can(p, 'cohort.teach', { cohortId: cohort.id, courseId: cohort.courseId, organizationId: cohort.organizationId })
}

/** Lecture d'une cohorte : enseignant, organisation bénéficiaire ou membre. */
export async function canReadCohort(p: Principal, cohort: CohortAccess): Promise<boolean> {
  if (canTeachCohort(p, cohort)) return true
  if (cohort.organizationId && can(p, 'organization.read', { organizationId: cohort.organizationId })) return true
  const member = await prisma.cohortMember.findUnique({ where: { cohortId_userId: { cohortId: cohort.id, userId: p.id } }, select: { id: true } })
  return Boolean(member)
}

async function loadCohort(cohortId: string) {
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, include: cohortSummaryInclude })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  return cohort
}

// -----------------------------------------------------------------------------
// CRUD cohortes
// -----------------------------------------------------------------------------

/** Crée une cohorte sur la version courante (ou indiquée) d'un cours, avec son forum. */
export async function create(principal: Principal, input: CohortInput, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'cohort.manage')
  const data = cohortInputSchema.parse(input)
  const course = await prisma.course.findUnique({ where: { id: data.courseId }, select: { id: true, code: true, title: true, currentVersionId: true } })
  if (!course) throw new NotFoundError('Cours', data.courseId)
  const courseVersionId = data.courseVersionId ?? course.currentVersionId
  if (!courseVersionId) throw new PreconditionError("Ce cours n'a pas de version publiée")
  const version = await prisma.courseVersion.findUnique({ where: { id: courseVersionId }, select: { id: true, courseId: true, version: true } })
  if (!version || version.courseId !== course.id) throw new NotFoundError('Version de cours', courseVersionId)
  if (data.organizationId) {
    const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true } })
    if (!organization) throw new NotFoundError('Organisation', data.organizationId)
  }
  if (data.trainerId) {
    const trainer = await prisma.user.findUnique({ where: { id: data.trainerId }, select: { id: true, isActive: true } })
    if (!trainer || !trainer.isActive) throw new NotFoundError('Formateur', data.trainerId)
  }
  if (data.startsAt && data.endsAt && data.endsAt.getTime() < data.startsAt.getTime()) throw new PreconditionError('La fin doit être postérieure au début')

  const code = makeCohortCode(course.code)
  const name = data.name ?? `${course.title} - ${code}`
  const cohort = await prisma.$transaction(async (tx) => {
    const created = await tx.cohort.create({
      data: {
        code,
        name,
        courseId: course.id,
        courseVersionId,
        organizationId: data.organizationId ?? null,
        trainerId: data.trainerId ?? null,
        trainingRequestId: data.trainingRequestId ?? null,
        status: data.status,
        mode: data.mode,
        capacity: data.capacity ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        location: data.location ?? null,
        description: data.description ?? null,
        isPrivate: data.isPrivate || Boolean(data.organizationId),
      },
      include: cohortSummaryInclude,
    })
    await tx.forum.create({
      data: {
        slug: await uniqueSlug(`cohorte-${code}`, async (c) => Boolean(await tx.forum.findUnique({ where: { slug: c }, select: { id: true } }))),
        title: `Espace d'échange - ${name}`,
        courseId: course.id,
        cohortId: created.id,
      },
    })
    if (data.trainerId) {
      await tx.cohortMember.upsert({ where: { cohortId_userId: { cohortId: created.id, userId: data.trainerId } }, create: { cohortId: created.id, userId: data.trainerId, role: 'trainer' }, update: { role: 'trainer' } })
    }
    return created
  })
  await audit('content.created', { type: 'Cohort', id: cohort.id }, auditContext(p, meta), { after: { code, courseId: course.id, organizationId: data.organizationId ?? null } })
  if (data.trainerId) {
    await safeNotifyUser(data.trainerId, { title: 'Nouvelle cohorte', body: `Vous êtes le formateur de la cohorte « ${name} ».`, href: `/formateur/cohortes/${cohort.id}`, category: 'training', email: true })
  }
  return cohort
}

export async function update(principal: Principal, cohortId: string, input: z.input<typeof cohortUpdateSchema>, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'cohort.manage')
  const existing = await loadCohort(cohortId)
  const data = cohortUpdateSchema.parse(input)
  if (data.trainerId) {
    const trainer = await prisma.user.findUnique({ where: { id: data.trainerId }, select: { id: true, isActive: true } })
    if (!trainer || !trainer.isActive) throw new NotFoundError('Formateur', data.trainerId)
  }
  const cohort = await prisma.$transaction(async (tx) => {
    const updated = await tx.cohort.update({
      where: { id: cohortId },
      data: {
        name: data.name,
        organizationId: data.organizationId,
        trainerId: data.trainerId,
        trainingRequestId: data.trainingRequestId,
        status: data.status,
        mode: data.mode,
        capacity: data.capacity,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location,
        description: data.description,
        isPrivate: data.isPrivate,
      },
      include: cohortSummaryInclude,
    })
    if (data.trainerId && data.trainerId !== existing.trainerId) {
      await tx.cohortMember.upsert({ where: { cohortId_userId: { cohortId, userId: data.trainerId } }, create: { cohortId, userId: data.trainerId, role: 'trainer' }, update: { role: 'trainer' } })
    }
    return updated
  })
  await audit('content.updated', { type: 'Cohort', id: cohortId }, auditContext(p, meta), { before: { status: existing.status, trainerId: existing.trainerId }, after: { status: cohort.status, trainerId: cohort.trainerId } })
  if (data.trainerId && data.trainerId !== existing.trainerId) {
    await safeNotifyUser(data.trainerId, { title: 'Cohorte attribuée', body: `Vous êtes désormais le formateur de « ${cohort.name} ».`, href: `/formateur/cohortes/${cohortId}`, category: 'training', email: true })
  }
  return cohort
}

/** Changement de statut avec synchronisation de la demande institutionnelle liée. */
export async function setStatus(principal: Principal, cohortId: string, status: CohortStatus, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'cohort.manage')
  const existing = await loadCohort(cohortId)
  const target = cohortStatusSchema.parse(status)
  if (existing.status === target) return existing
  const cohort = await prisma.$transaction(async (tx) => {
    const updated = await tx.cohort.update({
      where: { id: cohortId },
      data: { status: target, endsAt: target === 'CLOSED' ? (existing.endsAt ?? new Date()) : existing.endsAt },
      include: cohortSummaryInclude,
    })
    if (existing.trainingRequestId) {
      const request = await tx.trainingRequest.findUnique({ where: { id: existing.trainingRequestId }, select: { id: true, status: true } })
      const next = target === 'RUNNING' && request?.status === 'SCHEDULED' ? 'IN_PROGRESS' : target === 'CLOSED' && (request?.status === 'IN_PROGRESS' || request?.status === 'SCHEDULED') ? 'COMPLETED' : null
      if (request && next) {
        await tx.trainingRequest.update({ where: { id: request.id }, data: { status: next } })
        await tx.decisionHistory.create({ data: { requestId: request.id, actorId: p.id, fromStatus: request.status, toStatus: next, comment: `Cohorte ${existing.code} : ${target}` } })
      }
    }
    return updated
  })
  await audit('content.updated', { type: 'Cohort', id: cohortId }, auditContext(p, meta), { before: { status: existing.status }, after: { status: target } })
  return cohort
}

/** Clôture de la cohorte (chapitre 14, étape 9) : les certificats se génèrent ensuite via certification.issueForCohort. */
export async function close(principal: Principal, cohortId: string, meta: RequestMeta = {}) {
  return setStatus(principal, cohortId, 'CLOSED', meta)
}

/** Détail complet d'une cohorte : membres, sessions, inscriptions, forum, demande liée. */
export async function get(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      ...cohortSummaryInclude,
      courseVersion: { select: { id: true, version: true, label: true } },
      trainingRequest: { select: { id: true, reference: true, status: true } },
      members: { orderBy: { joinedAt: 'asc' }, include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true } } } },
      sessions: { orderBy: { startsAt: 'asc' }, include: { _count: { select: { attendances: { where: { status: { in: ['PRESENT', 'LATE'] } } } } }, liveSession: { select: { id: true, activityId: true } } } },
      enrollments: { select: { id: true, userId: true, status: true, progressPercent: true, score: true, completedAt: true, certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true } } } },
      forums: { select: { id: true, slug: true, title: true } },
    },
  })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  if (!(await canReadCohort(p, cohort))) throw new NotFoundError('Cohorte', cohortId)
  const enrollmentsByUser = new Map(cohort.enrollments.map((e) => [e.userId, e] as const))
  const now = Date.now()
  return {
    ...cohort,
    canTeach: canTeachCohort(p, cohort),
    members: cohort.members.map((m) => ({ ...m, enrollment: enrollmentsByUser.get(m.userId) ?? null })),
    nextSession: cohort.sessions.find((s) => s.startsAt.getTime() >= now) ?? null,
    stats: {
      members: cohort.members.length,
      active: cohort.enrollments.filter((e) => e.status === 'ACTIVE').length,
      completed: cohort.enrollments.filter((e) => e.status === 'COMPLETED').length,
      averageProgress: cohort.enrollments.length ? Math.round(cohort.enrollments.reduce((s, e) => s + e.progressPercent, 0) / cohort.enrollments.length) : 0,
      certificates: cohort.enrollments.reduce((s, e) => s + e.certificates.length, 0),
    },
  }
}

/** Liste paginée pour la coordination (filtres statut, cours, organisation, recherche). */
export async function list(principal: Principal, query: z.input<typeof cohortListQuerySchema> = {}) {
  const p = requirePrincipal(principal)
  const q = cohortListQuerySchema.parse(query)
  const orgFilter = isCoordination(p) ? undefined : scopedOrganizationFilter(p, q.organizationId)
  if (!isCoordination(p) && !orgFilter) throw new ForbiddenError('Accès aux cohortes refusé')
  const where: Prisma.CohortWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.courseId ? { courseId: q.courseId } : {}),
    ...(q.organizationId && isCoordination(p) ? { organizationId: q.organizationId } : {}),
    ...(orgFilter ? { organizationId: orgFilter } : {}),
    ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { code: { contains: q.q, mode: 'insensitive' } }] } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.cohort.findMany({ where, orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }], ...paginationArgs(q), include: cohortSummaryInclude }),
    prisma.cohort.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Cohortes d'un formateur : désigné, formateur du cours, ou portée COHORT / COURSE ; toutes pour la coordination. */
export async function listForTrainer(principal: Principal) {
  const p = requirePrincipal(principal)
  const scopedCohorts = p.roles.filter((r) => r.role === 'TRAINER' && r.scopeType === 'COHORT' && r.scopeId).map((r) => r.scopeId as string)
  const scopedCourses = p.roles.filter((r) => r.role === 'TRAINER' && r.scopeType === 'COURSE' && r.scopeId).map((r) => r.scopeId as string)
  const where: Prisma.CohortWhereInput = isCoordination(p)
    ? { status: { not: 'CANCELLED' } }
    : {
        status: { not: 'CANCELLED' },
        OR: [
          { trainerId: p.id },
          { course: { trainers: { some: { userId: p.id } } } },
          { members: { some: { userId: p.id, role: 'trainer' } } },
          ...(scopedCohorts.length ? [{ id: { in: scopedCohorts } }] : []),
          ...(scopedCourses.length ? [{ courseId: { in: scopedCourses } }] : []),
        ],
      }
  const now = new Date()
  const cohorts = await prisma.cohort.findMany({
    where,
    orderBy: [{ status: 'asc' }, { startsAt: 'asc' }],
    include: {
      ...cohortSummaryInclude,
      sessions: { where: { startsAt: { gte: now } }, orderBy: { startsAt: 'asc' }, take: 1 },
    },
  })
  return cohorts.map((c) => ({ ...c, nextSession: c.sessions[0] ?? null }))
}

/** Cohortes d'une organisation (responsable d'organisation ou coordination) avec progression agrégée. */
export async function listForOrganization(principal: Principal, organizationId: string) {
  assertOrganizationAccess(principal, organizationId)
  const cohorts = await prisma.cohort.findMany({
    where: { organizationId },
    orderBy: [{ startsAt: 'desc' }],
    include: { ...cohortSummaryInclude, trainingRequest: { select: { id: true, reference: true } } },
  })
  const stats = await prisma.enrollment.groupBy({
    by: ['cohortId'],
    where: { cohortId: { in: cohorts.map((c) => c.id) } },
    _avg: { progressPercent: true, score: true },
    _count: { _all: true },
  })
  const byCohort = new Map(stats.map((s) => [s.cohortId, s] as const))
  return cohorts.map((c) => {
    const s = byCohort.get(c.id)
    return {
      ...c,
      averageProgress: Math.round(s?._avg.progressPercent ?? 0),
      averageScore: s?._avg.score === null || s?._avg.score === undefined ? null : Math.round(s._avg.score),
      enrolled: s?._count._all ?? 0,
    }
  })
}

// -----------------------------------------------------------------------------
// Membres
// -----------------------------------------------------------------------------

/**
 * Ajoute des membres (inscription ACTIVE sur la version de la cohorte). Autorisé à la coordination,
 * au formateur de la cohorte et au responsable de l'organisation bénéficiaire.
 */
export async function addMembers(principal: Principal, cohortId: string, userIds: string[], options: { source?: string; notify?: boolean } = {}, meta: RequestMeta = {}): Promise<BulkResult<{ userId: string; enrollmentId: string }>> {
  const p = requirePrincipal(principal)
  const cohort = await loadCohort(cohortId)
  const allowed = can(p, 'cohort.manage') || canTeachCohort(p, cohort) || (cohort.organizationId ? p.managedOrganizationIds.includes(cohort.organizationId) : false)
  if (!allowed) throw new ForbiddenError("Ajout de membres refusé")
  if (cohort.status === 'CLOSED' || cohort.status === 'CANCELLED') throw new PreconditionError("Cette cohorte n'accepte plus de membres")
  const ids = z.array(idSchema).min(1).max(200).parse([...new Set(userIds)])

  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, isActive: true, email: true, name: true, firstName: true, lastName: true } })
  const byId = new Map(users.map((u) => [u.id, u] as const))
  const done: Array<{ userId: string; enrollmentId: string }> = []
  const skipped: Array<{ id: string; reason: string }> = []
  let memberCount = cohort._count.members

  for (const userId of ids) {
    const user = byId.get(userId)
    if (!user || !user.isActive) {
      skipped.push({ id: userId, reason: 'Utilisateur introuvable ou inactif' })
      continue
    }
    const alreadyMember = await prisma.cohortMember.findUnique({ where: { cohortId_userId: { cohortId, userId } }, select: { id: true } })
    if (!alreadyMember && cohort.capacity !== null && memberCount >= cohort.capacity) {
      skipped.push({ id: userId, reason: 'Capacité de la cohorte atteinte' })
      continue
    }
    const result = await prisma.$transaction((tx) =>
      createEnrollmentTx(tx, {
        userId,
        courseId: cohort.courseId,
        courseVersionId: cohort.courseVersionId,
        cohortId,
        organizationId: cohort.organizationId,
        source: options.source ?? 'cohort',
        status: 'ACTIVE',
        actorId: p.id,
      }),
    )
    if (!alreadyMember) memberCount++
    done.push({ userId, enrollmentId: result.enrollment.id })
    if (result.created || result.reactivated) {
      await audit('enrollment.created', { type: 'Enrollment', id: result.enrollment.id }, auditContext(p, meta), { after: { userId, cohortId, courseId: cohort.courseId } })
      if (options.notify ?? true) {
        await safeNotifyUser(userId, {
          title: 'Inscription à une session de formation',
          body: `Vous êtes inscrit à « ${cohort.course.title} » (cohorte ${cohort.name}).`,
          href: `/cours/${cohort.course.slug}`,
          category: 'training',
          email: false,
        })
        await safeSendEmail({
          to: user.email,
          userId,
          template: emailTemplates.enrollmentConfirmed,
          variables: {
            firstName: user.firstName ?? displayName(user),
            courseTitle: cohort.course.title,
            cohortName: cohort.name,
            startsAt: cohort.startsAt,
            location: cohort.location,
            courseUrl: `${resolvePublicUrl('lms')}/cours/${cohort.course.slug}`,
          },
        })
      }
    }
  }
  return { done, skipped }
}

/** Retire un membre : l'inscription est annulée, l'historique conservé. */
export async function removeMember(principal: Principal, cohortId: string, userId: string, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const cohort = await loadCohort(cohortId)
  if (!can(p, 'cohort.manage') && !canTeachCohort(p, cohort)) throw new ForbiddenError('Retrait de membre refusé')
  await prisma.$transaction(async (tx) => {
    await tx.cohortMember.deleteMany({ where: { cohortId, userId } })
    const enrollments = await tx.enrollment.findMany({ where: { cohortId, userId, status: { in: ['PENDING', 'ACTIVE', 'SUSPENDED'] } } })
    for (const enrollment of enrollments) {
      await tx.enrollment.update({ where: { id: enrollment.id }, data: { status: 'CANCELLED' } })
      await tx.statusEvent.create({ data: { entityType: 'Enrollment', entityId: enrollment.id, enrollmentId: enrollment.id, fromStatus: enrollment.status, toStatus: 'CANCELLED', actorId: p.id, comment: 'Retrait de la cohorte' } })
    }
  })
  await audit('enrollment.status_changed', { type: 'Cohort', id: cohortId }, auditContext(p, meta), { after: { removedUserId: userId } })
}

// -----------------------------------------------------------------------------
// Sessions
// -----------------------------------------------------------------------------

async function assertSessionManager(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await loadCohort(cohortId)
  if (!can(p, 'cohort.manage') && !canTeachCohort(p, cohort)) throw new ForbiddenError('Gestion des sessions refusée')
  return { p, cohort }
}

async function linkLiveSession(tx: Prisma.TransactionClient, cohort: { courseVersionId: string }, activityId: string, session: { id: string; title: string; startsAt: Date; endsAt: Date; meetingUrl: string | null; trainerName: string | null }) {
  const activity = await tx.activity.findUnique({ where: { id: activityId }, select: { id: true, type: true, lesson: { select: { module: { select: { courseVersionId: true } } } } } })
  if (!activity || activity.type !== 'LIVE_SESSION' || activity.lesson.module.courseVersionId !== cohort.courseVersionId) {
    throw new PreconditionError("L'activité liée doit être une séance en direct de la version suivie par la cohorte")
  }
  await tx.liveSession.create({
    data: { activityId, trainingSessionId: session.id, title: session.title, startsAt: session.startsAt, endsAt: session.endsAt, meetingUrl: session.meetingUrl, speakerName: session.trainerName },
  })
}

/** Ajoute une session (présentielle ou virtuelle) et convoque les membres. */
export async function addSession(principal: Principal, cohortId: string, input: SessionInput, meta: RequestMeta = {}) {
  const { p, cohort } = await assertSessionManager(principal, cohortId)
  const data = sessionInputSchema.parse(input)
  const position = await prisma.trainingSession.count({ where: { cohortId } })
  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.trainingSession.create({
      data: {
        cohortId,
        title: data.title,
        description: data.description ?? null,
        mode: data.mode,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location ?? null,
        meetingUrl: data.meetingUrl ?? null,
        trainerName: data.trainerName ?? null,
        position,
      },
    })
    if (data.activityId) await linkLiveSession(tx, cohort, data.activityId, created)
    return created
  })
  await audit('content.created', { type: 'TrainingSession', id: session.id }, auditContext(p, meta), { after: { cohortId, startsAt: session.startsAt } })
  if (data.notify) await convokeMembers(cohortId, session)
  return session
}

/** Convocation des membres (notification interne + email). */
export async function convokeMembers(
  cohortId: string,
  session: { id: string; title: string; startsAt: Date; endsAt: Date; location: string | null; meetingUrl: string | null; mode: string; trainerName?: string | null },
) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: { name: true, course: { select: { title: true } }, members: { where: { role: 'learner' }, select: { user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } } } } },
  })
  if (!cohort) return
  const modeLabel = sessionModeLabels[session.mode as keyof typeof sessionModeLabels] ?? session.mode
  for (const member of cohort.members) {
    await safeNotifyUser(member.user.id, {
      title: 'Convocation à une session',
      body: `${session.title} - ${cohort.course.title}.`,
      href: '/calendrier',
      category: 'sessions',
      email: false,
    })
    await safeSendEmail({
      to: member.user.email,
      userId: member.user.id,
      template: emailTemplates.sessionConvocation,
      variables: {
        firstName: member.user.firstName ?? displayName(member.user),
        courseTitle: cohort.course.title,
        cohortName: cohort.name,
        sessionTitle: session.title,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        location: session.location,
        meetingUrl: session.meetingUrl,
        mode: modeLabel,
        trainerName: session.trainerName ?? null,
        calendarUrl: `${resolvePublicUrl('lms')}/calendrier`,
      },
    })
  }
}

export async function updateSession(principal: Principal, sessionId: string, input: Partial<SessionInput>, meta: RequestMeta = {}) {
  const existing = await prisma.trainingSession.findUnique({ where: { id: sessionId }, include: { liveSession: true } })
  if (!existing) throw new NotFoundError('Session', sessionId)
  const { p, cohort } = await assertSessionManager(principal, existing.cohortId)
  const data = sessionInputSchema.parse({
    title: existing.title,
    description: existing.description,
    mode: existing.mode,
    startsAt: existing.startsAt,
    endsAt: existing.endsAt,
    location: existing.location,
    meetingUrl: existing.meetingUrl,
    trainerName: existing.trainerName,
    activityId: existing.liveSession?.activityId ?? null,
    notify: false,
    ...input,
  })
  const session = await prisma.$transaction(async (tx) => {
    const updated = await tx.trainingSession.update({
      where: { id: sessionId },
      data: {
        title: data.title,
        description: data.description ?? null,
        mode: data.mode,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location ?? null,
        meetingUrl: data.meetingUrl ?? null,
        trainerName: data.trainerName ?? null,
      },
    })
    if (existing.liveSession) {
      if (data.activityId && data.activityId !== existing.liveSession.activityId) {
        await tx.liveSession.delete({ where: { id: existing.liveSession.id } })
        await linkLiveSession(tx, cohort, data.activityId, updated)
      } else if (!data.activityId) {
        await tx.liveSession.delete({ where: { id: existing.liveSession.id } })
      } else {
        await tx.liveSession.update({ where: { id: existing.liveSession.id }, data: { title: updated.title, startsAt: updated.startsAt, endsAt: updated.endsAt, meetingUrl: updated.meetingUrl, speakerName: updated.trainerName } })
      }
    } else if (data.activityId) {
      await linkLiveSession(tx, cohort, data.activityId, updated)
    }
    return updated
  })
  await audit('content.updated', { type: 'TrainingSession', id: sessionId }, auditContext(p, meta), { before: { startsAt: existing.startsAt }, after: { startsAt: session.startsAt } })
  if (data.notify) await convokeMembers(existing.cohortId, session)
  return session
}

export async function removeSession(principal: Principal, sessionId: string, meta: RequestMeta = {}) {
  const existing = await prisma.trainingSession.findUnique({ where: { id: sessionId }, include: { _count: { select: { attendances: true } } } })
  if (!existing) throw new NotFoundError('Session', sessionId)
  const { p } = await assertSessionManager(principal, existing.cohortId)
  if (existing._count.attendances > 0) throw new PreconditionError('Des présences ont été enregistrées : la session ne peut pas être supprimée')
  await prisma.trainingSession.delete({ where: { id: sessionId } })
  await audit('content.archived', { type: 'TrainingSession', id: sessionId }, auditContext(p, meta), { before: { title: existing.title } })
}

/** Sessions d'une cohorte (lecture : enseignant, organisation, membre). */
export async function listSessions(principal: Principal, cohortId: string) {
  const p = requirePrincipal(principal)
  const cohort = await loadCohort(cohortId)
  if (!(await canReadCohort(p, cohort))) throw new NotFoundError('Cohorte', cohortId)
  return prisma.trainingSession.findMany({
    where: { cohortId },
    orderBy: { startsAt: 'asc' },
    include: { _count: { select: { attendances: { where: { status: { in: ['PRESENT', 'LATE'] } } } } }, liveSession: { select: { id: true, activityId: true, replayUrl: true } } },
  })
}

/** Prochaines sessions du principal (membre ou formateur ; toutes pour la coordination). */
export async function listUpcomingSessions(principal: Principal, options: { limit?: number; from?: Date } = {}) {
  const p = requirePrincipal(principal)
  const from = options.from ?? new Date()
  const where: Prisma.TrainingSessionWhereInput = {
    startsAt: { gte: from },
    ...(isCoordination(p) ? {} : { cohort: { OR: [{ trainerId: p.id }, { members: { some: { userId: p.id } } }, { course: { trainers: { some: { userId: p.id } } } }] } }),
  }
  return prisma.trainingSession.findMany({
    where,
    orderBy: { startsAt: 'asc' },
    take: options.limit ?? 10,
    include: {
      cohort: { select: { id: true, code: true, name: true, trainerId: true, course: { select: { id: true, slug: true, title: true } } } },
      attendances: { where: { userId: p.id }, select: { status: true } },
    },
  })
}

/** Sessions passées et à venir d'un apprenant (calendrier). */
export async function calendarForUser(principal: Principal, range: { from: Date; to: Date }) {
  const p = requirePrincipal(principal)
  return prisma.trainingSession.findMany({
    where: {
      startsAt: { gte: range.from, lte: range.to },
      cohort: { OR: [{ trainerId: p.id }, { members: { some: { userId: p.id } } }] },
    },
    orderBy: { startsAt: 'asc' },
    include: {
      cohort: { select: { id: true, code: true, name: true, course: { select: { id: true, slug: true, title: true } } } },
      attendances: { where: { userId: p.id }, select: { status: true, checkedInAt: true } },
    },
  })
}
