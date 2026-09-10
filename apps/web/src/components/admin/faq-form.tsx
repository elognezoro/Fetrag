'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, type ReactNode } from 'react'
import { Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, Label, Textarea } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveFaqAction, type FaqField } from '@/server/admin/content-actions'

export interface FaqFormValues {
  id?: string
  question: string
  answer?: string | null
  group?: string
  position?: number
  isActive?: boolean
}

export interface FaqFormDialogProps {
  trigger: ReactNode
  item?: FaqFormValues
  groups?: string[]
}

/** Création / édition d'une question fréquente dans un dialogue. */
export function FaqFormDialog({ trigger, item, groups = [] }: FaqFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState<FaqField>, FormData>(saveFaqAction, idleState)
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
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{item?.id ? 'Modifier la question' : 'Nouvelle question fréquente'}</DialogTitle>
          <DialogDescription>Les questions sont regroupées par thème (general, adhesion, formation, services...) et affichées dans l’ordre choisi.</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
          <FormStatus state={state} withToast={false} />
          <FormField label="Question" htmlFor="faq-question" required error={errors.question}>
            <Input id="faq-question" name="question" defaultValue={item?.question ?? ''} maxLength={300} required />
          </FormField>
          <FormField label="Réponse" htmlFor="faq-answer" required error={errors.answer} hint="Texte simple ou HTML léger (paragraphes, listes, liens) ; assaini à l’enregistrement.">
            <Textarea id="faq-answer" name="answer" defaultValue={item?.answer ?? ''} rows={6} required />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Thème" htmlFor="faq-group" error={errors.group} hint="Minuscules, chiffres et tirets.">
              <Input id="faq-group" name="group" defaultValue={item?.group ?? 'general'} list="faq-groups" pattern="[a-z0-9-]+" maxLength={60} />
              <datalist id="faq-groups">
                {groups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </FormField>
            <FormField label="Ordre" htmlFor="faq-position" error={errors.position}>
              <Input id="faq-position" name="position" type="number" min={0} step={1} defaultValue={item?.position ?? 0} />
            </FormField>
            <div className="flex items-start gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Checkbox id="faq-active" name="isActive" defaultChecked={item?.isActive ?? true} className="mt-0.5" />
              <Label htmlFor="faq-active">Visible</Label>
            </div>
          </div>
          <div className="flex justify-end">
            <SubmitButton variant="primary" pendingLabel="Enregistrement">
              {item?.id ? 'Enregistrer' : 'Ajouter la question'}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
