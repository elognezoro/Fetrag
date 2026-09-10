'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveCategoryAction, type CategoryField } from '@/server/admin/content-actions'

export interface CategoryFormValues {
  id?: string
  name: string
  slug?: string | null
  description?: string | null
  color?: string | null
  kind?: string
  position?: number
}

export const categoryKindLabels: Record<string, string> = {
  article: 'Actualités',
  resource: 'Ressources',
  course: 'Formations',
  service: 'Services',
  event: 'Événements',
}

export interface CategoryFormDialogProps {
  trigger: ReactNode
  category?: CategoryFormValues
  defaultKind?: string
}

/** Création / édition d'une catégorie dans un dialogue. */
export function CategoryFormDialog({ trigger, category, defaultKind = 'article' }: CategoryFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState<CategoryField>, FormData>(saveCategoryAction, idleState)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.status === 'success') {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{category?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          <DialogDescription>Les catégories classent les actualités, ressources, services, formations et événements.</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
          <FormStatus state={state} withToast={false} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_11rem]">
            <FormField label="Nom" htmlFor="cat-name" required error={errors.name}>
              <Input id="cat-name" name="name" defaultValue={category?.name ?? ''} maxLength={120} required />
            </FormField>
            <FormField label="Domaine" htmlFor="cat-kind" error={errors.kind}>
              <NativeSelect
                id="cat-kind"
                name="kind"
                defaultValue={category?.kind ?? defaultKind}
                options={Object.entries(categoryKindLabels).map(([value, label]) => ({ value, label }))}
              />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="cat-description" error={errors.description}>
            <Textarea id="cat-description" name="description" defaultValue={category?.description ?? ''} rows={2} maxLength={500} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Slug" htmlFor="cat-slug" error={errors.slug} hint="Généré si vide.">
              <Input id="cat-slug" name="slug" defaultValue={category?.slug ?? ''} maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
            </FormField>
            <FormField label="Couleur" htmlFor="cat-color" error={errors.color} hint="Hexadécimal (#RRGGBB).">
              <Input id="cat-color" name="color" type="color" defaultValue={category?.color ?? '#0259C7'} className="h-11 p-1" />
            </FormField>
            <FormField label="Ordre" htmlFor="cat-position" error={errors.position}>
              <Input id="cat-position" name="position" type="number" min={0} step={1} defaultValue={category?.position ?? 0} />
            </FormField>
          </div>
          <div className="flex justify-end">
            <SubmitButton variant="primary" pendingLabel="Enregistrement">
              {category?.id ? 'Enregistrer' : 'Créer la catégorie'}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
