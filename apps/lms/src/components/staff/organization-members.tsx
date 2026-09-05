'use client'

import { useActionState, useId } from 'react'
import { UserMinus, UserPlus } from 'lucide-react'
import { Checkbox, FormField, Input } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { addOrganizationManager, removeOrganizationMember } from '@/server/staff/coordination-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

/** Rattachement d'un compte existant (par email) comme gestionnaire ou membre de l'organisation. */
export function AddOrganizationMemberForm({ organizationId }: { organizationId: string }) {
  const [state, formAction] = useActionState(addOrganizationManager, idleState)
  const id = useId()
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <input type="hidden" name="organizationId" value={organizationId} />
      <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
        <UserPlus className="size-5 text-blue-600" aria-hidden="true" />
        Rattacher un compte
      </h3>
      <ActionAlert state={state} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <FormField label="Email du compte" htmlFor={`${id}-email`} required error={errors.email} hint="Le compte doit exister sur fetrag.ga.">
          <Input name="email" type="email" required placeholder="responsable@organisation.ga" />
        </FormField>
        <FormField label="Fonction dans l'organisation" htmlFor={`${id}-title`} error={errors.title}>
          <Input name="title" maxLength={120} placeholder="Secrétaire général, responsable formation..." />
        </FormField>
        <SubmitButton variant="secondary" pendingLabel="Rattachement...">
          Rattacher
        </SubmitButton>
      </div>
      <FormField inline label="Désigner comme gestionnaire (peut déposer des demandes de formation et consulter les rapports)" htmlFor={`${id}-manager`}>
        <Checkbox name="isManager" value="on" defaultChecked />
      </FormField>
    </form>
  )
}

export function RemoveOrganizationMemberButton({ organizationId, userId, name }: { organizationId: string; userId: string; name: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      action={() => removeOrganizationMember({ organizationId, userId })}
      confirm={{ title: `Retirer ${name}`, description: "Le compte perd son rattachement et, le cas échéant, son rôle de gestionnaire de l'organisation.", confirmLabel: 'Retirer', destructive: true }}
      aria-label={`Retirer ${name} de l'organisation`}
    >
      <UserMinus aria-hidden="true" />
      Retirer
    </ActionButton>
  )
}
