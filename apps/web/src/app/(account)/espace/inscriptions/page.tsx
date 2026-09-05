import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Award, BookOpen, CalendarDays } from 'lucide-react'
import { courseModalityLabels, pillarLabels, type PillarName } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CertificateSeal, EmptyState, ProgressArc, Reveal, Stagger, StaggerItem, StatusBadge, cn, padNumber } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { lmsHref } from '@/lib/site'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadUserRegistrations } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Mes inscriptions' }

const pillarRule: Record<string, string> = { protection: 'pillar-top-blue', prevention: 'pillar-top-green', defense: 'pillar-top-gold' }

function moduleNumber(code: string): string {
  const digits = code.match(/(\d{1,2})$/)?.[1]
  return digits ? padNumber(digits) : code
}

/** Inscriptions aux formations (LMS) et aux événements, certificats obtenus. */
export default async function RegistrationsPage() {
  const principal = await guards.requireUser('/espace/inscriptions')
  const { enrollments, registrations, certificates } = await loadUserRegistrations(principal)
  const now = Date.now()
  const upcoming = registrations.filter((r) => r.event.startsAt.getTime() >= now)
  const past = registrations.filter((r) => r.event.startsAt.getTime() < now)

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Mes inscriptions"
        title="Formations, événements et certificats"
        description="Vos parcours du programme de formation des leaders syndicaux se suivent sur la plateforme de formation ; vos inscriptions aux événements et vos certificats sont regroupés ici."
        actions={
          <Button asChild variant="accent" size="md">
            <a href={lmsHref('/mes-formations')}>
              Mes formations sur la plateforme
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        }
      />

      <section aria-labelledby="formations-title" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 id="formations-title" className="font-display text-2xl font-semibold text-navy">
            Formations
          </h2>
          <Badge variant="blue">{enrollments.length} inscription{enrollments.length > 1 ? 's' : ''}</Badge>
        </div>
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={BookOpen}
                title="Aucune inscription à une formation"
                description="Les 10 modules du programme 2026 couvrent le droit du travail, la négociation collective, la prévention des conflits et le leadership syndical."
                action={
                  <Button asChild variant="primary" size="sm">
                    <Link href="/formations">Voir le programme</Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2">
            {enrollments.map((enrollment) => {
              const pillar = enrollment.course.pillar as PillarName | null
              return (
                <StaggerItem key={enrollment.id}>
                  <Card interactive className={cn('h-full', pillar ? pillarRule[pillar] : 'pillar-top-blue')}>
                    <CardContent className="flex gap-4 p-5">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-display text-3xl font-semibold leading-none text-navy/30">{moduleNumber(enrollment.course.code)}</span>
                        <ProgressArc value={enrollment.progressPercent} size={80} stroke={8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={enrollment.status} size="sm" />
                          {pillar ? (
                            <Badge variant="outline" size="sm">
                              {pillarLabels[pillar]}
                            </Badge>
                          ) : null}
                        </div>
                        <h3 className="mt-2 font-display text-lg font-semibold leading-tight text-navy">{enrollment.course.title}</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          {courseModalityLabels[enrollment.course.modality]} · {enrollment.course.durationHours} h
                          {enrollment.cohort ? ` · Cohorte ${enrollment.cohort.name}` : ''}
                        </p>
                        {enrollment.cohort?.startsAt ? <p className="text-xs text-neutral-500">Début : {formatDate(enrollment.cohort.startsAt)}</p> : null}
                        {enrollment.certificates.length > 0 ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                            <Award className="size-3.5" aria-hidden="true" />
                            Certificat {enrollment.certificates[0]?.number}
                          </p>
                        ) : null}
                        <div className="mt-3">
                          <Button asChild variant="secondary" size="sm">
                            <a href={lmsHref(`/cours/${enrollment.course.slug}`)}>
                              {enrollment.status === 'COMPLETED' ? 'Revoir le cours' : 'Continuer'}
                              <ArrowUpRight aria-hidden="true" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </Stagger>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card pillar="prevention" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Événements</CardTitle>
              <CardDescription>Master class, assemblées, webinaires : vos inscriptions à venir et passées.</CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <EmptyState compact icon={CalendarDays} title="Aucune inscription à un événement" action={<Button asChild variant="outline" size="sm"><Link href="/evenements">Consulter l’agenda</Link></Button>} />
              ) : (
                <div className="flex flex-col gap-5">
                  {upcoming.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {upcoming.map((registration) => (
                        <li key={registration.id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/evenements/${registration.event.slug}`} className="font-semibold text-navy hover:text-blue-700">
                              {registration.event.title}
                            </Link>
                            <p className="text-xs text-neutral-500">
                              {formatDateTime(registration.event.startsAt)}
                              {registration.event.location ? ` · ${registration.event.location}` : ''}
                            </p>
                          </div>
                          <StatusBadge status={registration.status} size="sm" />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {past.length > 0 ? (
                    <div>
                      <p className="eyebrow mb-2 text-[10px] text-neutral-500">Événements passés</p>
                      <ul className="flex flex-col gap-2 text-sm">
                        {past.slice(0, 6).map((registration) => (
                          <li key={registration.id} className="flex items-center justify-between gap-3 text-neutral-600">
                            <span className="truncate">{registration.event.title}</span>
                            <span className="shrink-0 text-xs">{formatDate(registration.event.startsAt)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Certificats</CardTitle>
              <CardDescription>Attestations et certificats vérifiables par code et QR.</CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="flex items-center gap-4">
                  <CertificateSeal size={72} decorative />
                  <p className="text-sm text-neutral-600">Terminez un module et satisfaites aux critères d’assiduité et de score pour obtenir votre attestation FETRAG.</p>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {certificates.map((certificate) => (
                    <li key={certificate.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <CertificateSeal size={48} decorative variant={certificate.status === 'ISSUED' ? 'color' : 'mono'} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-navy">{certificate.courseTitle}</p>
                        <p className="text-xs text-neutral-500">
                          {certificate.number} · émis le {formatDate(certificate.issuedAt)}
                        </p>
                        <StatusBadge status={certificate.status} size="sm" className="mt-1" />
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <a href={lmsHref(`/certificats/${certificate.id}`)}>
                          Ouvrir
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
