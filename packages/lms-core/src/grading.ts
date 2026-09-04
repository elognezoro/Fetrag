import type { AnswerResponse, QuestionTypeName } from '@fetrag/contracts'
import { normalizeText, textEquals } from './lib/text'
import { readQuestionConfig } from './schemas'

/**
 * Correction automatique pure (sans base de données) d'une réponse à une question.
 * Utilisée par quizzes.submit et testée isolément.
 */

export interface GradableQuestion {
  id: string
  type: QuestionTypeName
  points: number
  explanation?: string | null
  config?: unknown
}

export interface GradableOption {
  id: string
  label: string
  isCorrect: boolean
  feedback?: string | null
  position: number
  matchValue?: string | null
}

export interface GradeResult {
  /** null = correction manuelle requise (ESSAY) */
  isCorrect: boolean | null
  /** null = correction manuelle requise (ESSAY) */
  score: number | null
  maxScore: number
  feedback: string | null
  needsManualGrading: boolean
}

export interface GradingOptions {
  /** Crédit partiel pour QCM / texte à trous (par défaut : tout ou rien). */
  partialCredit?: boolean
  /** Barème spécifique au quiz (QuizQuestion.points) prioritaire sur Question.points. */
  points?: number | null
}

const FORMAT_FEEDBACK = 'Format de réponse inattendu pour ce type de question.'

function manual(maxScore: number): GradeResult {
  return { isCorrect: null, score: null, maxScore, feedback: null, needsManualGrading: true }
}

function graded(isCorrect: boolean, score: number, maxScore: number, feedback: string | null): GradeResult {
  return { isCorrect, score: Math.max(0, Math.min(maxScore, Math.round(score))), maxScore, feedback, needsManualGrading: false }
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((v) => set.has(v))
}

function optionFeedback(options: GradableOption[], chosenIds: readonly string[]): string | null {
  const texts = options
    .filter((o) => chosenIds.includes(o.id) && o.feedback)
    .map((o) => o.feedback as string)
  return texts.length ? texts.join(' ') : null
}

function withExplanation(question: GradableQuestion, specific: string | null): string | null {
  const parts = [question.explanation ?? null, specific].filter((p): p is string => Boolean(p && p.trim()))
  return parts.length ? parts.join(' ') : null
}

/** Valeur attendue d'une question Vrai/Faux : config.answer, sinon l'option correcte. */
export function expectedBoolean(question: GradableQuestion, options: GradableOption[]): boolean | null {
  const config = readQuestionConfig('TRUE_FALSE', question.config)
  if (config && typeof config.answer === 'boolean') return config.answer
  const correct = options.find((o) => o.isCorrect)
  if (!correct) return null
  const label = normalizeText(correct.label)
  if (['vrai', 'true', 'oui', 'yes', 'v'].includes(label)) return true
  if (['faux', 'false', 'non', 'no', 'f'].includes(label)) return false
  return null
}

/**
 * Corrige une réponse. Règles :
 * SINGLE_CHOICE / TRUE_FALSE exact ; MULTIPLE_CHOICE tout ou rien (ou partiel) ;
 * FILL_BLANK comparaison normalisée (accents/casse) ; MATCHING toutes les paires ;
 * ORDERING ordre exact ; SHORT_ANSWER liste acceptée normalisée ; ESSAY correction manuelle.
 */
