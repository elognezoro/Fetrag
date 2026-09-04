import { cache } from 'react'
import { prisma } from '@fetrag/db'
import type { Principal } from '@fetrag/domain'

/**
 * Charge le principal complet (rôles + organisations) depuis la base.
 * Mis en cache par requête (React cache) : toujours à jour sans multiplier les requêtes.
 */
export const loadPrincipal = cache(async (userId: string, mfaVerified = false): Promise<Principal | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      roleAssignments: { select: { role: true, scopeType: true, scopeId: true, expiresAt: true } },
      memberships: { select: { organizationId: true, isManager: true } },
    },
  })
  if (!user || !user.isActive) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roleAssignments.map((r) => ({
      role: r.role,
      scopeType: r.scopeType,
      scopeId: r.scopeId,
      expiresAt: r.expiresAt,
    })),
    organizationIds: user.memberships.map((m) => m.organizationId),
    managedOrganizationIds: user.memberships.filter((m) => m.isManager).map((m) => m.organizationId),
    mfaVerified,
  }
})
