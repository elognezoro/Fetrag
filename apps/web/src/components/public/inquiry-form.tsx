'use client'

import { useActionState, useState } from 'react'
import { Building2, Mail, Phone, RotateCcw, Send, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, FormField, Input, NativeSelect, Textarea, cn } from '@fetrag/ui'
import { contactAction, membershipAction, partnershipAction, type ContactFormState } from '@/server/public/actions/forms'
import { ConsentField } from './consent-field'
import { FormStatus } from './form-status'
import { HoneypotField } from './honeypot-field'
import { SubmitButton } from './submit-button'

export type InquiryVariant = 'contact' | 'membership' | 'partnership'

interface InquiryFormProps {
  variant: InquiryVariant
  /** Valeurs initiales (visiteur connecté). */
  defaults?: { fullName?: string | null; email?: string | null; phone?: string | null }
  className?: string
}

const actions = { contact: contactAction, membership: membershipAction, partnership: partnershipAction } as const

const interestOptions = [
  { value: 'information', label: 'Obtenir des informations sur la Fédération' },
  { value: 'adhesion', label: 'Adhérer à une organisation affiliée' },
  { value: 'creation-section', label: 'Créer une section syndicale dans mon entreprise' },
  { value: 'orientation', label: 'Être orienté vers un service de la FETRAG' },
]

const partnershipOptions = [
  { value: 'institutionnel', label: 'Partenariat institutionnel' },
  { value: 'formation', label: 'Formation et expertise' },
  { value: 'financier', label: 'Soutien financier ou mécénat' },
  { value: 'media', label: 'Média et communication' },
  { value: 'autre', label: 'Autre proposition' },
]

const submitLabels: Record<InquiryVariant, string> = {
  contact: 'Envoyer le message',
  membership: "Envoyer ma demande d'adhésion",
  partnership: 'Proposer un partenariat',
}

const successTitles: Record<InquiryVariant, string> = {
  contact: 'Message envoyé',
  membership: 'Demande enregistrée',
  partnership: 'Proposition transmise',
}

const initial: ContactFormState = { status: 'idle' }

/**
 * Formulaire public (contact, adhésion, partenariat) piloté par `useActionState` :
 * validation Zod côté serveur, erreurs liées aux champs, pot de miel, consentement.
 */
export function InquiryForm({ variant, defaults, className }: InquiryFormProps) {
  const [formKey, setFormKey] = useState(0)
  const [state, action] = useActionState(actions[variant], initial)
  const values = state.values ?? {}
  const errors = state.fieldErrors ?? {}

  if (state.status === 'success') {
    return (
      <div className={cn('flex flex-col gap-5', className)}>
        <FormStatus state={state} successTitle={successTitles[variant]} withToast />
        <Alert variant="info">
          <AlertTitle>Et maintenant ?</AlertTitle>
          <AlertDescription>
            Un accusé de réception vient de vous être envoyé par email. Conservez la référence ci-dessus pour toute correspondance avec la
            Fédération.
          </AlertDescription>
        </Alert>
        <div>
          <Button type="button" variant="outline" size="md" onClick={() => setFormKey((k) => k + 1)} leftIcon={<RotateCcw aria-hidden="true" />}>
            Envoyer un autre message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form key={formKey} action={action} noValidate className={cn('relative flex flex-col gap-5', className)}>
      <HoneypotField id={`${variant}-website`} />
      <FormStatus state={state} withToast={false} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nom complet" htmlFor={`${variant}-fullName`} error={errors.fullName} required>
          <Input name="fullName" autoComplete="name" leadingIcon={User} defaultValue={values.fullName ?? defaults?.fullName ?? ''} maxLength={120} required />
        </FormField>
        <FormField label="Adresse email" htmlFor={`${variant}-email`} error={errors.email} required>
          <Input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            leadingIcon={Mail}
            defaultValue={values.email ?? defaults?.email ?? ''}
            maxLength={160}
            required
          />
        </FormField>
        <FormField label="Téléphone" htmlFor={`${variant}-phone`} error={errors.phone} hint="Facultatif. Ex. 066 23 00 33">
          <Input type="tel" name="phone" inputMode="tel" autoComplete="tel" leadingIcon={Phone} defaultValue={values.phone ?? defaults?.phone ?? ''} maxLength={20} />
        </FormField>
        <FormField
          label={variant === 'partnership' ? 'Organisation ou entreprise' : 'Organisation ou employeur'}
          htmlFor={`${variant}-organization`}
          error={errors.organization}
          required={variant === 'partnership'}
        >
          <Input name="organization" autoComplete="organization" leadingIcon={Building2} defaultValue={values.organization ?? ''} maxLength={160} />
        </FormField>
      </div>

      {variant === 'membership' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Votre démarche" htmlFor="membership-interest" error={errors.interest} required>
            <NativeSelect name="interest" options={interestOptions} defaultValue={values.interest || 'information'} />
          </FormField>
          <FormField label="Secteur d'activité" htmlFor="membership-sector" error={errors.sector} hint="Ex. Énergie, transport, santé, éducation…">
            <Input name="sector" defaultValue={values.sector ?? ''} maxLength={120} />
          </FormField>
          <FormField label="Employeur" htmlFor="membership-employer" error={errors.employer}>
            <Input name="employer" defaultValue={values.employer ?? ''} maxLength={160} />
          </FormField>
          <FormField label="Fonction occupée" htmlFor="membership-jobTitle" error={errors.jobTitle}>
            <Input name="jobTitle" autoComplete="organization-title" defaultValue={values.jobTitle ?? ''} maxLength={120} />
          </FormField>
        </div>
      ) : null}

      {variant === 'partnership' ? (
        <FormField label="Type de partenariat" htmlFor="partnership-partnershipType" error={errors.partnershipType} required>
          <NativeSelect name="partnershipType" options={partnershipOptions} defaultValue={values.partnershipType || 'autre'} />
        </FormField>
      ) : null}

      {variant === 'contact' ? (
        <FormField label="Objet" htmlFor="contact-subject" error={errors.subject} hint="Facultatif : résumez votre demande en quelques mots.">
          <Input name="subject" defaultValue={values.subject ?? ''} maxLength={160} />
        </FormField>
      ) : null}

      <FormField
        label={variant === 'partnership' ? 'Votre proposition' : 'Votre message'}
        htmlFor={`${variant}-message`}
        error={errors.message}
        required
        hint="10 caractères minimum. Ne transmettez pas de données sensibles (mot de passe, numéro de carte…)."
      >
        <Textarea name="message" rows={6} defaultValue={values.message ?? ''} maxLength={4000} required />
      </FormField>

      <ConsentField id={`${variant}-consent`} error={errors.consent} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">Les champs marqués d&apos;un astérisque sont obligatoires.</p>
        <SubmitButton variant="primary" size="lg" rightIcon={<Send aria-hidden="true" />}>
          {submitLabels[variant]}
        </SubmitButton>
      </div>
    </form>
  )
}
