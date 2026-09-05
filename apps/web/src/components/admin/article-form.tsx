'use client'

import { useActionState, useState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, FormField, Input, Label, NativeSelect, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveArticleAction, type ArticleField } from '@/server/admin/content-actions'
import { EditorSection } from './editor-layout'
import { FileUpload } from './file-upload'
import { previewSlug, toDateTimeLocal } from './form-utils'
import { RichTextEditor } from './rich-text-editor'
import { SeoFields } from './seo-fields'

export interface ArticleFormValues {
  id?: string
  title: string
  slug?: string | null
  excerpt?: string | null
  content?: string | null
  coverImageUrl?: string | null
  coverAlt?: string | null
  categoryId?: string | null
  isCommunique?: boolean
  isFeatured?: boolean
  locale?: 'fr' | 'en'
  tags?: string[]
  scheduledAt?: string | null
  seo?: { title?: string | null; description?: string | null; canonical?: string | null; ogImageUrl?: string | null; noIndex?: boolean } | null
}

export interface ArticleFormProps {
  article?: ArticleFormValues
  categories: Array<{ value: string; label: string }>
}

/** Éditeur d'actualité ou de communiqué. */
export function ArticleForm({ article, categories }: ArticleFormProps) {
  const [state, action] = useActionState<ActionState<ArticleField>, FormData>(saveArticleAction, idleState)
  const errors = state.fieldErrors ?? {}
  const [title, setTitle] = useState(article?.title ?? '')

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {article?.id ? <input type="hidden" name="id" value={article.id} /> : null}
      <FormStatus state={state} />
      <Tabs defaultValue="contenu">
        <TabsList variant="underline" className="mb-4">
          <TabsTrigger value="contenu">Contenu</TabsTrigger>
          <TabsTrigger value="reglages">Classement et image</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="contenu">
          <EditorSection title="Rédaction" pillar="protection">
            <FormField label="Titre" htmlFor="title" required error={errors.title}>
              <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
            </FormField>
            <FormField label="Chapô" htmlFor="excerpt" error={errors.excerpt} hint="Deux ou trois phrases qui résument l’information ; générées depuis le texte si vide.">
              <Textarea name="excerpt" defaultValue={article?.excerpt ?? ''} maxLength={500} rows={3} />
            </FormField>
            <RichTextEditor name="content" label="Texte de l’actualité" defaultValue={article?.content ?? ''} error={errors.content} folder="actualites" required />
          </EditorSection>
        </TabsContent>
        <TabsContent value="reglages">
          <EditorSection title="Classement, image et publication" pillar="prevention">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Catégorie" htmlFor="categoryId" error={errors.categoryId}>
                <NativeSelect name="categoryId" defaultValue={article?.categoryId ?? 'none'} options={[{ value: 'none', label: 'Sans catégorie' }, ...categories]} />
              </FormField>
              <FormField label="Mots-clés" htmlFor="tags" error={errors.tags} hint="Séparés par des virgules (20 maximum).">
                <Input name="tags" defaultValue={article?.tags?.join(', ') ?? ''} placeholder="dialogue social, formation, droit du travail" />
              </FormField>
              <FormField label="Slug (adresse)" htmlFor="slug" error={errors.slug} hint={`Aperçu : /actualites/${previewSlug(title) || 'titre'}`}>
                <Input name="slug" defaultValue={article?.slug ?? ''} placeholder="Généré depuis le titre si vide" maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
              </FormField>
              <FormField label="Langue" htmlFor="locale">
                <NativeSelect name="locale" defaultValue={article?.locale ?? 'fr'} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }]} />
              </FormField>
              <FormField label="Publication planifiée" htmlFor="scheduledAt" error={errors.scheduledAt} hint="Utilisée par l’action « Planifier ».">
                <Input name="scheduledAt" type="datetime-local" defaultValue={toDateTimeLocal(article?.scheduledAt)} />
              </FormField>
            </div>
            <FileUpload name="coverImageUrl" label="Image de couverture" defaultValue={article?.coverImageUrl} accept="image/*" folder="actualites" error={errors.coverImageUrl} hint="1600 × 900 px recommandé ; l’image officielle doit conserver sa pastille blanche." />
            <FormField label="Texte alternatif de l’image" htmlFor="coverAlt" error={errors.coverAlt} hint="Obligatoire dès qu’une image est fournie (accessibilité).">
              <Input name="coverAlt" defaultValue={article?.coverAlt ?? ''} maxLength={200} />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Checkbox id="isCommunique" name="isCommunique" defaultChecked={article?.isCommunique ?? false} className="mt-0.5" />
                <div>
                  <Label htmlFor="isCommunique">Communiqué officiel</Label>
                  <p className="text-xs text-neutral-500">Mis en avant dans la rubrique « Communiqués ».</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Checkbox id="isFeatured" name="isFeatured" defaultChecked={article?.isFeatured ?? false} className="mt-0.5" />
                <div>
                  <Label htmlFor="isFeatured">À la une</Label>
                  <p className="text-xs text-neutral-500">Affiché sur la page d’accueil (étoile or).</p>
                </div>
              </div>
            </div>
          </EditorSection>
        </TabsContent>
        <TabsContent value="seo">
          <EditorSection title="Référencement">
            <SeoFields seo={article?.seo} error={errors.seo} />
          </EditorSection>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          {article?.id ? 'Enregistrer l’actualité' : 'Créer l’actualité'}
        </SubmitButton>
      </div>
    </form>
  )
}
