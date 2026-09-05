'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, CloudOff, Loader2, Save, WifiOff } from 'lucide-react'
import type { CompletionRule } from '@fetrag/db'
import { Button, cn, toast } from '@fetrag/ui'
import { reportProgressAction } from '@/server/learner/progress-actions'
import type { QueuedProgress } from '@/server/learner/types'

const QUEUE_KEY = 'fetrag:progress:queue'
const FLUSH_INTERVAL_MS = 30_000
const BEACON_URL = '/apprendre/beacon'
/** Part de la durée indicative exigée par la règle TIME_SPENT (identique à lms-core). */
const TIME_SPENT_THRESHOLD = 0.8

export interface ProgressTrackerProps {
  enrollmentId: string
  activityId: string
  courseId: string
  lessonId: string
  completed: boolean
  completionRule: CompletionRule
  durationMinutes: number | null
  /** Temps déjà comptabilisé (secondes) pour cette activité. */
  timeSpentSeconds: number
  isAvailable: boolean
  /** Le cours est déjà terminé : la remontée reste possible (révision) mais aucun bouton n'est proposé. */
  courseCompleted: boolean
}

function readQueue(): QueuedProgress[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as QueuedProgress[]) : []
  } catch {
    return []
  }
}

function writeQueue(items: QueuedProgress[]): void {
  try {
    if (items.length === 0) window.localStorage.removeItem(QUEUE_KEY)
    else window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-50)))
  } catch {
    // Stockage indisponible (navigation privée) : la progression sera renvoyée au prochain rapport.
  }
}

function ruleDescription(rule: CompletionRule, durationMinutes: number | null): string {
  switch (rule) {
    case 'VIEW':
      return 'Cette activité est validée dès sa consultation.'
    case 'TIME_SPENT':
      return durationMinutes
        ? `Validée après ${Math.ceil(durationMinutes * TIME_SPENT_THRESHOLD)} min de consultation (durée indicative : ${durationMinutes} min).`
        : 'Validée en la marquant comme terminée.'
    case 'PASS_SCORE':
      return 'Validée en réussissant l’évaluation associée.'
    case 'SUBMIT':
      return 'Validée à la remise de votre travail.'
    case 'ATTEND':
      return 'Validée par l’émargement de votre présence à la séance.'
    case 'MANUAL':
      return 'Validée par le formateur.'
    default:
      return ''
  }
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return minutes > 0 ? `${minutes} min ${String(seconds).padStart(2, '0')} s` : `${seconds} s`
}

/**
 * Remontée de progression idempotente : temps de consultation envoyé toutes les 30 s (onglet visible),
 * à la sortie via `navigator.sendBeacon`, avec file locale rejouée au retour en ligne. Propose
 * « Marquer comme terminé » pour les règles VIEW / TIME_SPENT.
 */
