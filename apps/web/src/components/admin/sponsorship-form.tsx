'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'
import { HandHeart } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, FormField, Input, NativeSelect } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { createSponsorshipAction, type SponsorshipField } from '@/server/admin/finance-sponsorship-actions'

export interface SponsorshipFormProps {
  organizations: Array<{ value: string; label: string }>
  courses: Array<{ value: string; label: string }>
  events: Array<{ value: string; label: string }>
}

/** Dialogue de création d'une prise en charge : bénéficiaire par email, organisation, pourcentage, cible et validité. */
export function SponsorshipDialog({ organizations, courses, events }: SponsorshipFormProps) {
  const id = useId()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState<SponsorshipField>, FormData>(createSponsorshipAction, idleState)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.status === 'success') {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  const targets = [
    { value: '', label: 'Toutes les formations et tous les événements' },
    ...courses.map((c) => ({ value: `course:${c.value}`, label: c.label })),
    ...events.map((e) => ({ value: `event:${e.value}`, label: `Événement · ${e.label}` })),
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="primary" size="md" leftIcon={<HandHeart aria-hidden="true" />}>
          Nouvelle prise en charge
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Accorder une prise en charge</DialogTitle>
          <DialogDescription>Le pourcentage est déduit automatiquement du montant à régler par le bénéficiaire. Le bénéficiaire est informé par email.</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <FormStatus state={state} withToast={false} />
          <FormField label="Email du bénéficiaire" htmlFor={`${id}-email`} required error={errors.email} hint="Le compte doit déjà exister.">
            <Input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="off" required />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <FormField label="Libellé" htmlFor={`${id}-label`} required error={errors.label} hint="Ex. « Bourse FETRAG 2026 », « Prise en charge SYNATEP ».">
              <Input id={`${id}-label`} name="label" maxLength={120} required />
            </FormField>
            <FormField label="Pourcentage" htmlFor={`${id}-percent`} required error={errors.percent}>
              <Input id={`${id}-percent`} name="percent" type="number" min={1} max={100} step={1} inputMode="numeric" defaultValue={100} required />
            </FormField>
          </div>
          <FormField label="Organisation financeuse" htmlFor={`${id}-organization`} error={errors.organizationId}>
            <NativeSelect id={`${id}-organization`} name="organizationId" defaultValue="" options={[{ value: '', label: 'Fédération (aucune organisation)' }, ...organizations]} />
          </FormField>
          <FormField label="Portée" htmlFor={`${id}-target`} error={errors.target}>
            <NativeSelect id={`${id}-target`} name="target" defaultValue="" options={targets} />
          </FormField>
          <FormField label="Valable jusqu’au" htmlFor={`${id}-valid`} error={errors.validUntil} hint="Vide = sans limite de durée.">
            <Input id={`${id}-valid`} name="validUntil" type="date" />
          </FormField>
          <div className="flex justify-end">
            <SubmitButton variant="primary" pendingLabel="Enregistrement">
              Accorder
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
