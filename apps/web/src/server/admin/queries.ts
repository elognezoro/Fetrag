import 'server-only'
import { financeStats, lmsStats, topContent, webStats, type FinanceStats, type LmsStats, type TopContent, type WebStats } from '@fetrag/analytics'
import { forms, newsletter, publishing, serviceRequests } from '@fetrag/cms'
import { prisma, type Prisma, type Role, type ScopeType } from '@fetrag/db'
import { can, isSuperAdmin, type Principal } from '@fetrag/domain'
import { getJobStats } from '@fetrag/jobs'
import { orderListQuerySchema, orders } from '@fetrag/payments'
import { roles, type RoleName } from '@fetrag/contracts'
import type { ListParams } from './list-params'

// -----------------------------------------------------------------------------
// Tableau de bord
// -----------------------------------------------------------------------------

export interface AdminDashboardData {
  web: WebStats | null
  finance: FinanceStats | null
  lms: LmsStats | null
  top: TopContent | null
  reviewContents: Array<{ entityType: 'page' | 'article' | 'resource' | 'event' | 'service'; id: string; title: string; updatedAt: Date; href: string }>
  scheduled: Array<{ entityType: 'page' | 'article'; id: string; title: string; scheduledAt: Date | null }>
  latestRequests: Awaited<ReturnType<typeof serviceRequests.list>>['items']
  requestCounts: Record<string, number> | null
  latestMessages: Awaited<ReturnType<typeof forms.list>>['items']
  messageCounts: Record<string, number> | null
  jobs: Awaited<ReturnType<typeof getJobStats>> | null
  failedEmails24h: number
}

async function safe<T>(label: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task()
  } catch (error) {
    console.error(`[admin] ${label} indisponible`, error instanceof Error ? error.message : error)
    return null
  }
}

/** Charge les blocs du tableau de bord selon les permissions du principal. */
export async function loadAdminDashboard(principal: Principal): Promise<AdminDashboardData> {
  const admin = isSuperAdmin(principal)
  const readDrafts = admin || can(principal, 'cms.read_drafts')
  const readReports = admin || can(principal, 'reports.read')
  const readFinance = admin || can(principal, 'finance.read')
  const handleRequests = admin || can(principal, 'services.handle_requests')
  const readForms = admin || can(principal, 'forms.read')
  const last24h = new Date(Date.now() - 24 * 3600_000)

  const [web, finance, lms, top, review, scheduled, requests, requestCounts, messages, messageCounts, jobs, failedEmails] = await Promise.all([
    readDrafts || readReports ? safe('webStats', () => webStats()) : null,
    readFinance ? safe('financeStats', () => financeStats()) : null,
    readReports ? safe('lmsStats', () => lmsStats()) : null,
    readDrafts || readReports ? safe('topContent', () => topContent(5)) : null,
    readDrafts ? safe('review', () => loadReviewContents()) : [],
    readDrafts ? safe('scheduled', () => publishing.listScheduled(principal)) : [],
    handleRequests ? safe('requests', () => serviceRequests.list({ page: 1, pageSize: 6, sort: 'createdAt', order: 'desc' }, principal)) : null,
    handleRequests ? safe('requestCounts', () => serviceRequests.countByStatus(principal)) : null,
    readForms ? safe('messages', () => forms.list({ page: 1, pageSize: 6 }, principal)) : null,
    readForms ? safe('messageCounts', () => forms.countByStatus(principal)) : null,
    admin ? safe('jobs', () => getJobStats()) : null,
    admin ? prisma.emailDelivery.count({ where: { status: { in: ['FAILED', 'BOUNCED'] }, createdAt: { gte: last24h } } }).catch(() => 0) : 0,
  ])

  return {
    web,
    finance,
    lms,
    top,
    reviewContents: review ?? [],
    scheduled: scheduled ?? [],
    latestRequests: requests?.items ?? [],
    requestCounts,
    latestMessages: messages?.items ?? [],
    messageCounts,
    jobs,
    failedEmails24h: failedEmails,
  }
}

