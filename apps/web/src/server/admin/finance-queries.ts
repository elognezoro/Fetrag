import 'server-only'
import { financeStats, type FinanceStats } from '@fetrag/analytics'
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, type Principal } from '@fetrag/domain'
import { toCsv, type CsvCell } from '@fetrag/jobs'
import { orders } from '@fetrag/payments'
import type { RequestContext } from '@fetrag/cms'
import type { ListParams } from './list-params'
import { loadOrganizationOptions, loadRecentWebhooks } from './queries'

async function safe<T>(label: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task()
  } catch (error) {
    console.error(`[admin/finance] ${label} indisponible`, error instanceof Error ? error.message : error)
    return null
  }
}

// -----------------------------------------------------------------------------
// Tableau de bord
// -----------------------------------------------------------------------------

export interface FinanceDashboardData {
  year: FinanceStats | null
  month: FinanceStats | null
  recentOrders: Awaited<ReturnType<typeof orders.listAll>>['items']
  webhooks: Awaited<ReturnType<typeof loadRecentWebhooks>>
  pendingPayments: number
  sponsorships: number
}

/** Indicateurs financiers (12 mois glissants et mois en cours), dernières commandes, webhooks et paiements en attente. */
export async function loadFinanceDashboard(principal: Principal): Promise<FinanceDashboardData> {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const [year, month, recent, webhooks, pendingPayments, sponsorships] = await Promise.all([
    safe('financeStats', () => financeStats()),
    safe('financeStats(mois)', () => financeStats({ from: monthStart, to: now })),
    safe('orders', () => orders.listAll(principal, { page: 1, pageSize: 6 })),
    loadRecentWebhooks(8).catch(() => []),
    prisma.payment.count({ where: { status: { in: ['PENDING', 'INITIATED'] } } }).catch(() => 0),
    prisma.sponsorship.count({ where: { OR: [{ validUntil: null }, { validUntil: { gte: now } }] } }).catch(() => 0),
  ])
  return { year, month, recentOrders: recent?.items ?? [], webhooks, pendingPayments, sponsorships }
}

// -----------------------------------------------------------------------------
// Prises en charge (Sponsorship)
// -----------------------------------------------------------------------------

const sponsorshipSelect = {
  id: true,
  label: true,
  percent: true,
  validUntil: true,
  createdAt: true,
  courseId: true,
  eventId: true,
  beneficiary: { select: { id: true, email: true, name: true, firstName: true, lastName: true } },
  organization: { select: { id: true, name: true, acronym: true } },
  grantedBy: { select: { id: true, name: true, email: true } },
  _count: { select: { orders: true } },
} satisfies Prisma.SponsorshipSelect

export type AdminSponsorshipRow = Prisma.SponsorshipGetPayload<{ select: typeof sponsorshipSelect }> & { target: string | null }

/** Prises en charge (totales ou partielles) accordées aux bénéficiaires, avec la cible (cours ou événement) résolue. */
export async function loadSponsorships(params: ListParams) {
  const now = new Date()
  const where: Prisma.SponsorshipWhereInput = {
    ...(params.status === 'valide' ? { OR: [{ validUntil: null }, { validUntil: { gte: now } }] } : params.status === 'expire' ? { validUntil: { lt: now } } : {}),
    ...(params.filters.organisation ? { organizationId: params.filters.organisation } : {}),
    ...(params.q
      ? {
          OR: [
            { label: { contains: params.q, mode: 'insensitive' } },
            { beneficiary: { email: { contains: params.q, mode: 'insensitive' } } },
            { beneficiary: { name: { contains: params.q, mode: 'insensitive' } } },
            { organization: { name: { contains: params.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }
  const [rows, total, active] = await Promise.all([
    prisma.sponsorship.findMany({ where, orderBy: { createdAt: params.order }, skip: (params.page - 1) * params.pageSize, take: params.pageSize, select: sponsorshipSelect }),
    prisma.sponsorship.count({ where }),
    prisma.sponsorship.count({ where: { OR: [{ validUntil: null }, { validUntil: { gte: now } }] } }),
  ])
  const courseIds = rows.map((r) => r.courseId).filter((id): id is string => Boolean(id))
  const eventIds = rows.map((r) => r.eventId).filter((id): id is string => Boolean(id))
  const [courses, events] = await Promise.all([
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true } }) : [],
    eventIds.length ? prisma.event.findMany({ where: { id: { in: eventIds } }, select: { id: true, title: true } }) : [],
  ])
  const labels = new Map<string, string>([...courses.map((c) => [c.id, `Formation · ${c.title}`] as const), ...events.map((e) => [e.id, `Événement · ${e.title}`] as const)])
  const items: AdminSponsorshipRow[] = rows.map((row) => ({ ...row, target: row.courseId ? (labels.get(row.courseId) ?? 'Formation') : row.eventId ? (labels.get(row.eventId) ?? 'Événement') : null }))
  return { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.max(1, Math.ceil(total / params.pageSize)), active }
}

/** Options du formulaire de prise en charge : organisations, formations publiées, événements à venir. */
export async function loadSponsorshipOptions() {
  const [organizations, courses, events] = await Promise.all([
    loadOrganizationOptions(),
    prisma.course.findMany({ where: { status: 'PUBLISHED' }, orderBy: { position: 'asc' }, select: { id: true, code: true, title: true } }),
    prisma.event.findMany({ where: { status: 'PUBLISHED', startsAt: { gte: new Date(Date.now() - 7 * 86_400_000) } }, orderBy: { startsAt: 'asc' }, select: { id: true, title: true } }),
  ])
  return {
    organizations,
    courses: courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })),
    events: events.map((e) => ({ value: e.id, label: e.title })),
  }
}

