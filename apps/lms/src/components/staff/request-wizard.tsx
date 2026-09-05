'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useId, useMemo, useState, useTransition } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, ClipboardPaste, FileText, Paperclip, Plus, Save, Send, Trash2, Upload } from 'lucide-react'
import { pillars, sessionModeLabels, sessionModes, type PillarName } from '@fetrag/contracts'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Checkbox,
  FormField,
  Input,
  ModuleCard,
  NativeSelect,
  RadioGroup,
  RadioGroupItem,
  Ribbon,
  Textarea,
  cn,
  toast,
  toneAt,
  type Tone,
} from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/staff/action-state'
import type { OrganizationSummary, ProgrammeModule } from '@/server/staff/organizations'
import { parseParticipantLines, wizardFormSchema, wizardStepFields, type WizardFormInput, type WizardFormValues } from '@/server/staff/schemas'
import { removeRequestAttachment, saveTrainingRequestDraft, submitTrainingRequest, uploadRequestAttachment } from '@/server/staff/training-request-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { fmtDate, fmtFileSize } from './format'

/** Engagements de l'organisation et de la FETRAG (chapitre 14, étape 4). */
export const TRAINING_COMMITMENTS: string[] = [
  "L'organisation désigne des participants disponibles sur toute la durée de la formation et facilite leur participation : libération de temps, accès à un poste connecté ou au lieu de formation.",
  "Les participants suivent l'intégralité du parcours, réalisent les évaluations demandées et respectent la charte de la plateforme : assiduité, respect mutuel, confidentialité des situations étudiées.",
  "L'organisation communique des informations exactes sur les participants (identité, contacts, fonction) et signale sans délai tout changement à la coordination FETRAG.",
  "Les contenus pédagogiques restent la propriété de la Fédération des Travailleurs du Gabon : ils ne sont ni reproduits ni diffusés en dehors de la plateforme sans autorisation écrite.",
  "En retour, la FETRAG instruit la demande sous dix jours ouvrés, propose un calendrier et un formateur, puis délivre les attestations aux participants qui satisfont aux critères d'achèvement.",
]

const STEPS = [
  { number: '01', label: 'Organisation', description: 'Personne ressource' },
  { number: '02', label: 'Modules', description: 'Choix du programme' },
  { number: '03', label: 'Participants', description: 'Liste nominative' },
  { number: '04', label: 'Préférences', description: 'Date et modalité' },
  { number: '05', label: 'Engagements', description: 'Charte et pièces' },
  { number: '06', label: 'Récapitulatif', description: 'Transmission' },
] as const

export interface WizardAttachment {
  id: string
  fileName: string
  label: string | null
  size: number
  createdAt: Date | string
}

export interface RequestWizardProps {
  organizations: OrganizationSummary[]
  modules: ProgrammeModule[]
  participantLimit: number
  defaultValues: WizardFormInput
  /** Brouillon repris (ou demande en attente de complément). */
  draft?: { id: string; reference: string; status: string; coordinatorNote: string | null } | null
  attachments?: WizardAttachment[]
}

function pillarOf(value: string | null, index: number): PillarName | Tone {
  return value && (pillars as readonly string[]).includes(value) ? (value as PillarName) : toneAt(index)
}

/**
 * Assistant de demande de formation institutionnelle en six étapes (chapitre 14).
 * Validation par étape (react-hook-form + zod), brouillon enregistré à chaque étape,
 * import rapide des participants, engagements, pièce officielle et récapitulatif.
 */