/** Contenus en relecture (REVIEW), tous types confondus, les plus récents d'abord. */
export async function loadReviewContents(limit = 8): Promise<AdminDashboardData['reviewContents']> {
  const take = limit
  const [pages, articles, resources, events, services] = await Promise.all([
    prisma.page.findMany({ where: { status: 'REVIEW' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take }),
    prisma.article.findMany({ where: { status: 'REVIEW' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take }),
    prisma.resource.findMany({ where: { status: 'REVIEW' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take }),
    prisma.event.findMany({ where: { status: 'REVIEW' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take }),
    prisma.service.findMany({ where: { status: 'REVIEW' }, select: { id: true, name: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take }),
  ])
  return [
    ...pages.map((p) => ({ entityType: 'page' as const, id: p.id, title: p.title, updatedAt: p.updatedAt, href: `/admin/pages/${p.id}` })),
    ...articles.map((a) => ({ entityType: 'article' as const, id: a.id, title: a.title, updatedAt: a.updatedAt, href: `/admin/actualites/${a.id}` })),
    ...resources.map((r) => ({ entityType: 'resource' as const, id: r.id, title: r.title, updatedAt: r.updatedAt, href: `/admin/ressources/${r.id}` })),
    ...events.map((e) => ({ entityType: 'event' as const, id: e.id, title: e.title, updatedAt: e.updatedAt, href: `/admin/evenements/${e.id}` })),
    ...services.map((s) => ({ entityType: 'service' as const, id: s.id, title: s.name, updatedAt: s.updatedAt, href: `/admin/services/${s.id}` })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit)
}

// -----------------------------------------------------------------------------
// Référentiels (listes déroulantes des éditeurs)
// -----------------------------------------------------------------------------

export async function loadCategoryOptions(kind: string): Promise<Array<{ value: string; label: string }>> {
  const rows = await prisma.category.findMany({ where: { kind }, orderBy: [{ position: 'asc' }, { name: 'asc' }], select: { id: true, name: true } })
  return rows.map((c) => ({ value: c.id, label: c.name }))
}

export async function loadOrganizationOptions(): Promise<Array<{ value: string; label: string }>> {
  const rows = await prisma.organization.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, acronym: true } })
  return rows.map((o) => ({ value: o.id, label: o.acronym ? `${o.name} (${o.acronym})` : o.name }))
}

/** Membres de l'équipe pouvant recevoir une demande ou un message (rôles globaux services / support / admin). */
export async function loadHandlerOptions(): Promise<Array<{ value: string; label: string }>> {
  const rows = await prisma.user.findMany({
    where: {
      isActive: true,
      roleAssignments: { some: { scopeType: 'GLOBAL', role: { in: ['SERVICES_MANAGER', 'SUPPORT', 'SUPER_ADMIN', 'EDITOR'] }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  })
  return rows.map((u) => ({ value: u.id, label: u.name ? `${u.name} (${u.email})` : u.email }))
}

export async function loadServiceOptions(): Promise<Array<{ value: string; label: string }>> {
  const rows = await prisma.service.findMany({ orderBy: [{ position: 'asc' }, { name: 'asc' }], select: { id: true, name: true } })
  return rows.map((s) => ({ value: s.id, label: s.name }))
}

// -----------------------------------------------------------------------------
// Newsletter
// -----------------------------------------------------------------------------

export async function loadNewsletter(principal: Principal, params: ListParams) {
  const state = params.status === 'pending' || params.status === 'confirmed' || params.status === 'unsubscribed' ? params.status : undefined
  const [list, stats] = await Promise.all([
    newsletter.list({ page: params.page, pageSize: params.pageSize, q: params.q, sort: params.sort, order: params.order, state }, principal),
    newsletter.stats(principal),
  ])
  return { list, stats }
}

// -----------------------------------------------------------------------------
// Utilisateurs et rôles
// -----------------------------------------------------------------------------

const userListSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  phone: true,
  employer: true,
  isActive: true,
  totpEnabled: true,
  lastLoginAt: true,
  createdAt: true,
  roleAssignments: { select: { id: true, role: true, scopeType: true, scopeId: true, expiresAt: true } },
  memberships: { select: { organizationId: true, isManager: true, organization: { select: { name: true, acronym: true } } } },
} satisfies Prisma.UserSelect

export type AdminUserRow = Prisma.UserGetPayload<{ select: typeof userListSelect }>

export async function loadUsers(params: ListParams) {
  const role = roles.find((r) => r === params.filters.role) as Role | undefined
  const active = params.status === 'actif' ? true : params.status === 'inactif' ? false : undefined
  const where: Prisma.UserWhereInput = {
    ...(active !== undefined ? { isActive: active } : {}),
    ...(role ? { roleAssignments: { some: { role } } } : {}),
    ...(params.filters.organisation ? { memberships: { some: { organizationId: params.filters.organisation } } } : {}),
    ...(params.q
      ? {
          OR: [
            { email: { contains: params.q, mode: 'insensitive' } },
            { name: { contains: params.q, mode: 'insensitive' } },
            { firstName: { contains: params.q, mode: 'insensitive' } },
            { lastName: { contains: params.q, mode: 'insensitive' } },
            { employer: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const orderBy: Prisma.UserOrderByWithRelationInput =
    params.sort === 'email' ? { email: params.order } : params.sort === 'lastLoginAt' ? { lastLoginAt: params.order } : params.sort === 'name' ? { lastName: params.order } : { createdAt: params.order }
  const [items, total, roleCounts] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip: (params.page - 1) * params.pageSize, take: params.pageSize, select: userListSelect }),
    prisma.user.count({ where }),
    prisma.roleAssignment.groupBy({ by: ['role'], _count: { _all: true } }),
  ])
  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    roleCounts: Object.fromEntries(roleCounts.map((r) => [r.role, r._count._all])) as Partial<Record<RoleName, number>>,
  }
}

export async function loadUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userListSelect,
      jobTitle: true,
      locale: true,
      emailVerified: true,
      updatedAt: true,
      passwordHash: true,
      roleAssignments: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, role: true, scopeType: true, scopeId: true, expiresAt: true, createdAt: true, grantedBy: { select: { name: true, email: true } } },
      },
      _count: { select: { enrollments: true, orders: true, serviceRequests: true, certificates: true, sessions: true } },
    },
  })
  if (!user) return null
  const scopeIds = user.roleAssignments.map((r) => r.scopeId).filter((id): id is string => Boolean(id))
  const [organizations, courses, cohorts, audit] = await Promise.all([
    scopeIds.length ? prisma.organization.findMany({ where: { id: { in: scopeIds } }, select: { id: true, name: true } }) : [],
    scopeIds.length ? prisma.course.findMany({ where: { id: { in: scopeIds } }, select: { id: true, title: true, code: true } }) : [],
    scopeIds.length ? prisma.cohort.findMany({ where: { id: { in: scopeIds } }, select: { id: true, name: true, code: true } }) : [],
    prisma.auditLog.findMany({
      where: { OR: [{ actorId: userId }, { entityType: 'User', entityId: userId }, { entityType: 'RoleAssignment', entityId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, action: true, entityType: true, entityId: true, actorEmail: true, createdAt: true, after: true },
    }),
  ])
  const scopeLabels = new Map<string, string>()
  for (const o of organizations) scopeLabels.set(o.id, o.name)
  for (const c of courses) scopeLabels.set(c.id, `${c.code} · ${c.title}`)
  for (const c of cohorts) scopeLabels.set(c.id, `${c.code} · ${c.name}`)
  const { passwordHash, ...rest } = user
  return { ...rest, hasPassword: Boolean(passwordHash), scopeLabels: Object.fromEntries(scopeLabels), audit }
}

export type AdminUserDetail = NonNullable<Awaited<ReturnType<typeof loadUserDetail>>>

/** Options de portée pour l'attribution d'un rôle (organisations, cours, cohortes). */
export async function loadScopeOptions(): Promise<Record<Exclude<ScopeType, 'GLOBAL'>, Array<{ value: string; label: string }>>> {
  const [organizations, courses, cohorts] = await Promise.all([
    prisma.organization.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.course.findMany({ orderBy: { position: 'asc' }, select: { id: true, code: true, title: true } }),
    prisma.cohort.findMany({ where: { status: { in: ['PLANNED', 'OPEN', 'RUNNING'] } }, orderBy: { startsAt: 'desc' }, select: { id: true, code: true, name: true } }),
  ])
  return {
    ORGANIZATION: organizations.map((o) => ({ value: o.id, label: o.name })),
    COURSE: courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })),
    COHORT: cohorts.map((c) => ({ value: c.id, label: `${c.code} · ${c.name}` })),
  }
}

