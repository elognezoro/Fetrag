import 'server-only'
import { prisma, type Prisma, type Role, type ScopeType } from '@fetrag/db'
import { ForbiddenError, NotFoundError, can, isSuperAdmin, paginationArgs, toPaginated, type Principal } from '@fetrag/domain'
import { certification, displayName } from '@fetrag/lms-core'
import { getStorage, keyFromRoutePath, STORAGE_ROUTE_PREFIX } from '@fetrag/storage'

/**
 * Lecteurs Prisma locaux du lot LMS-STAFF pour les écrans que @fetrag/lms-core ne couvre pas
 * (organisations, utilisateurs et rôles, paramètres, audit, planning, listes de sélection).
 * Chaque lecteur vérifie la permission du principal.
 */

export { displayName }

// -----------------------------------------------------------------------------
// Listes de sélection
// -----------------------------------------------------------------------------

/** Formateurs actifs (rôle TRAINER global ou à portée) pour les sélecteurs. */
export async function listTrainers() {
  const now = new Date()
  const rows = await prisma.user.findMany({
    where: { isActive: true, roleAssignments: { some: { role: { in: ['TRAINER', 'COORDINATOR'] }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } } },
    orderBy: [{ lastName: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, firstName: true, lastName: true, email: true },
  })
  return rows.map((u) => ({ id: u.id, label: displayName(u), email: u.email }))
}

export async function listCoursesForSelect(options: { publishedOnly?: boolean } = {}) {
  const rows = await prisma.course.findMany({
    where: options.publishedOnly ? { status: 'PUBLISHED' } : { status: { not: 'ARCHIVED' } },
    orderBy: [{ position: 'asc' }, { title: 'asc' }],
    select: { id: true, code: true, title: true, status: true, currentVersionId: true, pillar: true, versions: { orderBy: { version: 'desc' }, select: { id: true, version: true, label: true, isPublished: true } } },
  })
  return rows
}

export async function listOrganizationsForSelect() {
  return prisma.organization.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, acronym: true } })
}

export async function listCategoriesForSelect() {
  return prisma.category.findMany({ where: { kind: { in: ['course', 'article'] } }, orderBy: [{ kind: 'asc' }, { position: 'asc' }], select: { id: true, name: true, kind: true } })
}

export async function listResourcesForSelect() {
  return prisma.resource.findMany({ where: { status: 'PUBLISHED' }, orderBy: { title: 'asc' }, take: 200, select: { id: true, title: true, kind: true } })
}

/** Recherche d'utilisateurs actifs (ajout à une cohorte). */
export async function searchUsers(principal: Principal, q: string, options: { organizationId?: string | null; excludeCohortId?: string | null; limit?: number } = {}) {
  if (!can(principal, 'cohort.manage') && !can(principal, 'users.read') && !(options.organizationId && can(principal, 'organization.read', { organizationId: options.organizationId }))) {
    throw new ForbiddenError('Recherche d’utilisateurs refusée')
  }
  const term = q.trim()
  const where: Prisma.UserWhereInput = {
    isActive: true,
    ...(options.organizationId ? { memberships: { some: { organizationId: options.organizationId } } } : {}),
    ...(options.excludeCohortId ? { cohortMembers: { none: { cohortId: options.excludeCohortId } } } : {}),
    ...(term
      ? { OR: [{ email: { contains: term, mode: 'insensitive' } }, { name: { contains: term, mode: 'insensitive' } }, { lastName: { contains: term, mode: 'insensitive' } }, { firstName: { contains: term, mode: 'insensitive' } }] }
      : {}),
  }
  const rows = await prisma.user.findMany({ where, orderBy: [{ lastName: 'asc' }, { name: 'asc' }], take: options.limit ?? 50, select: { id: true, name: true, firstName: true, lastName: true, email: true, jobTitle: true, employer: true } })
  return rows.map((u) => ({ id: u.id, label: displayName(u), email: u.email, jobTitle: u.jobTitle, employer: u.employer }))
}

// -----------------------------------------------------------------------------
// Organisations (coordination)
// -----------------------------------------------------------------------------

export async function listOrganizationsAdmin(principal: Principal, query: { q?: string; page?: number; pageSize?: number; inactive?: boolean } = {}) {
  if (!can(principal, 'organization.read')) throw new ForbiddenError('Accès aux organisations refusé')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20))
  const where: Prisma.OrganizationWhereInput = {
    ...(query.inactive ? {} : { isActive: true }),
    ...(query.q ? { OR: [{ name: { contains: query.q, mode: 'insensitive' } }, { acronym: { contains: query.q, mode: 'insensitive' } }, { city: { contains: query.q, mode: 'insensitive' } }] } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { name: 'asc' },
      ...paginationArgs({ page, pageSize }),
      include: { _count: { select: { memberships: true, trainingRequests: true, cohorts: true, enrollments: true } } },
    }),
    prisma.organization.count({ where }),
  ])
  return toPaginated(items, total, { page, pageSize })
}

