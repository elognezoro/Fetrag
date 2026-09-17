import Link from 'next/link'
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  ListChecks,
  Lock,
  MapPin,
  MessagesSquare,
  Mic2,
  PlayCircle,
  Radio,
  Video,
} from 'lucide-react'
import { sanitizeHtml, stripHtml } from '@fetrag/cms'
import { activityTypeLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatDuration, formatTime } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Prose, StatusBadge, cn } from '@fetrag/ui'
import { isPdf, readMediaContent, readString, readStringList, readTextHtml, vimeoEmbedUrl, youtubeEmbedUrl } from '@/server/learner/content'
import type { LessonViewResult } from '@/server/learner/queries'
import { ActivityIcon } from './activity-icon'
import { LowBandwidthPanel } from './low-bandwidth-panel'
import { SpeakButton } from './speak-button'

interface ActivityRendererProps {
  result: LessonViewResult
}

/** Encadré de consignes (instructions du formateur), avec lecture audio. */
function Instructions({ text }: { text: string | null }) {
  if (!text) return null
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-blue-900">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 font-semibold">
          <ListChecks className="size-4" aria-hidden="true" />
          Consignes
        </p>
        <SpeakButton text={text} label="Écouter la consigne" />
      </div>
      <p>{text}</p>
    </div>
  )
}

function EmbedFrame({ src, title, className }: { src: string; title: string; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-soft', className)}>
      <iframe
        src={src}
        title={title}
        className="aspect-video w-full"
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

function TextActivity({ result }: ActivityRendererProps) {
  const html = readTextHtml(result.rawContent)
  if (!html.trim()) return <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">Le contenu de cette lecture sera publié prochainement.</p>
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <SpeakButton text={stripHtml(html)} label="Écouter le texte" />
      </div>
      <Prose html={sanitizeHtml(html)} as="article" size="lg" className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-8" />
    </div>
  )
}

function VideoActivity({ result }: ActivityRendererProps) {
  const media = readMediaContent(result.rawContent)
  const title = result.view.activity.title
  let player: React.ReactNode = null
  if (media.url) {
    const youtube = youtubeEmbedUrl(media.url)
    const vimeo = youtube ? null : vimeoEmbedUrl(media.url)
    if (youtube || vimeo) {
      player = <EmbedFrame src={(youtube ?? vimeo) as string} title={`Vidéo : ${title}`} />
    } else {
      player = (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-soft">
          <video controls preload="metadata" poster={media.posterUrl ?? undefined} className="aspect-video w-full" src={media.url}>
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        </div>
      )
    }
  }
  return (
    <div className="flex flex-col gap-5">
      {player ?? (
        <Alert variant="info" icon={Video}>
          <AlertTitle>Vidéo non disponible en ligne pour le moment</AlertTitle>
          <AlertDescription>La séquence sera mise en ligne prochainement. En attendant, la transcription intégrale ci-dessous couvre l’ensemble du contenu.</AlertDescription>
        </Alert>
      )}
      <LowBandwidthPanel alternative={result.lowBandwidth} fallbackTranscript={media.transcript} defaultOpen={!player} />
    </div>
  )
}

function AudioActivity({ result }: ActivityRendererProps) {
  const media = readMediaContent(result.rawContent)
  return (
    <div className="flex flex-col gap-5">
      {media.url ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-navy">
            <PlayCircle className="size-4 text-green-700" aria-hidden="true" />
            Capsule audio
            {result.view.activity.durationMinutes ? <span className="font-normal text-neutral-500">· {formatDuration(result.view.activity.durationMinutes)}</span> : null}
          </p>
          <audio controls preload="none" src={media.url} className="w-full">
            Votre navigateur ne prend pas en charge la lecture audio.
          </audio>
        </div>
      ) : (
        <Alert variant="info">
          <AlertTitle>Capsule audio non disponible en ligne pour le moment</AlertTitle>
          <AlertDescription>Lisez la transcription intégrale ci-dessous : elle reprend l’ensemble du propos.</AlertDescription>
        </Alert>
      )}
      <LowBandwidthPanel alternative={result.lowBandwidth} fallbackTranscript={media.transcript} defaultOpen={!media.url} />
    </div>
  )
}

