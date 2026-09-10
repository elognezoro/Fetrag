'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { accessLevelLabels, resourceKindLabels } from '@fetrag/contracts'
import { FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveResourceAction, type ResourceField } from '@/server/admin/content-actions'
import { EditorSection } from './editor-layout'
import { FileUpload } from './file-upload'
import { optionsFrom, previewSlug, toDateInput } from './form-utils'

export interface ResourceFormValues {
  id?: string
  title: string
  slug?: string | null
  summary?: string | null
  kind?: string
  categoryId?: string | null
  organizationId?: string | null
  accessLevel?: string
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  mimeType?: string | null
  previewUrl?: string | null
  externalUrl?: string | null
  language?: 'fr' | 'en'
  source?: string | null
  authorName?: string | null
  publishedOn?: string | null
  keywords?: string[]
  priceAmount?: number | null
  currency?: string
}

export interface ResourceFormProps {
  resource?: ResourceFormValues
  categories: Array<{ value: string; label: string }>
  organizations: Array<{ value: string; label: string }>
}

const documentAccept = 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,audio/*,video/*'

/** Éditeur de ressource documentaire : fichier ou URL externe, niveau d'accès, métadonnées, tarif premium. */
export function ResourceForm({ resource, categories, organizations }: ResourceFormProps) {
  const [state, action] = useActionState<ActionState<ResourceField>, FormData>(saveResourceAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [title, setTitle] = useState(resource?.title ?? '')
  const [accessLevel, setAccessLevel] = useState(resource?.accessLevel ?? 'PUBLIC')
  const isPrivate = accessLevel !== 'PUBLIC'

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {resource?.id ? <input type="hidden" name="id" value={resource.id} /> : null}
      <FormStatus state={state} />
      <EditorSection title="Description" pillar="protection">
        <FormField label="Titre" htmlFor="title" required error={errors.title}>
          <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
        </FormField>
        <FormField label="Résumé" htmlFor="summary" error={errors.summary} hint="Présente le document en quelques phrases (1 000 caractères maximum).">
          <Textarea name="summary" defaultValue={resource?.summary ?? ''} maxLength={1000} rows={4} />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Type de ressource" htmlFor="kind" error={errors.kind}>
            <NativeSelect name="kind" defaultValue={resource?.kind ?? 'DOCUMENT'} options={optionsFrom(resourceKindLabels)} />
          </FormField>
          <FormField label="Catégorie" htmlFor="categoryId" error={errors.categoryId}>
            <NativeSelect name="categoryId" defaultValue={resource?.categoryId ?? 'none'} options={[{ value: 'none', label: 'Sans catégorie' }, ...categories]} />
          </FormField>
          <FormField label="Slug (adresse)" htmlFor="slug" error={errors.slug} hint={`Aperçu : /ressources/${previewSlug(title) || 'titre'}`}>
            <Input name="slug" defaultValue={resource?.slug ?? ''} placeholder="Généré depuis le titre si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
          </FormField>
          <FormField label="Langue" htmlFor="language">
            <NativeSelect name="language" defaultValue={resource?.language ?? 'fr'} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }]} />
          </FormField>
        </div>
      </EditorSection>

      <EditorSection title="Fichier ou lien" description="Déposez le document (stocké en privé pour les niveaux Membres, Organisation et Premium) ou indiquez une URL externe." pillar="prevention">
        <FileUpload
          name="fileUrl"
          label="Fichier"
          defaultValue={resource?.fileUrl}
          defaultMeta={resource?.fileName ? { fileName: resource.fileName, mimeType: resource.mimeType ?? undefined, size: resource.fileSize ?? undefined } : null}
          accept={documentAccept}
          folder="ressources"
          visibility={isPrivate ? 'PRIVATE' : 'PUBLIC'}
          withMeta
          allowUrl={false}
          error={errors.fileUrl}
          hint={isPrivate ? 'Stocké en privé : servi uniquement par lien signé aux ayants droit.' : 'Stocké en public.'}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="URL externe" htmlFor="externalUrl" error={errors.externalUrl} hint="Si le document est hébergé ailleurs (site officiel, vidéo en ligne).">
            <Input name="externalUrl" type="url" defaultValue={resource?.externalUrl ?? ''} placeholder="https://" />
          </FormField>
          <FormField label="Image d’aperçu" htmlFor="previewUrl" error={errors.previewUrl} hint="Vignette affichée dans la bibliothèque (facultatif).">
            <Input name="previewUrl" defaultValue={resource?.previewUrl ?? ''} placeholder="/brand/… ou https://" />
          </FormField>
        </div>
      </EditorSection>

      <EditorSection title="Accès et métadonnées" pillar="defense">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Niveau d’accès" htmlFor="accessLevel" required error={errors.accessLevel} hint="Membres : compte connecté ; Organisation : membres de l’organisation rattachée ; Premium : achat.">
            <NativeSelect name="accessLevel" value={accessLevel} onChange={(event) => setAccessLevel(event.target.value)} options={optionsFrom(accessLevelLabels)} />
          </FormField>
          <FormField label="Organisation rattachée" htmlFor="organizationId" error={errors.organizationId} hint="Obligatoire pour le niveau Organisation.">
            <NativeSelect name="organizationId" defaultValue={resource?.organizationId ?? 'none'} options={[{ value: 'none', label: 'Aucune (fédération)' }, ...organizations]} />
          </FormField>
          {accessLevel === 'PREMIUM' ? (
            <>
              <FormField label="Tarif (XAF)" htmlFor="priceAmount" required error={errors.priceAmount} hint="Montant entier en francs CFA ; crée l’offre d’achat.">
                <Input name="priceAmount" type="number" min={0} step={1} inputMode="numeric" defaultValue={resource?.priceAmount ?? ''} />
              </FormField>
              <FormField label="Devise" htmlFor="currency">
                <Input name="currency" defaultValue={resource?.currency ?? 'XAF'} maxLength={3} className="uppercase" />
              </FormField>
            </>
          ) : null}
          <FormField label="Source" htmlFor="source" error={errors.source} hint="Institution ou publication d’origine (ex. Ministère du Travail).">
            <Input name="source" defaultValue={resource?.source ?? ''} maxLength={200} />
          </FormField>
          <FormField label="Auteur" htmlFor="authorName" error={errors.authorName}>
            <Input name="authorName" defaultValue={resource?.authorName ?? ''} maxLength={160} />
          </FormField>
          <FormField label="Date du document" htmlFor="publishedOn" error={errors.publishedOn}>
            <Input name="publishedOn" type="date" defaultValue={toDateInput(resource?.publishedOn)} />
          </FormField>
          <FormField label="Mots-clés" htmlFor="keywords" error={errors.keywords} hint="Séparés par des virgules.">
            <Input name="keywords" defaultValue={resource?.keywords?.join(', ') ?? ''} placeholder="convention collective, CHSCT" />
          </FormField>
        </div>
      </EditorSection>

      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {resource?.id ? 'Enregistrer la ressource' : 'Créer la ressource'}
        </SubmitButton>
      </div>
    </form>
  )
}
