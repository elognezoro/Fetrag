'use client'

import { useActionState, useId, useState } from 'react'
import { CalendarClock, CheckCircle2, CircleHelp, Gavel, Send, XCircle, type LucideIcon } from 'lucide-react'
import { sessionModeLabels, sessionModes, type TrainingRequestStatusName } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Badge, Button, FormField, Input, NativeSelect, Textarea, cn } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { decideTrainingRequest } from '@/server/staff/coordination-actions'
import { ActionAlert, ActionPayloadSummary, SubmitButton, useActionFeedback } from './action-feedback'
import { toInputDate } from './format'

type Decision = 'INFO_REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'SCHEDULED' | 'CANCELLED'

interface DecisionOption {
  value: Decision
  label: string
  description: string
  icon: LucideIcon
  tone: 'blue' | 'green' | 'gold' | 'danger' | 'navy'
}

const OPTIONS: DecisionOption[] = [
  { value: 'INFO_REQUESTED', label: 'Demander un complément', description: "L'organisation reprend l'assistant et retransmet.", icon: CircleHelp, tone: 'gold' },
  { value: 'ACCEPTED', label: 'Accepter', description: 'La demande est retenue : planification à suivre.', icon: CheckCircle2, tone: 'green' },
  { value: 'RESCHEDULED', label: 'Proposer une autre date', description: "Calendrier ou modalité différents soumis à l'organisation.", icon: CalendarClock, tone: 'blue' },
  { value: 'SCHEDULED', label: 'Planifier', description: 'Crée les cohortes, les comptes et les inscriptions.', icon: Gavel, tone: 'navy' },
  { value: 'REJECTED', label: 'Refuser', description: 'Motive le refus auprès de l’organisation.', icon: XCircle, tone: 'danger' },
  { value: 'CANCELLED', label: 'Annuler', description: 'Clôt la demande sans suite.', icon: XCircle, tone: 'danger' },
]

const toneClass: Record<DecisionOption['tone'], string> = {
  blue: 'data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 text-blue-600',
  green: 'data-[active=true]:border-green-500 data-[active=true]:bg-green-50 text-green-700',
  gold: 'data-[active=true]:border-gold-500 data-[active=true]:bg-gold-50 text-gold-700',
  navy: 'data-[active=true]:border-navy data-[active=true]:bg-neutral-100 text-navy',
  danger: 'data-[active=true]:border-danger data-[active=true]:bg-danger-soft text-danger',
}

export interface DecisionPanelProps {
  requestId: string
  reference: string
  status: TrainingRequestStatusName
  allowedTransitions: TrainingRequestStatusName[]
  preferredStart: Date | string | null
  preferredMode: string
  proposedStart: Date | string | null
  proposedMode: string | null
  organizationName: string
  moduleTitles: string[]
  participantCount: number
  participantsWithoutEmail: number
  trainers: Array<{ id: string; label: string; email: string }>
  suggestedTrainerId?: string | null
}

/**
 * Panneau de décision de la coordination (chapitre 14, étapes 6 et 7) : choix de la décision,
 * champs contextuels (complément, date proposée, planification avec formateur) puis Server Action.
 */
