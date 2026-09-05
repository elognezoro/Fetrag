'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { ArrowRight, Copy, UserPlus } from 'lucide-react'
import { roleLabels, roles } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Button, Checkbox, FormField, Input, Label, NativeSelect, toast } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { createUserAction, type UserCreateField } from '@/server/admin/users-account-actions'
import { EditorSection } from './editor-layout'

export interface UserFormProps {
  organizations: Array<{ value: string; label: string }>
}

function copyToClipboard(value: string) {
  navigator.clipboard
    ?.writeText(value)
    .then(() => toast.success('Copié dans le presse-papiers'))
    .catch(() => toast.error('Copie impossible'))
}

/** Création manuelle d'un compte : identité, organisation, rôle initial ; le mot de passe temporaire est affiché une seule fois. */
export function UserForm({ organizations }: UserFormProps) {
  const [state, action] = useActionState<ActionState<UserCreateField>, FormData>(createUserAction, idleState)
  const errors = state.fieldErrors ?? {}
  const created = state.status === 'success' && state.data && typeof state.data.temporaryPassword === 'string' ? (state.data as { id: string; email: string; temporaryPassword: string }) : null

  if (created) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          <AlertTitle>Compte créé pour {created.email}</AlertTitle>
          <AlertDescription>Le mot de passe temporaire ci-dessous n’est affiché qu’une seule fois. Transmettez-le par un canal sûr ; l’utilisateur devra le modifier depuis « Sécurité ».</AlertDescription>
        </Alert>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-sm text-navy">{created.temporaryPassword}</code>
          <Button type="button" variant="secondary" size="sm" onClick={() => copyToClipboard(created.temporaryPassword)} leftIcon={<Copy aria-hidden="true" />}>
            Copier
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary">
            <Link href={`/admin/utilisateurs/${created.id}`}>
              Ouvrir la fiche
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/admin/utilisateurs/nouveau">Créer un autre compte</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormStatus state={state} />
      <EditorSection title="Identité" description="Le nom complet est composé du prénom et du nom ; l’adresse email sert d’identifiant de connexion." pillar="protection">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Prénom" htmlFor="firstName" required error={errors.firstName}>
            <Input name="firstName" autoComplete="off" maxLength={60} required />
          </FormField>
          <FormField label="Nom" htmlFor="lastName" required error={errors.lastName}>
            <Input name="lastName" autoComplete="off" maxLength={60} required />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Adresse email" htmlFor="email" required error={errors.email}>
            <Input name="email" type="email" autoComplete="off" inputMode="email" required />
          </FormField>
          <FormField label="Téléphone" htmlFor="phone" error={errors.phone} hint="Facultatif ; format international accepté.">
            <Input name="phone" type="tel" autoComplete="off" inputMode="tel" maxLength={20} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Fonction" htmlFor="jobTitle" error={errors.jobTitle}>
            <Input name="jobTitle" maxLength={120} />
          </FormField>
          <FormField label="Employeur" htmlFor="employer" error={errors.employer}>
            <Input name="employer" maxLength={160} />
          </FormField>
        </div>
      </EditorSection>

      <EditorSection title="Rattachement et rôle" description="Le rôle initial est global ; les portées limitées (organisation, cours, cohorte) s’attribuent depuis la fiche." pillar="prevention">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Organisation" htmlFor="organizationId" error={errors.organizationId} hint="Rattache le compte comme membre de l’organisation.">
            <NativeSelect name="organizationId" defaultValue="" options={[{ value: '', label: 'Aucune' }, ...organizations]} />
          </FormField>
          <FormField label="Rôle initial" htmlFor="role" required error={errors.role} hint="Les rôles privilégiés exigent la vérification en deux étapes à la première connexion.">
            <NativeSelect name="role" defaultValue="LEARNER" options={roles.map((role) => ({ value: role, label: roleLabels[role] }))} />
          </FormField>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <Checkbox id="isManager" name="isManager" className="mt-0.5" />
          <div>
            <Label htmlFor="isManager">Responsable de l’organisation</Label>
            <p className="text-xs text-neutral-500">Peut déposer des demandes de formation et consulter les rapports de son organisation (si une organisation est choisie).</p>
          </div>
        </div>
      </EditorSection>

      <div className="flex justify-end">
        <SubmitButton variant="primary" size="lg" pendingLabel="Création du compte" leftIcon={<UserPlus aria-hidden="true" />}>
          Créer le compte
        </SubmitButton>
      </div>
    </form>
  )
}
