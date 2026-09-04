import { Prisma, prisma } from '@fetrag/db'

const DAY_MS = 86_400_000

export interface DateRange {
  from?: Date
  to?: Date
}

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * DAY_MS)
}

function startOfMonthsAgo(months: number, now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, 1))
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function percent(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

function resolveRange(range: DateRange | undefined, defaultMonths: number): { from: Date; to: Date } {
  const to = range?.to ?? new Date()
  const from = range?.from ?? startOfMonthsAgo(defaultMonths - 1, to)
  return { from, to }
}

// -----------------------------------------------------------------------------
// Vitrine (WEB-15)
// -----------------------------------------------------------------------------

export interface WebStats {
  period: { from: Date; to: Date }
  visits: { totalViews: number; uniqueVisitors: number; byDay: Array<{ day: string; views: number; visitors: number }> }
  forms: { total: number; byKind: Array<{ kind: string; count: number }> }
  serviceRequests: { total: number; byStatus: Array<{ status: string; count: number }> }
  eventRegistrations: number
  orders: { total: number; paid: number; revenue: number; conversionRate: number }
  newsletter: { confirmed: number }
  topArticles: Array<{ id: string; slug: string; title: string; viewCount: number }>
  topResources: Array<{ id: string; slug: string; title: string; downloadCount: number }>
  topSearches: Array<{ query: string; count: number }>
}

/** Indicateurs de la vitrine sur les 30 derniers jours. */
export async function webStats(): Promise<WebStats> {
  const to = new Date()
  const from = daysAgo(30, to)

  const [byDayRows, uniqueRows, forms, formsByKind, srTotal, srByStatus, eventRegistrations, ordersTotal, ordersPaid, revenue, newsletter, topArticles, topResources, topSearches] =
    await Promise.all([
      prisma.$queryRaw<Array<{ day: Date; views: number; visitors: number }>>(Prisma.sql`
        SELECT date_trunc('day', "createdAt") AS day,
               COUNT(*)::int AS views,
               COUNT(DISTINCT COALESCE("sessionId", "userIdHash"))::int AS visitors
        FROM "AnalyticsEvent"
        WHERE "name" = 'page_view' AND "app" = 'web' AND "createdAt" >= ${from}
        GROUP BY 1 ORDER BY 1`),
      prisma.$queryRaw<Array<{ visitors: number }>>(Prisma.sql`
        SELECT COUNT(DISTINCT COALESCE("sessionId", "userIdHash"))::int AS visitors
        FROM "AnalyticsEvent"
        WHERE "name" = 'page_view' AND "app" = 'web' AND "createdAt" >= ${from}`),
      prisma.formSubmission.count({ where: { createdAt: { gte: from } } }),
      prisma.formSubmission.groupBy({ by: ['kind'], where: { createdAt: { gte: from } }, _count: { _all: true } }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: from } } }),
      prisma.serviceRequest.groupBy({ by: ['status'], where: { createdAt: { gte: from } }, _count: { _all: true } }),
      prisma.eventRegistration.count({ where: { createdAt: { gte: from }, status: { in: ['REGISTERED', 'ATTENDED'] } } }),
      prisma.order.count({ where: { createdAt: { gte: from } } }),
      prisma.order.count({ where: { createdAt: { gte: from }, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paidAt: { gte: from }, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } } }),
      prisma.newsletterSubscription.count({ where: { confirmedAt: { not: null }, unsubscribedAt: null } }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take: 5, select: { id: true, slug: true, title: true, viewCount: true } }),
      prisma.resource.findMany({ where: { status: 'PUBLISHED' }, orderBy: { downloadCount: 'desc' }, take: 5, select: { id: true, slug: true, title: true, downloadCount: true } }),
      prisma.$queryRaw<Array<{ query: string; count: number }>>(Prisma.sql`
        SELECT lower("properties"->>'q') AS query, COUNT(*)::int AS count
        FROM "AnalyticsEvent"
        WHERE "name" = 'search' AND "createdAt" >= ${from} AND ("properties"->>'q') IS NOT NULL AND length("properties"->>'q') > 1
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
    ])

  const byDayMap = new Map(byDayRows.map((r) => [isoDay(new Date(r.day)), { views: Number(r.views), visitors: Number(r.visitors) }]))
  const byDay: WebStats['visits']['byDay'] = []
  for (let i = 29; i >= 0; i--) {
    const day = isoDay(daysAgo(i, to))
    const found = byDayMap.get(day)
    byDay.push({ day, views: found?.views ?? 0, visitors: found?.visitors ?? 0 })
  }

  return {
    period: { from, to },
    visits: {
      totalViews: byDay.reduce((s, d) => s + d.views, 0),
      uniqueVisitors: Number(uniqueRows[0]?.visitors ?? 0),
      byDay,
    },
    forms: { total: forms, byKind: formsByKind.map((f) => ({ kind: f.kind, count: f._count._all })) },
    serviceRequests: { total: srTotal, byStatus: srByStatus.map((s) => ({ status: s.status, count: s._count._all })) },
    eventRegistrations,
    orders: { total: ordersTotal, paid: ordersPaid, revenue: revenue._sum.totalAmount ?? 0, conversionRate: percent(ordersPaid, ordersTotal) },
    newsletter: { confirmed: newsletter },
    topArticles,
    topResources,
    topSearches: topSearches.map((s) => ({ query: s.query, count: Number(s.count) })),
  }
}

// -----------------------------------------------------------------------------
// LMS (LMS-21)
// -----------------------------------------------------------------------------

export interface LmsStats {
  period: { from: Date; to: Date }
  activeLearners30d: number
  enrollments: { total: number; last30d: number; byStatus: Array<{ status: string; count: number }> }
  averageCompletion: number
  completionRate: number
  quizPassRate: number
  certificates: { total: number; last30d: number; revoked: number }
  cohorts: { running: number; open: number; planned: number }
  totalTimeHours: number
  topCourses: Array<{ id: string; slug: string; title: string; enrollments: number }>
}

/** Indicateurs pédagogiques globaux (apprenants actifs, inscriptions, complétion, réussite, certificats, cohortes, temps). */
export async function lmsStats(): Promise<LmsStats> {
  const to = new Date()
  const from = daysAgo(30, to)

  const [activeRows, total, last30d, byStatus, avg, attemptsGraded, attemptsPassed, certTotal, cert30d, certRevoked, cohortsByStatus, time, topCourseGroups] =
    await Promise.all([
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
        SELECT COUNT(DISTINCT "userId")::int AS count FROM "Enrollment" WHERE "lastActivityAt" >= ${from}`),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { createdAt: { gte: from } } }),
      prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.enrollment.aggregate({ _avg: { progressPercent: true }, where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
      prisma.attempt.count({ where: { status: 'GRADED', passed: { not: null } } }),
      prisma.attempt.count({ where: { status: 'GRADED', passed: true } }),
      prisma.certificate.count({ where: { status: 'ISSUED' } }),
      prisma.certificate.count({ where: { status: 'ISSUED', issuedAt: { gte: from } } }),
      prisma.certificate.count({ where: { status: 'REVOKED' } }),
      prisma.cohort.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.enrollment.aggregate({ _sum: { timeSpentSeconds: true } }),
      prisma.enrollment.groupBy({ by: ['courseId'], _count: { _all: true }, orderBy: { _count: { courseId: 'desc' } }, take: 5 }),
    ])

  const statusCount = (status: string) => byStatus.find((s) => s.status === status)?._count._all ?? 0
  const completed = statusCount('COMPLETED')
  const finished = completed + statusCount('ACTIVE') + statusCount('EXPIRED') + statusCount('SUSPENDED')
  const cohortCount = (status: string) => cohortsByStatus.find((c) => c.status === status)?._count._all ?? 0

  const courseIds = topCourseGroups.map((g) => g.courseId)
  const courses = courseIds.length
    ? await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, slug: true, title: true } })
    : []
  const topCourses = topCourseGroups.flatMap((g) => {
    const course = courses.find((c) => c.id === g.courseId)
    return course ? [{ ...course, enrollments: g._count._all }] : []
  })

  return {
    period: { from, to },
    activeLearners30d: Number(activeRows[0]?.count ?? 0),
    enrollments: { total, last30d, byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })) },
    averageCompletion: Math.round(avg._avg.progressPercent ?? 0),
    completionRate: percent(completed, finished),
    quizPassRate: percent(attemptsPassed, attemptsGraded),
    certificates: { total: certTotal, last30d: cert30d, revoked: certRevoked },
    cohorts: { running: cohortCount('RUNNING'), open: cohortCount('OPEN'), planned: cohortCount('PLANNED') },
    totalTimeHours: Math.round((time._sum.timeSpentSeconds ?? 0) / 3600),
    topCourses,
  }
}

