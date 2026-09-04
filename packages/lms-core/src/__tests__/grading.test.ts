import { describe, expect, it } from 'vitest'
import { computeAttemptTotals, expectedBoolean, gradeAnswer, type GradableOption, type GradableQuestion } from '../grading'

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

function question(type: GradableQuestion['type'], overrides: Partial<GradableQuestion> = {}): GradableQuestion {
  return { id: uuid(1), type, points: 2, explanation: null, config: undefined, ...overrides }
}

function option(n: number, overrides: Partial<GradableOption> = {}): GradableOption {
  return { id: uuid(100 + n), label: `Option ${n}`, isCorrect: false, feedback: null, position: n, matchValue: null, ...overrides }
}

describe('gradeAnswer - choix', () => {
  const options = [option(0, { isCorrect: true, feedback: 'Bonne réponse' }), option(1), option(2)]

  it('SINGLE_CHOICE : exact', () => {
    const ok = gradeAnswer(question('SINGLE_CHOICE'), options, { type: 'choice', optionIds: [uuid(100)] })
    expect(ok.isCorrect).toBe(true)
    expect(ok.score).toBe(2)
    expect(ok.feedback).toContain('Bonne réponse')
    const ko = gradeAnswer(question('SINGLE_CHOICE'), options, { type: 'choice', optionIds: [uuid(101)] })
    expect(ko.isCorrect).toBe(false)
    expect(ko.score).toBe(0)
  })

  it('SINGLE_CHOICE : plusieurs options cochées = faux', () => {
    const result = gradeAnswer(question('SINGLE_CHOICE'), options, { type: 'choice', optionIds: [uuid(100), uuid(101)] })
    expect(result.isCorrect).toBe(false)
  })

  it('MULTIPLE_CHOICE : tout ou rien par défaut', () => {
    const multi = [option(0, { isCorrect: true }), option(1, { isCorrect: true }), option(2)]
    const full = gradeAnswer(question('MULTIPLE_CHOICE', { points: 4 }), multi, { type: 'choice', optionIds: [uuid(101), uuid(100)] })
    expect(full.isCorrect).toBe(true)
    expect(full.score).toBe(4)
    const partial = gradeAnswer(question('MULTIPLE_CHOICE', { points: 4 }), multi, { type: 'choice', optionIds: [uuid(100)] })
    expect(partial.isCorrect).toBe(false)
    expect(partial.score).toBe(0)
    const extra = gradeAnswer(question('MULTIPLE_CHOICE', { points: 4 }), multi, { type: 'choice', optionIds: [uuid(100), uuid(101), uuid(102)] })
    expect(extra.isCorrect).toBe(false)
  })

  it('MULTIPLE_CHOICE : crédit partiel (bonnes - mauvaises) / bonnes', () => {
    const multi = [option(0, { isCorrect: true }), option(1, { isCorrect: true }), option(2)]
    const half = gradeAnswer(question('MULTIPLE_CHOICE', { points: 4 }), multi, { type: 'choice', optionIds: [uuid(100)] }, { partialCredit: true })
    expect(half.isCorrect).toBe(false)
    expect(half.score).toBe(2)
    const penalized = gradeAnswer(question('MULTIPLE_CHOICE', { points: 4 }), multi, { type: 'choice', optionIds: [uuid(100), uuid(102)] }, { partialCredit: true })
    expect(penalized.score).toBe(0)
  })

  it('format de réponse inattendu = faux', () => {
    const result = gradeAnswer(question('SINGLE_CHOICE'), options, { type: 'text', value: 'x' })
    expect(result.isCorrect).toBe(false)
    expect(result.feedback).toMatch(/Format/)
  })

  it('absence de réponse = 0', () => {
    const result = gradeAnswer(question('SINGLE_CHOICE'), options, null)
    expect(result.score).toBe(0)
    expect(result.isCorrect).toBe(false)
  })
})

describe('gradeAnswer - vrai / faux', () => {
  it('utilise config.answer', () => {
    const q = question('TRUE_FALSE', { config: { answer: true } })
    expect(gradeAnswer(q, [], { type: 'boolean', value: true }).isCorrect).toBe(true)
    expect(gradeAnswer(q, [], { type: 'boolean', value: false }).isCorrect).toBe(false)
  })

  it("déduit la valeur attendue des options si la config est absente", () => {
    const options = [option(0, { label: 'Vrai' }), option(1, { label: 'Faux', isCorrect: true })]
    expect(expectedBoolean(question('TRUE_FALSE'), options)).toBe(false)
    expect(gradeAnswer(question('TRUE_FALSE'), options, { type: 'boolean', value: false }).isCorrect).toBe(true)
    expect(gradeAnswer(question('TRUE_FALSE'), options, { type: 'choice', optionIds: [uuid(101)] }).isCorrect).toBe(true)
  })
})

