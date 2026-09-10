'use client'

import { useActionState, useId, useState } from 'react'
import { Save } from 'lucide-react'
import { courseLevels, courseLevelLabels, courseModalities, courseModalityLabels, enrollmentPolicies, pillarLabels, pillars } from '@fetrag/contracts'
import { Checkbox, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { createCourse, updateCourse } from '@/server/staff/admin-course-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'

const enrollmentPolicyLabels: Record<(typeof enrollmentPolicies)[number], string> = {
  SELF: 'Inscription libre',
  APPROVAL: 'Sur validation de la coordination',
  ORGANIZATION: 'Réservée aux organisations (demande institutionnelle)',
  PAID: 'Payante (commande requise)',
}

export interface CourseFormValues {
  id: string
  title: string
  code: string
  slug: string
  subtitle: string | null
  summary: string | null
  description: string
  objectives: string[]
  prerequisitesText: string | null
  audience: string | null
  categoryId: string | null
  modality: string
  level: string
  language: string
  durationHours: number
  pillar: string | null
  coverImageUrl: string | null
  color: string | null
  enrollmentPolicy: string
  isFree: boolean
  priceAmount: number | null
  memberPriceAmount: number | null
  currency: string
  capacity: number | null
  isFeatured: boolean
  position: number
  trainerIds: string[]
}

export interface CourseFormProps {
  course?: CourseFormValues
  categories: Array<{ id: string; name: string; kind: string }>
  trainers: Array<{ id: string; label: string; email: string }>
}

/** Fiche descriptive d'un cours (module du programme) : identité, pédagogie, accès, tarification, formateurs. */
export function CourseForm({ course, categories, trainers }: CourseFormProps) {
  const [state, formAction] = useActionState(course ? updateCourse : createCourse, idleState)
  const id = useId()
  const [isFree, setIsFree] = useState(course?.isFree ?? true)
  useActionFeedback(state)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {course ? <input type="hidden" name="courseId" value={course.id} /> : null}
      <ActionAlert state={state} />

      <Section number="01" title="Identité du module">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Titre" htmlFor={`${id}-title`} required error={errors.title} className="sm:col-span-2">
            <Input name="title" defaultValue={course?.title ?? ''} required maxLength={200} placeholder="Négociation Collective et Dialogue Social" />
          </FormField>
          <FormField label="Code" htmlFor={`${id}-code`} required error={errors.code} hint="Identifiant court et unique (ex. FETRAG-M03).">
            <Input name="code" defaultValue={course?.code ?? ''} required maxLength={40} placeholder="FETRAG-M03" />
          </FormField>
          <FormField label="Adresse (slug)" htmlFor={`${id}-slug`} error={errors.slug} hint="Généré depuis le titre si vide.">
            <Input name="slug" defaultValue={course?.slug ?? ''} maxLength={120} placeholder="negociation-collective" />
          </FormField>
          <FormField label="Sous-titre" htmlFor={`${id}-subtitle`} error={errors.subtitle} className="sm:col-span-2">
            <Input name="subtitle" defaultValue={course?.subtitle ?? ''} maxLength={200} placeholder="Techniques, conventions collectives, médiation" />
          </FormField>
          <FormField label="Résumé (catalogue)" htmlFor={`${id}-summary`} error={errors.summary} className="sm:col-span-2" hint="600 caractères au plus, affiché dans le catalogue et sur fetrag.ga.">
            <Textarea name="summary" rows={3} maxLength={600} defaultValue={course?.summary ?? ''} />
          </FormField>
          <FormField label="Numéro dans le programme" htmlFor={`${id}-position`} error={errors.position} hint="01 à 10 pour le programme 2026.">
            <Input name="position" type="number" min={0} max={99} defaultValue={course?.position ?? 0} />
          </FormField>
          <FormField label="Pilier du triptyque" htmlFor={`${id}-pillar`} error={errors.pillar}>
            <NativeSelect name="pillar" defaultValue={course?.pillar ?? ''} options={[{ value: '', label: 'Aucun' }, ...pillars.map((p) => ({ value: p, label: pillarLabels[p] }))]} />
          </FormField>
          <FormField label="Catégorie" htmlFor={`${id}-category`} error={errors.categoryId}>
            <NativeSelect name="categoryId" defaultValue={course?.categoryId ?? ''} options={[{ value: '', label: 'Aucune' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
          </FormField>
          <FormField label="Image de couverture (URL)" htmlFor={`${id}-cover`} error={errors.coverImageUrl}>
            <Input name="coverImageUrl" type="url" defaultValue={course?.coverImageUrl ?? ''} placeholder="https://" />
          </FormField>
          <FormField inline label="Mettre en avant (à la une)" htmlFor={`${id}-featured`}>
            <Checkbox name="isFeatured" value="on" defaultChecked={course?.isFeatured ?? false} />
          </FormField>
        </div>
      </Section>

      <Section number="02" title="Pédagogie" tone="green">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Description détaillée" htmlFor={`${id}-description`} error={errors.description} className="sm:col-span-2" hint="Présentation complète (HTML simple accepté).">
            <Textarea name="description" rows={8} defaultValue={course?.description ?? ''} />
          </FormField>
          <FormField label="Objectifs pédagogiques" htmlFor={`${id}-objectives`} error={errors.objectives} className="sm:col-span-2" hint="Un objectif par ligne (20 au plus).">
            <Textarea name="objectives" rows={4} defaultValue={course?.objectives.join('\n') ?? ''} placeholder={'Préparer un cahier de revendications\nConduire une séance de négociation\nRédiger un procès-verbal de conciliation'} />
          </FormField>
          <FormField label="Prérequis" htmlFor={`${id}-prereq`} error={errors.prerequisitesText}>
            <Textarea name="prerequisitesText" rows={3} maxLength={2000} defaultValue={course?.prerequisitesText ?? ''} />
          </FormField>
          <FormField label="Public visé" htmlFor={`${id}-audience`} error={errors.audience}>
            <Textarea name="audience" rows={3} maxLength={600} defaultValue={course?.audience ?? ''} placeholder="Délégués du personnel, responsables de sections syndicales, membres de bureaux fédéraux." />
          </FormField>
          <FormField label="Modalité" htmlFor={`${id}-modality`} error={errors.modality}>
            <NativeSelect name="modality" defaultValue={course?.modality ?? 'HYBRID'} options={courseModalities.map((m) => ({ value: m, label: courseModalityLabels[m] }))} />
          </FormField>
          <FormField label="Niveau" htmlFor={`${id}-level`} error={errors.level}>
            <NativeSelect name="level" defaultValue={course?.level ?? 'INITIATION'} options={courseLevels.map((l) => ({ value: l, label: courseLevelLabels[l] }))} />
          </FormField>
          <FormField label="Durée (heures)" htmlFor={`${id}-duration`} required error={errors.durationHours}>
            <Input name="durationHours" type="number" min={1} max={500} defaultValue={course?.durationHours ?? 12} required />
          </FormField>
          <FormField label="Langue" htmlFor={`${id}-language`} error={errors.language}>
            <NativeSelect name="language" defaultValue={course?.language ?? 'fr'} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }]} />
          </FormField>
        </div>
      </Section>

      <Section number="03" title="Accès et tarification" tone="gold">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Politique d'inscription" htmlFor={`${id}-policy`} error={errors.enrollmentPolicy} className="sm:col-span-2">
            <NativeSelect name="enrollmentPolicy" defaultValue={course?.enrollmentPolicy ?? 'SELF'} options={enrollmentPolicies.map((p) => ({ value: p, label: enrollmentPolicyLabels[p] }))} />
          </FormField>
          <FormField inline label="Formation gratuite" htmlFor={`${id}-free`}>
            <Checkbox name="isFree" value="on" checked={isFree} onCheckedChange={(checked) => setIsFree(checked === true)} />
          </FormField>
          <FormField label="Capacité" htmlFor={`${id}-capacity`} error={errors.capacity} hint="Nombre maximal d'inscrits (vide = illimité).">
            <Input name="capacity" type="number" min={1} defaultValue={course?.capacity ?? ''} />
          </FormField>
          {!isFree ? (
            <>
              <FormField label="Tarif standard (FCFA)" htmlFor={`${id}-price`} error={errors.priceAmount}>
                <Input name="priceAmount" type="number" min={0} step={1} defaultValue={course?.priceAmount ?? ''} />
              </FormField>
              <FormField label="Tarif membre (FCFA)" htmlFor={`${id}-memberPrice`} error={errors.memberPriceAmount}>
                <Input name="memberPriceAmount" type="number" min={0} step={1} defaultValue={course?.memberPriceAmount ?? ''} />
              </FormField>
            </>
          ) : null}
          <input type="hidden" name="currency" value={course?.currency ?? 'XAF'} />
        </div>
      </Section>

      <Section number="04" title="Formateurs du cours" tone="navy">
        <p className="mb-3 text-sm text-neutral-600">Les formateurs du cours peuvent enseigner toutes ses cohortes, corriger et alimenter la banque de questions.</p>
        {trainers.length ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {trainers.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 text-sm hover:border-blue-300">
                  <Checkbox name="trainerIds" value={t.id} defaultChecked={course?.trainerIds.includes(t.id) ?? false} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{t.label}</span>
                    <span className="block truncate text-xs text-neutral-500">{t.email}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Aucun compte formateur : attribuez le rôle « Formateur » depuis Utilisateurs et rôles.</p>
        )}
      </Section>

      <div className="flex justify-end border-t border-neutral-100 pt-4">
        <SubmitButton pendingLabel="Enregistrement...">
          <Save aria-hidden="true" />
          {course ? 'Enregistrer la fiche' : 'Créer le cours'}
        </SubmitButton>
      </div>
    </form>
  )
}

function Section({ number, title, tone = 'blue', children }: { number: string; title: string; tone?: 'blue' | 'green' | 'gold' | 'navy'; children: React.ReactNode }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'gold' ? 'text-gold-700' : tone === 'navy' ? 'text-navy' : 'text-blue-600'
  return (
    <fieldset className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-6">
      <legend className="flex items-center gap-3 px-2">
        <span aria-hidden="true" className={`font-display text-2xl font-semibold leading-none ${color}`}>
          {number}
        </span>
        <span className="font-display text-lg font-semibold text-navy">{title}</span>
      </legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  )
}
