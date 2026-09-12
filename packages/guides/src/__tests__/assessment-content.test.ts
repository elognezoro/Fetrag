import { describe, expect, it } from 'vitest'
import { sectionIndex } from '@fetrag/contracts'
import { guides } from '../index'

/** Exigences du module « Testez votre maîtrise » de chaque guide. */
const MIN_QUESTIONS = 10
const MIN_TYPES = 2
const MIN_SECTION_COVERAGE = 0.5
const MAX_SHARE_PER_SECTION = 0.4

describe('autoévaluation des guides', () => {
  it.each(guides.map((g) => [g.id, g] as const))('%s autoévaluation : module complet et bien réparti', (_id, guide) => {
    const assessment = guide.selfAssessment
    expect(assessment, 'module d’autoévaluation présent').toBeDefined()
    if (!assessment) return
    expect(assessment.questions.length, 'nombre de questions').toBeGreaterThanOrEqual(MIN_QUESTIONS)
    expect(assessment.passPercent).toBeGreaterThanOrEqual(60)
    expect(assessment.passPercent).toBeLessThanOrEqual(80)
    expect(assessment.intro.length).toBeGreaterThan(40)

    const types = new Set(assessment.questions.map((q) => q.type))
    expect(types.size, 'variété des types de questions').toBeGreaterThanOrEqual(MIN_TYPES)

    const index = sectionIndex(guide)
    const rootIds = new Set<string>()
    const perRoot = new Map<string, number>()
    const prompts = new Set<string>()
    for (const question of assessment.questions) {
      const ref = index.get(question.sectionId)
      expect(ref, `section « ${question.sectionId} » de la question ${question.id}`).toBeDefined()
      if (!ref) continue
      rootIds.add(ref.rootId)
      perRoot.set(ref.rootId, (perRoot.get(ref.rootId) ?? 0) + 1)
      expect(prompts.has(question.prompt), `question en double : ${question.prompt}`).toBe(false)
      prompts.add(question.prompt)
      expect(question.explanation.length, `explication de ${question.id}`).toBeGreaterThan(30)
      expect(question.prompt.length, `énoncé de ${question.id}`).toBeGreaterThan(15)
      for (const option of question.options) expect(option.text.length, `option ${option.id} de ${question.id}`).toBeGreaterThan(1)
      if (question.type === 'true-false') {
        const texts = question.options.map((o) => o.text.toLowerCase())
        expect(texts.some((t) => t.startsWith('vrai')) && texts.some((t) => t.startsWith('faux')), `options vrai / faux de ${question.id}`).toBe(true)
      }
    }
    const coverage = rootIds.size / guide.sections.length
    expect(coverage, 'part des sections couvertes').toBeGreaterThanOrEqual(MIN_SECTION_COVERAGE)
    const maxShare = Math.max(...perRoot.values()) / assessment.questions.length
    expect(maxShare, 'concentration des questions sur une seule section').toBeLessThanOrEqual(MAX_SHARE_PER_SECTION)
  })
})
