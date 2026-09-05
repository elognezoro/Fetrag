import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, BookOpen, CalendarDays, Clock, Layers, MapPin, Star, Users } from 'lucide-react'
import { sanitizeHtml } from '@fetrag/cms'
import { courseLevelLabels, courseModalityLabels, pillarLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { ArcRing, Avatar, AvatarFallback, AvatarImage, Badge, Card, CardContent, GradientDivider, PageHeader, Prose, Reveal, Ribbon, cn, initials, padNumber, pillarTone, toneClasses } from '@fetrag/ui'
import { moduleNumber } from '@/components/learner/course-grid'
import { CourseMeta, priceLabel } from '@/components/learner/course-meta'
import { CourseProgramme } from '@/components/learner/course-programme'
import { EnrollCta } from '@/components/learner/enroll-cta'
import { guards } from '@/lib/auth'
import { webHref } from '@/lib/site'
import { getCourseView } from '@/server/learner/queries'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const view = await getCourseView(slug, null)
  if (!view) return { title: 'Formation introuvable', robots: { index: false, follow: false } }
  const { course } = view
  return {
    title: `Module ${moduleNumber(course.code)} - ${course.title}`,
    description: course.summary ?? course.subtitle ?? `Formation ${course.title} du programme 2026 de la FETRAG.`,
    alternates: { canonical: `/cours/${course.slug}` },
    openGraph: { title: course.title, description: course.summary ?? undefined, type: 'article' },
  }
}

function trainerName(t: { name: string | null; firstName: string | null; lastName: string | null }): string {
  return t.name?.trim() || [t.firstName, t.lastName].filter(Boolean).join(' ') || 'Formateur FETRAG'
}

