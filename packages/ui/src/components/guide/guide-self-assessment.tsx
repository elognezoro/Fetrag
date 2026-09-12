'use client'

import * as React from 'react'
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  History,
  ListChecks,
  Loader2,
  RotateCcw,
  Target,
  Timer,
  XCircle,
} from 'lucide-react'
import {
  assessmentMinutes,
  masteryLabels,
  masteryLevel,
  masteryMessages,
  scoreSelfAssessment,
  type AssessmentResult,
  type Guide,
  type GuideAnswers,
  type GuideAssessmentQuestion,
  type MasteryLevel,
  type QuestionResult,
  type SectionMastery,
} from '@fetrag/contracts'

import { cn } from '../../lib/cn'
import { toneClasses, type Tone } from '../../lib/tones'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { Alert, AlertDescription, AlertTitle } from '../alert'
import { Badge } from '../badge'
import { Button } from '../button'
import { Card } from '../card'
import { Progress } from '../progress'
import { ProgressArc } from '../brand/progress-arc'
import { Ribbon } from '../brand/ribbon'
import { useReducedMotionSafe } from '../motion/use-reduced-motion'
import { renderGuideInline, type GuideBaseUrls } from './guide-inline'
import { formatGuideTimestamp } from './guide-text'

/** Résumé sérialisable des tentatives précédentes d'un utilisateur sur un guide (dates en ISO). */
export interface GuideAssessmentSummaryView {
  count: number
  last: { percent: number; passed: boolean; createdAt: string } | null
  best: { percent: number; passed: boolean; createdAt: string } | null
}

export interface GuideSelfAssessmentProps {
  /** Guide dont le module `selfAssessment` est joué ; sans module, rien n'est affiché. */
  guide: Guide
  baseUrls: GuideBaseUrls
  /** Tentatives précédentes de l'utilisateur (affichées sur la carte d'introduction). */
  summary?: GuideAssessmentSummaryView
  /** Action serveur : enregistre la tentative et retourne le résultat corrigé côté serveur. */
  onSubmit: (answers: GuideAnswers) => Promise<AssessmentResult>
  /** Appelé quand l'utilisateur suit un lien « Relire » vers une section du guide. */
  onNavigateSection?: (sectionId: string) => void
  /** Identifiant du titre h2, pour l'`aria-labelledby` de la section englobante. */
  headingId?: string
  className?: string
}

/** Tonalité de marque associée à chaque niveau de maîtrise. */
export const masteryTones: Record<MasteryLevel, Tone> = {
  'a-consolider': 'gold',
  'en-bonne-voie': 'blue',
  maitrise: 'green',
}

const questionTypeLabels: Record<GuideAssessmentQuestion['type'], string> = {
  single: 'Une seule réponse',
  multiple: 'Plusieurs réponses possibles',
  'true-false': 'Vrai ou faux',
}

type Phase = 'intro' | 'question' | 'result'

type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'saved'; result: AssessmentResult } | { status: 'error' }

type OptionState = 'idle' | 'correct' | 'wrong' | 'missed' | 'neutral'

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

function sectionTone(percent: number): Tone {
  if (percent >= 100) return 'green'
  if (percent >= 50) return 'blue'
  return 'gold'
}

function optionState(chosen: boolean, correct: boolean, validated: boolean): OptionState {
  if (!validated) return 'idle'
  if (chosen && correct) return 'correct'
  if (chosen) return 'wrong'
  if (correct) return 'missed'
  return 'neutral'
}

const optionStateClasses: Record<OptionState, string> = {
  idle: 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50',
  correct: 'border-green-500 bg-green-50',
  wrong: 'border-gold-500 bg-gold-50',
  missed: 'border-dashed border-green-500 bg-white',
  neutral: 'border-neutral-200 bg-white opacity-70',
}

const anchorLinkClassName =
  'inline-flex min-h-11 items-center gap-1 rounded-full font-semibold text-blue-700 underline decoration-blue-300 underline-offset-[3px] hover:text-blue-800 hover:decoration-blue-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40'

