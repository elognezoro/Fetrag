'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button, Checkbox, FormField, Input } from '@fetrag/ui'
import { registerAction } from '@/lib/actions/auth'
import { initialRegisterState } from '@/lib/actions/auth-types'
import { FormAlert } from './form-alert'
import { PasswordInput } from './password-input'

/** Formulaire d'inscription locale (compte apprenant). */
export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialRegisterState)
  const values = state.values ?? {}
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === 'error' && state.message ? <FormAlert tone="danger">{state.message}</FormAlert> : null}

      {/* Champ anti-robot : masqué aux humains, doit rester vide. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="register-website">Site web</label>
        <input id="register-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Prénom" htmlFor="register-firstName" required error={errors.firstName}>
          <Input id="register-firstName" name="firstName" autoComplete="given-name" required defaultValue={values.firstName ?? ''} aria-invalid={Boolean(errors.firstName)} />
        </FormField>
        <FormField label="Nom" htmlFor="register-lastName" required error={errors.lastName}>
          <Input id="register-lastName" name="lastName" autoComplete="family-name" required defaultValue={values.lastName ?? ''} aria-invalid={Boolean(errors.lastName)} />
        </FormField>
      </div>

      <FormField label="Adresse email" htmlFor="register-email" required error={errors.email} hint="Elle servira d'identifiant de connexion.">
        <Input
          id="register-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={values.email ?? ''}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Téléphone" htmlFor="register-phone" error={errors.phone} hint="Facultatif">
          <Input id="register-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={values.phone ?? ''} aria-invalid={Boolean(errors.phone)} placeholder="066 00 00 00" />
        </FormField>
        <FormField label="Organisation ou employeur" htmlFor="register-organizationName" error={errors.organizationName} hint="Facultatif">
          <Input id="register-organizationName" name="organizationName" autoComplete="organization" defaultValue={values.organizationName ?? ''} aria-invalid={Boolean(errors.organizationName)} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mot de passe" htmlFor="register-password" required error={errors.password} hint="8 caractères minimum, une majuscule et un chiffre.">
          <PasswordInput id="register-password" name="password" autoComplete="new-password" required aria-invalid={Boolean(errors.password)} />
        </FormField>
        <FormField label="Confirmer le mot de passe" htmlFor="register-confirmPassword" required error={errors.confirmPassword}>
          <PasswordInput id="register-confirmPassword" name="confirmPassword" autoComplete="new-password" required aria-invalid={Boolean(errors.confirmPassword)} />
        </FormField>
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-start gap-3">
          <Checkbox id="register-acceptTerms" name="acceptTerms" required aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? 'register-acceptTerms-error' : undefined} />
          <label htmlFor="register-acceptTerms" className="text-sm leading-snug text-neutral-700">
            J&apos;accepte les{' '}
            <Link href="/mentions-legales" className="font-semibold text-blue-600 hover:underline">
              conditions d&apos;utilisation
            </Link>{' '}
            et la{' '}
            <Link href="/confidentialite" className="font-semibold text-blue-600 hover:underline">
              politique de confidentialité
            </Link>
            . <span className="text-danger" aria-hidden="true">*</span>
          </label>
        </div>
        {errors.acceptTerms ? (
          <p id="register-acceptTerms-error" className="text-sm font-medium text-danger" role="alert">
            {errors.acceptTerms}
          </p>
        ) : null}
        <div className="flex items-start gap-3">
          <Checkbox id="register-newsletter" name="newsletter" defaultChecked={values.newsletter === true} />
          <label htmlFor="register-newsletter" className="text-sm leading-snug text-neutral-700">
            Je souhaite recevoir la lettre d&apos;information de la FETRAG (actualités, formations, événements).
          </label>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={pending} loadingLabel="Création du compte" leftIcon={<UserPlus aria-hidden="true" />}>
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Déjà inscrit ?{' '}
        <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
