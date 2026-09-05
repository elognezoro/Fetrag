import 'server-only'
import { prisma } from '@fetrag/db'
import { audit, can, ForbiddenError, hasGlobalRole, hasRole, isSuperAdmin, makeReference, NotFoundError, organizationFilter, PreconditionError, referencePrefixes, type Principal } from '@fetrag/domain'
import { auditContext, trainingParticipantLimit, type RequestMeta } from '@fetrag/lms-core'
import { draftRequestSchema, type DraftRequestInput } from './schemas'

/**
 * Helpers locaux de l'espace organisation (lot LMS-STAFF).
 * Ils complètent @fetrag/lms-core sans logique métier nouvelle : sélection d'organisation,
 * liste des participants avec progression, et brouillon partiel de demande de formation.
 */

export interface OrganizationSummary {
  id: string
  name: string
  acronym: string | null
  sector: string | null
  city: string | null
  logoUrl: string | null
  isManager: boolean
}

/** Le principal pilote-t-il au moins une organisation (responsable désigné ou rôle ORG_MANAGER) ? */
export function isOrganizationManager(principal: Principal): boolean {
  return isSuperAdmin(principal) || hasGlobalRole(principal, 'COORDINATOR') || hasRole(principal, 'ORG_MANAGER') || principal.managedOrganizationIds.length > 0
}

/** Organisations visibles du principal (toutes pour la coordination, sinon celles de ses portées). */
export async function visibleOrganizations(principal: Principal): Promise<OrganizationSummary[]> {
  const filter = organizationFilter(principal)
  const ids = filter?.in ?? null
  const all = ids === null || (ids.length === 0 && hasGlobalRole(principal, 'ORG_MANAGER'))
  const rows = await prisma.organization.findMany({
    where: { isActive: true, ...(all ? {} : { id: { in: ids ?? [] } }) },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, acronym: true, sector: true, city: true, logoUrl: true },
  })
  return rows.map((o) => ({ ...o, isManager: can(principal, 'training_request.create', { organizationId: o.id }) }))
}

/** Résout l'organisation active : celle demandée si accessible, sinon la première visible. */
export async function resolveOrganization(principal: Principal, requestedId?: string | null): Promise<{ organizations: OrganizationSummary[]; current: OrganizationSummary | null }> {
  const organizations = await visibleOrganizations(principal)
  const current = (requestedId ? organizations.find((o) => o.id === requestedId) : undefined) ?? organizations[0] ?? null
  return { organizations, current }
}

/** Modules du programme (cours publiés) pour la sélection dans l'assistant. */
export async function listProgrammeModules() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ position: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      code: true,
      title: true,
      pillar: true,
      durationHours: true,
      position: true,
      summary: true,
      objectives: true,
      currentVersion: { select: { modules: { orderBy: { position: 'asc' }, select: { title: true }, take: 3 } } },
    },
  })
  return courses.map((c, index) => ({
    id: c.id,
    code: c.code,
    number: c.position > 0 ? c.position : index + 1,
    title: c.title,
    pillar: c.pillar,
    durationHours: c.durationHours,
    summary: c.summary,
    items: c.currentVersion?.modules.length ? c.currentVersion.modules.map((m) => m.title) : c.objectives.slice(0, 3),
  }))
}
export type ProgrammeModule = Awaited<ReturnType<typeof listProgrammeModules>>[number]

/** Membres d'une organisation avec la progression de leurs inscriptions (LMS-09). */
export async function organizationParticipants(principal: Principal, organizationId: string) {
  if (!can(principal, 'organization.read', { organizationId })) throw new ForbiddenError("Cette organisation n'est pas accessible")
  const [memberships, enrollments] = await Promise.all([
    prisma.organizationMembership.findMany({
      where: { organizationId },
      orderBy: [{ isManager: 'desc' }, { user: { lastName: 'asc' } }],
      include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true, lastLoginAt: true, isActive: true } } },
    }),
    prisma.enrollment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        status: true,
        progressPercent: true,
        score: true,
        lastActivityAt: true,
        completedAt: true,
        course: { select: { id: true, code: true, title: true } },
        cohort: { select: { id: true, code: true, name: true } },
        certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true } },
      },
    }),
  ])
  const byUser = new Map<string, typeof enrollments>()
  for (const e of enrollments) {
    const list = byUser.get(e.userId) ?? []
    list.push(e)
    byUser.set(e.userId, list)
  }
  return memberships.map((m) => {
    const list = byUser.get(m.userId) ?? []
    return {
      membership: { id: m.id, title: m.title, isManager: m.isManager, joinedAt: m.joinedAt },
      user: m.user,
      enrollments: list,
      averageProgress: list.length ? Math.round(list.reduce((s, e) => s + e.progressPercent, 0) / list.length) : null,
      certificates: list.reduce((s, e) => s + e.certificates.length, 0),
      lastActivityAt: list.reduce<Date | null>((acc, e) => (e.lastActivityAt && (!acc || e.lastActivityAt > acc) ? e.lastActivityAt : acc), null),
    }
  })
}
export type OrganizationParticipant = Awaited<ReturnType<typeof organizationParticipants>>[number]

