import { z } from 'zod'
import type { Guide, GuideAssessmentQuestion } from './guides'

/**
 * Autoévaluation de la maîtrise d'un guide : correction, score, niveau de maîtrise et sections à relire.
 * Module pur (sans base de données) : utilisable côté client pour le retour immédiat et côté serveur
 * pour l'enregistrement d'une tentative (le serveur recalcule toujours le score, il ne fait pas confiance au client).
 */

/** Réponses de l'utilisateur : identifiant de question → lettres des options choisies. */
export type GuideAnswers = Record<string, string[]>

export type MasteryLevel = 'a-consolider' | 'en-bonne-voie' | 'maitrise'

export const masteryLabels: Record<MasteryLevel, string> = {
  'a-consolider': 'À consolider',
  'en-bonne-voie': 'En bonne voie',
  maitrise: 'Maîtrisé',
}

/** Message d'encouragement affiché avec le niveau. */
export const masteryMessages: Record<MasteryLevel, string> = {
  'a-consolider': 'Relisez les sections signalées ci-dessous, puis refaites le test : la plupart des réponses s’y trouvent.',
  'en-bonne-voie': 'Vous connaissez l’essentiel. Quelques sections méritent une relecture avant de refaire le test.',
  maitrise: 'Vous maîtrisez ce guide. Vous pouvez le refaire plus tard pour vérifier que tout est encore clair.',
}

export interface QuestionResult {
  id: string
  sectionId: string
  sectionTitle: string
  prompt: string
  type: GuideAssessmentQuestion['type']
  /** Lettres attendues (toutes les options correctes). */
  expected: string[]
  /** Lettres données par l'utilisateur (vide si sans réponse). */
  given: string[]
  answered: boolean
  correct: boolean
  explanation: string
}

export interface SectionMastery {
  sectionId: string
  title: string
  correct: number
  total: number
  percent: number
}

export interface AssessmentResult {
  guideId: string
  total: number
  correct: number
  percent: number
  passPercent: number
  passed: boolean
  mastery: MasteryLevel
  questions: QuestionResult[]
  sections: SectionMastery[]
  /** Sections dont au moins une question est fausse, à relire en priorité (les moins réussies d'abord). */
  toReview: SectionMastery[]
}

/** Niveau de maîtrise à partir du pourcentage de bonnes réponses et du seuil du guide. */
export function masteryLevel(percent: number, passPercent: number): MasteryLevel {
  if (percent >= passPercent) return 'maitrise'
  if (percent >= Math.min(50, passPercent - 1)) return 'en-bonne-voie'
  return 'a-consolider'
}

interface SectionRef {
  id: string
  title: string
  /** Section de rattachement (elle-même pour une section, la section parente pour une sous-section). */
  rootId: string
  rootTitle: string
}

/** Index des ancres du guide (sections et sous-sections) vers leur section de rattachement. */
export function sectionIndex(guide: Pick<Guide, 'sections'>): Map<string, SectionRef> {
  const index = new Map<string, SectionRef>()
  for (const section of guide.sections) {
    index.set(section.id, { id: section.id, title: section.title, rootId: section.id, rootTitle: section.title })
    for (const sub of section.subsections ?? []) {
      index.set(sub.id, { id: sub.id, title: sub.title, rootId: section.id, rootTitle: section.title })
    }
  }
  return index
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((value) => set.has(value))
}

/** Schéma Zod des réponses acceptées pour un guide : uniquement ses questions et leurs options. */
export function answersSchema(guide: Guide) {
  const questions = guide.selfAssessment?.questions ?? []
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const question of questions) {
    const letters = question.options.map((option) => option.id) as [string, ...string[]]
    const max = question.type === 'multiple' ? question.options.length : 1
    shape[question.id] = z.array(z.enum(letters)).max(max).optional()
  }
  return z.object(shape).strict()
}

/**
 * Corrige les réponses : une question est juste si l'ensemble des options choisies est exactement
 * l'ensemble des options correctes (pas de points partiels : le guide doit être relu si un doute subsiste).
 * Retourne `null` si le guide n'a pas de module d'autoévaluation.
 */
export function scoreSelfAssessment(guide: Guide, answers: GuideAnswers): AssessmentResult | null {
  const assessment = guide.selfAssessment
  if (!assessment) return null
  const index = sectionIndex(guide)
  const questions: QuestionResult[] = assessment.questions.map((question) => {
    const expected = question.options.filter((option) => option.correct).map((option) => option.id)
    const given = [...new Set((answers[question.id] ?? []).filter((letter) => question.options.some((option) => option.id === letter)))].sort()
    const ref = index.get(question.sectionId)
    return {
      id: question.id,
      sectionId: ref?.rootId ?? question.sectionId,
      sectionTitle: ref?.rootTitle ?? question.sectionId,
      prompt: question.prompt,
      type: question.type,
      expected: [...expected].sort(),
      given,
      answered: given.length > 0,
      correct: given.length > 0 && sameSet(expected, given),
      explanation: question.explanation,
    }
  })

  const bySection = new Map<string, SectionMastery>()
  for (const result of questions) {
    const entry = bySection.get(result.sectionId) ?? { sectionId: result.sectionId, title: result.sectionTitle, correct: 0, total: 0, percent: 0 }
    entry.total += 1
    if (result.correct) entry.correct += 1
    bySection.set(result.sectionId, entry)
  }
  const sections = [...bySection.values()].map((entry) => ({ ...entry, percent: Math.round((entry.correct / entry.total) * 100) }))
  const correct = questions.filter((question) => question.correct).length
  const total = questions.length
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  const passed = percent >= assessment.passPercent
  return {
    guideId: guide.id,
    total,
    correct,
    percent,
    passPercent: assessment.passPercent,
    passed,
    mastery: masteryLevel(percent, assessment.passPercent),
    questions,
    sections,
    toReview: sections.filter((entry) => entry.correct < entry.total).sort((a, b) => a.percent - b.percent),
  }
}

/** Durée indicative du test (une minute par tranche de deux questions, au moins trois minutes). */
export function assessmentMinutes(questionCount: number): number {
  return Math.max(3, Math.ceil(questionCount / 2))
}
