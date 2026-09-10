'use client'

import { useActionState, useId, useState } from 'react'
import { CalendarPlus, Pencil, Save, Trash2 } from 'lucide-react'
import { sessionModeLabels, sessionModes } from '@fetrag/contracts'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { createSession, removeSession, updateSession } from '@/server/staff/trainer-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { fromInputDateTime, toInputDateTime } from './format'

export interface SessionFormValues {
  id?: string
  title: string
  description?: string | null
  mode: string
  startsAt: Date | string
  endsAt: Date | string
  location?: string | null
  meetingUrl?: string | null
  trainerName?: string | null
  activityId?: string | null
}

export interface SessionFormProps {
  cohortId: string
  /** Activités « séance en direct » de la version suivie, pour lier la présence à l'achèvement. */
  liveActivities: Array<{ id: string; title: string; linkedSessionId: string | null }>
  session?: SessionFormValues
  defaultTrainerName?: string | null
  /** Rendu du déclencheur : bouton « Ajouter » ou icône « Modifier ». */
  variant?: 'add' | 'edit'
}

/** Ajout ou édition d'une session de formation (présentiel, classe virtuelle, hybride) dans une boîte de dialogue. */
export function SessionForm({ cohortId, liveActivities, session, defaultTrainerName, variant = session ? 'edit' : 'add' }: SessionFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(session ? updateSession : createSession, idleState)
  const id = useId()
  const [startsAt, setStartsAt] = useState(session ? toInputDateTime(session.startsAt) : '')
  const [endsAt, setEndsAt] = useState(session ? toInputDateTime(session.endsAt) : '')
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === 'add' ? (
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<CalendarPlus aria-hidden="true" />}>
          Ajouter une session
        </Button>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier la session ${session?.title ?? ''}`}>
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      )}
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{session ? 'Modifier la session' : 'Nouvelle session de formation'}</DialogTitle>
          <DialogDescription>Les membres de la cohorte reçoivent une convocation (notification et email) si l’option est cochée.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="hidden" name="cohortId" value={cohortId} />
          {session?.id ? <input type="hidden" name="sessionId" value={session.id} /> : null}
          <input type="hidden" name="startsAt" value={fromInputDateTime(startsAt)} />
          <input type="hidden" name="endsAt" value={fromInputDateTime(endsAt)} />
          <div className="sm:col-span-2">
            <ActionAlert state={state} />
          </div>
          <FormField label="Intitulé" htmlFor={`${id}-title`} required error={errors.title} className="sm:col-span-2">
            <Input name="title" defaultValue={session?.title ?? ''} placeholder="Séance 1 : cadre juridique du dialogue social" required maxLength={200} />
          </FormField>
          <FormField label="Début" htmlFor={`${id}-start`} required error={errors.startsAt} hint="Heure de Libreville.">
            <Input id={`${id}-start`} type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
          </FormField>
          <FormField label="Fin" htmlFor={`${id}-end`} required error={errors.endsAt}>
            <Input id={`${id}-end`} type="datetime-local" value={endsAt} min={startsAt || undefined} onChange={(event) => setEndsAt(event.target.value)} required />
          </FormField>
          <FormField label="Modalité" htmlFor={`${id}-mode`} error={errors.mode}>
            <NativeSelect name="mode" defaultValue={session?.mode ?? 'IN_PERSON'} options={sessionModes.map((m) => ({ value: m, label: sessionModeLabels[m] }))} />
          </FormField>
          <FormField label="Intervenant" htmlFor={`${id}-trainer`} error={errors.trainerName}>
            <Input name="trainerName" defaultValue={session?.trainerName ?? defaultTrainerName ?? ''} maxLength={160} />
          </FormField>
          <FormField label="Lieu" htmlFor={`${id}-location`} error={errors.location}>
            <Input name="location" defaultValue={session?.location ?? ''} placeholder="Siège FETRAG, Libreville" maxLength={200} />
          </FormField>
          <FormField label="Lien de visioconférence" htmlFor={`${id}-url`} error={errors.meetingUrl} hint="Requis pour une classe virtuelle ou hybride.">
            <Input name="meetingUrl" type="url" defaultValue={session?.meetingUrl ?? ''} placeholder="https://meet.example.org/..." />
          </FormField>
          <FormField label="Activité liée (séance en direct)" htmlFor={`${id}-activity`} error={errors.activityId} hint="La présence validera l'achèvement de cette activité." className="sm:col-span-2">
            <NativeSelect
              name="activityId"
              defaultValue={session?.activityId ?? ''}
              options={[{ value: '', label: 'Aucune' }, ...liveActivities.map((a) => ({ value: a.id, label: a.linkedSessionId && a.linkedSessionId !== session?.id ? `${a.title} (déjà liée)` : a.title }))]}
            />
          </FormField>
          <FormField label="Description" htmlFor={`${id}-desc`} error={errors.description} className="sm:col-span-2">
            <Textarea name="description" rows={3} defaultValue={session?.description ?? ''} maxLength={5000} placeholder="Objectifs de la séance, matériel à apporter, préparation attendue." />
          </FormField>
          <FormField inline label="Envoyer la convocation aux membres" htmlFor={`${id}-notify`} className="sm:col-span-2">
            <Checkbox name="notify" value="on" defaultChecked={!session} />
          </FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">
              <Save aria-hidden="true" />
              {session ? 'Enregistrer' : 'Créer la session'}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Suppression d'une session (avec confirmation). */
export function RemoveSessionButton({ sessionId, cohortId, title }: { sessionId: string; cohortId: string; title: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      action={() => removeSession({ sessionId, cohortId })}
      confirm={{ title: `Supprimer « ${title} »`, description: 'Les émargements déjà saisis pour cette session seront perdus.', confirmLabel: 'Supprimer', destructive: true }}
      aria-label={`Supprimer la session ${title}`}
    >
      <Trash2 aria-hidden="true" />
      Supprimer
    </ActionButton>
  )
}