/**
 * Helper local : brouillon partiel d'une demande de formation.
 * `trainingRequests.create` exige une demande complète ; l'assistant enregistre pourtant
 * l'avancement à chaque étape. Ce helper crée/actualise une TrainingRequest en statut DRAFT
 * avec les données disponibles, sous les mêmes contrôles d'accès que le service.
 */
export async function saveDraftRequest(principal: Principal, input: DraftRequestInput, meta: RequestMeta = {}) {
  const data = draftRequestSchema.parse(input)
  if (!can(principal, 'training_request.create', { organizationId: data.organizationId })) {
    throw new ForbiddenError('Seul un responsable de cette organisation peut préparer une demande')
  }
  const organization = await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true, isActive: true } })
  if (!organization || !organization.isActive) throw new NotFoundError('Organisation', data.organizationId)
  const limit = await trainingParticipantLimit()
  const participants = data.participants
    .map((p) => ({ fullName: p.fullName.trim(), email: p.email ? p.email.trim().toLowerCase() : null, phone: p.phone ? p.phone.trim() : null, jobTitle: p.jobTitle ? p.jobTitle.trim() : null }))
    .filter((p) => p.fullName.length >= 2)
  if (participants.length > limit) throw new PreconditionError(`Le nombre de participants est limité à ${limit} par demande`, { limit })
  const courseIds = [...new Set(data.courseIds)]
  if (courseIds.length) {
    const found = await prisma.course.count({ where: { id: { in: courseIds }, status: { not: 'ARCHIVED' } } })
    if (found !== courseIds.length) throw new NotFoundError('Module')
  }
  const preferredStart = data.preferredStart ? new Date(data.preferredStart) : null
  const common = {
    contactName: data.contactName,
    contactRole: data.contactRole?.trim() || null,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone?.trim() || null,
    preferredStart: preferredStart && !Number.isNaN(preferredStart.getTime()) ? preferredStart : null,
    preferredMode: data.preferredMode ?? 'HYBRID',
    motivation: data.motivation?.trim() || null,
    commitmentsAccepted: Boolean(data.commitmentsAccepted),
    commitmentsAcceptedAt: data.commitmentsAccepted ? new Date() : null,
  }

  if (data.requestId) {
    const existing = await prisma.trainingRequest.findUnique({ where: { id: data.requestId }, select: { id: true, status: true, organizationId: true, requesterId: true } })
    if (!existing) throw new NotFoundError('Demande de formation', data.requestId)
    if (existing.organizationId !== data.organizationId) throw new ForbiddenError("Cette demande appartient à une autre organisation")
    if (existing.status !== 'DRAFT' && existing.status !== 'INFO_REQUESTED') throw new PreconditionError('Seuls les brouillons et les demandes en attente de complément sont modifiables')
    const request = await prisma.$transaction(async (tx) => {
      await tx.trainingRequestModule.deleteMany({ where: { requestId: existing.id } })
      await tx.trainingRequestParticipant.deleteMany({ where: { requestId: existing.id } })
      return tx.trainingRequest.update({
        where: { id: existing.id },
        data: {
          ...common,
          modules: { create: courseIds.map((courseId, position) => ({ courseId, position })) },
          participants: { create: participants },
        },
        select: { id: true, reference: true, status: true },
      })
    })
    await audit('content.updated', { type: 'TrainingRequest', id: request.id }, auditContext(principal, meta), { after: { draft: true, modules: courseIds.length, participants: participants.length } })
    return request
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.trainingRequest.create({
      data: {
        reference: makeReference(referencePrefixes.trainingRequest),
        organizationId: data.organizationId,
        requesterId: principal.id,
        status: 'DRAFT',
        participantLimit: limit,
        ...common,
        modules: { create: courseIds.map((courseId, position) => ({ courseId, position })) },
        participants: { create: participants },
      },
      select: { id: true, reference: true, status: true },
    })
    await tx.decisionHistory.create({ data: { requestId: created.id, actorId: principal.id, fromStatus: null, toStatus: 'DRAFT' } })
    return created
  })
  await audit('content.created', { type: 'TrainingRequest', id: request.id }, auditContext(principal, meta), { after: { draft: true, organizationId: data.organizationId } })
  return request
}

/** Brouillons et demandes en attente de complément que le principal peut reprendre. */
export async function listResumableRequests(principal: Principal, organizationIds: string[]) {
  if (organizationIds.length === 0) return []
  return prisma.trainingRequest.findMany({
    where: { organizationId: { in: organizationIds }, status: { in: ['DRAFT', 'INFO_REQUESTED'] } },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { id: true, reference: true, status: true, updatedAt: true, organization: { select: { name: true } }, _count: { select: { modules: true, participants: true } } },
  })
}

/** Valeurs par défaut de la personne ressource (profil du responsable connecté). */
export async function loadContactDefaults(userId: string): Promise<{ name: string; email: string; phone: string; role: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true } })
  if (!user) return { name: '', email: '', phone: '', role: '' }
  const name = user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return { name, email: user.email, phone: user.phone ?? '', role: user.jobTitle ?? '' }
}