// -----------------------------------------------------------------------------
// Finance
// -----------------------------------------------------------------------------

export async function loadOrders(principal: Principal, params: ListParams) {
  const parsed = orderListQuerySchema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    sort: params.sort,
    order: params.order,
    status: params.status,
    from: params.filters.du,
    to: params.filters.au,
    userId: params.filters.utilisateur,
    organizationId: params.filters.organisation,
  })
  const query = parsed.success ? parsed.data : { page: params.page, pageSize: params.pageSize }
  return orders.listAll(principal, query)
}

export type AdminOrderRow = Awaited<ReturnType<typeof loadOrders>>['items'][number]

const paymentSelect = {
  id: true,
  provider: true,
  providerRef: true,
  method: true,
  status: true,
  amount: true,
  currency: true,
  phoneNumber: true,
  failureReason: true,
  confirmedAt: true,
  createdAt: true,
  order: { select: { id: true, reference: true, status: true, user: { select: { id: true, email: true, name: true } } } },
  refunds: { select: { id: true, amount: true, status: true } },
} satisfies Prisma.PaymentSelect

export type AdminPaymentRow = Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>

export async function loadPayments(params: ListParams) {
  const statuses = ['INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED'] as const
  const methods = ['MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'CASH', 'SPONSORSHIP', 'FREE'] as const
  const status = statuses.find((s) => s === params.status)
  const method = methods.find((m) => m === params.filters.methode)
  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status } : {}),
    ...(method ? { method } : {}),
    ...(params.filters.fournisseur ? { provider: params.filters.fournisseur } : {}),
    ...(params.q
      ? { OR: [{ providerRef: { contains: params.q, mode: 'insensitive' } }, { order: { reference: { contains: params.q, mode: 'insensitive' } } }, { order: { user: { email: { contains: params.q, mode: 'insensitive' } } } }] }
      : {}),
  }
  const [items, total, providers] = await Promise.all([
    prisma.payment.findMany({ where, orderBy: { createdAt: params.order }, skip: (params.page - 1) * params.pageSize, take: params.pageSize, select: paymentSelect }),
    prisma.payment.count({ where }),
    prisma.payment.findMany({ distinct: ['provider'], select: { provider: true } }),
  ])
  return { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.max(1, Math.ceil(total / params.pageSize)), providers: providers.map((p) => p.provider) }
}

