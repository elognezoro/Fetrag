'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { Award, CheckCircle2, DoorOpen, Lock, Play, XCircle } from 'lucide-react'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormField, NativeSelect, toast } from '@fetrag/ui'
import type { ActionState } from '@/server/staff/action-state'
import { approvePendingEnrollment, closeCohortAndIssue, setCohortStatus } from '@/server/staff/coordination-actions'
import { ActionButton } from './action-button'
import { ActionPayloadSummary } from './action-feedback'

export interface CohortActionsProps {
  cohortId: string
  status: string
  templates: Array<{ id: string; name: string; kind: string; isDefault: boolean }>
  memberCount: number
}

/** Transitions de statut d'une cohorte (ouvrir, démarrer, annuler) et clôture avec émission des certificats. */
export function CohortActions({ cohortId, status, templates, memberCount }: CohortActionsProps) {
  const router = useRouter()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [issue, setIssue] = useState(true)
  const [templateId, setTemplateId] = useState(templates.find((t) => t.isDefault)?.id ?? templates[0]?.id ?? '')
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionState>({ status: 'idle' })

  function close() {
    startTransition(async () => {
      const state = await closeCohortAndIssue({ cohortId, issueCertificates: issue, templateId: templateId || null })
      setResult(state)
      if (state.status === 'success') {
        toast.success(state.message ?? 'Cohorte clôturée')
        router.refresh()
        if (!state.payload) setOpen(false)
      } else if (state.status === 'error') toast.error(state.message)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'PLANNED' ? (
        <ActionButton variant="secondary" action={() => setCohortStatus({ cohortId, status: 'OPEN' })}>
          <DoorOpen aria-hidden="true" />
          Ouvrir les inscriptions
        </ActionButton>
      ) : null}
      {status === 'PLANNED' || status === 'OPEN' ? (
        <ActionButton variant="accent" action={() => setCohortStatus({ cohortId, status: 'RUNNING' })} confirm={{ title: 'Démarrer la formation', description: 'La demande liée passe en « Formation en cours » et les participants sont informés.', confirmLabel: 'Démarrer' }}>
          <Play aria-hidden="true" />
          Démarrer
        </ActionButton>
      ) : null}
      {status === 'RUNNING' || status === 'OPEN' ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<Lock aria-hidden="true" />}>
            Clôturer
          </Button>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Clôturer la cohorte</DialogTitle>
              <DialogDescription>La clôture termine la formation pour les {memberCount} membre(s). Les certificats sont émis pour les participants qui satisfont aux critères du modèle.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <FormField inline label="Émettre les certificats des participants éligibles" htmlFor={`${id}-issue`}>
                <Checkbox checked={issue} onCheckedChange={(checked) => setIssue(checked === true)} />
              </FormField>
              {issue ? (
                <FormField label="Modèle de certificat" htmlFor={`${id}-template`} hint="Modèle par défaut du cours si aucun n'est choisi.">
                  <NativeSelect value={templateId} onChange={(event) => setTemplateId(event.target.value)} options={[{ value: '', label: 'Modèle par défaut' }, ...templates.map((t) => ({ value: t.id, label: `${t.name} (${t.kind === 'CERTIFICATE' ? 'certificat' : 'attestation'})` }))]} />
                </FormField>
              ) : null}
              <ActionPayloadSummary state={result} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                {result.status === 'success' ? 'Fermer' : 'Annuler'}
              </Button>
              {result.status !== 'success' ? (
                <Button type="button" variant="primary" onClick={close} loading={pending}>
                  <Award aria-hidden="true" />
                  Clôturer{issue ? ' et émettre' : ''}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {status !== 'CLOSED' && status !== 'CANCELLED' ? (
        <ActionButton variant="ghost" action={() => setCohortStatus({ cohortId, status: 'CANCELLED' })} confirm={{ title: 'Annuler la cohorte', description: 'Les inscriptions restent visibles mais la cohorte ne sera plus animée.', confirmLabel: 'Annuler la cohorte', destructive: true }}>
          <XCircle aria-hidden="true" />
          Annuler
        </ActionButton>
      ) : null}
      {status === 'CLOSED' ? (
        <ActionButton variant="outline" action={() => setCohortStatus({ cohortId, status: 'RUNNING' })} confirm={{ title: 'Rouvrir la cohorte', description: 'La cohorte repasse en cours pour permettre des corrections ou des sessions complémentaires.', confirmLabel: 'Rouvrir' }}>
          <CheckCircle2 aria-hidden="true" />
          Rouvrir
        </ActionButton>
      ) : null}
    </div>
  )
}

/** Validation d'une inscription en attente (politique APPROVAL). */
export function ApproveEnrollmentButton({ enrollmentId }: { enrollmentId: string }) {
  return (
    <ActionButton variant="secondary" size="sm" action={() => approvePendingEnrollment({ enrollmentId })}>
      <CheckCircle2 aria-hidden="true" />
      Valider
    </ActionButton>
  )
}
