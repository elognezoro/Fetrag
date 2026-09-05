// Espace personnel : GET /me, GET /me/enrollments, GET /me/certificates, GET /me/orders.
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { idSchema, localeSchema, orderStatuses, paymentMethodSchema, paymentStatusSchema, roleSchema, scopeTypeSchema } from '@fetrag/contracts'
import { certification, enrollments } from '@fetrag/lms-core'
import { orders } from '@fetrag/payments'
import { NotFoundError } from '@fetrag/domain'
import type { ApiEnv } from '../env'
import { loadProfile } from '../lib/profile'
import { jsonContent, paginatedSchema, protectedErrors } from '../lib/responses'
import { authenticated, requirePrincipal } from '../middleware/auth'
import { protectedSecurity } from '../openapi'
import { certificateRefSchema, cohortRefSchema, courseRefSchema, enrollmentStatusSchema, isoDateSchema, nullableDateSchema } from '../schemas/common'
import { certificateSchema, toCertificateDto } from './certificates'

// -----------------------------------------------------------------------------
// Schémas
// -----------------------------------------------------------------------------

const principalSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable().optional(),
    roles: z.array(z.object({ role: roleSchema, scopeType: scopeTypeSchema, scopeId: z.string().nullable(), expiresAt: nullableDateSchema.optional() })),
    organizationIds: z.array(z.string()),
    managedOrganizationIds: z.array(z.string()),
    mfaVerified: z.boolean().optional(),
  })
  .openapi('Principal')

const profileSchema = z
  .object({
    id: idSchema,
    email: z.string(),
    name: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
    phone: z.string().nullable(),
    jobTitle: z.string().nullable(),
    employer: z.string().nullable(),
    locale: localeSchema,
    timezone: z.string(),
    totpEnabled: z.boolean(),
    emailVerified: nullableDateSchema,
    lastLoginAt: nullableDateSchema,
    createdAt: isoDateSchema,
  })
  .openapi('Profile')

const meSchema = z
  .object({
    principal: principalSchema,
    auth: z.object({ method: z.enum(['session', 'api-key', 'none']), apiKey: z.object({ id: z.string(), name: z.string(), scopes: z.array(z.string()) }).nullable() }),
    /** Null pour une clé API de service (non liée à un compte utilisateur). */
    profile: profileSchema.nullable(),
    organizations: z.array(
      z.object({
        id: idSchema,
        slug: z.string(),
        name: z.string(),
        acronym: z.string().nullable(),
        sector: z.string().nullable(),
        city: z.string().nullable(),
        isAffiliate: z.boolean(),
        isManager: z.boolean(),
        title: z.string().nullable(),
        joinedAt: isoDateSchema,
      }),
    ),
  })
  .openapi('Me')

export const enrollmentSummarySchema = z
  .object({
    id: idSchema,
    status: enrollmentStatusSchema,
    source: z.string(),
    progressPercent: z.number().int(),
    score: z.number().int().nullable(),
    timeSpentSeconds: z.number().int(),
    lastActivityAt: nullableDateSchema,
    startedAt: nullableDateSchema,
    completedAt: nullableDateSchema,
    expiresAt: nullableDateSchema,
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
    course: courseRefSchema,
    cohort: cohortRefSchema.nullable(),
    courseVersion: z.object({ id: idSchema, version: z.number().int() }),
    certificates: z.array(certificateRefSchema),
  })
  .openapi('EnrollmentSummary')

const myCertificateSchema = certificateSchema
  .extend({
    cohort: z.object({ id: idSchema, code: z.string(), name: z.string() }).nullable(),
    enrollment: z.object({ id: idSchema, courseId: idSchema, course: z.object({ slug: z.string(), title: z.string(), pillar: z.string().nullable() }) }).nullable(),
  })
  .openapi('MyCertificate')

export const orderSummarySchema = z
  .object({
    id: idSchema,
    reference: z.string(),
    status: z.enum(orderStatuses),
    subtotalAmount: z.number().int(),
    discountAmount: z.number().int(),
    totalAmount: z.number().int(),
    currency: z.string(),
    paidAt: nullableDateSchema,
    createdAt: isoDateSchema,
    organization: z.object({ id: idSchema, name: z.string() }).nullable(),
    lines: z.array(
      z.object({
        id: idSchema,
        label: z.string(),
        quantity: z.number().int(),
        unitAmount: z.number().int(),
        totalAmount: z.number().int(),
        offer: z.object({ id: idSchema, kind: z.enum(['COURSE', 'EVENT', 'SERVICE', 'RESOURCE']) }).nullable(),
      }),
    ),
    payments: z.array(
      z.object({
        id: idSchema,
        provider: z.string(),
        providerRef: z.string().nullable(),
        method: paymentMethodSchema,
        status: paymentStatusSchema,
        amount: z.number().int(),
        confirmedAt: nullableDateSchema,
      }),
    ),
    receipt: z.object({ id: idSchema, number: z.string(), pdfUrl: z.string().nullable(), issuedAt: isoDateSchema }).nullable(),
  })
  .openapi('OrderSummary')

const ordersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(orderStatuses).optional(),
})

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

const meRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Compte'],
  summary: 'Principal courant et profil',
  security: protectedSecurity,
  middleware: [authenticated],
  responses: { 200: jsonContent(meSchema, 'Identité, rôles, portées et profil'), ...protectedErrors() },
})

const enrollmentsRoute = createRoute({
  method: 'get',
  path: '/me/enrollments',
  tags: ['Compte'],
  summary: 'Mes inscriptions aux formations',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { query: z.object({ status: enrollmentStatusSchema.optional() }) },
  responses: { 200: jsonContent(z.object({ items: z.array(enrollmentSummarySchema) }), 'Inscriptions (actives en premier)'), ...protectedErrors() },
})

const certificatesRoute = createRoute({
  method: 'get',
  path: '/me/certificates',
  tags: ['Compte'],
  summary: 'Mes certificats et attestations',
  security: protectedSecurity,
  middleware: [authenticated],
  responses: { 200: jsonContent(z.object({ items: z.array(myCertificateSchema) }), 'Certificats du plus récent au plus ancien'), ...protectedErrors() },
})

const ordersRoute = createRoute({
  method: 'get',
  path: '/me/orders',
  tags: ['Compte'],
  summary: 'Mes commandes et paiements',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { query: ordersQuerySchema },
  responses: { 200: jsonContent(paginatedSchema(orderSummarySchema, 'OrderPage'), 'Commandes paginées'), ...protectedErrors() },
})

export const meRoutes = new OpenAPIHono<ApiEnv>()

meRoutes.openapi(meRoute, async (c) => {
  const principal = requirePrincipal(c)
  const isServiceKey = principal.id.startsWith('api-key:')
  const loaded = isServiceKey ? null : await loadProfile(principal.id)
  if (!isServiceKey && !loaded) throw new NotFoundError('Utilisateur', principal.id)
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      principal: {
        id: principal.id,
        email: principal.email,
        name: principal.name ?? null,
        roles: principal.roles.map((r) => ({ role: r.role, scopeType: r.scopeType, scopeId: r.scopeId, expiresAt: r.expiresAt ? new Date(r.expiresAt) : null })),
        organizationIds: principal.organizationIds,
        managedOrganizationIds: principal.managedOrganizationIds,
        mfaVerified: principal.mfaVerified ?? false,
      },
      auth: { method: c.get('authMethod') ?? 'none', apiKey: c.get('apiKey') ?? null },
      profile: loaded?.profile ?? null,
      organizations: loaded?.organizations ?? [],
    },
    200,
  )
})

meRoutes.openapi(enrollmentsRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { status } = c.req.valid('query')
  const rows = await enrollments.listForUser(principal, undefined, status ? { status: [status] } : {})
  c.header('Cache-Control', 'private, no-store')
  return c.json({ items: rows.map(toEnrollmentSummary) }, 200)
})

meRoutes.openapi(certificatesRoute, async (c) => {
  const principal = requirePrincipal(c)
  const rows = await certification.listForUser(principal)
  c.header('Cache-Control', 'private, no-store')
  return c.json(
    {
      items: rows.map((row) => ({
        ...toCertificateDto(row),
        cohort: row.cohort,
        enrollment: row.enrollment,
      })),
    },
    200,
  )
})

meRoutes.openapi(ordersRoute, async (c) => {
  const principal = requirePrincipal(c)
  const q = c.req.valid('query')
  const page = await orders.listForUser(principal, { page: q.page, pageSize: q.pageSize, status: q.status })
  c.header('Cache-Control', 'private, no-store')
  return c.json({ ...page, items: page.items.map(toOrderSummary) }, 200)
})

// -----------------------------------------------------------------------------
// Projections
// -----------------------------------------------------------------------------

type EnrollmentRow = Awaited<ReturnType<typeof enrollments.listForUser>>[number]

export function toEnrollmentSummary(row: EnrollmentRow) {
  return {
    id: row.id,
    status: row.status,
    source: row.source,
    progressPercent: row.progressPercent,
    score: row.score,
    timeSpentSeconds: row.timeSpentSeconds,
    lastActivityAt: row.lastActivityAt,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    course: {
      id: row.course.id,
      slug: row.course.slug,
      title: row.course.title,
      code: row.course.code,
      pillar: pillarOf(row.course.pillar),
      coverImageUrl: row.course.coverImageUrl,
      durationHours: row.course.durationHours,
      modality: row.course.modality,
      level: row.course.level,
    },
    cohort: row.cohort
      ? { id: row.cohort.id, code: row.cohort.code, name: row.cohort.name, status: row.cohort.status, mode: row.cohort.mode, startsAt: row.cohort.startsAt, endsAt: row.cohort.endsAt }
      : null,
    courseVersion: row.courseVersion,
    certificates: row.certificates,
  }
}

function pillarOf(value: string | null): 'protection' | 'prevention' | 'defense' | null {
  return value === 'protection' || value === 'prevention' || value === 'defense' ? value : null
}

type OrderRow = Awaited<ReturnType<typeof orders.listForUser>>['items'][number]

export function toOrderSummary(row: OrderRow) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    subtotalAmount: row.subtotalAmount,
    discountAmount: row.discountAmount,
    totalAmount: row.totalAmount,
    currency: row.currency,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    organization: row.organization,
    lines: row.lines,
    payments: row.payments,
    receipt: row.receipt,
  }
}