function FileActivity({ result }: ActivityRendererProps) {
  const file = result.file
  const label = readString(result.rawContent, 'label') ?? result.view.activity.resource?.title ?? file?.fileName ?? 'Document'
  if (!file || !file.viewUrl) {
    return (
      <Alert variant="warning">
        <AlertTitle>Document indisponible</AlertTitle>
        <AlertDescription>Le fichier n’a pas encore été déposé par l’équipe pédagogique. Revenez plus tard ou contactez votre formateur.</AlertDescription>
      </Alert>
    )
  }
  const pdf = isPdf(file.viewUrl, file.mimeType)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
        <div className="flex min-w-0 items-center gap-3">
          <ActivityIcon type="FILE" badge />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{label}</p>
            <p className="text-xs text-neutral-500">
              {file.mimeType ?? 'Document'}
              {file.isExternal ? ' · source externe' : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={file.viewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              Ouvrir
            </a>
          </Button>
          {file.downloadUrl ? (
            <Button asChild variant="primary" size="sm">
              <a href={file.downloadUrl} download={!file.isExternal ? file.fileName ?? undefined : undefined} target={file.isExternal ? '_blank' : undefined} rel="noopener noreferrer">
                <Download aria-hidden="true" />
                Télécharger
              </a>
            </Button>
          ) : null}
        </div>
      </div>
      {pdf ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-soft">
          <iframe src={file.viewUrl} title={`Aperçu du document : ${label}`} className="h-[70vh] min-h-[420px] w-full bg-white" loading="lazy" />
        </div>
      ) : null}
      <LowBandwidthPanel alternative={result.lowBandwidth} />
    </div>
  )
}

function LinkActivity({ result }: ActivityRendererProps) {
  const media = readMediaContent(result.rawContent)
  if (!media.url) return <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">Le lien de cette ressource n’a pas encore été renseigné.</p>
  let host = media.url
  try {
    host = new URL(media.url).hostname
  } catch {
    host = media.url
  }
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
    >
      <ActivityIcon type="LINK" badge />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-navy group-hover:text-blue-700">{media.label ?? 'Consulter la ressource'}</span>
        <span className="block truncate text-xs text-neutral-500">{host}</span>
      </span>
      <ArrowUpRight className="size-5 shrink-0 text-blue-600" aria-hidden="true" />
      <span className="sr-only">(s’ouvre dans un nouvel onglet)</span>
    </a>
  )
}

function PresentationActivity({ result }: ActivityRendererProps) {
  const media = readMediaContent(result.rawContent)
  const src = media.embedUrl ?? result.file?.viewUrl ?? media.url
  if (!src) return <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">La présentation sera publiée prochainement.</p>
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-soft">
        <iframe src={src} title={`Présentation : ${result.view.activity.title}`} className="h-[70vh] min-h-[420px] w-full bg-white" loading="lazy" allowFullScreen />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={result.file?.downloadUrl ?? media.url ?? src} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            Ouvrir dans un nouvel onglet
          </a>
        </Button>
      </div>
      <LowBandwidthPanel alternative={result.lowBandwidth} />
    </div>
  )
}

