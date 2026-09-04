import { resolvePublicUrl } from '@fetrag/config'
import {
  idSchema,
  sessionModeLabels,
  trainingRequestDecisionSchema,
  trainingRequestInputSchema,
  trainingRequestStatusSchema,
  trainingRequestTransitions,
  type TrainingRequestInput,
  type TrainingRequestStatusName,
} from '@fetrag/contracts'
import { prisma, type Prisma, type TrainingRequestStatus } from '@fetrag/db'
import { audit, emit, ForbiddenError, formatDate, makeCohortCode, makeReference, NotFoundError, paginationArgs, PreconditionError, referencePrefixes, toPaginated, uniqueSlug } from '@fetrag/domain'
import { z } from 'zod'
import { createEnrollmentTx } from './internal/enrollment-core'
import { assertCan, assertOrganizationAccess, auditContext, can, isCoordination, requirePrincipal, scopedOrganizationFilter } from './lib/access'
import { emailTemplates, safeNotifyRole, safeNotifyUser, safeSendEmail } from './lib/integrations'
import { toJsonValue } from './lib/json'
import { hashPassword } from './lib/password'
import { trainingParticipantLimit } from './lib/settings'
import { randomPassword, splitName } from './lib/text'
import type { Principal, RequestMeta } from './types'

export type TrainingRequestDecisionInput = z.input<typeof trainingRequestDecisionSchema>

export const attachmentInputSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().url(),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  size: z.number().int().positive().max(10 * 1024 * 1024),
  label: z.string().trim().max(160).optional(),
})
export type AttachmentInput = z.input<typeof attachmentInputSchema>

