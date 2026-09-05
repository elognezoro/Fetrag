'use client'

import { useActionState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import { FormField, Input, cn } from '@fetrag/ui'
import { subscribeNewsletterAction, type NewsletterState } from '@/server/public/actions/newsletter'
import { ConsentField } from './consent-field'
import { FormStatus } from './form-status'
import { HoneypotField } from './honeypot-field'
import { SubmitButton } from './submit-button'

const initial: NewsletterState = { status: 'idle' }

interface NewsletterFormProps {
  /** Couleurs pour fond sombre. */
  inverted?: boolean
  className?: string
}

/** Inscription à la lettre d'information (double opt-in) : email, consentement, pot de miel. */
export function NewsletterForm({ inverted = false, className }: NewsletterFormProps) {
  const [state, action] = useActionState(subscribeNewsletterAction, initial)

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-2xl border p-5',
          inverted ? 'border-white/20 bg-white/10 text-white' : 'border-green-200 bg-green-50 text-green-900',
          className,
        )}
      >
        <CheckCircle2 className={cn('mt-0.5 size-5 shrink-0', inverted ? 'text-green-300' : 'text-green-700')} aria-hidden="true" />
        <p className="text-sm leading-relaxed">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className={cn('relative flex flex-col gap-4', inverted && '[&_label]:text-white [&_label_a]:text-gold-300', className)}>
      <HoneypotField id="newsletter-website" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FormField label="Adresse email" htmlFor="newsletter-email" error={state.fieldErrors?.email} required className="flex-1">
          <Input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="prenom.nom@exemple.ga"
            leadingIcon={Mail}
            defaultValue={state.values?.email}
            maxLength={160}
            required
          />
        </FormField>
        <SubmitButton variant={inverted ? 'gold' : 'primary'} size="md" pendingLabel="Inscription en cours" className="shrink-0 sm:mb-0" rightIcon={<Send aria-hidden="true" />}>
          S&apos;abonner
        </SubmitButton>
      </div>
      <ConsentField
        id="newsletter-consent"
        error={state.fieldErrors?.consent}
        label={
          <span className={cn('font-normal leading-6', inverted ? 'text-white/85' : 'text-neutral-700')}>
            J&apos;accepte de recevoir la lettre d&apos;information de la FETRAG. Un email de confirmation me sera envoyé ; je pourrai me désinscrire à tout
            moment.
          </span>
        }
      />
      <FormStatus state={state} withToast={false} />
    </form>
  )
}
