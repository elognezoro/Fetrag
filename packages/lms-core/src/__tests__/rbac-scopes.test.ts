import { describe, expect, it } from 'vitest'
import { ForbiddenError } from '@fetrag/domain/errors'
import { can, organizationFilter, type Principal } from '@fetrag/domain/rbac'
import { assertOrganizationAccess, scopedOrganizationFilter, visibleOrganizationIds } from '../lib/access'

const ORG_A = '11111111-1111-4111-8111-111111111111'
const ORG_B = '22222222-2222-4222-8222-222222222222'

function principal(overrides: Partial<Principal>): Principal {
  return { id: 'user-1', email: 'user@example.test', roles: [], organizationIds: [], managedOrganizationIds: [], ...overrides }
}

const orgManagerA = principal({
  id: 'manager-a',
  roles: [{ role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: ORG_A }],
  organizationIds: [ORG_A],
  managedOrganizationIds: [ORG_A],
})

const coordinator = principal({ id: 'coord', roles: [{ role: 'COORDINATOR', scopeType: 'GLOBAL', scopeId: null }] })
const learner = principal({ id: 'learner', roles: [{ role: 'LEARNER', scopeType: 'GLOBAL', scopeId: null }], organizationIds: [ORG_A] })

describe('organizationFilter (domaine)', () => {
  it("restreint un responsable d'organisation à ses organisations", () => {
    expect(organizationFilter(orgManagerA)).toEqual({ in: [ORG_A] })
  })

  it('ne restreint pas la coordination', () => {
    expect(organizationFilter(coordinator)).toBeUndefined()
  })

  it("un simple membre (non responsable) ne voit aucune organisation", () => {
    expect(organizationFilter(learner)).toEqual({ in: [] })
  })
})

describe('scopedOrganizationFilter (lms-core)', () => {
  it("renvoie le filtre de l'organisation demandée quand elle est visible", () => {
    expect(scopedOrganizationFilter(orgManagerA, ORG_A)).toEqual({ in: [ORG_A] })
  })

  it("lève ForbiddenError quand un ORG_MANAGER demande une autre organisation", () => {
    expect(() => scopedOrganizationFilter(orgManagerA, ORG_B)).toThrow(ForbiddenError)
  })

  it('sans organisation demandée, applique le filtre du principal', () => {
    expect(scopedOrganizationFilter(orgManagerA)).toEqual({ in: [ORG_A] })
    expect(scopedOrganizationFilter(coordinator)).toBeUndefined()
    expect(scopedOrganizationFilter(coordinator, ORG_B)).toEqual({ in: [ORG_B] })
  })

  it('visibleOrganizationIds reflète la portée', () => {
    expect(visibleOrganizationIds(orgManagerA)).toEqual([ORG_A])
    expect(visibleOrganizationIds(coordinator)).toBeUndefined()
  })
})

describe('assertOrganizationAccess', () => {
  it("autorise le responsable sur son organisation et refuse les autres", () => {
    expect(() => assertOrganizationAccess(orgManagerA, ORG_A)).not.toThrow()
    expect(() => assertOrganizationAccess(orgManagerA, ORG_B)).toThrow(ForbiddenError)
  })

  it('refuse un apprenant sans rôle de lecture organisationnelle', () => {
    expect(() => assertOrganizationAccess(learner, ORG_A)).toThrow(ForbiddenError)
  })

  it('autorise la coordination partout', () => {
    expect(() => assertOrganizationAccess(coordinator, ORG_B)).not.toThrow()
  })

  it('exige un principal', () => {
    expect(() => assertOrganizationAccess(null, ORG_A)).toThrow()
  })
})

describe('can() - portées croisées', () => {
  it("un ORG_MANAGER ne peut pas créer de demande pour une autre organisation", () => {
    expect(can(orgManagerA, 'training_request.create', { organizationId: ORG_A })).toBe(true)
    expect(can(orgManagerA, 'training_request.create', { organizationId: ORG_B })).toBe(false)
  })

  it("un ORG_MANAGER ne lit pas les rapports d'une autre organisation", () => {
    expect(can(orgManagerA, 'reports.org', { organizationId: ORG_A })).toBe(true)
    expect(can(orgManagerA, 'reports.org', { organizationId: ORG_B })).toBe(false)
  })

  it('un formateur à portée cohorte ne note que sa cohorte', () => {
    const trainer = principal({ id: 'trainer', roles: [{ role: 'TRAINER', scopeType: 'COHORT', scopeId: 'cohort-1' }] })
    expect(can(trainer, 'grade.write', { cohortId: 'cohort-1' })).toBe(true)
    expect(can(trainer, 'grade.write', { cohortId: 'cohort-2' })).toBe(false)
    expect(can(trainer, 'attendance.record', { cohortId: 'cohort-1' })).toBe(true)
  })
})
