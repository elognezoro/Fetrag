import { prisma, type OrderStatus, type PaymentMethod, type PaymentStatus, type Prisma } from '@fetrag/db'
import { ForbiddenError, NotFoundError } from '@fetrag/domain'
import { computeCohortAttendance } from './internal/attendance-rate'
import { canTeachCohort } from './cohorts'
import { assertCan, assertOrganizationAccess, can, requirePrincipal } from './lib/access'
import { displayName, percent } from './lib/text'
import type { Principal } from './types'

// -----------------------------------------------------------------------------
// CSV
// -----------------------------------------------------------------------------

export interface CsvColumn {
  key: string
  label?: string
}

export interface CsvOptions {
  columns?: Array<string | CsvColumn>
  separator?: string
  /** Ajoute le BOM UTF-8 pour Excel (par défaut oui). */
  bom?: boolean
}

function csvCell(value: unknown, separator: string): string {
  if (value === null || value === undefined) return ''
  let text: string
  if (value instanceof Date) text = value.toISOString()
  else if (typeof value === 'object') text = JSON.stringify(value)
  else if (typeof value === 'boolean') text = value ? 'oui' : 'non'
  else text = String(value)
  const needsQuote = text.includes(separator) || text.includes('"') || text.includes('\n') || text.includes('\r')
  return needsQuote ? `"${text.replace(/"/g, '""')}"` : text
}

/** Sérialise des lignes en CSV (séparateur ; par défaut, échappement RFC 4180, BOM Excel). */
export function toCsv(rows: Array<Record<string, unknown>>, options: CsvOptions = {}): string {
  const separator = options.separator ?? ';'
  const columns: CsvColumn[] = (options.columns ?? (rows[0] ? Object.keys(rows[0]) : [])).map((c) => (typeof c === 'string' ? { key: c } : c))
  const header = columns.map((c) => csvCell(c.label ?? c.key, separator)).join(separator)
  const lines = rows.map((row) => columns.map((c) => csvCell(row[c.key], separator)).join(separator))
  return `${options.bom === false ? '' : '﻿'}${[header, ...lines].join('\r\n')}`
}

// -----------------------------------------------------------------------------
// Rapport de cohorte
// -----------------------------------------------------------------------------

/** Rapport de session (LMS-06 / LMS-21) : membres, progression, résultats, assiduité, certificats. */
export async function cohortReport(cohortId: string, principal: Principal) {
  const p = requirePrincipal(principal)
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      course: { select: { id: true, title: true, code: true } },
      organization: { select: { id: true, name: true } },
      trainer: { select: { id: true, name: true } },
      sessions: { orderBy: { startsAt: 'asc' }, include: { attendances: { select: { userId: true, status: true } } } },
      enrollments: {
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, jobTitle: true } },
          certificates: { where: { status: 'ISSUED' }, select: { id: true, number: true, issuedAt: true } },
        },
      },
    },
  })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  const allowed = canTeachCohort(p, cohort) || can(p, 'reports.read') || (cohort.organizationId ? can(p, 'reports.org', { organizationId: cohort.organizationId }) : false)
  if (!allowed) throw new ForbiddenError('Accès au rapport refusé')

  const attendance = await computeCohortAttendance(prisma, cohortId)
  const members = cohort.enrollments.map((e) => ({
    userId: e.userId,
    name: displayName(e.user),
    email: e.user.email,
    jobTitle: e.user.jobTitle,
    status: e.status,
    progressPercent: e.progressPercent,
    score: e.score,
    timeSpentSeconds: e.timeSpentSeconds,
    attendanceRate: attendance.pastSessions > 0 ? (attendance.byUser.get(e.userId) ?? 0) : null,
    completedAt: e.completedAt,
    certificateNumber: e.certificates[0]?.number ?? null,
  }))
  const scored = members.filter((m) => m.score !== null)
  const rated = members.filter((m) => m.attendanceRate !== null)
  return {
    cohort: { id: cohort.id, code: cohort.code, name: cohort.name, status: cohort.status, startsAt: cohort.startsAt, endsAt: cohort.endsAt, mode: cohort.mode, course: cohort.course, organization: cohort.organization, trainer: cohort.trainer },
    stats: {
      members: members.length,
      active: members.filter((m) => m.status === 'ACTIVE').length,
      completed: members.filter((m) => m.status === 'COMPLETED').length,
      completionRate: percent(members.filter((m) => m.status === 'COMPLETED').length, members.length),
      averageProgress: members.length ? Math.round(members.reduce((s, m) => s + m.progressPercent, 0) / members.length) : 0,
      averageScore: scored.length ? Math.round(scored.reduce((s, m) => s + (m.score ?? 0), 0) / scored.length) : null,
      passRate: scored.length ? percent(scored.filter((m) => (m.score ?? 0) >= 60).length, scored.length) : null,
      averageAttendance: rated.length ? Math.round(rated.reduce((s, m) => s + (m.attendanceRate ?? 0), 0) / rated.length) : null,
      certificates: members.filter((m) => m.certificateNumber).length,
      sessions: cohort.sessions.length,
      pastSessions: attendance.pastSessions,
    },
    sessions: cohort.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      mode: s.mode,
      present: s.attendances.filter((a) => a.status === 'PRESENT').length,
      late: s.attendances.filter((a) => a.status === 'LATE').length,
      absent: s.attendances.filter((a) => a.status === 'ABSENT').length,
      excused: s.attendances.filter((a) => a.status === 'EXCUSED').length,
    })),
    members,
  }
}

