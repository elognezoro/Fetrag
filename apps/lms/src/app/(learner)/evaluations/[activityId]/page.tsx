import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, ClipboardCheck, Clock, ListChecks, Lock, RotateCcw, Sparkles } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Breadcrumbs, Button, Ribbon, cn } from '@fetrag/ui'
import { QuizRunner } from '@/components/learner/quiz-runner'
import { SpeakButton } from '@/components/learner/speak-button'
import { guards } from '@/lib/auth'
import { getQuizEntry } from '@/server/learner/quiz-queries'

export const metadata: Metadata = { title: 'Évaluation', robots: { index: false, follow: false } }

interface PageProps {
  params: Promise<{ activityId: string }>
}

/** Passage d'une évaluation ou d'un questionnaire de satisfaction (démarrage, minuteur, brouillon, résultat, correction). */
export default async function EvaluationPage({ params }: PageProps) {
  const { activityId } = await params
  const principal = await guards.requireUser(`/evaluations/${activityId}`)
  const entry = await getQuizEntry(principal, activityId)
  if (!entry) notFound()

  const isSurvey = entry.quiz.isSurvey
  const lessonHref = `/apprendre/${entry.course.id}/${entry.lesson.id}?activite=${entry.activity.id}`

  return (
    <div className="container-fetrag py-6 sm:py-8">
      {/* Sur mobile, fil d'Ariane réduit aux liens parents (le titre de l'évaluation est rappelé juste dessous). */}
      <Breadcrumbs
        className="lg:hidden"
        items={[
          { label: entry.course.title, href: `/cours/${entry.course.slug}` },
          { label: entry.lesson.title, href: lessonHref },
        ]}
        homeHref="/dashboard"
      />
      <Breadcrumbs
        className="hidden lg:block"
        items={[
          { label: 'Mes formations', href: '/mes-formations' },
          { label: entry.course.title, href: `/cours/${entry.course.slug}` },
          { label: entry.lesson.title, href: lessonHref },
          { label: isSurvey ? 'Questionnaire' : 'Évaluation' },
        ]}
        homeHref="/dashboard"
      />

      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-8">
        <header className={cn('rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-8', isSurvey ? 'pillar-top-green' : 'pillar-top-blue')}>
          <Ribbon tone={isSurvey ? 'green' : 'blue'}>{isSurvey ? 'Questionnaire de satisfaction' : 'Évaluation'}</Ribbon>
          <h1 className="mt-4 flex items-start gap-3 text-2xl sm:text-3xl">
            <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', isSurvey ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700')}>
              {isSurvey ? <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" /> : <ClipboardCheck className="size-5" strokeWidth={1.75} aria-hidden="true" />}
            </span>
            <span>{entry.activity.title}</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {entry.course.title} · {entry.lesson.title}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
            <div className="inline-flex items-center gap-1.5">
              <ListChecks className="size-4 text-blue-600" aria-hidden="true" />
              <dt className="sr-only">Questions</dt>
              <dd>
                {entry.quiz.questionCount} question{entry.quiz.questionCount > 1 ? 's' : ''}
              </dd>
            </div>
            {entry.quiz.timeLimitMinutes ? (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-gold-700" aria-hidden="true" />
                <dt className="sr-only">Durée limite</dt>
                <dd>{entry.quiz.timeLimitMinutes} min chronométrées</dd>
              </div>
            ) : null}
            {!isSurvey ? (
              <div className="inline-flex items-center gap-1.5">
                <RotateCcw className="size-4 text-green-700" aria-hidden="true" />
                <dt className="sr-only">Tentatives</dt>
                <dd>
                  {entry.remainingAttempts} tentative{entry.remainingAttempts > 1 ? 's' : ''} restante{entry.remainingAttempts > 1 ? 's' : ''} sur {entry.quiz.maxAttempts} · seuil {entry.quiz.passScore} %
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-4">
            <SpeakButton
              text={[entry.activity.title, entry.quiz.description ?? '', entry.activity.instructions ?? ''].filter(Boolean).join('. ')}
              label="Écouter la consigne"
            />
          </div>
        </header>

        {!entry.enrolled ? (
          <Alert variant="warning" icon={Lock}>
            <AlertTitle>Inscription requise</AlertTitle>
            <AlertDescription>
              Cette évaluation fait partie de la formation « {entry.course.title} ». Inscrivez-vous au module pour y accéder.
              <span className="mt-3 block">
                <Button asChild variant="primary" size="sm">
                  <Link href={`/cours/${entry.course.slug}`}>
                    <BookOpen aria-hidden="true" />
                    Voir la fiche de la formation
                  </Link>
                </Button>
              </span>
            </AlertDescription>
          </Alert>
        ) : !entry.activity.isAvailable ? (
          <Alert variant="info" icon={Lock}>
            <AlertTitle>Pas encore disponible</AlertTitle>
            <AlertDescription>
              Cette activité s&apos;ouvrira le {entry.activity.availableFrom ? formatDateTime(entry.activity.availableFrom) : 'prochainement'}.
              <span className="mt-3 block">
                <Button asChild variant="outline" size="sm">
                  <Link href={lessonHref}>
                    <ArrowLeft aria-hidden="true" />
                    Retour à la leçon
                  </Link>
                </Button>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <QuizRunner entry={entry} />
        )}
      </div>
    </div>
  )
}
