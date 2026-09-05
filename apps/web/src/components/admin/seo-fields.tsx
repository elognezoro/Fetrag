import { Checkbox, FormField, Input, Label, Textarea } from '@fetrag/ui'

export interface SeoFieldsProps {
  seo?: { title?: string | null; description?: string | null; canonical?: string | null; ogImageUrl?: string | null; noIndex?: boolean } | null
  error?: string
}

/** Champs SEO communs aux éditeurs (titre, description, canonique, image de partage, noindex). */
export function SeoFields({ seo, error }: SeoFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      <FormField label="Titre SEO" htmlFor="seoTitle" hint="70 caractères maximum ; par défaut le titre du contenu.">
        <Input name="seoTitle" defaultValue={seo?.title ?? ''} maxLength={70} />
      </FormField>
      <FormField label="Méta-description" htmlFor="seoDescription" hint="200 caractères maximum ; par défaut l’extrait.">
        <Textarea name="seoDescription" defaultValue={seo?.description ?? ''} maxLength={200} rows={3} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="URL canonique" htmlFor="seoCanonical" hint="À renseigner seulement si le contenu existe ailleurs.">
          <Input name="seoCanonical" type="url" defaultValue={seo?.canonical ?? ''} placeholder="https://" />
        </FormField>
        <FormField label="Image de partage (Open Graph)" htmlFor="seoOgImageUrl" hint="URL absolue ou chemin ; 1200 × 630 px recommandé.">
          <Input name="seoOgImageUrl" defaultValue={seo?.ogImageUrl ?? ''} placeholder="/brand/… ou https://" />
        </FormField>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <Checkbox id="seoNoIndex" name="seoNoIndex" defaultChecked={seo?.noIndex ?? false} className="mt-0.5" />
        <div>
          <Label htmlFor="seoNoIndex">Exclure des moteurs de recherche (noindex)</Label>
          <p className="text-xs text-neutral-500">Le contenu reste accessible par son adresse mais n’est pas référencé.</p>
        </div>
      </div>
    </div>
  )
}