export function RequestWizard({ organizations, modules, participantLimit, defaultValues, draft = null, attachments = [] }: RequestWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [draftId, setDraftId] = useState<string | null>(draft?.id ?? null)
  const [saving, startSaving] = useTransition()
  const [submitting, startSubmitting] = useTransition()
  const [submitState, setSubmitState] = useState<ActionState>(idleState)
  const [pasteText, setPasteText] = useState('')
  const baseId = useId()

  const form = useForm<WizardFormInput, unknown, WizardFormValues>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues,
    mode: 'onTouched',
  })
  const { register, control, trigger, getValues, watch, setValue, formState } = form
  const { errors } = formState
  const participants = useFieldArray({ control, name: 'participants' })
  const courseIds = watch('courseIds') ?? []
  const organizationId = watch('organizationId')
  const organization = useMemo(() => organizations.find((o) => o.id === organizationId) ?? organizations[0] ?? null, [organizations, organizationId])

  useActionFeedback(submitState)

  // Progression clavier : retour au haut de l'assistant à chaque changement d'étape.
  useEffect(() => {
    document.getElementById(`${baseId}-wizard`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [step, baseId])

  function toDraftInput() {
    const values = getValues()
    return {
      requestId: draftId ?? undefined,
      organizationId: values.organizationId,
      contactName: values.contactName,
      contactRole: values.contactRole,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      courseIds: values.courseIds ?? [],
      participants: (values.participants ?? []).filter((p) => p.fullName && p.fullName.trim().length >= 2),
      preferredStart: values.preferredStart,
      preferredMode: values.preferredMode,
      motivation: values.motivation,
      commitmentsAccepted: values.commitmentsAccepted,
    }
  }

  function saveDraft(onDone?: (id: string | null) => void, options: { quiet?: boolean } = {}) {
    const valid = getValues('contactName')?.trim().length >= 2 && Boolean(getValues('contactEmail'))
    if (!valid) {
      onDone?.(draftId)
      return
    }
    startSaving(async () => {
      const state = await saveTrainingRequestDraft(toDraftInput())
      if (state.status === 'success') {
        const id = state.id ?? draftId
        if (id) setDraftId(id)
        if (!options.quiet) toast.success('Brouillon enregistré')
        onDone?.(id ?? null)
      } else if (state.status === 'error') {
        toast.error(state.message)
        onDone?.(draftId)
      }
    })
  }

  async function next() {
    const fields = wizardStepFields[step] ?? []
    const valid = fields.length ? await trigger(fields as Array<keyof WizardFormInput>) : true
    if (!valid) return
    saveDraft(() => setStep((s) => Math.min(6, s + 1)), { quiet: true })
  }

  function previous() {
    setStep((s) => Math.max(1, s - 1))
  }

  function saveAndQuit() {
    saveDraft((id) => router.push(id ? `/demande-formation/${id}` : '/demande-formation'))
  }

  function toggleModule(id: string) {
    const current = getValues('courseIds') ?? []
    const nextIds = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    setValue('courseIds', nextIds, { shouldValidate: true, shouldDirty: true })
  }

  function importParticipants() {
    const parsed = parseParticipantLines(pasteText)
    if (!parsed.length) {
      toast.error('Aucune ligne exploitable : une personne par ligne, « Nom;email;téléphone;fonction ».')
      return
    }
    const room = participantLimit - participants.fields.length
    const existing = new Set((getValues('participants') ?? []).map((p) => `${p.fullName}|${p.email}`.toLowerCase()))
    const fresh = parsed.filter((p) => !existing.has(`${p.fullName}|${p.email}`.toLowerCase()))
    const toAdd = fresh.slice(0, Math.max(0, room))
    toAdd.forEach((p) => participants.append(p))
    setPasteText('')
    if (fresh.length > toAdd.length) toast.error(`Limite de ${participantLimit} participants atteinte : ${fresh.length - toAdd.length} ligne(s) ignorée(s).`)
    else toast.success(`${toAdd.length} participant(s) ajouté(s)`)
  }

  const onSubmit = form.handleSubmit((values) => {
    startSubmitting(async () => {
      const state = await submitTrainingRequest({ ...values, requestId: draftId ?? undefined, commitmentsAccepted: true })
      setSubmitState(state)
    })
  })

  const canSubmit = Boolean(watch('commitmentsAccepted')) && courseIds.length > 0 && participants.fields.length > 0

  return (
    <div id={`${baseId}-wizard`} className="scroll-mt-28">
      {draft ? (
        <Alert variant={draft.status === 'INFO_REQUESTED' ? 'warning' : 'info'} className="mb-6">
          <AlertTitle>{draft.status === 'INFO_REQUESTED' ? `Complément demandé sur la demande ${draft.reference}` : `Reprise du brouillon ${draft.reference}`}</AlertTitle>
          <AlertDescription>
            {draft.status === 'INFO_REQUESTED' && draft.coordinatorNote ? <p className="mb-1">Message de la coordination : « {draft.coordinatorNote} »</p> : null}
            Vérifiez chaque étape puis transmettez à nouveau la demande. <Link href={`/demande-formation/${draft.id}`}>Voir le suivi</Link>.
          </AlertDescription>
        </Alert>
      ) : null}

      <ol className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Étapes de la demande">
        {STEPS.map((item, index) => {
          const n = index + 1
          const state = n === step ? 'current' : n < step ? 'done' : 'todo'
          const tone = toneAt(index)
          const textTone = tone === 'green' ? 'text-green-700' : tone === 'gold' ? 'text-gold-700' : 'text-blue-600'
          return (
            <li key={item.number}>
              <button
                type="button"
                onClick={() => (state === 'done' ? setStep(n) : undefined)}
                disabled={state === 'todo'}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex w-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                  state === 'current' && 'border-blue-500 bg-blue-50 shadow-soft',
                  state === 'done' && 'border-neutral-200 bg-white hover:border-blue-300',
                  state === 'todo' && 'border-neutral-200 bg-neutral-50 opacity-70',
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className={cn('font-display text-2xl font-semibold leading-none', textTone)}>
                    {item.number}
                  </span>
                  {state === 'done' ? <Check className="size-4 text-green-700" strokeWidth={2.5} aria-label="Étape validée" /> : null}
                </span>
                <span className="text-sm font-semibold text-navy">{item.label}</span>
                <span className="hidden text-xs text-neutral-500 lg:block">{item.description}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-8">
        <div className="mb-6 flex flex-col gap-2 border-b border-neutral-100 pb-5">
          <Ribbon tone={toneAt(step - 1)} size="sm">
            Étape {STEPS[step - 1]?.number} sur 06
          </Ribbon>
          <h2 className="font-display text-2xl font-semibold text-navy">{STEPS[step - 1]?.label}</h2>
        </div>

        {step === 1 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Organisation" htmlFor={`${baseId}-org`} required error={errors.organizationId?.message} className="sm:col-span-2">
              <NativeSelect
                {...register('organizationId')}
                disabled={organizations.length <= 1 || Boolean(draft)}
                options={organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name }))}
              />
            </FormField>
            <FormField label="Personne ressource" htmlFor={`${baseId}-contactName`} required error={errors.contactName?.message} hint="Interlocuteur de la coordination pour cette demande.">
              <Input {...register('contactName')} autoComplete="name" />
            </FormField>
            <FormField label="Fonction" htmlFor={`${baseId}-contactRole`} error={errors.contactRole?.message}>
              <Input {...register('contactRole')} placeholder="Secrétaire général, responsable formation..." />
            </FormField>
            <FormField label="Email" htmlFor={`${baseId}-contactEmail`} required error={errors.contactEmail?.message}>
              <Input type="email" {...register('contactEmail')} autoComplete="email" inputMode="email" />
            </FormField>
            <FormField label="Téléphone" htmlFor={`${baseId}-contactPhone`} error={errors.contactPhone?.message}>
              <Input type="tel" {...register('contactPhone')} autoComplete="tel" inputMode="tel" placeholder="066 00 00 00" />
            </FormField>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-neutral-600">
              Sélectionnez les modules du programme 2026 souhaités pour vos participants. Une cohorte sera constituée par module retenu.
            </p>
            {errors.courseIds?.message ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {errors.courseIds.message}
              </p>
            ) : null}
            <div role="group" aria-label="Modules du programme" className="grid gap-4 md:grid-cols-2">
              {modules.map((module, index) => {
                const selected = courseIds.includes(module.id)
                return (
                  <div
                    key={module.id}
                    role="checkbox"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => toggleModule(module.id)}
                    onKeyDown={(event) => {
                      if (event.key === ' ' || event.key === 'Enter') {
                        event.preventDefault()
                        toggleModule(module.id)
                      }
                    }}
                    className={cn(
                      'relative cursor-pointer rounded-2xl transition-shadow focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                      selected && 'ring-2 ring-blue-500 ring-offset-2',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full border-2 transition-colors',
                        selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-300 bg-white text-transparent',
                      )}
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                    <ModuleCard number={module.number} title={module.title} items={module.items} pillar={pillarOf(module.pillar, index)} duration={`${module.durationHours} h`} className="h-full" />
                  </div>
                )
              })}
            </div>
            {modules.length === 0 ? <p className="text-sm text-neutral-500">Aucun module publié pour le moment.</p> : null}
            <p className="text-sm font-semibold text-navy">{courseIds.length} module(s) sélectionné(s)</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600">
                Désignez nominativement les participants (limite : <strong>{participantLimit}</strong> par demande). Un compte apprenant sera créé pour chaque adresse email inconnue lors de la planification.
              </p>
              <Badge variant={participants.fields.length >= participantLimit ? 'warning' : 'blue'}>
                {participants.fields.length} / {participantLimit}
              </Badge>
            </div>
            {errors.participants && !Array.isArray(errors.participants) ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {errors.participants.message ?? errors.participants.root?.message}
              </p>
            ) : null}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-sm">
                <caption className="sr-only">Participants désignés</caption>
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="eyebrow px-3 py-2 text-left text-[11px] text-neutral-600">Nom complet</th>
                    <th scope="col" className="eyebrow px-3 py-2 text-left text-[11px] text-neutral-600">Email</th>
                    <th scope="col" className="eyebrow px-3 py-2 text-left text-[11px] text-neutral-600">Téléphone</th>
                    <th scope="col" className="eyebrow px-3 py-2 text-left text-[11px] text-neutral-600">Fonction</th>
                    <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {participants.fields.map((field, index) => {
                    const rowErrors = Array.isArray(errors.participants) ? errors.participants[index] : undefined
                    return (
                      <tr key={field.id} className="border-t border-neutral-100 align-top">
                        <td className="p-2">
                          <FormField label={`Nom du participant ${index + 1}`} htmlFor={`${baseId}-p-${index}-name`} error={rowErrors?.fullName?.message} className="[&>label]:sr-only">
                            <Input {...register(`participants.${index}.fullName` as const)} placeholder="Prénom Nom" />
                          </FormField>
                        </td>
                        <td className="p-2">
                          <FormField label={`Email du participant ${index + 1}`} htmlFor={`${baseId}-p-${index}-email`} error={rowErrors?.email?.message} className="[&>label]:sr-only">
                            <Input type="email" {...register(`participants.${index}.email` as const)} placeholder="prenom.nom@exemple.ga" />
                          </FormField>
                        </td>
                        <td className="p-2">
                          <FormField label={`Téléphone du participant ${index + 1}`} htmlFor={`${baseId}-p-${index}-phone`} error={rowErrors?.phone?.message} className="[&>label]:sr-only">
                            <Input type="tel" {...register(`participants.${index}.phone` as const)} placeholder="066 00 00 00" />
                          </FormField>
                        </td>
                        <td className="p-2">
                          <FormField label={`Fonction du participant ${index + 1}`} htmlFor={`${baseId}-p-${index}-job`} error={rowErrors?.jobTitle?.message} className="[&>label]:sr-only">
                            <Input {...register(`participants.${index}.jobTitle` as const)} placeholder="Délégué du personnel" />
                          </FormField>
                        </td>
                        <td className="p-2">
                          <Button type="button" variant="ghost" size="icon" aria-label={`Retirer le participant ${index + 1}`} onClick={() => participants.remove(index)}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {participants.fields.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-sm text-neutral-500">
                        Aucun participant pour le moment : ajoutez une ligne ou collez une liste.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={participants.fields.length >= participantLimit}
                onClick={() => participants.append({ fullName: '', email: '', phone: '', jobTitle: '' })}
                leftIcon={<Plus aria-hidden="true" />}
              >
                Ajouter un participant
              </Button>
            </div>
            <details className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
                <ClipboardPaste className="size-4" aria-hidden="true" />
                Import rapide : coller une liste
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                <FormField label="Une personne par ligne" htmlFor={`${baseId}-paste`} hint="Format : Nom;email;téléphone;fonction (séparateurs ; , ou tabulation).">
                  <Textarea value={pasteText} onChange={(event) => setPasteText(event.target.value)} rows={4} placeholder={'Marie Ondo;marie.ondo@synatep.ga;066 11 22 33;Déléguée du personnel\nPaul Nzé;paul.nze@synatep.ga;;Trésorier'} />
                </FormField>
                <div>
                  <Button type="button" variant="secondary" size="sm" onClick={importParticipants} leftIcon={<Upload aria-hidden="true" />}>
                    Importer les lignes
                  </Button>
                </div>
              </div>
            </details>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Date de démarrage souhaitée" htmlFor={`${baseId}-preferredStart`} error={errors.preferredStart?.message} hint="Indicative : la coordination proposera un calendrier.">
              <Input type="date" {...register('preferredStart')} min={new Date().toISOString().slice(0, 10)} />
            </FormField>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-navy" id={`${baseId}-mode-label`}>
                Modalité souhaitée
              </p>
              <Controller
                control={control}
                name="preferredMode"
                render={({ field }) => (
                  <RadioGroup value={field.value ?? 'HYBRID'} onValueChange={field.onChange} aria-labelledby={`${baseId}-mode-label`}>
                    {sessionModes.map((mode) => (
                      <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 text-sm has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50">
                        <RadioGroupItem value={mode} id={`${baseId}-mode-${mode}`} />
                        <span className="font-medium text-ink">{sessionModeLabels[mode]}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>
            <FormField label="Motivation et attentes" htmlFor={`${baseId}-motivation`} error={errors.motivation?.message} className="sm:col-span-2" hint="Contexte de l'organisation, objectifs, contraintes particulières (3000 caractères au plus).">
              <Textarea {...register('motivation')} rows={6} placeholder="Notre section syndicale renouvelle ses délégués du personnel et souhaite les former au droit du travail et à la négociation collective avant les élections professionnelles..." />
            </FormField>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-navy">Engagements réciproques</h3>
              <ol className="flex flex-col gap-3">
                {TRAINING_COMMITMENTS.map((text, index) => {
                  const tone = toneAt(index)
                  const color = tone === 'green' ? 'text-green-700' : tone === 'gold' ? 'text-gold-700' : 'text-blue-600'
                  return (
                    <li key={index} className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">
                      <span aria-hidden="true" className={cn('font-display text-2xl font-semibold leading-none', color)}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{text}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
            <Controller
              control={control}
              name="commitmentsAccepted"
              render={({ field }) => (
                <FormField inline label="Au nom de mon organisation, j'accepte ces engagements." htmlFor={`${baseId}-commitments`} required error={errors.commitmentsAccepted?.message}>
                  <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormField>
              )}
            />
            <AttachmentsPanel draftId={draftId} attachments={attachments} onNeedDraft={() => saveDraft()} saving={saving} />
          </div>
        ) : null}

        {step === 6 ? (
          <div className="flex flex-col gap-6">
            <ActionAlert state={submitState} />
            <RecapBlock title="Organisation et personne ressource" number="01" tone="blue">
              <p className="font-semibold text-navy">{organization ? (organization.acronym ? `${organization.acronym} - ${organization.name}` : organization.name) : '-'}</p>
              <p>
                {getValues('contactName')} {getValues('contactRole') ? `(${getValues('contactRole')})` : ''} · {getValues('contactEmail')} {getValues('contactPhone') ? `· ${getValues('contactPhone')}` : ''}
              </p>
            </RecapBlock>
            <RecapBlock title="Modules demandés" number="02" tone="green">
              <ul className="flex flex-wrap gap-2">
                {modules
                  .filter((m) => courseIds.includes(m.id))
                  .map((m) => (
                    <li key={m.id}>
                      <Badge variant="blue">
                        {String(m.number).padStart(2, '0')} · {m.title}
                      </Badge>
                    </li>
                  ))}
              </ul>
            </RecapBlock>
            <RecapBlock title={`Participants (${participants.fields.length})`} number="03" tone="gold">
              <ul className="grid gap-1 sm:grid-cols-2">
                {(getValues('participants') ?? []).map((p, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium text-ink">{p.fullName}</span>
                    {p.jobTitle ? <span className="text-neutral-500"> - {p.jobTitle}</span> : null}
                    {p.email ? <span className="block text-xs text-neutral-500">{p.email}</span> : <span className="block text-xs text-gold-800">Sans email : compte non créé automatiquement</span>}
                  </li>
                ))}
              </ul>
            </RecapBlock>
            <RecapBlock title="Préférences" number="04" tone="blue">
              <p>
                Démarrage souhaité : <strong>{getValues('preferredStart') ? fmtDate(getValues('preferredStart')) : 'à convenir'}</strong> · Modalité : <strong>{sessionModeLabels[(getValues('preferredMode') ?? 'HYBRID') as keyof typeof sessionModeLabels]}</strong>
              </p>
              {getValues('motivation') ? <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{getValues('motivation')}</p> : null}
            </RecapBlock>
            <RecapBlock title="Engagements et pièces" number="05" tone="green">
              <p className="flex items-center gap-2">
                <Check className={cn('size-4', watch('commitmentsAccepted') ? 'text-green-700' : 'text-neutral-400')} aria-hidden="true" />
                {watch('commitmentsAccepted') ? 'Engagements acceptés' : 'Engagements non acceptés : revenez à l’étape 05'}
              </p>
              <p className="mt-1 text-sm text-neutral-600">{attachments.length ? `${attachments.length} pièce(s) jointe(s)` : 'Aucune pièce jointe (facultatif)'}</p>
            </RecapBlock>
            <Alert variant="info">
              <AlertTitle>Après transmission</AlertTitle>
              <AlertDescription>
                La coordination FETRAG accuse réception par email, instruit la demande et vous répond depuis cette plateforme : complément, acceptation, proposition de date ou planification des cohortes.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={previous} leftIcon={<ArrowLeft aria-hidden="true" />}>
                Précédent
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={saveAndQuit} loading={saving} leftIcon={<Save aria-hidden="true" />}>
              Enregistrer et quitter
            </Button>
          </div>
          {step < 6 ? (
            <Button type="button" variant="primary" onClick={next} loading={saving} rightIcon={<ArrowRight aria-hidden="true" />}>
              Continuer
            </Button>
          ) : (
            <Button type="button" variant="accent" size="lg" onClick={onSubmit} loading={submitting} disabled={!canSubmit} leftIcon={<Send aria-hidden="true" />}>
              Transmettre à la coordination
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function RecapBlock({ title, number, tone, children }: { title: string; number: string; tone: Tone; children: React.ReactNode }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'gold' ? 'text-gold-700' : 'text-blue-600'
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-200 p-4">
      <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', color)}>
        {number}
      </span>
      <div className="min-w-0 flex-1 text-sm text-neutral-700">
        <h3 className="mb-1 font-display text-base font-semibold text-navy">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function AttachmentsPanel({ draftId, attachments, onNeedDraft, saving }: { draftId: string | null; attachments: WizardAttachment[]; onNeedDraft: () => void; saving: boolean }) {
  const [state, formAction] = useActionState(uploadRequestAttachment, idleState)
  const [removing, startRemoving] = useTransition()
  const router = useRouter()
  const id = useId()
  useActionFeedback(state)

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-navy">
        <Paperclip className="size-5 text-blue-600" aria-hidden="true" />
        Pièce officielle (facultatif)
      </h3>
      <p className="mb-4 text-sm text-neutral-600">Lettre de demande signée, liste des participants visée, mandat : PDF, image ou document Word, 10 Mo au plus.</p>
      {attachments.length ? (
        <ul className="mb-4 flex flex-col gap-2">
          {attachments.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <span className="truncate font-medium text-ink">{file.label || file.fileName}</span>
                <span className="shrink-0 text-xs text-neutral-500">{fmtFileSize(file.size)}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={removing}
                onClick={() =>
                  startRemoving(async () => {
                    const result = await removeRequestAttachment({ attachmentId: file.id, requestId: draftId ?? '' })
                    if (result.status === 'error') toast.error(result.message)
                    else {
                      toast.success('Pièce retirée')
                      router.refresh()
                    }
                  })
                }
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {draftId ? (
        <form action={formAction} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="requestId" value={draftId} />
          <FormField label="Intitulé" htmlFor={`${id}-label`}>
            <Input name="label" placeholder="Lettre de demande signée" maxLength={160} />
          </FormField>
          <FormField label="Fichier" htmlFor={`${id}-file`} required error={state.status === 'error' ? state.fieldErrors?.file : undefined}>
            <Input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png" required />
          </FormField>
          <SubmitButton variant="secondary" pendingLabel="Envoi...">
            <Upload aria-hidden="true" />
            Joindre
          </SubmitButton>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" loading={saving} onClick={onNeedDraft}>
          Enregistrer le brouillon pour joindre une pièce
        </Button>
      )}
    </div>
  )
}