export function gradeAnswer(
  question: GradableQuestion,
  options: GradableOption[],
  response: AnswerResponse | null | undefined,
  gradingOptions: GradingOptions = {},
): GradeResult {
  const maxScore = Math.max(0, gradingOptions.points ?? question.points ?? 0)
  const sorted = [...options].sort((a, b) => a.position - b.position)

  if (question.type === 'ESSAY') return manual(maxScore)
  if (!response) return graded(false, 0, maxScore, withExplanation(question, 'Aucune réponse fournie.'))

  switch (question.type) {
    case 'SINGLE_CHOICE': {
      if (response.type !== 'choice') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const chosen = response.optionIds[0]
      const correctIds = sorted.filter((o) => o.isCorrect).map((o) => o.id)
      const ok = response.optionIds.length === 1 && chosen !== undefined && correctIds.includes(chosen)
      return graded(ok, ok ? maxScore : 0, maxScore, withExplanation(question, optionFeedback(sorted, response.optionIds)))
    }

    case 'TRUE_FALSE': {
      const expected = expectedBoolean(question, sorted)
      let given: boolean | null = null
      if (response.type === 'boolean') given = response.value
      else if (response.type === 'choice') {
        const chosen = sorted.find((o) => o.id === response.optionIds[0])
        if (chosen) {
          const label = normalizeText(chosen.label)
          given = ['vrai', 'true', 'oui', 'yes', 'v'].includes(label) ? true : ['faux', 'false', 'non', 'no', 'f'].includes(label) ? false : null
        }
      } else return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const ok = expected !== null && given !== null && expected === given
      return graded(ok, ok ? maxScore : 0, maxScore, withExplanation(question, null))
    }

    case 'MULTIPLE_CHOICE': {
      if (response.type !== 'choice') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const correctIds = sorted.filter((o) => o.isCorrect).map((o) => o.id)
      const chosen = [...new Set(response.optionIds)]
      const config = readQuestionConfig('MULTIPLE_CHOICE', question.config)
      const partial = gradingOptions.partialCredit ?? config?.partialCredit ?? false
      const full = sameSet(chosen, correctIds)
      if (full) return graded(true, maxScore, maxScore, withExplanation(question, optionFeedback(sorted, chosen)))
      if (!partial || correctIds.length === 0) {
        return graded(false, 0, maxScore, withExplanation(question, optionFeedback(sorted, chosen)))
      }
      const good = chosen.filter((id) => correctIds.includes(id)).length
      const bad = chosen.length - good
      const ratio = Math.max(0, (good - bad) / correctIds.length)
      return graded(false, ratio * maxScore, maxScore, withExplanation(question, optionFeedback(sorted, chosen)))
    }

    case 'FILL_BLANK': {
      if (response.type !== 'blanks') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const config = readQuestionConfig('FILL_BLANK', question.config)
      const answers = config?.answers ?? []
      if (answers.length === 0) return graded(false, 0, maxScore, withExplanation(question, 'Question sans réponses attendues.'))
      const partial = gradingOptions.partialCredit ?? config?.partialCredit ?? false
      let matched = 0
      answers.forEach((accepted, index) => {
        const given = response.values[index] ?? ''
        if (accepted.some((a) => textEquals(a, given))) matched++
      })
      const all = matched === answers.length
      const score = all ? maxScore : partial ? (matched / answers.length) * maxScore : 0
      return graded(all, score, maxScore, withExplanation(question, all ? null : `${matched}/${answers.length} réponse(s) correcte(s).`))
    }

    case 'MATCHING': {
      if (response.type !== 'matching') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const pairs = sorted.filter((o) => o.matchValue !== null && o.matchValue !== undefined && o.matchValue !== '')
      if (pairs.length === 0) return graded(false, 0, maxScore, withExplanation(question, 'Question sans paires attendues.'))
      const given = new Map(response.pairs.map((p) => [p.optionId, p.value] as const))
      let matched = 0
      for (const option of pairs) {
        const value = given.get(option.id)
        if (value !== undefined && textEquals(option.matchValue as string, value)) matched++
      }
      const all = matched === pairs.length && response.pairs.length === pairs.length
      const partial = gradingOptions.partialCredit ?? false
      const score = all ? maxScore : partial ? (matched / pairs.length) * maxScore : 0
      return graded(all, score, maxScore, withExplanation(question, all ? null : `${matched}/${pairs.length} association(s) correcte(s).`))
    }

    case 'ORDERING': {
      if (response.type !== 'ordering') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const expected = sorted.map((o) => o.id)
      const ok = expected.length > 0 && expected.length === response.optionIds.length && expected.every((id, i) => response.optionIds[i] === id)
      return graded(ok, ok ? maxScore : 0, maxScore, withExplanation(question, ok ? null : "L'ordre attendu n'est pas respecté."))
    }

    case 'SHORT_ANSWER': {
      if (response.type !== 'text') return graded(false, 0, maxScore, FORMAT_FEEDBACK)
      const config = readQuestionConfig('SHORT_ANSWER', question.config)
      const accepted = config?.accepted ?? []
      const caseSensitive = config?.caseSensitive ?? false
      const ok = accepted.some((a) => textEquals(a, response.value, { caseSensitive }))
      return graded(ok, ok ? maxScore : 0, maxScore, withExplanation(question, null))
    }

    default:
      return manual(maxScore)
  }
}

export interface AttemptTotals {
  score: number
  maxScore: number
  percent: number
  passed: boolean
  pending: number
}

/** Agrège les résultats d'une tentative et applique le seuil de réussite (passScore en %). */
export function computeAttemptTotals(results: GradeResult[], passScore: number): AttemptTotals {
  const maxScore = results.reduce((s, r) => s + r.maxScore, 0)
  const score = results.reduce((s, r) => s + (r.score ?? 0), 0)
  const pending = results.filter((r) => r.needsManualGrading).length
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return { score, maxScore, percent: pct, passed: pct >= passScore, pending }
}