const refundSelect = {
  id: true,
  amount: true,
  reason: true,
  status: true,
  providerRef: true,
  processedAt: true,
  createdAt: true,
  payment: { select: { id: true, currency: true, method: true, provider: true, order: { select: { id: true, reference: true, user: { select: { email: true, name: true } } } } } },
} satisfies Prisma.RefundSelect

export type AdminRefundRow = Prisma.RefundGetPayload<{ select: typeof refundSelect }>

export async function loadRefunds(params: ListParams) {
  const statuses = ['REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED'] as const
  const status = statuses.find((s) => s === params.status)
  const where: Prisma.RefundWhereInput = {
    ...(status ? { status } : {}),
    ...(params.q ? { OR: [{ providerRef: { contains: params.q, mode: 'insensitive' } }, { payment: { order: { reference: { contains: params.q, mode: 'insensitive' } } } }] } : {}),
  }
  const [items, total, totals] = await Promise.all([
    prisma.refund.findMany({ where, orderBy: { createdAt: params.order }, skip: (params.page - 1) * params.pageSize, take: params.pageSize, select: refundSelect }),
    prisma.refund.count({ where }),
    prisma.refund.aggregate({ where: { status: 'PROCESSED' }, _sum: { amount: true }, _count: { _all: true } }),
  ])
  return { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.max(1, Math.ceil(total / params.pageSize)), processed: { count: totals._count._all, amount: totals._sum.amount ?? 0 } }
}

export async function loadOrderDetail(principal: Principal, orderId: string) {
  const order = await orders.get(principal, orderId)
  return order
}

