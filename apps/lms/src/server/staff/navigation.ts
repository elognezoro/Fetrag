import 'server-only'
import { can, hasGlobalRole, hasRole, isSuperAdmin, type Principal } from '@fetrag/domain'
import type { StaffNavItem, StaffSpaceLink } from '@/components/staff/staff-shell'
import { isOrganizationManager } from './organizations'

/**
 * Navigation des espaces institutionnels (lot LMS-STAFF) : accès par espace et menus latéraux.
 * Les décisions d'accès restent celles de la politique RBAC (`can`) ; ce module ne fait que les composer.
 */

export function canAccessTrainerSpace(p: Principal): boolean {
  return isSuperAdmin(p) || hasRole(p, 'TRAINER') || can(p, 'course.teach') || can(p, 'cohort.teach')
}

export function canAccessCoordinationSpace(p: Principal): boolean {
  return isSuperAdmin(p) || can(p, 'training_request.decide') || hasGlobalRole(p, 'COORDINATOR')
}

/** Administration LMS : publication de cours (coordination) ou super administration. */
export function canAccessAdminSpace(p: Principal): boolean {
  return isSuperAdmin(p) || can(p, 'course.publish')
}

export function canAccessOrganizationSpace(p: Principal): boolean {
  return isOrganizationManager(p) || can(p, 'organization.read')
}

/** Espaces accessibles au principal, pour le commutateur de la barre supérieure. */
export function accessibleSpaces(p: Principal): StaffSpaceLink[] {
  const spaces: StaffSpaceLink[] = [{ label: 'Apprenant', href: '/dashboard', icon: 'dashboard' }]
  if (canAccessOrganizationSpace(p)) spaces.push({ label: 'Organisation', href: '/organisation', icon: 'organizations' })
  if (canAccessTrainerSpace(p)) spaces.push({ label: 'Formateur', href: '/formateur', icon: 'trainer' })
  if (canAccessCoordinationSpace(p)) spaces.push({ label: 'Coordination', href: '/coordination', icon: 'cohorts' })
  if (canAccessAdminSpace(p)) spaces.push({ label: 'Administration', href: '/admin', icon: 'admin' })
  return spaces
}

export const organisationNav: StaffNavItem[] = [
  { label: 'Tableau de bord', href: '/organisation', icon: 'dashboard', exact: true },
  { label: 'Demande de formation', href: '/demande-formation', icon: 'wizard' },
  { label: 'Participants', href: '/organisation/participants', icon: 'participants' },
  { label: 'Rapports', href: '/organisation/rapports', icon: 'reports' },
]

export const trainerNav: StaffNavItem[] = [
  { label: 'Tableau de bord', href: '/formateur', icon: 'dashboard', exact: true },
  { label: 'Mes cohortes', href: '/formateur/cohortes', icon: 'cohorts' },
  { label: 'Calendrier', href: '/calendrier', icon: 'sessions' },
  { label: 'Forums', href: '/forums', icon: 'participants' },
]

export function coordinationNav(counts: { pendingRequests?: number; pendingEnrollments?: number } = {}): StaffNavItem[] {
  return [
    { label: 'Tableau de bord', href: '/coordination', icon: 'dashboard', exact: true },
    { label: 'Demandes', href: '/coordination/demandes', icon: 'requests', badge: counts.pendingRequests ? counts.pendingRequests : undefined },
    { label: 'Cohortes', href: '/coordination/cohortes', icon: 'cohorts' },
    { label: 'Sessions', href: '/coordination/sessions', icon: 'sessions' },
    { label: 'Certificats', href: '/coordination/certificats', icon: 'certificates' },
    { label: 'Organisations', href: '/coordination/organisations', icon: 'organizations' },
    { label: 'Rapports', href: '/coordination/rapports', icon: 'reports' },
  ]
}

export function adminNav(p: Principal): StaffNavItem[] {
  const items: StaffNavItem[] = [
    { label: 'Vue d’ensemble', href: '/admin', icon: 'dashboard', exact: true },
    { label: 'Cours', href: '/admin/cours', icon: 'courses' },
    { label: 'Banque de questions', href: '/admin/questions', icon: 'questions' },
    { label: 'Modèles de certificats', href: '/admin/certificats', icon: 'certificates' },
  ]
  if (can(p, 'users.read')) items.push({ label: 'Utilisateurs et rôles', href: '/admin/utilisateurs', icon: 'users' })
  if (can(p, 'settings.manage') || can(p, 'reports.read')) items.push({ label: 'Paramètres', href: '/admin/parametres', icon: 'settings' })
  if (can(p, 'audit.read') || can(p, 'reports.read')) items.push({ label: 'Journal d’audit', href: '/admin/audit', icon: 'audit' })
  return items
}
