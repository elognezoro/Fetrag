import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, Download, FileText, ListChecks, Lock, MessageSquareText, Target } from 'lucide-react'
import { sanitizeHtml, stripHtml } from '@fetrag/cms'
import { formatDateTime, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, ArcRing, Breadcrumbs, Button, Card, CardContent, Prose, Ribbon, StatusBadge, cn } from '@fetrag/ui'
import { AssignmentForm } from '@/components/learner/assignment-form'
import { SpeakButton } from '@/components/learner/speak-button'
import { guards } from '@/lib/auth'
import { getAssignmentView } from '@/server/learner/assignment-queries'

export const metadata: Metadata = { title: 'Devoir', robots: { index: false, follow: false } }

interface PageProps {
  params: Promise<{ assignmentId: string }>
}

const submissionLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Remis',
  LATE: 'Remis en retard',
  GRADED: 'Noté',
  RETURNED: 'À reprendre',
}

/** Fiche d'un devoir : consignes, étude de cas, grille, dépôt (brouillon / remise), feedback et note. */
export default async function AssignmentPage({ params }: PageProps) {
  const { assignmentId } = await params
  const principal = await guards.requireUser(`/devoirs/${assignmentId}`)
  const view = await getAssignmentView(principal, assignmentId)
  if (!view) notFound()

  const { data, rubric, caseStudyHtml, submissionFileUrl, rubricScores } = view
  const { assignment, activity, lesson, course, submission, dueAt, isOverdue, canSubmit } = data
  const grade = submission?.grade ?? null
  const graded = submission?.status === 'GRADED' && grade !== null
  const alreadySubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'LATE' || submission?.status === 'RETURNED'
  const lessonHref = `/apprendre/${course.id}/${lesson.id}?activite=${activity.id}`
  const percent = grade ? Math.round((grade.score / Math.max(1, grade.maxScore)) * 100) : null
  const rubricTotal = rubric.reduce((sum, item) => sum + item.maxPoints, 0)

  let blockedReason: string | null = null
  if (!canSubmit && !graded) {
    if (!data.enrollmentId) blockedReason = "Vous n'êtes pas inscrit à cette formation : la remise est réservée aux participants."
    else if (isOverdue && !assignment.lateAllowed) blockedReason = 'La date limite est dépassée et ce devoir n’accepte pas de remise tardive. Contactez votre formateur si vous avez un empêchement justifié.'
    else blockedReason = 'La remise n’est pas possible pour cette inscription (parcours terminé ou suspendu).'
  }

  return (
    <div className="container-fetrag py-6 sm:py-8">
      {/* Sur mobile, fil d'Ariane réduit aux liens parents (le titre du devoir est rappelé juste dessous). */}
      <Breadcrumbs
        className="lg:hidden"
        items={[
          { label: 'Mes devoirs', href: '/devoirs' },
          { label: course.title, href: `/cours/${course.slug}` },
        ]}
        homeHref="/dashboard"
      />
      <Breadcrumbs
        className="hidden lg:block"
        items={[
          { label: 'Mes devoirs', href: '/devoirs' },
          { label: course.title, href: `/cours/${course.slug}` },
          { label: activity.title },
        ]}
        homeHref="/dashboard"
      />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft pillar-top-gold sm:p-8">
            <Ribbon tone="gold">Devoir</Ribbon>
            <h1 className="mt-4 text-2xl sm:text-3xl">{activity.title}</h1>
            <p className="mt-2 text-sm text-neutral-600">
              {course.title} · {lesson.title}
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
              <div className="inline-flex items-center gap-1.5">
                <CalendarClock className={cn('size-4', isOverdue ? 'text-danger' : 'text-gold-700')} aria-hidden="true" />
                <dt className="sr-only">Date limite</dt>
                <dd className={cn(isOverdue && !graded && 'font-semibold text-danger')}>{dueAt ? `À rendre avant le ${formatDateTime(dueAt)} (${isOverdue ? 'dépassée' : formatRelative(dueAt)})` : 'Sans date limite'}</dd>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Target className="size-4 text-blue-600" aria-hidden="true" />
                <dt className="sr-only">Barème</dt>
                <dd>Noté sur {assignment.maxScore} points</dd>
              </div>
              {assignment.lateAllowed ? null : (
                <div className="inline-flex items-center gap-1.5">
                  <Lock className="size-4 text-neutral-500" aria-hidden="true" />
                  <dt className="sr-only">Retard</dt>
                  <dd>Aucune remise tardive</dd>
                </div>
              )}
            </dl>
          </header>

          {activity.instructions || assignment.description ? (
            <section aria-labelledby="consignes-title" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="consignes-title" className="flex items-center gap-2 text-xl">
                  <ListChecks className="size-5 text-blue-700" aria-hidden="true" />
                  Consignes
                </h2>
                <SpeakButton text={[activity.instructions ?? '', assignment.description ?? ''].filter(Boolean).join(' ')} label="Écouter la consigne" />
              </div>
              {activity.instructions ? <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-blue-950">{activity.instructions}</p> : null}
              {assignment.description ? <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-blue-950">{assignment.description}</p> : null}
            </section>
          ) : null}

          {caseStudyHtml ? (
            <section aria-labelledby="cas-title">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="cas-title" className="flex items-center gap-2 text-xl">
                  <FileText className="size-5 text-green-700" aria-hidden="true" />
                  Étude de cas
                </h2>
                <SpeakButton text={stripHtml(caseStudyHtml)} label="Écouter le texte" />
              </div>
              <Prose html={caseStudyHtml} className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-6" />
            </section>
          ) : null}

          {rubric.length > 0 ? (
            <section aria-labelledby="grille-title">
              <h2 id="grille-title" className="flex items-center gap-2 text-xl">
                <Target className="size-5 text-gold-700" aria-hidden="true" />
                Grille d&apos;évaluation
              </h2>
              <ol className="mt-4 flex flex-col gap-2">
                {rubric.map((item, index) => {
                  const score = rubricScores?.[item.criterion] ?? rubricScores?.[String(index)] ?? null
                  return (
                    <li key={`${item.criterion}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-soft">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className="font-display text-xl font-semibold text-gold-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-neutral-800">{item.criterion}</span>
                      </span>
                      <span className="shrink-0 font-display text-lg tabular-nums text-navy">
                        {score !== null ? <span className="font-semibold">{score}</span> : null}
                        <span className={cn(score !== null ? 'text-sm text-neutral-500' : '')}>{score !== null ? ` / ${item.maxPoints}` : `${item.maxPoints} pt${item.maxPoints > 1 ? 's' : ''}`}</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
              {rubricTotal > 0 && rubricTotal !== assignment.maxScore ? <p className="mt-2 text-xs text-neutral-500">Total de la grille : {rubricTotal} points, ramené sur {assignment.maxScore}.</p> : null}
            </section>
          ) : null}

          {graded && grade ? (
            <section aria-labelledby="note-title" className="grid grid-cols-1 gap-6 rounded-2xl border border-green-200 bg-white p-6 shadow-soft sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
              <ArcRing size={140} stroke={12} progress={percent ?? 0} tone={(percent ?? 0) >= 50 ? 'green' : 'gold'} animate className="mx-auto">
                <span className="flex flex-col items-center">
                  <span className="font-display text-3xl font-semibold text-navy">
                    {grade.score}
                    <span className="text-base text-neutral-500">/{grade.maxScore}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{percent} %</span>
                </span>
              </ArcRing>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 id="note-title" className="flex items-center gap-2 text-xl">
                    <CheckCircle2 className="size-5 text-green-700" aria-hidden="true" />
                    Devoir corrigé
                  </h2>
                  <SpeakButton
                    text={`Devoir corrigé. Note : ${grade.score} sur ${grade.maxScore}, soit ${percent ?? 0} pour cent. ${grade.feedback ? `Commentaire du formateur : ${grade.feedback}` : ''}`}
                    label="Écouter le résultat"
                  />
                </div>
                <p className="mt-1 text-sm text-neutral-600">Noté le {formatDateTime(grade.gradedAt)}.</p>
                {grade.feedback ? (
                  <blockquote className="mt-4 rounded-xl border-l-4 border-green-500 bg-green-50/60 p-4 text-[15px] leading-relaxed text-neutral-800">
                    <p className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-800">
                      <MessageSquareText className="size-3.5" aria-hidden="true" />
                      Commentaire du formateur
                    </p>
                    <p className="whitespace-pre-line">{grade.feedback}</p>
                  </blockquote>
                ) : (
                  <p className="mt-4 text-sm text-neutral-500">Aucun commentaire n&apos;a été laissé par le formateur.</p>
                )}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="remise-title">
            <h2 id="remise-title" className="text-xl">
              {graded ? 'Votre remise' : alreadySubmitted ? 'Votre remise' : 'Déposer votre travail'}
            </h2>
            {submission?.status === 'RETURNED' ? (
              <Alert variant="warning" icon={AlertTriangle} className="mt-4">
                <AlertTitle>Travail à reprendre</AlertTitle>
                <AlertDescription>Votre formateur vous a renvoyé ce devoir : complétez-le en tenant compte de ses remarques, puis remettez-le à nouveau.</AlertDescription>
              </Alert>
            ) : null}
            {isOverdue && !graded && canSubmit ? (
              <Alert variant="warning" icon={AlertTriangle} className="mt-4">
                <AlertDescription>La date limite est dépassée : votre remise sera enregistrée comme tardive.</AlertDescription>
              </Alert>
            ) : null}
            <div className="mt-4">
              {canSubmit ? (
                <AssignmentForm
                  assignmentId={assignment.id}
                  courseId={course.id}
                  allowText={assignment.allowText}
                  allowFile={assignment.allowFile}
                  allowedMimeTypes={assignment.allowedMimeTypes}
                  maxFileSizeMb={assignment.maxFileSizeMb}
                  initialText={submission?.text ?? ''}
                  existingFileName={submission?.fileName ?? null}
                  alreadySubmitted={alreadySubmitted}
                />
              ) : graded ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
                  {submission?.text ? (
                    /<\/?[a-z][^>]*>/i.test(submission.text) ? (
                      <Prose html={sanitizeHtml(submission.text)} className="text-[15px]" />
                    ) : (
                      <p className="whitespace-pre-line text-[15px] leading-relaxed text-neutral-800">{submission.text}</p>
                    )
                  ) : null}
                  {submissionFileUrl ? (
                    <a href={submissionFileUrl} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" aria-hidden="true" />
                      {submission?.fileName ?? 'Fichier remis'}
                    </a>
                  ) : null}
                  {!submission?.text && !submissionFileUrl ? <p className="text-sm text-neutral-500">Remise sans contenu consultable.</p> : null}
                </div>
              ) : (
                <Alert variant="info" icon={Lock}>
                  <AlertTitle>Remise indisponible</AlertTitle>
                  <AlertDescription>{blockedReason}</AlertDescription>
                </Alert>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <Card pillar="gold">
            <CardContent className="flex flex-col gap-5 p-6">
              <div>
                <p className="eyebrow text-[11px] text-neutral-500">État</p>
                <div className="mt-2">
                  <StatusBadge status={submission?.status ?? 'PENDING'} labels={{ ...submissionLabels, PENDING: 'À rendre' }} />
                </div>
              </div>
              <dl className="flex flex-col gap-3 text-sm">
                {submission?.submittedAt ? (
                  <div>
                    <dt className="text-xs text-neutral-500">Remis le</dt>
                    <dd className="font-semibold text-navy">{formatDateTime(submission.submittedAt)}</dd>
                  </div>
                ) : null}
                {submission?.isLate ? (
                  <div>
                    <dt className="text-xs text-neutral-500">Retard</dt>
                    <dd className="font-semibold text-danger">Remise tardive</dd>
                  </div>
                ) : null}
                {submissionFileUrl && !graded ? (
                  <div>
                    <dt className="text-xs text-neutral-500">Fichier déposé</dt>
                    <dd>
                      <a href={submissionFileUrl} className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                        <Download className="size-4" aria-hidden="true" />
                        {submission?.fileName ?? 'Télécharger'}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs text-neutral-500">Formats acceptés</dt>
                  <dd className="text-neutral-800">
                    {assignment.allowText ? 'Réponse texte' : null}
                    {assignment.allowText && assignment.allowFile ? ' · ' : null}
                    {assignment.allowFile ? `Fichier (${assignment.maxFileSizeMb} Mo max.)` : null}
                  </dd>
                </div>
              </dl>
              <Button asChild variant="outline" size="md">
                <Link href={lessonHref}>
                  <ArrowLeft aria-hidden="true" />
                  Retour à la leçon
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