// -----------------------------------------------------------------------------
// Finance (chapitre 19)
// -----------------------------------------------------------------------------

export interface FinanceStats {
  period: { from: Date; to: Date }
  currency: string
  revenue: number
  ordersPaid: number
  averageBasket: number
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>
  unpaid: { count: number; amount: number }
  failed: number
  refunds: { count: number; amount: number }
  byMethod: Array<{ method: string; count: number; amount: number }>
  byOfferKind: Array<{ kind: string; count: number; amount: number }>
}

/** Indicateurs financiers sur une période (12 derniers mois par défaut) : CA, impayés, remboursements, panier moyen, répartition. */
export async function financeStats(range?: DateRange): Promise<FinanceStats> {
  const { from, to } = resolveRange(range, 12)
  const paidWhere: Prisma.OrderWhereInput = { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] }, paidAt: { gte: from, lte: to } }

  const [revenueAgg, ordersPaid, byMonth, unpaid, failed, refunds, byMethod, byOfferKind, currencyRow] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: paidWhere }),
    prisma.order.count({ where: paidWhere }),
    prisma.$queryRaw<Array<{ month: string; revenue: number; orders: number }>>(Prisma.sql`
      SELECT to_char(date_trunc('month', "paidAt"), 'YYYY-MM') AS month,
             COALESCE(SUM("totalAmount"), 0)::float8 AS revenue,
             COUNT(*)::int AS orders
      FROM "Order"
      WHERE "status" IN ('PAID', 'PARTIALLY_REFUNDED') AND "paidAt" >= ${from} AND "paidAt" <= ${to}
      GROUP BY 1 ORDER BY 1`),
    prisma.order.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where: { status: 'PENDING', createdAt: { gte: from, lte: to } } }),
    prisma.order.count({ where: { status: 'FAILED', createdAt: { gte: from, lte: to } } }),
    prisma.refund.aggregate({ _sum: { amount: true }, _count: { _all: true }, where: { status: 'PROCESSED', processedAt: { gte: from, lte: to } } }),
    prisma.payment.groupBy({ by: ['method'], _sum: { amount: true }, _count: { _all: true }, where: { status: { in: ['SUCCEEDED', 'REFUNDED'] }, confirmedAt: { gte: from, lte: to } } }),
    prisma.$queryRaw<Array<{ kind: string; count: number; amount: number }>>(Prisma.sql`
      SELECT of."kind"::text AS kind, COUNT(DISTINCT o."id")::int AS count, COALESCE(SUM(l."totalAmount"), 0)::float8 AS amount
      FROM "OrderLine" l
      JOIN "Order" o ON o."id" = l."orderId"
      JOIN "Offer" of ON of."id" = l."offerId"
      WHERE o."status" IN ('PAID', 'PARTIALLY_REFUNDED') AND o."paidAt" >= ${from} AND o."paidAt" <= ${to}
      GROUP BY 1 ORDER BY 3 DESC`),
    prisma.order.findFirst({ where: paidWhere, select: { currency: true } }),
  ])

  // Série mensuelle complète (mois sans vente à zéro).
  const monthMap = new Map(byMonth.map((m) => [m.month, { revenue: Number(m.revenue), orders: Number(m.orders) }]))
  const revenueByMonth: FinanceStats['revenueByMonth'] = []
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
  while (cursor <= end && revenueByMonth.length < 60) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`
    const found = monthMap.get(key)
    revenueByMonth.push({ month: key, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0 })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  const revenue = revenueAgg._sum?.totalAmount ?? 0
  return {
    period: { from, to },
    currency: currencyRow?.currency ?? 'XAF',
    revenue,
    ordersPaid,
    averageBasket: ordersPaid > 0 ? Math.round(revenue / ordersPaid) : 0,
    revenueByMonth,
    unpaid: { count: unpaid._count._all, amount: unpaid._sum.totalAmount ?? 0 },
    failed,
    refunds: { count: refunds._count._all, amount: refunds._sum.amount ?? 0 },
    byMethod: byMethod.map((m) => ({ method: m.method, count: m._count._all, amount: m._sum.amount ?? 0 })),
    byOfferKind: byOfferKind.map((k) => ({ kind: k.kind, count: Number(k.count), amount: Number(k.amount) })),
  }
}

// -----------------------------------------------------------------------------
// Organisation (LMS-09) : uniquement les données de l'organisation demandée
// -----------------------------------------------------------------------------

export interface OrgStats {
  organization: { id: string; name: string; acronym: string | null }
  members: number
  trainingRequests: { total: number; byStatus: Array<{ status: string; count: number }> }
  enrollments: { total: number; active: number; completed: number; averageProgress: number; byStatus: Array<{ status: string; count: number }> }
  activeLearners30d: number
  certificates: number
  cohorts: { total: number; running: number; closed: number }
  orders: { count: number; revenue: number }
  attendanceRate: number
}

/** Indicateurs d'une organisation (l'appelant vérifie `organization.read` / `reports.org` sur `orgId`). */
export async function orgStats(orgId: string): Promise<OrgStats | null> {
  const organization = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true, acronym: true } })
  if (!organization) return null
  const from = daysAgo(30)

  const [members, requestsByStatus, enrollmentsByStatus, avg, activeLearners, certificates, cohortsByStatus, ordersAgg, attendanceRows] = await Promise.all([
    prisma.organizationMembership.count({ where: { organizationId: orgId } }),
    prisma.trainingRequest.groupBy({ by: ['status'], where: { organizationId: orgId }, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ['status'], where: { organizationId: orgId }, _count: { _all: true } }),
    prisma.enrollment.aggregate({ _avg: { progressPercent: true }, where: { organizationId: orgId, status: { in: ['ACTIVE', 'COMPLETED'] } } }),
    prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(DISTINCT "userId")::int AS count FROM "Enrollment" WHERE "organizationId" = ${orgId} AND "lastActivityAt" >= ${from}`),
    prisma.certificate.count({
      where: { status: 'ISSUED', OR: [{ cohort: { organizationId: orgId } }, { enrollment: { organizationId: orgId } }] },
    }),
    prisma.cohort.groupBy({ by: ['status'], where: { organizationId: orgId }, _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where: { organizationId: orgId, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } } }),
    prisma.$queryRaw<Array<{ present: number; total: number }>>(Prisma.sql`
      SELECT COUNT(*) FILTER (WHERE a."status" IN ('PRESENT', 'LATE'))::int AS present, COUNT(*)::int AS total
      FROM "Attendance" a
      JOIN "TrainingSession" s ON s."id" = a."sessionId"
      JOIN "Cohort" c ON c."id" = s."cohortId"
      WHERE c."organizationId" = ${orgId}`),
  ])

  const enrollmentCount = (status: string) => enrollmentsByStatus.find((e) => e.status === status)?._count._all ?? 0
  const cohortCount = (status: string) => cohortsByStatus.find((c) => c.status === status)?._count._all ?? 0
  const attendance = attendanceRows[0]

  return {
    organization,
    members,
    trainingRequests: {
      total: requestsByStatus.reduce((s, r) => s + r._count._all, 0),
      byStatus: requestsByStatus.map((r) => ({ status: r.status, count: r._count._all })),
    },
    enrollments: {
      total: enrollmentsByStatus.reduce((s, e) => s + e._count._all, 0),
      active: enrollmentCount('ACTIVE'),
      completed: enrollmentCount('COMPLETED'),
      averageProgress: Math.round(avg._avg.progressPercent ?? 0),
      byStatus: enrollmentsByStatus.map((e) => ({ status: e.status, count: e._count._all })),
    },
    activeLearners30d: Number(activeLearners[0]?.count ?? 0),
    certificates,
    cohorts: { total: cohortsByStatus.reduce((s, c) => s + c._count._all, 0), running: cohortCount('RUNNING'), closed: cohortCount('CLOSED') },
    orders: { count: ordersAgg._count._all, revenue: ordersAgg._sum.totalAmount ?? 0 },
    attendanceRate: percent(Number(attendance?.present ?? 0), Number(attendance?.total ?? 0)),
  }
}