// -----------------------------------------------------------------------------
// Rapport d'organisation
// -----------------------------------------------------------------------------

/** Rapport d'organisation (LMS-09) strictement filtré par organizationId. */
export async function organizationReport(organizationId: string, principal: Principal) {
  const p = assertOrganizationAccess(principal, organizationId)
  if (!can(p, 'reports.org', { organizationId })) throw new ForbiddenError('Accès au rapport refusé')
  const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true, acronym: true, sector: true, city: true, isAffiliate: true } })
  if (!organization) throw new NotFoundError('Organisation', organizationId)

  const [requestsByStatus, enrollmentsByStatus, enrollmentAgg, learners, certificates, cohorts, byCourse] = await Promise.all([
    prisma.trainingRequest.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.enrollment.aggregate({ where: { organizationId }, _avg: { progressPercent: true, score: true }, _sum: { timeSpentSeconds: true }, _count: { _all: true } }),
    prisma.enrollment.findMany({ where: { organizationId }, distinct: ['userId'], select: { userId: true } }),
    prisma.certificate.count({ where: { status: 'ISSUED', enrollment: { organizationId } } }),
    prisma.cohort.findMany({
      where: { organizationId },
      orderBy: { startsAt: 'desc' },
      select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true, course: { select: { id: true, title: true } }, _count: { select: { members: true, sessions: true } } },
    }),
    prisma.enrollment.groupBy({ by: ['courseId'], where: { organizationId }, _count: { _all: true }, _avg: { progressPercent: true, score: true } }),
  ])
  const courseIds = byCourse.map((c) => c.courseId)
  const [courses, completedByCourse, certificatesByCourse] = await Promise.all([
    prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true, code: true } }),
    prisma.enrollment.groupBy({ by: ['courseId'], where: { organizationId, status: 'COMPLETED' }, _count: { _all: true } }),
    prisma.certificate.groupBy({ by: ['enrollmentId'], where: { status: 'ISSUED', enrollment: { organizationId } }, _count: { _all: true } }),
  ])
  const courseById = new Map(courses.map((c) => [c.id, c] as const))
  const completedMap = new Map(completedByCourse.map((c) => [c.courseId, c._count._all] as const))
  const certifiedEnrollments = new Set(certificatesByCourse.map((c) => c.enrollmentId).filter((id): id is string => Boolean(id)))
  const certifiedByCourse = new Map<string, number>()
  if (certifiedEnrollments.size > 0) {
    const rows = await prisma.enrollment.findMany({ where: { id: { in: [...certifiedEnrollments] } }, select: { courseId: true } })
    for (const row of rows) certifiedByCourse.set(row.courseId, (certifiedByCourse.get(row.courseId) ?? 0) + 1)
  }

  return {
    organization,
    requests: Object.fromEntries(requestsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    enrollments: {
      total: enrollmentAgg._count._all,
      byStatus: Object.fromEntries(enrollmentsByStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
      averageProgress: Math.round(enrollmentAgg._avg.progressPercent ?? 0),
      averageScore: enrollmentAgg._avg.score === null ? null : Math.round(enrollmentAgg._avg.score),
      totalTimeSeconds: enrollmentAgg._sum.timeSpentSeconds ?? 0,
    },
    learners: learners.length,
    certificates,
    cohorts,
    courses: byCourse.map((c) => ({
      course: courseById.get(c.courseId) ?? { id: c.courseId, title: 'Cours', code: '' },
      enrolled: c._count._all,
      completed: completedMap.get(c.courseId) ?? 0,
      completionRate: percent(completedMap.get(c.courseId) ?? 0, c._count._all),
      averageProgress: Math.round(c._avg.progressPercent ?? 0),
      averageScore: c._avg.score === null ? null : Math.round(c._avg.score),
      certificates: certifiedByCourse.get(c.courseId) ?? 0,
    })),
  }
}

// -----------------------------------------------------------------------------
// Rapport de cours
// -----------------------------------------------------------------------------

/** Rapport par cours : inscriptions, complétion, réussite, temps, tentatives, certificats, satisfaction. */
export async function courseReport(courseId: string, principal: Principal) {
  const p = requirePrincipal(principal)
  if (!can(p, 'reports.read') && !can(p, 'course.teach', { courseId })) throw new ForbiddenError('Accès au rapport refusé')
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true, code: true, status: true, currentVersionId: true } })
  if (!course) throw new NotFoundError('Cours', courseId)

  const [byStatus, agg, attempts, certificates, cohorts, activeLearners, byOrganization, satisfaction] = await Promise.all([
    prisma.enrollment.groupBy({ by: ['status'], where: { courseId }, _count: { _all: true } }),
    prisma.enrollment.aggregate({ where: { courseId }, _avg: { progressPercent: true, score: true, timeSpentSeconds: true }, _count: { _all: true } }),
    prisma.attempt.aggregate({
      where: { status: 'GRADED', quiz: { isSurvey: false, activity: { lesson: { module: { courseVersion: { courseId } } } } } },
      _avg: { percent: true },
      _count: { _all: true },
    }),
    prisma.certificate.count({ where: { status: 'ISSUED', enrollment: { courseId } } }),
    prisma.cohort.groupBy({ by: ['status'], where: { courseId }, _count: { _all: true } }),
    prisma.enrollment.count({ where: { courseId, status: 'ACTIVE', lastActivityAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } }),
    prisma.enrollment.groupBy({ by: ['organizationId'], where: { courseId, organizationId: { not: null } }, _count: { _all: true }, _avg: { progressPercent: true } }),
    prisma.attempt.count({ where: { status: { in: ['SUBMITTED', 'GRADED'] }, quiz: { isSurvey: true, activity: { lesson: { module: { courseVersion: { courseId } } } } } } }),
  ])
  const passed = await prisma.attempt.count({ where: { status: 'GRADED', passed: true, quiz: { isSurvey: false, activity: { lesson: { module: { courseVersion: { courseId } } } } } } })
  const organizationIds = byOrganization.map((o) => o.organizationId).filter((id): id is string => Boolean(id))
  const organizations = await prisma.organization.findMany({ where: { id: { in: organizationIds } }, select: { id: true, name: true } })
  const orgById = new Map(organizations.map((o) => [o.id, o.name] as const))
  const completed = byStatus.find((s) => s.status === 'COMPLETED')?._count._all ?? 0

  return {
    course,
    enrollments: {
      total: agg._count._all,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
      activeLast30Days: activeLearners,
      completionRate: percent(completed, agg._count._all),
      averageProgress: Math.round(agg._avg.progressPercent ?? 0),
      averageScore: agg._avg.score === null ? null : Math.round(agg._avg.score),
      averageTimeSeconds: Math.round(agg._avg.timeSpentSeconds ?? 0),
    },
    assessments: {
      gradedAttempts: attempts._count._all,
      averagePercent: attempts._avg.percent === null ? null : Math.round(attempts._avg.percent),
      passRate: percent(passed, attempts._count._all),
    },
    certificates,
    cohorts: Object.fromEntries(cohorts.map((c) => [c.status, c._count._all])) as Partial<Record<string, number>>,
    satisfactionResponses: satisfaction,
    organizations: byOrganization.map((o) => ({ organizationId: o.organizationId, name: o.organizationId ? (orgById.get(o.organizationId) ?? 'Organisation') : 'Individuels', enrolled: o._count._all, averageProgress: Math.round(o._avg.progressPercent ?? 0) })),
  }
}

