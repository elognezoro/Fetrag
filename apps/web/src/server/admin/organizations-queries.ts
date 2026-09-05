import 'server-only'
import { prisma, type Prisma } from '@fetrag/db'
import type { ListParams } from './list-params'

const organizationListSelect = {
  id: true,
  slug: true,
  name: true,
  acronym: true,
  sector: true,
  city: true,
  country: true,
  isAffiliate: true,
  isActive: true,
  memberCount: true,
  createdAt: true,
  _count: { select: { memberships: true, trainingRequests: true, cohorts: true } },
} satisfies Prisma.OrganizationSelect

export type AdminOrganizationRow = Prisma.OrganizationGetPayload<{ select: typeof organizationListSelect }>

/** Liste paginée des organisations (affiliées et partenaires) avec filtres type, secteur, statut et recherche. */
export async function loadOrganizations(params: ListParams) {
  const type = params.filters.type === 'affiliee' ? true : params.filters.type === 'partenaire' ? false : undefined
  const active = params.status === 'actif' ? true : params.status === 'inactif' ? false : undefined
  const where: Prisma.OrganizationWhereInput = {
    ...(type !== undefined ? { isAffiliate: type } : {}),
    ...(active !== undefined ? { isActive: active } : {}),
    ...(params.filters.secteur ? { sector: { equals: params.filters.secteur, mode: 'insensitive' } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { acronym: { contains: params.q, mode: 'insensitive' } },
            { sector: { contains: params.q, mode: 'insensitive' } },
            { city: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const orderBy: Prisma.OrganizationOrderByWithRelationInput =
    params.sort === 'createdAt' ? { createdAt: params.order } : params.sort === 'membres' ? { memberships: { _count: params.order } } : { name: params.order === 'desc' ? 'desc' : 'asc' }
  const [items, total, affiliates, partners, inactive] = await Promise.all([
    prisma.organization.findMany({ where, orderBy, skip: (params.page - 1) * params.pageSize, take: params.pageSize, select: organizationListSelect }),
    prisma.organization.count({ where }),
    prisma.organization.count({ where: { isAffiliate: true, isActive: true } }),
    prisma.organization.count({ where: { isAffiliate: false, isActive: true } }),
    prisma.organization.count({ where: { isActive: false } }),
  ])
  return { items, total, page: params.page, pageSize: params.pageSize, totalPages: Math.max(1, Math.ceil(total / params.pageSize)), counts: { affiliates, partners, inactive } }
}

/** Secteurs distincts (liste déroulante des filtres). */
export async function loadSectorOptions(): Promise<Array<{ value: string; label: string }>> {
  const rows = await prisma.organization.findMany({ where: { sector: { not: null } }, distinct: ['sector'], select: { sector: true }, orderBy: { sector: 'asc' } })
  return rows.flatMap((r) => (r.sector ? [{ value: r.sector, label: r.sector }] : []))
}

/** Fiche d'une organisation : identité, membres, contacts, demandes de formation, cohortes et compteurs. */
export async function loadOrganizationDetail(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        orderBy: [{ isManager: 'desc' }, { joinedAt: 'asc' }],
        select: { id: true, title: true, isManager: true, joinedAt: true, user: { select: { id: true, email: true, name: true, firstName: true, lastName: true, jobTitle: true, isActive: true, lastLoginAt: true } } },
      },
      contacts: { orderBy: [{ isPrimary: 'desc' }, { fullName: 'asc' }], select: { id: true, fullName: true, role: true, email: true, phone: true, isPrimary: true, userId: true } },
      trainingRequests: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, reference: true, status: true, contactName: true, preferredStart: true, submittedAt: true, createdAt: true, _count: { select: { participants: true, modules: true } } },
      },
      cohorts: {
        orderBy: { startsAt: 'desc' },
        take: 6,
        select: { id: true, code: true, name: true, status: true, startsAt: true, endsAt: true, course: { select: { id: true, title: true } }, _count: { select: { members: true } } },
      },
      _count: { select: { memberships: true, trainingRequests: true, cohorts: true, enrollments: true, orders: true, sponsorships: true } },
    },
  })
  if (!organization) return null
  const [enrollmentStats, ordersAgg] = await Promise.all([
    prisma.enrollment.aggregate({ where: { organizationId }, _avg: { progressPercent: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { organizationId, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } }, _sum: { totalAmount: true }, _count: { _all: true } }),
  ])
  return {
    ...organization,
    stats: {
      averageProgress: Math.round(enrollmentStats._avg.progressPercent ?? 0),
      enrollments: enrollmentStats._count._all,
      paidOrders: ordersAgg._count._all,
      revenue: ordersAgg._sum.totalAmount ?? 0,
    },
  }
}

export type AdminOrganizationDetail = NonNullable<Awaited<ReturnType<typeof loadOrganizationDetail>>>
