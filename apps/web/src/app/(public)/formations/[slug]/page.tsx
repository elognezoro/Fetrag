import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Award, CalendarDays, CheckCircle2, Clock, GraduationCap, Layers, ListChecks, MapPin, Star, Users, Wallet } from 'lucide-react'
import { sanitizeHtml, seo } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { courseLevelLabels, courseModalityLabels, pillarLabels, sessionModeLabels, type PillarName } from '@fetrag/contracts'
import { formatDate, formatMoney } from '@fetrag/domain'
import { ArcRing, Avatar, AvatarFallback, AvatarImage, Badge, Breadcrumbs, Button, Container, GradientDivider, ModuleCard, Prose, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem, cn, initials, pillarTone, toneClasses } from '@fetrag/ui'
import { CourseSyllabus } from '@/components/public/course-syllabus'
import { JsonLd } from '@/components/public/json-ld'
import { ShareButtons } from '@/components/public/share-buttons'
import { lmsHref } from '@/lib/site'
import { getProgrammeModules } from '@/server/public/home'
import { loadCourse, type CourseDetail } from '@/server/public/loaders'
import { toMetadata } from '@/server/public/metadata'
import { fallbackPillar, formatHours, moduleNumber, programmeFallback, PROGRAMME_SLOGAN, type ProgrammeModule } from '@/server/public/programme'
import { safeQuery } from '@/server/public/safe'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

const enrollmentPolicyLabels: Record<string, string> = {
  SELF: 'Inscription libre en ligne',
  APPROVAL: 'Inscription sur validation de la coordination',
  ORGANIZATION: 'Réservée aux organisations affiliées',
  PAID: 'Inscription après paiement',
}

