import { describe, expect, it } from 'vitest'
import { guideStats, guideToMarkdown, guides, validateGuides } from '../index'
import { validateGuide } from '../validate'

/** Exigences minimales d'un guide « très détaillé » (public à culture numérique moyenne). */
const MIN_SECTIONS = 8
const MIN_STEPS = 25
const MIN_FAQ = 4
const REQUIRED_SECTION_IDS = ['se-reperer', 'questions-frequentes', 'lexique', 'besoin-d-aide']

describe('contenu des guides', () => {
  it('respecte le schéma, sans emoji ni marqueur cassé', () => {
    const issues = validateGuides(guides)
    expect(issues.map((issue) => `${issue.guideId} ${issue.path} : ${issue.message}`)).toEqual([])
  })

  it('couvre les deux plateformes et tous les rôles attendus', () => {
    const pairs = guides.map((g) => `${g.platform}:${g.role}`).sort()
    expect(pairs).toEqual(
      [
        'web:MEMBER',
        'web:ORG_MANAGER',
        'web:SUPPORT',
        'web:SERVICES_MANAGER',
        'web:EDITOR',
        'web:FINANCE',
        'web:COORDINATOR',
        'web:SUPER_ADMIN',
        'lms:LEARNER',
        'lms:ORG_MANAGER',
        'lms:TRAINER',
        'lms:COORDINATOR',
        'lms:SUPER_ADMIN',
      ].sort(),
    )
  })

  it.each(guides.map((g) => [g.id, g] as const))('%s est un guide détaillé et structuré', (_id, guide) => {
    const stats = guideStats(guide)
    expect(stats.sections, 'nombre de sections').toBeGreaterThanOrEqual(MIN_SECTIONS)
    expect(stats.steps, 'nombre d’étapes').toBeGreaterThanOrEqual(MIN_STEPS)
    expect(stats.faq, 'questions fréquentes').toBeGreaterThanOrEqual(MIN_FAQ)
    const sectionIds = guide.sections.map((s) => s.id)
    for (const required of REQUIRED_SECTION_IDS) expect(sectionIds, `section « ${required} »`).toContain(required)
    expect(guide.quickStart?.length ?? 0, 'prise en main').toBeGreaterThanOrEqual(3)
    expect(guide.prerequisites?.length ?? 0, 'prérequis').toBeGreaterThanOrEqual(1)
    expect(guide.summary.length).toBeGreaterThan(80)
    expect(guide.audience.length).toBeGreaterThan(30)
    expect(guide.version).not.toBe('0.1')
  })

  it('détecte un emoji ou un marqueur non refermé', () => {
    const broken = structuredClone(guides[0]!)
    broken.sections[0]!.blocks.push({ type: 'paragraph', text: `Bravo ${String.fromCodePoint(0x1f389)} **gras` })
    const issues = validateGuide(broken)
    expect(issues.some((i) => i.message.includes('Emoji'))).toBe(true)
    expect(issues.some((i) => i.message.includes('gras'))).toBe(true)
  })

  it('se sérialise en Markdown avec un sommaire', () => {
    for (const guide of guides) {
      const md = guideToMarkdown(guide, { baseUrl: 'https://fetrag.ga/espace/guide' })
      expect(md.startsWith(`# ${guide.title}`)).toBe(true)
      expect(md).toContain('## Sommaire')
      for (const section of guide.sections) expect(md).toContain(`(#${section.id})`)
    }
  })
})
