'use client'

import { useActionState, useId, useState } from 'react'
import { MonitorPlay, Plus, Save, Trash2 } from 'lucide-react'
import { Button, FormField, Input } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { removeLiveSession, saveLiveSession } from '@/server/staff/admin-course-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { fmtDateTime, fromInputDateTime, toInputDateTime } from './format'

export interface TreeLiveSession {
  id: string
  title: string
  startsAt: Date | string
  endsAt: Date | string
  speakerName: string | null
  meetingUrl: string | null
  replayUrl: string | null
  transcriptUrl: string | null
  trainingSessionId: string | null
}

/** Séances en direct rattachées à une activité LIVE_SESSION : date, intervenant, lien, replay. */
export function LiveSessionList({ activityId, courseId, sessions, readOnly = false }: { activityId: string; courseId: string; sessions: TreeLiveSession[]; readOnly?: boolean }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-600">La présence à la session de formation liée valide l’achèvement de l’activité (règle « Présence »).</p>
      {sessions.length ? (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
              {editing === s.id ? (
                <LiveSessionForm activityId={activityId} session={s} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <MonitorPlay className="mt-0.5 size-4 text-green-700" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-navy">{s.title}</p>
                      <p className="text-xs text-neutral-500">
                        {fmtDateTime(s.startsAt)} - {fmtDateTime(s.endsAt)}
                        {s.speakerName ? ` · ${s.speakerName}` : ''}
                        {s.trainingSessionId ? ' · liée à une session de cohorte' : ''}
                      </p>
                      <p className="flex flex-wrap gap-3 text-xs">
                        {s.meetingUrl ? (
                          <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                            Lien visio
                          </a>
                        ) : null}
                        {s.replayUrl ? (
                          <a href={s.replayUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                            Replay
                          </a>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  {!readOnly ? (
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(s.id)}>
                        Modifier
                      </Button>
                      <ActionButton variant="ghost" size="sm" action={() => removeLiveSession({ liveSessionId: s.id, courseId })} confirm={{ title: `Supprimer « ${s.title} »`, confirmLabel: 'Supprimer', destructive: true }} aria-label={`Supprimer la séance ${s.title}`}>
                        <Trash2 aria-hidden="true" />
                      </ActionButton>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Aucune séance programmée.</p>
      )}
      {!readOnly ? (
        editing === 'new' ? (
          <div className="rounded-xl border border-green-300 bg-green-50/40 p-3">
            <LiveSessionForm activityId={activityId} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setEditing('new')} leftIcon={<Plus aria-hidden="true" />}>
            Ajouter une séance
          </Button>
        )
      ) : null}
    </div>
  )
}

function LiveSessionForm({ activityId, session, onDone }: { activityId: string; session?: TreeLiveSession; onDone: () => void }) {
  const [state, formAction] = useActionState(saveLiveSession, idleState)
  const id = useId()
  const [startsAt, setStartsAt] = useState(toInputDateTime(session?.startsAt))
  const [endsAt, setEndsAt] = useState(toInputDateTime(session?.endsAt))
  useActionFeedback(state, { onSuccess: onDone })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input type="hidden" name="activityId" value={activityId} />
      {session ? <input type="hidden" name="liveSessionId" value={session.id} /> : null}
      <input type="hidden" name="startsAt" value={fromInputDateTime(startsAt)} />
      <input type="hidden" name="endsAt" value={fromInputDateTime(endsAt)} />
      {session?.trainingSessionId ? <input type="hidden" name="trainingSessionId" value={session.trainingSessionId} /> : null}
      <div className="sm:col-span-2">
        <ActionAlert state={state} />
      </div>
      <FormField label="Intitulé" htmlFor={`${id}-title`} required error={errors.title} className="sm:col-span-2">
        <Input name="title" defaultValue={session?.title ?? ''} required maxLength={200} />
      </FormField>
      <FormField label="Début" htmlFor={`${id}-start`} required error={errors.startsAt}>
        <Input id={`${id}-start`} type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
      </FormField>
      <FormField label="Fin" htmlFor={`${id}-end`} required error={errors.endsAt}>
        <Input id={`${id}-end`} type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required />
      </FormField>
      <FormField label="Intervenant" htmlFor={`${id}-speaker`} error={errors.speakerName}>
        <Input name="speakerName" defaultValue={session?.speakerName ?? ''} maxLength={160} />
      </FormField>
      <FormField label="Lien de visioconférence" htmlFor={`${id}-meeting`} error={errors.meetingUrl}>
        <Input name="meetingUrl" type="url" defaultValue={session?.meetingUrl ?? ''} />
      </FormField>
      <FormField label="Replay (URL)" htmlFor={`${id}-replay`} error={errors.replayUrl}>
        <Input name="replayUrl" type="url" defaultValue={session?.replayUrl ?? ''} />
      </FormField>
      <FormField label="Transcription (URL)" htmlFor={`${id}-transcript`} error={errors.transcriptUrl}>
        <Input name="transcriptUrl" type="url" defaultValue={session?.transcriptUrl ?? ''} />
      </FormField>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Annuler
        </Button>
        <SubmitButton size="sm" pendingLabel="Enregistrement...">
          <Save aria-hidden="true" />
          {session ? 'Enregistrer' : 'Ajouter'}
        </SubmitButton>
      </div>
    </form>
  )
}
