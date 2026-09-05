import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { CalendarClock, Clock, Star } from 'lucide-react'
import { activityTypeLabels } from '@fetrag/contracts'
import { isDomainError, formatDateTime } from '@fetrag/domain'
import { Badge, Breadcrumbs, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import { ActivityIcon } from '@/components/learner/activity-icon'
import { ActivityRenderer } from '@/components/learner/activity-renderer'
import { LessonNav } from '@/components/learner/lesson-nav'
import { LessonSidebar } from '@/components/learner/lesson-sidebar'
import { ProgressTracker } from '@/components/learner/progress-tracker'
import { guards } from '@/lib/auth'
import { getLessonTitle, resolveCourseEntry } from '@/server/learner/learning-queries'
import { getLessonView, type LessonViewResult } from '@/server/learner/queries'

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params
  const titles = await getLessonTitle(lessonId)
  return {
    title: titles ? `${titles.lessonTitle} - ${titles.courseTitle}` : 'Lecteur pédagogique',
    robots: { index: false, follow: false },
  }
}

/**
 * Lecteur pédagogique mobile-first : sommaire (barre latérale / tiroir), zone d'activité par type,
 * remontée de progression idempotente et navigation précédent / suivant.
 */
export default async function LessonPage({ params, searchParams }: PageProps) {
  const [{ courseId, lessonId }, sp] = await Promise.all([params, searchParams])
  const principal = await guards.requireUser(`/apprendre/${courseId}/${lessonId}`)

  let result: LessonViewResult | null
  try {
    result = await getLessonView(principal, courseId, lessonId, first(sp.activite))
  } catch (error) {
    if (isDomainError(error)) result = null
    else throw error
  }

  if (!result) {
    const entry = await resolveCourseEntry(principal, courseId)
    if ((entry.kind === 'not-enrolled' || entry.kind === 'pending') && entry.courseSlug) redirect(`/cours/${entry.courseSlug}`)
    notFound()
  }

  const { enrollment, summary, view, lesson, moduleTitle, moduleIndex, lessonIndex } = result
  const activity = view.activity
  const tone = toneAt(moduleIndex)
  const classes = toneClasses[tone]
  const courseCompleted = enrollment.status === 'COMPLETED'
  const moduleLabel = `${padNumber(moduleIndex + 1)}`
  const lessonLabel = `${padNumber(moduleIndex + 1)}.${lessonIndex + 1}`

  return (
    <div className="container-fetrag py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Mes formations', href: '/mes-formations' },
          { label: summary.course.title, href: `/cours/${summary.course.slug}` },
          { label: `Module ${moduleLabel}` },
          { label: lesson.title },
        ]}
        homeHref="/dashboard"
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <LessonSidebar
          modules={summary.modules}
          counts={summary.counts}
          courseId={courseId}
          courseSlug={summary.course.slug}
          courseTitle={summary.course.title}
          courseCode={summary.course.code}
          progressPercent={summary.enrollment.progressPercent}
          currentLessonId={lessonId}
          currentActivityId={activity.id}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <article className={cn('rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-8', classes.topRule)} aria-labelledby="activity-title">
            <header>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-neutral-500">
                <span className={cn('eyebrow text-[11px]', classes.text)}>Leçon {lessonLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{moduleTitle}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-700">{lesson.title}</p>
              <h1 id="activity-title" className="mt-2 flex items-start gap-3 text-2xl sm:text-3xl">
                <ActivityIcon type={activity.type} badge className="mt-0.5" />
                <span>{activity.title}</span>
              </h1>
              <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600">
                <div className="inline-flex items-center gap-1.5">
                  <dt className="sr-only">Type</dt>
                  <dd>
                    <Badge variant="outline" size="sm">
                      {activityTypeLabels[activity.type]}
                    </Badge>
                  </dd>
                </div>
                {activity.durationMinutes ? (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-neutral-400" aria-hidden="true" />
                    <dt className="sr-only">Durée indicative</dt>
                    <dd>{activity.durationMinutes} min</dd>
                  </div>
                ) : null}
                {activity.dueAt ? (
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-gold-700" aria-hidden="true" />
                    <dt className="sr-only">Échéance</dt>
                    <dd>Avant le {formatDateTime(activity.dueAt)}</dd>
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-1.5">
                  <Star className={cn('size-3.5', activity.isRequired ? 'text-gold-600' : 'text-neutral-300')} aria-hidden="true" />
                  <dt className="sr-only">Caractère</dt>
                  <dd>{activity.isRequired ? 'Activité obligatoire' : 'Activité facultative'}</dd>
                </div>
              </dl>
            </header>

            <div className="mt-6">
              <ActivityRenderer result={result} />
            </div>
          </article>

          <ProgressTracker
            enrollmentId={enrollment.id}
            activityId={activity.id}
            courseId={courseId}
            lessonId={lessonId}
            completed={view.completion?.completed ?? false}
            completionRule={activity.completionRule}
            durationMinutes={activity.durationMinutes}
            timeSpentSeconds={view.completion?.timeSpentSeconds ?? 0}
            isAvailable={activity.isAvailable}
            courseCompleted={courseCompleted}
          />

          <LessonNav courseId={courseId} previous={view.navigation.previous} next={view.navigation.next} courseCompleted={courseCompleted} />
        </div>
      </div>
    </div>
  )
}