const focusableHeadingClassName = 'rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40'

function MetaItem({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: 'true' }>; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-neutral-400" />
      <span>{children}</span>
    </li>
  )
}

/* ---------------------------------------------------------------------------
   Option de réponse : entrée native (radio ou case) masquée visuellement, étiquette en grande cible tactile
   ------------------------------------------------------------------------- */

function OptionItem({
  option,
  inputId,
  name,
  radio,
  checked,
  state,
  disabled,
  tone,
  baseUrls,
  onToggle,
}: {
  option: GuideAssessmentQuestion['options'][number]
  inputId: string
  name: string
  radio: boolean
  checked: boolean
  state: OptionState
  disabled: boolean
  tone: Tone
  baseUrls: GuideBaseUrls
  onToggle: (optionId: string) => void
}) {
  const t = toneClasses[tone]
  const feedbackId = `${inputId}-retour`
  const showFeedback = disabled && checked && Boolean(option.feedback)
  const marker =
    state === 'correct' || state === 'missed' ? (
      <span className="inline-flex shrink-0 items-center text-green-700">
        <CheckCircle2 aria-hidden="true" strokeWidth={2} className="size-5" />
        <span className="sr-only">{state === 'correct' ? 'Réponse correcte' : 'Réponse attendue'}</span>
      </span>
    ) : state === 'wrong' ? (
      <span className="inline-flex shrink-0 items-center text-gold-700">
        <XCircle aria-hidden="true" strokeWidth={2} className="size-5" />
        <span className="sr-only">Réponse incorrecte</span>
      </span>
    ) : null

  return (
    <li className="flex flex-col gap-1.5">
      <input
        id={inputId}
        type={radio ? 'radio' : 'checkbox'}
        name={name}
        value={option.id}
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(option.id)}
        aria-describedby={showFeedback ? feedbackId : undefined}
        className="peer sr-only"
      />
      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base leading-relaxed text-neutral-800',
          'transition-[border-color,background-color,box-shadow] duration-180 ease-out-expo',
          'peer-focus-visible:ring-[3px] peer-focus-visible:ring-blue-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white',
          'peer-disabled:cursor-default',
          state === 'idle' && checked ? cn(t.border, t.soft) : optionStateClasses[state],
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold uppercase',
            state === 'correct' || state === 'missed'
              ? 'bg-green-500 text-navy'
              : state === 'wrong'
                ? 'bg-gold-500 text-navy'
                : checked
                  ? cn(t.bg, t.onTone)
                  : 'bg-neutral-100 text-navy',
          )}
        >
          {option.id}
        </span>
        <span className="min-w-0 flex-1 self-center text-wrap">{renderGuideInline(option.text, { baseUrls })}</span>
        {marker ? <span className="self-center">{marker}</span> : null}
      </label>
      {showFeedback && option.feedback ? (
        <p id={feedbackId} className="pl-4 text-sm leading-relaxed text-neutral-700 sm:pl-[3.75rem]">
          {renderGuideInline(option.feedback, { baseUrls })}
        </p>
      ) : null}
    </li>
  )
}

/* ---------------------------------------------------------------------------
   Liste des options d'une question (récapitulatif) : « a. Texte »
   ------------------------------------------------------------------------- */

