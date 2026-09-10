'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock, LayoutList, ListOrdered, Play, RotateCcw, Save, Send, XCircle } from 'lucide-react'
import type { AnswerResponse } from '@fetrag/contracts'
import { questionTypeLabels } from '@fetrag/contracts'
import { formatDateTime } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, ArcRing, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Progress, StatusBadge, cn, toast } from '@fetrag/ui'
import { startQuizAction, submitQuizAction, type QuizSession, type QuizSubmission } from '@/server/learner/quiz-actions'
import type { QuizEntry } from '@/server/learner/quiz-queries'
import { QuestionRenderer, isAnswered } from './question-renderers'
import { QuizReview } from './quiz-review'

interface QuizRunnerProps {
  entry: QuizEntry
}

type Answers = Record<string, AnswerResponse>

const DRAFT_PREFIX = 'fetrag:quiz:draft:'

function draftKey(attemptId: string): string {
  return `${DRAFT_PREFIX}${attemptId}`
}

function readDraft(attemptId: string): Answers {
  try {
    const raw = window.localStorage.getItem(draftKey(attemptId))
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'answers' in parsed) {
      const answers = (parsed as { answers?: unknown }).answers
      return answers && typeof answers === 'object' ? (answers as Answers) : {}
    }
    return {}
  } catch {
    return {}
  }
}

function writeDraft(attemptId: string, answers: Answers): void {
  try {
    window.localStorage.setItem(draftKey(attemptId), JSON.stringify({ answers, savedAt: Date.now() }))
  } catch {
    // Stockage indisponible : le brouillon reste en mémoire.
  }
}

function clearDraft(attemptId: string): void {
  try {
    window.localStorage.removeItem(draftKey(attemptId))
  } catch {
    // ignore
  }
}