export const trainingRequestListQuerySchema = z.object({
  status: trainingRequestStatusSchema.optional(),
  organizationId: idSchema.optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

/** Statuts considérés comme « en attente d'action de la coordination ». */
export const pendingCoordinationStatuses: TrainingRequestStatusName[] = ['SUBMITTED', 'RESCHEDULED', 'ACCEPTED']

const requestInclude = {
  organization: { select: { id: true, name: true, acronym: true, slug: true } },
  requester: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
  modules: { orderBy: { position: 'asc' as const }, include: { course: { select: { id: true, slug: true, code: true, title: true, durationHours: true, currentVersionId: true, status: true } } } },
  participants: { orderBy: { fullName: 'asc' as const } },
  attachments: { orderBy: { createdAt: 'asc' as const } },
  decisions: { orderBy: { createdAt: 'desc' as const }, include: { actor: { select: { id: true, name: true } } } },
  cohort: { select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true, trainerId: true, _count: { select: { members: true, sessions: true } } } },
} satisfies Prisma.TrainingRequestInclude

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function loadRequest(requestId: string) {
  const request = await prisma.trainingRequest.findUnique({ where: { id: requestId }, include: requestInclude })
  if (!request) throw new NotFoundError('Demande de formation', requestId)
  return request
}

function assertRequestOwner(principal: Principal, request: { organizationId: string; requesterId: string }): Principal {
  const p = requirePrincipal(principal)
  if (request.requesterId === p.id || can(p, 'training_request.create', { organizationId: request.organizationId }) || isCoordination(p)) return p
  throw new ForbiddenError("Cette demande n'est pas accessible")
}

function assertTransition(from: TrainingRequestStatus, to: TrainingRequestStatusName): void {
  const allowed = trainingRequestTransitions[from]
  if (!allowed.includes(to)) throw new PreconditionError(`Transition ${from} → ${to} non autorisée`, { from, to })
}

async function validateCourses(courseIds: string[]) {
  const unique = [...new Set(courseIds)]
  const courses = await prisma.course.findMany({ where: { id: { in: unique } }, select: { id: true, title: true, status: true, currentVersionId: true } })
  const found = new Map(courses.map((c) => [c.id, c] as const))
  const missing = unique.filter((id) => !found.has(id))
  if (missing.length) throw new NotFoundError('Module', missing.join(', '))
  const unavailable = courses.filter((c) => c.status === 'ARCHIVED').map((c) => c.title)
  if (unavailable.length) throw new PreconditionError('Modules indisponibles : ' + unavailable.join(', '))
  return unique
}

function normalizeParticipants(participants: TrainingRequestInput['participants']) {
  const seen = new Set<string>()
  return participants
    .map((p) => ({
      fullName: p.fullName.trim(),
      email: p.email && p.email.trim() ? p.email.trim().toLowerCase() : null,
      phone: p.phone && p.phone.trim() ? p.phone.trim() : null,
      jobTitle: p.jobTitle?.trim() || null,
    }))
    .filter((p) => {
      const key = p.email ?? `${p.fullName}|${p.phone ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

// -----------------------------------------------------------------------------
// Création / soumission (côté organisation)
// -----------------------------------------------------------------------------

/**
 * Crée une demande institutionnelle (chapitre 14, étapes 2 à 5) et la soumet (DRAFT -> SUBMITTED)
 * sauf `submit: false` (brouillon). Notifie la coordination et accuse réception au contact.
 */
export async function create(principal: Principal, input: TrainingRequestInput, options: { submit?: boolean } = {}, meta: RequestMeta = {}) {
  const data = trainingRequestInputSchema.parse(input)
  const p = assertCan(principal, 'training_request.create', { organizationId: data.organizationId }, 'Seul un responsable de cette organisation peut déposer une demande')
  const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true, name: true, isActive: true } })
  if (!organization || !organization.isActive) throw new NotFoundError('Organisation', data.organizationId)
  const limit = await trainingParticipantLimit()
  const participants = normalizeParticipants(data.participants)
  if (participants.length === 0) throw new PreconditionError('Désignez au moins un participant')
  if (participants.length > limit) throw new PreconditionError(`Le nombre de participants est limité à ${limit} par demande`, { limit })
  const courseIds = await validateCourses(data.courseIds)
  const submit = options.submit ?? true
  const now = new Date()

  const knownUsers = await prisma.user.findMany({ where: { email: { in: participants.map((x) => x.email).filter((e): e is string => Boolean(e)) } }, select: { id: true, email: true } })
  const userByEmail = new Map(knownUsers.map((u) => [u.email.toLowerCase(), u.id] as const))

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.trainingRequest.create({
      data: {
        reference: makeReference(referencePrefixes.trainingRequest, now),
        organizationId: organization.id,
        requesterId: p.id,
        contactName: data.contactName,
        contactRole: data.contactRole ?? null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone && data.contactPhone.trim() ? data.contactPhone : null,
        status: submit ? 'SUBMITTED' : 'DRAFT',
        preferredStart: data.preferredStart ?? null,
        preferredMode: data.preferredMode,
        participantLimit: limit,
        motivation: data.motivation ?? null,
        commitmentsAccepted: true,
        commitmentsAcceptedAt: now,
        submittedAt: submit ? now : null,
        modules: { create: courseIds.map((courseId, position) => ({ courseId, position })) },
        participants: { create: participants.map((x) => ({ ...x, userId: x.email ? (userByEmail.get(x.email) ?? null) : null })) },
      },
      include: requestInclude,
    })
    await tx.decisionHistory.create({ data: { requestId: created.id, actorId: p.id, fromStatus: null, toStatus: 'DRAFT' } })
    if (submit) await tx.decisionHistory.create({ data: { requestId: created.id, actorId: p.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED' } })
    return created
  })

  await audit(submit ? 'training_request.submitted' : 'content.created', { type: 'TrainingRequest', id: request.id }, auditContext(p, meta), {
    after: { reference: request.reference, organizationId: organization.id, modules: courseIds.length, participants: participants.length, status: request.status },
  })
  if (submit) await afterSubmission(request.id, p)
  return request
}

async function afterSubmission(requestId: string, actor: Principal): Promise<void> {
  const request = await loadRequest(requestId)
  await emit('training.request.submitted', { requestId, reference: request.reference, organizationId: request.organizationId, modules: request.modules.map((m) => m.courseId) }, { actorId: actor.id })
  await safeNotifyRole('COORDINATOR', {
    title: 'Nouvelle demande de formation',
    body: `${request.organization.name} : ${request.modules.map((m) => m.course.title).join(', ')} (${request.participants.length} participant(s)).`,
    href: `/coordination/demandes/${request.id}`,
    category: 'requests',
    email: true,
  })
  await safeNotifyUser(request.requesterId, {
    title: 'Demande transmise',
    body: `Votre demande ${request.reference} a été transmise à la coordination FETRAG.`,
    href: `/organisation/demandes/${request.id}`,
    category: 'requests',
  })
  await safeSendEmail({
    to: request.contactEmail,
    userId: request.requesterId,
    template: emailTemplates.requestSubmitted,
    variables: {
      firstName: request.contactName,
      contactName: request.contactName,
      reference: request.reference,
      organizationName: request.organization.name,
      modules: request.modules.map((m) => m.course.title).join(', '),
      participantCount: request.participants.length,
      preferredStart: request.preferredStart,
      dashboardUrl: `${resolvePublicUrl('lms')}/organisation/demandes/${request.id}`,
    },
  })
}

/** Modification d'un brouillon ou d'une demande en attente de complément. */
export async function update(principal: Principal, requestId: string, input: TrainingRequestInput, meta: RequestMeta = {}) {
  const existing = await loadRequest(requestId)
  const p = assertRequestOwner(principal, existing)
  if (existing.status !== 'DRAFT' && existing.status !== 'INFO_REQUESTED') throw new PreconditionError('Seuls les brouillons et les demandes en attente de complément sont modifiables')
  const data = trainingRequestInputSchema.parse({ ...input, organizationId: existing.organizationId })
  const limit = existing.participantLimit
  const participants = normalizeParticipants(data.participants)
  if (participants.length > limit) throw new PreconditionError(`Le nombre de participants est limité à ${limit} par demande`, { limit })
  const courseIds = await validateCourses(data.courseIds)
  const knownUsers = await prisma.user.findMany({ where: { email: { in: participants.map((x) => x.email).filter((e): e is string => Boolean(e)) } }, select: { id: true, email: true } })
  const userByEmail = new Map(knownUsers.map((u) => [u.email.toLowerCase(), u.id] as const))

  const request = await prisma.$transaction(async (tx) => {
    await tx.trainingRequestModule.deleteMany({ where: { requestId } })
    await tx.trainingRequestParticipant.deleteMany({ where: { requestId } })
    return tx.trainingRequest.update({
      where: { id: requestId },
      data: {
        contactName: data.contactName,
        contactRole: data.contactRole ?? null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone && data.contactPhone.trim() ? data.contactPhone : null,
        preferredStart: data.preferredStart ?? null,
        preferredMode: data.preferredMode,
        motivation: data.motivation ?? null,
        modules: { create: courseIds.map((courseId, position) => ({ courseId, position })) },
        participants: { create: participants.map((x) => ({ ...x, userId: x.email ? (userByEmail.get(x.email) ?? null) : null })) },
      },
      include: requestInclude,
    })
  })
  await audit('content.updated', { type: 'TrainingRequest', id: requestId }, auditContext(p, meta), { after: { modules: courseIds.length, participants: participants.length } })
  return request
}

/** Soumission (DRAFT / INFO_REQUESTED -> SUBMITTED). */
export async function submit(principal: Principal, requestId: string, meta: RequestMeta = {}) {
  const existing = await loadRequest(requestId)
  const p = assertRequestOwner(principal, existing)
  assertTransition(existing.status, 'SUBMITTED')
  if (existing.modules.length === 0 || existing.participants.length === 0) throw new PreconditionError('La demande doit comporter au moins un module et un participant')
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.trainingRequest.update({ where: { id: requestId }, data: { status: 'SUBMITTED', submittedAt: new Date() }, include: requestInclude })
    await tx.decisionHistory.create({ data: { requestId, actorId: p.id, fromStatus: existing.status, toStatus: 'SUBMITTED' } })
    return updated
  })
  await audit('training_request.submitted', { type: 'TrainingRequest', id: requestId }, auditContext(p, meta), { before: { status: existing.status }, after: { status: 'SUBMITTED' } })
  await afterSubmission(requestId, p)
  return request
}

/** Annulation par l'organisation (tant que la formation n'a pas démarré) ou la coordination. */
export async function cancel(principal: Principal, requestId: string, reason?: string, meta: RequestMeta = {}) {
  const existing = await loadRequest(requestId)
  const p = assertRequestOwner(principal, existing)
  assertTransition(existing.status, 'CANCELLED')
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.trainingRequest.update({ where: { id: requestId }, data: { status: 'CANCELLED', decidedAt: new Date() }, include: requestInclude })
    await tx.decisionHistory.create({ data: { requestId, actorId: p.id, fromStatus: existing.status, toStatus: 'CANCELLED', comment: reason ?? null } })
    if (existing.cohort && (existing.cohort.status === 'PLANNED' || existing.cohort.status === 'OPEN')) {
      await tx.cohort.update({ where: { id: existing.cohort.id }, data: { status: 'CANCELLED' } })
    }
    return updated
  })
  await audit('training_request.decided', { type: 'TrainingRequest', id: requestId }, auditContext(p, meta), { before: { status: existing.status }, after: { status: 'CANCELLED', reason: reason ?? null } })
  if (p.id !== existing.requesterId) {
    await safeNotifyUser(existing.requesterId, { title: 'Demande annulée', body: `La demande ${existing.reference} a été annulée.${reason ? ' ' + reason : ''}`, href: `/organisation/demandes/${requestId}`, category: 'requests', email: true })
  }
  return request
}

// -----------------------------------------------------------------------------
// Décision (côté coordination)
// -----------------------------------------------------------------------------

export interface ScheduleResult {
  cohorts: Array<{ id: string; code: string; name: string; courseId: string; courseTitle: string }>
  accounts: { created: number; existing: number; enrolled: number; skipped: Array<{ participant: string; reason: string }> }
}

interface PreparedAccount {
  participantId: string
  fullName: string
  email: string
  phone: string | null
  jobTitle: string | null
  existingUserId: string | null
  passwordHash: string | null
}

/** Prépare les comptes hors transaction (recherche par email, hachage bcrypt des mots de passe aléatoires). */
async function prepareAccounts(participants: Array<{ id: string; fullName: string; email: string | null; phone: string | null; jobTitle: string | null; userId: string | null }>) {
  const prepared: PreparedAccount[] = []
  const skipped: Array<{ participant: string; reason: string }> = []
  for (const participant of participants) {
    if (participant.userId) {
      const user = await prisma.user.findUnique({ where: { id: participant.userId }, select: { id: true, email: true } })
      if (user) {
        prepared.push({ participantId: participant.id, fullName: participant.fullName, email: user.email, phone: participant.phone, jobTitle: participant.jobTitle, existingUserId: user.id, passwordHash: null })
        continue
      }
    }
    const email = participant.email?.trim().toLowerCase()
    if (!email) {
      skipped.push({ participant: participant.fullName, reason: 'Adresse email manquante : compte non créé' })
      continue
    }
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    prepared.push({
      participantId: participant.id,
      fullName: participant.fullName,
      email,
      phone: participant.phone,
      jobTitle: participant.jobTitle,
      existingUserId: existing?.id ?? null,
      passwordHash: existing ? null : await hashPassword(randomPassword()),
    })
  }
  return { prepared, skipped }
}

/**
 * Planification (ACCEPTED -> SCHEDULED) : une cohorte par module sur la version courante,
 * comptes participants manquants, adhésion à l'organisation, inscriptions ACTIVE, forum de cohorte.
 */
async function schedule(principal: Principal, request: Awaited<ReturnType<typeof loadRequest>>, input: z.infer<typeof trainingRequestDecisionSchema>, meta: RequestMeta): Promise<ScheduleResult> {
  if (request.modules.length === 0) throw new PreconditionError('La demande ne comporte aucun module')
  for (const module of request.modules) {
    if (!module.course.currentVersionId) throw new PreconditionError(`Le module « ${module.course.title} » n'a pas de version publiée`)
  }
  if (input.trainerId) {
    const trainer = await prisma.user.findUnique({ where: { id: input.trainerId }, select: { id: true, isActive: true } })
    if (!trainer || !trainer.isActive) throw new NotFoundError('Formateur', input.trainerId)
  }
  const { prepared, skipped } = await prepareAccounts(request.participants)
  const startsAt = input.proposedStart ?? request.proposedStart ?? request.preferredStart ?? null
  const mode = input.proposedMode ?? request.proposedMode ?? request.preferredMode
  const organizationLabel = request.organization.acronym ?? request.organization.name
  const invitations: Array<{ userId: string; email: string; name: string }> = []
  let createdAccounts = 0
  let existingAccounts = 0

  const cohorts = await prisma.$transaction(async (tx) => {
    const userIds: string[] = []
    for (const account of prepared) {
      let userId = account.existingUserId
      if (!userId) {
        const { firstName, lastName } = splitName(account.fullName)
        const user = await tx.user.create({
          data: {
            email: account.email,
            name: account.fullName,
            firstName,
            lastName,
            phone: account.phone,
            jobTitle: account.jobTitle,
            employer: request.organization.name,
            passwordHash: account.passwordHash,
            isActive: true,
          },
        })
        userId = user.id
        createdAccounts++
        invitations.push({ userId, email: account.email, name: account.fullName })
      } else {
        existingAccounts++
      }
      const role = await tx.roleAssignment.findFirst({ where: { userId, role: 'LEARNER', scopeType: 'GLOBAL', scopeId: null } })
      if (!role) await tx.roleAssignment.create({ data: { userId, role: 'LEARNER', scopeType: 'GLOBAL', scopeId: null, grantedById: principal.id } })
      await tx.organizationMembership.upsert({
        where: { organizationId_userId: { organizationId: request.organizationId, userId } },
        create: { organizationId: request.organizationId, userId, title: account.jobTitle },
        update: {},
      })
      await tx.trainingRequestParticipant.update({ where: { id: account.participantId }, data: { userId, enrolled: true } })
      userIds.push(userId)
    }

    const created: ScheduleResult['cohorts'] = []
    for (const [index, module] of request.modules.entries()) {
      const course = module.course
      const courseVersionId = course.currentVersionId as string
      const baseName = input.cohortName?.trim() || `${organizationLabel} - ${course.title}`
      const name = request.modules.length > 1 && input.cohortName ? `${baseName} - ${course.title}` : baseName
      const code = makeCohortCode(course.code)
      const cohort = await tx.cohort.create({
        data: {
          code,
          name,
          courseId: course.id,
          courseVersionId,
          organizationId: request.organizationId,
          trainerId: input.trainerId ?? null,
          trainingRequestId: index === 0 ? request.id : null,
          status: 'PLANNED',
          mode,
          capacity: request.participantLimit,
          startsAt,
          isPrivate: true,
          description: `Demande ${request.reference} - ${request.organization.name}`,
        },
      })
      await tx.forum.create({
        data: {
          slug: await uniqueSlug(`cohorte-${code}`, async (c) => Boolean(await tx.forum.findUnique({ where: { slug: c }, select: { id: true } }))),
          title: `Espace d'échange - ${name}`,
          courseId: course.id,
          cohortId: cohort.id,
        },
      })
      if (input.trainerId) {
        await tx.cohortMember.create({ data: { cohortId: cohort.id, userId: input.trainerId, role: 'trainer' } })
      }
      for (const userId of userIds) {
        await createEnrollmentTx(tx, {
          userId,
          courseId: course.id,
          courseVersionId,
          cohortId: cohort.id,
          organizationId: request.organizationId,
          source: 'organization',
          status: 'ACTIVE',
          actorId: principal.id,
        })
      }
      created.push({ id: cohort.id, code: cohort.code, name: cohort.name, courseId: course.id, courseTitle: course.title })
    }

    await tx.trainingRequest.update({
      where: { id: request.id },
      data: { status: 'SCHEDULED', decidedAt: new Date(), proposedStart: startsAt, proposedMode: mode, coordinatorNote: input.comment ?? request.coordinatorNote },
    })
    await tx.decisionHistory.create({
      data: {
        requestId: request.id,
        actorId: principal.id,
        fromStatus: request.status,
        toStatus: 'SCHEDULED',
        comment: input.comment ?? null,
        payload: toJsonValue({ cohortIds: created.map((c) => c.id), trainerId: input.trainerId ?? null, startsAt, mode, createdAccounts, existingAccounts, skipped }),
      },
    })
    return created
  })

  // Notifications post-commit
  const lmsUrl = resolvePublicUrl('lms')
  for (const invitation of invitations) {
    await safeSendEmail({
      to: invitation.email,
      userId: invitation.userId,
      subject: 'Votre accès à la plateforme de formation FETRAG',
      template: emailTemplates.invitation,
      variables: {
        firstName: splitName(invitation.name).firstName ?? invitation.name,
        name: invitation.name,
        email: invitation.email,
        organizationName: request.organization.name,
        modules: request.modules.map((m) => m.course.title).join(', '),
        startsAt,
        loginUrl: `${lmsUrl}/connexion`,
        passwordUrl: `${resolvePublicUrl('web')}/mot-de-passe-oublie`,
        invitation: true,
      },
    })
  }
  const enrolledUserIds = prepared.map((a) => a.existingUserId).filter((id): id is string => Boolean(id))
  for (const userId of enrolledUserIds) {
    await safeNotifyUser(userId, {
      title: 'Inscription à une formation',
      body: `${request.organization.name} vous a inscrit à : ${request.modules.map((m) => m.course.title).join(', ')}.`,
      href: '/mes-formations',
      category: 'training',
      email: true,
    })
  }
  if (input.trainerId) {
    await safeNotifyUser(input.trainerId, {
      title: 'Nouvelle cohorte attribuée',
      body: `${cohorts.length} cohorte(s) pour ${request.organization.name} : ${cohorts.map((c) => c.name).join(', ')}.`,
      href: `/formateur/cohortes/${cohorts[0]?.id ?? ''}`,
      category: 'training',
      email: true,
    })
  }
  await safeNotifyUser(request.requesterId, {
    title: 'Formation planifiée',
    body: `La demande ${request.reference} est planifiée${startsAt ? ` à partir du ${formatDate(startsAt)}` : ''}. ${prepared.length} participant(s) inscrit(s).`,
    href: `/organisation/demandes/${request.id}`,
    category: 'requests',
    email: false,
  })
  await safeSendEmail({
    to: request.contactEmail,
    userId: request.requesterId,
    template: emailTemplates.requestScheduled,
    variables: {
      firstName: request.contactName,
      contactName: request.contactName,
      reference: request.reference,
      organizationName: request.organization.name,
      cohortName: cohorts.map((c) => `${c.name} (${c.code})`).join(' ; '),
      startsAt,
      mode: sessionModeLabels[mode],
      location: null,
      participantCount: prepared.length,
      skippedCount: skipped.length,
      skippedParticipants: skipped.map((s) => s.participant).join(', '),
      dashboardUrl: `${lmsUrl}/organisation/demandes/${request.id}`,
    },
  })
  await audit('training_request.decided', { type: 'TrainingRequest', id: request.id }, auditContext(principal, meta), {
    before: { status: request.status },
    after: { status: 'SCHEDULED', cohorts: cohorts.map((c) => c.code), createdAccounts, existingAccounts, skipped: skipped.length },
  })
  return { cohorts, accounts: { created: createdAccounts, existing: existingAccounts, enrolled: prepared.length, skipped } }
}

/**
 * Décision de la coordination (chapitre 14, étapes 6 et 7) : complément, acceptation, refus,
 * proposition de date, planification (création de cohortes / comptes / inscriptions) ou annulation.
 */
export async function decide(principal: Principal, input: TrainingRequestDecisionInput, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'training_request.decide')
  const data = trainingRequestDecisionSchema.parse(input)
  const request = await loadRequest(data.requestId)
  assertTransition(request.status, data.decision)

  if (data.decision === 'SCHEDULED') {
    const result = await schedule(p, request, data, meta)
    return { request: await loadRequest(request.id), schedule: result }
  }
  if (data.decision === 'CANCELLED') {
    return { request: await cancel(p, request.id, data.comment, meta), schedule: null }
  }
  if ((data.decision === 'INFO_REQUESTED' || data.decision === 'REJECTED') && !data.comment) {
    throw new PreconditionError('Un commentaire est requis pour cette décision')
  }
  if (data.decision === 'RESCHEDULED' && !data.proposedStart) {
    throw new PreconditionError('Indiquez la date proposée')
  }

  const now = new Date()
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.trainingRequest.update({
      where: { id: request.id },
      data: {
        status: data.decision,
        coordinatorNote: data.comment ?? request.coordinatorNote,
        proposedStart: data.proposedStart ?? request.proposedStart,
        proposedMode: data.proposedMode ?? request.proposedMode,
        decidedAt: data.decision === 'ACCEPTED' || data.decision === 'REJECTED' ? now : request.decidedAt,
      },
      include: requestInclude,
    })
    await tx.decisionHistory.create({
      data: {
        requestId: request.id,
        actorId: p.id,
        fromStatus: request.status,
        toStatus: data.decision,
        comment: data.comment ?? null,
        payload: data.proposedStart || data.proposedMode ? toJsonValue({ proposedStart: data.proposedStart ?? null, proposedMode: data.proposedMode ?? null }) : undefined,
      },
    })
    return row
  })

  await audit('training_request.decided', { type: 'TrainingRequest', id: request.id }, auditContext(p, meta), { before: { status: request.status }, after: { status: data.decision, comment: data.comment ?? null } })

  const eventName = data.decision === 'ACCEPTED' ? 'training.request.approved' : data.decision === 'REJECTED' ? 'training.request.rejected' : data.decision === 'INFO_REQUESTED' ? 'training.request.info_requested' : null
  if (eventName) await emit(eventName, { requestId: request.id, reference: request.reference, organizationId: request.organizationId, comment: data.comment ?? null }, { actorId: p.id })

  const messages: Record<'INFO_REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED', { title: string; body: string; template: string }> = {
    INFO_REQUESTED: { title: 'Complément demandé', body: `La coordination demande un complément pour la demande ${request.reference} : ${data.comment ?? ''}`, template: emailTemplates.requestInfoRequested },
    ACCEPTED: { title: 'Demande acceptée', body: `La demande ${request.reference} est acceptée. La planification vous sera communiquée.`, template: emailTemplates.requestAccepted },
    REJECTED: { title: 'Demande refusée', body: `La demande ${request.reference} n'a pas été retenue : ${data.comment ?? ''}`, template: emailTemplates.requestRejected },
    RESCHEDULED: { title: 'Nouvelle date proposée', body: `La coordination propose une autre date pour la demande ${request.reference}${data.proposedStart ? ` : ${formatDate(data.proposedStart)}` : ''}.${data.comment ? ' ' + data.comment : ''}`, template: emailTemplates.requestRescheduled },
  }
  const message = messages[data.decision]
  const dashboardUrl = `${resolvePublicUrl('lms')}/organisation/demandes/${request.id}`
  await safeNotifyUser(request.requesterId, { title: message.title, body: message.body, href: `/organisation/demandes/${request.id}`, category: 'requests', email: false })
  await safeSendEmail({
    to: request.contactEmail,
    userId: request.requesterId,
    template: message.template,
    variables: {
      firstName: request.contactName,
      contactName: request.contactName,
      title: `${message.title} - demande ${request.reference}`,
      body: message.body,
      href: dashboardUrl,
      reference: request.reference,
      organizationName: request.organization.name,
      comment: data.comment ?? null,
      proposedStart: data.proposedStart ?? null,
      proposedMode: data.proposedMode ? sessionModeLabels[data.proposedMode] : null,
      dashboardUrl,
    },
  })
  return { request: updated, schedule: null }
}

