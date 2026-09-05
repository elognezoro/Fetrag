import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Award, Bell, BookOpen, CalendarDays, CreditCard, Inbox, ShieldAlert } from 'lucide-react'
import { formatMoney, formatDate, formatDateTime } from '@fetrag/domain'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CertificateSeal,
  EmptyState,
  ProgressArc,
  Reveal,
  Stagger,
  StaggerItem,
  StatTile,
  StatusBadge,
} from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { lmsHref } from '@/lib/site'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadAccountSummary } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Tableau de bord' }

interface PageProps {
  searchParams: Promise<{ bienvenue?: string }>
}

/** Tableau de bord de l'espace personnel : formations, demandes, événements, notifications, certificats. */
export default async function AccountDashboardPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/espace')
  const [{ bienvenue }, summary] = await Promise.all([searchParams, loadAccountSummary(principal)])
  const firstName = summary.user?.firstName || summary.user?.name?.split(' ')[0] || principal.email
  const activeEnrollments = summary.enrollments.filter((e) => e.status === 'ACTIVE')
  const completedCount = summary.enrollments.filter((e) => e.status === 'COMPLETED').length
  const issuedCertificates = summary.certificates.filter((c) => c.status === 'ISSUED')
  const openRequests = summary.requests.items.filter((r) => r.status !== 'CLOSED' && r.status !== 'REJECTED')

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Tableau de bord"
        title={
          <>
            Bonjour <span className="italic text-blue-600">{firstName}</span>
          </>
        }
        description="Retrouvez ici l’essentiel de votre activité au sein de la Fédération des Travailleurs du Gabon : formations, demandes de service, événements et documents."
        actions={
          <Button asChild variant="accent" size="md">
            <a href={lmsHref('/dashboard')}>
              Plateforme de formation
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        }
      />

      {bienvenue === '1' ? (
        <Alert variant="success">
          <AlertTitle>Bienvenue à la FETRAG</AlertTitle>
          <AlertDescription>
            Votre compte est prêt. Complétez votre profil, activez la vérification en deux étapes et découvrez le programme de formation des leaders syndicaux 2026.
          </AlertDescription>
        </Alert>
      ) : null}

      {!summary.user?.totpEnabled ? (
        <Alert variant="warning" icon={ShieldAlert}>
          <AlertTitle>Renforcez la sécurité de votre compte</AlertTitle>
          <AlertDescription>
            Activez la vérification en deux étapes pour protéger vos données et vos documents.{' '}
            <Link href="/espace/securite">Activer maintenant</Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatTile value={activeEnrollments.length} label="Formations en cours" icon={BookOpen} tone="blue" description={`${completedCount} terminée${completedCount > 1 ? 's' : ''}`} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={issuedCertificates.length} label="Certificats obtenus" icon={Award} tone="gold" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={openRequests.length} label="Demandes en cours" icon={Inbox} tone="green" description={`${summary.requests.total} au total`} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={summary.unread} label="Notifications non lues" icon={Bell} tone="navy" />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card pillar="protection" className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Mes formations en cours</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/espace/inscriptions">
                  Tout voir
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeEnrollments.length === 0 ? (
                <EmptyState
                  compact
                  icon={BookOpen}
                  title="Aucune formation en cours"
                  description="Parcourez les 10 modules du programme de formation des leaders syndicaux et inscrivez-vous en ligne."
                  action={
                    <Button asChild variant="primary" size="sm">
                      <Link href="/formations">Découvrir le programme</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {activeEnrollments.slice(0, 4).map((enrollment) => (
                    <li key={enrollment.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <ProgressArc value={enrollment.progressPercent} size={72} stroke={7} label={undefined} aria-label={`Progression ${enrollment.progressPercent} %`} />
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow text-[10px] text-neutral-500">Module {enrollment.course.code}</p>
                        <p className="truncate font-semibold text-navy">{enrollment.course.title}</p>
                        <p className="text-xs text-neutral-500">
                          {enrollment.cohort ? `Cohorte ${enrollment.cohort.name}` : 'Parcours individuel'} · {enrollment.course.durationHours} h
                        </p>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="shrink-0">
                        <a href={lmsHref(`/cours/${enrollment.course.slug}`)}>
                          Reprendre
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

        <Reveal delay={0.08} className="lg:col-span-2">
          <Card pillar="prevention" className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Prochains événements</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/evenements">Agenda</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {summary.upcomingEvents.length === 0 ? (
                <EmptyState compact icon={CalendarDays} title="Aucune inscription à venir" description="Master class, assemblées et webinaires vous attendent dans l’agenda." />
              ) : (
                <ul className="flex flex-col gap-3">
                  {summary.upcomingEvents.slice(0, 4).map((registration) => (
                    <li key={registration.id} className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-green-50 text-green-800">
                        <span className="font-display text-lg font-semibold leading-none">{new Date(registration.event.startsAt).getDate()}</span>
                        <span className="text-[10px] font-bold uppercase">{formatDate(registration.event.startsAt, { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/evenements/${registration.event.slug}`} className="font-semibold text-navy hover:text-blue-700">
                          {registration.event.title}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {formatDateTime(registration.event.startsAt)}
                          {registration.event.city ? ` · ${registration.event.city}` : ''}
                        </p>
                        <StatusBadge status={registration.status} size="sm" className="mt-1" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Dernières demandes</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/espace/demandes">Tout voir</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {summary.requests.items.length === 0 ? (
                <EmptyState
                  compact
                  icon={Inbox}
                  title="Aucune demande"
                  description="Assistance juridique, médiation, accompagnement : sollicitez les services de la FETRAG."
                  action={
                    <Button asChild variant="outline" size="sm">
                      <Link href="/services">Voir les services</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {summary.requests.items.map((request) => (
                    <li key={request.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">{request.service.name}</p>
                        <p className="text-xs text-neutral-500">
                          {request.reference} · {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} size="sm" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card pillar="defense" className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Certificats et reçus</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/espace/paiements">Paiements</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {issuedCertificates.length === 0 ? (
                <div className="flex items-center gap-4">
                  <CertificateSeal size={64} decorative />
                  <p className="text-sm text-neutral-600">Vos attestations et certificats FETRAG apparaîtront ici dès leur émission par la coordination.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {issuedCertificates.slice(0, 3).map((certificate) => (
                    <li key={certificate.id} className="flex items-center gap-3">
                      <CertificateSeal size={44} decorative />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-navy">{certificate.courseTitle}</p>
                        <p className="text-xs text-neutral-500">
                          {certificate.number} · {formatDate(certificate.issuedAt)}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <a href={lmsHref(`/certificats/${certificate.id}`)}>
                          Voir
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {summary.recentOrders.items.length > 0 ? (
                <div className="border-t border-neutral-100 pt-4">
                  <p className="eyebrow mb-2 text-[10px] text-neutral-500">Dernières commandes</p>
                  <ul className="flex flex-col gap-2">
                    {summary.recentOrders.items.map((order) => (
                      <li key={order.id} className="flex items-center justify-between gap-3 text-sm">
                        <Link href={`/espace/paiements/${order.id}`} className="inline-flex items-center gap-2 font-semibold text-navy hover:text-blue-700">
                          <CreditCard className="size-4 text-neutral-400" aria-hidden="true" />
                          {order.reference}
                        </Link>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" size="sm">
                            {formatMoney(order.totalAmount, order.currency)}
                          </Badge>
                          <StatusBadge status={order.status} size="sm" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