export async function getOrganizationAdmin(principal: Principal, organizationId: string) {
  if (!can(principal, 'organization.read', { organizationId })) throw new ForbiddenError('Accès à cette organisation refusé')
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: { orderBy: [{ isManager: 'desc' }, { joinedAt: 'asc' }], include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true, isActive: true, lastLoginAt: true } } } },
      contacts: { orderBy: { isPrimary: 'desc' } },
      trainingRequests: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, reference: true, status: true, submittedAt: true, createdAt: true, _count: { select: { participants: true, modules: true } } } },
      cohorts: { orderBy: { startsAt: 'desc' }, take: 10, select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true, course: { select: { title: true } }, _count: { select: { members: true } } } },
      _count: { select: { memberships: true, trainingRequests: true, cohorts: true, enrollments: true } },
    },
  })
  if (!organization) throw new NotFoundError('Organisation', organizationId)
  const [certificates, enrollmentAgg] = await Promise.all([
    prisma.certificate.count({ where: { status: 'ISSUED', enrollment: { organizationId } } }),
    prisma.enrollment.aggregate({ where: { organizationId }, _avg: { progressPercent: true } }),
  ])
  return { ...organization, canManage: can(principal, 'organization.manage'), stats: { certificates, averageProgress: Math.round(enrollmentAgg._avg.progressPercent ?? 0) } }
}

// -----------------------------------------------------------------------------
// Utilisateurs et rôles (administration)
// -----------------------------------------------------------------------------

export async function listUsersAdmin(principal: Principal, query: { q?: string; role?: Role; page?: number; pageSize?: number; inactive?: boolean } = {}) {
  if (!can(principal, 'users.read')) throw new ForbiddenError('Accès aux utilisateurs refusé')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25))
  const where: Prisma.UserWhereInput = {
    ...(query.inactive ? {} : { isActive: true }),
    ...(query.role ? { roleAssignments: { some: { role: query.role } } } : {}),
    ...(query.q ? { OR: [{ email: { contains: query.q, mode: 'insensitive' } }, { name: { contains: query.q, mode: 'insensitive' } }, { lastName: { contains: query.q, mode: 'insensitive' } }] } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { name: 'asc' }],
      ...paginationArgs({ page, pageSize }),
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        employer: true,
        isActive: true,
        totpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        roleAssignments: { select: { id: true, role: true, scopeType: true, scopeId: true, expiresAt: true } },
        memberships: { select: { isManager: true, organization: { select: { id: true, name: true, acronym: true } } } },
      },
    }),
    prisma.user.count({ where }),
  ])
  return toPaginated(items.map((u) => ({ ...u, displayName: displayName(u) })), total, { page, pageSize })
}

export async function getUserAdmin(principal: Principal, userId: string) {
  if (!can(principal, 'users.read')) throw new ForbiddenError('Accès aux utilisateurs refusé')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      jobTitle: true,
      employer: true,
      isActive: true,
      totpEnabled: true,
      lastLoginAt: true,
      createdAt: true,
      roleAssignments: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, scopeType: true, scopeId: true, expiresAt: true, createdAt: true, grantedBy: { select: { name: true, email: true } } } },
      memberships: { select: { id: true, isManager: true, title: true, organization: { select: { id: true, name: true, acronym: true } } } },
      enrollments: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, status: true, progressPercent: true, course: { select: { title: true, code: true } }, cohort: { select: { name: true } } } },
      cohortTrainers: { select: { id: true, code: true, name: true, status: true } },
      courseTrainers: { select: { course: { select: { id: true, title: true, code: true } } } },
    },
  })
  if (!user) throw new NotFoundError('Utilisateur', userId)
  const scopeIds = user.roleAssignments.map((r) => r.scopeId).filter((id): id is string => Boolean(id))
  const [courses, cohorts, organizations] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: scopeIds } }, select: { id: true, title: true, code: true } }),
    prisma.cohort.findMany({ where: { id: { in: scopeIds } }, select: { id: true, name: true, code: true } }),
    prisma.organization.findMany({ where: { id: { in: scopeIds } }, select: { id: true, name: true } }),
  ])
  const scopeLabel = (scopeType: ScopeType, scopeId: string | null): string | null => {
    if (!scopeId) return null
    if (scopeType === 'COURSE') return courses.find((c) => c.id === scopeId)?.title ?? scopeId
    if (scopeType === 'COHORT') return cohorts.find((c) => c.id === scopeId)?.name ?? scopeId
    if (scopeType === 'ORGANIZATION') return organizations.find((o) => o.id === scopeId)?.name ?? scopeId
    return scopeId
  }
  return {
    ...user,
    displayName: displayName(user),
    roleAssignments: user.roleAssignments.map((r) => ({ ...r, scopeLabel: scopeLabel(r.scopeType, r.scopeId) })),
    canManageRoles: can(principal, 'roles.manage') || isSuperAdmin(principal),
    canManageUsers: can(principal, 'users.manage'),
  }
}