export function DecisionPanel(props: DecisionPanelProps) {
  const [state, formAction] = useActionState(decideTrainingRequest, idleState)
  const id = useId()
  const allowed = OPTIONS.filter((o) => props.allowedTransitions.includes(o.value))
  const [decision, setDecision] = useState<Decision | null>(allowed[0]?.value ?? null)
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const active = allowed.find((o) => o.value === decision) ?? null
  const startDefault = toInputDate(props.proposedStart ?? props.preferredStart)
  const modeDefault = props.proposedMode ?? props.preferredMode

  if (!allowed.length) {
    return (
      <Alert variant="info">
        <AlertTitle>Aucune décision possible</AlertTitle>
        <AlertDescription>La demande {props.reference} est dans un état final ou attend une action de l’organisation.</AlertDescription>
      </Alert>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-6">
      <input type="hidden" name="requestId" value={props.requestId} />
      <input type="hidden" name="decision" value={decision ?? ''} />
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-semibold text-navy">Décision de la coordination</h2>
        <p className="text-sm text-neutral-600">
          {props.organizationName} · {props.moduleTitles.length} module(s) · {props.participantCount} participant(s)
          {props.participantsWithoutEmail ? (
            <Badge variant="warning" size="sm" className="ml-2">
              {props.participantsWithoutEmail} sans email
            </Badge>
          ) : null}
        </p>
      </div>
      <ActionAlert state={state} />
      <ActionPayloadSummary state={state} />

      <div role="radiogroup" aria-label="Type de décision" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {allowed.map((option) => {
          const Icon = option.icon
          const isActive = option.value === decision
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              data-active={isActive}
              onClick={() => setDecision(option.value)}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                toneClass[option.tone],
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-navy">{option.label}</span>
                <span className="block text-xs text-neutral-500">{option.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {active ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.value === 'RESCHEDULED' || active.value === 'SCHEDULED' ? (
            <>
              <FormField label={active.value === 'SCHEDULED' ? 'Date de démarrage' : 'Date proposée'} htmlFor={`${id}-start`} required={active.value === 'SCHEDULED'} error={errors.proposedStart} hint={props.preferredStart ? `Souhait de l'organisation : ${toInputDate(props.preferredStart)}` : 'Aucune date souhaitée.'}>
                <Input name="proposedStart" type="date" defaultValue={startDefault} required={active.value === 'SCHEDULED'} />
              </FormField>
              <FormField label="Modalité" htmlFor={`${id}-mode`} error={errors.proposedMode} hint={`Souhait : ${sessionModeLabels[props.preferredMode as keyof typeof sessionModeLabels] ?? props.preferredMode}`}>
                <NativeSelect name="proposedMode" defaultValue={modeDefault} options={sessionModes.map((m) => ({ value: m, label: sessionModeLabels[m] }))} />
              </FormField>
            </>
          ) : null}
          {active.value === 'SCHEDULED' ? (
            <>
              <FormField label="Formateur" htmlFor={`${id}-trainer`} error={errors.trainerId} hint="Formateur affecté à chaque cohorte créée (modifiable ensuite).">
                <NativeSelect name="trainerId" defaultValue={props.suggestedTrainerId ?? ''} options={[{ value: '', label: 'À désigner plus tard' }, ...props.trainers.map((t) => ({ value: t.id, label: `${t.label} (${t.email})` }))]} />
              </FormField>
              <FormField label="Nom de la cohorte" htmlFor={`${id}-cohortName`} error={errors.cohortName} hint="Par défaut : organisation + module + année.">
                <Input name="cohortName" maxLength={160} placeholder={`${props.organizationName} - ${new Date().getFullYear()}`} />
              </FormField>
              <div className="sm:col-span-2">
                <Alert variant="info">
                  <AlertTitle>Ce que déclenche la planification</AlertTitle>
                  <AlertDescription>
                    Une cohorte par module ({props.moduleTitles.join(', ')}), un compte apprenant pour chaque participant dont l’email est inconnu (mot de passe temporaire envoyé par email), les inscriptions et les notifications à l’organisation.
                    {props.participantsWithoutEmail ? ` ${props.participantsWithoutEmail} participant(s) sans email seront ignorés : demandez un complément si nécessaire.` : ''}
                  </AlertDescription>
                </Alert>
              </div>
            </>
          ) : null}
          <FormField
            label={active.value === 'INFO_REQUESTED' ? 'Informations attendues' : active.value === 'REJECTED' ? 'Motif du refus' : 'Commentaire transmis à l’organisation'}
            htmlFor={`${id}-comment`}
            required={active.value === 'INFO_REQUESTED' || active.value === 'REJECTED'}
            error={errors.comment}
            className="sm:col-span-2"
          >
            <Textarea
              name="comment"
              rows={4}
              maxLength={3000}
              required={active.value === 'INFO_REQUESTED' || active.value === 'REJECTED'}
              placeholder={
                active.value === 'INFO_REQUESTED'
                  ? 'Merci de préciser les adresses email des participants et de joindre la lettre de demande signée.'
                  : active.value === 'REJECTED'
                    ? 'Les modules demandés ne sont pas ouverts cette session ; nous vous invitons à renouveler la demande en janvier.'
                    : 'Message accompagnant la décision (facultatif).'
              }
            />
          </FormField>
        </div>
      ) : null}

      <div className="flex justify-end border-t border-neutral-100 pt-4">
        <SubmitButton variant={active?.tone === 'danger' ? 'danger' : 'primary'} pendingLabel="Enregistrement de la décision..." disabled={!decision}>
          <Send aria-hidden="true" />
          {active ? active.label : 'Enregistrer'}
        </SubmitButton>
      </div>
      <p className="text-xs text-neutral-500">Chaque décision est horodatée dans l’historique et notifiée à la personne ressource de l’organisation.</p>
      {props.status === 'INFO_REQUESTED' ? (
        <Button type="button" variant="link" size="sm" className="w-fit" disabled>
          En attente du complément de l’organisation
        </Button>
      ) : null}
    </form>
  )
}
