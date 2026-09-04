import { orderStatuses, paginationQuerySchema, z } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { can, ForbiddenError, NotFoundError, paginationArgs, safeOrderBy, toPaginated, ValidationError, type Principal } from '@fetrag/domain'

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(orderStatuses).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
})
export type OrderListQuery = z.input<typeof orderListQuerySchema>

const orderSummarySelect = {
  id: true,
  reference: true,
  status: true,
  subtotalAmount: true,
  discountAmount: true,
  totalAmount: true,
  currency: true,
  paidAt: true,
  createdAt: true,
  user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } },
  organization: { select: { id: true, name: true } },
  lines: { select: { id: true, label: true, quantity: true, unitAmount: true, totalAmount: true, offer: { select: { id: true, kind: true } } } },
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1, select: { id: true, provider: true, providerRef: true, method: true, status: true, amount: true, confirmedAt: true } },
  receipt: { select: { id: true, number: true, pdfUrl: true, issuedAt: true } },
} satisfies Prisma.OrderSelect

const orderDetailInclude = {
  user: { select: { id: true, email: true, name: true, firstName: true, lastName: true, phone: true } },
  organization: { select: { id: true, name: true } },
  coupon: { select: { code: true, type: true, value: true } },
  sponsorship: { select: { label: true, percent: true } },
  lines: { include: { offer: { select: { id: true, kind: true, courseId: true, eventId: true, serviceId: true, resourceId: true } } } },
  payments: { orderBy: { createdAt: 'desc' as const }, include: { refunds: true } },
  receipt: true,
  history: { orderBy: { createdAt: 'asc' as const } },
  enrollments: { select: { id: true, courseId: true, status: true } },
  eventRegistrations: { select: { id: true, eventId: true, status: true } },
  serviceRequest: { select: { id: true, reference: true, status: true } },
} satisfies Prisma.OrderInclude

function parseQuery(query: OrderListQuery) {
  const parsed = orderListQuerySchema.safeParse(query)
  if (!parsed.success) throw new ValidationError('Filtres de commandes invalides', { issues: parsed.error.flatten().fieldErrors })
  return parsed.data
}

function buildWhere(q: z.output<typeof orderListQuerySchema>, base: Prisma.OrderWhereInput): Prisma.OrderWhereInput {
  return {
    ...base,
    ...(q.status ? { status: q.status } : {}),
    ...(q.from || q.to ? { createdAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } } : {}),
    ...(q.q
      ? { OR: [{ reference: { contains: q.q, mode: 'insensitive' } }, { user: { email: { contains: q.q, mode: 'insensitive' } } }, { lines: { some: { label: { contains: q.q, mode: 'insensitive' } } } }] }
      : {}),
  }
}

async function list(where: Prisma.OrderWhereInput, q: z.output<typeof orderListQuerySchema>) {
  const orderBy = safeOrderBy(q.sort, q.order, ['createdAt', 'totalAmount', 'status', 'reference'] as const, 'createdAt')
  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy, ...paginationArgs(q), select: orderSummarySelect }),
    prisma.order.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Commandes du principal (espace personnel). */
export async function listForUser(principal: Principal, query: OrderListQuery = {}) {
  const q = parseQuery(query)
  return list(buildWhere(q, { userId: principal.id }), q)
}

/** Détail d'une commande : propriétaire ou permission `finance.read`. */
export async function get(principal: Principal, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderDetailInclude })
  if (!order) throw new NotFoundError('Commande', orderId)
  if (order.userId !== principal.id && !can(principal, 'finance.read', { organizationId: order.organizationId, ownerId: order.userId })) {
    throw new ForbiddenError('Accès refusé à cette commande')
  }
  return order
}

/** Toutes les commandes (permission `finance.read`), filtrables par statut, période, utilisateur, organisation, texte. */
export async function listAll(principal: Principal, query: OrderListQuery = {}) {
  if (!can(principal, 'finance.read')) throw new ForbiddenError('Permission insuffisante', { action: 'finance.read' })
  const q = parseQuery(query)
  return list(buildWhere(q, { ...(q.userId ? { userId: q.userId } : {}), ...(q.organizationId ? { organizationId: q.organizationId } : {}) }), q)
}

export const orders = { listForUser, get, listAll }