// -----------------------------------------------------------------------------
// Contenus populaires
// -----------------------------------------------------------------------------

export interface TopContent {
  articles: Array<{ id: string; slug: string; title: string; viewCount: number }>
  resources: Array<{ id: string; slug: string; title: string; downloadCount: number }>
  courses: Array<{ id: string; slug: string; title: string; enrollments: number }>
  events: Array<{ id: string; slug: string; title: string; registrations: number; startsAt: Date }>
}

/** Contenus les plus consultés / suivis (publiés uniquement). */
export async function topContent(limit = 10): Promise<TopContent> {
  const take = Math.min(50, Math.max(1, Math.round(limit)))
  const [articles, resources, courses, events] = await Promise.all([
    prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take, select: { id: true, slug: true, title: true, viewCount: true } }),
    prisma.resource.findMany({ where: { status: 'PUBLISHED' }, orderBy: { downloadCount: 'desc' }, take, select: { id: true, slug: true, title: true, downloadCount: true } }),
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { enrollments: { _count: 'desc' } },
      take,
      select: { id: true, slug: true, title: true, _count: { select: { enrollments: true } } },
    }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { registrations: { _count: 'desc' } },
      take,
      select: { id: true, slug: true, title: true, startsAt: true, _count: { select: { registrations: true } } },
    }),
  ])
  return {
    articles,
    resources,
    courses: courses.map((c) => ({ id: c.id, slug: c.slug, title: c.title, enrollments: c._count.enrollments })),
    events: events.map((e) => ({ id: e.id, slug: e.slug, title: e.title, startsAt: e.startsAt, registrations: e._count.registrations })),
  }
}
