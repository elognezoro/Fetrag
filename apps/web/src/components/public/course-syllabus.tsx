'use client'

import {
  ClipboardList,
  Eye,
  FileText,
  Layers,
  Link2,
  ListChecks,
  MessagesSquare,
  Mic,
  Package,
  PlayCircle,
  Presentation,
  Puzzle,
  Radio,
  type LucideIcon,
} from 'lucide-react'
import { activityTypeLabels, type ActivityTypeName } from '@fetrag/contracts'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, cn, padNumber } from '@fetrag/ui'

export interface SyllabusActivity {
  id: string
  type: ActivityTypeName
  title: string
  durationMinutes: number | null
  isRequired: boolean
}

export interface SyllabusLesson {
  id: string
  title: string
  summary: string | null
  durationMinutes: number | null
  isPreview: boolean
  activities: SyllabusActivity[]
}

export interface SyllabusModule {
  id: string
  title: string
  summary: string | null
  durationMinutes: number | null
  isOptional: boolean
  lessons: SyllabusLesson[]
}

interface CourseSyllabusProps {
  modules: SyllabusModule[]
  className?: string
}

const activityIcons: Record<ActivityTypeName, LucideIcon> = {
  TEXT: FileText,
  FILE: FileText,
  LINK: Link2,
  AUDIO: Mic,
  VIDEO: PlayCircle,
  PRESENTATION: Presentation,
  QUIZ: ListChecks,
  ASSIGNMENT: ClipboardList,
  SURVEY: ListChecks,
  FORUM: MessagesSquare,
  LIVE_SESSION: Radio,
  H5P: Puzzle,
  SCORM: Package,
}

function minutes(value: number | null | undefined): string | null {
  if (!value || value <= 0) return null
  if (value < 60) return `${value} min`
  const h = Math.floor(value / 60)
  const m = value % 60
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

function moduleDuration(module: SyllabusModule): string | null {
  if (module.durationMinutes) return minutes(module.durationMinutes)
  const total = module.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? lesson.activities.reduce((s, a) => s + (a.durationMinutes ?? 0), 0)), 0)
  return minutes(total)
}

/** Programme détaillé d'une formation : modules (accordéon), leçons et activités avec type, durée et aperçu. */
export function CourseSyllabus({ modules, className }: CourseSyllabusProps) {
  if (modules.length === 0) return null
  const first = modules[0]
  return (
    <Accordion type="multiple" defaultValue={first ? [first.id] : []} className={cn('flex flex-col gap-3', className)}>
      {modules.map((module, index) => {
        const duration = moduleDuration(module)
        const lessonCount = module.lessons.length
        return (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger>
              <span className="flex min-w-0 items-start gap-4">
                <span aria-hidden="true" className="font-display text-2xl font-semibold leading-none text-blue-600">
                  {padNumber(index + 1)}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-base leading-snug sm:text-lg">{module.title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="size-3.5" aria-hidden="true" />
                      {lessonCount} leçon{lessonCount > 1 ? 's' : ''}
                    </span>
                    {duration ? <span>{duration}</span> : null}
                    {module.isOptional ? <Badge variant="neutral" size="sm">Facultatif</Badge> : null}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {module.summary ? <p className="mb-4 text-sm leading-relaxed text-neutral-600">{module.summary}</p> : null}
              {lessonCount === 0 ? (
                <p className="text-sm text-neutral-500">Le contenu détaillé de ce module sera publié prochainement.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id} className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold text-navy">
                          <span className="mr-2 font-display text-blue-600">{padNumber(index + 1)}.{lessonIndex + 1}</span>
                          {lesson.title}
                        </p>
                        <span className="flex items-center gap-2 text-xs text-neutral-500">
                          {minutes(lesson.durationMinutes)}
                          {lesson.isPreview ? (
                            <Badge variant="green" size="sm">
                              <Eye aria-hidden="true" />
                              Aperçu libre
                            </Badge>
                          ) : null}
                        </span>
                      </div>
                      {lesson.summary ? <p className="mt-1 text-sm text-neutral-600">{lesson.summary}</p> : null}
                      {lesson.activities.length > 0 ? (
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {lesson.activities.map((activity) => {
                            const Icon = activityIcons[activity.type] ?? FileText
                            return (
                              <li key={activity.id} className="flex items-center gap-2 text-sm text-neutral-700">
                                <Icon className="size-4 shrink-0 text-green-700" strokeWidth={1.75} aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate">{activity.title}</span>
                                <span className="shrink-0 text-xs text-neutral-500">
                                  {activityTypeLabels[activity.type]}
                                  {activity.durationMinutes ? ` · ${minutes(activity.durationMinutes)}` : ''}
                                  {!activity.isRequired ? ' · facultatif' : ''}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
