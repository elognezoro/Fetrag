'use client'

import { useActionState, useId, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { cohortStatuses, cohortStatusLabels, sessionModeLabels, sessionModes } from '@fetrag/contracts'
import { Checkbox, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { createCohort, updateCohort } from '@/server/staff/coordination-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { toInputDate } from './format'

export interface CohortFormCourse {
  id: string
  code: string
  title: string
  status: string
  currentVersionId: string | null
  versions: Array<{ id: string; version: number; label: string | null; isPublished: boolean }>
}

export interface CohortFormValues {
  id: string
  name: string
  courseId: string
  organizationId: string | null
  trainerId: string | null
  mode: string
  capacity: number | null
  startsAt: Date | string | null
  endsAt: Date | string | null
  location: string | null
  description: string | null
  isPrivate: boolean
  status: string
}

export interface CohortFormProps {
  courses: CohortFormCourse[]
  organizations: Array<{ id: string; name: string; acronym: string | null }>
  trainers: Array<{ id: string; label: string; email: string }>
  cohort?: CohortFormValues
  defaultOrganizationId?: string | null
}

/** Création manuelle ou édition d'une cohorte : cours et version, organisation, formateur, dates, capacité, statut. */
export function CohortForm({ courses, organizations, trainers, cohort, defaultOrganizationId }: CohortFormProps) {
  const [state, formAction] = useActionState(cohort ? updateCohort : createCohort, idleState)
  const id = useId()
  const [courseId, setCourseId] = useState(cohort?.courseId ?? courses[0]?.id ?? '')
  const course = useMemo(() => courses.find((c) => c.id === courseId) ?? null, [courses, courseId])
  const publishedVersions = course?.versions.filter((v) => v.isPublished) ?? []
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  return (
    <form action={formAction} className="grid gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:grid-cols-2 sm:p-6">
      {cohort ? <input type="hidden" name="cohortId" value={cohort.id} /> : null}
      <div className="sm:col-span-2">
        <ActionAlert state={state} />
      </div>

      {!cohort ? (
        <>
          <FormField label="Module (cours)" htmlFor={`${id}-course`} required error={errors.courseId} className="sm:col-span-2">
            <NativeSelect
              name="courseId"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
              options={courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}${c.status !== 'PUBLISHED' ? ' (non publié)' : ''}` }))}
            />
          </FormField>
          <FormField label="Version suivie" htmlFor={`${id}-version`} error={errors.courseVersionId} hint="Par défaut, la version courante publiée. La version est figée pour toute la cohorte." className="sm:col-span-2">
            <NativeSelect
              name="courseVersionId"
              defaultValue=""
              options={[
                { value: '', label: course?.currentVersionId ? 'Version courante' : 'Aucune version publiée : créez-en une dans le builder' },
                ...publishedVersions.map((v) => ({ value: v.id, label: `Version ${v.version}${v.label ? ` - ${v.label}` : ''}${v.id === course?.currentVersionId ? ' (courante)' : ''}` })),
              ]}
            />
          </FormField>
        </>
      ) : null}

      <FormField label="Nom de la cohorte" htmlFor={`${id}-name`} error={errors.name} hint={cohort ? undefined : 'Généré automatiquement si vide.'} className="sm:col-span-2">
        <Input name="name" defaultValue={cohort?.name ?? ''} maxLength={160} placeholder="SYNATEP - Négociation collective - 2026" />
      </FormField>
      <FormField label="Organisation bénéficiaire" htmlFor={`${id}-org`} error={errors.organizationId}>
        <NativeSelect name="organizationId" defaultValue={cohort?.organizationId ?? defaultOrganizationId ?? ''} options={[{ value: '', label: 'Aucune (inscriptions individuelles)' }, ...organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name }))]} />
      </FormField>
      <FormField label="Formateur" htmlFor={`${id}-trainer`} error={errors.trainerId}>
        <NativeSelect name="trainerId" defaultValue={cohort?.trainerId ?? ''} options={[{ value: '', label: 'À désigner' }, ...trainers.map((t) => ({ value: t.id, label: `${t.label} (${t.email})` }))]} />
      </FormField>
      <FormField label="Modalité" htmlFor={`${id}-mode`} error={errors.mode}>
        <NativeSelect name="mode" defaultValue={cohort?.mode ?? 'HYBRID'} options={sessionModes.map((m) => ({ value: m, label: sessionModeLabels[m] }))} />
      </FormField>
      <FormField label="Statut" htmlFor={`${id}-status`} error={errors.status}>
        <NativeSelect name="status" defaultValue={cohort?.status ?? 'PLANNED'} options={cohortStatuses.map((s) => ({ value: s, label: cohortStatusLabels[s] }))} />
      </FormField>
      <FormField label="Début" htmlFor={`${id}-start`} error={errors.startsAt}>
        <Input name="startsAt" type="date" defaultValue={toInputDate(cohort?.startsAt)} />
      </FormField>
      <FormField label="Fin" htmlFor={`${id}-end`} error={errors.endsAt}>
        <Input name="endsAt" type="date" defaultValue={toInputDate(cohort?.endsAt)} />
      </FormField>
      <FormField label="Capacité" htmlFor={`${id}-capacity`} error={errors.capacity} hint="Nombre maximal de participants (vide = illimité).">
        <Input name="capacity" type="number" min={1} max={1000} defaultValue={cohort?.capacity ?? ''} />
      </FormField>
      <FormField label="Lieu" htmlFor={`${id}-location`} error={errors.location}>
        <Input name="location" defaultValue={cohort?.location ?? ''} maxLength={200} placeholder="Siège FETRAG, Libreville" />
      </FormField>
      <FormField label="Description" htmlFor={`${id}-desc`} error={errors.description} className="sm:col-span-2">
        <Textarea name="description" rows={3} maxLength={5000} defaultValue={cohort?.description ?? ''} placeholder="Contexte de la cohorte, public, organisation des séances." />
      </FormField>
      <FormField inline label="Cohorte privée (non visible dans le catalogue)" htmlFor={`${id}-private`} className="sm:col-span-2">
        <Checkbox name="isPrivate" value="on" defaultChecked={cohort?.isPrivate ?? true} />
      </FormField>
      <div className="flex justify-end sm:col-span-2">
        <SubmitButton pendingLabel="Enregistrement...">
          <Save aria-hidden="true" />
          {cohort ? 'Enregistrer la cohorte' : 'Créer la cohorte'}
        </SubmitButton>
      </div>
    </form>
  )
}
