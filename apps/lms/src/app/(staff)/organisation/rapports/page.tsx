import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, Clock3, Users, UsersRound } from 'lucide-react'
import { cohortStatusLabels, trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { cohorts, reports } from '@fetrag/lms-core'
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, Reveal, StatusBadge } from '@fetrag/ui'
import { OrgSwitcher } from '@/components/staff/org-switcher'
import { ProgressRing } from '@/components/staff/progress-ring'
import { ExportLinks, MiniBar, ReportTable } from '@/components/staff/report-table'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { canAccessOrganizationSpace } from '@/server/staff/navigation'
import { currentOrganization } from '@/server/staff/org-context'

export const metadata: Metadata = { title: 'Rapports de formation' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ cohorte?: string }>
}

/** Rapports de l'organisation : synthèse par module, par cohorte, exports CSV / PDF (LMS-09). */
export default async function OrganisationReportsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/organisation/rapports')
  if (!canAccessOrganizationSpace(principal)) return null
  const { organizations, current } = await currentOrganization(principal)
  if (!current) return null
  const { cohorte } = await searchParams
  const [report, orgCohorts] = await Promise.all([reports.organizationReport(current.id, principal), cohorts.listForOrganization(principal, current.id)])
  const selectedCohort = cohorte && orgCohorts.some((c) => c.id === cohorte) ? cohorte : (orgCohorts[0]?.id ?? null)
  const cohortReport = selectedCohort ? await reports.cohortReport(selectedCohort, principal).catch(() => null) : null

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Organisation', href: '/organisation' }, { label: 'Rapports' }]}
        eyebrow="Rapports"
        title={
          <>
            Bilan de formation de <span className="italic text-gold-700">{report.organization.acronym ?? report.organization.name}</span>
          </>
        }
        description="Suivi consolidé des inscriptions, de la progression, des scores et des attestations obtenues par vos membres, module par module et cohorte par cohorte."
        actions={
          <>
            <OrgSwitcher organizations={organizations} currentId={current.id} />
            <ExportLinks csvHref="/organisation/rapports/export?kind=organisation&format=csv" pdfHref="/organisation/rapports/export?kind=organisation&format=pdf" />
          </>
        }
        tone="gold"
      />

      <StatGrid
        items={[
          { value: report.learners, label: 'Participants distincts', icon: Users, tone: 'blue' },
          { value: report.enrollments.total, label: 'Inscriptions', icon: UsersRound, tone: 'green', description: `${report.enrollments.byStatus.COMPLETED ?? 0} terminées` },
          { value: report.certificates, label: 'Attestations et certificats', icon: BarChart3, tone: 'gold' },
          { value: Math.round(report.enrollments.totalTimeSeconds / 3600), label: 'Heures de formation cumulées', icon: Clock3, tone: 'navy', suffix: ' h' },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal>
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle>Progression globale</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-around gap-6">
              <ProgressRing value={report.enrollments.averageProgress} label="Progression moyenne" />
              {report.enrollments.averageScore !== null ? <ProgressRing value={report.enrollments.averageScore} label="Score moyen" tone="gold" /> : null}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Demandes de formation par statut</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(report.requests).length ? (
                <ul className="flex flex-wrap gap-2">
                  {Object.entries(report.requests).map(([status, count]) => (
                    <li key={status} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm">
                      <StatusBadge status={status} labels={trainingRequestStatusLabels} size="sm" />
                      <span className="font-semibold text-navy">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">Aucune demande de formation enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <StaffSection number="01" title="Rapport par module" className="mt-10" description="Inscriptions, achèvement, score moyen et certificats pour chaque module suivi par vos membres.">
        <ReportTable
          columns={[
            { key: 'module', label: 'Module', className: 'min-w-[13rem]' },
            { key: 'enrolled', label: 'Inscrits', align: 'right' },
            { key: 'completed', label: 'Terminés', align: 'right' },
            { key: 'completion', label: 'Achèvement' },
            { key: 'progress', label: 'Progression' },
            { key: 'score', label: 'Score moyen', align: 'right' },
            { key: 'certificates', label: 'Certificats', align: 'right' },
          ]}
          rows={report.courses.map((c) => ({
            module: (
              <span>
                <span className="font-semibold text-navy">{c.course.title}</span>
                <span className="block text-xs text-neutral-500">{c.course.code}</span>
              </span>
            ),
            enrolled: c.enrolled,
            completed: c.completed,
            completion: <MiniBar value={c.completionRate} tone="blue" label="Achèvement" />,
            progress: <MiniBar value={c.averageProgress} label="Progression" />,
            score: c.averageScore === null ? '-' : `${c.averageScore} %`,
            certificates: c.certificates,
          }))}
          rowKey={(_, index) => report.courses[index]?.course.id ?? String(index)}
          emptyLabel="Aucune inscription au titre de l'organisation pour le moment."
        />
      </StaffSection>

      <StaffSection
        number="02"
        title="Rapport par cohorte"
        tone="green"
        description="Sélectionnez une cohorte pour consulter l'assiduité et les résultats de chaque participant."
        actions={
          cohortReport ? (
            <ExportLinks csvHref={`/organisation/rapports/export?kind=cohorte&format=csv&cohort=${cohortReport.cohort.id}`} pdfHref={`/organisation/rapports/export?kind=cohorte&format=pdf&cohort=${cohortReport.cohort.id}`} />
          ) : null
        }
      >
        {orgCohorts.length ? (
          <div className="flex flex-col gap-5">
            <nav aria-label="Cohortes de l'organisation" className="flex flex-wrap gap-2">
              {orgCohorts.map((c) => (
                <Link
                  key={c.id}
                  href={`/organisation/rapports?cohorte=${c.id}`}
                  aria-current={c.id === selectedCohort ? 'page' : undefined}
                  className={
                    c.id === selectedCohort
                      ? 'inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-500 px-4 text-sm font-semibold text-white'
                      : 'inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:border-blue-300'
                  }
                >
                  {c.name}
                  <Badge variant={c.id === selectedCohort ? 'outline' : 'neutral'} size="sm" className={c.id === selectedCohort ? 'border-white/60 text-white' : ''}>
                    {cohortStatusLabels[c.status]}
                  </Badge>
                </Link>
              ))}
            </nav>
            {cohortReport ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <SummaryTile label="Membres" value={String(cohortReport.stats.members)} />
                  <SummaryTile label="Achèvement" value={`${cohortReport.stats.completionRate} %`} />
                  <SummaryTile label="Assiduité moyenne" value={cohortReport.stats.averageAttendance === null ? '-' : `${cohortReport.stats.averageAttendance} %`} />
                  <SummaryTile label="Certificats" value={String(cohortReport.stats.certificates)} />
                </div>
                <p className="text-sm text-neutral-600">
                  {cohortReport.cohort.course.title} · {cohortReport.cohort.startsAt ? `du ${formatDate(cohortReport.cohort.startsAt)}` : 'dates à confirmer'}
                  {cohortReport.cohort.endsAt ? ` au ${formatDate(cohortReport.cohort.endsAt)}` : ''} · formateur : {cohortReport.cohort.trainer?.name ?? 'à désigner'}
                </p>
                <ReportTable
                  columns={[
                    { key: 'name', label: 'Participant', className: 'min-w-[11rem]' },
                    { key: 'status', label: 'Statut' },
                    { key: 'progress', label: 'Progression' },
                    { key: 'score', label: 'Score', align: 'right' },
                    { key: 'attendance', label: 'Assiduité', align: 'right' },
                    { key: 'certificate', label: 'Certificat' },
                  ]}
                  rows={cohortReport.members.map((m) => ({
                    name: (
                      <span>
                        <span className="font-semibold text-navy">{m.name}</span>
                        <span className="block text-xs text-neutral-500">{m.jobTitle ?? m.email}</span>
                      </span>
                    ),
                    status: <StatusBadge status={m.status} size="sm" />,
                    progress: <MiniBar value={m.progressPercent} label="Progression" />,
                    score: m.score === null ? '-' : `${m.score} %`,
                    attendance: m.attendanceRate === null ? '-' : `${m.attendanceRate} %`,
                    certificate: m.certificateNumber ? <Badge variant="success" size="sm">{m.certificateNumber}</Badge> : '-',
                  }))}
                  rowKey={(_, index) => cohortReport.members[index]?.userId ?? String(index)}
                  emptyLabel="Aucun participant inscrit dans cette cohorte."
                />
              </>
            ) : null}
          </div>
        ) : (
          <Card>
            <EmptyState compact icon={UsersRound} title="Aucune cohorte" description="Les rapports de cohorte seront disponibles dès la planification d'une demande de formation." />
          </Card>
        )}
      </StaffSection>
    </>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft sm:p-4">
      <p className="eyebrow text-[11px] text-neutral-500">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">{value}</p>
    </div>
  )
}