// -----------------------------------------------------------------------------
// Rapport financier
// -----------------------------------------------------------------------------

export interface FinanceRange {
  from?: Date
  to?: Date
}

/** Rapport financier : commandes / paiements par statut et moyen, remboursements, panier moyen, revenus mensuels, revenus par cours. */
export async function financeReport(range: FinanceRange, principal: Principal) {
  assertCan(principal, 'finance.read')
  const to = range.to ?? new Date()
  const from = range.from ?? new Date(to.getTime() - 365 * 24 * 3600 * 1000)
  const createdAt: Prisma.DateTimeFilter = { gte: from, lte: to }

  const [ordersByStatus, paymentsByStatus, paymentsByMethod, refunds, paidOrders, lines] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], where: { createdAt }, _count: { _all: true }, _sum: { totalAmount: true } }),
    prisma.payment.groupBy({ by: ['status'], where: { createdAt }, _count: { _all: true }, _sum: { amount: true } }),
    prisma.payment.groupBy({ by: ['method'], where: { createdAt, status: 'SUCCEEDED' }, _count: { _all: true }, _sum: { amount: true } }),
    prisma.refund.aggregate({ where: { createdAt, status: 'PROCESSED' }, _count: { _all: true }, _sum: { amount: true } }),
    prisma.order.findMany({ where: { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] }, paidAt: createdAt }, select: { id: true, totalAmount: true, discountAmount: true, paidAt: true, currency: true } }),
    prisma.orderLine.findMany({
      where: { order: { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] }, paidAt: createdAt } },
      select: { totalAmount: true, quantity: true, label: true, offer: { select: { kind: true, courseId: true, eventId: true, serviceId: true, course: { select: { title: true } } } } },
    }),
  ])

  const monthly = new Map<string, { month: string; revenue: number; orders: number }>()
  for (const order of paidOrders) {
    const key = (order.paidAt ?? new Date()).toISOString().slice(0, 7)
    const entry = monthly.get(key) ?? { month: key, revenue: 0, orders: 0 }
    entry.revenue += order.totalAmount
    entry.orders += 1
    monthly.set(key, entry)
  }
  const byOffer = new Map<string, { label: string; kind: string; revenue: number; quantity: number }>()
  for (const line of lines) {
    const key = line.offer?.courseId ?? line.offer?.eventId ?? line.offer?.serviceId ?? line.label
    const entry = byOffer.get(key) ?? { label: line.offer?.course?.title ?? line.label, kind: line.offer?.kind ?? 'OTHER', revenue: 0, quantity: 0 }
    entry.revenue += line.totalAmount
    entry.quantity += line.quantity
    byOffer.set(key, entry)
  }
  const revenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0)
  const pendingOrders = ordersByStatus.find((o) => o.status === 'PENDING')
  const failed = ordersByStatus.find((o) => o.status === 'FAILED')

  return {
    range: { from, to },
    currency: paidOrders[0]?.currency ?? 'XAF',
    totals: {
      revenue,
      paidOrders: paidOrders.length,
      averageBasket: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
      discounts: paidOrders.reduce((s, o) => s + o.discountAmount, 0),
      refunds: refunds._sum.amount ?? 0,
      refundCount: refunds._count._all,
      unpaid: pendingOrders?._sum.totalAmount ?? 0,
      unpaidCount: pendingOrders?._count._all ?? 0,
      failedCount: failed?._count._all ?? 0,
    },
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status as OrderStatus, count: o._count._all, amount: o._sum.totalAmount ?? 0 })),
    paymentsByStatus: paymentsByStatus.map((o) => ({ status: o.status as PaymentStatus, count: o._count._all, amount: o._sum.amount ?? 0 })),
    paymentsByMethod: paymentsByMethod.map((o) => ({ method: o.method as PaymentMethod, count: o._count._all, amount: o._sum.amount ?? 0 })),
    monthly: [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)),
    topOffers: [...byOffer.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
  }
}

