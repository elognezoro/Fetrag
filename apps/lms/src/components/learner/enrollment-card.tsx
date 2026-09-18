import Link from 'next/link'
import { Award, CalendarDays, Clock, Play, RotateCcw } from 'lucide-react'
import { courseModalityLabels, pillarSchema } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import type { enrollments } from '@fetrag/lms-core'
import { Button, ProgressArc, StatusBadge, cn, padNumber, resolveTone, toneClasses } from '@fetrag/ui'
import { moduleLabel, moduleShort } from './course-grid'

export type EnrollmentRow = Awaited<ReturnType<typeof enrollments.listForUser>>[number]

interface EnrollmentCardProps {
  enrollment: EnrollmentRow
  /** Prochaine activité (déjà calculée) pour un bouton « Reprendre » direct. */
  nextHref?: string | null
}

/** Carte d'inscription : numéro de module, filet du pilier, arc de progression, cohorte et actions. */
export function EnrollmentCard({ enrollment, nextHref }: EnrollmentCardProps) {
  const pillar = pillarSchema.safeParse(enrollment.course.pillar)
  const tone = resolveTone(pillar.success ? pillar.data : null)
  const classes = toneClasses[tone]
  const number = moduleShort(enrollment.course.code)
  const learnable = enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED'
  const certificate = enrollment.certificates[0] ?? null
  const resumeHref = nextHref ?? `/apprendre/${enrollment.courseId}`

  return (
    <article className={cn('flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift sm:p-6', classes.topRule)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className={cn('font-display text-4xl font-semibold leading-none tracking-tight', classes.text)}>
            {padNumber(number)}
          </span>
          <div className="min-w-0">
            <StatusBadge status={enrollment.status} size="sm" />
            <h3 className="mt-2 text-lg leading-snug">
              <Link href={`/cours/${enrollment.course.slug}`} className="hover:text-blue-700 hover:underline">
                <span className="sr-only">{moduleLabel(enrollment.course.code)} : </span>
                {enrollment.course.title}
              </Link>
            </h3>
          </div>
        </div>
        <ProgressArc value={enrollment.progressPercent} size={76} animate />
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-600">
        <div className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-neutral-400" aria-hidden="true" />
          <dt className="sr-only">Durée</dt>
          <dd>{enrollment.course.durationHours} h · {courseModalityLabels[enrollment.course.modality]}</dd>
        </div>
        {enrollment.cohort ? (
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-neutral-400" aria-hidden="true" />
            <dt className="sr-only">Cohorte</dt>
            <dd>
              {enrollment.cohort.name}
              {enrollment.cohort.startsAt ? ` · ${formatDate(enrollment.cohort.startsAt, { day: 'numeric', month: 'short' })}` : ''}
            </dd>
          </div>
        ) : null}
        {enrollment.completedAt ? (
          <div className="inline-flex items-center gap-1.5">
            <Award className="size-3.5 text-gold-600" aria-hidden="true" />
            <dt className="sr-only">Terminée le</dt>
            <dd>Terminée le {formatDate(enrollment.completedAt)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {learnable ? (
          <Button asChild variant={enrollment.status === 'COMPLETED' ? 'secondary' : 'accent'} size="sm">
            <Link href={resumeHref}>
              {enrollment.status === 'COMPLETED' ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
              {enrollment.status === 'COMPLETED' ? 'Revoir' : enrollment.progressPercent > 0 ? 'Reprendre' : 'Commencer'}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={`/cours/${enrollment.course.slug}`}>Voir la fiche</Link>
          </Button>
        )}
        {certificate ? (
          <Button asChild variant="gold" size="sm">
            <Link href={`/certificats/${certificate.id}`}>
              <Award aria-hidden="true" />
              {certificate.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'}
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  )
}
