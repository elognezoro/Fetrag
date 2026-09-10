'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { createOrganizationAction, type OrganizationField } from '@/server/admin/organizations-actions'
import { EditorLayout, EditorSection } from './editor-layout'
import { previewSlug } from './form-utils'

/** Création d'une organisation (affiliée ou partenaire) : identité, coordonnées, statut. */
export function OrganizationForm() {
  const [state, action] = useActionState<ActionState<OrganizationField>, FormData>(createOrganizationAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormStatus state={state} />
      <EditorLayout
        main={
          <>
            <EditorSection title="Identité" pillar="protection">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_10rem]">
                <FormField label="Nom" htmlFor="name" required error={errors.name}>
                  <Input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required />
                </FormField>
                <FormField label="Sigle" htmlFor="acronym" error={errors.acronym}>
                  <Input name="acronym" value={acronym} onChange={(event) => setAcronym(event.target.value.toUpperCase())} maxLength={30} className="uppercase" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Secteur" htmlFor="sector" error={errors.sector} hint="Ex. énergie et pétrole, enseignement, transports.">
                  <Input name="sector" maxLength={120} />
                </FormField>
                <FormField label="Slug" htmlFor="slug" error={errors.slug} hint={`Aperçu : ${previewSlug(acronym || name) || 'nom'}`}>
                  <Input name="slug" placeholder="Généré depuis le sigle ou le nom si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
                </FormField>
              </div>
              <FormField label="Présentation" htmlFor="description" error={errors.description}>
                <Textarea name="description" rows={4} maxLength={2000} />
              </FormField>
            </EditorSection>
            <EditorSection title="Coordonnées" pillar="prevention">
              <FormField label="Adresse" htmlFor="address" error={errors.address}>
                <Input name="address" maxLength={200} />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_8rem]">
                <FormField label="Ville" htmlFor="city" error={errors.city}>
                  <Input name="city" defaultValue="Libreville" maxLength={80} />
                </FormField>
                <FormField label="Pays (ISO)" htmlFor="country" error={errors.country}>
                  <Input name="country" defaultValue="GA" maxLength={2} className="uppercase" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FormField label="Téléphone" htmlFor="phone" error={errors.phone}>
                  <Input name="phone" type="tel" inputMode="tel" maxLength={20} />
                </FormField>
                <FormField label="Email" htmlFor="email" error={errors.email}>
                  <Input name="email" type="email" inputMode="email" />
                </FormField>
                <FormField label="Site web" htmlFor="website" error={errors.website}>
                  <Input name="website" type="url" placeholder="https://" />
                </FormField>
              </div>
            </EditorSection>
          </>
        }
        aside={
          <EditorSection title="Statut" pillar="defense">
            <FormField label="Effectif déclaré" htmlFor="memberCount" error={errors.memberCount} hint="Nombre de travailleurs représentés (indicatif).">
              <Input name="memberCount" type="number" min={0} step={1} inputMode="numeric" />
            </FormField>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="isAffiliate" name="isAffiliate" defaultChecked className="mt-0.5" />
              <div>
                <Label htmlFor="isAffiliate">Organisation affiliée</Label>
                <p className="text-xs text-neutral-500">Décochez pour un partenaire non affilié à la fédération.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="isActive" name="isActive" defaultChecked className="mt-0.5" />
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-neutral-500">Les organisations inactives n’apparaissent plus dans les listes de choix.</p>
              </div>
            </div>
            <SubmitButton variant="primary" size="lg" pendingLabel="Création" leftIcon={<Save aria-hidden="true" />}>
              Créer l’organisation
            </SubmitButton>
          </EditorSection>
        }
      />
    </form>
  )
}