describe('gradeAnswer - texte à trous', () => {
  const q = question('FILL_BLANK', { points: 3, config: { text: 'La ___ est à ___', answers: [['FETRAG', 'Fédération'], ['Libreville']] } })

  it('compare sans accents ni casse', () => {
    const result = gradeAnswer(q, [], { type: 'blanks', values: ['federation', ' LIBREVILLE '] })
    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(3)
  })

  it('tout ou rien sans crédit partiel, proportionnel avec', () => {
    const strict = gradeAnswer(q, [], { type: 'blanks', values: ['fetrag', 'Port-Gentil'] })
    expect(strict.isCorrect).toBe(false)
    expect(strict.score).toBe(0)
    const partial = gradeAnswer(q, [], { type: 'blanks', values: ['fetrag', 'Port-Gentil'] }, { partialCredit: true })
    expect(partial.score).toBe(2)
  })
})

describe('gradeAnswer - appariement et classement', () => {
  it('MATCHING : toutes les paires exactes', () => {
    const options = [option(0, { label: 'Protection', matchValue: 'Bleu' }), option(1, { label: 'Prévention', matchValue: 'Vert' }), option(2, { label: 'Défense', matchValue: 'Or' })]
    const q = question('MATCHING', { points: 3 })
    const ok = gradeAnswer(q, options, { type: 'matching', pairs: [{ optionId: uuid(100), value: 'bleu' }, { optionId: uuid(101), value: 'VERT' }, { optionId: uuid(102), value: 'Or' }] })
    expect(ok.isCorrect).toBe(true)
    expect(ok.score).toBe(3)
    const ko = gradeAnswer(q, options, { type: 'matching', pairs: [{ optionId: uuid(100), value: 'Or' }, { optionId: uuid(101), value: 'Vert' }, { optionId: uuid(102), value: 'Bleu' }] })
    expect(ko.isCorrect).toBe(false)
    expect(ko.score).toBe(0)
  })

  it('ORDERING : ordre exact selon position', () => {
    const options = [option(2, { label: 'Troisième' }), option(0, { label: 'Premier' }), option(1, { label: 'Deuxième' })]
    const q = question('ORDERING')
    expect(gradeAnswer(q, options, { type: 'ordering', optionIds: [uuid(100), uuid(101), uuid(102)] }).isCorrect).toBe(true)
    expect(gradeAnswer(q, options, { type: 'ordering', optionIds: [uuid(101), uuid(100), uuid(102)] }).isCorrect).toBe(false)
    expect(gradeAnswer(q, options, { type: 'ordering', optionIds: [uuid(100), uuid(101)] }).isCorrect).toBe(false)
  })
})

describe('gradeAnswer - réponse courte et composition', () => {
  it('SHORT_ANSWER : liste acceptée normalisée', () => {
    const q = question('SHORT_ANSWER', { config: { accepted: ['Code du travail', 'code du travail gabonais'], caseSensitive: false } })
    expect(gradeAnswer(q, [], { type: 'text', value: '  CODE DU TRAVAIL ' }).isCorrect).toBe(true)
    expect(gradeAnswer(q, [], { type: 'text', value: 'Convention collective' }).isCorrect).toBe(false)
  })

  it('SHORT_ANSWER : sensible à la casse si demandé', () => {
    const q = question('SHORT_ANSWER', { config: { accepted: ['FETRAG'], caseSensitive: true } })
    expect(gradeAnswer(q, [], { type: 'text', value: 'fetrag' }).isCorrect).toBe(false)
    expect(gradeAnswer(q, [], { type: 'text', value: 'FETRAG' }).isCorrect).toBe(true)
  })

  it('ESSAY : correction manuelle, score null', () => {
    const result = gradeAnswer(question('ESSAY', { points: 10 }), [], { type: 'text', value: 'Ma composition' })
    expect(result.needsManualGrading).toBe(true)
    expect(result.score).toBeNull()
    expect(result.isCorrect).toBeNull()
    expect(result.maxScore).toBe(10)
  })

  it('le barème du quiz (points) est prioritaire', () => {
    const q = question('SINGLE_CHOICE', { points: 1 })
    const result = gradeAnswer(q, [option(0, { isCorrect: true })], { type: 'choice', optionIds: [uuid(100)] }, { points: 5 })
    expect(result.maxScore).toBe(5)
    expect(result.score).toBe(5)
  })
})

describe('computeAttemptTotals', () => {
  it('calcule score, maxScore, pourcentage, réussite et compositions en attente', () => {
    const totals = computeAttemptTotals(
      [
        { isCorrect: true, score: 2, maxScore: 2, feedback: null, needsManualGrading: false },
        { isCorrect: false, score: 0, maxScore: 2, feedback: null, needsManualGrading: false },
        { isCorrect: null, score: null, maxScore: 4, feedback: null, needsManualGrading: true },
      ],
      60,
    )
    expect(totals.score).toBe(2)
    expect(totals.maxScore).toBe(8)
    expect(totals.percent).toBe(25)
    expect(totals.passed).toBe(false)
    expect(totals.pending).toBe(1)
  })

  it('réussite au seuil', () => {
    const totals = computeAttemptTotals([{ isCorrect: true, score: 3, maxScore: 5, feedback: null, needsManualGrading: false }], 60)
    expect(totals.percent).toBe(60)
    expect(totals.passed).toBe(true)
  })
})
