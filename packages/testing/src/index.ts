import type { Principal } from '@fetrag/domain'
import type { RoleName, ScopeTypeName } from '@fetrag/contracts'

/** Fabrique un principal de test avec des rôles globaux ou limités. */
export function makePrincipal(
  overrides: Partial<Principal> & { globalRoles?: RoleName[]; scoped?: Array<{ role: RoleName; scopeType: ScopeTypeName; scopeId: string }> } = {},
): Principal {
  const { globalRoles = [], scoped = [], ...rest } = overrides
  return {
    id: rest.id ?? '00000000-0000-4000-8000-000000000001',
    email: rest.email ?? 'test@fetrag.ga',
    name: rest.name ?? 'Utilisateur Test',
    roles: [
      ...globalRoles.map((role) => ({ role, scopeType: 'GLOBAL' as const, scopeId: null })),
      ...scoped.map((s) => ({ role: s.role, scopeType: s.scopeType, scopeId: s.scopeId })),
      ...(rest.roles ?? []),
    ],
    organizationIds: rest.organizationIds ?? [],
    managedOrganizationIds: rest.managedOrganizationIds ?? [],
    mfaVerified: rest.mfaVerified ?? true,
  }
}

export const testIds = {
  orgA: '10000000-0000-4000-8000-00000000000a',
  orgB: '10000000-0000-4000-8000-00000000000b',
  courseA: '20000000-0000-4000-8000-00000000000a',
  cohortA: '30000000-0000-4000-8000-00000000000a',
} as const

/** Question de test minimale pour la correction automatique. */
export function makeQuestion(type: string, options: Array<{ id: string; label: string; isCorrect?: boolean; matchValue?: string; position?: number }> = [], config: Record<string, unknown> = {}) {
  return {
    id: `q-${type.toLowerCase()}`,
    type,
    prompt: `Question ${type}`,
    points: 1,
    config,
    options: options.map((o, i) => ({ isCorrect: false, matchValue: null, position: i, ...o })),
  }
}
