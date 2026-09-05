import 'server-only'
import { lmsStats, topContent, webStats, type LmsStats, type TopContent, type WebStats } from '@fetrag/analytics'
import type { RequestContext } from '@fetrag/cms'
import { enrollmentStatusLabels, formKindLabels } from '@fetrag/contracts'
import { Prisma, prisma } from '@fetrag/db'
import { audit, type Principal } from '@fetrag/domain'
import { toCsv, type CsvCell } from '@fetrag/jobs'
import { reports } from '@fetrag/lms-core'

async function safe<T>(label: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task()
  } catch (error) {
    console.error(`[admin/rapports] ${label} indisponible`, error instanceof Error ? error.message : error)
    return null
  }
}

export type LmsOverview = Awaited<ReturnType<typeof reports.lmsOverview>>

export interface ReportsData {
  web: WebStats | null
  lms: LmsStats | null
  overview: LmsOverview | null
  top: TopContent | null
  enrollmentsByMonth: Array<{ month: string; enrollments: number; completed: number }>
}

/** Inscriptions LMS créées et terminées par mois sur 12 mois (série complète, mois vides à zéro). */
async function loadEnrollmentsByMonth(months = 12): Promise<ReportsData['enrollmentsByMonth']> {
  const now = new Date()
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1))
  const [created, completed] = await Promise.all([
    prisma.$queryRaw<Array<{ month: string; count: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM "Enrollment" WHERE "createdAt" >= ${from} GROUP BY 1 ORDER BY 1`),
    prisma.$queryRaw<Array<{ month: string; count: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', "completedAt"), 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM "Enrollment" WHERE "completedAt" IS NOT NULL AND "completedAt" >= ${from} GROUP BY 1 ORDER BY 1`),
  ])
  const createdMap = new Map(created.map((r) => [r.month, Number(r.count)]))
  const completedMap = new Map(completed.map((r) => [r.month, Number(r.count)]))
  const series: ReportsData['enrollmentsByMonth'] = []
  const cursor = new Date(from)
  for (let i = 0; i < months; i++) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`
    series.push({ month: key, enrollments: createdMap.get(key) ?? 0, completed: completedMap.get(key) ?? 0 })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return series
}

/** Indicateurs web, LMS, qualité et contenus populaires (reports.read), chaque bloc étant tolérant aux pannes. */
export async function loadReports(principal: Principal): Promise<ReportsData> {
  const [web, lms, overview, top, enrollmentsByMonth] = await Promise.all([
    safe('webStats', () => webStats()),
    safe('lmsStats', () => lmsStats()),
    safe('lmsOverview', () => reports.lmsOverview(principal)),
    safe('topContent', () => topContent(8)),
    safe('enrollmentsByMonth', () => loadEnrollmentsByMonth()),
  ])
  return { web, lms, overview, top, enrollmentsByMonth: enrollmentsByMonth ?? [] }
}

// -----------------------------------------------------------------------------
// Exports CSV
// -----------------------------------------------------------------------------

export const reportExportKinds = ['web', 'lms', 'contenus'] as const
export type ReportExportKind = (typeof reportExportKinds)[number]

function auditCtx(principal: Principal, ctx: RequestContext) {
  return { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent, correlationId: ctx.correlationId }
}

/** CSV des indicateurs web : visites par jour puis synthèse (formulaires, demandes, commandes, newsletter). */
export async function exportWebReportCsv(principal: Principal, ctx: RequestContext): Promise<string> {
  const stats = await webStats()
  const rows: CsvCell[][] = stats.visits.byDay.map((d) => ['visites', d.day, 'Pages vues', d.views, 'Visiteurs uniques', d.visitors])
  rows.push(['synthese', stats.period.to.toISOString().slice(0, 10), 'Pages vues (30 j)', stats.visits.totalViews, 'Visiteurs uniques (30 j)', stats.visits.uniqueVisitors])
  rows.push(['synthese', '', 'Formulaires reçus (30 j)', stats.forms.total, 'Inscriptions événements (30 j)', stats.eventRegistrations])
  rows.push(['synthese', '', 'Demandes de service (30 j)', stats.serviceRequests.total, 'Abonnés newsletter confirmés', stats.newsletter.confirmed])
  rows.push(['synthese', '', 'Commandes (30 j)', stats.orders.total, 'Commandes payées (30 j)', stats.orders.paid])
  rows.push(['synthese', '', 'Chiffre d’affaires (30 j)', stats.orders.revenue, 'Taux de conversion (%)', stats.orders.conversionRate])
  for (const f of stats.forms.byKind) rows.push(['formulaires', '', formKindLabels[f.kind as keyof typeof formKindLabels] ?? f.kind, f.count, '', ''])
  for (const s of stats.topSearches) rows.push(['recherches', '', s.query, s.count, '', ''])
  await audit('export.generated', { type: 'Report', id: 'web' }, auditCtx(principal, ctx), { after: { kind: 'web', rows: rows.length } })
  return toCsv(['Section', 'Jour', 'Indicateur', 'Valeur', 'Indicateur 2', 'Valeur 2'], rows)
}

/** CSV des indicateurs LMS : synthèse, inscriptions par statut, série mensuelle et cours les plus suivis. */
export async function exportLmsReportCsv(principal: Principal, ctx: RequestContext): Promise<string> {
  const [stats, overview, series] = await Promise.all([lmsStats(), reports.lmsOverview(principal), loadEnrollmentsByMonth()])
  const rows: CsvCell[][] = [
    ['synthese', 'Apprenants actifs (30 j)', stats.activeLearners30d],
    ['synthese', 'Inscriptions totales', stats.enrollments.total],
    ['synthese', 'Nouvelles inscriptions (30 j)', stats.enrollments.last30d],
    ['synthese', 'Progression moyenne (%)', stats.averageCompletion],
    ['synthese', 'Taux de complétion (%)', stats.completionRate],
    ['synthese', 'Taux de réussite aux évaluations (%)', stats.quizPassRate],
    ['synthese', 'Taux d’assiduité (%)', overview.attendanceRate ?? ''],
    ['synthese', 'Réponses aux enquêtes de satisfaction', overview.satisfactionResponses],
    ['synthese', 'Certificats émis', stats.certificates.total],
    ['synthese', 'Certificats émis (30 j)', stats.certificates.last30d],
    ['synthese', 'Certificats révoqués', stats.certificates.revoked],
    ['synthese', 'Cohortes en cours', stats.cohorts.running],
    ['synthese', 'Cohortes ouvertes', stats.cohorts.open],
    ['synthese', 'Cohortes planifiées', stats.cohorts.planned],
    ['synthese', 'Temps total de formation (h)', stats.totalTimeHours],
  ]
  for (const s of stats.enrollments.byStatus) rows.push(['inscriptions_par_statut', enrollmentStatusLabels[s.status as keyof typeof enrollmentStatusLabels] ?? s.status, s.count])
  for (const m of series) {
    rows.push(['inscriptions_par_mois', m.month, m.enrollments])
    rows.push(['completions_par_mois', m.month, m.completed])
  }
  for (const c of stats.topCourses) rows.push(['cours_les_plus_suivis', c.title, c.enrollments])
  await audit('export.generated', { type: 'Report', id: 'lms' }, auditCtx(principal, ctx), { after: { kind: 'lms', rows: rows.length } })
  return toCsv(['Section', 'Indicateur', 'Valeur'], rows)
}

/** CSV des contenus populaires (actualités, ressources, formations, événements). */
export async function exportContentReportCsv(principal: Principal, ctx: RequestContext): Promise<string> {
  const top = await topContent(25)
  const rows: CsvCell[][] = [
    ...top.articles.map((a): CsvCell[] => ['Actualité', a.title, a.slug, a.viewCount, 'vues']),
    ...top.resources.map((r): CsvCell[] => ['Ressource', r.title, r.slug, r.downloadCount, 'téléchargements']),
    ...top.courses.map((c): CsvCell[] => ['Formation', c.title, c.slug, c.enrollments, 'inscriptions']),
    ...top.events.map((e): CsvCell[] => ['Événement', e.title, e.slug, e.registrations, 'inscriptions']),
  ]
  await audit('export.generated', { type: 'Report', id: 'contenus' }, auditCtx(principal, ctx), { after: { kind: 'contenus', rows: rows.length } })
  return toCsv(['Type', 'Titre', 'Slug', 'Valeur', 'Mesure'], rows)
}
