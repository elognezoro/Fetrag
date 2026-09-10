'use client'

import { useActionState } from 'react'
import { FormField, Input, NativeSelect } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/account/types'
import { updateProfileAction, type ProfileField } from '@/server/account/profile'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

export interface ProfileFormProps {
  user: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    jobTitle: string | null
    employer: string | null
    locale: 'fr' | 'en'
  }
}

/** Formulaire d'identité et de coordonnées (profileUpdateSchema côté serveur). */
export function ProfileForm({ user }: ProfileFormProps) {
  const [state, action] = useActionState<ActionState<ProfileField>, FormData>(updateProfileAction, idleState)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormStatus state={state} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Prénom" htmlFor="firstName" required error={errors.firstName}>
          <Input name="firstName" defaultValue={user.firstName ?? ''} autoComplete="given-name" required maxLength={60} />
        </FormField>
        <FormField label="Nom" htmlFor="lastName" required error={errors.lastName}>
          <Input name="lastName" defaultValue={user.lastName ?? ''} autoComplete="family-name" required maxLength={60} />
        </FormField>
      </div>
      <FormField label="Adresse email" htmlFor="email" hint="L’adresse email sert d’identifiant de connexion ; contactez le support pour la modifier.">
        <Input name="email" type="email" value={user.email} readOnly />
      </FormField>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Téléphone" htmlFor="phone" error={errors.phone} hint="Format international ou national (ex. 066 23 00 33).">
          <Input name="phone" type="tel" defaultValue={user.phone ?? ''} autoComplete="tel" inputMode="tel" maxLength={20} />
        </FormField>
        <FormField label="Langue de l’interface" htmlFor="locale" error={errors.locale}>
          <NativeSelect
            name="locale"
            defaultValue={user.locale}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English (bientôt disponible)', disabled: true },
            ]}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Fonction" htmlFor="jobTitle" error={errors.jobTitle} hint="Ex. délégué du personnel, secrétaire de section.">
          <Input name="jobTitle" defaultValue={user.jobTitle ?? ''} autoComplete="organization-title" maxLength={120} />
        </FormField>
        <FormField label="Employeur ou organisation" htmlFor="employer" error={errors.employer}>
          <Input name="employer" defaultValue={user.employer ?? ''} autoComplete="organization" maxLength={160} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="primary" className="w-full sm:w-auto">
          Enregistrer mon profil
        </SubmitButton>
      </div>
    </form>
  )
}
