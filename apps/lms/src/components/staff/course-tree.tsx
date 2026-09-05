'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useId, useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, BookOpen, ChevronDown, ChevronRight, Layers, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { activityTypeLabels, completionRules as completionRuleValues } from '@fetrag/contracts'
import { Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, Textarea, cn, toast } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/staff/action-state'
import { moveActivity, moveLesson, moveModule, removeActivity, removeLesson, removeModule, saveLesson, saveModule } from '@/server/staff/admin-course-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { ActivityEditor, ActivityTypeIcon, type TreeActivity } from './activity-editor'
import { fmtDuration } from './format'

export interface TreeLesson {
  id: string
  slug: string
  title: string
  summary: string | null
  position: number
  durationMinutes: number | null
  isPreview: boolean
  activities: TreeActivity[]
}

export interface TreeModule {
  id: string
  title: string
  summary: string | null
  position: number
  durationMinutes: number | null
  isOptional: boolean
  lessons: TreeLesson[]
}

export interface CourseTreeProps {
  courseId: string
  courseVersionId: string
  versionNumber: number
  locked: boolean
  modules: TreeModule[]
  resources: Array<{ id: string; title: string; kind: string }>
  questionCategories: string[]
}

const completionLabels: Record<(typeof completionRuleValues)[number], string> = {
  VIEW: 'Consultation',
  TIME_SPENT: 'Temps passé',
  PASS_SCORE: 'Score minimal',
  SUBMIT: 'Remise',
  ATTEND: 'Présence',
  MANUAL: 'Validation manuelle',
}

/**
 * Arborescence éditable d'une version : modules, leçons, activités.
 * Réordonnancement par boutons (accessible), édition dans des boîtes de dialogue, verrouillage des versions suivies.
 */
/** Boutons monter / descendre accessibles : exécutent l'action puis rafraîchissent les données. */
function MoveButtons({ label, isFirst, isLast, onMove }: { label: string; isFirst: boolean; isLast: boolean; onMove: (direction: 'up' | 'down') => Promise<ActionState> }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const run = (direction: 'up' | 'down') =>
    startTransition(async () => {
      const state = await onMove(direction)
      if (state.status === 'error') toast.error(state.message)
      else router.refresh()
    })
  return (
    <>
      <Button type="button" variant="ghost" size="icon" aria-label={`Monter ${label}`} disabled={isFirst || pending} onClick={() => run('up')}>
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label={`Descendre ${label}`} disabled={isLast || pending} onClick={() => run('down')}>
        <ArrowDown aria-hidden="true" />
      </Button>
    </>
  )
}

