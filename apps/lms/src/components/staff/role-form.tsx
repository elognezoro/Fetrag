'use client'

import { useActionState, useId, useState } from 'react'
import { ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react'
import { roleLabels, roles, scopeTypes, type RoleName, type ScopeTypeName } from '@fetrag/contracts'
import { FormField, Input, NativeSelect } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { grantRole, revokeRole, setUserActive } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

const scopeLabels: Record<ScopeTypeName, string> = { GLOBAL: 'Globale (toute la plateforme)', ORGANIZATION: 'Une organisation', COURSE: 'Un cours', COHORT: 'Une cohorte' }

export interface RoleFormProps {
  userId: string
  grantableRoles: RoleName[]
  organizations: Array<{ id: string; name: string; acronym: string | null }>
  courses: Array<{ id: string; code: string; title: string }>
  cohorts: Array<{ id: string; code: string; name: string }>
}

/** Attribution d'un rôle LMS avec portée (globale, organisation, cours, cohorte) et expiration facultative. */
export function RoleForm({ userId, grantableRoles, organizations, courses, cohorts }: RoleFormProps) {
  const [state, formAction] = useActionState(grantRole, idleState)
  const [scopeType, setScopeType] = useState<ScopeTypeName>('GLOBAL')
  const id = useId()
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const scopeOptions = scopeType === 'ORGANIZATION' ? organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name })) : scopeType === 'COURSE' ? courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })) : scopeType === 'COHORT' ? cohorts.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}` })) : []

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <input type="hidden" name="userId" value={userId} />
      <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
        <ShieldCheck className="size-5 text-blue-600" aria-hidden="true" />
        Attribuer un rôle
      </h3>
      <ActionAlert state={state} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Rôle" htmlFor={`${id}-role`} required error={errors.role}>
          <NativeSelect name="role" required options={grantableRoles.map((r) => ({ value: r, label: roleLabels[r] }))} />
        </FormField>
        <FormField label="Portée" htmlFor={`${id}-scopeType`} error={errors.scopeType}>
          <NativeSelect name="scopeType" value={scopeType} onChange={(event) => setScopeType(event.target.value as ScopeTypeName)} options={scopeTypes.map((s) => ({ value: s, label: scopeLabels[s] }))} />
        </FormField>
        <FormField label="Cible de la portée" htmlFor={`${id}-scopeId`} required={scopeType !== 'GLOBAL'} error={errors.scopeId}>
          <NativeSelect name="scopeId" disabled={scopeType === 'GLOBAL'} options={[{ value: '', label: scopeType === 'GLOBAL' ? 'Sans objet' : 'Choisir...' }, ...scopeOptions]} />
        </FormField>
        <FormField label="Expiration" htmlFor={`${id}-expires`} error={errors.expiresAt} hint="Vide = sans limite.">
          <Input name="expiresAt" type="date" />
        </FormField>
      </div>
      <p className="text-xs text-neutral-500">Les rôles Coordinateur, Finance, Éditeur et Super administrateur exigent la double authentification (MFA) pour accéder aux zones d’administration.</p>
      <div className="flex justify-end">
        <SubmitButton size="sm" pendingLabel="Attribution...">
          Attribuer
        </SubmitButton>
      </div>
    </form>
  )
}

export function RevokeRoleButton({ assignmentId, label }: { assignmentId: string; label: string }) {
  return (
    <ActionButton variant="ghost" size="sm" action={() => revokeRole({ assignmentId })} confirm={{ title: `Retirer le rôle ${label}`, description: 'L’utilisateur perd immédiatement les droits associés.', confirmLabel: 'Retirer', destructive: true }} aria-label={`Retirer le rôle ${label}`}>
      <ShieldOff aria-hidden="true" />
      Retirer
    </ActionButton>
  )
}

export function UserActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  return isActive ? (
    <ActionButton variant="ghost" action={() => setUserActive({ userId, isActive: false })} confirm={{ title: 'Désactiver le compte', description: 'L’utilisateur ne pourra plus se connecter ; ses données sont conservées.', confirmLabel: 'Désactiver', destructive: true }}>
      <UserX aria-hidden="true" />
      Désactiver
    </ActionButton>
  ) : (
    <ActionButton variant="secondary" action={() => setUserActive({ userId, isActive: true })}>
      <UserCheck aria-hidden="true" />
      Réactiver
    </ActionButton>
  )
}

export { roles as allRoles }
