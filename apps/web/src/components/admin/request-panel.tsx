'use client'

import { useActionState } from 'react'
import { MessageSquare, StickyNote, UserCheck } from 'lucide-react'
import { serviceRequestStatusLabels } from '@fetrag/contracts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, FormField, NativeSelect, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { assignRequestAction, setRequestStatusAction, updateRequestNoteAction, type RequestField } from '@/server/admin/services-actions'

export interface RequestPanelProps {
  requestId: string
  status: string
  assigneeId: string | null
  internalNote: string | null
  handlers: Array<{ value: string; label: string }>
  /** Statuts atteignables depuis le statut courant (calculés côté serveur). */
  nextStatuses: string[]
}

/** Panneau de traitement d'une demande de service : attribution, changement de statut commenté, note interne. */
export function RequestPanel({ requestId, status, assigneeId, internalNote, handlers, nextStatuses }: RequestPanelProps) {
  const [assignState, assignAction] = useActionState<ActionState<RequestField>, FormData>(assignRequestAction, idleState)
  const [statusState, statusAction] = useActionState<ActionState<RequestField>, FormData>(setRequestStatusAction, idleState)
  const [noteState, noteAction] = useActionState<ActionState<RequestField>, FormData>(updateRequestNoteAction, idleState)

  return (
    <div className="flex flex-col gap-6">
      <Card pillar="protection">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <UserCheck className="size-5 text-blue-600" aria-hidden="true" />
            Attribution
          </CardTitle>
          <CardDescription>Une demande nouvelle passe automatiquement en examen lorsqu’elle est attribuée.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={assignAction} className="flex flex-col gap-4" noValidate>
            <input type="hidden" name="requestId" value={requestId} />
            <FormStatus state={assignState} />
            <FormField label="Responsable" htmlFor="assigneeId" error={assignState.fieldErrors?.assigneeId}>
              <NativeSelect name="assigneeId" defaultValue={assigneeId ?? 'none'} options={[{ value: 'none', label: 'Non attribuée' }, ...handlers]} />
            </FormField>
            <div className="flex justify-end">
              <SubmitButton variant="secondary" size="sm" pendingLabel="Attribution">
                Enregistrer l’attribution
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card pillar="prevention">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <MessageSquare className="size-5 text-green-700" aria-hidden="true" />
            Changer le statut
          </CardTitle>
          <CardDescription>Le commentaire est transmis au demandeur par email et conservé dans l’historique.</CardDescription>
        </CardHeader>
        <CardContent>
          {nextStatuses.length === 0 ? (
            <p className="text-sm text-neutral-600">Cette demande est clôturée : aucune transition n’est possible.</p>
          ) : (
            <form action={statusAction} className="flex flex-col gap-4" noValidate>
              <input type="hidden" name="requestId" value={requestId} />
              <FormStatus state={statusState} />
              <FormField label="Nouveau statut" htmlFor="status" required error={statusState.fieldErrors?.status} hint={`Statut actuel : ${serviceRequestStatusLabels[status as keyof typeof serviceRequestStatusLabels] ?? status}.`}>
                <NativeSelect
                  name="status"
                  defaultValue={nextStatuses[0]}
                  options={nextStatuses.map((value) => ({ value, label: serviceRequestStatusLabels[value as keyof typeof serviceRequestStatusLabels] ?? value }))}
                />
              </FormField>
              <FormField label="Commentaire pour le demandeur" htmlFor="comment" error={statusState.fieldErrors?.comment} hint="Facultatif ; 3 000 caractères maximum.">
                <Textarea name="comment" rows={4} maxLength={3000} />
              </FormField>
              <div className="flex justify-end">
                <SubmitButton variant="primary" size="sm" pendingLabel="Mise à jour">
                  Appliquer le statut
                </SubmitButton>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card pillar="defense">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <StickyNote className="size-5 text-gold-700" aria-hidden="true" />
            Note interne
          </CardTitle>
          <CardDescription>Visible uniquement par l’équipe des services.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={noteAction} className="flex flex-col gap-4" noValidate>
            <input type="hidden" name="requestId" value={requestId} />
            <FormStatus state={noteState} />
            <FormField label="Note" htmlFor="internalNote" error={noteState.fieldErrors?.internalNote}>
              <Textarea name="internalNote" defaultValue={internalNote ?? ''} rows={5} maxLength={5000} />
            </FormField>
            <div className="flex justify-end">
              <SubmitButton variant="outline" size="sm" pendingLabel="Enregistrement">
                Enregistrer la note
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