// -----------------------------------------------------------------------------
// Vue d'ensemble LMS
// -----------------------------------------------------------------------------

/** Indicateurs globaux du LMS (LMS-21) : actifs, inscriptions, abandons, complétion, réussite, temps, assiduité, certificats. */
export async function lmsOverview(principal: Principal) {
  assertCan(principal, 'reports.read')
  const last30 = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const [byStatus, agg, active30, attempts, passed, certificates, attendance, requests, surveys] = await Promise.all([
    prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enrollment.aggregate({ _avg: { progressPercent: true, score: true, timeSpentSeconds: true }, _count: { _all: true } }),
    prisma.enrollment.count({ where: { lastActivityAt: { gte: last30 } } }),
    prisma.attempt.count({ where: { status: 'GRADED', quiz: { isSurvey: false } } }),
    prisma.attempt.count({ where: { status: 'GRADED', passed: true, quiz: { isSurvey: false } } }),
    prisma.certificate.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.attendance.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.trainingRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.attempt.count({ where: { status: { in: ['SUBMITTED', 'GRADED'] }, quiz: { isSurvey: true } } }),
  ])
  const count = (status: string) => byStatus.find((s) => s.status === status)?._count._all ?? 0
  const attendanceTotal = attendance.reduce((s, a) => s + a._count._all, 0)
  const attended = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').reduce((s, a) => s + a._count._all, 0)
  return {
    enrollments: { total: agg._count._all, active: count('ACTIVE'), completed: count('COMPLETED'), pending: count('PENDING'), dropped: count('CANCELLED') + count('EXPIRED') + count('SUSPENDED') },
    activeLearners30Days: active30,
    completionRate: percent(count('COMPLETED'), agg._count._all),
    averageProgress: Math.round(agg._avg.progressPercent ?? 0),
    averageScore: agg._avg.score === null ? null : Math.round(agg._avg.score),
    averageTimeSeconds: Math.round(agg._avg.timeSpentSeconds ?? 0),
    assessments: { graded: attempts, passRate: percent(passed, attempts) },
    attendanceRate: attendanceTotal ? percent(attended, attendanceTotal) : null,
    certificates: Object.fromEntries(certificates.map((c) => [c.status, c._count._all])) as Partial<Record<string, number>>,
    requests: Object.fromEntries(requests.map((r) => [r.status, r._count._all])) as Partial<Record<string, number>>,
    satisfactionResponses: surveys,
  }
}

/** Export CSV des membres d'une cohorte (journalisé par l'appelant via audit 'export.generated'). */
export async function cohortCsv(cohortId: string, principal: Principal): Promise<string> {
  const report = await cohortReport(cohortId, principal)
  return toCsv(
    report.members.map((m) => ({
      nom: m.name,
      email: m.email,
      fonction: m.jobTitle ?? '',
      statut: m.status,
      progression: m.progressPercent,
      score: m.score ?? '',
      assiduite: m.attendanceRate ?? '',
      termine_le: m.completedAt ?? '',
      certificat: m.certificateNumber ?? '',
    })),
    { columns: ['nom', 'email', 'fonction', 'statut', 'progression', 'score', 'assiduite', 'termine_le', 'certificat'] },
  )
}
