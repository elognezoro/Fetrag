import Link from 'next/link'
import { AlertTriangle, ArrowRight, Award, CalendarClock, CheckCircle2, ClipboardCheck, ClipboardList, Clock, Play, XCircle, type LucideIcon } from 'lucide-react'
import { pillarSchema } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatRelative } from '@fetrag/domain'
import { Badge, Button, EmptyState, ProgressArc, StatusBadge, cn, padNumber, resolveTone, toneClasses, type Tone } from '@fetrag/ui'
import type { LearnerDashboard } from '@/server/learner/dashboard-queries'
import { ActivityIcon } from './activity-icon'
import { moduleLabel, moduleShort } from './course-grid'

// -----------------------------------------------------------------------------
// Enveloppe de section (numéro serif, icône, titre, action)
// -----------------------------------------------------------------------------

interface DashboardSectionProps {
  number: string
  title: string
  description?: string
  icon: LucideIcon
  tone?: Tone
  action?: React.ReactNode
  children: React.ReactNode
  id: string
}

export function DashboardSection({ number, title, description, icon: Icon, tone = 'blue', action, children, id }: DashboardSectionProps) {
  const classes = toneClasses[tone]
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', classes.text)}>
            {number}
          </span>
          <div>
            <h2 id={id} className="flex items-center gap-2 text-xl sm:text-2xl">
              <Icon className={cn('size-5', classes.text)} strokeWidth={1.75} aria-hidden="true" />
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

// -----------------------------------------------------------------------------
// Reprendre
// -----------------------------------------------------------------------------

type ContinueItem = LearnerDashboard['continueLearning'][number]

/** Carte « Reprendre » : numéro de module, arc de progression, prochaine activité. */
export function ContinueCard({ item }: { item: ContinueItem }) {
  const { enrollment, next } = item
  const pillar = pillarSchema.safeParse(enrollment.course.pillar)
  const tone = resolveTone(pillar.success ? pillar.data : null)
  const classes = toneClasses[tone]
  const number = moduleShort(enrollment.course.code)
  const href = next?.href ?? `/apprendre/${enrollment.courseId}`
  return (
    <article className={cn('flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift', classes.topRule)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className={cn('font-display text-4xl font-semibold leading-none tracking-tight', classes.text)}>
            {padNumber(number)}
          </span>
          <div className="min-w-0">
            <p className="eyebrow text-[10px] text-neutral-500">{moduleLabel(enrollment.course.code)}</p>
            <h3 className="mt-1 text-base leading-snug">
              <Link href={`/cours/${enrollment.course.slug}`} className="hover:text-blue-700 hover:underline">
                {enrollment.course.title}
              </Link>
            </h3>
          </div>
        </div>
        <ProgressArc value={enrollment.progressPercent} size={64} animate />
      </div>
      {next ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
          <ActivityIcon type={next.type} className="mt-0.5 text-blue-600" />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Prochaine activité</span>
            <span className="line-clamp-2 font-semibold text-navy sm:line-clamp-1">{next.title}</span>
          </span>
        </p>
      ) : null}
      <div className="mt-auto pt-4">
        <Button asChild variant="accent" size="sm" className="w-full sm:w-auto">
          <Link href={href}>
            <Play aria-hidden="true" />
            {enrollment.progressPercent > 0 ? 'Reprendre' : 'Commencer'}
          </Link>
        </Button>
      </div>
    </article>
  )
}

// -----------------------------------------------------------------------------
// Échéances
// -----------------------------------------------------------------------------

type Deadline = LearnerDashboard['deadlines'][number]

export function DeadlineList({ deadlines }: { deadlines: Deadline[] }) {
  if (deadlines.length === 0) {
    return <EmptyState compact icon={CalendarClock} title="Aucune échéance dans les 30 prochains jours" description="Les devoirs à rendre et les séances programmées apparaîtront ici." />
  }
  return (
    <ol className="flex flex-col gap-2">
      {deadlines.map((deadline, index) => {
        const Icon = deadline.kind === 'assignment' ? ClipboardList : CalendarClock
        return (
          <li key={`${deadline.kind}-${index}`}>
            <Link
              href={deadline.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-soft transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                deadline.overdue ? 'border-[#f5c6c6]' : 'border-neutral-200',
              )}
            >
              <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', deadline.kind === 'assignment' ? 'bg-gold-50 text-gold-800' : 'bg-blue-50 text-blue-700')}>
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-semibold text-navy sm:line-clamp-1">{deadline.title}</span>
                <span className="block truncate text-xs text-neutral-500">{deadline.courseTitle}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className={cn('block text-sm font-semibold tabular-nums', deadline.overdue ? 'text-danger' : 'text-navy')}>{formatDate(deadline.dueAt, { day: 'numeric', month: 'short' })}</span>
                <span className="block text-xs text-neutral-500">{deadline.overdue ? 'En retard' : formatRelative(deadline.dueAt)}</span>
              </span>
              {deadline.overdue ? <AlertTriangle className="size-4 shrink-0 text-danger" aria-label="En retard" /> : <ArrowRight className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

// -----------------------------------------------------------------------------
// Résultats récents
// -----------------------------------------------------------------------------

type Result = LearnerDashboard['recentResults'][number]

export function ResultList({ results }: { results: Result[] }) {
  if (results.length === 0) {
    return <EmptyState compact icon={ClipboardCheck} title="Aucun résultat pour le moment" description="Vos scores d'évaluation et les notes de vos devoirs s'afficheront ici." />
  }
  return (
    <ol className="flex flex-col gap-2">
      {results.map((result) => {
        const pending = result.percent === null
        const Icon = pending ? Clock : result.kind === 'quiz' ? (result.passed ? CheckCircle2 : XCircle) : CheckCircle2
        const toneClass = pending ? 'bg-neutral-100 text-neutral-600' : result.kind === 'quiz' && result.passed === false ? 'bg-danger-soft text-danger' : 'bg-green-50 text-green-700'
        return (
          <li key={`${result.kind}-${result.id}`}>
            <Link href={result.href} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
              <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', toneClass)}>
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-semibold text-navy sm:line-clamp-1">{result.title}</span>
                <span className="block truncate text-xs text-neutral-500">
                  {result.kind === 'quiz' ? 'Évaluation' : 'Devoir'}
                  {result.courseTitle ? ` · ${result.courseTitle}` : ''}
                  {result.at ? ` · ${formatDateTime(result.at)}` : ''}
                </span>
              </span>
              {pending ? (
                <StatusBadge status={result.status} size="sm" labels={{ SUBMITTED: 'À corriger', RETURNED: 'À reprendre' }} />
              ) : (
                <span className="font-display text-xl font-semibold tabular-nums text-navy">{result.percent} %</span>
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

// -----------------------------------------------------------------------------
// Certificats
// -----------------------------------------------------------------------------

type CertificateItem = LearnerDashboard['certificates'][number]

export function CertificateMiniList({ certificates }: { certificates: CertificateItem[] }) {
  if (certificates.length === 0) {
    return <EmptyState compact icon={Award} title="Aucun certificat pour le moment" description="Terminez un module pour obtenir votre attestation numérotée et vérifiable." />
  }
  return (
    <ul className="flex flex-col gap-2">
      {certificates.map((certificate) => (
        <li key={certificate.id}>
          <Link href={`/certificats/${certificate.id}`} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft transition-colors hover:border-gold-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
              <Award className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-semibold text-navy sm:line-clamp-1">{certificate.courseTitle}</span>
              <span className="block text-xs text-neutral-500">
                {certificate.number} · {formatDate(certificate.issuedAt)}
              </span>
            </span>
            <StatusBadge status={certificate.status} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

// -----------------------------------------------------------------------------
// Inscriptions en attente
// -----------------------------------------------------------------------------

type Enrollment = LearnerDashboard['enrollments'][number]

export function PendingEnrollments({ enrollments }: { enrollments: Enrollment[] }) {
  const pending = enrollments.filter((e) => e.status === 'PENDING')
  if (pending.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {pending.map((enrollment) => (
        <li key={enrollment.id} className="flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50/50 p-4">
          <span className="font-display text-2xl font-semibold text-gold-700">{padNumber(moduleShort(enrollment.course.code))}</span>
          <span className="min-w-0 flex-1">
            <Link href={`/cours/${enrollment.course.slug}`} className="line-clamp-2 font-semibold text-navy hover:underline sm:line-clamp-1">
              {enrollment.course.title}
            </Link>
            <span className="block text-xs text-neutral-600">Demande transmise à la coordination</span>
          </span>
          <Badge variant="warning" size="sm">
            En attente
          </Badge>
        </li>
      ))}
    </ul>
  )
}
