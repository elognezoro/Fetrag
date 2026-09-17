'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Lock, Save, Send, X } from 'lucide-react'
import { Alert, AlertDescription, Button, FormField, Input, cn, toast } from '@fetrag/ui'
import { saveSubmissionAction } from '@/server/learner/assignment-actions'
import { initialSubmissionState } from '@/server/learner/types'
import { AnswerEditor } from './answer-editor'

interface AssignmentFormProps {
  assignmentId: string
  courseId: string
  allowText: boolean
  allowFile: boolean
  allowedMimeTypes: string[]
  maxFileSizeMb: number
  /** Texte déjà enregistré (brouillon ou remise). */
  initialText: string
  existingFileName: string | null
  /** Une remise existe déjà : le bouton principal devient « Mettre à jour ma remise ». */
  alreadySubmitted: boolean
  /**
   * Questions de l'étude de cas : une zone de réponse par question.
   * `correctionHtml` (assaini côté serveur) n'est fourni qu'après la remise.
   */
  questions?: Array<{ prompt: string; correctionHtml: string | null }>
}

/** Document remis : une section `<h4>Question n</h4>` par zone de réponse. */
function combineAnswers(answers: string[]): string {
  if (answers.every((a) => !a.trim())) return ''
  return answers.map((answer, index) => `<h4>Question ${index + 1}</h4>\n${answer.trim() || '<p>Sans réponse.</p>'}`).join('\n')
}

/** Redistribue un document remis vers les zones de réponse (repli : tout dans la première zone). */
function splitAnswers(text: string, count: number): string[] {
  const out = Array.from({ length: count }, () => '')
  if (!text.trim()) return out
  const parts = text.split(/<h4>Question (\d+)<\/h4>/)
  if (parts.length < 3) {
    out[0] = text
    return out
  }
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const index = Number(parts[i]) - 1
    if (index >= 0 && index < count) out[index] = (parts[i + 1] ?? '').trim()
  }
  return out
}

function formatMime(types: string[]): string {
  const labels: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'text/plain': 'TXT',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
  }
  return types.map((t) => labels[t] ?? t).join(', ')
}

/**
 * Dépôt d'un devoir : texte simple et/ou fichier, brouillon ou remise définitive.
 * Server Action `saveSubmissionAction` (validation Zod + `validateUpload` + stockage privé).
 */
