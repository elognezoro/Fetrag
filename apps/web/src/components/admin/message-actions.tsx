'use client'

import { useActionState } from 'react'
import { Ban, CheckCircle2, Inbox, Mail, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, FormField, NativeSelect } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { assignMessageAction, setMessageStatusAction } from '@/server/admin/forms-actions'
import { ActionButton } from './action-button'

export interface MessageActionsProps {
  id: string
  status: string
  assignedTo: string | null
  email: string
  reference: string
  handlers: Array<{ value: string; label: string }>
}

/** Actions sur un message reçu : réponse par email, statuts, attribution. */
export function MessageActions({ id, status, assignedTo, email, reference, handlers }: MessageActionsProps) {
  const [assignState, assignAction] = useActionState<ActionState, FormData>(assignMessageAction, idleState)
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`[FETRAG ${reference}] Votre message`)}`

  return (
    <div className="flex flex-col gap-6">
      <Card pillar="protection">
        <CardHeader>
          <CardTitle as="h2">Traitement</CardTitle>
          <CardDescription>Répondez depuis votre messagerie puis marquez le message comme répondu.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <a
            href={mailto}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
          >
            <Mail className="size-[18px]" aria-hidden="true" />
            Répondre par email
          </a>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {status !== 'ANSWERED' ? (
              <ActionButton variant="accent" size="sm" action={() => setMessageStatusAction(id, 'ANSWERED')} leftIcon={<CheckCircle2 aria-hidden="true" />}>
                Marquer répondu
              </ActionButton>
            ) : null}
            {status !== 'CLOSED' ? (
              <ActionButton variant="outline" size="sm" action={() => setMessageStatusAction(id, 'CLOSED')} leftIcon={<XCircle aria-hidden="true" />}>
                Clôturer
              </ActionButton>
            ) : null}
            {status !== 'NEW' ? (
              <ActionButton variant="ghost" size="sm" action={() => setMessageStatusAction(id, 'NEW')} leftIcon={<Inbox aria-hidden="true" />}>
                Remettre en nouveau
              </ActionButton>
            ) : null}
            {status !== 'SPAM' ? (
              <ActionButton variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" action={() => setMessageStatusAction(id, 'SPAM')} leftIcon={<Ban aria-hidden="true" />}>
                Indésirable
              </ActionButton>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card pillar="prevention">
        <CardHeader>
          <CardTitle as="h2">Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={assignAction} className="flex flex-col gap-4" noValidate>
            <input type="hidden" name="id" value={id} />
            <FormStatus state={assignState} />
            <FormField label="Responsable" htmlFor="assignedTo" error={assignState.fieldErrors?.assignedTo}>
              <NativeSelect name="assignedTo" defaultValue={assignedTo ?? 'none'} options={[{ value: 'none', label: 'Non attribué' }, ...handlers]} />
            </FormField>
            <div className="flex justify-end">
              <SubmitButton variant="secondary" size="sm" pendingLabel="Attribution">
                Enregistrer
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
