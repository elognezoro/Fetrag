import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, BookOpenCheck, CalendarDays, ClipboardList, Plus, Users, UsersRound } from 'lucide-react'
import { trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { cohorts, dashboards, trainingRequests } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Reveal, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { OrgSwitcher } from '@/components/staff/org-switcher'
import { ProgressRing } from '@/components/staff/progress-ring'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { canAccessOrganizationSpace } from '@/server/staff/navigation'
import { currentOrganization } from '@/server/staff/org-context'

export const metadata: Metadata = { title: 'Mon organisation' }
export const dynamic = 'force-dynamic'

/** Tableau de bord de l'organisation (LMS-09) : indicateurs, demandes, cohortes, sessions. */
export default async function OrganisationDashboardPage() {
  const principal = await guards.requireUser('/organisation')
  if (!canAccessOrganizationSpace(principal)) return null
  const { organizations, current } = await currentOrganization(principal)
  if (!current) return null
  const [dashboard, requestList, orgCohorts] = await Promise.all([
    dashboards.organization(principal, current.id),
    trainingRequests.listForOrganization(principal, current.id, { pageSize: 8 }),
    cohorts.listForOrganization(principal, current.id),
  ])
  const org = dashboard.organization

  return (
    <>
      <StaffPageHeader
        eyebrow="Tableau de bord"
        title={org?.acronym ? `${org.acronym} · ${org.name}` : (org?.name ?? current.name)}
        description={[org?.sector, org?.city].filter(Boolean).join(' · ') || 'Organisation affiliée à la FETRAG'}
        actions={
          <>
            <OrgSwitcher organizations={organizations} currentId={current.id} />
            {dashboard.canManage ? (
              <Button asChild variant="primary" size="sm">
                <Link href="/demande-formation">
                  <Plus aria-hidden="true" />
                  Nouvelle demande
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <StatGrid
        items={[
          { value: dashboard.stats.learners, label: 'Participants formés ou en formation', icon: Users, tone: 'blue' },
          { value: dashboard.stats.enrollments, label: 'Inscriptions', icon: BookOpenCheck, tone: 'green', description: `${dashboard.stats.completionRate} % terminées` },
          { value: dashboard.stats.certificates, label: 'Attestations et certificats', icon: Award, tone: 'gold' },
          { value: dashboard.stats.requests, label: 'Demandes de formation', icon: ClipboardList, tone: 'navy', description: dashboard.stats.pendingRequests ? `${dashboard.stats.pendingRequests} en cours d'instruction` : 'Aucune en attente' },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal>
          <Card pillar="prevention" className="h-full">
            <CardHeader>
              <CardTitle>Progression agrégée</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-around gap-6">
              <ProgressRing value={dashboard.stats.averageProgress} label="Progression moyenne" />
              <ProgressRing value={dashboard.stats.completionRate} label="Taux d'achèvement" tone="blue" />
              {dashboard.stats.averageScore !== null ? <ProgressRing value={dashboard.stats.averageScore} label="Score moyen" tone="gold" /> : null}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Prochaines sessions</CardTitle>
              <CalendarDays className="size-5 text-green-700" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {dashboard.upcomingSessions.length ? (
                <ul className="divide-y divide-neutral-100">
                  {dashboard.upcomingSessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-semibold text-navy">{s.title}</p>
                        <p className="text-xs text-neutral-500">
                          {s.cohort.name} · {s.location ?? 'Lieu à préciser'}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-ink">{formatDateTime(s.startsAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={CalendarDays} title="Aucune session programmée" description="Les convocations apparaîtront ici dès la planification par la coordination." />
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <StaffSection
        number="01"
        title="Demandes de formation"
        className="mt-10"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/demande-formation">
              Assistant de demande
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        <div id="demandes">
          {requestList.items.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead>
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestList.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-navy">{r.reference}</TableCell>
                    <TableCell>
                      <span className="line-clamp-2 max-w-xs">{r.modules.map((m) => m.course.title).join(', ')}</span>
                    </TableCell>
                    <TableCell>{r._count.participants}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} labels={trainingRequestStatusLabels} size="sm" />
                    </TableCell>
                    <TableCell className="text-neutral-600">{formatDate(r.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/organisation/demandes/${r.id}`}>Détail</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <EmptyState
                icon={ClipboardList}
                title="Aucune demande pour le moment"
                description="Déposez votre première demande de formation institutionnelle : choix des modules, participants nominatifs, calendrier souhaité."
                action={
                  dashboard.canManage ? (
                    <Button asChild variant="primary">
                      <Link href="/demande-formation">Déposer une demande</Link>
                    </Button>
                  ) : null
                }
              />
            </Card>
          )}
        </div>
      </StaffSection>

      <StaffSection number="02" title="Cohortes de l'organisation" tone="green">
        {orgCohorts.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {orgCohorts.map((c) => (
              <Card key={c.id} pillar={c.status === 'RUNNING' ? 'prevention' : c.status === 'CLOSED' ? 'defense' : 'protection'} interactive>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold leading-tight text-navy">{c.name}</p>
                      <p className="text-xs text-neutral-500">
                        {c.code} · {c.course.title}
                      </p>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <UsersRound className="size-4" aria-hidden="true" />
                      {c._count.members} membre(s)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      {c.startsAt ? formatDate(c.startsAt) : 'Date à confirmer'}
                    </span>
                    {c.trainer ? <span>Formateur : {c.trainer.name ?? c.trainer.email}</span> : null}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={c.averageProgress >= 100 ? 'success' : c.averageProgress >= 50 ? 'green' : 'gold'}>{c.averageProgress} % de progression</Badge>
                    {c.trainingRequest ? (
                      <Link href={`/organisation/demandes/${c.trainingRequest.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                        Demande {c.trainingRequest.reference}
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState compact icon={UsersRound} title="Aucune cohorte" description="Les cohortes sont créées par la coordination lors de la planification d'une demande acceptée." />
          </Card>
        )}
      </StaffSection>

      {dashboard.recentDecisions.length ? (
        <StaffSection number="03" title="Dernières décisions" tone="gold">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dashboard.recentDecisions.map((d) => (
              <li key={d.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={d.toStatus} labels={trainingRequestStatusLabels} size="sm" />
                  <Link href={`/organisation/demandes/${d.request.id}`} className="font-semibold text-navy hover:underline">
                    {d.request.reference}
                  </Link>
                  <span className="text-xs text-neutral-500">{formatDateTime(d.createdAt)}</span>
                </div>
                {d.comment ? <p className="mt-1 text-neutral-700">{d.comment}</p> : null}
              </li>
            ))}
          </ul>
        </StaffSection>
      ) : null}
    </>
  )
}
