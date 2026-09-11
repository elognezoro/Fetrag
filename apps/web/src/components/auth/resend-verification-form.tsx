'use client'

import { useActionState } from 'react'
import { MailCheck } from 'lucide-react'
import { Button, FormField, Input, type ButtonProps } from '@fetrag/ui'
import { resendVerificationAction } from '@/lib/actions/auth'
import { initialResendVerificationState } from '@/lib/actions/auth-types'
import { FormAlert } from './form-alert'

interface ResendVerificationFormProps {
  /** Adresse connue (inscription, tentative de connexion) : transmise en champ caché. */
  email?: string
  /** Affiche un champ email modifiable (lien expiré, adresse inconnue). */
  editable?: boolean
  /** Libellé du bouton. */
  label?: string
  /** Préfixe des identifiants de champ (plusieurs formulaires possibles sur une page). */
  idPrefix?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

/**
 * Demande un nouveau lien de confirmation d'adresse. La réponse est toujours neutre
 * et le formulaire disparaît après l'envoi pour éviter les demandes répétées.
 */
export function ResendVerificationForm({
  email = '',
  editable = false,
  label = 'Renvoyer le lien',
  idPrefix = 'resend',
  variant = 'outline',
  size = 'lg',
  className,
}: ResendVerificationFormProps) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initialResendVerificationState)

  if (state.status === 'done') {
    return <FormAlert tone="success" className={className}>{state.message}</FormAlert>
  }

  return (
    <form action={formAction} noValidate className={className ?? 'space-y-4'}>
      {state.status === 'error' && state.message && !editable ? <FormAlert tone="danger">{state.message}</FormAlert> : null}

      {editable ? (
        <>
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`${idPrefix}-website`}>Site web</label>
            <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <FormField label="Adresse email du compte" htmlFor={`${idPrefix}-email`} required error={state.fieldErrors?.email}>
            <Input
              id={`${idPrefix}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              defaultValue={email}
              placeholder="prenom.nom@exemple.ga"
            />
          </FormField>
        </>
      ) : (
        <input type="hidden" name="email" value={email} />
      )}

      <Button
        type="submit"
        variant={variant}
        size={size}
        className="w-full"
        loading={pending}
        loadingLabel="Envoi en cours"
        leftIcon={<MailCheck aria-hidden="true" />}
      >
        {label}
      </Button>
    </form>
  )
}
