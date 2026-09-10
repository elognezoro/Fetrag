import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Award, BookOpen, CalendarDays, ClipboardList, UserCheck, UsersRound } from 'lucide-react'
import { cohortStatusLabels, sessionModeLabels, trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatTime } from '@fetrag/domain'
import { dashboards } from '@fetrag/lms-core'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Reveal, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { coordinationAlerts, listSessionsToday } from '@/server/staff/coordination-queries'

export const metadata: Metadata = { title: 'Coordination' }
export const dynamic = 'force-dynamic'

/** Tableau de bord de la coordination : demandes à traiter, cohortes en cours, sessions du jour, certificats, alertes. */
export default async function CoordinationDashboardPage() {
  const principal = await guards.requireCan('training_request.decide', {}, '/coordination')
  const [dashboard, today, alerts] = await Promise.all([dashboards.coordination(principal), listSessionsToday(principal), coordinationAlerts()])
  const alertCount = alerts.staleRequests + alerts.cohortsWithoutTrainer + alerts.pastSessionsWithoutAttendance + alerts.certificatesToIssue

  return (
    <>
      <StaffPageHeader
        eyebrow="Coordination formation"
        title={
          <>
            Piloter le <span className="italic text-gold-700">programme 2026</span>
          </>
        }
        description="Instruction des demandes institutionnelles, planification des cohortes et des sessions, émission des certificats, suivi des organisations affiliées."
        tone="gold"
        actions={
          <>
            <Button asChild variant="primary" size="sm">
              <Link href="/coordination/demandes">
                <ClipboardList aria-hidden="true" />
                Traiter les demandes
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/coordination/cohortes/nouvelle">
                <UsersRound aria-hidden="true" />
                Nouvelle cohorte
              </Link>
            </Button>
          </>
        }
      />

      <StatGrid
        items={[
          { value: dashboard.stats.pendingRequests, label: 'Demandes à traiter', icon: ClipboardList, tone: 'gold', description: `${dashboard.stats.scheduledRequests} planifiées ou en cours` },
          { value: dashboard.stats.runningCohorts, label: 'Cohortes en cours', icon: UsersRound, tone: 'green', description: `${dashboard.stats.plannedCohorts} planifiées` },
          { value: dashboard.stats.activeLearners, label: 'Apprenants actifs', icon: UserCheck, tone: 'blue', description: `${dashboard.stats.enrollmentsThisMonth} inscriptions ce mois` },
          { value: dashboard.stats.certificatesThisMonth, label: 'Certificats émis ce mois', icon: Award, tone: 'navy', description: `${dashboard.stats.publishedCourses} cours publiés` },
        ]}
      />

      {alertCount ? (
        <Reveal className="mt-8">
          <Alert variant="warning">
            <AlertTitle>{alertCount} point(s) de vigilance</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {alerts.staleRequests ? (
                  <li>
                    <Link href="/coordination/demandes?statut=SUBMITTED" className="font-semibold hover:underline">
                      {alerts.staleRequests} demande(s) soumise(s) depuis plus de 10 jours
                    </Link>{' '}
                    sans réponse (engagement d’instruction sous dix jours ouvrés).
                  </li>
                ) : null}
                {alerts.cohortsWithoutTrainer ? (
                  <li>
                    <Link href="/coordination/cohortes" className="font-semibold hover:underline">
                      {alerts.cohortsWithoutTrainer} cohorte(s) actives sans formateur
                    </Link>{' '}
                    désigné.
                  </li>
                ) : null}
                {alerts.pastSessionsWithoutAttendance ? (
                  <li>
                    <Link href="/coordination/sessions" className="font-semibold hover:underline">
                      {alerts.pastSessionsWithoutAttendance} session(s) passée(s) sans émargement
                    </Link>
                    .
                  </li>
                ) : null}
                {alerts.certificatesToIssue ? (
                  <li>
                    <Link href="/coordination/certificats" className="font-semibold hover:underline">
                      {alerts.certificatesToIssue} participant(s) ayant terminé
                    </Link>{' '}
                    sans certificat émis.
                  </li>
                ) : null}
              </ul>
            </AlertDescription>
          </Alert>
        </Reveal>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Sessions du jour</CardTitle>
              <CalendarDays className="size-5 text-gold-700" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {today.length ? (
                <ul className="divide-y divide-neutral-100">
                  {today.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{s.title}</p>
                        <p className="text-xs text-neutral-500">
                          {s.cohort.name} · {s.cohort.course.title} · {sessionModeLabels[s.mode]}
                          {s.location ? ` · ${s.location}` : ''} · {s.cohort.trainer?.name ?? 'formateur à désigner'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-ink">
                          {formatTime(s.startsAt)} - {formatTime(s.endsAt)}
                        </span>
                        <Badge variant={s._count.attendances ? 'success' : 'neutral'} size="sm">
                          {s._count.attendances} / {s.cohort._count.members} émargés
                        </Badge>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/coordination/cohortes/${s.cohort.id}`}>Cohorte</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={CalendarDays} title="Aucune session aujourd'hui" description={dashboard.upcomingSessions[0] ? `Prochaine session : ${formatDateTime(dashboard.upcomingSessions[0].startsAt)} (${dashboard.upcomingSessions[0].cohort.name}).` : 'Aucune session planifiée.'} />
              )}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle>Demandes par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {Object.entries(dashboard.requestsByStatus)
                  .filter(([status]) => status !== 'DRAFT')
                  .map(([status, count]) => (
                    <li key={status} className="flex items-center justify-between gap-2 text-sm">
                      <Link href={`/coordination/demandes?statut=${status}`} className="hover:underline">
                        <StatusBadge status={status} labels={trainingRequestStatusLabels} size="sm" />
                      </Link>
                      <span className="font-display text-lg font-semibold text-navy">{count}</span>
                    </li>
                  ))}
                {Object.keys(dashboard.requestsByStatus).length === 0 ? <li className="text-sm text-neutral-500">Aucune demande enregistrée.</li> : null}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <StaffSection
        number="01"
        title="Demandes à traiter"
        className="mt-10"
        tone="gold"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/coordination/demandes">
              Toute la file
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        {dashboard.pendingRequests.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Soumise le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.pendingRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-navy">{r.reference}</TableCell>
                  <TableCell>{r.organization.acronym ?? r.organization.name}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 max-w-xs">{r.modules.map((m) => m.course.title).join(', ')}</span>
                  </TableCell>
                  <TableCell>{r._count.participants}</TableCell>
                  <TableCell className="text-neutral-600">{r.submittedAt ? formatDate(r.submittedAt) : '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} labels={trainingRequestStatusLabels} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/coordination/demandes/${r.id}`}>Instruire</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={ClipboardList} title="Aucune demande en attente" description="Les demandes soumises par les organisations apparaîtront ici." />
          </Card>
        )}
      </StaffSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StaffSection number="02" title="Cohortes" tone="green">
          <Card>
            <CardContent className="p-5">
              <ul className="flex flex-wrap gap-2">
                {Object.entries(dashboard.cohortsByStatus).map(([status, count]) => (
                  <li key={status}>
                    <Link href={`/coordination/cohortes?statut=${status}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm hover:border-green-500">
                      <StatusBadge status={status} labels={cohortStatusLabels} size="sm" />
                      <span className="font-semibold text-navy">{count}</span>
                    </Link>
                  </li>
                ))}
                {Object.keys(dashboard.cohortsByStatus).length === 0 ? <li className="text-sm text-neutral-500">Aucune cohorte.</li> : null}
              </ul>
              {dashboard.stats.pendingEnrollments ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-gold-800">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  {dashboard.stats.pendingEnrollments} inscription(s) en attente de validation (
                  <Link href="/coordination/cohortes?onglet=inscriptions" className="font-semibold hover:underline">
                    voir
                  </Link>
                  ).
                </p>
              ) : null}
            </CardContent>
          </Card>
        </StaffSection>
        <StaffSection number="03" title="Derniers certificats" tone="navy">
          <Card>
            <CardContent className="p-5">
              {dashboard.recentCertificates.length ? (
                <ul className="divide-y divide-neutral-100">
                  {dashboard.recentCertificates.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                      <div>
                        <p className="font-semibold text-navy">{c.holderName}</p>
                        <p className="text-xs text-neutral-500">
                          {c.number} · {c.courseTitle}
                        </p>
                      </div>
                      <span className="flex items-center gap-2 text-xs text-neutral-500">
                        {formatDate(c.issuedAt)}
                        <StatusBadge status={c.status} size="sm" />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">Aucun certificat émis pour le moment.</p>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-3">
                <Link href="/coordination/certificats">
                  <BookOpen aria-hidden="true" />
                  Gérer les certificats
                </Link>
              </Button>
            </CardContent>
          </Card>
        </StaffSection>
      </div>
    </>
  )
}
