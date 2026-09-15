'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useId, useState } from 'react'
import { Copy, FileUp, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { questionTypeLabels, questionTypes, type QuestionTypeName } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, NativeSelect, Textarea } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { duplicateQuestion, importQuestionsCsv, importQuestionsInterop, removeQuestion, saveQuestion } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'
import { ActionAlert, ActionPayloadSummary, SubmitButton, useActionFeedback } from './action-feedback'

export interface QuestionOptionValue {
  id?: string
  label: string
  isCorrect: boolean
  feedback: string | null
  matchValue: string | null
}

export interface QuestionValue {
  id: string
  type: QuestionTypeName
  prompt: string
  explanation: string | null
  category: string | null
  difficulty: number
  points: number
  tags: string[]
  isActive: boolean
  config: Record<string, unknown>
  options: QuestionOptionValue[]
}

const typeHelp: Record<QuestionTypeName, string> = {
  SINGLE_CHOICE: 'Une seule bonne réponse parmi les options.',
  MULTIPLE_CHOICE: 'Plusieurs bonnes réponses ; crédit partiel possible.',
  TRUE_FALSE: 'Affirmation vraie ou fausse.',
  FILL_BLANK: 'Texte à trous : marquez chaque trou par ___ et listez les réponses acceptées, un trou par ligne (variantes séparées par |).',
  MATCHING: 'Appariement : chaque option (gauche) est associée à sa valeur attendue (droite).',
  ORDERING: "Classement : l'ordre des options saisies est l'ordre attendu.",
  SHORT_ANSWER: 'Réponse courte comparée aux réponses acceptées.',
  ESSAY: 'Composition rédigée, corrigée manuellement par le formateur selon une grille.',
}

function cfg(config: Record<string, unknown>, key: string): unknown {
  return config[key]
}

export interface QuestionEditorProps {
  question?: QuestionValue
  categories: string[]
  /** Ouvre la boîte de dialogue dès le montage (page dédiée /admin/questions/nouvelle). */
  defaultOpen?: boolean
  /** Redirection après enregistrement ; `{id}` est remplacé par l'identifiant de la question. */
  successHref?: string
}

