import Link from 'next/link'
import { ArrowLeft, ArrowRight, Award, LayoutDashboard } from 'lucide-react'
import { Button } from '@fetrag/ui'

interface LessonNavProps {
  courseId: string
  previous: { activityId: string; lessonId: string; title: string } | null
  next: { activityId: string; lessonId: string; title: string } | null
  /** Cours terminé : proposer les certificats plutôt qu'une suite. */
  courseCompleted: boolean
}

/** Navigation précédent / suivant entre activités (ordre pédagogique de la version suivie). */
export function LessonNav({ courseId, previous, next, courseCompleted }: LessonNavProps) {
  return (
    <nav aria-label="Navigation entre les activités" className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
      {previous ? (
        <Button asChild variant="outline" size="lg" className="h-auto justify-start py-3 text-left sm:max-w-[48%]">
          <Link href={`/apprendre/${courseId}/${previous.lessonId}?activite=${previous.activityId}`}>
            <ArrowLeft aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Précédent</span>
              <span className="block truncate">{previous.title}</span>
            </span>
          </Link>
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button asChild variant="primary" size="lg" className="h-auto justify-end py-3 text-right sm:max-w-[48%]">
          <Link href={`/apprendre/${courseId}/${next.lessonId}?activite=${next.activityId}`}>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/70">Suivant</span>
              <span className="block truncate">{next.title}</span>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      ) : courseCompleted ? (
        <Button asChild variant="gold" size="lg">
          <Link href="/certificats">
            <Award aria-hidden="true" />
            Mes certificats
          </Link>
        </Button>
      ) : (
        <Button asChild variant="secondary" size="lg">
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden="true" />
            Retour au tableau de bord
          </Link>
        </Button>
      )}
    </nav>
  )
}
