'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { eventKindLabels, sessionModeLabels } from '@fetrag/contracts'
import { Checkbox, FormField, Input, Label, NativeSelect, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveEventAction, type EventField } from '@/server/admin/content-actions'
import { EditorSection } from './editor-layout'
import { FileUpload } from './file-upload'
import { optionsFrom, previewSlug, toDateTimeLocal } from './form-utils'
import { RichTextEditor } from './rich-text-editor'
import { SeoFields } from './seo-fields'

export interface EventFormValues {
  id?: string
  title: string
  slug?: string | null
  summary?: string | null
  description?: string | null
  kind?: string
  categoryId?: string | null
  coverImageUrl?: string | null
  startsAt?: string | null
  endsAt?: string | null
  location?: string | null
  city?: string | null
  mode?: string
  meetingUrl?: string | null
  replayUrl?: string | null
  speakerName?: string | null
  speakerTitle?: string | null
  speakerBio?: string | null
  speakerImageUrl?: string | null
  capacity?: number | null
  isFree?: boolean
  priceAmount?: number | null
  currency?: string
  issuesCertificate?: boolean
  isFeatured?: boolean
  seo?: { title?: string | null; description?: string | null; canonical?: string | null; ogImageUrl?: string | null; noIndex?: boolean } | null
}

export interface EventFormProps {
  event?: EventFormValues
  categories: Array<{ value: string; label: string }>
}

