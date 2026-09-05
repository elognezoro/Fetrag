'use client'

import { useActionState, useId, useState } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { removeSetting, saveSetting } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

export interface SettingValue {
  key: string
  value: unknown
  description: string | null
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

/** Édition d'un paramètre système (clé, valeur JSON ou texte, description). */
export function SettingForm({ setting }: { setting?: SettingValue }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(saveSetting, idleState)
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {setting ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier le paramètre ${setting.key}`}>
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      ) : (
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Nouveau paramètre
        </Button>
      )}
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{setting ? `Paramètre « ${setting.key} »` : 'Nouveau paramètre'}</DialogTitle>
          <DialogDescription>Nombres, booléens et JSON sont interprétés ; le reste est enregistré comme texte.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <ActionAlert state={state} />
          <FormField label="Clé" htmlFor={`${id}-key`} required error={errors.key} hint="Ex. training.participantLimit">
            <Input name="key" defaultValue={setting?.key ?? ''} required readOnly={Boolean(setting)} maxLength={120} pattern="[A-Za-z0-9_.\-]+" />
          </FormField>
          <FormField label="Valeur" htmlFor={`${id}-value`} required error={errors.value}>
            <Textarea name="value" rows={4} defaultValue={setting ? stringify(setting.value) : ''} required className="font-mono text-xs" />
          </FormField>
          <FormField label="Description" htmlFor={`${id}-desc`} error={errors.description}>
            <Input name="description" defaultValue={setting?.description ?? ''} maxLength={500} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">
              <Save aria-hidden="true" />
              Enregistrer
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RemoveSettingButton({ settingKey }: { settingKey: string }) {
  return (
    <ActionButton variant="ghost" size="sm" action={() => removeSetting({ key: settingKey })} confirm={{ title: `Supprimer « ${settingKey} »`, description: 'Les paramètres requis par la plateforme ne peuvent pas être supprimés.', confirmLabel: 'Supprimer', destructive: true }} aria-label={`Supprimer le paramètre ${settingKey}`}>
      <Trash2 aria-hidden="true" />
    </ActionButton>
  )
}