/** Éditeur d'une question de la banque (création ou modification) avec options selon le type. */
export function QuestionEditor({ question, categories, defaultOpen = false, successHref }: QuestionEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [state, formAction] = useActionState(saveQuestion, idleState)
  const [type, setType] = useState<QuestionTypeName>(question?.type ?? 'SINGLE_CHOICE')
  const [options, setOptions] = useState<QuestionOptionValue[]>(question?.options ?? [{ label: '', isCorrect: true, feedback: null, matchValue: null }, { label: '', isCorrect: false, feedback: null, matchValue: null }])
  const [rubric, setRubric] = useState<Array<{ label: string; points: number }>>(() => {
    const raw = question ? cfg(question.config, 'rubric') : null
    return Array.isArray(raw) ? raw.map((r) => ({ label: String((r as { label?: string; criterion?: string }).label ?? (r as { criterion?: string }).criterion ?? ''), points: Number((r as { points?: number; maxPoints?: number }).points ?? (r as { maxPoints?: number }).maxPoints ?? 0) })) : []
  })
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
  const hasOptions = type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' || type === 'MATCHING' || type === 'ORDERING'
  const config = question?.config ?? {}

  function updateOption(index: number, patch: Partial<QuestionOptionValue>) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  }
  function setCorrect(index: number, value: boolean) {
    setOptions((prev) => prev.map((o, i) => (type === 'SINGLE_CHOICE' ? { ...o, isCorrect: i === index ? value : false } : i === index ? { ...o, isCorrect: value } : o)))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {question ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Modifier la question ${question.prompt.slice(0, 40)}`}>
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      ) : (
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Nouvelle question
        </Button>
      )}
      <DialogContent size="xl" className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          <DialogDescription>{typeHelp[type]}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {question ? <input type="hidden" name="questionId" value={question.id} /> : null}
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="options" value={JSON.stringify(hasOptions ? options.filter((o) => o.label.trim()) : [])} />
          <input type="hidden" name="rubric" value={JSON.stringify(rubric.filter((r) => r.label.trim()))} />
          <ActionAlert state={state} />
          {question && question.type !== type ? (
            <Alert variant="warning">
              <AlertTitle>Changement de type</AlertTitle>
              <AlertDescription>Vérifiez les options et la configuration avant d’enregistrer.</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[14rem_1fr]">
            <FormField label="Type" htmlFor={`${id}-type`} required>
              <NativeSelect value={type} onChange={(event) => setType(event.target.value as QuestionTypeName)} options={questionTypes.map((t) => ({ value: t, label: questionTypeLabels[t] }))} />
            </FormField>
            <FormField label="Énoncé" htmlFor={`${id}-prompt`} required error={errors.prompt}>
              <Textarea name="prompt" rows={3} maxLength={5000} defaultValue={question?.prompt ?? ''} required />
            </FormField>
          </div>

          {hasOptions ? (
            <fieldset className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4">
              <legend className="px-1 text-sm font-semibold text-navy">{type === 'MATCHING' ? 'Paires à apparier' : type === 'ORDERING' ? 'Éléments dans le bon ordre' : 'Options'}</legend>
              {errors.options ? <p className="text-sm font-medium text-danger">{errors.options}</p> : null}
              {options.map((option, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
                  {type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? (
                    <label className="flex items-center gap-2 text-xs text-neutral-600">
                      <Checkbox checked={option.isCorrect} onCheckedChange={(checked) => setCorrect(index, checked === true)} aria-label={`Option ${index + 1} correcte`} />
                      Correcte
                    </label>
                  ) : (
                    <span className="font-display text-lg font-semibold text-blue-600">{index + 1}</span>
                  )}
                  <Input aria-label={`Option ${index + 1}`} value={option.label} onChange={(event) => updateOption(index, { label: event.target.value })} placeholder={type === 'MATCHING' ? 'Élément de gauche' : `Option ${index + 1}`} />
                  {type === 'MATCHING' ? (
                    <Input aria-label={`Valeur associée ${index + 1}`} value={option.matchValue ?? ''} onChange={(event) => updateOption(index, { matchValue: event.target.value })} placeholder="Valeur attendue (droite)" />
                  ) : (
                    <Input aria-label={`Commentaire de l'option ${index + 1}`} value={option.feedback ?? ''} onChange={(event) => updateOption(index, { feedback: event.target.value })} placeholder="Commentaire affiché après correction" />
                  )}
                  <Button type="button" variant="ghost" size="icon" aria-label={`Retirer l'option ${index + 1}`} onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setOptions((prev) => [...prev, { label: '', isCorrect: false, feedback: null, matchValue: null }])} leftIcon={<Plus aria-hidden="true" />}>
                Ajouter une option
              </Button>
              <div className="flex flex-wrap gap-6">
                <FormField inline label="Mélanger les options à l'affichage" htmlFor={`${id}-shuffle`}>
                  <Checkbox name="shuffle" value="on" defaultChecked={cfg(config, 'shuffle') !== false} />
                </FormField>
                {type === 'MULTIPLE_CHOICE' ? (
                  <FormField inline label="Crédit partiel" htmlFor={`${id}-partial`}>
                    <Checkbox name="partialCredit" value="on" defaultChecked={Boolean(cfg(config, 'partialCredit'))} />
                  </FormField>
                ) : null}
              </div>
              {type === 'MATCHING' ? (
                <FormField label="Distracteurs (valeurs de droite sans paire, une par ligne)" htmlFor={`${id}-distractors`}>
                  <Textarea name="distractors" rows={2} defaultValue={Array.isArray(cfg(config, 'distractors')) ? (cfg(config, 'distractors') as unknown[]).map(String).join('\n') : ''} />
                </FormField>
              ) : null}
            </fieldset>
          ) : null}

          {type === 'TRUE_FALSE' ? (
            <FormField label="Réponse attendue" htmlFor={`${id}-answer`} error={errors['config.answer']}>
              <NativeSelect name="answer" defaultValue={cfg(config, 'answer') === false ? 'false' : 'true'} options={[{ value: 'true', label: 'Vrai' }, { value: 'false', label: 'Faux' }]} />
            </FormField>
          ) : null}

          {type === 'FILL_BLANK' ? (
            <>
              <FormField label="Texte à trous" htmlFor={`${id}-blankText`} required error={errors['config.text']} hint="Marquez chaque trou par ___ (trois tirets bas).">
                <Textarea name="blankText" rows={3} defaultValue={typeof cfg(config, 'text') === 'string' ? (cfg(config, 'text') as string) : ''} required />
              </FormField>
              <FormField label="Réponses acceptées" htmlFor={`${id}-blankAnswers`} required error={errors['config.answers']} hint="Une ligne par trou, variantes séparées par | (ex. Code|code).">
                <Textarea name="blankAnswers" rows={3} defaultValue={Array.isArray(cfg(config, 'answers')) ? (cfg(config, 'answers') as unknown[]).map((a) => (Array.isArray(a) ? a.join('|') : String(a))).join('\n') : ''} required />
              </FormField>
              <FormField inline label="Crédit partiel par trou" htmlFor={`${id}-partialBlank`}>
                <Checkbox name="partialCredit" value="on" defaultChecked={Boolean(cfg(config, 'partialCredit'))} />
              </FormField>
            </>
          ) : null}

          {type === 'SHORT_ANSWER' ? (
            <>
              <FormField label="Réponses acceptées (une par ligne)" htmlFor={`${id}-accepted`} required error={errors['config.accepted']}>
                <Textarea name="accepted" rows={3} defaultValue={Array.isArray(cfg(config, 'accepted')) ? (cfg(config, 'accepted') as unknown[]).map(String).join('\n') : ''} required />
              </FormField>
              <FormField inline label="Sensible à la casse" htmlFor={`${id}-case`}>
                <Checkbox name="caseSensitive" value="on" defaultChecked={Boolean(cfg(config, 'caseSensitive'))} />
              </FormField>
            </>
          ) : null}

          {type === 'ESSAY' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Nombre de mots minimal" htmlFor={`${id}-minWords`}>
                <Input name="minWords" type="number" min={0} defaultValue={typeof cfg(config, 'minWords') === 'number' ? (cfg(config, 'minWords') as number) : ''} />
              </FormField>
              <FormField label="Nombre de mots maximal" htmlFor={`${id}-maxWords`}>
                <Input name="maxWords" type="number" min={1} defaultValue={typeof cfg(config, 'maxWords') === 'number' ? (cfg(config, 'maxWords') as number) : ''} />
              </FormField>
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-semibold text-navy">Grille de correction</p>
                {rubric.map((criterion, index) => (
                  <div key={index} className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_auto]">
                    <Input aria-label={`Critère ${index + 1}`} value={criterion.label} onChange={(event) => setRubric((prev) => prev.map((c, i) => (i === index ? { ...c, label: event.target.value } : c)))} placeholder="Argumentation juridique" />
                    <Input aria-label={`Points du critère ${index + 1}`} type="number" min={0} value={criterion.points} onChange={(event) => setRubric((prev) => prev.map((c, i) => (i === index ? { ...c, points: Number.parseInt(event.target.value, 10) || 0 } : c)))} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setRubric((prev) => prev.filter((_, i) => i !== index))}>
                      Retirer
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setRubric((prev) => [...prev, { label: '', points: 5 }])} leftIcon={<Plus aria-hidden="true" />}>
                  Ajouter un critère
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <FormField label="Points" htmlFor={`${id}-points`} error={errors.points}>
              <Input name="points" type="number" min={1} max={100} defaultValue={question?.points ?? 1} />
            </FormField>
            <FormField label="Difficulté (1-5)" htmlFor={`${id}-difficulty`} error={errors.difficulty}>
              <Input name="difficulty" type="number" min={1} max={5} defaultValue={question?.difficulty ?? 1} />
            </FormField>
            <FormField label="Catégorie" htmlFor={`${id}-category`} error={errors.category}>
              <Input name="category" list={`${id}-categories`} defaultValue={question?.category ?? ''} maxLength={120} placeholder="Droit du travail" />
            </FormField>
            <datalist id={`${id}-categories`}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <FormField label="Étiquettes (séparées par des virgules)" htmlFor={`${id}-tags`} error={errors.tags}>
              <Input name="tags" defaultValue={question?.tags.join(', ') ?? ''} placeholder="module-02, contentieux" />
            </FormField>
          </div>
          <FormField label="Explication affichée après correction" htmlFor={`${id}-explanation`} error={errors.explanation}>
            <Textarea name="explanation" rows={2} maxLength={5000} defaultValue={question?.explanation ?? ''} />
          </FormField>
          {question ? (
            <FormField inline label="Question active (proposée dans les quiz)" htmlFor={`${id}-active`}>
              <Checkbox name="isActive" value="on" defaultChecked={question.isActive} />
            </FormField>
          ) : null}
          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">
              <Save aria-hidden="true" />
              {question ? 'Enregistrer' : 'Ajouter à la banque'}
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export interface QuestionRowActionsProps {
  questionId: string
  prompt: string
  usage: number
  /** Ouvre la copie créée dans sa fiche (page de détail). */
  openCopy?: boolean
  /** Redirection après suppression effective (page de détail). */
  redirectAfterRemove?: string
}

/** Actions d'une ligne de la banque : dupliquer, supprimer / désactiver. */
export function QuestionRowActions({ questionId, prompt, usage, openCopy = false, redirectAfterRemove }: QuestionRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <ActionButton variant="ghost" size="sm" action={() => duplicateQuestion({ questionId, openCopy })} aria-label={`Dupliquer la question ${prompt.slice(0, 40)}`}>
        <Copy aria-hidden="true" />
        Dupliquer
      </ActionButton>
      <ActionButton
        variant="ghost"
        size="sm"
        action={() => removeQuestion({ questionId, redirectTo: redirectAfterRemove })}
        confirm={{ title: 'Supprimer la question', description: usage ? `Cette question est utilisée dans ${usage} quiz : elle sera désactivée plutôt que supprimée.` : 'La question sera supprimée définitivement de la banque.', confirmLabel: usage ? 'Désactiver' : 'Supprimer', destructive: true }}
        aria-label={`Supprimer la question ${prompt.slice(0, 40)}`}
      >
        <Trash2 aria-hidden="true" />
      </ActionButton>
    </div>
  )
}

