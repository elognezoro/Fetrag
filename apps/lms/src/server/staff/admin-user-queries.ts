import 'server-only'
import type { RoleName, ScopeTypeName } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { can, isSuperAdmin, type Principal } from '@fetrag/domain'
import { listCohortsForSelect } from './coordination-queries'
import { getUserAdmin, listCoursesForSelect, listOrganizationsForSelect } from './queries'

/**
 * Lecteur composé de la fiche utilisateur de l'administration LMS (lot LMS-ADMIN) :
 * compte, rôles et portées, organisations, inscriptions, certificats, listes de sélection
 * pour l'attribution de rôles, et droits d'attribution du principal.
 */

const allRoles: RoleName[] = ['LEARNER', 'ORG_MANAGER', 'TRAINER', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT', 'SUPER_ADMIN']

/**
 * Rôles et portées que le principal peut attribuer (miroir des gardes de `grantRole`) :
 * la super administration attribue tout ; la coordination ne désigne que des formateurs
 * sur un cours ou une cohorte (BUILD_BRIEF §4).
 */
export function roleGrantCapabilities(principal: Principal): { grantableRoles: RoleName[]; allowedScopeTypes: ScopeTypeName[] } {
  if (isSuperAdmin(principal) || can(principal, 'roles.manage')) return { grantableRoles: allRoles, allowedScopeTypes: ['GLOBAL', 'ORGANIZATION', 'COURSE', 'COHORT'] }
  if (can(principal, 'training_request.decide')) return { grantableRoles: ['TRAINER'], allowedScopeTypes: ['COURSE', 'COHORT'] }
  return { grantableRoles: [], allowedScopeTypes: [] }
}

/** La coordination (sans `roles.manage`) ne peut retirer que les rôles Formateur à portée cours ou cohorte. */
export function canRevokeAssignment(principal: Principal, assignment: { role: string; scopeType: string }): boolean {
  if (isSuperAdmin(principal) || can(principal, 'roles.manage')) return true
  return can(principal, 'training_request.decide') && assignment.role === 'TRAINER' && (assignment.scopeType === 'COURSE' || assignment.scopeType === 'COHORT')
}

export async function loadUserAdmin(principal: Principal, userId: string) {
  const user = await getUserAdmin(principal, userId)
  const capabilities = roleGrantCapabilities(principal)
  const needsSelects = capabilities.grantableRoles.length > 0
  const [certificates, enrollmentTotal, organizations, courses, cohorts] = await Promise.all([
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      take: 10,
      select: { id: true, number: true, kind: true, status: true, courseTitle: true, issuedAt: true, expiresAt: true, pdfUrl: true },
    }),
    prisma.enrollment.count({ where: { userId } }),
    needsSelects && capabilities.allowedScopeTypes.includes('ORGANIZATION') ? listOrganizationsForSelect() : Promise.resolve([]),
    needsSelects ? listCoursesForSelect() : Promise.resolve([]),
    needsSelects ? listCohortsForSelect() : Promise.resolve([]),
  ])
  return {
    user,
    certificates,
    enrollmentTotal,
    capabilities,
    selects: {
      organizations,
      courses: courses.map((c) => ({ id: c.id, code: c.code, title: c.title })),
      cohorts: cohorts.map((c) => ({ id: c.id, code: c.code, name: c.name })),
    },
    roleAssignments: user.roleAssignments.map((r) => ({ ...r, canRevoke: canRevokeAssignment(principal, r) })),
  }
}
