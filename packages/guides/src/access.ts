import type { Guide, GuidePlatform, GuideRoleKey } from '@fetrag/contracts'
import { hasGlobalRole, hasRole, isSuperAdmin, type Principal } from '@fetrag/domain'
import { guides } from './catalog'

/**
 * Politique d'accès aux guides : chaque rôle ne voit que le guide de son rôle.
 *
 * - `MEMBER` (site) et `LEARNER` (plateforme) : tout compte connecté.
 * - Rôles à portée (`TRAINER`, `ORG_MANAGER`) : le rôle suffit, quelle que soit la portée ;
 *   un responsable d'organisation désigné par appartenance (`isManager`) est traité comme `ORG_MANAGER`.
 * - Rôles globaux (`EDITOR`, `SERVICES_MANAGER`, `FINANCE`, `SUPPORT`, `COORDINATOR`) : rôle global requis.
 * - `SUPER_ADMIN` : accès à tous les guides (il attribue les rôles et accompagne tous les utilisateurs).
 */
export function canReadGuide(principal: Principal | null | undefined, guide: Pick<Guide, 'role'>): boolean {
  if (!principal) return false
  if (isSuperAdmin(principal)) return true
  switch (guide.role) {
    case 'MEMBER':
    case 'LEARNER':
      return true
    case 'ORG_MANAGER':
      return hasRole(principal, 'ORG_MANAGER') || principal.managedOrganizationIds.length > 0
    case 'TRAINER':
      return hasRole(principal, 'TRAINER')
    case 'SUPER_ADMIN':
      return false
    default:
      return hasGlobalRole(principal, guide.role)
  }
}

/** Ordre de dominance des rôles pour choisir le guide principal d'un espace institutionnel. */
const staffOrder: Record<GuidePlatform, GuideRoleKey[]> = {
  web: ['SUPER_ADMIN', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT', 'ORG_MANAGER'],
  lms: ['SUPER_ADMIN', 'COORDINATOR', 'TRAINER', 'ORG_MANAGER'],
}

/** Guides d'une plateforme, dans l'ordre du catalogue. */
export function guidesOf(platform: GuidePlatform): Guide[] {
  return guides.filter((guide) => guide.platform === platform)
}

/** Guide par identifiant (`web-membre`, `lms-formateur`...). */
export function guideById(id: string): Guide | undefined {
  return guides.find((guide) => guide.id === id)
}

/** Guide d'un rôle sur une plateforme (un seul guide par couple plateforme / rôle). */
export function guideForRole(platform: GuidePlatform, role: GuideRoleKey): Guide | undefined {
  return guides.find((guide) => guide.platform === platform && guide.role === role)
}

/** Guides visibles par le principal sur une plateforme (le guide commun en premier). */
export function accessibleGuides(principal: Principal | null | undefined, platform: GuidePlatform): Guide[] {
  return guidesOf(platform).filter((guide) => canReadGuide(principal, guide))
}

/** Guide commun à tous les comptes connectés (`MEMBER` sur le site, `LEARNER` sur la plateforme). */
export function commonGuide(platform: GuidePlatform): Guide {
  const guide = guideForRole(platform, platform === 'web' ? 'MEMBER' : 'LEARNER')
  if (!guide) throw new Error(`Guide commun introuvable pour la plateforme ${platform}`)
  return guide
}

/**
 * Guide « de rôle » principal d'un principal sur une plateforme (hors guide commun), selon la dominance
 * des rôles ; `null` si le principal n'a qu'un rôle de membre ou d'apprenant.
 */
export function staffGuide(principal: Principal | null | undefined, platform: GuidePlatform, allowed?: GuideRoleKey[]): Guide | null {
  if (!principal) return null
  for (const role of staffOrder[platform]) {
    if (allowed && !allowed.includes(role)) continue
    const guide = guideForRole(platform, role)
    if (guide && canReadGuide(principal, guide)) return guide
  }
  return null
}

/** Chemin (relatif à l'application de la plateforme) où le guide est servi. */
export function guidePath(guide: Pick<Guide, 'id' | 'platform' | 'role'>): string {
  if (guide.platform === 'web') {
    if (guide.role === 'MEMBER') return '/espace/guide'
    if (guide.role === 'ORG_MANAGER') return `/espace/guide/${guide.id}`
    return `/admin/guide/${guide.id}`
  }
  switch (guide.role) {
    case 'LEARNER':
      return '/guide'
    case 'ORG_MANAGER':
      return '/organisation/guide'
    case 'TRAINER':
      return '/formateur/guide'
    case 'COORDINATOR':
      return '/coordination/guide'
    case 'SUPER_ADMIN':
      return '/admin/guide'
    default:
      return `/guide/${guide.id}`
  }
}