function fallbackModule(slug: string): ProgrammeModule | null {
  return programmeFallback.find((entry) => entry.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await safeQuery('catalog.getPublished(metadata)', () => loadCourse(slug), null)
  if (course) {
    return { ...toMetadata(seo.buildMetadata('course', course)), alternates: { canonical: `/formations/${course.slug}` } }
  }
  const entry = fallbackModule(slug)
  if (!entry) return { title: 'Formation introuvable', robots: { index: false, follow: false } }
  const description = `Module ${entry.number} du Programme de formation des Leaders Syndicaux 2026 : ${entry.items.join(' ; ')}.`
  return {
    title: `Module ${entry.number} - ${entry.title}`,
    description,
    alternates: { canonical: `/formations/${slug}` },
    openGraph: { type: 'website', url: `/formations/${slug}`, title: entry.title, description },
  }
}

/** Fiche formation : catalogue LMS (version publiée) ou fiche du programme officiel en repli. */
export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const course = await safeQuery('catalog.getPublished', () => loadCourse(slug), null)
  const programme = await getProgrammeModules()

  if (!course) {
    const entry = fallbackModule(slug)
    if (!entry) notFound()
    return <ProgrammeModulePage entry={entry} others={programme.modules.filter((m) => m.slug !== slug).slice(0, 3)} />
  }

  const index = programmeFallback.findIndex((m) => m.slug === course.slug)
  const number = moduleNumber(course.code, index >= 0 ? index : 0)
  const pillar: PillarName = course.pillar ?? fallbackModule(course.slug)?.pillar ?? fallbackPillar(index >= 0 ? index : 0)
  const tone = pillarTone[pillar]
  const classes = toneClasses[tone]
  const canonical = `${resolvePublicUrl('web')}/formations/${course.slug}`
  const lmsCourseHref = lmsHref(`/cours/${course.slug}`)
  const priceLabel = course.isFree ? 'Gratuit' : course.priceAmount ? formatMoney(course.priceAmount, course.currency) : 'Tarif sur demande'
  const memberPrice = !course.isFree && course.memberPriceAmount ? formatMoney(course.memberPriceAmount, course.currency) : null
  const description = course.description.trim() ? sanitizeHtml(course.description) : ''
  const others = programme.modules.filter((m) => m.slug !== course.slug).slice(0, 3)

  return (
    <>
      <JsonLd data={seo.jsonLd('course', course)} />
      <article>
        <CourseHeader course={course} number={number} pillar={pillar} lmsCourseHref={lmsCourseHref} />

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              {course.summary ? (
                <Reveal>
                  <p className="font-display text-xl leading-snug text-navy sm:text-2xl">{course.summary}</p>
                </Reveal>
              ) : null}

              {course.objectives.length > 0 ? (
                <Reveal as="section" aria-labelledby="objectives-title">
                  <SectionHeading eyebrow="Objectifs pédagogiques" tone={tone} size="md" title={<span id="objectives-title">À l&apos;issue de ce module, vous serez capable de</span>} className="mb-6" />
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {course.objectives.map((objective) => (
                      <li key={objective} className={cn('flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700', classes.topRule)}>
                        <Star className={cn('mt-0.5 size-4 shrink-0 fill-current', classes.text)} strokeWidth={1.5} aria-hidden="true" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {description ? (
                <Reveal as="section" aria-labelledby="description-title">
                  <SectionHeading eyebrow="Présentation" tone={tone} size="md" title={<span id="description-title">Le module en détail</span>} className="mb-6" />
                  <Prose html={description} />
                </Reveal>
              ) : null}

              <Reveal as="section" aria-labelledby="syllabus-title">
                <SectionHeading
                  eyebrow="Contenus"
                  tone={tone}
                  size="md"
                  title={
                    <span id="syllabus-title">
                      Programme <span className={cn('italic', classes.text)}>détaillé</span>
                    </span>
                  }
                  description={`${course.counts.modules} chapitre${course.counts.modules > 1 ? 's' : ''}, ${course.counts.lessons} leçon${course.counts.lessons > 1 ? 's' : ''} et ${course.counts.activities} activité${course.counts.activities > 1 ? 's' : ''} (version ${course.version.number}${course.version.label ? ` · ${course.version.label}` : ''}).`}
                  className="mb-6"
                />
                {course.modules.length > 0 ? (
                  <CourseSyllabus modules={course.modules} />
                ) : (
                  <p className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">Le programme détaillé de ce module sera publié prochainement.</p>
                )}
              </Reveal>

              {course.prerequisitesText || course.prerequisites.length > 0 || course.audience ? (
                <Reveal as="section" aria-labelledby="prerequisites-title" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft pillar-top-blue sm:col-span-2 lg:col-span-1">
                    <h2 id="prerequisites-title" className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                      <ListChecks className="size-5 text-blue-600" aria-hidden="true" />
                      Prérequis
                    </h2>
                    {course.prerequisitesText ? <p className="mt-3 text-sm leading-relaxed text-neutral-600">{course.prerequisitesText}</p> : null}
                    {course.prerequisites.length > 0 ? (
                      <ul className="mt-3 flex flex-col gap-2">
                        {course.prerequisites.map((prerequisite) => (
                          <li key={prerequisite.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />
                            {prerequisite.status === 'PUBLISHED' ? (
                              <Link href={`/formations/${prerequisite.slug}`} className="font-semibold text-blue-700 underline-offset-2 hover:underline">
                                {prerequisite.title}
                              </Link>
                            ) : (
                              <span className="font-semibold text-navy">{prerequisite.title}</span>
                            )}
                            {!prerequisite.isMandatory ? <Badge variant="neutral" size="sm">Conseillé</Badge> : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {!course.prerequisitesText && course.prerequisites.length === 0 ? <p className="mt-3 text-sm text-neutral-600">Aucun prérequis : ce module est ouvert à tous les militants et responsables syndicaux.</p> : null}
                  </div>
                  {course.audience ? (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft pillar-top-green">
                      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                        <Users className="size-5 text-green-700" aria-hidden="true" />
                        Public visé
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{course.audience}</p>
                    </div>
                  ) : null}
                </Reveal>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={canonical} title={course.title} />
                <Button asChild variant="ghost" size="md">
                  <Link href="/formations">
                    <ArrowLeft aria-hidden="true" />
                    Tout le programme
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6 shadow-lift', classes.topRule)}>
                <p className="eyebrow text-[11px] text-neutral-500">Fiche du module</p>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <FactRow icon={Clock} label="Durée" value={formatHours(course.durationHours) ?? 'À définir'} />
                  <FactRow icon={Layers} label="Modalité" value={courseModalityLabels[course.modality]} />
                  <FactRow icon={GraduationCap} label="Niveau" value={courseLevelLabels[course.level]} />
                  <FactRow icon={Wallet} label="Tarif" value={memberPrice ? `${priceLabel} · ${memberPrice} pour les membres` : priceLabel} />
                  <FactRow icon={ListChecks} label="Inscription" value={enrollmentPolicyLabels[course.enrollmentPolicy] ?? course.enrollmentPolicy} />
                  {course.capacity ? <FactRow icon={Users} label="Capacité" value={`${course.capacity} participants`} /> : null}
                  {course.counts.enrollments > 0 ? <FactRow icon={Users} label="Déjà inscrits" value={new Intl.NumberFormat('fr-FR').format(course.counts.enrollments)} /> : null}
                  <FactRow icon={Award} label="Pilier" value={pillarLabels[pillar]} />
                </dl>
                <Button asChild variant="accent" size="lg" className="mt-6 w-full">
                  <a href={lmsCourseHref}>
                    <GraduationCap aria-hidden="true" />
                    S&apos;inscrire sur formation.fetrag.ga
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
                <p className="mt-3 text-center text-xs text-neutral-500">Votre compte FETRAG vous connecte automatiquement à la plateforme.</p>
              </div>

              {course.trainers.length > 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
                  <p className="eyebrow text-[11px] text-neutral-500">Formateur{course.trainers.length > 1 ? 's' : ''}</p>
                  <ul className="mt-4 flex flex-col gap-4">
                    {course.trainers.map((trainer) => {
                      const name = trainer.name?.trim() || [trainer.firstName, trainer.lastName].filter(Boolean).join(' ') || 'Formateur FETRAG'
                      return (
                        <li key={trainer.id} className="flex items-start gap-3">
                          <Avatar size="md" ring>
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
                            {trainer.jobTitle || trainer.employer ? <p className="text-xs text-neutral-500">{[trainer.jobTitle, trainer.employer].filter(Boolean).join(' · ')}</p> : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
                <p className="eyebrow text-[11px] text-neutral-500">Prochaines cohortes</p>
                {course.upcomingCohorts.length === 0 ? (
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    Aucune session collective planifiée pour le moment : le module reste accessible à distance depuis la plateforme.
                  </p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3">
                    {course.upcomingCohorts.map((cohort) => (
                      <li key={cohort.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <p className="font-semibold text-navy">{cohort.name}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5 text-blue-600" aria-hidden="true" />
                            {cohort.startsAt ? formatDate(cohort.startsAt) : 'Date à confirmer'}
                            {cohort.endsAt ? ` – ${formatDate(cohort.endsAt)}` : ''}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5 text-blue-600" aria-hidden="true" />
                            {cohort.mode === 'VIRTUAL' ? 'Classe virtuelle' : (cohort.location ?? sessionModeLabels[cohort.mode])}
                          </span>
                        </p>
                        <p className="mt-1 text-xs font-semibold text-neutral-500">
                          {cohort.sessionCount} séance{cohort.sessionCount > 1 ? 's' : ''}
                          {cohort.seatsLeft !== null ? ` · ${cohort.seatsLeft} place${cohort.seatsLeft > 1 ? 's' : ''} restante${cohort.seatsLeft > 1 ? 's' : ''}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </Section>
      </article>

      <OtherModules modules={others} />
    </>
  )
}

function CourseHeader({ course, number, pillar, lmsCourseHref }: { course: CourseDetail; number: string; pillar: PillarName; lmsCourseHref: string }) {
  const tone = pillarTone[pillar]
  const classes = toneClasses[tone]
  return (
    <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
      <RingBackdrop position="top-right" rings={5} opacity={0.06} />
      <Container size="wide" className="relative py-10 sm:py-14">
        <Breadcrumbs items={[{ label: 'Formations', href: '/formations' }, { label: course.title }]} homeHref="/" className="mb-6" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Reveal className="flex max-w-3xl flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Ribbon tone={tone}>{pillarLabels[pillar]}</Ribbon>
              <Badge variant="outline">{course.code}</Badge>
              {course.isFeatured ? <Badge variant="gold">Cours pilote</Badge> : null}
              <Badge variant="neutral">{courseLevelLabels[course.level]}</Badge>
            </div>
            <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">
              <span className="sr-only">Module {number} : </span>
              {course.title}
            </h1>
            {course.subtitle ? <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">{course.subtitle}</p> : null}
            <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
              <div className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-blue-600" aria-hidden="true" />
                <dt className="sr-only">Durée</dt>
                <dd>{formatHours(course.durationHours) ?? 'Durée à définir'}</dd>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Layers className="size-4 text-blue-600" aria-hidden="true" />
                <dt className="sr-only">Modalité</dt>
                <dd>{courseModalityLabels[course.modality]}</dd>
              </div>
              {course.category ? (
                <div className="inline-flex items-center gap-1.5">
                  <Award className="size-4 text-blue-600" aria-hidden="true" />
                  <dt className="sr-only">Catégorie</dt>
                  <dd>{course.category.name}</dd>
                </div>
              ) : null}
            </dl>
            <GradientDivider width="lg" />
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <a href={lmsCourseHref}>
                  <GraduationCap aria-hidden="true" />
                  S&apos;inscrire à ce module
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#syllabus-title">Voir le programme détaillé</a>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.12} y={24} className="mx-auto lg:mx-0">
            <ArcRing size={220} stroke={14} tone={tone} progress={100} duration={1.8}>
              <span className="flex flex-col items-center leading-none">
                <span className="eyebrow text-[10px] text-neutral-500">Module</span>
                <span className={cn('font-display text-7xl font-semibold tracking-tight', classes.text)} aria-hidden="true">
                  {number}
                </span>
                <span className="eyebrow mt-1 text-[10px] text-neutral-500">sur 10</span>
              </span>
            </ArcRing>
          </Reveal>
        </div>
      </Container>
    </header>
  )
}

function FactRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
        <dd className="font-semibold text-navy">{value}</dd>
      </div>
    </div>
  )
}

function OtherModules({ modules }: { modules: ProgrammeModule[] }) {
  if (modules.length === 0) return null
  return (
    <Section variant="muted" padding="md" bordered aria-labelledby="other-modules-title">
      <Reveal>
        <SectionHeading
          eyebrow="Programme 2026"
          tone="blue"
          size="md"
          title={
            <span id="other-modules-title">
              Poursuivre avec d&apos;autres <span className="italic text-blue-600">modules</span>
            </span>
          }
          description={PROGRAMME_SLOGAN}
          actions={
            <Button asChild variant="outline" size="md">
              <Link href="/formations">Les dix modules</Link>
            </Button>
          }
          className="mb-8"
        />
      </Reveal>
      <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((entry) => (
          <StaggerItem key={entry.number} as="li" className="h-full">
            <ModuleCard number={entry.number} title={entry.title} items={entry.items} pillar={entry.pillar} href={entry.slug ? `/formations/${entry.slug}` : undefined} duration={formatHours(entry.durationHours)} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  )
}

/** Fiche de repli : module du programme officiel 2026 non encore publié au catalogue LMS. */
function ProgrammeModulePage({ entry, others }: { entry: ProgrammeModule; others: ProgrammeModule[] }) {
  const tone = pillarTone[entry.pillar]
  const classes = toneClasses[tone]
  const lmsCatalogueHref = lmsHref('/catalogue')
  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <RingBackdrop position="top-right" rings={5} opacity={0.06} />
          <Container size="wide" className="relative py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Formations', href: '/formations' }, { label: entry.title }]} homeHref="/" className="mb-6" />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <Reveal className="flex max-w-3xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Ribbon tone={tone}>{pillarLabels[entry.pillar]}</Ribbon>
                  <Badge variant="outline">Programme 2026</Badge>
                  {entry.isFeatured ? <Badge variant="gold">Cours pilote</Badge> : null}
                </div>
                <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">
                  <span className="sr-only">Module {entry.number} : </span>
                  {entry.title}
                </h1>
                <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">
                  Module {entry.number} du Programme de formation des Leaders Syndicaux. {PROGRAMME_SLOGAN}.
                </p>
                <GradientDivider width="lg" />
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="accent" size="lg">
                    <a href={lmsCatalogueHref}>
                      <GraduationCap aria-hidden="true" />
                      S&apos;inscrire sur formation.fetrag.ga
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">Être informé de l&apos;ouverture</Link>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.12} y={24} className="mx-auto lg:mx-0">
                <ArcRing size={220} stroke={14} tone={tone} progress={100} duration={1.8}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="eyebrow text-[10px] text-neutral-500">Module</span>
                    <span className={cn('font-display text-7xl font-semibold tracking-tight', classes.text)} aria-hidden="true">
                      {entry.number}
                    </span>
                    <span className="eyebrow mt-1 text-[10px] text-neutral-500">sur 10</span>
                  </span>
                </ArcRing>
              </Reveal>
            </div>
          </Container>
        </header>

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
            <Reveal>
              <SectionHeading eyebrow="Contenus du module" tone={tone} size="md" title="Ce que vous apprendrez" className="mb-6" />
              <ol className="flex flex-col gap-3">
                {entry.items.map((item, index) => (
                  <li key={item} className={cn('flex items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5', classes.topRule)}>
                    <span className={cn('font-display text-2xl font-semibold leading-none', classes.text)} aria-hidden="true">
                      {entry.number}.{index + 1}
                    </span>
                    <span className="text-base leading-relaxed text-neutral-700">{item}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-neutral-700">
                Le contenu détaillé (leçons, évaluations, supports) de ce module est en cours de publication sur la plateforme de formation. Les organisations
                affiliées peuvent d&apos;ores et déjà déposer une demande de formation pour leurs responsables.
              </p>
            </Reveal>
            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6 shadow-lift', classes.topRule)}>
                <p className="eyebrow text-[11px] text-neutral-500">Fiche du module</p>
                <dl className="mt-4 flex flex-col gap-3 text-sm">
                  <FactRow icon={Clock} label="Durée indicative" value={formatHours(entry.durationHours) ?? 'À définir'} />
                  <FactRow icon={Layers} label="Modalité" value="Hybride (présentiel et à distance)" />
                  <FactRow icon={Wallet} label="Tarif" value={entry.isFree ? 'Gratuit pour les membres' : entry.priceAmount ? formatMoney(entry.priceAmount, entry.currency) : 'Tarif sur demande'} />
                  <FactRow icon={Award} label="Pilier" value={pillarLabels[entry.pillar]} />
                </dl>
                <Button asChild variant="accent" size="lg" className="mt-6 w-full">
                  <a href={lmsCatalogueHref}>
                    <GraduationCap aria-hidden="true" />
                    Plateforme de formation
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <p className="eyebrow text-[11px] text-gold-800">Certification</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  Chaque module validé donne lieu à une attestation ou un certificat au nom de la Fédération, vérifiable en ligne par son numéro.
                </p>
              </div>
            </aside>
          </div>
        </Section>
      </article>
      <OtherModules modules={others} />
    </>
  )
}
