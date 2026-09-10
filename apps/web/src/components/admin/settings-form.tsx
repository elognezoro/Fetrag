'use client'

import { useActionState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { updateSiteSettingsAction, type SettingsField } from '@/server/admin/settings-actions'
import { EditorSection } from './editor-layout'

export interface SettingsFormValues {
  address: string
  email: string
  supportEmail: string | null
  phones: string[]
  currency: string
  participantLimit: number
  motto: string[]
  maintenance: { enabled: boolean; message: string }
}

/** Formulaire des paramètres système (coordonnées, devise, limite de participants, devise institutionnelle, maintenance). */
export function SettingsForm({ values }: { values: SettingsFormValues }) {
  const [state, action] = useActionState<ActionState<SettingsField>, FormData>(updateSiteSettingsAction, idleState)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormStatus state={state} />
      <EditorSection title="Coordonnées de la fédération" description="Affichées dans le pied de page, les emails et les documents générés." pillar="protection">
        <FormField label="Adresse postale" htmlFor="address" required error={errors.address}>
          <Input name="address" defaultValue={values.address} maxLength={200} required />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Email de contact" htmlFor="email" required error={errors.email}>
            <Input name="email" type="email" defaultValue={values.email} required />
          </FormField>
          <FormField label="Email du support" htmlFor="supportEmail" error={errors.supportEmail} hint="Facultatif ; utilisé pour l’assistance.">
            <Input name="supportEmail" type="email" defaultValue={values.supportEmail ?? ''} />
          </FormField>
        </div>
        <FormField label="Téléphones" htmlFor="phones" required error={errors.phones} hint="Un numéro par ligne (quatre au plus).">
          <Textarea name="phones" defaultValue={values.phones.join('\n')} rows={3} />
        </FormField>
      </EditorSection>

      <EditorSection title="Règles métier" pillar="prevention">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField label="Devise des tarifs" htmlFor="currency" required error={errors.currency} hint="Code ISO 4217 (XAF).">
            <Input name="currency" defaultValue={values.currency} maxLength={3} className="uppercase" required />
          </FormField>
          <FormField label="Participants par demande de formation" htmlFor="participantLimit" required error={errors.participantLimit} hint="Limite du workflow institutionnel (chapitre 14).">
            <Input name="participantLimit" type="number" min={1} max={500} step={1} defaultValue={values.participantLimit} required />
          </FormField>
          <FormField label="Devise institutionnelle" htmlFor="motto" required error={errors.motto} hint="Trois mots séparés par des virgules.">
            <Input name="motto" defaultValue={values.motto.join(', ')} required />
          </FormField>
        </div>
      </EditorSection>

      <EditorSection title="Maintenance" description="Un bandeau d’information est affiché sur le site et la plateforme de formation ; l’accès reste ouvert." pillar="defense">
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <Checkbox id="maintenanceEnabled" name="maintenanceEnabled" defaultChecked={values.maintenance.enabled} className="mt-0.5" />
          <div>
            <Label htmlFor="maintenanceEnabled">Afficher le bandeau de maintenance</Label>
            <p className="text-xs text-neutral-500">À activer avant une intervention planifiée.</p>
          </div>
        </div>
        <FormField label="Message" htmlFor="maintenanceMessage" error={errors.maintenanceMessage}>
          <Textarea name="maintenanceMessage" defaultValue={values.maintenance.message} rows={2} maxLength={300} placeholder="Une maintenance est prévue le … de … à … ; certains services seront indisponibles." />
        </FormField>
      </EditorSection>

      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          Enregistrer les paramètres
        </SubmitButton>
      </div>
    </form>
  )
}