// -----------------------------------------------------------------------------
// Exports CSV (commandes, paiements)
// -----------------------------------------------------------------------------

export interface ExportRange {
  from?: Date
  to?: Date
}

const EXPORT_LIMIT = 5000

function rangeFilter(range: ExportRange): Prisma.DateTimeFilter | undefined {
  if (!range.from && !range.to) return undefined
  return { ...(range.from ? { gte: range.from } : {}), ...(range.to ? { lte: range.to } : {}) }
}

function iso(date: Date | null | undefined): string {
  return date ? date.toISOString() : ''
}

/** CSV des commandes sur une période (finance.export ; journalisé `export.generated`). */
export async function exportOrdersCsv(principal: Principal, range: ExportRange, ctx: RequestContext): Promise<string> {
  const createdAt = rangeFilter(range)
  const rows = await prisma.order.findMany({
    where: createdAt ? { createdAt } : {},
    orderBy: { createdAt: 'desc' },
    take: EXPORT_LIMIT,
    select: {
      reference: true,
      status: true,
      subtotalAmount: true,
      discountAmount: true,
      totalAmount: true,
      currency: true,
      paidAt: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
      organization: { select: { name: true } },
      lines: { select: { label: true, quantity: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1, select: { method: true, provider: true, providerRef: true } },
      receipt: { select: { number: true } },
    },
  })
  const headers = ['Référence', 'Statut', 'Client', 'Email', 'Organisation', 'Lignes', 'Sous-total', 'Remise', 'Total', 'Devise', 'Moyen de paiement', 'Fournisseur', 'Référence fournisseur', 'Reçu', 'Créée le', 'Payée le']
  const data: CsvCell[][] = rows.map((o) => [
    o.reference,
    orderStatusLabels[o.status] ?? o.status,
    o.user.name ?? '',
    o.user.email,
    o.organization?.name ?? '',
    o.lines.map((l) => `${l.quantity} × ${l.label}`).join(' | '),
    o.subtotalAmount,
    o.discountAmount,
    o.totalAmount,
    o.currency,
    o.payments[0] ? (paymentMethodLabels[o.payments[0].method] ?? o.payments[0].method) : '',
    o.payments[0]?.provider ?? '',
    o.payments[0]?.providerRef ?? '',
    o.receipt?.number ?? '',
    iso(o.createdAt),
    iso(o.paidAt),
  ])
  await audit('export.generated', { type: 'Order' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent, correlationId: ctx.correlationId }, {
    after: { kind: 'orders', rows: rows.length, from: iso(range.from), to: iso(range.to), truncated: rows.length >= EXPORT_LIMIT },
  })
  return toCsv(headers, data)
}

/** CSV des paiements sur une période (finance.export ; journalisé `export.generated`). */
export async function exportPaymentsCsv(principal: Principal, range: ExportRange, ctx: RequestContext): Promise<string> {
  const createdAt = rangeFilter(range)
  const rows = await prisma.payment.findMany({
    where: createdAt ? { createdAt } : {},
    orderBy: { createdAt: 'desc' },
    take: EXPORT_LIMIT,
    select: {
      id: true,
      provider: true,
      providerRef: true,
      method: true,
      status: true,
      amount: true,
      currency: true,
      failureReason: true,
      confirmedAt: true,
      createdAt: true,
      order: { select: { reference: true, user: { select: { email: true } } } },
      refunds: { select: { amount: true, status: true } },
    },
  })
  const headers = ['Identifiant', 'Commande', 'Client', 'Fournisseur', 'Référence fournisseur', 'Moyen', 'Statut', 'Montant', 'Devise', 'Remboursé', 'Motif d’échec', 'Créé le', 'Confirmé le']
  const data: CsvCell[][] = rows.map((p) => [
    p.id,
    p.order.reference,
    p.order.user.email,
    p.provider,
    p.providerRef ?? '',
    paymentMethodLabels[p.method] ?? p.method,
    paymentStatusLabels[p.status] ?? p.status,
    p.amount,
    p.currency,
    p.refunds.filter((r) => r.status === 'PROCESSED').reduce((sum, r) => sum + r.amount, 0),
    p.failureReason ?? '',
    iso(p.createdAt),
    iso(p.confirmedAt),
  ])
  await audit('export.generated', { type: 'Payment' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent, correlationId: ctx.correlationId }, {
    after: { kind: 'payments', rows: rows.length, from: iso(range.from), to: iso(range.to), truncated: rows.length >= EXPORT_LIMIT },
  })
  return toCsv(headers, data)
}
