import { describe, expect, it } from 'vitest'
import { normalizeTags, toCsv } from '../common'
import { buildKey, isStorageKey } from '../platform'
import { buildTree } from '../menus'
import { canTransition, contentTransitions, requiredActions } from '../publishing'
import { validatePayload } from '../service-requests'
import { pageBlocksSchema, menuInputSchema, serviceInputSchema, eventInputSchema } from '../schemas'

describe('toCsv', () => {
  it('produit un CSV avec BOM, séparateur « ; » et échappement des guillemets', () => {
    const csv = toCsv(['Nom', 'Note'], [['Dupont; Jean', 'Dit "bonjour"'], ['Sans', null]])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    const lines = csv.slice(1).split('\r\n')
    expect(lines[0]).toBe('Nom;Note')
    expect(lines[1]).toBe('"Dupont; Jean";"Dit ""bonjour"""')
    expect(lines[2]).toBe('Sans;')
  })
})

describe('normalizeTags', () => {
  it('dédoublonne sans tenir compte de la casse et borne la liste', () => {
    expect(normalizeTags([' Emploi ', 'emploi', 'Santé', ''])).toEqual(['Emploi', 'Santé'])
    expect(normalizeTags(['a', 'b', 'c'], 2)).toEqual(['a', 'b'])
  })
})

describe('stockage', () => {
  it('distingue une clé de stockage d’une URL ou d’un chemin public', () => {
    expect(isStorageKey('resources/2026/09/guide.pdf')).toBe(true)
    expect(isStorageKey('https://blob.vercel-storage.com/x.pdf')).toBe(false)
    expect(isStorageKey('/documents/x.pdf')).toBe(false)
    expect(isStorageKey('')).toBe(false)
    expect(isStorageKey(null)).toBe(false)
  })

  it('construit une clé horodatée et normalisée', () => {
    const key = buildKey('ressources', 'Guide Pratique (2026).PDF')
    expect(key).toMatch(/^ressources\/\d{4}\/\d{2}\/[a-z0-9-]+-guide-pratique-2026\.pdf$/)
  })
})

describe('menus.buildTree', () => {
  it('imbrique les entrées par parentId et trie par position', () => {
    const base = { menuId: 'm', icon: null, isExternal: false }
    const tree = buildTree([
      { id: 'b', parentId: null, label: 'B', href: '/b', position: 2, ...base },
      { id: 'a', parentId: null, label: 'A', href: '/a', position: 1, ...base },
      { id: 'a2', parentId: 'a', label: 'A2', href: '/a/2', position: 1, ...base },
      { id: 'a1', parentId: 'a', label: 'A1', href: '/a/1', position: 0, ...base },
    ])
    expect(tree.map((t) => t.label)).toEqual(['A', 'B'])
    expect(tree[0]?.children.map((c) => c.label)).toEqual(['A1', 'A2'])
    expect(tree[1]?.children).toEqual([])
  })
})

describe('publishing', () => {
  it('respecte le chemin DRAFT → REVIEW → PUBLISHED → ARCHIVED et les retours en brouillon', () => {
    expect(canTransition('DRAFT', 'REVIEW')).toBe(true)
    expect(canTransition('REVIEW', 'PUBLISHED')).toBe(true)
    expect(canTransition('PUBLISHED', 'ARCHIVED')).toBe(true)
    expect(canTransition('ARCHIVED', 'DRAFT')).toBe(true)
    expect(canTransition('ARCHIVED', 'PUBLISHED')).toBe(false)
    expect(canTransition('PUBLISHED', 'REVIEW')).toBe(false)
    expect(contentTransitions.SCHEDULED).toContain('PUBLISHED')
  })

  it('exige cms.publish pour publier et cms.write pour les autres statuts', () => {
    expect(requiredActions('article', 'PUBLISHED')).toEqual(['cms.publish'])
    expect(requiredActions('article', 'REVIEW')).toEqual(['cms.write'])
    expect(requiredActions('course', 'PUBLISHED')).toEqual(['course.publish'])
    expect(requiredActions('service', 'DRAFT')).toContain('services.manage')
  })
})

describe('serviceRequests.validatePayload', () => {
  const fields = [
    { name: 'matricule', label: 'Matricule', type: 'text' as const, required: true },
    { name: 'motif', label: 'Motif', type: 'select' as const, required: true, options: ['licenciement', 'salaire'] },
    { name: 'email', label: 'Email', type: 'email' as const, required: false },
  ]

  it('signale les champs obligatoires manquants et les options invalides', () => {
    const errors = validatePayload(fields, { motif: 'autre', email: 'pas-un-email' })
    expect(errors).toEqual({ matricule: ['Champ obligatoire'], motif: ['Valeur non autorisée'], email: ['Adresse email invalide'] })
  })

  it('accepte un formulaire valide', () => {
    expect(validatePayload(fields, { matricule: 'A12', motif: 'salaire' })).toBeNull()
    expect(validatePayload(null, undefined)).toBeNull()
  })
})

describe('schémas', () => {
  it('valide des blocs de page souples en conservant les propriétés inconnues', () => {
    const parsed = pageBlocksSchema.parse([
      { type: 'hero', title: 'Bienvenue', primaryCta: { label: 'Adhérer', href: '/adhesion' }, extra: 1 },
      { type: 'stats', items: [{ value: 12, label: 'Organisations' }] },
    ])
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toMatchObject({ type: 'hero', extra: 1 })
    expect(() => pageBlocksSchema.parse([{ type: 'inconnu' }])).toThrow()
  })

  it('refuse un service payant sans tarif et un événement mal daté', () => {
    expect(() => serviceInputSchema.parse({ name: 'Assistance', isPaid: true })).toThrow()
    expect(serviceInputSchema.parse({ name: 'Assistance', isPaid: true, priceAmount: 5000 }).priceAmount).toBe(5000)
    expect(() => eventInputSchema.parse({ title: 'AG', startsAt: '2026-10-02T09:00:00Z', endsAt: '2026-10-01T09:00:00Z' })).toThrow()
  })

  it('valide un arbre de menu récursif', () => {
    const menu = menuInputSchema.parse({
      location: 'HEADER',
      items: [{ label: 'La FETRAG', href: '/la-fetrag', children: [{ label: 'Historique', href: '/la-fetrag#historique' }] }],
    })
    expect(menu.items[0]?.children?.[0]?.label).toBe('Historique')
    expect(() => menuInputSchema.parse({ location: 'NOPE', items: [] })).toThrow()
  })
})
