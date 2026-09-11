'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Check, Circle, KeyRound } from 'lucide-react'
import { Button, FormField, cn } from '@fetrag/ui'
import { resetPasswordAction } from '@/lib/actions/auth'
import { initialResetPasswordState, passwordRules } from '@/lib/actions/auth-types'
import { FormAlert } from './form-alert'
import { PasswordInput } from './password-input'

interface ResetPasswordFormProps {
  /** Jeton brut reçu par email (transmis en champ caché, consommé côté serveur). */
  token: string
}

/** Indicateur en direct des règles du mot de passe et de la correspondance des deux saisies. */
function PasswordRules({ password, confirmPassword }: { password: string; confirmPassword: string }) {
  const rules = [
    ...passwordRules.map((rule) => ({ id: rule.id, label: rule.label, ok: rule.test(password) })),
    { id: 'match', label: 'Les deux saisies sont identiques', ok: password.length > 0 && password === confirmPassword },
  ]
  return (
    <ul className="grid gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm sm:grid-cols-2" aria-live="polite" aria-label="Règles du mot de passe">
      {rules.map((rule) => (
        <li key={rule.id} className={cn('flex items-center gap-2', rule.ok ? 'text-green-800' : 'text-neutral-600')}>
          {rule.ok ? <Check className="size-4 shrink-0" aria-hidden="true" /> : <Circle className="size-3.5 shrink-0 text-neutral-400" aria-hidden="true" />}
          <span>
            {rule.label}
            <span className="sr-only">{rule.ok ? ' : respectée' : ' : à respecter'}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Formulaire de nouveau mot de passe (lien de réinitialisation). */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialResetPasswordState)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const errors = state.fieldErrors ?? {}

  if (state.status === 'error' && state.code === 'invalid_token') {
    return (
      <div className="space-y-5">
        <FormAlert tone="danger">{state.message}</FormAlert>
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
        </Button>
        <p className="text-center text-sm text-neutral-600">
          <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === 'error' && state.message ? <FormAlert tone="danger">{state.message}</FormAlert> : null}

      <input type="hidden" name="token" value={token} />

      <FormField label="Nouveau mot de passe" htmlFor="reset-password" required error={errors.password}>
        <PasswordInput
          id="reset-password"
          name="password"
          autoComplete="new-password"
          required
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>

      <FormField label="Confirmer le nouveau mot de passe" htmlFor="reset-confirmPassword" required error={errors.confirmPassword}>
        <PasswordInput
          id="reset-confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          maxLength={128}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </FormField>

      <PasswordRules password={password} confirmPassword={confirmPassword} />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
        loadingLabel="Enregistrement en cours"
        leftIcon={<KeyRound aria-hidden="true" />}
      >
        Définir le nouveau mot de passe
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
