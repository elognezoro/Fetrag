'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useId, useState } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { removeCertificateTemplate, saveCertificateTemplate } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

export interface TemplateValue {
  id: string
  name: string
  kind: string
  courseId: string | null
  titleText: string
  bodyText: string
  signatoryName: string
  signatoryTitle: string
  criteria: { minScore?: number; minAttendanceRate?: number; requireCompletion?: boolean }
  validityMonths: number | null
  isDefault: boolean
}

export interface TemplateFormProps {
  template?: TemplateValue
  courses: Array<{ id: string; code: string; title: string }>
  /** Ouvre la boîte de dialogue dès le montage (page dédiée /admin/certificats/nouveau). */
  defaultOpen?: boolean
  /** Redirection après enregistrement ; `{id}` est remplacé par l'identifiant du modèle. */
  successHref?: string
}

/** Modèle de certificat ou d'attestation : textes, signataire, critères d'éligibilité, validité, modèle par défaut. */
export function TemplateForm({ template, courses, defaultOpen = false, successHref }: TemplateFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [state, formAction] = useActionState(saveCertificateTemplate, idleState)
  const id = useId()
  const onSuccess = useCallback(
    (result: { id?: string }) => {
      setOpen(false)
      if (successHref && result.id) router.push(successHref.replace('{id}', result.id))
    },
    [router, successHref],
  )
  useActionFeedback(state, { onSuccess })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {template ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier le modèle ${template.name}`}>
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      ) : (
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Nouveau modèle
        </Button>
      )}
      <DialogContent size="lg" className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? `Modèle « ${template.name} »` : 'Nouveau modèle de certificat'}</DialogTitle>
          <DialogDescription>Le PDF reprend le sceau FETRAG, le numéro séquentiel et le code QR de vérification publique.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {template ? <input type="hidden" name="templateId" value={template.id} /> : null}
          <div className="sm:col-span-2">
            <ActionAlert state={state} />
          </div>
          <FormField label="Nom du modèle" htmlFor={`${id}-name`} required error={errors.name}>
            <Input name="name" defaultValue={template?.name ?? ''} required maxLength={120} placeholder="Attestation programme 2026" />
          </FormField>
          <FormField label="Nature" htmlFor={`${id}-kind`} error={errors.kind}>
            <NativeSelect name="kind" defaultValue={template?.kind ?? 'ATTESTATION'} options={[{ value: 'ATTESTATION', label: 'Attestation de formation' }, { value: 'CERTIFICATE', label: 'Certificat' }]} />
          </FormField>
          <FormField label="Cours concerné" htmlFor={`${id}-course`} error={errors.courseId} hint="Vide = modèle générique." className="sm:col-span-2">
            <NativeSelect name="courseId" defaultValue={template?.courseId ?? ''} options={[{ value: '', label: 'Tous les cours' }, ...courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` }))]} />
          </FormField>
          <FormField label="Titre imprimé" htmlFor={`${id}-title`} required error={errors.titleText} className="sm:col-span-2">
            <Input name="titleText" defaultValue={template?.titleText ?? 'Attestation de formation'} required maxLength={160} />
          </FormField>
          <FormField label="Mention imprimée" htmlFor={`${id}-body`} required error={errors.bodyText} className="sm:col-span-2" hint="Suit le nom du titulaire, précède le titre de la formation.">
            <Textarea name="bodyText" rows={2} defaultValue={template?.bodyText ?? 'a suivi avec succès la formation'} required maxLength={600} />
          </FormField>
          <FormField label="Signataire" htmlFor={`${id}-signatory`} required error={errors.signatoryName}>
            <Input name="signatoryName" defaultValue={template?.signatoryName ?? 'Jocelyn Louis NGOMA'} required maxLength={120} />
          </FormField>
          <FormField label="Qualité du signataire" htmlFor={`${id}-signatoryTitle`} required error={errors.signatoryTitle}>
            <Input name="signatoryTitle" defaultValue={template?.signatoryTitle ?? 'Secrétaire Général de la FETRAG'} required maxLength={160} />
          </FormField>
          <fieldset className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 p-4 sm:col-span-2 sm:grid-cols-3">
            <legend className="px-1 text-sm font-semibold text-navy">Critères d’éligibilité</legend>
            <FormField label="Score minimal (%)" htmlFor={`${id}-minScore`} error={errors['criteria.minScore']}>
              <Input name="minScore" type="number" min={0} max={100} defaultValue={template?.criteria.minScore ?? 60} />
            </FormField>
            <FormField label="Assiduité minimale (%)" htmlFor={`${id}-minAtt`} error={errors['criteria.minAttendanceRate']}>
              <Input name="minAttendanceRate" type="number" min={0} max={100} defaultValue={template?.criteria.minAttendanceRate ?? 0} />
            </FormField>
            <FormField inline label="Formation terminée requise" htmlFor={`${id}-completion`}>
              <Checkbox name="requireCompletion" value="on" defaultChecked={template?.criteria.requireCompletion ?? true} />
            </FormField>
          </fieldset>
          <FormField label="Validité (mois)" htmlFor={`${id}-validity`} error={errors.validityMonths} hint="Vide = sans expiration.">
            <Input name="validityMonths" type="number" min={1} max={120} defaultValue={template?.validityMonths ?? ''} />
          </FormField>
          <FormField inline label="Modèle par défaut" htmlFor={`${id}-default`} hint="Utilisé à la clôture des cohortes si aucun modèle n'est choisi.">
            <Checkbox name="isDefault" value="on" defaultChecked={template?.isDefault ?? false} />
          </FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">
              <Save aria-hidden="true" />
              {template ? 'Enregistrer' : 'Créer le modèle'}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RemoveTemplateButton({ templateId, name, usage, redirectTo }: { templateId: string; name: string; usage: number; redirectTo?: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      action={() => removeCertificateTemplate({ templateId, redirectTo })}
      confirm={{ title: `Supprimer le modèle « ${name} »`, description: usage ? `${usage} certificat(s) y font référence : la suppression sera refusée.` : 'Le modèle sera supprimé définitivement.', confirmLabel: 'Supprimer', destructive: true }}
      aria-label={`Supprimer le modèle ${name}`}
    >
      <Trash2 aria-hidden="true" />
    </ActionButton>
  )
}
