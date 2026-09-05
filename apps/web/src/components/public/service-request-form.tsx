'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { ArrowRight, Building2, CreditCard, Mail, Phone, Send, User } from 'lucide-react'
import type { ServiceFormField } from '@fetrag/cms'
import { Alert, AlertDescription, AlertTitle, Button, Checkbox, FormField, Input, NativeSelect, Textarea, cn } from '@fetrag/ui'
import { createServiceRequestAction, type ServiceRequestState } from '@/server/public/actions/service-request'
import { ConsentField } from './consent-field'
import { FormStatus } from './form-status'
import { HoneypotField } from './honeypot-field'
import { SubmitButton } from './submit-button'

interface ServiceRequestFormProps {
  serviceId: string
  slug: string
  serviceName: string
  fields: ServiceFormField[] | null
  isPaid: boolean
  priceLabel: string | null
  /** Visiteur connecté (pré-remplissage) ou null. */
  viewer: { name: string | null; email: string } | null
  className?: string
}

const initial: ServiceRequestState = { status: 'idle' }

function DynamicField({ field, value, error }: { field: ServiceFormField; value: string | undefined; error: string | undefined }) {
  const name = `field.${field.name}`
  const id = `service-${field.name}`
  const common = { name, defaultValue: value ?? '', placeholder: field.placeholder }

  if (field.type === 'checkbox') {
    return (
      <FormField label={field.label} htmlFor={id} error={error} hint={field.help} required={field.required} inline>
        <Checkbox id={id} name={name} value="on" defaultChecked={value === 'on'} invalid={Boolean(error)} />
      </FormField>
    )
  }

  if (field.type === 'file') {
    return (
      <FormField label={field.label} htmlFor={id} error={error} hint={field.help ?? 'Indiquez ici le nom du document : il vous sera demandé après le dépôt de la demande.'} required={field.required}>
        <Input {...common} maxLength={255} />
      </FormField>
    )
  }

  return (
    <FormField label={field.label} htmlFor={id} error={error} hint={field.help} required={field.required}>
      {field.type === 'textarea' ? (
        <Textarea {...common} rows={4} maxLength={5000} />
      ) : field.type === 'select' ? (
        <NativeSelect name={name} defaultValue={value ?? ''} placeholder={field.placeholder ?? 'Sélectionner…'} options={(field.options ?? []).map((o) => ({ value: o, label: o }))} />
      ) : (
        <Input
          {...common}
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          inputMode={field.type === 'phone' ? 'tel' : field.type === 'number' ? 'numeric' : undefined}
          maxLength={500}
        />
      )}
    </FormField>
  )
}

/** Formulaire de demande de service : coordonnées, champs dynamiques du service, consentement, paiement éventuel. */
export function ServiceRequestForm({ serviceId, slug, serviceName, fields, isPaid, priceLabel, viewer, className }: ServiceRequestFormProps) {
  const [state, action] = useActionState(createServiceRequestAction, initial)
  const values = state.values ?? {}
  const errors = state.fieldErrors ?? {}

  if (state.status === 'success') {
    return (
      <div className={cn('flex flex-col gap-5', className)}>
        <FormStatus state={state} successTitle="Demande enregistrée" withToast />
        <div className="flex flex-wrap gap-3">
          {viewer ? (
            <Button asChild variant="primary" size="md">
              <Link href="/espace/demandes">
                Suivre ma demande
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="md">
            <Link href="/services">Voir les autres services</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} noValidate className={cn('relative flex flex-col gap-5', className)}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="slug" value={slug} />
      <HoneypotField id="service-website" />
      <FormStatus state={state} withToast={false} />

      {isPaid ? (
        <Alert variant="warning" icon={CreditCard}>
          <AlertTitle>Service payant{priceLabel ? ` : ${priceLabel}` : ''}</AlertTitle>
          <AlertDescription>
            Après validation du formulaire, vous serez dirigé vers le paiement sécurisé (Mobile Money ou carte). La demande « {serviceName} » sera traitée dès
            confirmation du règlement.
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-1 font-display text-lg font-semibold text-navy sm:col-span-2">Vos coordonnées</legend>
        <FormField label="Nom complet" htmlFor="service-fullName" error={errors.fullName} required>
          <Input name="fullName" autoComplete="name" leadingIcon={User} defaultValue={values.fullName ?? viewer?.name ?? ''} maxLength={120} required />
        </FormField>
        <FormField label="Adresse email" htmlFor="service-email" error={errors.email} required>
          <Input type="email" name="email" inputMode="email" autoComplete="email" leadingIcon={Mail} defaultValue={values.email ?? viewer?.email ?? ''} maxLength={160} required />
        </FormField>
        <FormField label="Téléphone" htmlFor="service-phone" error={errors.phone} hint="Facultatif. Ex. 077 52 27 98">
          <Input type="tel" name="phone" inputMode="tel" autoComplete="tel" leadingIcon={Phone} defaultValue={values.phone ?? ''} maxLength={20} />
        </FormField>
        <FormField label="Organisation" htmlFor="service-organization" error={errors.organization} hint="Syndicat, section ou employeur concerné.">
          <Input name="organization" autoComplete="organization" leadingIcon={Building2} defaultValue={values.organization ?? ''} maxLength={160} />
        </FormField>
      </fieldset>

      {fields && fields.length > 0 ? (
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-1 font-display text-lg font-semibold text-navy sm:col-span-2">Informations sur votre demande</legend>
          {fields.map((field) => (
            <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : undefined}>
              <DynamicField field={field} value={values[`field.${field.name}`]} error={errors[`field.${field.name}`]} />
            </div>
          ))}
        </fieldset>
      ) : null}

      <FormField label="Message complémentaire" htmlFor="service-message" error={errors.message} hint="Décrivez votre situation et vos attentes (4 000 caractères maximum).">
        <Textarea name="message" rows={5} defaultValue={values.message ?? ''} maxLength={4000} />
      </FormField>

      <ConsentField id="service-consent" error={errors.consent} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">Les champs marqués d&apos;un astérisque sont obligatoires.</p>
        <SubmitButton variant="primary" size="lg" pendingLabel="Dépôt de la demande" rightIcon={isPaid ? <CreditCard aria-hidden="true" /> : <Send aria-hidden="true" />}>
          {isPaid ? 'Déposer et payer' : 'Déposer ma demande'}
        </SubmitButton>
      </div>
    </form>
  )
}
