'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, NativeSelect, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { savePageAction, type PageField } from '@/server/admin/content-actions'
import { EditorSection } from './editor-layout'
import { FileUpload } from './file-upload'
import { toDateTimeLocal, previewSlug } from './form-utils'
import { JsonBlocksEditor } from './json-blocks-editor'
import { RichTextEditor } from './rich-text-editor'
import { SeoFields } from './seo-fields'

export interface PageFormValues {
  id?: string
  title: string
  slug?: string | null
  excerpt?: string | null
  content?: string | null
  blocks?: unknown
  template?: string | null
  locale?: 'fr' | 'en'
  coverImageUrl?: string | null
  showInSitemap?: boolean
  scheduledAt?: string | null
  seo?: { title?: string | null; description?: string | null; canonical?: string | null; ogImageUrl?: string | null; noIndex?: boolean } | null
}

const templates = [
  { value: 'default', label: 'Standard' },
  { value: 'institution', label: 'Institutionnel (La FETRAG)' },
  { value: 'landing', label: 'Page d’atterrissage' },
  { value: 'legal', label: 'Page légale' },
]

/** Éditeur de page institutionnelle : contenu riche, blocs structurés, réglages et SEO. */
export function PageForm({ page }: { page?: PageFormValues }) {
  const [state, action] = useActionState<ActionState<PageField>, FormData>(savePageAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [title, setTitle] = useState(page?.title ?? '')

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      <FormStatus state={state} />
      <Tabs defaultValue="contenu">
        <TabsList variant="underline" className="mb-4">
          <TabsTrigger value="contenu">Contenu</TabsTrigger>
          <TabsTrigger value="blocs">Blocs</TabsTrigger>
          <TabsTrigger value="reglages">Réglages</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="contenu" className="flex flex-col gap-6">
          <EditorSection title="Titre et introduction" pillar="protection">
            <FormField label="Titre" htmlFor="title" required error={errors.title}>
              <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
            </FormField>
            <FormField label="Extrait" htmlFor="excerpt" error={errors.excerpt} hint="Résumé affiché dans les listes et les partages ; généré depuis le contenu si vide.">
              <Textarea name="excerpt" defaultValue={page?.excerpt ?? ''} maxLength={500} rows={3} />
            </FormField>
            <RichTextEditor name="content" label="Contenu" defaultValue={page?.content ?? ''} error={errors.content} folder="pages" />
          </EditorSection>
        </TabsContent>
        <TabsContent value="blocs">
          <EditorSection title="Blocs structurés" description="Sections riches (bandeau, chiffres, triptyque, équipe...) rendues avant ou à la place du contenu selon le gabarit." pillar="prevention">
            <JsonBlocksEditor defaultValue={page?.blocks ?? null} error={errors.blocks} />
          </EditorSection>
        </TabsContent>
        <TabsContent value="reglages">
          <EditorSection title="Réglages" pillar="defense">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Slug (adresse)" htmlFor="slug" error={errors.slug} hint={`Aperçu : /${previewSlug(title) || 'titre-de-la-page'}`}>
                <Input name="slug" defaultValue={page?.slug ?? ''} placeholder="Généré depuis le titre si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
              </FormField>
              <FormField label="Gabarit" htmlFor="template" error={errors.template}>
                <NativeSelect name="template" defaultValue={page?.template ?? 'default'} options={templates} />
              </FormField>
              <FormField label="Langue" htmlFor="locale" error={errors.locale}>
                <NativeSelect name="locale" defaultValue={page?.locale ?? 'fr'} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }]} />
              </FormField>
              <FormField label="Publication planifiée" htmlFor="scheduledAt" error={errors.scheduledAt} hint="Utilisée par l’action « Planifier ».">
                <Input name="scheduledAt" type="datetime-local" defaultValue={toDateTimeLocal(page?.scheduledAt)} />
              </FormField>
            </div>
            <FileUpload name="coverImageUrl" label="Image de couverture" defaultValue={page?.coverImageUrl} accept="image/*" folder="pages" error={errors.coverImageUrl} hint="Format paysage recommandé (1600 × 900 px)." />
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="showInSitemap" name="showInSitemap" defaultChecked={page?.showInSitemap ?? true} className="mt-0.5" />
              <div>
                <Label htmlFor="showInSitemap">Inclure dans le plan du site</Label>
                <p className="text-xs text-neutral-500">Décochez pour les pages techniques ou temporaires.</p>
              </div>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="seo">
          <EditorSection title="Référencement" description="Titre et description affichés par les moteurs de recherche et les réseaux sociaux.">
            <SeoFields seo={page?.seo} error={errors.seo} />
          </EditorSection>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {page?.id ? 'Enregistrer la page' : 'Créer la page'}
        </SubmitButton>
      </div>
    </form>
  )
}
