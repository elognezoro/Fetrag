import type { Metadata } from 'next'
import { BarChart3, Banknote, BookOpen, Building2, UsersRound } from 'lucide-react'
import { can } from '@fetrag/domain'
import { orderStatusLabels, paymentMethodLabels, trainingRequestStatusLabels } from '@fetrag/contracts'
import { reports } from '@fetrag/lms-core'
import { Card, CardContent, StatusBadge } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { fmtMoney } from '@/components/staff/format'
import { ProgressRing } from '@/components/staff/progress-ring'
import { ExportLinks, MiniBar, ReportTable } from '@/components/staff/report-table'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { listCohortsForSelect } from '@/server/staff/coordination-queries'
import { listCoursesForSelect, listOrganizationsForSelect } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Rapports' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ cours?: string; organisation?: string; cohorte?: string; du?: string; au?: string }>
}

/** Rapports de pilotage : vue d'ensemble LMS, rapport par cours, par organisation, par cohorte, finances (exports CSV / PDF). */
export default async function CoordinationReportsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('reports.read', {}, '/coordination/rapports')
  const params = await searchParams
  const [overview, courses, organizations, cohorts] = await Promise.all([reports.lmsOverview(principal), listCoursesForSelect(), listOrganizationsForSelect(), listCohortsForSelect()])
  const courseId = params.cours && courses.some((c) => c.id === params.cours) ? params.cours : null
  const organizationId = params.organisation && organizations.some((o) => o.id === params.organisation) ? params.organisation : null
  const cohortId = params.cohorte && cohorts.some((c) => c.id === params.cohorte) ? params.cohorte : null
  const financeAllowed = can(principal, 'finance.read')
  const from = params.du ? new Date(params.du) : undefined
  const to = params.au ? new Date(`${params.au}T23:59:59`) : undefined
  const [courseReport, orgReport, cohortReport, finance] = await Promise.all([
    courseId ? reports.courseReport(courseId, principal).catch(() => null) : null,
    organizationId ? reports.organizationReport(organizationId, principal).catch(() => null) : null,
    cohortId ? reports.cohortReport(cohortId, principal).catch(() => null) : null,
    financeAllowed ? reports.financeReport({ from: from && !Number.isNaN(from.getTime()) ? from : undefined, to: to && !Number.isNaN(to.getTime()) ? to : undefined }, principal).catch(() => null) : null,
  ])

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Rapports' }]}
        eyebrow="Rapports et exports"
        title={
          <>
            Indicateurs du <span className="italic text-blue-600">programme de formation</span>
          </>
        }
        description="Vue d'ensemble de la plateforme, rapport par cours, par organisation et par cohorte, synthèse financière. Chaque export est journalisé."
      />

      <StatGrid
        items={[
          { value: overview.enrollments.total, label: 'Inscriptions', icon: UsersRound, tone: 'blue', description: `${overview.enrollments.active} actives · ${overview.enrollments.completed} terminées` },
          { value: overview.activeLearners30Days, label: 'Apprenants actifs (30 jours)', icon: BarChart3, tone: 'green' },
          { value: overview.assessments.passRate, label: 'Taux de réussite aux évaluations', icon: BookOpen, tone: 'gold', suffix: ' %', description: `${overview.assessments.graded} tentatives corrigées` },
          { value: overview.certificates.ISSUED ?? 0, label: 'Certificats valides', icon: Building2, tone: 'navy', description: overview.attendanceRate === null ? 'Assiduité non mesurée' : `Assiduité ${overview.attendanceRate} %` },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card pillar="protection">
          <CardContent className="flex flex-wrap items-center justify-around gap-4 p-5">
            <ProgressRing value={overview.completionRate} label="Taux d'achèvement" tone="blue" size={112} />
            <ProgressRing value={overview.averageProgress} label="Progression moyenne" size={112} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <p className="eyebrow mb-3 text-[11px] text-neutral-500">Demandes de formation par statut</p>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(overview.requests).map(([status, count]) => (
                <li key={status} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm">
                  <StatusBadge status={status} labels={trainingRequestStatusLabels} size="sm" />
                  <span className="font-semibold text-navy">{count}</span>
                </li>
              ))}
              {Object.keys(overview.requests).length === 0 ? <li className="text-sm text-neutral-500">Aucune demande.</li> : null}
            </ul>
            <p className="mt-4 text-sm text-neutral-600">
              Abandons ou suspensions : <strong>{overview.enrollments.dropped}</strong> · Temps moyen par inscription : <strong>{Math.round(overview.averageTimeSeconds / 60)} min</strong> · Réponses aux questionnaires : <strong>{overview.satisfactionResponses}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      <StaffSection number="01" title="Rapport par cours" className="mt-10" actions={courseId ? <ExportLinks csvHref={`/coordination/rapports/export?kind=cours&format=csv&course=${courseId}`} pdfHref={`/coordination/rapports/export?kind=cours&format=pdf&course=${courseId}`} /> : null}>
        <FilterBar action="/coordination/rapports" className="mb-4" hidden={{ organisation: params.organisation, cohorte: params.cohorte }} submitLabel="Afficher" fields={[{ name: 'cours', label: 'Module', type: 'select', value: params.cours ?? '', placeholder: 'Choisir un module', options: courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })) }]} />
        {courseReport ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <ReportTable
              caption={`Indicateurs du cours ${courseReport.course.code}`}
              columns={[
                { key: 'label', label: 'Indicateur' },
                { key: 'value', label: 'Valeur', align: 'right' },
              ]}
              rows={[
                { label: 'Inscriptions', value: courseReport.enrollments.total },
                { label: 'Actifs sur 30 jours', value: courseReport.enrollments.activeLast30Days },
                { label: "Taux d'achèvement", value: `${courseReport.enrollments.completionRate} %` },
                { label: 'Progression moyenne', value: `${courseReport.enrollments.averageProgress} %` },
                { label: 'Score moyen', value: courseReport.enrollments.averageScore === null ? '-' : `${courseReport.enrollments.averageScore} %` },
                { label: 'Temps moyen', value: `${Math.round(courseReport.enrollments.averageTimeSeconds / 60)} min` },
                { label: 'Tentatives corrigées', value: courseReport.assessments.gradedAttempts },
                { label: 'Taux de réussite', value: `${courseReport.assessments.passRate} %` },
                { label: 'Certificats émis', value: courseReport.certificates },
                { label: 'Réponses satisfaction', value: courseReport.satisfactionResponses },
              ]}
            />
            <ReportTable
              caption="Répartition par organisation"
              columns={[
                { key: 'name', label: 'Organisation' },
                { key: 'enrolled', label: 'Inscrits', align: 'right' },
                { key: 'progress', label: 'Progression' },
              ]}
              rows={courseReport.organizations.map((o) => ({ name: o.name, enrolled: o.enrolled, progress: <MiniBar value={o.averageProgress} label="Progression" /> }))}
              emptyLabel="Aucune inscription organisationnelle."
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Sélectionnez un module pour afficher son rapport.</p>
        )}
      </StaffSection>

      <StaffSection number="02" title="Rapport par organisation" tone="green" actions={organizationId ? <ExportLinks csvHref={`/coordination/rapports/export?kind=organisation&format=csv&org=${organizationId}`} pdfHref={`/coordination/rapports/export?kind=organisation&format=pdf&org=${organizationId}`} /> : null}>
        <FilterBar action="/coordination/rapports" className="mb-4" hidden={{ cours: params.cours, cohorte: params.cohorte }} submitLabel="Afficher" fields={[{ name: 'organisation', label: 'Organisation', type: 'select', value: params.organisation ?? '', placeholder: 'Choisir une organisation', options: organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name })) }]} />
        {orgReport ? (
          <ReportTable
            caption={`Modules suivis par ${orgReport.organization.name} (${orgReport.learners} participant(s), ${orgReport.certificates} certificat(s))`}
            columns={[
              { key: 'module', label: 'Module' },
              { key: 'enrolled', label: 'Inscrits', align: 'right' },
              { key: 'completed', label: 'Terminés', align: 'right' },
              { key: 'completion', label: 'Achèvement' },
              { key: 'score', label: 'Score moyen', align: 'right' },
              { key: 'certificates', label: 'Certificats', align: 'right' },
            ]}
            rows={orgReport.courses.map((c) => ({ module: c.course.title, enrolled: c.enrolled, completed: c.completed, completion: <MiniBar value={c.completionRate} tone="blue" label="Achèvement" />, score: c.averageScore === null ? '-' : `${c.averageScore} %`, certificates: c.certificates }))}
            emptyLabel="Aucune inscription pour cette organisation."
          />
        ) : (
          <p className="text-sm text-neutral-500">Sélectionnez une organisation pour afficher son rapport.</p>
        )}
      </StaffSection>

      <StaffSection number="03" title="Rapport par cohorte" tone="gold" actions={cohortId ? <ExportLinks csvHref={`/coordination/rapports/export?kind=cohorte&format=csv&cohort=${cohortId}`} pdfHref={`/coordination/rapports/export?kind=cohorte&format=pdf&cohort=${cohortId}`} /> : null}>
        <FilterBar action="/coordination/rapports" className="mb-4" hidden={{ cours: params.cours, organisation: params.organisation }} submitLabel="Afficher" fields={[{ name: 'cohorte', label: 'Cohorte', type: 'select', value: params.cohorte ?? '', placeholder: 'Choisir une cohorte', options: cohorts.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}` })) }]} />
        {cohortReport ? (
          <ReportTable
            caption={`${cohortReport.cohort.name} · ${cohortReport.stats.members} membre(s), achèvement ${cohortReport.stats.completionRate} %, assiduité ${cohortReport.stats.averageAttendance ?? '-'} %`}
            columns={[
              { key: 'name', label: 'Participant' },
              { key: 'status', label: 'Statut' },
              { key: 'progress', label: 'Progression' },
              { key: 'score', label: 'Score', align: 'right' },
              { key: 'attendance', label: 'Assiduité', align: 'right' },
              { key: 'certificate', label: 'Certificat' },
            ]}
            rows={cohortReport.members.map((m) => ({ name: m.name, status: <StatusBadge status={m.status} size="sm" />, progress: <MiniBar value={m.progressPercent} label="Progression" />, score: m.score === null ? '-' : `${m.score} %`, attendance: m.attendanceRate === null ? '-' : `${m.attendanceRate} %`, certificate: m.certificateNumber ?? '-' }))}
            emptyLabel="Aucun membre."
          />
        ) : (
          <p className="text-sm text-neutral-500">Sélectionnez une cohorte pour afficher son rapport.</p>
        )}
      </StaffSection>

      {financeAllowed ? (
        <StaffSection number="04" title="Synthèse financière" tone="navy" description="Commandes payées, paiements par moyen, remboursements (montants en FCFA)." actions={<ExportLinks csvHref={`/coordination/rapports/export?kind=finances&format=csv${params.du ? `&from=${params.du}` : ''}${params.au ? `&to=${params.au}` : ''}`} />}>
          <FilterBar
            action="/coordination/rapports"
            className="mb-4"
            hidden={{ cours: params.cours, organisation: params.organisation, cohorte: params.cohorte }}
            submitLabel="Afficher"
            fields={[
              { name: 'du', label: 'Du', type: 'date', value: params.du },
              { name: 'au', label: 'Au', type: 'date', value: params.au },
            ]}
          />
          {finance ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-5 text-sm">
                  <Kpi label="Revenu encaissé" value={fmtMoney(finance.totals.revenue, finance.currency)} icon={Banknote} />
                  <Kpi label="Commandes payées" value={String(finance.totals.paidOrders)} />
                  <Kpi label="Panier moyen" value={fmtMoney(finance.totals.averageBasket, finance.currency)} />
                  <Kpi label="Remboursements" value={`${fmtMoney(finance.totals.refunds, finance.currency)} (${finance.totals.refundCount})`} />
                  <Kpi label="Impayés" value={`${fmtMoney(finance.totals.unpaid, finance.currency)} (${finance.totals.unpaidCount})`} />
                  <Kpi label="Échecs de paiement" value={String(finance.totals.failedCount)} />
                </CardContent>
              </Card>
              <ReportTable
                caption="Revenus mensuels"
                columns={[
                  { key: 'month', label: 'Mois' },
                  { key: 'orders', label: 'Commandes', align: 'right' },
                  { key: 'revenue', label: 'Revenu', align: 'right' },
                ]}
                rows={finance.monthly.map((m) => ({ month: m.month, orders: m.orders, revenue: fmtMoney(m.revenue, finance.currency) }))}
                emptyLabel="Aucune commande payée sur la période."
              />
              <ReportTable
                caption="Commandes par statut"
                columns={[
                  { key: 'status', label: 'Statut' },
                  { key: 'count', label: 'Nombre', align: 'right' },
                  { key: 'amount', label: 'Montant', align: 'right' },
                ]}
                rows={finance.ordersByStatus.map((o) => ({ status: orderStatusLabels[o.status], count: o.count, amount: fmtMoney(o.amount, finance.currency) }))}
              />
              <ReportTable
                caption="Paiements réussis par moyen"
                columns={[
                  { key: 'method', label: 'Moyen' },
                  { key: 'count', label: 'Nombre', align: 'right' },
                  { key: 'amount', label: 'Montant', align: 'right' },
                ]}
                rows={finance.paymentsByMethod.map((p) => ({ method: paymentMethodLabels[p.method], count: p.count, amount: fmtMoney(p.amount, finance.currency) }))}
              />
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Rapport financier indisponible.</p>
          )}
        </StaffSection>
      ) : null}
    </>
  )
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Banknote }) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-1 text-[11px] text-neutral-500">
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold text-navy">{value}</p>
    </div>
  )
}
