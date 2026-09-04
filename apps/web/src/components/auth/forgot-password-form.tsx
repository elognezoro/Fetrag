'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { Button, FormField, Input } from '@fetrag/ui'
import { forgotPasswordAction } from '@/lib/actions/auth'
import { initialForgotPasswordState } from '@/lib/actions/auth-types'
import { FormAlert } from './form-alert'

/** Formulaire de demande de réinitialisation (traitée par le support, réponse neutre). */
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialForgotPasswordState)

  if (state.status === 'done') {
    return (
      <div className="space-y-5">
        <FormAlert tone="success">{state.message}</FormAlert>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/connexion">Retour à la connexion</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === 'error' && state.message ? <FormAlert tone="danger">{state.message}</FormAlert> : null}

      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="forgot-website">Site web</label>
        <input id="forgot-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <FormField label="Adresse email du compte" htmlFor="forgot-email" required error={state.fieldErrors?.email}>
        <Input id="forgot-email" name="email" type="email" inputMode="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email)} />
      </FormField>

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={pending} loadingLabel="Envoi en cours" leftIcon={<LifeBuoy aria-hidden="true" />}>
        Envoyer la demande
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
