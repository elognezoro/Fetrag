'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, Circle, ListTree, Lock, Play } from 'lucide-react'
import type { ProgressSummary } from '@fetrag/lms-core'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Progress, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import { ActivityIcon } from './activity-icon'
import { moduleLabel } from './course-grid'

export interface LessonSidebarProps {
  modules: ProgressSummary['modules']
  counts: ProgressSummary['counts']
  courseId: string
  courseSlug: string
  courseTitle: string
  courseCode: string
  progressPercent: number
  currentLessonId: string
  currentActivityId: string
}

/** Statut visuel d'une activité dans l'arborescence. */
function activityState(activity: ProgressSummary['modules'][number]['lessons'][number]['activities'][number], currentActivityId: string): 'done' | 'current' | 'locked' | 'todo' {
  if (activity.id === currentActivityId) return 'current'
  if (activity.completed) return 'done'
  if (!activity.isAvailable) return 'locked'
  return 'todo'
}

function Tree({ modules, courseId, currentLessonId, currentActivityId, onNavigate }: Pick<LessonSidebarProps, 'modules' | 'courseId' | 'currentLessonId' | 'currentActivityId'> & { onNavigate?: () => void }) {
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))
  return (
    <Accordion type="multiple" defaultValue={currentModule ? [currentModule.id] : modules[0] ? [modules[0].id] : []} className="flex flex-col gap-2">
      {modules.map((module, index) => {
        const tone = toneAt(index)
        const classes = toneClasses[tone]
        const done = module.total > 0 && module.completed === module.total
        return (
          <AccordionItem key={module.id} value={module.id} className={cn('border-neutral-200', classes.topRule)}>
            <AccordionTrigger className="px-4 py-3 text-sm">
              <span className="flex min-w-0 items-center gap-3 text-left">
                <span aria-hidden="true" className={cn('font-display text-xl font-semibold leading-none', classes.text)}>
                  {padNumber(index + 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{module.title}</span>
                  <span className="block text-[11px] font-medium text-neutral-500">
                    {module.completed}/{module.total} {module.total > 1 ? 'activités' : 'activité'}
                    {module.isOptional ? ' · facultatif' : ''}
                    {done ? ' · terminé' : ''}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-3">
              <ol className="flex flex-col gap-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCurrentLesson = lesson.id === currentLessonId
                  return (
                    <li key={lesson.id}>
                      <p className={cn('flex items-center gap-2 px-2 pb-1 pt-2 text-xs font-bold uppercase tracking-wider', isCurrentLesson ? 'text-blue-700' : 'text-neutral-500')}>
                        <span className="font-display text-sm normal-case tracking-tight">
                          {padNumber(index + 1)}.{lessonIndex + 1}
                        </span>
                        <span className="truncate normal-case tracking-normal">{lesson.title}</span>
                      </p>
                      <ol className="flex flex-col gap-0.5">
                        {lesson.activities.map((activity) => {
                          const state = activityState(activity, currentActivityId)
                          const href = `/apprendre/${courseId}/${lesson.id}?activite=${activity.id}`
                          const StateIcon = state === 'done' ? CheckCircle2 : state === 'current' ? Play : state === 'locked' ? Lock : Circle
                          return (
                            <li key={activity.id}>
                              <Link
                                href={href}
                                onClick={onNavigate}
                                aria-current={state === 'current' ? 'page' : undefined}
                                className={cn(
                                  'flex min-h-10 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                                  state === 'current' ? 'bg-blue-50 font-semibold text-blue-800' : 'text-neutral-700 hover:bg-neutral-100',
                                  state === 'locked' && 'text-neutral-400',
                                )}
                              >
                                <StateIcon
                                  className={cn('size-4 shrink-0', state === 'done' && 'text-green-600', state === 'current' && 'text-blue-600', state === 'locked' && 'text-neutral-400', state === 'todo' && 'text-neutral-300')}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  {state === 'done' ? 'Terminé : ' : state === 'current' ? 'En cours : ' : state === 'locked' ? 'Verrouillé : ' : 'À faire : '}
                                </span>
                                <ActivityIcon type={activity.type} className={cn('size-4', state === 'current' ? 'text-blue-600' : 'text-neutral-400')} />
                                <span className="min-w-0 flex-1 truncate">{activity.title}</span>
                                {!activity.isRequired ? <span className="text-[10px] uppercase tracking-wider text-neutral-400">opt.</span> : null}
                              </Link>
                            </li>
                          )
                        })}
                      </ol>
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

function SidebarHeader({ courseTitle, courseSlug, courseCode, progressPercent, counts }: Pick<LessonSidebarProps, 'courseTitle' | 'courseSlug' | 'courseCode' | 'progressPercent' | 'counts'>) {
  return (
    <div className="mb-4">
      <Link href={`/cours/${courseSlug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-blue-700">
        <ChevronLeft className="size-3.5" aria-hidden="true" />
        Fiche de la formation
      </Link>
      <p className="eyebrow mt-2 text-[11px] text-blue-700">{moduleLabel(courseCode)}</p>
      <h2 className="mt-1 font-display text-lg font-semibold leading-tight text-navy">{courseTitle}</h2>
      <div className="mt-3">
        <Progress value={progressPercent} size="sm" showValue label={`Progression du cours : ${progressPercent} %`} />
        <p className="mt-1 text-[11px] text-neutral-500">
          {counts.requiredCompleted}/{counts.required} activités obligatoires terminées
        </p>
      </div>
    </div>
  )
}

/**
 * Sommaire du cours : barre latérale collante sur grand écran, tiroir accessible (Radix Dialog) sur mobile.
 * L'état de chaque activité (terminé, en cours, verrouillé, à faire) est signalé par icône et texte.
 */
export function LessonSidebar(props: LessonSidebarProps) {
  const [open, setOpen] = useState(false)

  // Ferme le tiroir dès que la leçon ou l'activité affichée change (navigation effectuée).
  useEffect(() => {
    setOpen(false)
  }, [props.currentLessonId, props.currentActivityId])

  return (
    <>
      <aside
        aria-label="Sommaire du cours"
        className="hidden max-h-[calc(100dvh-var(--header-height)-2rem)] overflow-x-hidden overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:block"
      >
        <SidebarHeader {...props} />
        <Tree {...props} />
      </aside>

      <div className="lg:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="md" className="w-full justify-between" rightIcon={<ListTree aria-hidden="true" />}>
              <span className="truncate">Sommaire · {props.progressPercent} %</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            size="sm"
            closeLabel="Fermer le sommaire"
            className="left-0 top-0 h-dvh max-h-dvh w-[min(22rem,90vw)] translate-x-0 translate-y-0 rounded-none border-0 p-5 pt-6 data-[state=open]:animate-none sm:max-w-none"
          >
            <DialogTitle className="sr-only">Sommaire du cours</DialogTitle>
            <DialogDescription className="sr-only">Modules, leçons et activités du cours avec leur état d’avancement.</DialogDescription>
            <div className="pr-10">
              <SidebarHeader {...props} />
            </div>
            <Tree {...props} onNavigate={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
