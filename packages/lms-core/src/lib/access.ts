import { ForbiddenError, UnauthenticatedError } from '@fetrag/domain/errors'
import {
  can,
  hasGlobalRole,
  hasRole,
  isOwner,
  isSuperAdmin,
  organizationFilter,
  type Action,
  type Principal,
  type Resource,
} from '@fetrag/domain/rbac'
import type { AuditContext } from '@fetrag/domain/audit'
import type { RequestMeta } from '../types'

/** Garantit la présence d'un principal (sinon 401). */
export function requirePrincipal(principal: Principal | null | undefined): Principal {
  if (!principal) throw new UnauthenticatedError()
  return principal
}

/** Vérifie une permission (identité + rôle + portée) et lève 403 sinon. */
export function assertCan(principal: Principal | null | undefined, action: Action, resource: Resource = {}, message?: string): Principal {
  const p = requirePrincipal(principal)
  if (!can(p, action, resource)) {
    throw new ForbiddenError(message ?? 'Permission insuffisante', { action })
  }
  return p
}

/** Autorise le propriétaire de la ressource ou un rôle habilité. */
export function assertOwnerOrCan(
  principal: Principal | null | undefined,
  action: Action,
  resource: Resource,
  message?: string,
): Principal {
  const p = requirePrincipal(principal)
  if (isOwner(p, resource) || can(p, action, resource)) return p
  throw new ForbiddenError(message ?? 'Accès refusé', { action })
}

/**
 * Identifiants d'organisations visibles par le principal.
 * `undefined` = toutes (rôle global), tableau vide = aucune.
 */
export function visibleOrganizationIds(principal: Principal): string[] | undefined {
  const filter = organizationFilter(principal)
  return filter ? filter.in : undefined
}

/**
 * Vérifie que le principal peut lire l'organisation demandée et renvoie le filtre Prisma
 * à appliquer sur `organizationId`. Un responsable d'organisation ne voit jamais une autre organisation.
 */
export function scopedOrganizationFilter(principal: Principal, requestedOrganizationId?: string | null): { in: string[] } | undefined {
  const filter = organizationFilter(principal)
  if (requestedOrganizationId) {
    if (filter && !filter.in.includes(requestedOrganizationId)) {
      throw new ForbiddenError("Cette organisation n'est pas accessible", { organizationId: requestedOrganizationId })
    }
    return { in: [requestedOrganizationId] }
  }
  return filter
}

/** Lève 403 si le principal n'a pas accès à l'organisation. */
export function assertOrganizationAccess(principal: Principal | null | undefined, organizationId: string): Principal {
  const p = requirePrincipal(principal)
  if (can(p, 'organization.read', { organizationId })) return p
  throw new ForbiddenError("Cette organisation n'est pas accessible", { organizationId })
}

/** Le principal est-il un membre du personnel pédagogique (coordination ou formateur) ? */
export function isStaff(principal: Principal | null | undefined): boolean {
  if (!principal) return false
  return isSuperAdmin(principal) || hasGlobalRole(principal, 'COORDINATOR') || hasRole(principal, 'TRAINER')
}

/** Le principal pilote-t-il le LMS (coordination) ? */
export function isCoordination(principal: Principal | null | undefined): boolean {
  if (!principal) return false
  return isSuperAdmin(principal) || hasGlobalRole(principal, 'COORDINATOR')
}

/** Contexte d'audit dérivé du principal et des métadonnées de requête. */
export function auditContext(principal: Principal | null | undefined, meta: RequestMeta = {}): AuditContext {
  return {
    actorId: principal?.id ?? null,
    actorEmail: principal?.email ?? null,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
    correlationId: meta.correlationId ?? null,
  }
}

export { can, isOwner }