// -----------------------------------------------------------------------------
// Paramètres et audit
// -----------------------------------------------------------------------------

export async function listSettings(principal: Principal) {
  if (!can(principal, 'settings.manage') && !can(principal, 'reports.read')) throw new ForbiddenError('Accès aux paramètres refusé')
  const rows = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } })
  return rows.map((r) => ({ key: r.key, value: r.value, description: r.description, updatedAt: r.updatedAt, canEdit: can(principal, 'settings.manage') }))
}

export async function listAudit(principal: Principal, query: { q?: string; action?: string; entityType?: string; page?: number; pageSize?: number } = {}) {
  if (!can(principal, 'audit.read') && !can(principal, 'reports.read')) throw new ForbiddenError('Accès au journal refusé')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 30))
  const where: Prisma.AuditLogWhereInput = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.q ? { OR: [{ actorEmail: { contains: query.q, mode: 'insensitive' } }, { entityId: { contains: query.q } }, { action: { contains: query.q } }] } : {}),
  }
  const [items, total, actions, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginationArgs({ page, pageSize }) }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ['action'], _count: { _all: true }, orderBy: { action: 'asc' } }),
    prisma.auditLog.groupBy({ by: ['entityType'], _count: { _all: true }, orderBy: { entityType: 'asc' } }),
  ])
  return { ...toPaginated(items, total, { page, pageSize }), actions: actions.map((a) => a.action), entityTypes: entityTypes.map((e) => e.entityType) }
}

// -----------------------------------------------------------------------------
// Planning et certificats (coordination)
// -----------------------------------------------------------------------------

export async function listSessionsPlanning(principal: Principal, range: { from: Date; to: Date }, filter: { cohortId?: string; trainerId?: string } = {}) {
  if (!can(principal, 'cohort.manage') && !can(principal, 'reports.read')) throw new ForbiddenError('Accès au planning refusé')
  return prisma.trainingSession.findMany({
    where: {
      startsAt: { gte: range.from, lte: range.to },
      ...(filter.cohortId ? { cohortId: filter.cohortId } : {}),
      ...(filter.trainerId ? { cohort: { trainerId: filter.trainerId } } : {}),
    },
    orderBy: { startsAt: 'asc' },
    include: {
      cohort: { select: { id: true, code: true, name: true, status: true, trainer: { select: { id: true, name: true } }, course: { select: { title: true, pillar: true } }, organization: { select: { name: true, acronym: true } }, _count: { select: { members: true } } } },
      _count: { select: { attendances: { where: { status: { in: ['PRESENT', 'LATE'] } } } } },
    },
  })
}

/** Inscriptions d'une cohorte avec leur éligibilité au certificat (émission manuelle). */
export async function cohortEligibility(principal: Principal, cohortId: string) {
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true, code: true, name: true, status: true, courseId: true, organizationId: true, course: { select: { title: true } } } })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  if (!can(principal, 'certificate.issue', { courseId: cohort.courseId, cohortId, organizationId: cohort.organizationId })) throw new ForbiddenError('Émission de certificats refusée')
  const enrollments = await prisma.enrollment.findMany({
    where: { cohortId },
    orderBy: { user: { lastName: 'asc' } },
    select: { id: true, status: true, progressPercent: true, score: true, user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } },
  })
  const rows = []
  for (const e of enrollments) {
    const eligibility = await certification.checkEligibility(e.id)
    rows.push({ enrollment: e, holderName: displayName(e.user), eligibility })
  }
  return { cohort, rows }
}

/** Lien de téléchargement d'une pièce : URL signée pour les objets privés servis par la route de stockage. */
export async function attachmentHref(fileUrl: string): Promise<string> {
  try {
    const url = new URL(fileUrl, 'http://localhost')
    if (!url.pathname.startsWith(STORAGE_ROUTE_PREFIX)) return fileUrl
    const key = keyFromRoutePath(url.pathname)
    if (!key) return fileUrl
    return await getStorage().getSignedUrl(key, { expiresInSeconds: 900 })
  } catch {
    return fileUrl
  }
}
