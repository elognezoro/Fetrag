import { prisma } from '@fetrag/db'
import type { Guide } from '@fetrag/contracts'
import { answersSchema, scoreSelfAssessment, type AssessmentResult, type GuideAnswers } from './assessment'

/**
 * Tentatives d'autoévaluation (table `GuideAssessmentAttempt`). Module serveur uniquement :
 * ne pas l'importer depuis un composant client (il charge le client Prisma).
 */

export interface AttemptSummaryEntry {
  percent: number
  passed: boolean
  createdAt: Date
}

export interface GuideAssessmentSummary {
  guideId: string
  count: number
  last: AttemptSummaryEntry | null
  best: AttemptSummaryEntry | null
}

/**
 * Corrige et enregistre une tentative. Les réponses sont validées contre le guide (questions et options
 * existantes) puis le score est recalculé côté serveur. Lève une erreur si le guide n'a pas d'autoévaluation.
 */
export async function recordGuideAssessmentAttempt(input: { userId: string; guide: Guide; answers: unknown }): Promise<AssessmentResult> {
  const { userId, guide } = input
  if (!guide.selfAssessment) throw new Error(`Le guide ${guide.id} n’a pas de module d’autoévaluation`)
  const parsed = answersSchema(guide).safeParse(input.answers)
  if (!parsed.success) throw new Error('Réponses invalides')
  const answers = Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => Array.isArray(value))) as GuideAnswers
  const result = scoreSelfAssessment(guide, answers)
  if (!result) throw new Error(`Le guide ${guide.id} n’a pas de module d’autoévaluation`)
  await prisma.guideAssessmentAttempt.create({
    data: {
      userId,
      guideId: guide.id,
      platform: guide.platform,
      score: result.correct,
      total: result.total,
      percent: result.percent,
      passed: result.passed,
      answers,
    },
  })
  return result
}

/** Dernière et meilleure tentatives d'un utilisateur pour un guide. */
export async function loadGuideAssessmentSummary(userId: string, guideId: string): Promise<GuideAssessmentSummary> {
  const summaries = await loadGuideAssessmentSummaries(userId, [guideId])
  return summaries[guideId] ?? { guideId, count: 0, last: null, best: null }
}

/** Résumés pour plusieurs guides (cartes de la page d'accueil des guides). */
export async function loadGuideAssessmentSummaries(userId: string, guideIds: string[]): Promise<Record<string, GuideAssessmentSummary>> {
  const result: Record<string, GuideAssessmentSummary> = {}
  for (const guideId of guideIds) result[guideId] = { guideId, count: 0, last: null, best: null }
  if (guideIds.length === 0) return result
  const attempts = await prisma.guideAssessmentAttempt.findMany({
    where: { userId, guideId: { in: guideIds } },
    orderBy: { createdAt: 'desc' },
    select: { guideId: true, percent: true, passed: true, createdAt: true },
  })
  for (const attempt of attempts) {
    const summary = result[attempt.guideId]
    if (!summary) continue
    summary.count += 1
    const entry = { percent: attempt.percent, passed: attempt.passed, createdAt: attempt.createdAt }
    if (!summary.last) summary.last = entry
    if (!summary.best || attempt.percent > summary.best.percent) summary.best = entry
  }
  return result
}
