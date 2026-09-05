'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useRef } from 'react'
import { UserPlus } from 'lucide-react'
import { Checkbox, FormField, Input, Label } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { addOrganizationMemberAction, type MemberField } from '@/server/admin/organizations-actions'

/** Rattachement d'un compte existant (recherché par email) à une organisation. */
export function OrganizationMemberForm({ organizationId }: { organizationId: string }) {
  const id = useId()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action] = useActionState<ActionState<MemberField>, FormData>(addOrganizationMemberAction, idleState)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset()
      router.refresh()
    }
  }, [state, router])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="organizationId" value={organizationId} />
      <FormStatus state={state} />
      <FormField label="Adresse email du compte" htmlFor={`${id}-email`} required error={errors.email} hint="Le compte doit déjà exister ; sinon créez-le depuis « Utilisateurs ».">
        <Input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="off" required />
      </FormField>
      <FormField label="Fonction dans l’organisation" htmlFor={`${id}-title`} error={errors.title}>
        <Input id={`${id}-title`} name="title" maxLength={120} placeholder="Secrétaire général, trésorier, délégué…" />
      </FormField>
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <Checkbox id={`${id}-manager`} name="isManager" className="mt-0.5" />
        <div>
          <Label htmlFor={`${id}-manager`}>Responsable</Label>
          <p className="text-xs text-neutral-500">Dépose les demandes de formation et consulte les rapports de l’organisation.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary" size="md" pendingLabel="Rattachement" leftIcon={<UserPlus aria-hidden="true" />}>
          Ajouter le membre
        </SubmitButton>
      </div>
    </form>
  )
}