/** Webhooks récents (rapprochement et diagnostic). */
export async function loadRecentWebhooks(limit = 10) {
  return prisma.webhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, provider: true, eventType: true, externalId: true, verified: true, processedAt: true, error: true, createdAt: true },
  })
}

// -----------------------------------------------------------------------------
// Journal d'audit
// -----------------------------------------------------------------------------

export async function loadAuditLog(params: ListParams) {
  const from = params.filters.du ? new Date(params.filters.du) : undefined
  const to = params.filters.au ? new Date(`${params.filters.au}T23:59:59.999Z`) : undefined
  const where: Prisma.AuditLogWhereInput = {
    ...(params.filters.action ? { action: { startsWith: params.filters.action } } : {}),
    ...(params.filters.entite ? { entityType: params.filters.entite } : {}),
    ...(params.filters.acteur ? { actorEmail: { contains: params.filters.acteur, mode: 'insensitive' } } : {}),
    ...(from && !Number.isNaN(from.getTime()) ? { createdAt: { gte: from } } : {}),
    ...(to && !Number.isNaN(to.getTime()) ? { createdAt: { ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}), lte: to } } : {}),
    ...(params.q ? { OR: [{ entityId: { contains: params.q } }, { actorEmail: { contains: params.q, mode: 'insensitive' } }, { correlationId: { contains: params.q } }] } : {}),
  }
  const [items, total, actions, entities] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (params.page - 1) * params.pageSize, take: params.pageSize }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } }),
    prisma.auditLog.findMany({ distinct: ['entityType'], select: { entityType: true }, orderBy: { entityType: 'asc' } }),
  ])
  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    actions: actions.map((a) => a.action),
    entities: entities.map((e) => e.entityType),
  }
}

// -----------------------------------------------------------------------------
// Paramètres système
// -----------------------------------------------------------------------------

export interface ApiKeyRecord {
  id: string
  label: string
  prefix: string
  hash: string
  scope: 'read' | 'write'
  createdAt: string
  createdBy?: string | null
  revokedAt?: string | null
}

export interface SiteContactSetting {
  address: string
  email: string
  phones: string[]
  supportEmail?: string | null
}

export async function loadSettings() {
  const rows = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } })
  const byKey = new Map(rows.map((r) => [r.key, r]))
  const value = <T,>(key: string, fallback: T): T => {
    const row = byKey.get(key)
    return row ? (row.value as T) : fallback
  }
  const apiKeys = value<ApiKeyRecord[]>('api.keys', [])
  return {
    rows,
    motto: value<string[]>('site.motto', ['Travail', 'Efficacité', 'Solidarité']),
    currency: value<string>('site.currency', 'XAF'),
    participantLimit: value<number>('training.participantLimit', 10),
    certificateSequence: value<number>('certificates.sequence', 0),
    contact: value<SiteContactSetting>('site.contact', { address: 'BP 1234 Libreville, Gabon', email: 'jossngomafm@gmail.com', phones: ['066 23 00 33', '077 52 27 98'], supportEmail: null }),
    apiKeys: Array.isArray(apiKeys) ? apiKeys : [],
    maintenance: value<{ enabled: boolean; message: string }>('site.maintenance', { enabled: false, message: '' }),
  }
}

// -----------------------------------------------------------------------------
// Compteurs de la navigation (badges)
// -----------------------------------------------------------------------------

/** Compteurs affichés en badge dans la barre latérale (éléments à traiter), selon les permissions. */
export async function loadAdminBadges(principal: Principal): Promise<Record<string, number>> {
  const admin = isSuperAdmin(principal)
  const [requests, messages, review] = await Promise.all([
    admin || can(principal, 'services.handle_requests') ? prisma.serviceRequest.count({ where: { status: { in: ['NEW', 'IN_REVIEW'] } } }).catch(() => 0) : 0,
    admin || can(principal, 'forms.read') ? prisma.formSubmission.count({ where: { status: 'NEW' } }).catch(() => 0) : 0,
    admin || can(principal, 'cms.publish') ? loadReviewContents(50).then((items) => items.length).catch(() => 0) : 0,
  ])
  const badges: Record<string, number> = {}
  if (requests > 0) badges['/admin/demandes'] = requests
  if (messages > 0) badges['/admin/messages'] = messages
  if (review > 0) badges['/admin'] = review
  return badges
}
