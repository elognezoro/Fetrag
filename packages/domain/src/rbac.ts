import type { RoleName, ScopeTypeName } from '@fetrag/contracts'

/** Représentation minimale d'un utilisateur authentifié pour les décisions d'autorisation. */
export interface Principal {
  id: string
  email: string
  name?: string | null
  roles: PrincipalRole[]
  organizationIds: string[]
  managedOrganizationIds: string[]
  mfaVerified?: boolean
}

export interface PrincipalRole {
  role: RoleName
  scopeType: ScopeTypeName
  scopeId: string | null
  expiresAt?: Date | string | null
}

export type Action =
  // CMS
  | 'cms.read_drafts'
  | 'cms.write'
  | 'cms.publish'
  | 'cms.manage_media'
  | 'cms.manage_menus'
  | 'services.manage'
  | 'services.handle_requests'
  | 'forms.read'
  // LMS
  | 'course.author'
  | 'course.publish'
  | 'course.teach'
  | 'course.enroll_self'
  | 'cohort.manage'
  | 'cohort.teach'
  | 'attendance.record'
  | 'grade.write'
  | 'question_bank.write'
  | 'certificate.issue'
  | 'certificate.revoke'
  | 'training_request.create'
  | 'training_request.decide'
  | 'organization.read'
  | 'organization.manage'
  // Commerce
  | 'finance.read'
  | 'finance.refund'
  | 'finance.export'
  // Ops
  | 'users.read'
  | 'users.manage'
  | 'roles.manage'
  | 'audit.read'
  | 'settings.manage'
  | 'support.read'
  | 'reports.read'
  | 'reports.org'

export interface Resource {
  organizationId?: string | null
  courseId?: string | null
  cohortId?: string | null
  ownerId?: string | null
}

