'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormField, IconButton, Input } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/account/types'
import { changePasswordAction, type PasswordField } from '@/server/account/security'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

interface SecretInputProps {
  id: string
  name: string
  autoComplete: string
}

function SecretInput({ id, name, autoComplete }: SecretInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      id={id}
      name={name}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      required
      maxLength={128}
      trailing={<IconButton type="button" size="sm" label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} icon={visible ? EyeOff : Eye} onClick={() => setVisible((v) => !v)} />}
    />
  )
}

/** Changement du mot de passe local (règles : 8 caractères, une majuscule, un chiffre). */
export function PasswordForm() {
  const [state, action] = useActionState<ActionState<PasswordField>, FormData>(changePasswordAction, idleState)
  const errors = state.fieldErrors ?? {}
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormStatus state={state} />
      <FormField label="Mot de passe actuel" htmlFor="currentPassword" required error={errors.currentPassword}>
        <SecretInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </FormField>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Nouveau mot de passe" htmlFor="newPassword" required error={errors.newPassword} hint="8 caractères minimum, dont une majuscule et un chiffre.">
          <SecretInput id="newPassword" name="newPassword" autoComplete="new-password" />
        </FormField>
        <FormField label="Confirmer le nouveau mot de passe" htmlFor="confirmPassword" required error={errors.confirmPassword}>
          <SecretInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
        </FormField>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="primary" pendingLabel="Modification en cours">
          Modifier le mot de passe
        </SubmitButton>
      </div>
    </form>
  )
}