/** Import CSV simple : type;question;points;catégorie;options A|B|C;correctes 1|3. */
export function QuestionImportForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(importQuestionsCsv, idleState)
  const id = useId()
  useActionFeedback(state)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<FileUp aria-hidden="true" />}>
        Importer (CSV)
      </Button>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Importer des questions (CSV)</DialogTitle>
          <DialogDescription>Une question par ligne, colonnes séparées par des points-virgules : type;énoncé;points;catégorie;options (A|B|C);correctes (1|3).</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <ActionAlert state={state} />
          <ActionPayloadSummary state={state} />
          <FormField label="Contenu CSV" htmlFor={`${id}-csv`} required error={state.status === 'error' ? state.fieldErrors?.csv : undefined}>
            <Textarea name="csv" rows={10} required className="font-mono text-xs" placeholder={"SINGLE_CHOICE;Quelle juridiction tranche un licenciement contesté ?;1;Droit du travail;Tribunal du travail|Tribunal de commerce|Conseil d'État;1\nTRUE_FALSE;La grève doit être précédée d'un préavis;1;Conflits sociaux;;vrai\nSHORT_ANSWER;Nom de l'organe paritaire de prévention des risques;2;SSCT;CHSCT|comité d'hygiène;"} />
          </FormField>
          <p className="text-xs text-neutral-500">
            Types acceptés : {questionTypes.map((t) => <Badge key={t} variant="outline" size="sm" className="mr-1">{t}</Badge>)}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Fermer
            </Button>
            <SubmitButton pendingLabel="Import...">Importer</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Import de questions depuis un fichier Moodle XML ou GIFT (téléversé ou collé) - compatible Moodle. */
