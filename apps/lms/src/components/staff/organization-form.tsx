'use client'

import { useActionState, useId } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { createOrganization, updateOrganization } from '@/server/staff/coordination-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

export interface OrganizationFormValues {
  id: string
  name: string
  acronym: string | null
  sector: string | null
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  isAffiliate: boolean
  isActive: boolean
  memberCount: number | null
}

/** Fiche d'organisation affiliée (création ou mise à jour) pour la coordination. */
export function OrganizationForm({ organization }: { organization?: OrganizationFormValues }) {
  const [state, formAction] = useActionState(organization ? updateOrganization : createOrganization, idleState)
  const id = useId()
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  return (
    <form action={formAction} className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:grid-cols-2 sm:p-6">
      {organization ? <input type="hidden" name="organizationId" value={organization.id} /> : null}
      <div className="sm:col-span-2">
        <ActionAlert state={state} />
      </div>
      <FormField label="Nom de l'organisation" htmlFor={`${id}-name`} required error={errors.name} className="sm:col-span-2">
        <Input name="name" defaultValue={organization?.name ?? ''} required maxLength={160} placeholder="Syndicat National des Travailleurs de l'Énergie et du Pétrole" />
      </FormField>
      <FormField label="Sigle" htmlFor={`${id}-acronym`} error={errors.acronym}>
        <Input name="acronym" defaultValue={organization?.acronym ?? ''} maxLength={30} placeholder="SYNATEP" />
      </FormField>
      <FormField label="Secteur d'activité" htmlFor={`${id}-sector`} error={errors.sector}>
        <Input name="sector" defaultValue={organization?.sector ?? ''} maxLength={120} placeholder="Énergie, pétrole, transports, enseignement..." />
      </FormField>
      <FormField label="Ville" htmlFor={`${id}-city`} error={errors.city}>
        <Input name="city" defaultValue={organization?.city ?? 'Libreville'} maxLength={120} />
      </FormField>
      <FormField label="Nombre d'adhérents" htmlFor={`${id}-members`} error={errors.memberCount}>
        <Input name="memberCount" type="number" min={0} defaultValue={organization?.memberCount ?? ''} />
      </FormField>
      <FormField label="Adresse" htmlFor={`${id}-address`} error={errors.address} className="sm:col-span-2">
        <Input name="address" defaultValue={organization?.address ?? ''} maxLength={300} placeholder="BP 1234 Libreville" />
      </FormField>
      <FormField label="Email de contact" htmlFor={`${id}-email`} error={errors.email}>
        <Input name="email" type="email" defaultValue={organization?.email ?? ''} />
      </FormField>
      <FormField label="Téléphone" htmlFor={`${id}-phone`} error={errors.phone}>
        <Input name="phone" type="tel" defaultValue={organization?.phone ?? ''} placeholder="066 00 00 00" />
      </FormField>
      <FormField label="Site web" htmlFor={`${id}-website`} error={errors.website} className="sm:col-span-2">
        <Input name="website" type="url" defaultValue={organization?.website ?? ''} placeholder="https://" />
      </FormField>
      <FormField label="Présentation" htmlFor={`${id}-desc`} error={errors.description} className="sm:col-span-2">
        <Textarea name="description" rows={4} maxLength={3000} defaultValue={organization?.description ?? ''} placeholder="Mission, périmètre, implantation, effectifs représentés." />
      </FormField>
      <FormField inline label="Organisation affiliée à la FETRAG" htmlFor={`${id}-affiliate`}>
        <Checkbox name="isAffiliate" value="on" defaultChecked={organization?.isAffiliate ?? true} />
      </FormField>
      {organization ? (
        <FormField inline label="Organisation active" htmlFor={`${id}-active`} hint="Une organisation inactive n'apparaît plus dans les sélecteurs.">
          <Checkbox name="isActive" value="on" defaultChecked={organization.isActive} />
        </FormField>
      ) : null}
      <div className="flex justify-end sm:col-span-2">
        <SubmitButton pendingLabel="Enregistrement...">
          <Save aria-hidden="true" />
          {organization ? 'Enregistrer' : "Créer l'organisation"}
        </SubmitButton>
      </div>
    </form>
  )
}