function QuizActivity({ result }: ActivityRendererProps) {
  const quiz = result.view.activity.quiz
  const attempts = result.quizAttempts
  const survey = result.view.activity.type === 'SURVEY' || quiz?.isSurvey
  const exhausted = attempts !== null && attempts.remaining === 0
  const intro = readString(result.rawContent, 'intro')
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-4">
        <ActivityIcon type={survey ? 'SURVEY' : 'QUIZ'} badge className="size-11 bg-gold-50 text-gold-800" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl">{survey ? 'Questionnaire de satisfaction' : 'Évaluation'}</h3>
          {quiz?.description ? <p className="mt-1 text-sm text-neutral-600">{quiz.description}</p> : null}
          {intro ? <p className="mt-1 text-sm text-neutral-600">{intro}</p> : null}
        </div>
      </div>
      {/* Indicateurs et action en pleine largeur sur mobile ; alignés sous le titre dès sm (pastille 44 px + espace 16 px). */}
      <div className="sm:pl-[3.75rem]">
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Questions</dt>
            <dd className="whitespace-nowrap font-display text-2xl text-navy">{quiz?._count.questions ?? 0}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Durée</dt>
            <dd className="whitespace-nowrap font-display text-2xl text-navy">{quiz?.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'Libre'}</dd>
          </div>
          {!survey ? (
            <div className="rounded-xl bg-neutral-50 p-3">
              <dt className="text-xs text-neutral-500">Seuil de réussite</dt>
              <dd className="whitespace-nowrap font-display text-2xl text-navy">{quiz?.passScore ?? 60} %</dd>
            </div>
          ) : null}
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Tentatives restantes</dt>
            <dd className="whitespace-nowrap font-display text-2xl text-navy">
              {attempts ? attempts.remaining : quiz?.maxAttempts ?? '-'}
              <span className="text-sm text-neutral-500"> / {quiz?.maxAttempts ?? '-'}</span>
            </dd>
          </div>
        </dl>
        {attempts?.best !== null && attempts?.best !== undefined && !survey ? (
          <p className="mt-3 text-sm text-neutral-700">
            Meilleur score : <span className="font-semibold text-navy">{attempts.best} %</span>
            {result.view.completion?.completed ? <Badge variant="success" size="sm" className="ml-2">Validée</Badge> : null}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant={exhausted ? 'outline' : 'primary'} size="md" className="w-full sm:w-auto">
            <Link href={`/evaluations/${result.view.activity.id}`}>
              <ClipboardCheck aria-hidden="true" />
              {exhausted ? 'Consulter mes résultats' : attempts && attempts.total > 0 ? 'Nouvelle tentative' : survey ? 'Répondre au questionnaire' : 'Commencer l’évaluation'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function AssignmentActivity({ result }: ActivityRendererProps) {
  const assignment = result.view.activity.assignment
  const state = result.assignmentState
  const stateLabels: Record<string, string> = { todo: 'À faire', draft: 'Brouillon', submitted: 'Remis', late: 'Remis en retard', graded: 'Corrigé', returned: 'À reprendre' }
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-4">
        <ActivityIcon type="ASSIGNMENT" badge className="size-11" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl">Devoir</h3>
          {assignment?.description ? <p className="mt-1 text-sm text-neutral-600">{assignment.description}</p> : null}
        </div>
      </div>
      <div className="sm:pl-[3.75rem]">
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Date limite</dt>
            <dd className="font-semibold text-navy">{state?.dueAt ? formatDateTime(state.dueAt) : 'Aucune'}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Barème</dt>
            <dd className="font-semibold text-navy">/{assignment?.maxScore ?? 20}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <dt className="text-xs text-neutral-500">Statut</dt>
            <dd className="font-semibold text-navy">
              {state ? stateLabels[state.state] ?? state.state : 'À faire'}
              {state?.score !== null && state?.score !== undefined ? ` · ${state.score}/${state.maxScore}` : ''}
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
            <Link href={`/devoirs/${assignment?.id ?? ''}`}>
              <ClipboardList aria-hidden="true" />
              {state?.state === 'graded' ? 'Voir la correction' : state?.state === 'submitted' || state?.state === 'late' ? 'Voir ma remise' : 'Ouvrir le devoir'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ForumActivity({ result }: ActivityRendererProps) {
  const prompt = readString(result.rawContent, 'prompt') ?? readString(result.rawContent, 'intro')
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-4">
        <ActivityIcon type="FORUM" badge className="size-11 bg-green-50 text-green-800" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl">Espace d’échange</h3>
        </div>
      </div>
      <div className="sm:pl-[3.75rem]">
        {prompt ? (
          <blockquote className="mt-3 rounded-xl border-l-4 border-gold-500 bg-gold-50 px-4 py-3 font-display text-lg text-navy">{prompt}</blockquote>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {result.forumSlug ? (
            <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
              <Link href={`/forums/${result.forumSlug}`}>
                <MessagesSquare aria-hidden="true" />
                Participer au forum
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-neutral-600">Le forum de cette formation sera ouvert à l’ouverture de votre cohorte.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Fenêtre d'activation du lien de classe virtuelle : 15 minutes avant le début jusqu'à la fin. */
function isLiveNow(startsAt: Date, endsAt: Date, now: number): boolean {
  return now >= startsAt.getTime() - 15 * 60 * 1000 && now <= endsAt.getTime()
}

function LiveSessionActivity({ result }: ActivityRendererProps) {
  const now = Date.now()
  const format = readString(result.rawContent, 'format')
  const agenda = readStringList(result.rawContent, 'agenda')
  const cohortId = result.enrollment.cohortId
  const all = result.view.activity.liveSessions
  const matching = cohortId ? all.filter((s) => !s.trainingSession || s.trainingSession.cohortId === cohortId) : all
  const sessions = matching.length > 0 ? matching : all
  const formatLabel = format === 'in_person' ? sessionModeLabels.IN_PERSON : format === 'virtual' ? sessionModeLabels.VIRTUAL : format === 'hybrid' ? sessionModeLabels.HYBRID : null
  return (
    <div className="flex flex-col gap-4">
      {agenda.length > 0 || formatLabel ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <ActivityIcon type="LIVE_SESSION" badge className="size-11 bg-gold-50 text-gold-800" />
            <div>
              <h3 className="text-xl">Séance en direct</h3>
              {formatLabel ? <p className="text-sm text-neutral-600">{formatLabel}</p> : null}
            </div>
          </div>
          {agenda.length > 0 ? (
            <ol className="mt-4 flex flex-col gap-2">
              {agenda.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="font-display text-base font-semibold text-blue-600">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <Alert variant="info" icon={CalendarClock}>
          <AlertTitle>Aucune date programmée pour le moment</AlertTitle>
          <AlertDescription>La coordination fixera la date de cette séance avec votre cohorte. Vous recevrez une convocation par notification et par email.</AlertDescription>
        </Alert>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => {
            const live = isLiveNow(session.startsAt, session.endsAt, now)
            const past = session.endsAt.getTime() < now
            const meetingUrl = session.meetingUrl ?? session.trainingSession?.meetingUrl ?? null
            const location = session.trainingSession?.location ?? null
            return (
              <li key={session.id} className={cn('rounded-2xl border bg-white p-5 shadow-soft', live ? 'border-green-400 ring-2 ring-green-500/30' : 'border-neutral-200')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-navy">{session.title}</h4>
                      {live ? (
                        <Badge variant="success" size="sm">
                          <Radio aria-hidden="true" />
                          En direct
                        </Badge>
                      ) : past ? (
                        <StatusBadge status="COMPLETED" size="sm" labels={{ COMPLETED: 'Passée' }} />
                      ) : (
                        <StatusBadge status="SCHEDULED" size="sm" labels={{ SCHEDULED: 'À venir' }} />
                      )}
                    </div>
                    <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
                      <div className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-4 text-blue-600" aria-hidden="true" />
                        <dt className="sr-only">Date</dt>
                        <dd>
                          {formatDate(session.startsAt)} · {formatTime(session.startsAt)} - {formatTime(session.endsAt)}
                        </dd>
                      </div>
                      {session.speakerName ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Mic2 className="size-4 text-gold-700" aria-hidden="true" />
                          <dt className="sr-only">Intervenant</dt>
                          <dd>{session.speakerName}</dd>
                        </div>
                      ) : null}
                      {location ? (
                        <div className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-green-700" aria-hidden="true" />
                          <dt className="sr-only">Lieu</dt>
                          <dd>{location}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meetingUrl ? (
                      live ? (
                        <Button asChild variant="accent" size="sm">
                          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
                            <Video aria-hidden="true" />
                            Rejoindre la classe virtuelle
                          </a>
                        </Button>
                      ) : !past ? (
                        <Button type="button" variant="outline" size="sm" disabled title="Le lien sera actif 15 minutes avant le début">
                          <Lock aria-hidden="true" />
                          Lien actif 15 min avant
                        </Button>
                      ) : null
                    ) : null}
                    {session.replayUrl ? (
                      <Button asChild variant="secondary" size="sm">
                        <a href={session.replayUrl} target="_blank" rel="noopener noreferrer">
                          <PlayCircle aria-hidden="true" />
                          Replay
                        </a>
                      </Button>
                    ) : null}
                    {session.transcriptUrl ? (
                      <Button asChild variant="ghost" size="sm">
                        <a href={session.transcriptUrl} target="_blank" rel="noopener noreferrer">
                          <FileText aria-hidden="true" />
                          Transcription
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="text-xs text-neutral-500">Votre présence est enregistrée par le formateur (émargement) et valide automatiquement cette activité.</p>
    </div>
  )
}

function InteractiveActivity({ result }: ActivityRendererProps) {
  const src = readString(result.rawContent, 'embedUrl') ?? readString(result.rawContent, 'packageUrl') ?? readString(result.rawContent, 'url')
  const heightRaw = (result.rawContent as Record<string, unknown> | null)?.height
  const height = typeof heightRaw === 'number' && heightRaw > 200 ? heightRaw : 600
  if (!src) {
    return (
      <Alert variant="info">
        <AlertTitle>{activityTypeLabels[result.view.activity.type]} en préparation</AlertTitle>
        <AlertDescription>Ce contenu interactif sera disponible prochainement.</AlertDescription>
      </Alert>
    )
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
      <iframe src={src} title={result.view.activity.title} style={{ height }} className="w-full" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allowFullScreen />
    </div>
  )
}

/**
 * Zone principale du lecteur : rendu adapté au type d'activité (contenu, média avec version bas débit,
 * document, lien, évaluation, devoir, forum, séance en direct, contenu interactif).
 */
export function ActivityRenderer({ result }: ActivityRendererProps) {
  const { activity } = result.view
  if (!activity.isAvailable) {
    return (
      <div className="flex flex-col gap-5">
        <Instructions text={activity.instructions} />
        <Alert variant="warning" icon={Lock}>
          <AlertTitle>Activité pas encore disponible</AlertTitle>
          <AlertDescription>
            {activity.availableFrom ? `Elle s’ouvrira le ${formatDateTime(activity.availableFrom)}.` : 'Elle sera ouverte par votre formateur.'} Vous pouvez poursuivre avec les autres activités du sommaire.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  let body: React.ReactNode
  switch (activity.type) {
    case 'TEXT':
      body = <TextActivity result={result} />
      break
    case 'VIDEO':
      body = <VideoActivity result={result} />
      break
    case 'AUDIO':
      body = <AudioActivity result={result} />
      break
    case 'FILE':
      body = <FileActivity result={result} />
      break
    case 'LINK':
      body = <LinkActivity result={result} />
      break
    case 'PRESENTATION':
      body = <PresentationActivity result={result} />
      break
    case 'QUIZ':
    case 'SURVEY':
      body = <QuizActivity result={result} />
      break
    case 'ASSIGNMENT':
      body = <AssignmentActivity result={result} />
      break
    case 'FORUM':
      body = <ForumActivity result={result} />
      break
    case 'LIVE_SESSION':
      body = <LiveSessionActivity result={result} />
      break
    case 'H5P':
    case 'SCORM':
      body = <InteractiveActivity result={result} />
      break
    default:
      body = (
        <Alert variant="info" icon={AlertCircle}>
          <AlertDescription>Type d’activité non pris en charge par le lecteur.</AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="flex flex-col gap-5">
      <Instructions text={activity.instructions} />
      {body}
    </div>
  )
}
