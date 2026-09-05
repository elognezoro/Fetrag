import {
  BookOpenText,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Headphones,
  Link2,
  MessagesSquare,
  MonitorPlay,
  Package,
  Presentation,
  Radio,
  Sparkles,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { activityTypeLabels, type ActivityTypeName } from '@fetrag/contracts'
import { cn } from '@fetrag/ui'

export const activityIcons: Record<ActivityTypeName, LucideIcon> = {
  TEXT: BookOpenText,
  FILE: FileText,
  LINK: Link2,
  AUDIO: Headphones,
  VIDEO: Video,
  PRESENTATION: Presentation,
  QUIZ: ClipboardCheck,
  ASSIGNMENT: ClipboardList,
  SURVEY: Sparkles,
  FORUM: MessagesSquare,
  LIVE_SESSION: Radio,
  H5P: MonitorPlay,
  SCORM: Package,
}

export function activityLabel(type: ActivityTypeName): string {
  return activityTypeLabels[type]
}

interface ActivityIconProps {
  type: ActivityTypeName
  className?: string
  /** Pastille colorée autour de l'icône. */
  badge?: boolean
}

/** Icône lucide d'un type d'activité (avec libellé accessible). */
export function ActivityIcon({ type, className, badge = false }: ActivityIconProps) {
  const Icon = activityIcons[type]
  if (badge) {
    return (
      <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700', className)}>
        <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        <span className="sr-only">{activityTypeLabels[type]}</span>
      </span>
    )
  }
  return (
    <>
      <Icon className={cn('size-[18px] shrink-0', className)} strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{activityTypeLabels[type]}</span>
    </>
  )
}
