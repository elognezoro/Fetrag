import { describe, expect, it } from 'vitest'
import type { Guide } from '@fetrag/contracts'
import { answersSchema, assessmentMinutes, masteryLevel, scoreSelfAssessment } from '@fetrag/contracts'
import { validateGuide } from '../validate'

const sample: Guide = {
  id: 'web-test',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide de test',
  subtitle: 'Sous-titre',
  audience: 'Toute personne disposant d’un compte de test.',
  summary: 'Résumé suffisamment long pour satisfaire le schéma de contenu des guides, avec trois phrases. Deuxième phrase. Troisième phrase.',
  tone: 'blue',
  icon: 'user',
  readingMinutes: 5,
  updatedAt: '2026-09-12',
  version: '1.0',
  sections: [
    {
      id: 'connexion',
      title: 'Se connecter',
      blocks: [{ type: 'paragraph', text: 'Cliquez sur **Se connecter**.' }],
      subsections: [{ id: 'connexion-mfa', title: 'Vérification en deux étapes', blocks: [{ type: 'paragraph', text: 'Saisissez le code.' }] }],
    },
    { id: 'profil', title: 'Mon profil', blocks: [{ type: 'paragraph', text: 'Ouvrez **Profil**.' }] },
  ],
  selfAssessment: {
    intro: 'Vérifiez ce que vous avez retenu.',
    passPercent: 70,
    questions: [
      {
        id: 'q1',
        sectionId: 'connexion',
        type: 'single',
        prompt: 'Quel bouton ouvre la session ?',
        options: [
          { id: 'a', text: 'Se connecter', correct: true },
          { id: 'b', text: 'Publier', correct: false },
        ],
        explanation: 'Le bouton **Se connecter** ouvre la session.',
      },
      {
        id: 'q2',
        sectionId: 'connexion-mfa',
        type: 'true-false',
        prompt: 'Le code de vérification est demandé à chaque connexion.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'Oui, quand la vérification en deux étapes est activée.',
      },
      {
        id: 'q3',
        sectionId: 'profil',
        type: 'multiple',
        prompt: 'Que pouvez-vous modifier dans votre profil ?',
        options: [
          { id: 'a', text: 'Votre téléphone', correct: true },
          { id: 'b', text: 'Votre nom', correct: true },
          { id: 'c', text: 'Le rôle des autres membres', correct: false },
        ],
        explanation: 'Le profil contient vos informations personnelles uniquement.',
      },
      { id: 'q4', sectionId: 'profil', type: 'single', prompt: 'Q4 ?', options: [{ id: 'a', text: 'Oui', correct: true }, { id: 'b', text: 'Non', correct: false }], explanation: 'Oui.' },
      { id: 'q5', sectionId: 'profil', type: 'single', prompt: 'Q5 ?', options: [{ id: 'a', text: 'Oui', correct: false }, { id: 'b', text: 'Non', correct: true }], explanation: 'Non.' },
      { id: 'q6', sectionId: 'connexion', type: 'single', prompt: 'Q6 ?', options: [{ id: 'a', text: 'Oui', correct: true }, { id: 'b', text: 'Non', correct: false }], explanation: 'Oui.' },
    ],
  },
}

describe('autoévaluation', () => {
  it('valide la structure du module (sections existantes, options cohérentes)', () => {
    expect(validateGuide(sample)).toEqual([])
    const broken = structuredClone(sample)
    broken.selfAssessment!.questions[0]!.sectionId = 'inconnue'
    broken.selfAssessment!.questions[1]!.id = 'q1'
    const issues = validateGuide(broken)
    expect(issues.some((i) => i.message.includes('Section inconnue'))).toBe(true)
    expect(issues.some((i) => i.message.includes('Question en double'))).toBe(true)
  })

  it('refuse une question à choix unique sans réponse correcte unique', () => {
    const broken = structuredClone(sample)
    broken.selfAssessment!.questions[0]!.options[1]!.correct = true
    expect(validateGuide(broken).some((i) => i.message.includes('exactement une option correcte'))).toBe(true)
  })

  it('corrige les réponses et calcule la maîtrise par section', () => {
    const result = scoreSelfAssessment(sample, { q1: ['a'], q2: ['b'], q3: ['a', 'b'], q4: ['a'], q5: ['b'], q6: ['a'] })!
    expect(result.total).toBe(6)
    expect(result.correct).toBe(5)
    expect(result.percent).toBe(83)
    expect(result.passed).toBe(true)
    expect(result.mastery).toBe('maitrise')
    const connexion = result.sections.find((s) => s.sectionId === 'connexion')!
    expect(connexion.total).toBe(3)
    expect(connexion.correct).toBe(2)
    expect(result.toReview.map((s) => s.sectionId)).toEqual(['connexion'])
    expect(result.questions.find((q) => q.id === 'q2')?.sectionTitle).toBe('Se connecter')
  })

  it('exige l’ensemble exact des bonnes réponses pour un choix multiple', () => {
    const partial = scoreSelfAssessment(sample, { q3: ['a'] })!
    expect(partial.questions.find((q) => q.id === 'q3')?.correct).toBe(false)
    const extra = scoreSelfAssessment(sample, { q3: ['a', 'b', 'c'] })!
    expect(extra.questions.find((q) => q.id === 'q3')?.correct).toBe(false)
    const exact = scoreSelfAssessment(sample, { q3: ['b', 'a'] })!
    expect(exact.questions.find((q) => q.id === 'q3')?.correct).toBe(true)
  })

  it('traite l’absence de réponse et les options inconnues', () => {
    const result = scoreSelfAssessment(sample, { q1: ['z'], q9: ['a'] })!
    expect(result.questions.find((q) => q.id === 'q1')?.answered).toBe(false)
    expect(result.correct).toBe(0)
    expect(result.mastery).toBe('a-consolider')
  })

  it('ne valide que les questions et options du guide', () => {
    const schema = answersSchema(sample)
    expect(schema.safeParse({ q1: ['a'], q3: ['a', 'c'] }).success).toBe(true)
    expect(schema.safeParse({ q1: ['a', 'b'] }).success).toBe(false)
    expect(schema.safeParse({ q1: ['z'] }).success).toBe(false)
    expect(schema.safeParse({ inconnue: ['a'] }).success).toBe(false)
  })

  it('classe le niveau de maîtrise', () => {
    expect(masteryLevel(100, 70)).toBe('maitrise')
    expect(masteryLevel(70, 70)).toBe('maitrise')
    expect(masteryLevel(60, 70)).toBe('en-bonne-voie')
    expect(masteryLevel(40, 70)).toBe('a-consolider')
    expect(assessmentMinutes(10)).toBe(5)
    expect(assessmentMinutes(3)).toBe(3)
  })

  it('retourne null sans module', () => {
    expect(scoreSelfAssessment({ ...sample, selfAssessment: undefined }, {})).toBeNull()
  })
})