/** Fiche complète d'une formation publiée : en-tête sombre, objectifs, programme, formateurs, cohortes, action contextuelle. */
export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const principal = await guards.getPrincipal()
  const view = await getCourseView(slug, principal)
  if (!view) notFound()
  const { course, enrollment, nextActivity, offer } = view

  const number = moduleNumber(course.code)
  const tone = course.pillar ? pillarTone[course.pillar] : 'blue'
  const classes = toneClasses[tone]
  const price = priceLabel(course.isFree, offer?.amount ?? course.priceAmount, offer?.currency ?? course.currency)
  const enrolled = enrollment !== null && enrollment.status !== 'PENDING'
  const descriptionHtml = course.description.trim() ? sanitizeHtml(course.description) : null

  return (
    <>
      <PageHeader
        variant="dark"
        tone={tone}
        size="lg"
        eyebrow={`Module ${number}${course.pillar ? ` · ${pillarLabels[course.pillar]}` : ''}`}
        title={course.title}
        description={course.subtitle ?? course.summary ?? undefined}
        breadcrumbs={[{ label: 'Catalogue', href: '/catalogue' }, { label: `Module ${number}` }]}
        homeHref="/"
        meta={<CourseMeta modality={course.modality} level={course.level} durationHours={course.durationHours} isFree={course.isFree} priceAmount={offer?.amount ?? course.priceAmount} currency={offer?.currency ?? course.currency} inverted />}
        aside={
          <ArcRing size={168} stroke={12} tone={tone} track={false} className="drop-shadow-[0_0_24px_rgba(156,193,2,0.35)]">
            <span className="flex flex-col items-center">
              <span className="font-display text-6xl font-semibold leading-none text-white">{padNumber(number)}</span>
              <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">sur 10</span>
            </span>
          </ArcRing>
        }
      />

      <div className="container-fetrag grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:py-14">
        <div className="flex min-w-0 flex-col gap-12">
          {course.objectives.length > 0 ? (
            <Reveal as="section" aria-labelledby="objectifs-title">
              <Ribbon tone="gold">Objectifs pédagogiques</Ribbon>
              <h2 id="objectifs-title" className="mt-4 text-2xl sm:text-3xl">
                À l&apos;issue de ce module, vous saurez
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                      <Star className="size-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-800">{objective}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {descriptionHtml || course.audience || course.prerequisitesText ? (
            <section aria-labelledby="presentation-title">
              <Ribbon tone={tone}>Présentation</Ribbon>
              <h2 id="presentation-title" className="mt-4 text-2xl sm:text-3xl">
                Le module en détail
              </h2>
              {descriptionHtml ? <Prose html={descriptionHtml} className="mt-5" size="lg" /> : null}
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.audience ? (
                  <div className={cn('rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft', classes.topRule)}>
                    <dt className="eyebrow text-[11px] text-neutral-500">Public visé</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-neutral-800">{course.audience}</dd>
                  </div>
                ) : null}
                {course.prerequisitesText || course.prerequisites.length > 0 ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft pillar-top-green">
                    <dt className="eyebrow text-[11px] text-neutral-500">Prérequis</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-neutral-800">
                      {course.prerequisitesText ?? 'Les modules suivants doivent être validés au préalable :'}
                      {course.prerequisites.length > 0 ? (
                        <ul className="mt-2 flex flex-col gap-1">
                          {course.prerequisites.map((p) => (
                            <li key={p.id}>
                              {p.status === 'PUBLISHED' ? (
                                <Link href={`/cours/${p.slug}`} className="font-semibold text-blue-700 hover:underline">
                                  Module {moduleNumber(p.code)} - {p.title}
                                </Link>
                              ) : (
                                <span className="font-semibold text-navy">
                                  Module {moduleNumber(p.code)} - {p.title}
                                </span>
                              )}
                              {!p.isMandatory ? <span className="text-xs text-neutral-500"> (recommandé)</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <section aria-labelledby="programme-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Ribbon tone="green">Programme</Ribbon>
                <h2 id="programme-title" className="mt-4 text-2xl sm:text-3xl">
                  Modules, leçons et activités
                </h2>
              </div>
              <p className="text-sm text-neutral-600">
                {course.counts.modules} {course.counts.modules > 1 ? 'modules' : 'module'} · {course.counts.lessons} {course.counts.lessons > 1 ? 'leçons' : 'leçon'} · {course.counts.activities}{' '}
                {course.counts.activities > 1 ? 'activités' : 'activité'}
                {course.version.label ? ` · ${course.version.label}` : ''}
              </p>
            </div>
            <div className="mt-6">
              <CourseProgramme modules={course.modules} courseId={course.id} enrolled={enrolled} />
            </div>
            {!enrolled ? <p className="mt-4 text-sm text-neutral-500">Les leçons marquées « Aperçu libre » sont consultables sans compte. Le reste du parcours s&apos;ouvre après inscription.</p> : null}
          </section>

          {course.trainers.length > 0 ? (
            <section aria-labelledby="formateurs-title">
              <Ribbon tone="blue">Équipe pédagogique</Ribbon>
              <h2 id="formateurs-title" className="mt-4 text-2xl sm:text-3xl">
                Vos formateurs
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.trainers.map((trainer) => {
                  const name = trainerName(trainer)
                  return (
                    <li key={trainer.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <Avatar size="lg" ring={trainer.isLead}>
                        {trainer.image ? <AvatarImage src={trainer.image} alt="" /> : null}
                        <AvatarFallback className="bg-blue-500 text-white">{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                          {name}
                          {trainer.isLead ? (
                            <Badge variant="gold" size="sm">
                              Référent
                            </Badge>
                          ) : null}
                        </p>
                        <p className="text-sm text-neutral-600">{[trainer.jobTitle, trainer.employer].filter(Boolean).join(' · ') || 'Formateur de la FETRAG'}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="cohortes-title">
            <Ribbon tone="gold">Prochaines sessions</Ribbon>
            <h2 id="cohortes-title" className="mt-4 text-2xl sm:text-3xl">
              Cohortes ouvertes
            </h2>
            {course.upcomingCohorts.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
                Aucune session en présentiel n&apos;est programmée pour le moment.{' '}
                {course.modality === 'SYNC' ? 'Les organisations affiliées peuvent demander une session dédiée.' : 'Le parcours à distance reste accessible à tout moment.'}
              </p>
            ) : (
              <ul className="mt-6 flex flex-col gap-3">
                {course.upcomingCohorts.map((cohort) => (
                  <li key={cohort.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{cohort.name}</p>
                      <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                        <div className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-4 text-blue-600" aria-hidden="true" />
                          <dt className="sr-only">Dates</dt>
                          <dd>
                            {cohort.startsAt ? formatDate(cohort.startsAt) : 'Date à confirmer'}
                            {cohort.endsAt ? ` → ${formatDate(cohort.endsAt)}` : ''}
                          </dd>
                        </div>
                        <div className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-green-700" aria-hidden="true" />
                          <dt className="sr-only">Modalité</dt>
                          <dd>
                            {sessionModeLabels[cohort.mode]}
                            {cohort.location ? ` · ${cohort.location}` : ''}
                          </dd>
                        </div>
                        <div className="inline-flex items-center gap-1.5">
                          <Users className="size-4 text-gold-700" aria-hidden="true" />
                          <dt className="sr-only">Places</dt>
                          <dd>{cohort.seatsLeft === null ? `${cohort.memberCount} inscrits` : cohort.seatsLeft > 0 ? `${cohort.seatsLeft} place${cohort.seatsLeft > 1 ? 's' : ''} restante${cohort.seatsLeft > 1 ? 's' : ''}` : 'Complet'}</dd>
                        </div>
                      </dl>
                    </div>
                    <Badge variant="outline">
                      {cohort.sessionCount} {cohort.sessionCount > 1 ? 'séances' : 'séance'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <Card pillar={tone} className="overflow-hidden">
            <div aria-hidden="true" className="tricolor-band h-1 w-full" />
            <CardContent className="flex flex-col gap-6 p-6">
              <div>
                <p className="eyebrow text-[11px] text-neutral-500">Tarif</p>
                <p className={cn('mt-1 font-display text-3xl font-semibold', course.isFree ? 'text-green-700' : 'text-navy')}>{price}</p>
                {!course.isFree && course.memberPriceAmount ? <p className="text-xs text-neutral-500">Tarif membre : {priceLabel(false, course.memberPriceAmount, course.currency)}</p> : null}
              </div>
              <EnrollCta
                courseId={course.id}
                slug={course.slug}
                policy={course.enrollmentPolicy}
                isFree={course.isFree}
                priceLabel={price}
                offerId={offer?.id ?? null}
                authenticated={Boolean(principal)}
                enrollment={enrollment ? { status: enrollment.status, progressPercent: enrollment.progressPercent } : null}
                resumeHref={nextActivity?.href ?? (enrollment ? `/apprendre/${course.id}` : null)}
                idempotencyKey={randomUUID()}
                webRegisterHref={webHref('/inscription')}
                requestHref="/demande-formation"
              />
              <GradientDivider width="full" />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 text-blue-600" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Durée</dt>
                    <dd className="font-semibold text-navy">{course.durationHours} h</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 text-green-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Modalité</dt>
                    <dd className="font-semibold text-navy">{courseModalityLabels[course.modality]}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="mt-0.5 size-4 text-gold-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Niveau</dt>
                    <dd className="font-semibold text-navy">{courseLevelLabels[course.level]}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 size-4 text-blue-600" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Contenu</dt>
                    <dd className="font-semibold text-navy">
                      {course.counts.lessons} leçon{course.counts.lessons > 1 ? 's' : ''}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 size-4 text-green-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Apprenants</dt>
                    <dd className="font-semibold text-navy">{course.counts.enrollments}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="mt-0.5 size-4 text-gold-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-neutral-500">Validation</dt>
                    <dd className="font-semibold text-navy">Attestation vérifiable</dd>
                  </div>
                </div>
              </dl>
              <p className="text-xs leading-relaxed text-neutral-500">
                Langue : {course.language === 'fr' ? 'français' : 'anglais'}
                {course.capacity ? ` · ${course.capacity} places` : ''} · Version {course.version.number}
                {course.version.publishedAt ? ` publiée le ${formatDate(course.version.publishedAt)}` : ''}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
