import { CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react'
import type { AnswerResponse } from '@fetrag/contracts'
import { questionTypeLabels } from '@fetrag/contracts'
import { cn } from '@fetrag/ui'
import type { QuizAttemptReview } from '@/server/learner/quiz-queries'
import { splitBlanks } from './question-renderers'

interface QuizReviewProps {
  review: QuizAttemptReview
  className?: string
}

type ReviewQuestion = QuizAttemptReview['questions'][number]

/** Réponse donnée, rendue lisible selon le type de question. */
function renderResponse(question: ReviewQuestion, response: AnswerResponse | null): string {
  if (!response) return 'Aucune réponse'
  const labels = new Map(question.options.map((o) => [o.id, o.label] as const))
  switch (response.type) {
    case 'choice':
      return response.optionIds.map((id) => labels.get(id) ?? id).join(' ; ') || 'Aucune réponse'
    case 'boolean':
      return response.value ? 'Vrai' : 'Faux'
    case 'text':
      return response.value.trim() || 'Aucune réponse'
    case 'blanks':
      return response.values.map((v, i) => `${i + 1}. ${v || '-'}`).join(' · ')
    case 'matching':
      return response.pairs.map((p) => `${labels.get(p.optionId) ?? p.optionId} → ${p.value}`).join(' ; ') || 'Aucune réponse'
    case 'ordering':
      return response.optionIds.map((id, i) => `${i + 1}. ${labels.get(id) ?? id}`).join(' · ')
    default:
      return 'Aucune réponse'
  }
}

/** Réponse attendue, déduite des options et de la configuration révélées. */
function renderExpected(question: ReviewQuestion): string | null {
  const config = question.config ?? {}
  switch (question.type) {
    case 'SINGLE_CHOICE':
    case 'MULTIPLE_CHOICE':
      return question.options.filter((o) => o.isCorrect).map((o) => o.label).join(' ; ') || null
    case 'TRUE_FALSE': {
      const answer = config.answer
      if (typeof answer === 'boolean') return answer ? 'Vrai' : 'Faux'
      return question.options.find((o) => o.isCorrect)?.label ?? null
    }
    case 'FILL_BLANK': {
      const answers = config.answers
      if (!Array.isArray(answers)) return null
      return answers.map((accepted, i) => `${i + 1}. ${Array.isArray(accepted) ? accepted.join(' / ') : String(accepted)}`).join(' · ')
    }
    case 'MATCHING':
      return question.options.filter((o) => o.matchValue).map((o) => `${o.label} → ${o.matchValue}`).join(' ; ') || null
    case 'ORDERING':
      return [...question.options]
        .sort((a, b) => a.position - b.position)
        .map((o, i) => `${i + 1}. ${o.label}`)
        .join(' · ')
    case 'SHORT_ANSWER': {
      const accepted = config.accepted
      return Array.isArray(accepted) ? accepted.map(String).join(' / ') : null
    }
    default:
      return null
  }
}

/** Texte à trous rendu avec les réponses attendues insérées. */
function BlankText({ question }: { question: ReviewQuestion }) {
  const text = typeof question.config?.text === 'string' ? question.config.text : question.prompt
  const answers = Array.isArray(question.config?.answers) ? (question.config.answers as unknown[]) : []
  const parts = splitBlanks(text)
  return (
    <p className="text-sm leading-relaxed text-neutral-700">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? <mark className="rounded bg-green-100 px-1 font-semibold text-green-900">{Array.isArray(answers[index]) ? String((answers[index] as unknown[])[0] ?? '') : '___'}</mark> : null}
        </span>
      ))}
    </p>
  )
}

/** Correction détaillée d'une tentative : réponse donnée, réponse attendue, points, explication. */
export function QuizReview({ review, className }: QuizReviewProps) {
  return (
    <ol className={cn('flex flex-col gap-4', className)}>
      {review.questions.map((question, index) => {
        const pending = question.needsManualGrading
        const correct = question.isCorrect
        const Icon = pending ? Clock : correct === true ? CheckCircle2 : correct === false ? XCircle : HelpCircle
        const expected = review.revealCorrection ? renderExpected(question) : null
        return (
          <li
            key={question.questionId}
            className={cn(
              'rounded-2xl border bg-white p-4 shadow-soft sm:p-5',
              pending ? 'border-gold-200' : correct === true ? 'border-green-200' : correct === false ? 'border-[#f5c6c6]' : 'border-neutral-200',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                  pending ? 'bg-gold-50 text-gold-800' : correct === true ? 'bg-green-50 text-green-700' : correct === false ? 'bg-danger-soft text-danger' : 'bg-neutral-100 text-neutral-500',
                )}
              >
                <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">{pending ? 'En attente de correction' : correct === true ? 'Réponse correcte' : correct === false ? 'Réponse incorrecte' : 'Non évaluée'}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Question {index + 1} · {questionTypeLabels[question.type]}
                  {question.score !== null && question.score !== undefined ? ` · ${question.score}/${question.points} pt${question.points > 1 ? 's' : ''}` : ` · ${question.points} pt${question.points > 1 ? 's' : ''}`}
                </p>
                <p className="mt-1 font-semibold text-navy">{question.type === 'FILL_BLANK' ? 'Texte à compléter' : question.prompt}</p>
                {question.type === 'FILL_BLANK' && review.revealCorrection ? (
                  <div className="mt-2">
                    <BlankText question={question} />
                  </div>
                ) : null}
              </div>
            </div>
            {/* Réponses et explication en pleine largeur sur mobile ; alignées sous l'énoncé dès sm (pastille 36 px + espace 12 px). */}
            <div className="sm:ml-12">
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-neutral-50 p-3">
                  <dt className="text-xs text-neutral-500">Votre réponse</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-ink">{renderResponse(question, question.response)}</dd>
                </div>
                {expected && !pending ? (
                  <div className="rounded-xl bg-green-50 p-3">
                    <dt className="text-xs text-green-800">Réponse attendue</dt>
                    <dd className="mt-0.5 text-green-900">{expected}</dd>
                  </div>
                ) : pending ? (
                  <div className="rounded-xl bg-gold-50 p-3">
                    <dt className="text-xs text-gold-800">Correction</dt>
                    <dd className="mt-0.5 text-gold-900">Votre composition sera notée par le formateur. Vous serez notifié du résultat.</dd>
                  </div>
                ) : null}
              </dl>
              {question.feedback || question.explanation ? (
                <p className="mt-3 rounded-xl border-l-4 border-blue-400 bg-blue-50/60 px-3 py-2 text-sm text-blue-900">
                  {question.explanation && question.feedback && !question.feedback.includes(question.explanation) ? `${question.explanation} ${question.feedback}` : question.feedback ?? question.explanation}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
