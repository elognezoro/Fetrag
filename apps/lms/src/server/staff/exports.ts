import 'server-only'
import { audit, type Principal } from '@fetrag/domain'
import { auditContext, reports, type RequestMeta } from '@fetrag/lms-core'
import { organizationParticipants } from './organizations'
import { pdfColors, SimplePdf } from './pdf'

/**
 * Exports CSV / PDF des rapports (organisation, cohorte, cours, finances).
 * Chaque export est journalisé dans AuditLog (`export.generated`).
 */

export interface ExportFile {
  fileName: string
  contentType: string
  body: string | Uint8Array
}

type CsvRow = Record<string, unknown>

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function csvResponse(file: ExportFile): Response {
  return new Response(file.body as BodyInit, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}

// -----------------------------------------------------------------------------
// CSV
// -----------------------------------------------------------------------------

export async function organizationParticipantsCsv(principal: Principal, organizationId: string, meta: RequestMeta): Promise<ExportFile> {
  const rows = await organizationParticipants(principal, organizationId)
  const flat: CsvRow[] = rows.flatMap((row): CsvRow[] => {
    const base: CsvRow = {
      nom: row.user.name ?? [row.user.firstName, row.user.lastName].filter(Boolean).join(' '),
      email: row.user.email,
      fonction: row.membership.title ?? row.user.jobTitle ?? '',
      gestionnaire: row.membership.isManager,
    }
    if (!row.enrollments.length) {
      return [{ ...base, cours: '', code_cours: '', cohorte: '', statut: '', progression: '', score: '', termine_le: '', certificat: '', derniere_activite: '' }]
    }
    return row.enrollments.map((e) => ({
      ...base,
      cours: e.course.title,
      code_cours: e.course.code,
      cohorte: e.cohort?.code ?? '',
      statut: e.status,
      progression: e.progressPercent,
      score: e.score ?? '',
      termine_le: e.completedAt ?? '',
      certificat: e.certificates[0]?.number ?? '',
      derniere_activite: e.lastActivityAt ?? '',
    }))
  })
  await audit('export.generated', { type: 'Organization', id: organizationId }, auditContext(principal, meta), { after: { kind: 'participants', rows: flat.length } })
  return {
    fileName: `participants-${stamp()}.csv`,
    contentType: 'text/csv; charset=utf-8',
    body: reports.toCsv(flat, { columns: ['nom', 'email', 'fonction', 'gestionnaire', 'cours', 'code_cours', 'cohorte', 'statut', 'progression', 'score', 'termine_le', 'certificat', 'derniere_activite'] }),
  }
}

export async function organizationReportCsv(principal: Principal, organizationId: string, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.organizationReport(organizationId, principal)
  const rows: CsvRow[] = report.courses.map((c) => ({
    module: c.course.title,
    code: c.course.code,
    inscrits: c.enrolled,
    termines: c.completed,
    taux_achevement: c.completionRate,
    progression_moyenne: c.averageProgress,
    score_moyen: c.averageScore ?? '',
    certificats: c.certificates,
  }))
  await audit('export.generated', { type: 'Organization', id: organizationId }, auditContext(principal, meta), { after: { kind: 'organization-report' } })
  return { fileName: `rapport-organisation-${stamp()}.csv`, contentType: 'text/csv; charset=utf-8', body: reports.toCsv(rows) }
}

export async function cohortReportCsv(principal: Principal, cohortId: string, meta: RequestMeta): Promise<ExportFile> {
  const csv = await reports.cohortCsv(cohortId, principal)
  await audit('export.generated', { type: 'Cohort', id: cohortId }, auditContext(principal, meta), { after: { kind: 'cohort-report' } })
  return { fileName: `rapport-cohorte-${stamp()}.csv`, contentType: 'text/csv; charset=utf-8', body: csv }
}

export async function courseReportCsv(principal: Principal, courseId: string, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.courseReport(courseId, principal)
  const rows: CsvRow[] = [
    { indicateur: 'Inscriptions', valeur: report.enrollments.total },
    ...Object.entries(report.enrollments.byStatus).map((entry): CsvRow => ({ indicateur: `Inscriptions ${entry[0]}`, valeur: entry[1] ?? 0 })),
    { indicateur: 'Actifs sur 30 jours', valeur: report.enrollments.activeLast30Days },
    { indicateur: "Taux d'achèvement (%)", valeur: report.enrollments.completionRate },
    { indicateur: 'Progression moyenne (%)', valeur: report.enrollments.averageProgress },
    { indicateur: 'Score moyen (%)', valeur: report.enrollments.averageScore ?? '' },
    { indicateur: 'Temps moyen (s)', valeur: report.enrollments.averageTimeSeconds },
    { indicateur: 'Tentatives corrigées', valeur: report.assessments.gradedAttempts },
    { indicateur: 'Taux de réussite (%)', valeur: report.assessments.passRate },
    { indicateur: 'Certificats émis', valeur: report.certificates },
    { indicateur: 'Réponses satisfaction', valeur: report.satisfactionResponses },
    ...report.organizations.map((o): CsvRow => ({ indicateur: `Organisation ${o.name}`, valeur: `${o.enrolled} inscrit(s), ${o.averageProgress} %` })),
  ]
  await audit('export.generated', { type: 'Course', id: courseId }, auditContext(principal, meta), { after: { kind: 'course-report' } })
  return { fileName: `rapport-cours-${report.course.code}-${stamp()}.csv`, contentType: 'text/csv; charset=utf-8', body: reports.toCsv(rows) }
}

export async function financeReportCsv(principal: Principal, range: { from?: Date; to?: Date }, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.financeReport(range, principal)
  const rows: CsvRow[] = [
    ...report.monthly.map((m): CsvRow => ({ section: 'Mensuel', libelle: m.month, montant: m.revenue, nombre: m.orders })),
    ...report.ordersByStatus.map((o): CsvRow => ({ section: 'Commandes', libelle: o.status, montant: o.amount, nombre: o.count })),
    ...report.paymentsByMethod.map((p): CsvRow => ({ section: 'Paiements par moyen', libelle: p.method, montant: p.amount, nombre: p.count })),
    ...report.topOffers.map((o): CsvRow => ({ section: 'Offres', libelle: o.label, montant: o.revenue, nombre: o.quantity })),
    { section: 'Totaux', libelle: 'Revenu encaissé', montant: report.totals.revenue, nombre: report.totals.paidOrders },
    { section: 'Totaux', libelle: 'Remboursements', montant: report.totals.refunds, nombre: report.totals.refundCount },
  ]
  await audit('export.generated', { type: 'Finance', id: null }, auditContext(principal, meta), { after: { kind: 'finance-report', from: range.from ?? null, to: range.to ?? null } })
  return { fileName: `rapport-financier-${stamp()}.csv`, contentType: 'text/csv; charset=utf-8', body: reports.toCsv(rows) }
}

// -----------------------------------------------------------------------------
// PDF : synthèse d'organisation, de cohorte ou de cours (writer local, motifs du logo)
// -----------------------------------------------------------------------------

interface PdfWriter {
  pdf: SimplePdf
  y: number
  title: string
  subtitle: string
}

function header(w: PdfWriter): void {
  const { pdf } = w
  const width = pdf.width
  const top = pdf.height
  // Bande tricolore (ruban de la devise).
  pdf.rect({ x: 0, y: top - 8, width: width / 3, height: 8, color: pdfColors.blue })
  pdf.rect({ x: width / 3, y: top - 8, width: width / 3, height: 8, color: pdfColors.green })
  pdf.rect({ x: (2 * width) / 3, y: top - 8, width: width / 3, height: 8, color: pdfColors.gold })
  // Anneau bleu, arc vert et étoile or stylisés (motifs du logo).
  pdf.circle({ x: 60, y: top - 60, radius: 22, stroke: pdfColors.blue, strokeWidth: 4 })
  pdf.circle({ x: 60, y: top - 60, radius: 6, fill: pdfColors.gold })
  pdf.text('FETRAG', { x: 95, y: top - 52, size: 18, bold: true, color: pdfColors.navy })
  pdf.text('Fédération des Travailleurs du Gabon · Travail · Efficacité · Solidarité', { x: 95, y: top - 68, size: 9, color: pdfColors.grey })
  pdf.text(w.title, { x: 40, y: top - 110, size: 16, bold: true, color: pdfColors.navy })
  pdf.text(w.subtitle, { x: 40, y: top - 126, size: 10, color: pdfColors.grey })
  pdf.line({ from: { x: 40, y: top - 136 }, to: { x: width - 40, y: top - 136 }, thickness: 1, color: pdfColors.border })
  w.y = top - 156
}

function createWriter(title: string, subtitle: string): PdfWriter {
  const w: PdfWriter = { pdf: new SimplePdf(), y: 0, title, subtitle }
  header(w)
  return w
}

function ensureRoom(w: PdfWriter, needed: number): void {
  if (w.y - needed < 50) {
    w.pdf.addPage()
    header(w)
  }
}

function sectionTitle(w: PdfWriter, text: string): void {
  ensureRoom(w, 30)
  w.pdf.rect({ x: 40, y: w.y - 4, width: 4, height: 14, color: pdfColors.green })
  w.pdf.text(text, { x: 50, y: w.y, size: 12, bold: true, color: pdfColors.navy })
  w.y -= 22
}

function keyValue(w: PdfWriter, label: string, value: string): void {
  ensureRoom(w, 16)
  w.pdf.text(label, { x: 50, y: w.y, size: 9.5, color: pdfColors.grey })
  w.pdf.text(value, { x: 260, y: w.y, size: 9.5, bold: true, color: pdfColors.ink })
  w.y -= 14
}

function table(w: PdfWriter, columns: Array<{ label: string; width: number }>, rows: string[][]): void {
  ensureRoom(w, 40)
  let x = 50
  w.pdf.rect({ x: 45, y: w.y - 4, width: 505, height: 16, color: pdfColors.surface })
  for (const col of columns) {
    w.pdf.text(col.label.toUpperCase(), { x, y: w.y, size: 7.5, bold: true, color: pdfColors.grey })
    x += col.width
  }
  w.y -= 18
  if (rows.length === 0) {
    w.pdf.text('Aucune donnée', { x: 50, y: w.y, size: 8.5, color: pdfColors.grey })
    w.y -= 14
  }
  for (const row of rows) {
    ensureRoom(w, 16)
    x = 50
    row.forEach((cell, index) => {
      const width = columns[index]?.width ?? 60
      w.pdf.text(SimplePdf.fit(cell, 8.5, width - 6), { x, y: w.y, size: 8.5, color: pdfColors.ink })
      x += width
    })
    w.y -= 14
  }
  w.y -= 6
}

function finish(w: PdfWriter): Uint8Array {
  const total = w.pdf.pageCount
  for (let index = 0; index < total; index++) {
    w.pdf.textOnPage(index, `Généré le ${new Date().toLocaleDateString('fr-FR')} - page ${index + 1}/${total} - formation.fetrag.ga`, { x: 40, y: 30, size: 8, color: pdfColors.grey })
  }
  return w.pdf.save()
}

export async function organizationReportPdf(principal: Principal, organizationId: string, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.organizationReport(organizationId, principal)
  const w = createWriter(`Rapport de formation - ${report.organization.name}`, `Synthèse au ${new Date().toLocaleDateString('fr-FR')}`)
  sectionTitle(w, '01 - Indicateurs')
  keyValue(w, 'Participants', String(report.learners))
  keyValue(w, 'Inscriptions', String(report.enrollments.total))
  keyValue(w, 'Progression moyenne', `${report.enrollments.averageProgress} %`)
  keyValue(w, 'Score moyen', report.enrollments.averageScore === null ? '-' : `${report.enrollments.averageScore} %`)
  keyValue(w, 'Certificats émis', String(report.certificates))
  keyValue(w, 'Temps de formation cumulé', `${Math.round(report.enrollments.totalTimeSeconds / 3600)} h`)
  w.y -= 8
  sectionTitle(w, '02 - Par module')
  table(
    w,
    [
      { label: 'Module', width: 200 },
      { label: 'Inscrits', width: 60 },
      { label: 'Terminés', width: 60 },
      { label: 'Achèvement', width: 70 },
      { label: 'Score moyen', width: 60 },
      { label: 'Certificats', width: 55 },
    ],
    report.courses.map((c) => [c.course.title, String(c.enrolled), String(c.completed), `${c.completionRate} %`, c.averageScore === null ? '-' : `${c.averageScore} %`, String(c.certificates)]),
  )
  sectionTitle(w, '03 - Cohortes')
  table(
    w,
    [
      { label: 'Cohorte', width: 200 },
      { label: 'Code', width: 90 },
      { label: 'Statut', width: 70 },
      { label: 'Membres', width: 60 },
      { label: 'Sessions', width: 60 },
    ],
    report.cohorts.map((c) => [c.name, c.code, c.status, String(c._count.members), String(c._count.sessions)]),
  )
  await audit('export.generated', { type: 'Organization', id: organizationId }, auditContext(principal, meta), { after: { kind: 'organization-report-pdf' } })
  return { fileName: `rapport-organisation-${stamp()}.pdf`, contentType: 'application/pdf', body: finish(w) }
}

export async function cohortReportPdf(principal: Principal, cohortId: string, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.cohortReport(cohortId, principal)
  const w = createWriter(`Rapport de cohorte - ${report.cohort.name}`, `${report.cohort.course.title} · code ${report.cohort.code}${report.cohort.organization ? ` · ${report.cohort.organization.name}` : ''}`)
  sectionTitle(w, '01 - Indicateurs')
  keyValue(w, 'Membres', String(report.stats.members))
  keyValue(w, 'Formation terminée', `${report.stats.completed} (${report.stats.completionRate} %)`)
  keyValue(w, 'Progression moyenne', `${report.stats.averageProgress} %`)
  keyValue(w, 'Score moyen', report.stats.averageScore === null ? '-' : `${report.stats.averageScore} %`)
  keyValue(w, 'Assiduité moyenne', report.stats.averageAttendance === null ? '-' : `${report.stats.averageAttendance} %`)
  keyValue(w, 'Certificats émis', String(report.stats.certificates))
  keyValue(w, 'Sessions (réalisées / planifiées)', `${report.stats.pastSessions} / ${report.stats.sessions}`)
  w.y -= 8
  sectionTitle(w, '02 - Participants')
  table(
    w,
    [
      { label: 'Nom', width: 150 },
      { label: 'Fonction', width: 110 },
      { label: 'Statut', width: 60 },
      { label: 'Progression', width: 65 },
      { label: 'Score', width: 45 },
      { label: 'Assiduité', width: 55 },
      { label: 'Certificat', width: 20 },
    ],
    report.members.map((m) => [m.name, m.jobTitle ?? '-', m.status, `${m.progressPercent} %`, m.score === null ? '-' : `${m.score} %`, m.attendanceRate === null ? '-' : `${m.attendanceRate} %`, m.certificateNumber ? 'oui' : '-']),
  )
  sectionTitle(w, '03 - Sessions')
  table(
    w,
    [
      { label: 'Session', width: 200 },
      { label: 'Date', width: 110 },
      { label: 'Présents', width: 55 },
      { label: 'Retards', width: 55 },
      { label: 'Absents', width: 55 },
      { label: 'Excusés', width: 30 },
    ],
    report.sessions.map((s) => [s.title, s.startsAt.toLocaleDateString('fr-FR'), String(s.present), String(s.late), String(s.absent), String(s.excused)]),
  )
  await audit('export.generated', { type: 'Cohort', id: cohortId }, auditContext(principal, meta), { after: { kind: 'cohort-report-pdf' } })
  return { fileName: `rapport-cohorte-${report.cohort.code}-${stamp()}.pdf`, contentType: 'application/pdf', body: finish(w) }
}

export async function courseReportPdf(principal: Principal, courseId: string, meta: RequestMeta): Promise<ExportFile> {
  const report = await reports.courseReport(courseId, principal)
  const w = createWriter(`Rapport de cours - ${report.course.title}`, `Code ${report.course.code} · synthèse au ${new Date().toLocaleDateString('fr-FR')}`)
  sectionTitle(w, '01 - Inscriptions')
  keyValue(w, 'Inscriptions', String(report.enrollments.total))
  keyValue(w, 'Actifs sur 30 jours', String(report.enrollments.activeLast30Days))
  keyValue(w, "Taux d'achèvement", `${report.enrollments.completionRate} %`)
  keyValue(w, 'Progression moyenne', `${report.enrollments.averageProgress} %`)
  keyValue(w, 'Score moyen', report.enrollments.averageScore === null ? '-' : `${report.enrollments.averageScore} %`)
  keyValue(w, 'Temps moyen', `${Math.round(report.enrollments.averageTimeSeconds / 60)} min`)
  w.y -= 8
  sectionTitle(w, '02 - Évaluations et certificats')
  keyValue(w, 'Tentatives corrigées', String(report.assessments.gradedAttempts))
  keyValue(w, 'Taux de réussite', `${report.assessments.passRate} %`)
  keyValue(w, 'Certificats émis', String(report.certificates))
  keyValue(w, 'Réponses aux questionnaires', String(report.satisfactionResponses))
  w.y -= 8
  sectionTitle(w, '03 - Par organisation')
  table(
    w,
    [
      { label: 'Organisation', width: 300 },
      { label: 'Inscrits', width: 100 },
      { label: 'Progression', width: 100 },
    ],
    report.organizations.map((o) => [o.name, String(o.enrolled), `${o.averageProgress} %`]),
  )
  await audit('export.generated', { type: 'Course', id: courseId }, auditContext(principal, meta), { after: { kind: 'course-report-pdf' } })
  return { fileName: `rapport-cours-${report.course.code}-${stamp()}.pdf`, contentType: 'application/pdf', body: finish(w) }
}
