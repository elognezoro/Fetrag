'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Search, Trash2, Zap } from 'lucide-react'
import { questionTypeLabels, questionTypes, type QuestionTypeName } from '@fetrag/contracts'
import { Badge, Button, Checkbox, FormField, Input, NativeSelect, Textarea, toast } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { addQuestionsToQuiz, moveQuizQuestion, quickCreateQuestion, removeQuestionFromQuiz } from '@/server/staff/admin-course-actions'
import { searchQuestionsAction, type QuestionHit } from '@/server/staff/lookup-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

export interface QuizQuestionRow {
  questionId: string
  position: number
  points: number
  type: QuestionTypeName
  prompt: string
  optionCount: number
}

export interface QuizBuilderProps {
  quizId: string
  courseId: string
  questions: QuizQuestionRow[]
  categories: string[]
  readOnly?: boolean
  isSurvey?: boolean
}

/** Composition d'un quiz : questions retenues (ordre, retrait), sélection depuis la banque, création rapide. */
export function QuizBuilder({ quizId, courseId, questions, categories, readOnly = false, isSurvey = false }: QuizBuilderProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const maxScore = questions.reduce((s, q) => s + q.points, 0)

  function run(action: () => Promise<{ status: string; message?: string }>) {
    startTransition(async () => {
      const state = await action()
      if (state.status === 'success') {
        if (state.message) toast.success(state.message)
        router.refresh()
      } else if (state.status === 'error' && state.message) toast.error(state.message)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-navy">
          {questions.length} question(s) · barème {maxScore} point(s)
        </h3>
        {!readOnly ? (
          <div className="flex flex-wrap gap-2">
            <BankPicker quizId={quizId} courseId={courseId} categories={categories} excludeIds={questions.map((q) => q.questionId)} />
            <QuickCreate quizId={quizId} courseId={courseId} isSurvey={isSurvey} />
          </div>
        ) : null}
      </div>
      {questions.length ? (
        <ol className="flex flex-col gap-2">
          {questions.map((q, index) => (
            <li key={q.questionId} className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span aria-hidden="true" className="font-display text-xl font-semibold leading-none text-blue-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink">{q.prompt}</p>
                  <p className="flex flex-wrap gap-1 text-xs text-neutral-500">
                    <Badge variant="outline" size="sm">
                      {questionTypeLabels[q.type]}
                    </Badge>
                    <span>{q.points} pt</span>
                    {q.optionCount ? <span>· {q.optionCount} option(s)</span> : null}
                  </p>
                </div>
              </div>
              {!readOnly ? (
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Monter la question" disabled={index === 0 || pending} onClick={() => run(() => moveQuizQuestion({ quizId, questionId: q.questionId, courseId, direction: 'up' }))}>
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Descendre la question" disabled={index === questions.length - 1 || pending} onClick={() => run(() => moveQuizQuestion({ quizId, questionId: q.questionId, courseId, direction: 'down' }))}>
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Retirer la question du quiz" disabled={pending} onClick={() => run(() => removeQuestionFromQuiz({ quizId, questionId: q.questionId, courseId }))}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-neutral-500">Aucune question : sélectionnez-en dans la banque ou créez-en une rapidement.</p>
      )}
    </div>
  )
}

function BankPicker({ quizId, courseId, categories, excludeIds }: { quizId: string; courseId: string; categories: string[]; excludeIds: string[] }) {
  const router = useRouter()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [results, setResults] = useState<QuestionHit[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [searching, startSearch] = useTransition()
  const [adding, startAdd] = useTransition()

  useEffect(() => {
    if (!open) return
    const handle = window.setTimeout(() => {
      startSearch(async () => {
        const result = await searchQuestionsAction({ q, type: type ? (type as QuestionTypeName) : undefined, category: category || undefined, excludeIds })
        if (result.ok) setResults(result.items)
        else toast.error(result.message)
      })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [open, q, type, category, excludeIds])

  function add() {
    if (!selected.size) return
    startAdd(async () => {
      const state = await addQuestionsToQuiz({ quizId, questionIds: [...selected], courseId })
      if (state.status === 'success') {
        toast.success(state.message ?? 'Questions ajoutées')
        setSelected(new Set())
        setOpen(false)
        router.refresh()
      } else if (state.status === 'error') toast.error(state.message)
    })
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<Search aria-hidden="true" />}>
        Depuis la banque
      </Button>
    )
  }
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label htmlFor={`${id}-q`} className="sr-only">
          Rechercher une question
        </label>
        <Input id={`${id}-q`} value={q} onChange={(event) => setQ(event.target.value)} placeholder="Mot-clé ou étiquette" leadingIcon={Search} />
        <NativeSelect aria-label="Type" value={type} onChange={(event) => setType(event.target.value)} options={[{ value: '', label: 'Tous les types' }, ...questionTypes.map((t) => ({ value: t, label: questionTypeLabels[t] }))]} />
        <NativeSelect aria-label="Catégorie" value={category} onChange={(event) => setCategory(event.target.value)} options={[{ value: '', label: 'Toutes les catégories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white" aria-busy={searching}>
        {results.length ? (
          <ul className="divide-y divide-neutral-100">
            {results.map((question) => (
              <li key={question.id}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2 text-sm hover:bg-neutral-50">
                  <Checkbox
                    checked={selected.has(question.id)}
                    onCheckedChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (next.has(question.id)) next.delete(question.id)
                        else next.add(question.id)
                        return next
                      })
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{question.prompt}</span>
                    <span className="block text-xs text-neutral-500">
                      {questionTypeLabels[question.type as QuestionTypeName] ?? question.type} · {question.points} pt{question.category ? ` · ${question.category}` : ''}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-sm text-neutral-500">{searching ? 'Recherche...' : 'Aucune question disponible.'}</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Fermer
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={add} loading={adding} disabled={!selected.size}>
          Ajouter {selected.size ? `(${selected.size})` : ''}
        </Button>
      </div>
    </div>
  )
}

function QuickCreate({ quizId, courseId, isSurvey }: { quizId: string; courseId: string; isSurvey: boolean }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(quickCreateQuestion, idleState)
  const [type, setType] = useState<QuestionTypeName>(isSurvey ? 'SINGLE_CHOICE' : 'SINGLE_CHOICE')
  const [optionLines, setOptionLines] = useState('')
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const options = optionLines.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)} leftIcon={<Zap aria-hidden="true" />}>
        Création rapide
      </Button>
    )
  }
  return (
    <form action={formAction} className="flex w-full flex-col gap-3 rounded-xl border border-green-300 bg-green-50/40 p-3">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="courseId" value={courseId} />
      <ActionAlert state={state} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[12rem_1fr]">
        <FormField label="Type" htmlFor={`${id}-type`}>
          <NativeSelect name="type" value={type} onChange={(event) => setType(event.target.value as QuestionTypeName)} options={(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'] as QuestionTypeName[]).map((t) => ({ value: t, label: questionTypeLabels[t] }))} />
        </FormField>
        <FormField label="Énoncé" htmlFor={`${id}-prompt`} required error={errors.prompt}>
          <Input name="prompt" required maxLength={5000} placeholder="Quelle instance est compétente pour un licenciement contesté ?" />
        </FormField>
      </div>
      {type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? (
        <>
          <FormField label="Options (une par ligne)" htmlFor={`${id}-options`} required error={errors.options}>
            <Textarea name="options" rows={4} value={optionLines} onChange={(event) => setOptionLines(event.target.value)} required placeholder={"Le tribunal du travail\nL'inspection du travail\nLe conseil d'administration"} />
          </FormField>
          {options.length ? (
            <fieldset className="flex flex-wrap gap-3">
              <legend className="mb-1 text-sm font-semibold text-navy">{isSurvey ? 'Aucune bonne réponse pour un questionnaire' : 'Bonne(s) réponse(s)'}</legend>
              {!isSurvey
                ? options.map((label, index) => (
                    <label key={index} className="flex items-center gap-2 text-sm">
                      <Checkbox name="correct" value={String(index)} />
                      {label}
                    </label>
                  ))
                : null}
            </fieldset>
          ) : null}
        </>
      ) : null}
      {type === 'TRUE_FALSE' ? (
        <FormField label="Réponse attendue" htmlFor={`${id}-answer`}>
          <NativeSelect name="answer" defaultValue="true" options={[{ value: 'true', label: 'Vrai' }, { value: 'false', label: 'Faux' }]} />
        </FormField>
      ) : null}
      {type === 'SHORT_ANSWER' ? (
        <FormField label="Réponses acceptées (une par ligne)" htmlFor={`${id}-options`} required>
          <Textarea name="options" rows={3} required placeholder={'Inspection du travail\ninspecteur du travail'} />
        </FormField>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Points" htmlFor={`${id}-points`}>
          <Input name="points" type="number" min={1} max={100} defaultValue={isSurvey ? 1 : 1} />
        </FormField>
        <FormField label="Catégorie" htmlFor={`${id}-category`}>
          <Input name="category" maxLength={120} placeholder="Droit du travail" />
        </FormField>
        <FormField label="Explication (après correction)" htmlFor={`${id}-explanation`}>
          <Input name="explanation" maxLength={5000} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Fermer
        </Button>
        <SubmitButton size="sm" pendingLabel="Création...">
          <Plus aria-hidden="true" />
          Créer et ajouter
        </SubmitButton>
      </div>
    </form>
  )
}
