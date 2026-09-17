'use client'

import { useActionState, useId, useMemo, useState } from 'react'
import { ClipboardList, FileText, Headphones, HelpCircle, Link2, ListChecks, MessageSquare, MonitorPlay, Package, Pencil, Plus, Presentation, Puzzle, Save, Video, type LucideIcon } from 'lucide-react'
import { activityTypeLabels, activityTypes, completionRules, type ActivityTypeName } from '@fetrag/contracts'
import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, NativeSelect, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { saveActivity } from '@/server/staff/admin-course-actions'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { toInputDateTime, fromInputDateTime } from './format'
import { LiveSessionList, type TreeLiveSession } from './live-session-form'
import { QuizBuilder, type QuizQuestionRow } from './quiz-builder'

export interface TreeActivity {
  id: string
  type: ActivityTypeName
  title: string
  instructions: string | null
  content: Record<string, unknown>
  position: number
  durationMinutes: number | null
  isRequired: boolean
  completionRule: (typeof completionRules)[number]
  maxScore: number | null
  passScore: number | null
  weight: number
  lowBandwidthAlternative: { kind?: string; url?: string; text?: string } | null
  availableFrom: Date | string | null
  dueAt: Date | string | null
  resourceId: string | null
  quiz: { id: string; description: string | null; timeLimitMinutes: number | null; maxAttempts: number; shuffleQuestions: boolean; shuffleOptions: boolean; showCorrection: boolean; passScore: number; isSurvey: boolean; questionCount: number; questions: QuizQuestionRow[] } | null
  assignment: { id: string; description: string | null; allowFile: boolean; allowText: boolean; maxFileSizeMb: number; dueAt: Date | string | null; lateAllowed: boolean; maxScore: number; rubric: Array<{ label: string; points: number }> } | null
  liveSessions: TreeLiveSession[]
  forum: { id: string; slug: string; title: string } | null
}

const icons: Record<ActivityTypeName, LucideIcon> = {
  TEXT: FileText,
  FILE: Package,
  LINK: Link2,
  AUDIO: Headphones,
  VIDEO: Video,
  PRESENTATION: Presentation,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
  SURVEY: ListChecks,
  FORUM: MessageSquare,
  LIVE_SESSION: MonitorPlay,
  H5P: Puzzle,
  SCORM: Package,
}

const completionLabels: Record<(typeof completionRules)[number], string> = {
  VIEW: 'Consultation de la page',
  TIME_SPENT: 'Temps passé (durée estimée)',
  PASS_SCORE: 'Score minimal atteint',
  SUBMIT: 'Remise ou réponse envoyée',
  ATTEND: 'Présence à la séance',
  MANUAL: 'Validation manuelle par le formateur',
}

const defaultCompletion: Partial<Record<ActivityTypeName, (typeof completionRules)[number]>> = { QUIZ: 'PASS_SCORE', ASSIGNMENT: 'SUBMIT', SURVEY: 'SUBMIT', LIVE_SESSION: 'ATTEND', FORUM: 'MANUAL', VIDEO: 'VIEW', AUDIO: 'VIEW', TEXT: 'VIEW' }

export function ActivityTypeIcon({ type }: { type: ActivityTypeName }) {
  const Icon = icons[type]
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-soft">
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}

export interface ActivityEditorProps {
  courseId: string
  lessonId: string
  activity?: TreeActivity
  resources: Array<{ id: string; title: string; kind: string }>
  questionCategories: string[]
  readOnly?: boolean
}

function str(content: Record<string, unknown>, key: string): string {
  const value = content[key]
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
}

/**
 * Panneau d'édition d'une activité (création ou modification) : champs communs, contenu selon le type
 * (format content-format.md), paramètres de quiz / devoir, séances en direct, alternative bas débit.
 */