// -----------------------------------------------------------------------------
// Lecture
// -----------------------------------------------------------------------------

/** Demandes d'une organisation (responsable d'organisation ou coordination). */
export async function listForOrganization(principal: Principal, organizationId: string, query: z.input<typeof trainingRequestListQuerySchema> = {}) {
  assertOrganizationAccess(principal, organizationId)
  const q = trainingRequestListQuerySchema.parse(query)
  const where: Prisma.TrainingRequestWhereInput = { organizationId, ...(q.status ? { status: q.status } : {}) }
  const [items, total] = await Promise.all([
    prisma.trainingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs(q),
      include: {
        modules: { orderBy: { position: 'asc' }, include: { course: { select: { id: true, title: true, code: true } } } },
        cohort: { select: { id: true, code: true, status: true, startsAt: true } },
        _count: { select: { participants: true, attachments: true } },
      },
    }),
    prisma.trainingRequest.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** File de traitement de la coordination (filtres statut, organisation, recherche). */
export async function listForCoordination(principal: Principal, filter: z.input<typeof trainingRequestListQuerySchema> = {}) {
  const p = assertCan(principal, 'training_request.decide')
  const q = trainingRequestListQuerySchema.parse(filter)
  const orgFilter = scopedOrganizationFilter(p, q.organizationId)
  const where: Prisma.TrainingRequestWhereInput = {
    ...(q.status ? { status: q.status } : { status: { not: 'DRAFT' } }),
    ...(orgFilter ? { organizationId: orgFilter } : {}),
    ...(q.q
      ? { OR: [{ reference: { contains: q.q, mode: 'insensitive' } }, { contactName: { contains: q.q, mode: 'insensitive' } }, { organization: { name: { contains: q.q, mode: 'insensitive' } } }] }
      : {}),
  }
  const [items, total, pendingCount] = await Promise.all([
    prisma.trainingRequest.findMany({
      where,
      orderBy: [{ submittedAt: 'asc' }, { createdAt: 'desc' }],
      ...paginationArgs(q),
      include: {
        organization: { select: { id: true, name: true, acronym: true } },
        modules: { orderBy: { position: 'asc' }, include: { course: { select: { id: true, title: true, code: true } } } },
        cohort: { select: { id: true, code: true, status: true } },
        _count: { select: { participants: true, attachments: true } },
      },
    }),
    prisma.trainingRequest.count({ where }),
    prisma.trainingRequest.count({ where: { status: { in: pendingCoordinationStatuses } } }),
  ])
  return { ...toPaginated(items, total, q), pendingCount }
}

/** Détail d'une demande : organisation concernée ou coordination. */
export async function get(principal: Principal, requestId: string) {
  const request = await loadRequest(requestId)
  const p = requirePrincipal(principal)
  const allowed = isCoordination(p) || can(p, 'training_request.decide') || can(p, 'organization.read', { organizationId: request.organizationId }) || request.requesterId === p.id
  if (!allowed) throw new NotFoundError('Demande de formation', requestId)
  return {
    ...request,
    allowedTransitions: trainingRequestTransitions[request.status],
    canDecide: can(p, 'training_request.decide'),
    canEdit: (request.status === 'DRAFT' || request.status === 'INFO_REQUESTED') && (request.requesterId === p.id || can(p, 'training_request.create', { organizationId: request.organizationId })),
  }
}

/** Ajout d'une pièce officielle (fichier déjà déposé dans le stockage). */
export async function addAttachment(principal: Principal, requestId: string, input: AttachmentInput, meta: RequestMeta = {}) {
  const request = await loadRequest(requestId)
  const p = assertRequestOwner(principal, request)
  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(request.status)) throw new PreconditionError('La demande est close : pièce refusée')
  const data = attachmentInputSchema.parse(input)
  const attachment = await prisma.attachment.create({ data: { requestId, fileName: data.fileName, fileUrl: data.fileUrl, mimeType: data.mimeType, size: data.size, label: data.label ?? null } })
  await audit('content.updated', { type: 'TrainingRequest', id: requestId }, auditContext(p, meta), { after: { attachment: attachment.fileName } })
  return attachment
}

export async function removeAttachment(principal: Principal, attachmentId: string, meta: RequestMeta = {}) {
  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId }, include: { request: { select: { id: true, organizationId: true, requesterId: true, status: true } } } })
  if (!attachment) throw new NotFoundError('Pièce jointe', attachmentId)
  const p = assertRequestOwner(principal, attachment.request)
  if (!['DRAFT', 'SUBMITTED', 'INFO_REQUESTED'].includes(attachment.request.status) && !isCoordination(p)) throw new PreconditionError('La pièce ne peut plus être retirée')
  await prisma.attachment.delete({ where: { id: attachmentId } })
  await audit('content.updated', { type: 'TrainingRequest', id: attachment.request.id }, auditContext(p, meta), { before: { attachment: attachment.fileName } })
}

/** Limite de participants applicable (paramètre système). */
export async function participantLimit(): Promise<number> {
  return trainingParticipantLimit()
}

export { trainingRequestTransitions, makeCohortCode }