export function ProgressTracker(props: ProgressTrackerProps) {
  const router = useRouter()
  const [completed, setCompleted] = useState(props.completed)
  const [online, setOnline] = useState(true)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'queued' | 'error'>('idle')
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [marking, setMarking] = useState(false)

  const pendingRef = useRef(0)
  const sentOnceRef = useRef(false)
  const busyRef = useRef(false)
  const propsRef = useRef(props)
  propsRef.current = props

  const buildReport = useCallback(
    (seconds: number, markComplete?: boolean): QueuedProgress => ({
      enrollmentId: propsRef.current.enrollmentId,
      activityId: propsRef.current.activityId,
      courseId: propsRef.current.courseId,
      lessonId: propsRef.current.lessonId,
      timeSpentSeconds: seconds,
      completed: markComplete,
      queuedAt: Date.now(),
    }),
    [],
  )

  /** Envoie un rapport via la Server Action ; en échec ou hors ligne, le met en file locale. */
  const send = useCallback(
    async (report: QueuedProgress, options: { silent?: boolean } = {}): Promise<boolean> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        writeQueue([...readQueue(), report])
        setStatus('queued')
        return false
      }
      setStatus('saving')
      const result = await reportProgressAction({
        enrollmentId: report.enrollmentId,
        activityId: report.activityId,
        courseId: report.courseId,
        lessonId: report.lessonId,
        timeSpentSeconds: report.timeSpentSeconds,
        completed: report.completed,
      })
      if (!result.ok) {
        if (result.code === 'INTERNAL_ERROR') {
          writeQueue([...readQueue(), report])
          setStatus('queued')
        } else {
          setStatus('error')
          if (!options.silent) toast.error(result.error)
        }
        return false
      }
      sentOnceRef.current = true
      setStatus('saved')
      if (result.data.completed && !completed) {
        setCompleted(true)
        if (!options.silent) toast.success('Activité terminée.')
        router.refresh()
      }
      if (result.data.justCompletedCourse) {
        toast.success('Félicitations : vous avez terminé cette formation.', { duration: 8000 })
        router.refresh()
      }
      return true
    },
    [completed, router],
  )

  /** Rejoue la file locale (au retour en ligne, au montage). */
  const replayQueue = useCallback(async () => {
    if (busyRef.current) return
    const queue = readQueue()
    if (queue.length === 0) return
    busyRef.current = true
    try {
      const remaining = [...queue]
      while (remaining.length > 0) {
        const next = remaining[0]
        if (!next) break
        const ok = await send(next, { silent: true })
        if (!ok) break
        remaining.shift()
        writeQueue(remaining)
      }
      if (remaining.length === 0) setStatus('saved')
    } finally {
      busyRef.current = false
    }
  }, [send])

  /** Envoie le temps accumulé (0 s au premier passage pour enregistrer la consultation). */
  const flush = useCallback(async () => {
    if (busyRef.current) return
    const seconds = pendingRef.current
    if (seconds === 0 && sentOnceRef.current) return
    busyRef.current = true
    pendingRef.current = 0
    try {
      const ok = await send(buildReport(seconds), { silent: true })
      if (!ok) sentOnceRef.current = true
    } finally {
      busyRef.current = false
    }
  }, [buildReport, send])

  // Connectivité + rejeu de la file.
  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => {
      setOnline(true)
      void replayQueue()
    }
    const goOffline = () => {
      setOnline(false)
      setStatus('queued')
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    void replayQueue()
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [replayQueue])

  // Premier rapport (consultation) puis compteur de temps visible et envoi périodique.
  useEffect(() => {
    if (!props.isAvailable) return
    pendingRef.current = 0
    sentOnceRef.current = false
    setSessionSeconds(0)
    void flush()

    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        pendingRef.current += 1
        setSessionSeconds((s) => s + 1)
      }
    }, 1000)
    const periodic = window.setInterval(() => {
      void flush()
    }, FLUSH_INTERVAL_MS)

    const beacon = () => {
      const seconds = pendingRef.current
      const queued = readQueue()
      if (seconds === 0 && queued.length === 0) return
      const reports = [...queued, buildReport(seconds)].map((r) => ({
        enrollmentId: r.enrollmentId,
        activityId: r.activityId,
        timeSpentSeconds: r.timeSpentSeconds,
        completed: r.completed,
      }))
      const blob = new Blob([JSON.stringify({ reports })], { type: 'application/json' })
      const accepted = navigator.sendBeacon(BEACON_URL, blob)
      if (accepted) {
        pendingRef.current = 0
        writeQueue([])
      } else if (seconds > 0) {
        writeQueue([...queued, buildReport(seconds)])
        pendingRef.current = 0
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') beacon()
    }
    window.addEventListener('pagehide', beacon)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(tick)
      window.clearInterval(periodic)
      window.removeEventListener('pagehide', beacon)
      document.removeEventListener('visibilitychange', onVisibility)
      // Changement d'activité dans l'application : on remonte le temps restant sans bloquer la navigation.
      beacon()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.activityId, props.enrollmentId, props.isAvailable])

  const canMark = !completed && !props.courseCompleted && props.isAvailable && (props.completionRule === 'VIEW' || props.completionRule === 'TIME_SPENT')

  async function markComplete() {
    setMarking(true)
    try {
      const seconds = pendingRef.current
      pendingRef.current = 0
      const ok = await send(buildReport(seconds, true))
      if (ok && !completed) {
        // Règle TIME_SPENT non atteinte : le serveur n'a pas validé, on l'explique.
        setStatus('saved')
      }
    } finally {
      setMarking(false)
    }
  }

  const totalSeconds = props.timeSpentSeconds + sessionSeconds
  const threshold = props.completionRule === 'TIME_SPENT' && props.durationMinutes ? Math.ceil(props.durationMinutes * 60 * TIME_SPENT_THRESHOLD) : 0

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
            completed ? 'bg-green-500 text-navy' : 'bg-white text-neutral-500 ring-1 ring-neutral-200',
          )}
        >
          {completed ? <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden="true" /> : status === 'saving' ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Save className="size-5" strokeWidth={1.75} aria-hidden="true" />}
        </span>
        <div className="text-sm">
          <p className="font-semibold text-navy">{completed ? 'Activité terminée' : 'Activité en cours'}</p>
          <p className="text-neutral-600">{ruleDescription(props.completionRule, props.durationMinutes)}</p>
          <p className="mt-1 text-xs text-neutral-500">
            Temps de consultation : {formatSeconds(totalSeconds)}
            {threshold > 0 && !completed ? ` · requis : ${formatSeconds(threshold)}` : ''}
            {status === 'saved' ? ' · progression enregistrée' : status === 'queued' ? ' · en attente de connexion' : status === 'error' ? ' · enregistrement impossible' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        {!online ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800" role="status">
            <WifiOff className="size-3.5" aria-hidden="true" />
            Hors ligne : progression conservée localement
          </span>
        ) : status === 'queued' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600" role="status">
            <CloudOff className="size-3.5" aria-hidden="true" />
            Envoi différé
          </span>
        ) : null}
        {canMark ? (
          <Button type="button" variant="accent" size="md" loading={marking} onClick={markComplete} leftIcon={<CheckCircle2 aria-hidden="true" />}>
            Marquer comme terminé
          </Button>
        ) : null}
      </div>
    </div>
  )
}
