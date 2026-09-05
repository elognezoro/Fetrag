'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'
import { ShieldPlus } from 'lucide-react'
import { roleLabels, roles, scopeTypes } from '@fetrag/contracts'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, NativeSelect } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { grantRoleAction, type RoleField } from '@/server/admin/users-actions'

const scopeLabels: Record<(typeof scopeTypes)[number], string> = {
  GLOBAL: 'Globale (toute la plateforme)',
  ORGANIZATION: 'Une organisation',
  COURSE: 'Un cours',
  COHORT: 'Une cohorte',
}

export interface RoleGrantDialogProps {
  userId: string
  userLabel: string
  scopeOptions: Record<'ORGANIZATION' | 'COURSE' | 'COHORT', Array<{ value: string; label: string }>>
}

/** Attribution d'un rôle avec portée et expiration (réservé au super administrateur). */
export function RoleGrantDialog({ userId, userLabel, scopeOptions }: RoleGrantDialogProps) {
  const id = useId()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scopeType, setScopeType] = useState<(typeof scopeTypes)[number]>('GLOBAL')
  const [state, action] = useActionState<ActionState<RoleField>, FormData>(grantRoleAction, idleState)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.status === 'success') {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  const options = scopeType === 'GLOBAL' ? [] : scopeOptions[scopeType]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="primary" size="sm" leftIcon={<ShieldPlus aria-hidden="true" />}>
          Attribuer un rôle
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Attribuer un rôle</DialogTitle>
          <DialogDescription>{userLabel} · les rôles globaux privilégiés (administration, coordination, finance, édition) exigent la vérification en deux étapes.</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="userId" value={userId} />
          <FormStatus state={state} withToast={false} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Rôle" htmlFor={`${id}-role`} required error={errors.role}>
              <NativeSelect id={`${id}-role`} name="role" defaultValue="LEARNER" options={roles.map((role) => ({ value: role, label: roleLabels[role] }))} />
            </FormField>
            <FormField label="Portée" htmlFor={`${id}-scope`} required error={errors.scopeType}>
              <NativeSelect
                id={`${id}-scope`}
                name="scopeType"
                value={scopeType}
                onChange={(event) => setScopeType(event.target.value as (typeof scopeTypes)[number])}
                options={scopeTypes.map((scope) => ({ value: scope, label: scopeLabels[scope] }))}
              />
            </FormField>
          </div>
          {scopeType !== 'GLOBAL' ? (
            <FormField label={scopeLabels[scopeType]} htmlFor={`${id}-scopeId`} required error={errors.scopeId}>
              <NativeSelect id={`${id}-scopeId`} name="scopeId" defaultValue="" placeholder="Choisir" options={options} />
            </FormField>
          ) : null}
          <FormField label="Expiration" htmlFor={`${id}-expires`} error={errors.expiresAt} hint="Vide = sans limite. Utile pour un remplacement temporaire.">
            <Input id={`${id}-expires`} name="expiresAt" type="datetime-local" />
          </FormField>
          <div className="flex justify-end">
            <SubmitButton variant="primary" pendingLabel="Attribution">
              Attribuer
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