/** Éditeur d'événement, master class, webinaire ou assemblée. */
export function EventForm({ event, categories }: EventFormProps) {
  const [state, action] = useActionState<ActionState<EventField>, FormData>(saveEventAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [title, setTitle] = useState(event?.title ?? '')
  const [isFree, setIsFree] = useState(event?.isFree ?? true)
  const [mode, setMode] = useState(event?.mode ?? 'IN_PERSON')

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
      <FormStatus state={state} />
      <Tabs defaultValue="general">
        <TabsList variant="underline" className="mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="logistique">Dates et lieu</TabsTrigger>
          <TabsTrigger value="intervenant">Intervenant</TabsTrigger>
          <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <EditorSection title="Présentation" pillar="protection">
            <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
              <FormField label="Titre" htmlFor="title" required error={errors.title}>
                <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
              </FormField>
              <FormField label="Type" htmlFor="kind" error={errors.kind}>
                <NativeSelect name="kind" defaultValue={event?.kind ?? 'EVENT'} options={optionsFrom(eventKindLabels)} />
              </FormField>
            </div>
            <FormField label="Résumé" htmlFor="summary" error={errors.summary} hint="Affiché dans l’agenda (600 caractères maximum).">
              <Textarea name="summary" defaultValue={event?.summary ?? ''} maxLength={600} rows={3} />
            </FormField>
            <RichTextEditor name="description" label="Programme et description" defaultValue={event?.description ?? ''} error={errors.description} folder="evenements" />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Catégorie" htmlFor="categoryId" error={errors.categoryId}>
                <NativeSelect name="categoryId" defaultValue={event?.categoryId ?? 'none'} options={[{ value: 'none', label: 'Sans catégorie' }, ...categories]} />
              </FormField>
              <FormField label="Slug (adresse)" htmlFor="slug" error={errors.slug} hint={`Aperçu : /evenements/${previewSlug(title) || 'titre'}`}>
                <Input name="slug" defaultValue={event?.slug ?? ''} placeholder="Généré depuis le titre si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
              </FormField>
            </div>
            <FileUpload name="coverImageUrl" label="Visuel" defaultValue={event?.coverImageUrl} accept="image/*" folder="evenements" error={errors.coverImageUrl} />
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="isFeatured" name="isFeatured" defaultChecked={event?.isFeatured ?? false} className="mt-0.5" />
              <div>
                <Label htmlFor="isFeatured">Mettre en avant</Label>
                <p className="text-xs text-neutral-500">Affiché sur la page d’accueil et en tête de l’agenda.</p>
              </div>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="logistique">
          <EditorSection title="Dates et lieu" pillar="prevention">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Début" htmlFor="startsAt" required error={errors.startsAt}>
                <Input name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(event?.startsAt)} required />
              </FormField>
              <FormField label="Fin" htmlFor="endsAt" error={errors.endsAt}>
                <Input name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(event?.endsAt)} />
              </FormField>
              <FormField label="Modalité" htmlFor="mode" error={errors.mode}>
                <NativeSelect name="mode" value={mode} onChange={(e) => setMode(e.target.value)} options={optionsFrom(sessionModeLabels)} />
              </FormField>
              <FormField label="Ville" htmlFor="city" error={errors.city}>
                <Input name="city" defaultValue={event?.city ?? ''} maxLength={80} placeholder="Libreville" />
              </FormField>
              {mode !== 'VIRTUAL' ? (
                <FormField label="Lieu" htmlFor="location" error={errors.location} hint="Salle, adresse ou bâtiment.">
                  <Input name="location" defaultValue={event?.location ?? ''} maxLength={200} />
                </FormField>
              ) : (
                <input type="hidden" name="location" value={event?.location ?? ''} />
              )}
              {mode !== 'IN_PERSON' ? (
                <FormField label="Lien de la classe virtuelle" htmlFor="meetingUrl" error={errors.meetingUrl} hint="Transmis aux inscrits dans la convocation.">
                  <Input name="meetingUrl" type="url" defaultValue={event?.meetingUrl ?? ''} placeholder="https://" />
                </FormField>
              ) : (
                <input type="hidden" name="meetingUrl" value={event?.meetingUrl ?? ''} />
              )}
              <FormField label="Lien du replay" htmlFor="replayUrl" error={errors.replayUrl} hint="À renseigner après l’événement.">
                <Input name="replayUrl" type="url" defaultValue={event?.replayUrl ?? ''} placeholder="https://" />
              </FormField>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="intervenant">
          <EditorSection title="Intervenant principal" pillar="defense">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nom" htmlFor="speakerName" error={errors.speakerName}>
                <Input name="speakerName" defaultValue={event?.speakerName ?? ''} maxLength={120} />
              </FormField>
              <FormField label="Fonction" htmlFor="speakerTitle" error={errors.speakerTitle}>
                <Input name="speakerTitle" defaultValue={event?.speakerTitle ?? ''} maxLength={160} />
              </FormField>
            </div>
            <FormField label="Biographie" htmlFor="speakerBio" error={errors.speakerBio}>
              <Textarea name="speakerBio" defaultValue={event?.speakerBio ?? ''} rows={5} maxLength={20000} />
            </FormField>
            <FileUpload name="speakerImageUrl" label="Portrait" defaultValue={event?.speakerImageUrl} accept="image/*" folder="intervenants" error={errors.speakerImageUrl} hint="Portrait vertical recommandé (600 × 900 px)." />
          </EditorSection>
        </TabsContent>
        <TabsContent value="inscriptions">
          <EditorSection title="Inscriptions et tarif">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Capacité" htmlFor="capacity" error={errors.capacity} hint="Vide = illimitée ; au-delà, liste d’attente automatique.">
                <Input name="capacity" type="number" min={1} step={1} inputMode="numeric" defaultValue={event?.capacity ?? ''} />
              </FormField>
              <div className="flex items-start gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Checkbox id="isFree" name="isFree" checked={isFree} onCheckedChange={(value) => setIsFree(value === true)} className="mt-0.5" />
                <div>
                  <Label htmlFor="isFree">Événement gratuit</Label>
                  <p className="text-xs text-neutral-500">Décochez pour un événement payant (checkout en ligne).</p>
                </div>
              </div>
              {!isFree ? (
                <>
                  <FormField label="Tarif (XAF)" htmlFor="priceAmount" required error={errors.priceAmount}>
                    <Input name="priceAmount" type="number" min={1} step={1} inputMode="numeric" defaultValue={event?.priceAmount ?? ''} required />
                  </FormField>
                  <FormField label="Devise" htmlFor="currency">
                    <Input name="currency" defaultValue={event?.currency ?? 'XAF'} maxLength={3} className="uppercase" />
                  </FormField>
                </>
              ) : null}
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="issuesCertificate" name="issuesCertificate" defaultChecked={event?.issuesCertificate ?? false} className="mt-0.5" />
              <div>
                <Label htmlFor="issuesCertificate">Délivre une attestation de participation</Label>
                <p className="text-xs text-neutral-500">Les participants marqués présents reçoivent une attestation FETRAG.</p>
              </div>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="seo">
          <EditorSection title="Référencement">
            <SeoFields seo={event?.seo} error={errors.seo} />
          </EditorSection>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {event?.id ? 'Enregistrer l’événement' : 'Créer l’événement'}
        </SubmitButton>
      </div>
    </form>
  )
}
