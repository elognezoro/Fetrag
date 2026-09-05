'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, NativeSelect, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { savePartnerAction, type PartnerField } from '@/server/admin/content-actions'
import { EditorSection } from './editor-layout'
import { FileUpload } from './file-upload'
import { optionsFrom, previewSlug } from './form-utils'

/** Libellés des types de partenaires (miroir de `partnerKindLabels` de @fetrag/cms, non importable côté client). */
export const partnerKindLabels: Record<'AFFILIATE' | 'PARTNER' | 'INSTITUTION' | 'INTERNATIONAL', string> = {
  AFFILIATE: 'Organisation affiliée',
  PARTNER: 'Partenaire',
  INSTITUTION: 'Institution',
  INTERNATIONAL: 'Partenaire international',
}

export interface PartnerFormValues {
  id?: string
  name: string
  slug?: string | null
  acronym?: string | null
  kind?: string
  sector?: string | null
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  city?: string | null
  country?: string
  position?: number
  isActive?: boolean
}

/** Éditeur d'organisation affiliée, partenaire ou institution. */
export function PartnerForm({ partner }: { partner?: PartnerFormValues }) {
  const [state, action] = useActionState<ActionState<PartnerField>, FormData>(savePartnerAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [name, setName] = useState(partner?.name ?? '')

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {partner?.id ? <input type="hidden" name="id" value={partner.id} /> : null}
      <FormStatus state={state} />
      <EditorSection title="Identité" pillar="protection">
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <FormField label="Nom" htmlFor="name" required error={errors.name}>
            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} required />
          </FormField>
          <FormField label="Sigle" htmlFor="acronym" error={errors.acronym}>
            <Input name="acronym" defaultValue={partner?.acronym ?? ''} maxLength={30} className="uppercase" />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Type" htmlFor="kind" error={errors.kind}>
            <NativeSelect name="kind" defaultValue={partner?.kind ?? 'PARTNER'} options={optionsFrom(partnerKindLabels)} />
          </FormField>
          <FormField label="Secteur" htmlFor="sector" error={errors.sector} hint="Ex. énergie et pétrole, enseignement, transports.">
            <Input name="sector" defaultValue={partner?.sector ?? ''} maxLength={120} />
          </FormField>
          <FormField label="Slug" htmlFor="slug" error={errors.slug} hint={`Aperçu : ${previewSlug(name) || 'nom'}`}>
            <Input name="slug" defaultValue={partner?.slug ?? ''} placeholder="Généré depuis le nom si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
          </FormField>
          <FormField label="Ordre d’affichage" htmlFor="position" error={errors.position} hint="Les valeurs faibles apparaissent en premier.">
            <Input name="position" type="number" min={0} step={1} defaultValue={partner?.position ?? 0} />
          </FormField>
        </div>
        <FormField label="Présentation" htmlFor="description" error={errors.description}>
          <Textarea name="description" defaultValue={partner?.description ?? ''} rows={4} maxLength={2000} />
        </FormField>
      </EditorSection>
      <EditorSection title="Logo et coordonnées" pillar="prevention">
        <FileUpload name="logoUrl" label="Logo" defaultValue={partner?.logoUrl} accept="image/*" folder="partenaires" error={errors.logoUrl} hint="PNG ou WebP sur fond transparent ou blanc ; défile dans le bandeau des partenaires." />
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Site web" htmlFor="website" error={errors.website}>
            <Input name="website" type="url" defaultValue={partner?.website ?? ''} placeholder="https://" />
          </FormField>
          <FormField label="Ville" htmlFor="city" error={errors.city}>
            <Input name="city" defaultValue={partner?.city ?? ''} maxLength={80} />
          </FormField>
          <FormField label="Pays (code ISO)" htmlFor="country" error={errors.country}>
            <Input name="country" defaultValue={partner?.country ?? 'GA'} maxLength={2} className="uppercase" />
          </FormField>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <Checkbox id="isActive" name="isActive" defaultChecked={partner?.isActive ?? true} className="mt-0.5" />
          <div>
            <Label htmlFor="isActive">Visible sur le site</Label>
            <p className="text-xs text-neutral-500">Les partenaires inactifs sont conservés mais masqués.</p>
          </div>
        </div>
      </EditorSection>
      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {partner?.id ? 'Enregistrer' : 'Créer le partenaire'}
        </SubmitButton>
      </div>
    </form>
  )
}
