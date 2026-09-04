'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { KeyRound, LogIn, ShieldCheck } from 'lucide-react'
import { Button, FormField, Input, Separator } from '@fetrag/ui'
import { loginAction, oidcSignInAction } from '@/lib/actions/auth'
import { initialLoginState } from '@/lib/actions/auth-types'
import { FormAlert } from './form-alert'
import { PasswordInput } from './password-input'

interface LoginFormProps {
  callbackUrl: string
  /** Nom d'affichage du fournisseur OIDC (null si non configuré). */
  oidcName: string | null
  /** Connexion locale email + mot de passe activée. */
  localAuth: boolean
  /** Message d'erreur transmis par Auth.js via l'URL. */
  initialError?: string | null
  /** Message d'information (compte créé, déconnexion...). */
  notice?: string | null
  /** Liens vers l'inscription et la réinitialisation (absolus pour le LMS). */
  registerHref?: string
  forgotHref?: string
}

/** Formulaire de connexion : email, mot de passe, code MFA à la demande, bouton OIDC optionnel. */
export function LoginForm({
  callbackUrl,
  oidcName,
  localAuth,
  initialError = null,
  notice = null,
  registerHref = '/inscription',
  forgotHref = '/mot-de-passe-oublie',
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialLoginState)
  // Champs contrôlés : React réinitialise le formulaire après une action, les valeurs sont conservées ici.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const codeRef = useRef<HTMLInputElement>(null)
  const showMfa = state.mfaRequired === true

  useEffect(() => {
    if (state.email) setEmail(state.email)
  }, [state.email])

  useEffect(() => {
    if (showMfa) {
      setCode('')
      codeRef.current?.focus()
    }
  }, [showMfa, state])

  const message = state.status === 'error' ? state.message : initialError

  return (
    <div className="space-y-6">
      {notice ? <FormAlert tone="success">{notice}</FormAlert> : null}
      {message ? (
        <FormAlert tone={state.code === 'mfa_required' ? 'info' : 'danger'} id="login-message">
          {message}
        </FormAlert>
      ) : null}

      {localAuth ? (
        <form action={formAction} noValidate className="space-y-5" aria-describedby={message ? 'login-message' : undefined}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <FormField label="Adresse email" htmlFor="login-email" required error={state.fieldErrors?.email}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom.nom@exemple.ga"
            />
          </FormField>

          <FormField label="Mot de passe" htmlFor="login-password" required error={state.fieldErrors?.password}>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormField>

          {showMfa ? (
            <FormField
              label="Code de vérification"
              htmlFor="login-code"
              required
              hint="Code à 6 chiffres de votre application d'authentification, ou l'un de vos codes de secours."
              error={state.fieldErrors?.code}
            >
              <Input
                ref={codeRef}
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={12}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                leadingIcon={ShieldCheck}
                className="tracking-[0.3em]"
                placeholder="123456"
              />
            </FormField>
          ) : null}

          <div className="flex items-center justify-between text-sm">
            <Link href={forgotHref} className="font-semibold text-blue-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={pending}
            loadingLabel="Connexion en cours"
            leftIcon={showMfa ? <KeyRound aria-hidden="true" /> : <LogIn aria-hidden="true" />}
          >
            {showMfa ? 'Vérifier et se connecter' : 'Se connecter'}
          </Button>
        </form>
      ) : (
        <FormAlert tone="info">La connexion par mot de passe est désactivée sur cette plateforme.</FormAlert>
      )}

      {oidcName ? (
        <>
          {localAuth ? <Separator label="ou" /> : null}
          <form action={oidcSignInAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" size="lg" className="w-full" leftIcon={<ShieldCheck aria-hidden="true" />}>
              Se connecter avec {oidcName}
            </Button>
          </form>
        </>
      ) : null}

      <p className="text-center text-sm text-neutral-600">
        Pas encore de compte ?{' '}
        <Link href={registerHref} className="font-semibold text-blue-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