export function ActivityEditor({ courseId, lessonId, activity, resources, questionCategories, readOnly = false }: ActivityEditorProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(saveActivity, idleState)
  const [type, setType] = useState<ActivityTypeName>(activity?.type ?? 'TEXT')
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const content = useMemo(() => activity?.content ?? {}, [activity])
  const [availableFrom, setAvailableFrom] = useState(toInputDateTime(activity?.availableFrom))
  const [dueAt, setDueAt] = useState(toInputDateTime(activity?.dueAt))
  const [assignmentDueAt, setAssignmentDueAt] = useState(toInputDateTime(activity?.assignment?.dueAt))
  const [rubric, setRubric] = useState<Array<{ label: string; points: number }>>(activity?.assignment?.rubric ?? [])
  const isQuizLike = type === 'QUIZ' || type === 'SURVEY'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {activity ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`${readOnly ? 'Consulter' : 'Modifier'} l'activité ${activity.title}`}>
          <Pencil aria-hidden="true" />
          {readOnly ? 'Voir' : 'Modifier'}
        </Button>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Activité
        </Button>
      )}
      <DialogContent size="xl" className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? `Activité « ${activity.title} »` : 'Nouvelle activité'}</DialogTitle>
          <DialogDescription>Les contenus suivent le format commun de la plateforme ; l’achèvement est calculé selon la règle choisie.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="lessonId" value={lessonId} />
          {activity ? <input type="hidden" name="activityId" value={activity.id} /> : null}
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="availableFrom" value={fromInputDateTime(availableFrom)} />
          <input type="hidden" name="dueAt" value={fromInputDateTime(dueAt)} />
          <input type="hidden" name="assignmentDueAt" value={fromInputDateTime(assignmentDueAt)} />
          <input type="hidden" name="rubric" value={JSON.stringify(rubric.filter((r) => r.label.trim()))} />
          <ActionAlert state={state} />
          <fieldset disabled={readOnly} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Type d'activité" htmlFor={`${id}-type`} required className={activity ? 'hidden' : ''}>
                <NativeSelect value={type} onChange={(event) => setType(event.target.value as ActivityTypeName)} options={activityTypes.map((t) => ({ value: t, label: activityTypeLabels[t] }))} disabled={Boolean(activity)} />
              </FormField>
              <FormField label="Titre" htmlFor={`${id}-title`} required error={errors.title} className={activity ? 'sm:col-span-2' : ''}>
                <Input name="title" defaultValue={activity?.title ?? ''} required maxLength={200} />
              </FormField>
              <FormField label="Consignes" htmlFor={`${id}-instructions`} error={errors.instructions} className="sm:col-span-2" hint="Affichées en tête de l'activité.">
                <Textarea name="instructions" rows={3} maxLength={20000} defaultValue={activity?.instructions ?? ''} />
              </FormField>
            </div>

            <Tabs defaultValue="content">
              <TabsList variant="pill" aria-label="Sections de l'activité">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="rules">Achèvement et dates</TabsTrigger>
                {isQuizLike ? <TabsTrigger value="quiz">{type === 'SURVEY' ? 'Questionnaire' : 'Quiz'}</TabsTrigger> : null}
                {type === 'ASSIGNMENT' ? <TabsTrigger value="assignment">Devoir</TabsTrigger> : null}
                {type === 'LIVE_SESSION' && activity ? <TabsTrigger value="live">Séances</TabsTrigger> : null}
                <TabsTrigger value="lowbandwidth">Bas débit</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ContentFields type={type} content={content} id={id} errors={errors} resources={resources} resourceId={activity?.resourceId ?? null} />
              </TabsContent>

              <TabsContent value="rules" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Règle d'achèvement" htmlFor={`${id}-completion`} error={errors.completionRule}>
                  <NativeSelect name="completionRule" defaultValue={activity?.completionRule ?? defaultCompletion[type] ?? 'VIEW'} options={completionRules.map((r) => ({ value: r, label: completionLabels[r] }))} />
                </FormField>
                <FormField label="Durée estimée (minutes)" htmlFor={`${id}-duration`} error={errors.durationMinutes}>
                  <Input name="durationMinutes" type="number" min={0} defaultValue={activity?.durationMinutes ?? ''} />
                </FormField>
                <FormField label="Score maximal" htmlFor={`${id}-maxScore`} error={errors.maxScore} hint="Pour les activités notées.">
                  <Input name="maxScore" type="number" min={0} defaultValue={activity?.maxScore ?? ''} />
                </FormField>
                <FormField label="Score de réussite (%)" htmlFor={`${id}-passScore`} error={errors.passScore}>
                  <Input name="passScore" type="number" min={0} max={100} defaultValue={activity?.passScore ?? ''} />
                </FormField>
                <FormField label="Poids dans la note du cours" htmlFor={`${id}-weight`} error={errors.weight}>
                  <Input name="weight" type="number" min={1} max={100} defaultValue={activity?.weight ?? 1} />
                </FormField>
                <FormField inline label="Activité obligatoire pour l'achèvement" htmlFor={`${id}-required`}>
                  <Checkbox name="isRequired" value="on" defaultChecked={activity?.isRequired ?? true} />
                </FormField>
                <FormField label="Disponible à partir du" htmlFor={`${id}-from`} error={errors.availableFrom}>
                  <Input id={`${id}-from`} type="datetime-local" value={availableFrom} onChange={(event) => setAvailableFrom(event.target.value)} />
                </FormField>
                <FormField label="Échéance" htmlFor={`${id}-due`} error={errors.dueAt}>
                  <Input id={`${id}-due`} type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
                </FormField>
              </TabsContent>

              {isQuizLike ? (
                <TabsContent value="quiz" className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Description" htmlFor={`${id}-quizDesc`} className="sm:col-span-2">
                      <Textarea name="quizDescription" rows={2} defaultValue={activity?.quiz?.description ?? ''} />
                    </FormField>
                    <FormField label="Temps limite (minutes)" htmlFor={`${id}-time`}>
                      <Input name="timeLimitMinutes" type="number" min={1} max={600} defaultValue={activity?.quiz?.timeLimitMinutes ?? ''} />
                    </FormField>
                    <FormField label="Tentatives autorisées" htmlFor={`${id}-attempts`} hint="Jusqu'à 99 reprises pour une évaluation formative rejouable.">
                      <Input name="maxAttempts" type="number" min={1} max={99} defaultValue={activity?.quiz?.maxAttempts ?? 3} />
                    </FormField>
                    {type === 'QUIZ' ? (
                      <FormField label="Score de réussite du quiz (%)" htmlFor={`${id}-quizPass`}>
                        <Input name="quizPassScore" type="number" min={0} max={100} defaultValue={activity?.quiz?.passScore ?? 60} />
                      </FormField>
                    ) : null}
                    <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:flex-wrap sm:gap-6">
                      <FormField inline label="Mélanger les questions" htmlFor={`${id}-shq`}>
                        <Checkbox name="shuffleQuestions" value="on" defaultChecked={activity?.quiz?.shuffleQuestions ?? false} />
                      </FormField>
                      <FormField inline label="Mélanger les options" htmlFor={`${id}-sho`}>
                        <Checkbox name="shuffleOptions" value="on" defaultChecked={activity?.quiz?.shuffleOptions ?? false} />
                      </FormField>
                      <FormField inline label="Afficher la correction" htmlFor={`${id}-corr`}>
                        <Checkbox name="showCorrection" value="on" defaultChecked={activity?.quiz?.showCorrection ?? true} />
                      </FormField>
                    </div>
                  </div>
                  {activity?.quiz ? (
                    <QuizBuilder quizId={activity.quiz.id} courseId={courseId} questions={activity.quiz.questions} categories={questionCategories} readOnly={readOnly} isSurvey={type === 'SURVEY'} />
                  ) : (
                    <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">Enregistrez l’activité pour composer le questionnaire à partir de la banque de questions.</p>
                  )}
                </TabsContent>
              ) : null}

              {type === 'ASSIGNMENT' ? (
                <TabsContent value="assignment" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Consignes détaillées du devoir" htmlFor={`${id}-aDesc`} className="sm:col-span-2">
                    <Textarea name="assignmentDescription" rows={4} maxLength={10000} defaultValue={activity?.assignment?.description ?? ''} />
                  </FormField>
                  <FormField label="Étude de cas (texte de référence)" htmlFor={`${id}-case`} className="sm:col-span-2">
                    <Textarea name="caseStudy" rows={4} defaultValue={str(content, 'caseStudy')} />
                  </FormField>
                  <FormField label="Barème (points)" htmlFor={`${id}-aMax`}>
                    <Input name="assignmentMaxScore" type="number" min={1} max={1000} defaultValue={activity?.assignment?.maxScore ?? 20} />
                  </FormField>
                  <FormField label="Taille maximale du fichier (Mo)" htmlFor={`${id}-aSize`}>
                    <Input name="maxFileSizeMb" type="number" min={1} max={100} defaultValue={activity?.assignment?.maxFileSizeMb ?? 10} />
                  </FormField>
                  <FormField label="Échéance du devoir" htmlFor={`${id}-aDue`}>
                    <Input id={`${id}-aDue`} type="datetime-local" value={assignmentDueAt} onChange={(event) => setAssignmentDueAt(event.target.value)} />
                  </FormField>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
                    <FormField inline label="Dépôt de fichier" htmlFor={`${id}-aFile`}>
                      <Checkbox name="allowFile" value="on" defaultChecked={activity?.assignment?.allowFile ?? true} />
                    </FormField>
                    <FormField inline label="Réponse texte" htmlFor={`${id}-aText`}>
                      <Checkbox name="allowText" value="on" defaultChecked={activity?.assignment?.allowText ?? true} />
                    </FormField>
                    <FormField inline label="Retard accepté" htmlFor={`${id}-aLate`}>
                      <Checkbox name="lateAllowed" value="on" defaultChecked={activity?.assignment?.lateAllowed ?? true} />
                    </FormField>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-semibold text-navy">Grille de critères</p>
                    <ul className="flex flex-col gap-2">
                      {rubric.map((criterion, index) => (
                        <li key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_auto]">
                          <Input aria-label={`Critère ${index + 1}`} value={criterion.label} onChange={(event) => setRubric((prev) => prev.map((c, i) => (i === index ? { ...c, label: event.target.value } : c)))} placeholder="Analyse selon les trois piliers" />
                          <Input aria-label={`Points du critère ${index + 1}`} type="number" min={0} value={criterion.points} onChange={(event) => setRubric((prev) => prev.map((c, i) => (i === index ? { ...c, points: Number.parseInt(event.target.value, 10) || 0 } : c)))} />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setRubric((prev) => prev.filter((_, i) => i !== index))}>
                            Retirer
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setRubric((prev) => [...prev, { label: '', points: 5 }])} leftIcon={<Plus aria-hidden="true" />}>
                      Ajouter un critère
                    </Button>
                    <p className="mt-1 text-xs text-neutral-500">Total de la grille : {rubric.reduce((s, c) => s + c.points, 0)} point(s).</p>
                  </div>
                </TabsContent>
              ) : null}

              {type === 'LIVE_SESSION' && activity ? (
                <TabsContent value="live">
                  <LiveSessionList activityId={activity.id} courseId={courseId} sessions={activity.liveSessions} readOnly={readOnly} />
                </TabsContent>
              ) : null}

              <TabsContent value="lowbandwidth" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <p className="text-sm text-neutral-600 sm:col-span-2">Alternative pour les connexions lentes : transcription, audio léger, document ou version basse résolution.</p>
                <FormField label="Type d'alternative" htmlFor={`${id}-lbKind`}>
                  <NativeSelect name="lowBandwidthKind" defaultValue={activity?.lowBandwidthAlternative?.kind ?? 'transcript'} options={[{ value: 'transcript', label: 'Transcription' }, { value: 'audio', label: 'Audio' }, { value: 'document', label: 'Document' }, { value: 'low-res', label: 'Basse résolution' }]} />
                </FormField>
                <FormField label="URL de l'alternative" htmlFor={`${id}-lbUrl`} error={errors['lowBandwidthAlternative.url']}>
                  <Input name="lowBandwidthUrl" type="url" defaultValue={activity?.lowBandwidthAlternative?.url ?? ''} />
                </FormField>
                <FormField label="Texte (transcription)" htmlFor={`${id}-lbText`} className="sm:col-span-2">
                  <Textarea name="lowBandwidthText" rows={4} defaultValue={activity?.lowBandwidthAlternative?.text ?? ''} />
                </FormField>
              </TabsContent>
            </Tabs>
          </fieldset>

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {readOnly ? 'Fermer' : 'Annuler'}
            </Button>
            {!readOnly ? (
              <SubmitButton pendingLabel="Enregistrement...">
                <Save aria-hidden="true" />
                {activity ? 'Enregistrer' : "Ajouter l'activité"}
              </SubmitButton>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ContentFields({ type, content, id, errors, resources, resourceId }: { type: ActivityTypeName; content: Record<string, unknown>; id: string; errors: Record<string, string>; resources: Array<{ id: string; title: string; kind: string }>; resourceId: string | null }) {
  switch (type) {
    case 'TEXT':
      return (
        <FormField label="Contenu (HTML)" htmlFor={`${id}-html`} required error={errors['content.html'] ?? errors.content} className="sm:col-span-2" hint="HTML simple : titres, paragraphes, listes, liens. Assaini avant affichage.">
          <Textarea name="html" rows={12} defaultValue={str(content, 'html')} className="font-mono text-xs" />
        </FormField>
      )
    case 'VIDEO':
      return (
        <>
          <FormField label="URL de la vidéo" htmlFor={`${id}-url`} required error={errors['content.url'] ?? errors.content} hint="URL d'intégration (https://www.youtube.com/embed/...) ou fichier." className="sm:col-span-2">
            <Input name="contentUrl" type="url" defaultValue={str(content, 'url')} required />
          </FormField>
          <FormField label="Fournisseur" htmlFor={`${id}-provider`}>
            <NativeSelect name="provider" defaultValue={str(content, 'provider') || 'other'} options={[{ value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' }, { value: 'file', label: 'Fichier' }, { value: 'other', label: 'Autre' }]} />
          </FormField>
          <FormField label="Image d'aperçu (URL)" htmlFor={`${id}-poster`}>
            <Input name="posterUrl" type="url" defaultValue={str(content, 'posterUrl')} />
          </FormField>
          <FormField label="Transcription" htmlFor={`${id}-transcript`} className="sm:col-span-2" hint="Recommandée pour l'accessibilité et le mode bas débit.">
            <Textarea name="transcript" rows={5} defaultValue={str(content, 'transcript')} />
          </FormField>
        </>
      )
    case 'AUDIO':
      return (
        <>
          <FormField label="URL de l'audio" htmlFor={`${id}-url`} required error={errors['content.url'] ?? errors.content} className="sm:col-span-2">
            <Input name="contentUrl" type="url" defaultValue={str(content, 'url')} required />
          </FormField>
          <FormField label="Transcription" htmlFor={`${id}-transcript`} className="sm:col-span-2">
            <Textarea name="transcript" rows={5} defaultValue={str(content, 'transcript')} />
          </FormField>
        </>
      )
    case 'LINK':
      return (
        <>
          <FormField label="URL" htmlFor={`${id}-url`} required error={errors['content.url'] ?? errors.content}>
            <Input name="contentUrl" type="url" defaultValue={str(content, 'url')} required />
          </FormField>
          <FormField label="Libellé du lien" htmlFor={`${id}-label`}>
            <Input name="contentLabel" defaultValue={str(content, 'label')} maxLength={200} />
          </FormField>
        </>
      )
    case 'FILE':
      return (
        <>
          <FormField label="Ressource de la bibliothèque" htmlFor={`${id}-resource`} error={errors.resourceId} hint="Ou indiquez une URL de fichier directe.">
            <NativeSelect name="resourceId" defaultValue={resourceId ?? str(content, 'resourceId')} options={[{ value: '', label: 'Aucune' }, ...resources.map((r) => ({ value: r.id, label: `${r.title} (${r.kind})` }))]} />
          </FormField>
          <FormField label="URL du fichier" htmlFor={`${id}-url`} error={errors['content.fileUrl'] ?? errors.content}>
            <Input name="contentUrl" type="url" defaultValue={str(content, 'fileUrl')} />
          </FormField>
          <FormField label="Libellé" htmlFor={`${id}-label`} className="sm:col-span-2">
            <Input name="contentLabel" defaultValue={str(content, 'label')} maxLength={200} />
          </FormField>
        </>
      )
    case 'PRESENTATION':
      return (
        <>
          <FormField label="URL du fichier (PDF, diaporama)" htmlFor={`${id}-url`} required error={errors['content.url'] ?? errors.content}>
            <Input name="contentUrl" type="url" defaultValue={str(content, 'url')} required />
          </FormField>
          <FormField label="URL d'intégration" htmlFor={`${id}-embed`}>
            <Input name="embedUrl" type="url" defaultValue={str(content, 'embedUrl')} />
          </FormField>
        </>
      )
    case 'H5P':
      return (
        <>
          <FormField label="URL d'intégration H5P" htmlFor={`${id}-embed`} error={errors['content.embedUrl'] ?? errors.content}>
            <Input name="embedUrl" type="url" defaultValue={str(content, 'embedUrl')} />
          </FormField>
          <FormField label="URL du paquet" htmlFor={`${id}-package`}>
            <Input name="packageUrl" type="url" defaultValue={str(content, 'packageUrl')} />
          </FormField>
          <FormField label="Hauteur (px)" htmlFor={`${id}-height`}>
            <Input name="height" type="number" min={100} defaultValue={str(content, 'height')} />
          </FormField>
        </>
      )
    case 'SCORM':
      return (
        <>
          <FormField label="URL du paquet SCORM" htmlFor={`${id}-package`} required error={errors['content.packageUrl'] ?? errors.content}>
            <Input name="packageUrl" type="url" defaultValue={str(content, 'packageUrl')} required />
          </FormField>
          <FormField label="Fichier de lancement" htmlFor={`${id}-launch`}>
            <Input name="launchPath" defaultValue={str(content, 'launchPath') || 'index.html'} />
          </FormField>
          <FormField label="Version SCORM" htmlFor={`${id}-scormVersion`}>
            <Input name="scormVersion" defaultValue={str(content, 'version')} placeholder="1.2 ou 2004" />
          </FormField>
        </>
      )
    case 'SURVEY':
      return (
        <>
          <FormField label="Introduction" htmlFor={`${id}-intro`} className="sm:col-span-2">
            <Textarea name="intro" rows={3} defaultValue={str(content, 'intro')} />
          </FormField>
          <FormField inline label="Réponses anonymes" htmlFor={`${id}-anon`}>
            <Checkbox name="anonymous" value="on" defaultChecked={content.anonymous !== false} />
          </FormField>
        </>
      )
    case 'LIVE_SESSION':
      return (
        <>
          <FormField label="Introduction" htmlFor={`${id}-intro`} className="sm:col-span-2">
            <Textarea name="intro" rows={3} defaultValue={str(content, 'intro')} />
          </FormField>
          <FormField label="Format" htmlFor={`${id}-format`}>
            <NativeSelect name="liveFormat" defaultValue={str(content, 'format') || 'hybrid'} options={[{ value: 'in_person', label: 'Présentiel' }, { value: 'virtual', label: 'Classe virtuelle' }, { value: 'hybrid', label: 'Hybride' }]} />
          </FormField>
          <FormField label="Ordre du jour" htmlFor={`${id}-agenda`} hint="Un point par ligne." className="sm:col-span-2">
            <Textarea name="agenda" rows={4} defaultValue={Array.isArray(content.agenda) ? (content.agenda as unknown[]).map(String).join('\n') : ''} />
          </FormField>
        </>
      )
    case 'ASSIGNMENT':
      return (
        <FormField label="Introduction" htmlFor={`${id}-intro`} className="sm:col-span-2" hint="Les consignes détaillées et l'étude de cas se saisissent dans l'onglet Devoir.">
          <Textarea name="intro" rows={3} defaultValue={str(content, 'intro')} />
        </FormField>
      )
    default:
      return (
        <FormField label="Introduction" htmlFor={`${id}-intro`} className="sm:col-span-2">
          <Textarea name="intro" rows={3} defaultValue={str(content, 'intro') || str(content, 'prompt')} />
        </FormField>
      )
  }
}