function formatCountdown(seconds: number): string {
  const s = Math.max(0, seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

/** Minuteur d'une tentative limitée dans le temps (annonce accessible, auto-soumission à zéro). */
function useCountdown(deadline: Date | null, onExpire: () => void): number | null {
  const [remaining, setRemaining] = useState<number | null>(() => (deadline ? Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000)) : null))
  const expiredRef = useRef(false)
  useEffect(() => {
    if (!deadline) return
    const tick = () => {
      const left = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [deadline, onExpire])
  return remaining
}

// -----------------------------------------------------------------------------
// Écran d'accueil de l'évaluation
// -----------------------------------------------------------------------------

function IntroScreen({ entry, onStart, starting, error }: { entry: QuizEntry; onStart: () => void; starting: boolean; error: string | null }) {
  const survey = entry.quiz.isSurvey
  const exhausted = entry.remainingAttempts === 0 && !entry.inProgressAttemptId
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-xs text-neutral-500">Questions</p>
          <p className="font-display text-3xl text-navy">{entry.quiz.questionCount}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-xs text-neutral-500">Temps imparti</p>
          <p className="font-display text-3xl text-navy">{entry.quiz.timeLimitMinutes ? `${entry.quiz.timeLimitMinutes} min` : 'Libre'}</p>
        </div>
        {!survey ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
            <p className="text-xs text-neutral-500">Seuil de réussite</p>
            <p className="font-display text-3xl text-navy">{entry.quiz.passScore} %</p>
          </div>
        ) : null}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
          <p className="text-xs text-neutral-500">Tentatives restantes</p>
          <p className="font-display text-3xl text-navy">
            {entry.remainingAttempts}
            <span className="text-base text-neutral-500"> / {entry.quiz.maxAttempts}</span>
          </p>
        </div>
      </div>

      {!entry.enrolled ? (
        <Alert variant="warning">
          <AlertTitle>Inscription requise</AlertTitle>
          <AlertDescription>
            Vous devez être inscrit à la formation pour répondre à cette évaluation.{' '}
            <Link href={`/cours/${entry.course.slug}`}>Voir la fiche de la formation</Link>.
          </AlertDescription>
        </Alert>
      ) : !entry.activity.isAvailable ? (
        <Alert variant="warning">
          <AlertTitle>Évaluation pas encore ouverte</AlertTitle>
          <AlertDescription>{entry.activity.availableFrom ? `Elle s’ouvrira le ${formatDateTime(entry.activity.availableFrom)}.` : 'Elle sera ouverte par votre formateur.'}</AlertDescription>
        </Alert>
      ) : exhausted ? (
        <Alert variant="info">
          <AlertTitle>Nombre maximal de tentatives atteint</AlertTitle>
          <AlertDescription>Vous avez utilisé vos {entry.quiz.maxAttempts} tentatives. Vos résultats restent consultables ci-dessous.</AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm leading-relaxed text-blue-900">
          <p className="font-semibold">Avant de commencer</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {entry.quiz.timeLimitMinutes ? <li>Le chronomètre démarre dès l’ouverture de la tentative et ne se met pas en pause.</li> : null}
            <li>Vos réponses sont enregistrées automatiquement sur cet appareil : en cas de coupure, reprenez là où vous étiez.</li>
            {!survey ? <li>La note est calculée à la soumission ; les compositions sont corrigées par le formateur.</li> : <li>Ce questionnaire est anonyme et sans note : vos réponses aident à améliorer la formation.</li>}
          </ul>
        </div>
      )}

      {error ? (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {entry.enrolled && entry.activity.isAvailable && !exhausted ? (
        <div>
          <Button type="button" variant="accent" size="lg" loading={starting} onClick={onStart} leftIcon={entry.inProgressAttemptId ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}>
            {entry.inProgressAttemptId ? 'Reprendre la tentative en cours' : survey ? 'Répondre au questionnaire' : 'Commencer l’évaluation'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Passage du quiz
// -----------------------------------------------------------------------------

function RunningScreen({ session, onSubmitted }: { session: QuizSession; onSubmitted: (result: QuizSubmission) => void }) {
  const attemptId = session.attempt.id
  const [answers, setAnswers] = useState<Answers>(() => readDraft(attemptId))
  const [mode, setMode] = useState<'single' | 'list'>(session.questions.length <= 4 ? 'list' : 'single')
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const submittingRef = useRef(false)

  const questions = session.questions
  const answeredCount = useMemo(() => questions.filter((q) => isAnswered(answers[q.id])).length, [answers, questions])
  const unanswered = questions.length - answeredCount

  // Brouillon local synchronisé à chaque changement.
  useEffect(() => {
    writeDraft(attemptId, answers)
    setSavedAt(Date.now())
  }, [answers, attemptId])

  const submit = useCallback(
    async (auto = false) => {
      if (submittingRef.current) return
      submittingRef.current = true
      setSubmitting(true)
      setError(null)
      const payload = questions.filter((q) => answers[q.id]).map((q) => ({ questionId: q.id, response: answers[q.id] as AnswerResponse }))
      const result = await submitQuizAction({ attemptId, activityId: session.quiz.activityId, answers: payload })
      if (!result.ok) {
        setError(result.error)
        setSubmitting(false)
        submittingRef.current = false
        if (auto) toast.error('Temps écoulé : la soumission a échoué. Réessayez.')
        return
      }
      clearDraft(attemptId)
      if (auto) toast.info('Temps écoulé : vos réponses ont été soumises automatiquement.')
      onSubmitted(result.data)
    },
    [answers, attemptId, onSubmitted, questions, session.quiz.activityId],
  )

  const onExpire = useCallback(() => {
    void submit(true)
  }, [submit])
  const remaining = useCountdown(session.attempt.deadline ? new Date(session.attempt.deadline) : null, onExpire)
  const urgent = remaining !== null && remaining <= 60

  function setAnswer(questionId: string, response: AnswerResponse) {
    setAnswers((prev) => ({ ...prev, [questionId]: response }))
  }

  function requestSubmit() {
    if (unanswered > 0) setConfirmOpen(true)
    else void submit()
  }

  const current = questions[index]

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-[calc(var(--header-height)+0.5rem)] z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="min-w-[10rem] flex-1">
          <Progress value={(answeredCount / Math.max(1, questions.length)) * 100} size="sm" tone="green" label={`${answeredCount} réponses sur ${questions.length}`} />
          <p className="mt-1 text-xs text-neutral-600">
            {answeredCount}/{questions.length} réponses · brouillon {savedAt ? 'enregistré' : 'en attente'}
            <Save className="ml-1 inline size-3 align-text-bottom text-neutral-400" aria-hidden="true" />
          </p>
        </div>
        {remaining !== null ? (
          <p className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-lg font-semibold tabular-nums', urgent ? 'bg-danger-soft text-danger' : 'bg-neutral-100 text-navy')} role="timer" aria-live={urgent ? 'assertive' : 'off'} aria-label={`Temps restant : ${formatCountdown(remaining)}`}>
            <Clock className="size-4" aria-hidden="true" />
            {formatCountdown(remaining)}
          </p>
        ) : null}
        <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 p-1" role="group" aria-label="Mode d’affichage">
          <button
            type="button"
            onClick={() => setMode('single')}
            aria-pressed={mode === 'single'}
            className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold', mode === 'single' ? 'bg-white text-blue-700 shadow-soft' : 'text-neutral-600')}
          >
            <ListOrdered className="size-4" aria-hidden="true" />
            Une par une
          </button>
          <button
            type="button"
            onClick={() => setMode('list')}
            aria-pressed={mode === 'list'}
            className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold', mode === 'list' ? 'bg-white text-blue-700 shadow-soft' : 'text-neutral-600')}
          >
            <LayoutList className="size-4" aria-hidden="true" />
            Toutes
          </button>
        </div>
      </div>

      {mode === 'single' && current ? (
        <div className="flex flex-col gap-5">
          <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => {
              const done = isAnswered(answers[q.id])
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Question ${i + 1}${done ? ', répondue' : ''}`}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                    i === index ? 'bg-blue-500 text-white' : done ? 'bg-green-100 text-green-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </nav>
          <QuestionCard question={current} number={index + 1} total={questions.length} value={answers[current.id]} onChange={(r) => setAnswer(current.id, r)} disabled={submitting} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="outline" disabled={index === 0 || submitting} onClick={() => setIndex((i) => Math.max(0, i - 1))} leftIcon={<ArrowLeft aria-hidden="true" />}>
              Précédente
            </Button>
            {index < questions.length - 1 ? (
              <Button type="button" variant="primary" disabled={submitting} onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} rightIcon={<ArrowRight aria-hidden="true" />}>
                Suivante
              </Button>
            ) : (
              <Button type="button" variant="accent" loading={submitting} onClick={requestSubmit} leftIcon={<Send aria-hidden="true" />}>
                Soumettre mes réponses
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} number={i + 1} total={questions.length} value={answers[q.id]} onChange={(r) => setAnswer(q.id, r)} disabled={submitting} />
          ))}
          <div className="flex justify-end">
            <Button type="button" variant="accent" size="lg" loading={submitting} onClick={requestSubmit} leftIcon={<Send aria-hidden="true" />}>
              Soumettre mes réponses
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Soumettre malgré des questions sans réponse ?</DialogTitle>
            <DialogDescription>
              {unanswered} question{unanswered > 1 ? 's restent' : ' reste'} sans réponse. Une fois soumise, la tentative ne peut plus être modifiée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Revenir aux questions
            </Button>
            <Button
              type="button"
              variant="accent"
              loading={submitting}
              onClick={() => {
                setConfirmOpen(false)
                void submit()
              }}
            >
              Soumettre quand même
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QuestionCard({ question, number, total, value, onChange, disabled }: { question: QuizSession['questions'][number]; number: number; total: number; value: AnswerResponse | undefined; onChange: (r: AnswerResponse) => void; disabled: boolean }) {
  const answered = isAnswered(value)
  return (
    <fieldset className={cn('rounded-2xl border bg-white p-5 shadow-soft sm:p-6', answered ? 'border-green-200' : 'border-neutral-200')}>
      <legend className="sr-only">
        Question {number} sur {total}
      </legend>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Question {number}/{total} · {questionTypeLabels[question.type]} · {question.points} pt{question.points > 1 ? 's' : ''}
          </p>
          <p className="mt-1 font-display text-lg font-semibold leading-snug text-navy">{question.type === 'FILL_BLANK' ? 'Complétez le texte' : question.prompt}</p>
          {question.type === 'MULTIPLE_CHOICE' ? <p className="mt-1 text-xs text-neutral-500">Plusieurs réponses possibles.</p> : null}
          {question.type === 'MATCHING' ? <p className="mt-1 text-xs text-neutral-500">Associez chaque élément à sa définition.</p> : null}
        </div>
        {answered ? <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-hidden="true" /> : null}
      </div>
      <QuestionRenderer question={question} value={value} onChange={onChange} disabled={disabled} />
    </fieldset>
  )
}

// -----------------------------------------------------------------------------
// Résultat
// -----------------------------------------------------------------------------

function ResultScreen({ result, entry, onRetry }: { result: QuizSubmission; entry: QuizEntry; onRetry: () => void }) {
  const remaining = Math.max(0, entry.remainingAttempts - 1)
  if (result.isSurvey) {
    return (
      <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-green-500 text-navy">
          <CheckCircle2 className="size-8" strokeWidth={2} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl">Merci pour vos réponses</h2>
        <p className="mx-auto mt-2 max-w-md text-neutral-600">Votre avis nourrit l’amélioration continue du programme de formation de la FETRAG. Cette activité est validée.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="primary">
            <Link href={`/apprendre/${entry.course.id}/${entry.lesson.id}?activite=${entry.activity.id}`}>Retour à la leçon</Link>
          </Button>
        </div>
      </div>
    )
  }
  const pending = result.pendingManualGrading > 0
  const percent = result.percent ?? 0
  const passed = result.passed === true
  return (
    <div className="flex flex-col gap-6">
      <div className={cn('grid grid-cols-1 gap-6 rounded-2xl border bg-white p-6 shadow-soft sm:grid-cols-[auto_1fr] sm:items-center sm:p-8', pending ? 'border-gold-200' : passed ? 'border-green-200' : 'border-neutral-200')}>
        <ArcRing size={150} stroke={12} progress={pending ? 0 : percent} tone={pending ? 'gold' : passed ? 'green' : 'blue'} className="mx-auto">
          {pending ? (
            <Clock className="size-10 text-gold-700" aria-hidden="true" />
          ) : (
            <span className="font-display text-4xl font-semibold text-navy">
              {percent}
              <span className="text-lg text-neutral-500">%</span>
            </span>
          )}
        </ArcRing>
        <div>
          <StatusBadge status={pending ? 'SUBMITTED' : passed ? 'COMPLETED' : 'FAILED'} labels={{ SUBMITTED: 'Correction en cours', COMPLETED: 'Réussie', FAILED: 'Non réussie' }} />
          <h2 className="mt-3 text-2xl">{pending ? 'Réponses soumises' : passed ? 'Bravo, évaluation réussie' : 'Évaluation non réussie'}</h2>
          <p className="mt-2 text-neutral-600">
            {pending
              ? `${result.pendingManualGrading} composition${result.pendingManualGrading > 1 ? 's' : ''} en attente de correction par le formateur. Votre score final sera notifié.`
              : `Score : ${result.score ?? 0}/${result.maxScore ?? 0} points (${percent} %) · seuil de réussite ${result.passScore} %.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="primary">
              <Link href={`/apprendre/${entry.course.id}/${entry.lesson.id}?activite=${entry.activity.id}`}>
                <ArrowLeft aria-hidden="true" />
                Retour à la leçon
              </Link>
            </Button>
            {!passed && !pending && remaining > 0 ? (
              <Button type="button" variant="accent" onClick={onRetry} leftIcon={<RotateCcw aria-hidden="true" />}>
                Nouvelle tentative ({remaining} restante{remaining > 1 ? 's' : ''})
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {result.review ? (
        <section aria-labelledby="correction-title">
          <h3 id="correction-title" className="mb-4 text-xl">
            Correction détaillée
          </h3>
          <QuizReview review={result.review} />
        </section>
      ) : !result.showCorrection ? (
        <p className="text-sm text-neutral-500">La correction détaillée n’est pas affichée pour cette évaluation.</p>
      ) : null}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Orchestrateur
// -----------------------------------------------------------------------------

/** Passage complet d'une évaluation : accueil, tentative (minuteur, brouillon), résultat et correction. */
export function QuizRunner({ entry }: QuizRunnerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [result, setResult] = useState<QuizSubmission | null>(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setStarting(true)
    setError(null)
    const response = await startQuizAction(entry.activity.id)
    setStarting(false)
    if (!response.ok) {
      setError(response.error)
      return
    }
    setSession(response.data)
    setPhase('running')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSubmitted(submission: QuizSubmission) {
    setResult(submission)
    setPhase('result')
    router.refresh()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (phase === 'running' && session) return <RunningScreen session={session} onSubmitted={onSubmitted} />
  if (phase === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        entry={entry}
        onRetry={() => {
          setResult(null)
          setSession(null)
          void start()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <IntroScreen entry={entry} onStart={start} starting={starting} error={error} />

      {entry.attempts.length > 0 ? (
        <section aria-labelledby="attempts-title">
          <h2 id="attempts-title" className="mb-3 text-xl">
            Mes tentatives
          </h2>
          <ol className="flex flex-col gap-2">
            {entry.attempts.map((attempt) => {
              const finished = attempt.status !== 'IN_PROGRESS'
              return (
                <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className={cn('inline-flex size-9 items-center justify-center rounded-full', attempt.passed ? 'bg-green-50 text-green-700' : finished && attempt.passed === false ? 'bg-danger-soft text-danger' : 'bg-neutral-100 text-neutral-600')}>
                      {attempt.passed ? <CheckCircle2 className="size-5" aria-hidden="true" /> : finished && attempt.passed === false ? <XCircle className="size-5" aria-hidden="true" /> : <ClipboardCheck className="size-5" aria-hidden="true" />}
                    </span>
                    <div>
                      <p className="font-semibold text-navy">Tentative {attempt.number}</p>
                      <p className="text-xs text-neutral-500">{attempt.submittedAt ? formatDateTime(attempt.submittedAt) : `Commencée le ${formatDateTime(attempt.startedAt)}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.percent !== null && !entry.quiz.isSurvey ? <span className="font-display text-xl text-navy">{attempt.percent} %</span> : null}
                    <StatusBadge status={attempt.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : attempt.passed === null ? 'SUBMITTED' : attempt.passed ? 'COMPLETED' : 'FAILED'} size="sm" labels={{ IN_PROGRESS: 'En cours', SUBMITTED: entry.quiz.isSurvey ? 'Envoyé' : 'À corriger', COMPLETED: 'Réussie', FAILED: 'Non réussie' }} />
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}

      {entry.lastReview ? (
        <section aria-labelledby="last-review-title">
          <h2 id="last-review-title" className="mb-3 text-xl">
            Correction de la dernière tentative
          </h2>
          <QuizReview review={entry.lastReview} />
        </section>
      ) : entry.attempts.some((a) => a.status !== 'IN_PROGRESS') && !entry.quiz.showCorrection && !entry.quiz.isSurvey ? (
        <Alert variant="info" icon={AlertTriangle}>
          <AlertDescription>La correction détaillée n’est pas affichée pour cette évaluation : seul le score est communiqué.</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