function OptionTexts({ question, letters, baseUrls }: { question: GuideAssessmentQuestion | undefined; letters: string[]; baseUrls: GuideBaseUrls }) {
  if (letters.length === 0) return <span className="italic text-neutral-500">Sans réponse</span>
  return (
    <ul className="flex flex-col gap-1">
      {letters.map((letter) => {
        const option = question?.options.find((entry) => entry.id === letter)
        return (
          <li key={letter} className="flex gap-2">
            <span className="w-4 shrink-0 font-display font-semibold uppercase text-navy">{letter}.</span>
            <span className="text-wrap">{option ? renderGuideInline(option.text, { baseUrls }) : letter}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------------------------------------------------------------------------
   Module « Testez votre maîtrise »
   ------------------------------------------------------------------------- */

/**
 * Autoévaluation d'un guide : carte d'introduction (durée, seuil, dernier résultat), questions une par une avec
 * retour immédiat calculé côté client, puis écran de résultat (score, niveau de maîtrise, sections à relire,
 * récapitulatif). Les réponses restent en mémoire du composant ; la tentative est enregistrée via `onSubmit`.
 */
export function GuideSelfAssessment({ guide, baseUrls, summary, onSubmit, onNavigateSection, headingId = 'autoevaluation-titre', className }: GuideSelfAssessmentProps) {
  const assessment = guide.selfAssessment
  const uid = React.useId()
  const reduced = useReducedMotionSafe()
  const [phase, setPhase] = React.useState<Phase>('intro')
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<GuideAnswers>({})
  const [selection, setSelection] = React.useState<string[]>([])
  const [feedback, setFeedback] = React.useState<QuestionResult | null>(null)
  const [localResult, setLocalResult] = React.useState<AssessmentResult | null>(null)
  const [save, setSave] = React.useState<SaveState>({ status: 'idle' })
  const requestRef = React.useRef(0)
  const stepHeadingRef = React.useRef<HTMLHeadingElement>(null)
  const feedbackRef = React.useRef<HTMLDivElement>(null)

  const questions = React.useMemo(() => assessment?.questions ?? [], [assessment])
  const questionsById = React.useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions])
  const total = questions.length
  const question = questions[index]
  const t = toneClasses[guide.tone]

  // Le titre de l'étape reçoit le focus à chaque changement d'écran (lecteurs d'écran, navigation clavier).
  React.useEffect(() => {
    if (phase === 'intro') return
    stepHeadingRef.current?.focus()
  }, [phase, index])

  // Après validation, le focus passe au retour immédiat (les options viennent d'être désactivées).
  React.useEffect(() => {
    if (feedback) feedbackRef.current?.focus()
  }, [feedback])

  const submit = React.useCallback(
    async (payload: GuideAnswers) => {
      const request = ++requestRef.current
      setSave({ status: 'saving' })
      try {
        const result = await onSubmit(payload)
        if (request !== requestRef.current) return
        setSave({ status: 'saved', result })
      } catch {
        if (request !== requestRef.current) return
        setSave({ status: 'error' })
      }
    },
    [onSubmit],
  )

  const start = React.useCallback(() => {
    requestRef.current += 1
    setAnswers({})
    setIndex(0)
    setSelection([])
    setFeedback(null)
    setLocalResult(null)
    setSave({ status: 'idle' })
    setPhase('question')
  }, [])

  const toggle = React.useCallback(
    (optionId: string) => {
      if (feedback || !question) return
      if (question.type === 'multiple') {
        setSelection((current) => (current.includes(optionId) ? current.filter((letter) => letter !== optionId) : [...current, optionId]))
      } else {
        setSelection([optionId])
      }
    },
    [feedback, question],
  )

  const validate = React.useCallback(() => {
    if (!question || selection.length === 0) return
    const given = [...selection].sort()
    setAnswers((current) => ({ ...current, [question.id]: given }))
    const scored = scoreSelfAssessment(guide, { [question.id]: given })
    setFeedback(scored?.questions.find((entry) => entry.id === question.id) ?? null)
  }, [guide, question, selection])

  const advance = React.useCallback(() => {
    if (index + 1 < total) {
      setIndex(index + 1)
      setSelection([])
      setFeedback(null)
      return
    }
    setLocalResult(scoreSelfAssessment(guide, answers))
    setPhase('result')
    void submit(answers)
  }, [answers, guide, index, submit, total])

  const scrollToTop = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [reduced])

  const navigate = React.useCallback((sectionId: string) => onNavigateSection?.(sectionId), [onNavigateSection])

  if (!assessment) return null

  const minutes = assessmentMinutes(total)
  const heading = (
    <div className="flex flex-col gap-3">
      <Ribbon tone={guide.tone} size="sm">
        Autoévaluation
      </Ribbon>
      <h2 id={headingId} className={cn('font-display font-semibold leading-tight tracking-tight text-navy text-wrap', phase === 'intro' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl')}>
        Testez votre maîtrise
      </h2>
    </div>
  )

  /* ------------------------------ Introduction ------------------------------ */
  if (phase === 'intro') {
    const last = summary?.last ?? null
    const best = summary?.best ?? null
    const attempts = summary?.count ?? 0
    const lastLevel = last ? masteryLevel(last.percent, assessment.passPercent) : null
    return (
      <Card pillar={guide.tone} className={cn('flex flex-col gap-5 p-5 sm:p-7', className)}>
        {heading}
        <p className="max-w-3xl text-base leading-relaxed text-neutral-700">{renderGuideInline(assessment.intro, { baseUrls })}</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600" aria-label="Caractéristiques du test">
          <MetaItem icon={ListChecks}>{plural(total, 'question', 'questions')}</MetaItem>
          <MetaItem icon={Timer}>Environ {minutes} min</MetaItem>
          <MetaItem icon={Target}>Maîtrisé à partir de {assessment.passPercent} % de bonnes réponses</MetaItem>
        </ul>
        {last && attempts > 0 ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <History aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-neutral-400" />
              <span>Votre dernier résultat :</span>
              <Badge variant={last.passed ? 'success' : 'warning'} size="md">
                {last.percent} % · {lastLevel ? masteryLabels[lastLevel] : ''}
              </Badge>
              <span>
                le <time dateTime={last.createdAt}>{formatGuideTimestamp(last.createdAt)}</time>
              </span>
            </p>
            <p className="pl-6 text-neutral-600">
              {best ? (
                <>
                  Meilleur résultat : <strong className="font-semibold text-navy">{best.percent} %</strong> ·{' '}
                </>
              ) : null}
              {plural(attempts, 'tentative', 'tentatives')}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3" data-print-hide="">
          <Button size="lg" onClick={start} rightIcon={<ArrowRight aria-hidden="true" />}>
            {attempts > 0 ? 'Refaire le test' : 'Commencer le test'}
          </Button>
        </div>
      </Card>
    )
  }

  /* -------------------------------- Questions -------------------------------- */
  if (phase === 'question' && question) {
    const radio = question.type !== 'multiple'
    const validated = feedback !== null
    const answered = index + (validated ? 1 : 0)
    const typeId = `${uid}-type-${index}`
    const name = `${uid}-${question.id}`
    const last = index + 1 >= total
    return (
      <Card pillar={guide.tone} className={cn('flex flex-col gap-6 p-5 sm:p-7', className)}>
        {heading}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 ref={stepHeadingRef} tabIndex={-1} className={cn('font-display text-lg font-semibold text-navy tabular-nums', focusableHeadingClassName)}>
              Question {index + 1} sur {total}
            </h3>
            <p id={typeId} className={cn('text-sm font-semibold', t.text)}>
              {questionTypeLabels[question.type]}
            </p>
          </div>
          <Progress value={(answered / total) * 100} tone={guide.tone} size="sm" label={`Progression du test : ${answered} sur ${total}`} />
        </div>

        <div key={question.id} className="flex flex-col gap-5 animate-rise">
          <fieldset className="flex min-w-0 flex-col gap-4" role={radio ? 'radiogroup' : undefined} aria-describedby={typeId}>
            <legend className="mb-4 text-lg font-semibold leading-snug text-navy text-wrap sm:text-xl">{renderGuideInline(question.prompt, { baseUrls })}</legend>
            <ul className="flex flex-col gap-2.5">
              {question.options.map((option) => {
                const chosen = selection.includes(option.id)
                return (
                  <OptionItem
                    key={option.id}
                    option={option}
                    inputId={`${name}-${option.id}`}
                    name={name}
                    radio={radio}
                    checked={chosen}
                    state={optionState(chosen, option.correct, validated)}
                    disabled={validated}
                    tone={guide.tone}
                    baseUrls={baseUrls}
                    onToggle={toggle}
                  />
                )
              })}
            </ul>
          </fieldset>

          {feedback ? (
            <div ref={feedbackRef} tabIndex={-1} className={cn('flex flex-col gap-3 animate-rise', focusableHeadingClassName)}>
              <Alert variant={feedback.correct ? 'success' : 'warning'} icon={feedback.correct ? CheckCircle2 : XCircle}>
                <AlertTitle className="text-base">{feedback.correct ? 'Bonne réponse' : 'Ce n’est pas la bonne réponse'}</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>{renderGuideInline(feedback.explanation, { baseUrls })}</p>
                  <p>
                    <a href={`#${feedback.sectionId}`} onClick={() => navigate(feedback.sectionId)} className={anchorLinkClassName}>
                      <BookOpen aria-hidden="true" strokeWidth={1.75} className="size-4" />
                      Relire : {feedback.sectionTitle}
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {validated ? (
              <Button size="lg" onClick={advance} rightIcon={<ArrowRight aria-hidden="true" />}>
                {last ? 'Voir mon résultat' : 'Question suivante'}
              </Button>
            ) : (
              <Button size="lg" onClick={validate} disabled={selection.length === 0}>
                Valider ma réponse
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  /* -------------------------------- Résultat -------------------------------- */
  const result = save.status === 'saved' ? save.result : localResult
  if (!result) return null
  const level = result.mastery
  const tone = masteryTones[level]
  const reviewId = `${uid}-relire`
  const detailId = `${uid}-detail`
  const recapId = `${uid}-recap`

  return (
    <Card pillar={tone} className={cn('flex flex-col gap-8 p-5 sm:p-7', className)}>
      {heading}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 animate-rise">
        <ProgressArc value={result.percent} tone={tone} size={148} label={`${result.correct} ${result.correct > 1 ? 'bonnes réponses' : 'bonne réponse'} sur ${result.total}`} className="self-center sm:self-start" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h3 ref={stepHeadingRef} tabIndex={-1} className={cn('font-display text-2xl font-semibold leading-tight tracking-tight text-navy', focusableHeadingClassName)}>
            Votre résultat
          </h3>
          <div>
            <Ribbon tone={tone} size="md">
              {masteryLabels[level]}
            </Ribbon>
          </div>
          <p className="text-base leading-relaxed text-neutral-700">{masteryMessages[level]}</p>
          <p className="text-sm text-neutral-600">
            Seuil de maîtrise : {result.passPercent} % de bonnes réponses.
          </p>
          {save.status === 'saving' ? (
            <p role="status" className="inline-flex items-center gap-2 text-sm text-neutral-600">
              <Loader2 aria-hidden="true" strokeWidth={1.75} className="size-4 animate-spin" />
              Enregistrement de votre résultat…
            </p>
          ) : save.status === 'saved' ? (
            <p role="status" className="inline-flex items-center gap-2 text-sm text-green-800">
              <CheckCircle2 aria-hidden="true" strokeWidth={1.75} className="size-4" />
              Résultat enregistré.
            </p>
          ) : save.status === 'error' ? (
            <Alert variant="warning" icon={CloudOff}>
              <AlertTitle>Résultat non enregistré</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <p>Votre score a été calculé sur cet appareil mais n’a pas pu être enregistré. Vérifiez votre connexion, puis réessayez.</p>
                <div>
                  <Button variant="outline" size="sm" onClick={() => void submit(answers)} leftIcon={<RotateCcw aria-hidden="true" />}>
                    Réessayer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <section aria-labelledby={reviewId} className="flex flex-col gap-3">
        <h3 id={reviewId} className="font-display text-lg font-semibold text-navy sm:text-xl">
          Sections à relire
        </h3>
        {result.toReview.length === 0 ? (
          <p className="inline-flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
            <CheckCircle2 aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 text-green-700" />
            Toutes vos réponses sont justes : aucune section à relire.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {result.toReview.map((section: SectionMastery) => (
              <li key={section.sectionId} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3">
                <BookOpen aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 text-gold-700" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="font-semibold text-navy text-wrap">{section.title}</p>
                  <p className="text-sm text-neutral-700">
                    {section.correct} sur {section.total} {section.total > 1 ? 'bonnes réponses' : 'bonne réponse'}
                  </p>
                </div>
                <a href={`#${section.sectionId}`} onClick={() => navigate(section.sectionId)} className={anchorLinkClassName}>
                  Relire
                  <ChevronRight aria-hidden="true" strokeWidth={2} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={detailId} className="flex flex-col gap-3">
        <h3 id={detailId} className="font-display text-lg font-semibold text-navy sm:text-xl">
          Détail par section
        </h3>
        <ul className="flex flex-col gap-3">
          {result.sections.map((section) => (
            <li key={section.sectionId} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-navy text-wrap">{section.title}</span>
                <span className="shrink-0 tabular-nums text-neutral-600">
                  {section.correct}/{section.total}
                </span>
              </div>
              <Progress value={section.percent} size="sm" tone={sectionTone(section.percent)} label={`${section.title} : ${section.correct} sur ${section.total}`} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={recapId} className="flex flex-col gap-3">
        <h3 id={recapId} className="font-display text-lg font-semibold text-navy sm:text-xl">
          Vos réponses en détail
        </h3>
        <Accordion type="multiple" className="flex flex-col gap-2">
          {result.questions.map((entry, position) => {
            const source = questionsById.get(entry.id)
            return (
              <AccordionItem key={entry.id} value={entry.id}>
                <AccordionTrigger className="text-base">
                  <span className="flex gap-3">
                    {entry.correct ? (
                      <CheckCircle2 aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-green-700" />
                    ) : (
                      <XCircle aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-gold-700" />
                    )}
                    <span className="text-wrap">
                      <span className="sr-only">{entry.correct ? 'Bonne réponse. ' : 'Réponse incorrecte. '}</span>
                      <span className="text-neutral-500">Question {position + 1} · </span>
                      {renderGuideInline(entry.prompt, { baseUrls })}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-[0.95rem]">
                  <dl className="flex flex-col gap-3 sm:pl-8">
                    <div className="flex flex-col gap-1">
                      <dt className="font-semibold text-navy">Votre réponse</dt>
                      <dd>
                        <OptionTexts question={source} letters={entry.given} baseUrls={baseUrls} />
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-semibold text-navy">{entry.expected.length > 1 ? 'Bonnes réponses' : 'Bonne réponse'}</dt>
                      <dd>
                        <OptionTexts question={source} letters={entry.expected} baseUrls={baseUrls} />
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-semibold text-navy">Explication</dt>
                      <dd className="flex flex-col gap-2">
                        <p>{renderGuideInline(entry.explanation, { baseUrls })}</p>
                        <p>
                          <a href={`#${entry.sectionId}`} onClick={() => navigate(entry.sectionId)} className={anchorLinkClassName}>
                            <BookOpen aria-hidden="true" strokeWidth={1.75} className="size-4" />
                            Relire : {entry.sectionTitle}
                          </a>
                        </p>
                      </dd>
                    </div>
                  </dl>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </section>

      <div className="flex flex-wrap gap-3" data-print-hide="">
        <Button size="lg" onClick={start} leftIcon={<RotateCcw aria-hidden="true" />}>
          Refaire le test
        </Button>
        <Button size="lg" variant="outline" onClick={scrollToTop} leftIcon={<ArrowUp aria-hidden="true" />}>
          Revenir en haut du guide
        </Button>
      </div>
    </Card>
  )
}