export function AssignmentForm(props: AssignmentFormProps) {
  const router = useRouter()
  const questions = props.questions ?? []
  const hasQuestions = questions.length > 0
  const [state, action, pending] = useActionState(saveSubmissionAction, initialSubmissionState)
  const [text, setText] = useState(state.text ?? props.initialText)
  const [answers, setAnswers] = useState<string[]>(() => splitAnswers(state.text ?? props.initialText, questions.length))
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const intentRef = useRef<'draft' | 'submit'>('draft')

  const combined = hasQuestions ? combineAnswers(answers) : text

  function setAnswer(index: number, html: string) {
    setAnswers((prev) => prev.map((value, i) => (i === index ? html : value)))
  }

  useEffect(() => {
    if (state.status === 'saved' || state.status === 'submitted') {
      toast.success(state.message ?? 'Enregistré.')
      setFileName(null)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [state, router])

  const words = combined
    .replace(/<[^>]+>/g, ' ')
    .replace(/Question \d+|Sans réponse\./g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return (
    <form action={action} className="flex flex-col gap-5" aria-describedby="assignment-form-help">
      <input type="hidden" name="assignmentId" value={props.assignmentId} />
      <input type="hidden" name="courseId" value={props.courseId} />
      <input type="hidden" name="intent" value={intentRef.current} readOnly />

      {props.allowText && hasQuestions ? (
        <div className="flex flex-col gap-6">
          <input type="hidden" name="text" value={combined} />
          {questions.map((question, index) => (
            <div key={index} className="flex flex-col gap-2">
              <p className="font-semibold leading-snug text-navy">{question.prompt}</p>
              <AnswerEditor
                label={`Votre réponse à la question ${index + 1}`}
                value={answers[index] ?? ''}
                onChange={(html) => setAnswer(index, html)}
                placeholder="Votre analyse..."
                disabled={pending}
                minHeightClassName="min-h-[9rem]"
              />
              {question.correctionHtml ? (
                <div className="prose-fetrag mt-1 max-w-none text-sm">
                  <details>
                    <summary>Voir la réponse juridique</summary>
                    {/* HTML assaini côté serveur (assignment-queries), servi uniquement après la remise. */}
                    <div dangerouslySetInnerHTML={{ __html: question.correctionHtml }} />
                  </details>
                </div>
              ) : (
                <div className="mt-1">
                  {/* Même structure que le support source : le bouton existe dès le départ, verrouillé avant remise. */}
                  <button
                    type="button"
                    disabled
                    title="Disponible après votre remise"
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm font-semibold text-neutral-400"
                  >
                    <Lock className="size-3.5" aria-hidden="true" />
                    Voir la réponse juridique
                  </button>
                  <span className="ml-2 align-middle text-xs text-neutral-500">disponible après votre remise</span>
                </div>
              )}
            </div>
          ))}
          <p className="text-xs text-neutral-500">
            {words} mot{words > 1 ? 's' : ''} · mise en forme, listes et tableaux disponibles dans chaque barre d&apos;outils
          </p>
        </div>
      ) : props.allowText ? (
        <FormField label="Votre réponse" htmlFor="submission-text" error={state.fieldErrors?.text} hint={`${words} mot${words > 1 ? 's' : ''} · mise en forme, listes et tableaux disponibles dans la barre d'outils`}>
          <input type="hidden" name="text" value={text} />
          <AnswerEditor label="Votre réponse" value={text} onChange={setText} placeholder="Rédigez votre travail ici ou déposez un fichier ci-dessous." disabled={pending} minHeightClassName="min-h-[16rem]" />
        </FormField>
      ) : null}

      {props.allowFile ? (
        <FormField label="Fichier joint" htmlFor="submission-file" error={state.fieldErrors?.file} hint={`Formats acceptés : ${formatMime(props.allowedMimeTypes)} · ${props.maxFileSizeMb} Mo maximum${props.existingFileName ? ` · fichier actuel : ${props.existingFileName}` : ''}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input ref={fileRef} type="file" name="file" accept={props.allowedMimeTypes.join(',')} onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)} className="file:cursor-pointer" />
            {fileName ? (
              <span className={cn('inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800')}>
                <FileUp className="size-3.5" aria-hidden="true" />
                <span className="max-w-[12rem] truncate">{fileName}</span>
                <button
                  type="button"
                  className="inline-flex size-6 items-center justify-center rounded-full hover:bg-blue-100"
                  aria-label="Retirer le fichier sélectionné"
                  onClick={() => {
                    setFileName(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            ) : null}
          </div>
        </FormField>
      ) : null}

      {state.status === 'error' && state.message && !state.fieldErrors ? (
        <Alert variant="danger">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <p id="assignment-form-help" className="text-xs text-neutral-500">
        Le brouillon reste modifiable. La remise définitive notifie votre formateur ; vous pourrez la mettre à jour jusqu’à sa correction.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="outline"
          className="w-full sm:w-auto"
          loading={pending && intentRef.current === 'draft'}
          disabled={pending}
          onClick={() => {
            intentRef.current = 'draft'
          }}
          leftIcon={<Save aria-hidden="true" />}
        >
          Enregistrer le brouillon
        </Button>
        <Button
          type="submit"
          variant="accent"
          className="w-full sm:w-auto"
          loading={pending && intentRef.current === 'submit'}
          disabled={pending}
          onClick={() => {
            intentRef.current = 'submit'
          }}
          leftIcon={<Send aria-hidden="true" />}
        >
          {props.alreadySubmitted ? 'Mettre à jour ma remise' : 'Soumettre le devoir'}
        </Button>
      </div>
    </form>
  )
}
