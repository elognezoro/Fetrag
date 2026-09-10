'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, NativeSelect, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveServiceAction, type ServiceField } from '@/server/admin/services-actions'
import { EditorSection } from './editor-layout'
import { FormSchemaBuilder, type BuilderField } from './form-schema-builder'
import { previewSlug } from './form-utils'
import { RichTextEditor } from './rich-text-editor'
import { SeoFields } from './seo-fields'

export interface ServiceFormValues {
  id?: string
  name: string
  slug?: string | null
  summary?: string | null
  description?: string | null
  conditions?: string | null
  icon?: string | null
  categoryId?: string | null
  isPaid?: boolean
  priceAmount?: number | null
  currency?: string
  requiresAccount?: boolean
  formSchema?: BuilderField[] | null
  slaDays?: number | null
  position?: number
  seo?: { title?: string | null; description?: string | null; canonical?: string | null; ogImageUrl?: string | null; noIndex?: boolean } | null
}

export interface ServiceFormProps {
  service?: ServiceFormValues
  categories: Array<{ value: string; label: string }>
}

/** Éditeur d'un service du catalogue : présentation, conditions, tarif, formulaire de demande, SEO. */
export function ServiceForm({ service, categories }: ServiceFormProps) {
  const [state, action] = useActionState<ActionState<ServiceField>, FormData>(saveServiceAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [name, setName] = useState(service?.name ?? '')
  const [isPaid, setIsPaid] = useState(service?.isPaid ?? false)

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {service?.id ? <input type="hidden" name="id" value={service.id} /> : null}
      <FormStatus state={state} />
      <Tabs defaultValue="presentation">
        <TabsList variant="underline" className="mb-4">
          <TabsTrigger value="presentation">Présentation</TabsTrigger>
          <TabsTrigger value="modalites">Modalités et tarif</TabsTrigger>
          <TabsTrigger value="formulaire">Formulaire de demande</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="presentation">
          <EditorSection title="Présentation du service" pillar="protection">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_12rem]">
              <FormField label="Nom du service" htmlFor="name" required error={errors.name}>
                <Input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required />
              </FormField>
              <FormField label="Icône lucide" htmlFor="icon" error={errors.icon} hint="Ex. scale, handshake, shield-check.">
                <Input name="icon" defaultValue={service?.icon ?? ''} maxLength={40} pattern="[a-zA-Z0-9-]+" />
              </FormField>
            </div>
            <FormField label="Résumé" htmlFor="summary" error={errors.summary} hint="Affiché dans le catalogue des services (500 caractères maximum).">
              <Textarea name="summary" defaultValue={service?.summary ?? ''} maxLength={500} rows={3} />
            </FormField>
            <RichTextEditor name="description" label="Description détaillée" defaultValue={service?.description ?? ''} error={errors.description} folder="services" />
            <FormField label="Conditions d’accès" htmlFor="conditions" error={errors.conditions} hint="Qui peut solliciter ce service, pièces à fournir, délais.">
              <Textarea name="conditions" defaultValue={service?.conditions ?? ''} rows={5} maxLength={50000} />
            </FormField>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <FormField label="Catégorie" htmlFor="categoryId" error={errors.categoryId}>
                <NativeSelect name="categoryId" defaultValue={service?.categoryId ?? 'none'} options={[{ value: 'none', label: 'Sans catégorie' }, ...categories]} />
              </FormField>
              <FormField label="Slug (adresse)" htmlFor="slug" error={errors.slug} hint={`Aperçu : /services/${previewSlug(name) || 'nom'}`}>
                <Input name="slug" defaultValue={service?.slug ?? ''} placeholder="Généré depuis le nom si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
              </FormField>
              <FormField label="Ordre d’affichage" htmlFor="position" error={errors.position}>
                <Input name="position" type="number" min={0} step={1} defaultValue={service?.position ?? 0} />
              </FormField>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="modalites">
          <EditorSection title="Modalités et tarif" pillar="prevention">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Checkbox id="requiresAccount" name="requiresAccount" defaultChecked={service?.requiresAccount ?? true} className="mt-0.5" />
                <div>
                  <Label htmlFor="requiresAccount">Compte requis</Label>
                  <p className="text-xs text-neutral-500">Le demandeur doit être connecté pour suivre sa demande dans son espace.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Checkbox id="isPaid" name="isPaid" checked={isPaid} onCheckedChange={(value) => setIsPaid(value === true)} className="mt-0.5" />
                <div>
                  <Label htmlFor="isPaid">Service payant</Label>
                  <p className="text-xs text-neutral-500">Crée une offre et déclenche le paiement en ligne avant traitement.</p>
                </div>
              </div>
              {isPaid ? (
                <>
                  <FormField label="Tarif (XAF)" htmlFor="priceAmount" required error={errors.priceAmount} hint="Montant entier en francs CFA.">
                    <Input name="priceAmount" type="number" min={1} step={1} inputMode="numeric" defaultValue={service?.priceAmount ?? ''} required />
                  </FormField>
                  <FormField label="Devise" htmlFor="currency" error={errors.currency}>
                    <Input name="currency" defaultValue={service?.currency ?? 'XAF'} maxLength={3} className="uppercase" />
                  </FormField>
                </>
              ) : null}
              <FormField label="Délai indicatif (jours)" htmlFor="slaDays" error={errors.slaDays} hint="Affiché au demandeur ; vide si non engageant.">
                <Input name="slaDays" type="number" min={0} max={365} step={1} defaultValue={service?.slaDays ?? ''} />
              </FormField>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="formulaire">
          <EditorSection
            title="Champs du formulaire de demande"
            description="Les champs identité, coordonnées et message sont toujours présents. Ajoutez ici les informations propres au service."
            pillar="defense"
          >
            <FormSchemaBuilder defaultValue={service?.formSchema ?? null} error={errors.formSchema} />
          </EditorSection>
        </TabsContent>
        <TabsContent value="seo">
          <EditorSection title="Référencement">
            <SeoFields seo={service?.seo} error={errors.seo} />
          </EditorSection>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {service?.id ? 'Enregistrer le service' : 'Créer le service'}
        </SubmitButton>
      </div>
    </form>
  )
}
