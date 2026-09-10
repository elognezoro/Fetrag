'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, Save, Send, X } from 'lucide-react'
import { Alert, AlertDescription, Button, FormField, Input, Textarea, cn, toast } from '@fetrag/ui'
import { saveSubmissionAction } from '@/server/learner/assignment-actions'
import { initialSubmissionState } from '@/server/learner/types'

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
  const [state, action, pending] = useActionState(saveSubmissionAction, initialSubmissionState)
  const [text, setText] = useState(state.text ?? props.initialText)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const intentRef = useRef<'draft' | 'submit'>('draft')

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

  const words = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <form action={action} className="flex flex-col gap-5" aria-describedby="assignment-form-help">
      <input type="hidden" name="assignmentId" value={props.assignmentId} />
      <input type="hidden" name="courseId" value={props.courseId} />
      <input type="hidden" name="intent" value={intentRef.current} readOnly />

      {props.allowText ? (
        <FormField label="Votre réponse" htmlFor="submission-text" error={state.fieldErrors?.text} hint={`${words} mot${words > 1 ? 's' : ''} · texte simple, mise en forme conservée par les retours à la ligne`}>
          <Textarea name="text" rows={12} value={text} onChange={(event) => setText(event.target.value)} placeholder="Rédigez votre travail ici ou déposez un fichier ci-dessous." maxLength={50000} />
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