/** Rôles globaux autorisés par action. SUPER_ADMIN est implicite partout. */
const globalGrants: Record<Action, RoleName[]> = {
  'cms.read_drafts': ['EDITOR', 'SERVICES_MANAGER'],
  'cms.write': ['EDITOR'],
  'cms.publish': ['EDITOR'],
  'cms.manage_media': ['EDITOR', 'COORDINATOR', 'SERVICES_MANAGER'],
  'cms.manage_menus': ['EDITOR'],
  'services.manage': ['SERVICES_MANAGER'],
  'services.handle_requests': ['SERVICES_MANAGER', 'SUPPORT'],
  'forms.read': ['EDITOR', 'SERVICES_MANAGER', 'SUPPORT'],
  'course.author': ['COORDINATOR', 'TRAINER'],
  'course.publish': ['COORDINATOR'],
  'course.teach': ['COORDINATOR', 'TRAINER'],
  'course.enroll_self': ['LEARNER', 'ORG_MANAGER', 'TRAINER', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT'],
  'cohort.manage': ['COORDINATOR'],
  'cohort.teach': ['COORDINATOR', 'TRAINER'],
  'attendance.record': ['COORDINATOR', 'TRAINER'],
  'grade.write': ['COORDINATOR', 'TRAINER'],
  'question_bank.write': ['COORDINATOR', 'TRAINER'],
  'certificate.issue': ['COORDINATOR'],
  'certificate.revoke': ['COORDINATOR'],
  'training_request.create': ['ORG_MANAGER'],
  'training_request.decide': ['COORDINATOR'],
  'organization.read': ['COORDINATOR', 'ORG_MANAGER', 'SUPPORT', 'FINANCE'],
  'organization.manage': ['COORDINATOR'],
  'finance.read': ['FINANCE', 'COORDINATOR'],
  'finance.refund': ['FINANCE'],
  'finance.export': ['FINANCE'],
  'users.read': ['SUPPORT', 'COORDINATOR', 'FINANCE'],
  'users.manage': [],
  'roles.manage': [],
  'audit.read': ['FINANCE'],
  'settings.manage': [],
  'support.read': ['SUPPORT'],
  'reports.read': ['COORDINATOR', 'FINANCE', 'EDITOR'],
  'reports.org': ['ORG_MANAGER', 'COORDINATOR'],
}

/** Actions qu'un rôle à portée limitée peut exercer sur sa portée uniquement. */
const scopedGrants: Partial<Record<Action, Array<{ role: RoleName; scope: ScopeTypeName }>>> = {
  'course.teach': [
    { role: 'TRAINER', scope: 'COURSE' },
    { role: 'TRAINER', scope: 'COHORT' },
  ],
  'cohort.teach': [{ role: 'TRAINER', scope: 'COHORT' }],
  'attendance.record': [{ role: 'TRAINER', scope: 'COHORT' }],
  'grade.write': [
    { role: 'TRAINER', scope: 'COURSE' },
    { role: 'TRAINER', scope: 'COHORT' },
  ],
  'training_request.create': [{ role: 'ORG_MANAGER', scope: 'ORGANIZATION' }],
  'organization.read': [{ role: 'ORG_MANAGER', scope: 'ORGANIZATION' }],
  'reports.org': [{ role: 'ORG_MANAGER', scope: 'ORGANIZATION' }],
}

function activeRoles(p: Principal): PrincipalRole[] {
  const now = Date.now()
  return p.roles.filter((r) => !r.expiresAt || new Date(r.expiresAt).getTime() > now)
}

export function hasGlobalRole(p: Principal, ...roles: RoleName[]): boolean {
  const active = activeRoles(p)
  if (active.some((r) => r.role === 'SUPER_ADMIN' && r.scopeType === 'GLOBAL')) return true
  return active.some((r) => r.scopeType === 'GLOBAL' && roles.includes(r.role))
}

export function isSuperAdmin(p: Principal): boolean {
  return activeRoles(p).some((r) => r.role === 'SUPER_ADMIN' && r.scopeType === 'GLOBAL')
}

export function hasRole(p: Principal, role: RoleName): boolean {
  return activeRoles(p).some((r) => r.role === role)
}

/**
 * Décision d'autorisation centrale (SHR-02) : identité + rôle + portée.
 * Les rôles globaux couvrent toutes les portées ; les rôles limités ne couvrent que leur scopeId.
 */
export function can(p: Principal | null | undefined, action: Action, resource: Resource = {}): boolean {
  if (!p) return false
  const active = activeRoles(p)
  if (active.some((r) => r.role === 'SUPER_ADMIN' && r.scopeType === 'GLOBAL')) return true

  const allowedGlobal = globalGrants[action] ?? []
  if (active.some((r) => r.scopeType === 'GLOBAL' && allowedGlobal.includes(r.role))) return true

  const scoped = scopedGrants[action] ?? []
  for (const grant of scoped) {
    const targetId =
      grant.scope === 'ORGANIZATION'
        ? resource.organizationId
        : grant.scope === 'COURSE'
          ? resource.courseId
          : grant.scope === 'COHORT'
            ? resource.cohortId
            : null
    if (!targetId) continue
    if (active.some((r) => r.role === grant.role && r.scopeType === grant.scope && r.scopeId === targetId)) {
      return true
    }
  }

  // Responsable d'organisation via appartenance (isManager) sans RoleAssignment explicite.
  if (
    (action === 'organization.read' || action === 'reports.org' || action === 'training_request.create') &&
    resource.organizationId &&
    p.managedOrganizationIds.includes(resource.organizationId)
  ) {
    return true
  }

  return false
}

/** Le propriétaire d'une ressource (profil, inscription, commande) y accède toujours. */
export function isOwner(p: Principal | null | undefined, resource: Resource): boolean {
  return Boolean(p && resource.ownerId && resource.ownerId === p.id)
}

export function canOrOwner(p: Principal | null | undefined, action: Action, resource: Resource): boolean {
  return isOwner(p, resource) || can(p, action, resource)
}

/** Rôles dont l'accès aux zones d'administration exige la MFA (SEC-02). */
export const mfaRequiredRoles: RoleName[] = ['SUPER_ADMIN', 'COORDINATOR', 'FINANCE', 'EDITOR']

export function requiresMfa(p: Principal): boolean {
  return activeRoles(p).some((r) => r.scopeType === 'GLOBAL' && mfaRequiredRoles.includes(r.role))
}

/** Espace d'atterrissage par défaut selon le rôle dominant. */
export function defaultDashboard(p: Principal): 'admin' | 'coordination' | 'formateur' | 'organisation' | 'dashboard' {
  if (isSuperAdmin(p)) return 'admin'
  if (hasGlobalRole(p, 'COORDINATOR')) return 'coordination'
  if (hasRole(p, 'TRAINER')) return 'formateur'
  if (hasRole(p, 'ORG_MANAGER') || p.managedOrganizationIds.length > 0) return 'organisation'
  return 'dashboard'
}

/** Filtre Prisma à appliquer pour restreindre une requête aux organisations visibles du principal. */
export function organizationFilter(p: Principal): { in: string[] } | undefined {
  if (isSuperAdmin(p) || hasGlobalRole(p, 'COORDINATOR', 'FINANCE', 'SUPPORT')) return undefined
  const ids = new Set<string>([...p.managedOrganizationIds])
  for (const r of activeRoles(p)) {
    if (r.scopeType === 'ORGANIZATION' && r.scopeId) ids.add(r.scopeId)
  }
  return { in: [...ids] }
}
