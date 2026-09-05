'use client'

import { useActionState } from 'react'
import { Switch, Label } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/account/types'
import { updateConsentsAction, updateNotificationPreferencesAction } from '@/server/account/profile'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

interface ToggleRowProps {
  name: string
  label: string
  description: string
  defaultChecked: boolean
}

/** Ligne interrupteur + libellé ; l'état est transmis au serveur par un champ caché miroir. */
function ToggleRow({ name, label, description, defaultChecked }: ToggleRowProps) {
  const id = `toggle-${name}`
  return (
    <li className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-base font-semibold text-navy">
          {label}
        </Label>
        <p className="mt-0.5 text-sm text-neutral-600">{description}</p>
      </div>
      <Switch id={id} name={name} defaultChecked={defaultChecked} value="on" className="mt-1 shrink-0" />
    </li>
  )
}

export interface ConsentsFormProps {
  consents: Array<{ kind: string; granted: boolean; title: string; description: string }>
}

/** Consentements facultatifs (lettre d'information, informations formations) avec horodatage côté serveur. */
export function ConsentsForm({ consents }: ConsentsFormProps) {
  const [state, action] = useActionState<ActionState, FormData>(updateConsentsAction, idleState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormStatus state={state} />
      <ul className="divide-y divide-neutral-100">
        {consents.map((consent) => (
          <ToggleRow key={consent.kind} name={`consent-${consent.kind}`} label={consent.title} description={consent.description} defaultChecked={consent.granted} />
        ))}
      </ul>
      <p className="text-xs text-neutral-500">
        Chaque modification est horodatée conformément à notre politique de confidentialité. Les emails essentiels (sécurité, paiements, compte) restent envoyés.
      </p>
      <div className="flex justify-end">
        <SubmitButton variant="outline">Enregistrer mes consentements</SubmitButton>
      </div>
    </form>
  )
}

export interface NotificationPreferencesFormProps {
  categories: Array<{ category: string; label: string; description: string }>
  preferences: Record<string, boolean>
}

/** Préférences d'envoi par email, catégorie par catégorie. */
export function NotificationPreferencesForm({ categories, preferences }: NotificationPreferencesFormProps) {
  const [state, action] = useActionState<ActionState, FormData>(updateNotificationPreferencesAction, idleState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormStatus state={state} />
      <ul className="divide-y divide-neutral-100">
        {categories.map((item) => (
          <li key={item.category} className="contents">
            <input type="hidden" name={`pref-${item.category}-present`} value="1" />
            <ToggleRow name={`pref-${item.category}`} label={item.label} description={item.description} defaultChecked={preferences[item.category] ?? true} />
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <SubmitButton variant="outline">Enregistrer mes préférences</SubmitButton>
      </div>
    </form>
  )
}