export function QuestionInteropImportForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(importQuestionsInterop, idleState)
  const id = useId()
  useActionFeedback(state)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<FileUp aria-hidden="true" />}>
        Importer (Moodle / GIFT)
      </Button>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Importer un fichier Moodle</DialogTitle>
          <DialogDescription>
            Depuis un fichier au format Moodle XML (.xml) ou GIFT (.txt), tel qu’exporté par une plateforme Moodle. Téléversez le fichier ou collez son contenu.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <ActionAlert state={state} />
          <ActionPayloadSummary state={state} />
          <FormField label="Format" htmlFor={`${id}-format`}>
            <NativeSelect
              id={`${id}-format`}
              name="format"
              defaultValue=""
              options={[
                { value: '', label: 'Détecter automatiquement' },
                { value: 'moodle-xml', label: 'Moodle XML' },
                { value: 'gift', label: 'GIFT' },
              ]}
            />
          </FormField>
          <FormField label="Fichier" htmlFor={`${id}-file`} hint="Fichier .xml (Moodle XML) ou .txt / .gift (GIFT).">
            <Input id={`${id}-file`} type="file" name="file" accept=".xml,.txt,.gift,text/xml,application/xml,text/plain" />
          </FormField>
          <FormField label="Ou coller le contenu" htmlFor={`${id}-content`} error={state.status === 'error' ? state.fieldErrors?.content : undefined}>
            <Textarea id={`${id}-content`} name="content" rows={8} className="font-mono text-xs" placeholder={'<?xml version="1.0"?>\n<quiz>\n  <question type="multichoice">...</question>\n</quiz>'} />
          </FormField>
          <p className="text-xs text-neutral-500">
            Types repris : choix unique et multiple, vrai/faux, réponse courte, appariement, classement (Moodle XML uniquement), texte à trous (cloze), composition.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Fermer
            </Button>
            <SubmitButton pendingLabel="Import...">Importer</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
