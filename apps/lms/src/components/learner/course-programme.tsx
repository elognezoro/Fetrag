import { Clock, Eye, Lock } from 'lucide-react'
import { sanitizeHtml } from '@fetrag/cms'
import { formatDuration } from '@fetrag/domain'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Prose, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import type { PublishedCourse } from '@/server/learner/queries'
import { ActivityIcon, activityLabel } from './activity-icon'
import Link from 'next/link'

interface CourseProgrammeProps {
  modules: PublishedCourse['modules']
  courseId: string
  /** Inscrit : les leçons renvoient vers le lecteur. */
  enrolled: boolean
}

function previewText(preview: unknown): string | null {
  if (!preview || typeof preview !== 'object') return null
  const record = preview as Record<string, unknown>
  if (typeof record.html === 'string' && record.html.trim()) return record.html
  if (typeof record.transcript === 'string' && record.transcript.trim()) return `<p>${record.transcript}</p>`
  return null
}

/** Programme détaillé : accordéon modules → leçons → activités, avec aperçu public des leçons `isPreview`. */
export function CourseProgramme({ modules, courseId, enrolled }: CourseProgrammeProps) {
  if (modules.length === 0) {
    return <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">Le programme détaillé sera publié prochainement.</p>
  }
  const firstId = modules[0]?.id
  return (
    <Accordion type="multiple" defaultValue={firstId ? [firstId] : []} className="flex flex-col gap-3">
      {modules.map((module, index) => {
        const tone = toneAt(index)
        const lessonCount = module.lessons.length
        const minutes = module.durationMinutes ?? module.lessons.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0)
        return (
          <AccordionItem key={module.id} value={module.id} className={cn('overflow-hidden', toneClasses[tone].topRule)}>
            <AccordionTrigger className="items-start">
              <span className="flex items-start gap-4 text-left">
                <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', toneClasses[tone].text)}>
                  {padNumber(index + 1)}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-lg font-semibold leading-tight">{module.title}</span>
                  <span className="text-xs font-medium text-neutral-500">
                    {lessonCount} {lessonCount > 1 ? 'leçons' : 'leçon'}
                    {minutes ? ` · ${formatDuration(minutes)}` : ''}
                    {module.isOptional ? ' · facultatif' : ''}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {module.summary ? <p className="mb-4 text-sm text-neutral-600">{module.summary}</p> : null}
              <ol className="flex flex-col gap-3">
                {module.lessons.map((lesson, lessonIndex) => {
                  const previews = lesson.isPreview ? lesson.activities.map((a) => ({ id: a.id, title: a.title, html: previewText(a.preview) })).filter((p) => p.html) : []
                  return (
                    <li key={lesson.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 font-display text-sm font-semibold text-neutral-500">
                            {padNumber(index + 1)}.{lessonIndex + 1}
                          </span>
                          <div>
                            {enrolled ? (
                              <Link href={`/apprendre/${courseId}/${lesson.id}`} className="font-semibold text-navy hover:text-blue-700 hover:underline">
                                {lesson.title}
                              </Link>
                            ) : (
                              <p className="font-semibold text-navy">{lesson.title}</p>
                            )}
                            {lesson.summary ? <p className="mt-1 text-sm text-neutral-600">{lesson.summary}</p> : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.durationMinutes ? (
                            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                              <Clock className="size-3.5" aria-hidden="true" />
                              {formatDuration(lesson.durationMinutes)}
                            </span>
                          ) : null}
                          {lesson.isPreview ? (
                            <Badge variant="green" size="sm">
                              <Eye aria-hidden="true" />
                              Aperçu libre
                            </Badge>
                          ) : !enrolled ? (
                            <Badge variant="outline" size="sm">
                              <Lock aria-hidden="true" />
                              Réservé aux inscrits
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {lesson.activities.length > 0 ? (
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {lesson.activities.map((activity) => (
                            <li key={activity.id} className="flex items-center gap-2 text-sm text-neutral-700">
                              <ActivityIcon type={activity.type} className="text-blue-600" />
                              <span className="min-w-0 flex-1 truncate">
                                {enrolled ? (
                                  <Link href={`/apprendre/${courseId}/${lesson.id}?activite=${activity.id}`} className="hover:text-blue-700 hover:underline">
                                    {activity.title}
                                  </Link>
                                ) : (
                                  activity.title
                                )}
                              </span>
                              <span className="hidden text-xs text-neutral-500 sm:inline">{activityLabel(activity.type)}</span>
                              {activity.durationMinutes ? <span className="text-xs tabular-nums text-neutral-500">{formatDuration(activity.durationMinutes)}</span> : null}
                              {!activity.isRequired ? <span className="text-[11px] uppercase tracking-wider text-neutral-400">facultatif</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {previews.length > 0 ? (
                        <details className="group mt-3 rounded-xl border border-green-200 bg-white">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-2 text-sm font-semibold text-green-800 marker:hidden">
                            <Eye className="size-4" aria-hidden="true" />
                            Consulter l’aperçu de cette leçon
                          </summary>
                          <div className="flex flex-col gap-5 border-t border-green-100 px-4 py-4">
                            {previews.map((preview) => (
                              <article key={preview.id}>
                                <h4 className="mb-2 text-base">{preview.title}</h4>
                                <Prose html={sanitizeHtml(preview.html)} />
                              </article>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