export function CourseTree({ courseId, courseVersionId, versionNumber, locked, modules, resources, questionCategories }: CourseTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const totalActivities = modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.activities.length, 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          Version {versionNumber} · {modules.length} module(s), {modules.reduce((n, m) => n + m.lessons.length, 0)} leçon(s), {totalActivities} activité(s).
          {locked ? (
            <span className="ml-2 inline-flex items-center gap-1 text-gold-800">
              <Lock className="size-3.5" aria-hidden="true" />
              Version figée : dupliquez-la pour modifier la structure.
            </span>
          ) : null}
        </p>
        {!locked ? <ModuleDialog courseVersionId={courseVersionId} /> : null}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
          <Layers className="mx-auto mb-2 size-8 text-blue-600" aria-hidden="true" />
          Cette version ne contient encore aucun module. Structurez le parcours : modules, leçons, puis activités (contenu, vidéo, quiz, devoir, séance en direct...).
        </div>
      ) : null}

      <ol className="flex flex-col gap-4">
        {modules.map((module, mIndex) => {
          const isCollapsed = collapsed.has(module.id)
          return (
            <li key={module.id} className="rounded-2xl border border-neutral-200 bg-white shadow-soft">
              <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => toggle(module.id)} aria-expanded={!isCollapsed} className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                  {isCollapsed ? <ChevronRight className="size-5 text-neutral-500" aria-hidden="true" /> : <ChevronDown className="size-5 text-neutral-500" aria-hidden="true" />}
                  <span aria-hidden="true" className="font-display text-2xl font-semibold leading-none text-blue-600">
                    {String(mIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold text-navy">{module.title}</span>
                    <span className="block text-xs text-neutral-500">
                      {module.lessons.length} leçon(s)
                      {module.durationMinutes ? ` · ${fmtDuration(module.durationMinutes)}` : ''}
                      {module.isOptional ? ' · facultatif' : ''}
                    </span>
                  </span>
                </button>
                {!locked ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <MoveButtons label={`le module ${module.title}`} isFirst={mIndex === 0} isLast={mIndex === modules.length - 1} onMove={(direction) => moveModule({ moduleId: module.id, courseVersionId, direction })} />
                    <ModuleDialog courseVersionId={courseVersionId} module={module} />
                    <LessonDialog courseId={courseId} moduleId={module.id} />
                    <ActionButton variant="ghost" size="sm" action={() => removeModule({ moduleId: module.id, courseId })} confirm={{ title: `Supprimer « ${module.title} »`, description: 'Les leçons et activités du module seront supprimées.', confirmLabel: 'Supprimer', destructive: true }} aria-label={`Supprimer le module ${module.title}`}>
                      <Trash2 aria-hidden="true" />
                    </ActionButton>
                  </div>
                ) : null}
              </div>
              {!isCollapsed ? (
                <ol className="flex flex-col divide-y divide-neutral-100">
                  {module.lessons.map((lesson, lIndex) => (
                    <li key={lesson.id} className="p-4 pl-6 sm:pl-10">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <BookOpen className="size-4 shrink-0 text-green-700" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="font-semibold text-navy">
                              {mIndex + 1}.{lIndex + 1} {lesson.title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {lesson.activities.length} activité(s)
                              {lesson.durationMinutes ? ` · ${fmtDuration(lesson.durationMinutes)}` : ''}
                              {lesson.isPreview ? ' · aperçu public' : ''}
                            </p>
                          </div>
                        </div>
                        {!locked ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <MoveButtons label={`la leçon ${lesson.title}`} isFirst={lIndex === 0} isLast={lIndex === module.lessons.length - 1} onMove={(direction) => moveLesson({ lessonId: lesson.id, moduleId: module.id, courseId, direction })} />
                            <LessonDialog courseId={courseId} moduleId={module.id} lesson={lesson} />
                            <ActivityEditor courseId={courseId} lessonId={lesson.id} resources={resources} questionCategories={questionCategories} />
                            <ActionButton variant="ghost" size="sm" action={() => removeLesson({ lessonId: lesson.id, courseId })} confirm={{ title: `Supprimer la leçon « ${lesson.title} »`, description: 'Ses activités seront supprimées.', confirmLabel: 'Supprimer', destructive: true }} aria-label={`Supprimer la leçon ${lesson.title}`}>
                              <Trash2 aria-hidden="true" />
                            </ActionButton>
                          </div>
                        ) : null}
                      </div>
                      {lesson.activities.length ? (
                        <ol className="mt-3 flex flex-col gap-2">
                          {lesson.activities.map((activity, aIndex) => (
                            <li key={activity.id} className={cn('flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between', !activity.isRequired && 'border-dashed')}>
                              <div className="flex min-w-0 items-center gap-3">
                                <ActivityTypeIcon type={activity.type} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-ink">{activity.title}</p>
                                  <p className="flex flex-wrap gap-1 text-xs text-neutral-500">
                                    <Badge variant="outline" size="sm">
                                      {activityTypeLabels[activity.type]}
                                    </Badge>
                                    <Badge variant="neutral" size="sm">
                                      {completionLabels[activity.completionRule]}
                                    </Badge>
                                    {!activity.isRequired ? <Badge variant="gold" size="sm">Facultative</Badge> : null}
                                    {activity.quiz ? <Badge variant="blue" size="sm">{activity.quiz.questionCount} question(s)</Badge> : null}
                                    {activity.assignment ? <Badge variant="blue" size="sm">Barème {activity.assignment.maxScore}</Badge> : null}
                                    {activity.liveSessions.length ? <Badge variant="green" size="sm">{activity.liveSessions.length} séance(s)</Badge> : null}
                                    {activity.durationMinutes ? <span>{fmtDuration(activity.durationMinutes)}</span> : null}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                {!locked ? <MoveButtons label={`l'activité ${activity.title}`} isFirst={aIndex === 0} isLast={aIndex === lesson.activities.length - 1} onMove={(direction) => moveActivity({ activityId: activity.id, lessonId: lesson.id, courseId, direction })} /> : null}
                                <ActivityEditor courseId={courseId} lessonId={lesson.id} activity={activity} resources={resources} questionCategories={questionCategories} readOnly={locked} />
                                {!locked ? (
                                  <ActionButton variant="ghost" size="sm" action={() => removeActivity({ activityId: activity.id, courseId })} confirm={{ title: `Supprimer « ${activity.title} »`, description: 'Les tentatives et remises liées seront perdues.', confirmLabel: 'Supprimer', destructive: true }} aria-label={`Supprimer l'activité ${activity.title}`}>
                                    <Trash2 aria-hidden="true" />
                                  </ActionButton>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-2 text-xs text-neutral-500">Aucune activité dans cette leçon.</p>
                      )}
                    </li>
                  ))}
                  {module.lessons.length === 0 ? <li className="p-4 pl-10 text-sm text-neutral-500">Aucune leçon : ajoutez-en une pour y placer des activités.</li> : null}
                </ol>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ModuleDialog({ courseVersionId, module }: { courseVersionId: string; module?: TreeModule }) {
  const [state, formAction] = useActionState(saveModule, idleState)
  const [open, setOpen] = useState(false)
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {module ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier le module ${module.title}`}>
          <Pencil aria-hidden="true" />
        </Button>
      ) : (
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Ajouter un module
        </Button>
      )}
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{module ? 'Modifier le module' : 'Nouveau module'}</DialogTitle>
          <DialogDescription>Un module regroupe des leçons ; il structure le parcours et apparaît dans la fiche du cours.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="courseVersionId" value={courseVersionId} />
          {module ? <input type="hidden" name="moduleId" value={module.id} /> : null}
          <ActionAlert state={state} />
          <FormField label="Titre" htmlFor={`${id}-title`} required error={errors.title}>
            <Input name="title" defaultValue={module?.title ?? ''} required maxLength={200} placeholder="Cadre juridique de la négociation" />
          </FormField>
          <FormField label="Résumé" htmlFor={`${id}-summary`} error={errors.summary}>
            <Textarea name="summary" rows={3} maxLength={2000} defaultValue={module?.summary ?? ''} />
          </FormField>
          <FormField label="Durée estimée (minutes)" htmlFor={`${id}-duration`} error={errors.durationMinutes}>
            <Input name="durationMinutes" type="number" min={0} defaultValue={module?.durationMinutes ?? ''} />
          </FormField>
          <FormField inline label="Module facultatif" htmlFor={`${id}-optional`}>
            <Checkbox name="isOptional" value="on" defaultChecked={module?.isOptional ?? false} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">{module ? 'Enregistrer' : 'Ajouter'}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LessonDialog({ courseId, moduleId, lesson }: { courseId: string; moduleId: string; lesson?: TreeLesson }) {
  const [state, formAction] = useActionState(saveLesson, idleState)
  const [open, setOpen] = useState(false)
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {lesson ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier la leçon ${lesson.title}`}>
          <Pencil aria-hidden="true" />
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Leçon
        </Button>
      )}
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Modifier la leçon' : 'Nouvelle leçon'}</DialogTitle>
          <DialogDescription>Une leçon est une page du parcours qui enchaîne des activités.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={moduleId} />
          {lesson ? <input type="hidden" name="lessonId" value={lesson.id} /> : null}
          <ActionAlert state={state} />
          <FormField label="Titre" htmlFor={`${id}-title`} required error={errors.title}>
            <Input name="title" defaultValue={lesson?.title ?? ''} required maxLength={200} placeholder="Préparer un cahier de revendications" />
          </FormField>
          <FormField label="Adresse (slug)" htmlFor={`${id}-slug`} error={errors.slug} hint="Généré depuis le titre si vide.">
            <Input name="slug" defaultValue={lesson?.slug ?? ''} maxLength={120} />
          </FormField>
          <FormField label="Résumé" htmlFor={`${id}-summary`} error={errors.summary}>
            <Textarea name="summary" rows={3} maxLength={2000} defaultValue={lesson?.summary ?? ''} />
          </FormField>
          <FormField label="Durée estimée (minutes)" htmlFor={`${id}-duration`} error={errors.durationMinutes}>
            <Input name="durationMinutes" type="number" min={0} defaultValue={lesson?.durationMinutes ?? ''} />
          </FormField>
          <FormField inline label="Aperçu accessible sans inscription" htmlFor={`${id}-preview`}>
            <Checkbox name="isPreview" value="on" defaultChecked={lesson?.isPreview ?? false} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">{lesson ? 'Enregistrer' : 'Ajouter'}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
