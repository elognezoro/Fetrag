'use client'

import { useActionState, useId, useMemo, useState } from 'react'
import { Download, FileText, RotateCcw, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Badge, Button, FormField, Input, StatusBadge, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { gradeEssayAnswer, gradeSubmission, returnSubmission } from '@/server/staff/trainer-actions'
import type { EssayReview, SubmissionDetail } from '@/server/staff/trainer-queries'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { fmtDateTime, personName } from './format'

interface RubricCriterion {
  label: string
  points: number
}

/** Lit la grille d'un devoir (formats `{label, points}` du builder ou `{criterion, maxPoints}` du seed). */
function readRubric(raw: unknown): RubricCriterion[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const label = typeof rec.label === 'string' ? rec.label : typeof rec.criterion === 'string' ? rec.criterion : null
      const points = typeof rec.points === 'number' ? rec.points : typeof rec.maxPoints === 'number' ? rec.maxPoints : null
      return label && points !== null ? { label, points } : null
    })
    .filter((c): c is RubricCriterion => Boolean(c))
}

export interface GradingFormProps {
  submission: SubmissionDetail
  cohortId?: string
  onDone?: () => void
}

/** Notation d'un devoir : remise, grille de critères (somme automatique), note, commentaire, renvoi pour révision. */
export function GradingForm({ submission, cohortId, onDone }: GradingFormProps) {
  const [state, formAction] = useActionState(gradeSubmission, idleState)
  const id = useId()
  const rubric = useMemo(() => readRubric(submission.assignment.rubric), [submission.assignment.rubric])
  const existing = (submission.grade?.rubricScores ?? {}) as Record<string, number>
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(() => Object.fromEntries(rubric.map((c) => [c.label, existing[c.label] ?? 0])))
  const [score, setScore] = useState<number>(submission.grade?.score ?? 0)
  const rubricTotal = rubric.reduce((s, c) => s + (rubricScores[c.label] ?? 0), 0)
  const maxScore = submission.assignment.maxScore

  useActionFeedback(state, { onSuccess: () => onDone?.() })

  function setCriterion(label: string, max: number, value: number) {
    const bounded = Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0))
    setRubricScores((prev) => {
      const next = { ...prev, [label]: bounded }
      setScore(Object.values(next).reduce((s, v) => s + v, 0))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-navy">
            {personName(submission.user)} · {submission.activity.title}
          </p>
          <StatusBadge status={submission.status} size="sm" />
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {submission.course.title} · remis le {submission.submittedAt ? fmtDateTime(submission.submittedAt) : '-'}
          {submission.isLate ? <Badge variant="warning" size="sm" className="ml-2">En retard</Badge> : null}
          {submission.dueAt ? ` · échéance ${fmtDateTime(submission.dueAt)}` : ''}
        </p>
        {submission.text ? (
          <div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-line rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-800">{submission.text}</div>
        ) : null}
        {submission.fileUrl ? (
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download aria-hidden="true" />
              {submission.fileName ?? 'Fichier remis'}
            </a>
          </Button>
        ) : null}
        {!submission.text && !submission.fileUrl ? (
          <p className="mt-3 inline-flex items-center gap-2 text-neutral-500">
            <FileText className="size-4" aria-hidden="true" />
            Remise vide.
          </p>
        ) : null}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="submissionId" value={submission.id} />
        {cohortId ? <input type="hidden" name="cohortId" value={cohortId} /> : null}
        <input type="hidden" name="rubricScores" value={rubric.length ? JSON.stringify(rubricScores) : ''} />
        <ActionAlert state={state} />

        {rubric.length ? (
          <fieldset className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
            <legend className="px-1 text-sm font-semibold text-navy">Grille de critères</legend>
            {rubric.map((criterion, index) => (
              <div key={criterion.label} className="flex items-center justify-between gap-3">
                <label htmlFor={`${id}-c-${index}`} className="flex-1 text-sm text-neutral-700">
                  {criterion.label}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`${id}-c-${index}`}
                    type="number"
                    min={0}
                    max={criterion.points}
                    step={0.5}
                    value={rubricScores[criterion.label] ?? 0}
                    onChange={(event) => setCriterion(criterion.label, criterion.points, Number.parseFloat(event.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-neutral-500">/ {criterion.points}</span>
                </div>
              </div>
            ))}
            <p className="text-right text-sm font-semibold text-navy">
              Total grille : {rubricTotal} / {rubric.reduce((s, c) => s + c.points, 0)}
            </p>
          </fieldset>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
          <FormField label={`Note sur ${maxScore}`} htmlFor={`${id}-score`} required error={state.status === 'error' ? state.fieldErrors?.score : undefined}>
            <Input name="score" type="number" min={0} max={maxScore} step={1} value={score} onChange={(event) => setScore(Number.parseInt(event.target.value, 10) || 0)} required />
          </FormField>
          <FormField label="Commentaire pour l'apprenant" htmlFor={`${id}-feedback`} error={state.status === 'error' ? state.fieldErrors?.feedback : undefined} hint="Points forts, axes d'amélioration, références à consulter.">
            <Textarea name="feedback" rows={4} maxLength={5000} defaultValue={submission.grade?.feedback ?? ''} />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <ReturnButton submissionId={submission.id} cohortId={cohortId} onDone={onDone} />
          <SubmitButton pendingLabel="Enregistrement de la note...">
            <Save aria-hidden="true" />
            {submission.grade ? 'Mettre à jour la note' : 'Enregistrer la note'}
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

function ReturnButton({ submissionId, cohortId, onDone }: { submissionId: string; cohortId?: string; onDone?: () => void }) {
  return (
    <ActionButton
      variant="ghost"
      action={(reason) => returnSubmission({ submissionId, feedback: reason ?? '', cohortId })}
      confirm={{
        title: 'Renvoyer pour révision',
        description: 'L’apprenant sera notifié et pourra déposer une nouvelle version de son travail.',
        confirmLabel: 'Renvoyer',
        reasonLabel: 'Ce qui doit être repris',
        reasonPlaceholder: 'Précisez les attentes : structure, sources, analyse selon le triptyque...',
      }}
      onDone={(state) => (state.status === 'success' ? onDone?.() : undefined)}
    >
      <RotateCcw aria-hidden="true" />
      Renvoyer pour révision
    </ActionButton>
  )
}

export interface EssayGradingFormProps {
  review: EssayReview
  cohortId?: string
  onDone?: () => void
}

/** Notation manuelle des compositions (questions ESSAY) d'une tentative : une note par question. */
export function EssayGradingForm({ review, cohortId, onDone }: EssayGradingFormProps) {
  const essays = review.questions.filter((q) => q.type === 'ESSAY')
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <p className="font-semibold text-navy">
          {personName(review.attempt.user)} · {review.quiz.title}
        </p>
        <p className="text-xs text-neutral-500">
          {review.course.title} · tentative {review.attempt.number} soumise le {review.attempt.submittedAt ? fmtDateTime(review.attempt.submittedAt) : '-'} · score automatique {review.attempt.score ?? 0} / {review.attempt.maxScore ?? '-'}
        </p>
      </div>
      {essays.length === 0 ? (
        <Alert variant="info">
          <AlertTitle>Aucune composition à corriger</AlertTitle>
          <AlertDescription>Toutes les questions de cette tentative ont été corrigées automatiquement.</AlertDescription>
        </Alert>
      ) : null}
      {essays.map((question) => (
        <EssayQuestionForm key={question.questionId} attemptId={review.attempt.id} question={question} cohortId={cohortId} onDone={onDone} />
      ))}
    </div>
  )
}

function EssayQuestionForm({ attemptId, question, cohortId, onDone }: { attemptId: string; question: EssayReview['questions'][number]; cohortId?: string; onDone?: () => void }) {
  const [state, formAction] = useActionState(gradeEssayAnswer, idleState)
  const id = useId()
  useActionFeedback(state, { onSuccess: () => onDone?.() })
  const answer = question.response && question.response.type === 'text' ? question.response.value : ''
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const config = (question.config ?? {}) as { minWords?: number; maxWords?: number; rubric?: Array<{ label?: string; criterion?: string; points?: number; maxPoints?: number }> }
  const rubric = readRubric(config.rubric)

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="questionId" value={question.questionId} />
      {cohortId ? <input type="hidden" name="cohortId" value={cohortId} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold text-navy">{question.prompt}</p>
        <Badge variant={question.score === null ? 'warning' : 'success'} size="sm">
          {question.score === null ? 'À corriger' : `Noté ${question.score} / ${question.points}`}
        </Badge>
      </div>
      <div className="max-h-56 overflow-y-auto whitespace-pre-line rounded-lg bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">{answer || <span className="text-neutral-400">Réponse vide</span>}</div>
      <p className="text-xs text-neutral-500">
        {words} mot(s){config.minWords ? ` · minimum attendu ${config.minWords}` : ''}
        {config.maxWords ? ` · maximum ${config.maxWords}` : ''}
      </p>
      {rubric.length ? (
        <ul className="grid grid-cols-1 gap-1 text-xs text-neutral-600 sm:grid-cols-2">
          {rubric.map((c) => (
            <li key={c.label} className="rounded-lg border border-dashed border-neutral-200 px-2 py-1">
              {c.label} <span className="font-semibold text-navy">({c.points} pt)</span>
            </li>
          ))}
        </ul>
      ) : null}
      <ActionAlert state={state} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[9rem_1fr]">
        <FormField label={`Note sur ${question.points}`} htmlFor={`${id}-score`} required error={state.status === 'error' ? state.fieldErrors?.score : undefined}>
          <Input name="score" type="number" min={0} max={question.points} step={1} defaultValue={question.score ?? ''} required />
        </FormField>
        <FormField label="Commentaire" htmlFor={`${id}-feedback`} error={state.status === 'error' ? state.fieldErrors?.feedback : undefined}>
          <Textarea name="feedback" rows={3} maxLength={5000} defaultValue={question.feedback ?? ''} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <SubmitButton size="sm" pendingLabel="Enregistrement...">
          <Save aria-hidden="true" />
          Noter la composition
        </SubmitButton>
      </div>
    </form>
  )
}
