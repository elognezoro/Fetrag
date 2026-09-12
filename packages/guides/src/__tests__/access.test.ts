import { describe, expect, it } from 'vitest'
import type { RoleName, ScopeTypeName } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, canReadGuide, commonGuide, guideById, guidePath, guides, staffGuide } from '../index'

type RoleSpec = [RoleName] | [RoleName, ScopeTypeName, string | null]

function principal(roles: RoleSpec[], managed: string[] = []): Principal {
  return {
    id: 'u1',
    email: 'u1@example.org',
    roles: roles.map(([role, scopeType = 'GLOBAL', scopeId = null]) => ({ role, scopeType, scopeId })),
    organizationIds: managed,
    managedOrganizationIds: managed,
  }
}

const ids = (list: { id: string }[]) => list.map((g) => g.id)

describe('politique d’accès aux guides', () => {
  it('refuse tout guide sans session', () => {
    expect(accessibleGuides(null, 'web')).toEqual([])
    expect(accessibleGuides(undefined, 'lms')).toEqual([])
    expect(canReadGuide(null, commonGuide('web'))).toBe(false)
  })

  it('un apprenant ne voit que les guides communs', () => {
    const p = principal([['LEARNER']])
    expect(ids(accessibleGuides(p, 'web'))).toEqual(['web-membre'])
    expect(ids(accessibleGuides(p, 'lms'))).toEqual(['lms-apprenant'])
    expect(staffGuide(p, 'web')).toBeNull()
    expect(staffGuide(p, 'lms')).toBeNull()
  })

  it.each<[RoleName, string[], string[]]>([
    ['EDITOR', ['web-membre', 'web-editeur'], ['lms-apprenant']],
    ['SERVICES_MANAGER', ['web-membre', 'web-services'], ['lms-apprenant']],
    ['FINANCE', ['web-membre', 'web-finance'], ['lms-apprenant']],
    ['SUPPORT', ['web-membre', 'web-support'], ['lms-apprenant']],
    ['COORDINATOR', ['web-membre', 'web-coordination'], ['lms-apprenant', 'lms-coordination']],
    ['TRAINER', ['web-membre'], ['lms-apprenant', 'lms-formateur']],
    ['ORG_MANAGER', ['web-membre', 'web-organisation'], ['lms-apprenant', 'lms-organisation']],
  ])('%s ne voit que le guide commun et le guide de son rôle', (role, web, lms) => {
    const p = principal([[role]])
    expect(ids(accessibleGuides(p, 'web'))).toEqual(web)
    expect(ids(accessibleGuides(p, 'lms'))).toEqual(lms)
  })

  it('un rôle global d’administration n’ouvre pas les guides des autres rôles', () => {
    const editor = principal([['EDITOR']])
    for (const guide of guides) {
      const expected = guide.role === 'MEMBER' || guide.role === 'LEARNER' || guide.role === 'EDITOR'
      expect(canReadGuide(editor, guide), guide.id).toBe(expected)
    }
  })

  it('un formateur à portée limitée (cours ou cohorte) accède au guide du formateur', () => {
    const p = principal([['TRAINER', 'COHORT', 'cohort-1']])
    expect(ids(accessibleGuides(p, 'lms'))).toEqual(['lms-apprenant', 'lms-formateur'])
    expect(staffGuide(p, 'lms')?.id).toBe('lms-formateur')
  })

  it('un responsable désigné par appartenance (sans rôle explicite) accède aux guides d’organisation', () => {
    const p = principal([['LEARNER']], ['org-1'])
    expect(ids(accessibleGuides(p, 'web'))).toEqual(['web-membre', 'web-organisation'])
    expect(ids(accessibleGuides(p, 'lms'))).toEqual(['lms-apprenant', 'lms-organisation'])
  })

  it('un rôle expiré ne donne plus accès', () => {
    const p: Principal = { ...principal([['LEARNER']]), roles: [{ role: 'EDITOR', scopeType: 'GLOBAL', scopeId: null, expiresAt: new Date(Date.now() - 1000) }] }
    expect(ids(accessibleGuides(p, 'web'))).toEqual(['web-membre'])
  })

  it('le super administrateur voit tous les guides', () => {
    const p = principal([['SUPER_ADMIN']])
    expect(ids(accessibleGuides(p, 'web'))).toEqual(ids(guides.filter((g) => g.platform === 'web')))
    expect(ids(accessibleGuides(p, 'lms'))).toEqual(ids(guides.filter((g) => g.platform === 'lms')))
    expect(staffGuide(p, 'web')?.id).toBe('web-administrateur')
    expect(staffGuide(p, 'lms')?.id).toBe('lms-administrateur')
  })

  it('choisit le guide principal selon la dominance des rôles', () => {
    const p = principal([['COORDINATOR'], ['TRAINER'], ['FINANCE']])
    expect(staffGuide(p, 'web')?.id).toBe('web-coordination')
    expect(staffGuide(p, 'lms')?.id).toBe('lms-coordination')
    expect(staffGuide(p, 'lms', ['TRAINER'])?.id).toBe('lms-formateur')
    expect(staffGuide(p, 'web', ['EDITOR'])).toBeNull()
  })

  it('associe chaque guide à une page de l’application', () => {
    expect(guidePath(guideById('web-membre')!)).toBe('/espace/guide')
    expect(guidePath(guideById('web-organisation')!)).toBe('/espace/guide/web-organisation')
    expect(guidePath(guideById('web-finance')!)).toBe('/admin/guide/web-finance')
    expect(guidePath(guideById('lms-apprenant')!)).toBe('/guide')
    expect(guidePath(guideById('lms-formateur')!)).toBe('/formateur/guide')
    expect(guidePath(guideById('lms-coordination')!)).toBe('/coordination/guide')
    expect(guidePath(guideById('lms-administrateur')!)).toBe('/admin/guide')
    expect(guidePath(guideById('lms-organisation')!)).toBe('/organisation/guide')
  })
})
