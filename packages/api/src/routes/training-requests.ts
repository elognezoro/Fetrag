// Workflow institutionnel (chapitre 14) : GET/POST /training-requests, GET /training-requests/{id},
// POST /training-requests/{id}/decision (coordination).
import { createRouter } from '../lib/router'
import { createRoute, z } from '@hono/zod-openapi'
import {
  idSchema,
  sessionModeSchema,
  trainingRequestDecisionSchema,
  trainingRequestInputSchema,
  trainingRequestStatusSchema,
  trainingRequestTransitions,
} from '@fetrag/contracts'
import { trainingRequests } from '@fetrag/lms-core'
import { can, ForbiddenError } from '@fetrag/domain'
import { errorResponses, jsonContent, paginatedSchema, protectedErrors } from '../lib/responses'
import { requestMeta } from '../lib/request'
import { authenticated, requireCan, requirePrincipal } from '../middleware/auth'
import { protectedSecurity } from '../openapi'
import { cohortRefSchema, idParamSchema, isoDateSchema, nullableDateSchema, organizationRefSchema, userRefSchema } from '../schemas/common'

// -----------------------------------------------------------------------------
// Schémas
// -----------------------------------------------------------------------------

const listQuerySchema = z.object({
  status: trainingRequestStatusSchema.optional(),
  organizationId: idSchema.optional().openapi({ description: 'Obligatoire pour un responsable gérant plusieurs organisations' }),
  q: z.string().trim().max(200).optional().openapi({ description: 'Référence, contact ou organisation (coordination)' }),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const requestModuleSchema = z.object({
  id: idSchema,
  position: z.number().int(),
  course: z.object({ id: idSchema, title: z.string(), code: z.string() }),
})

const requestSummarySchema = z
  .object({
    id: idSchema,
    reference: z.string().openapi({ example: 'DF-2026-K7P2QX' }),
    status: trainingRequestStatusSchema,
    organizationId: idSchema,
    organization: organizationRefSchema.nullable(),
    contactName: z.string(),
    contactRole: z.string().nullable(),
    contactEmail: z.string(),
    contactPhone: z.string().nullable(),
    preferredStart: nullableDateSchema,
    preferredMode: sessionModeSchema,
    participantLimit: z.number().int(),
    proposedStart: nullableDateSchema,
    proposedMode: sessionModeSchema.nullable(),
    submittedAt: nullableDateSchema,
    decidedAt: nullableDateSchema,
    createdAt: isoDateSchema,
    updatedAt: isoDateSchema,
    modules: z.array(requestModuleSchema),
    cohort: cohortRefSchema.nullable(),
    counts: z.object({ participants: z.number().int(), attachments: z.number().int() }),
  })
  .openapi('TrainingRequestSummary')

const requestListSchema = paginatedSchema(requestSummarySchema)
  .extend({ pendingCount: z.number().int().optional().openapi({ description: 'Demandes en attente d’action de la coordination' }) })
  .openapi('TrainingRequestPage')

const decisionEntrySchema = z.object({
  id: idSchema,
  fromStatus: trainingRequestStatusSchema.nullable(),
  toStatus: trainingRequestStatusSchema,
  comment: z.string().nullable(),
  createdAt: isoDateSchema,
  actor: z.object({ id: idSchema, name: z.string().nullable() }).nullable(),
})

const requestDetailSchema = requestSummarySchema
  .omit({ counts: true })
  .extend({
    requester: userRefSchema,
    motivation: z.string().nullable(),
    commitmentsAccepted: z.boolean(),
    commitmentsAcceptedAt: nullableDateSchema,
    coordinatorNote: z.string().nullable(),
    modules: z.array(
      requestModuleSchema.extend({
        course: z.object({ id: idSchema, slug: z.string(), code: z.string(), title: z.string(), durationHours: z.number().int(), status: z.string() }),
      }),
    ),
    participants: z.array(
      z.object({
        id: idSchema,
        fullName: z.string(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
        jobTitle: z.string().nullable(),
        userId: z.string().nullable(),
        enrolled: z.boolean(),
      }),
    ),
    attachments: z.array(
      z.object({ id: idSchema, fileName: z.string(), mimeType: z.string(), size: z.number().int(), label: z.string().nullable(), createdAt: isoDateSchema }),
    ),
    decisions: z.array(decisionEntrySchema),
    cohort: cohortRefSchema
      .extend({ trainerId: z.string().nullable(), memberCount: z.number().int(), sessionCount: z.number().int() })
      .nullable(),
    allowedTransitions: z.array(trainingRequestStatusSchema),
    canDecide: z.boolean(),
    canEdit: z.boolean(),
  })
  .openapi('TrainingRequestDetail')

const decisionBodySchema = trainingRequestDecisionSchema.omit({ requestId: true }).openapi('TrainingRequestDecision', {
  description: 'Transitions autorisées : ' + Object.entries(trainingRequestTransitions).map(([from, to]) => `${from} -> ${to.join(', ') || '(final)'}`).join(' ; '),
})

const scheduleResultSchema = z.object({
  cohorts: z.array(z.object({ id: idSchema, code: z.string(), name: z.string(), courseId: idSchema, courseTitle: z.string() })),
  accounts: z.object({
    created: z.number().int(),
    existing: z.number().int(),
    enrolled: z.number().int(),
    skipped: z.array(z.object({ participant: z.string(), reason: z.string() })),
  }),
})

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

const listRoute = createRoute({
  method: 'get',
  path: '/training-requests',
  tags: ['Demandes de formation'],
  summary: 'Demandes de formation visibles',
  description: 'Coordination : file de traitement globale (filtres statut, organisation, recherche). Responsable d’organisation : demandes de son organisation.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { query: listQuerySchema },
  responses: { 200: jsonContent(requestListSchema, 'Demandes paginées'), ...protectedErrors() },
})

const createRoute_ = createRoute({
  method: 'post',
  path: '/training-requests',
  tags: ['Demandes de formation'],
  summary: 'Déposer une demande de formation (organisation affiliée)',
  description: 'Permission `training_request.create` sur l’organisation. La demande est soumise immédiatement (DRAFT -> SUBMITTED) ; la coordination est notifiée et le contact reçoit un accusé de réception.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { body: { content: { 'application/json': { schema: trainingRequestInputSchema.openapi('TrainingRequestInput') } }, required: true } },
  responses: { 201: jsonContent(requestDetailSchema, 'Demande soumise'), ...protectedErrors(), ...errorResponses(412) },
})

const detailRoute = createRoute({
  method: 'get',
  path: '/training-requests/{id}',
  tags: ['Demandes de formation'],
  summary: 'Détail d’une demande (organisation concernée ou coordination)',
  security: protectedSecurity,
  middleware: [authenticated],
  request: { params: idParamSchema },
  responses: { 200: jsonContent(requestDetailSchema, 'Demande'), ...protectedErrors() },
})

const decisionRoute = createRoute({
  method: 'post',
  path: '/training-requests/{id}/decision',
  tags: ['Demandes de formation'],
  summary: 'Décision de la coordination',
  description:
    'Permission `training_request.decide`. INFO_REQUESTED et REJECTED exigent un commentaire ; RESCHEDULED une date proposée ; ' +
    'SCHEDULED crée la cohorte, les comptes participants (mot de passe aléatoire), les inscriptions et les convocations.',
  security: protectedSecurity,
  middleware: [authenticated],
  request: {
    params: idParamSchema,
    body: { content: { 'application/json': { schema: decisionBodySchema } }, required: true },
  },
  responses: {
    200: jsonContent(z.object({ request: requestDetailSchema, schedule: scheduleResultSchema.nullable() }), 'Décision enregistrée'),
    ...protectedErrors(),
    ...errorResponses(412),
  },
})

export const trainingRequestRoutes = createRouter()

trainingRequestRoutes.openapi(listRoute, async (c) => {
  const principal = requirePrincipal(c)
  const q = c.req.valid('query')
  c.header('Cache-Control', 'private, no-store')

  if (can(principal, 'training_request.decide')) {
    const page = await trainingRequests.listForCoordination(principal, q)
    return c.json({ ...page, items: page.items.map(toCoordinationSummary), pendingCount: page.pendingCount }, 200)
  }

  const organizationId = q.organizationId ?? (principal.managedOrganizationIds.length === 1 ? principal.managedOrganizationIds[0] : undefined)
  if (!organizationId) {
    throw new ForbiddenError("Précisez l'organisation (organizationId) dont vous êtes responsable", { organizations: principal.managedOrganizationIds })
  }
  const page = await trainingRequests.listForOrganization(principal, organizationId, { status: q.status, page: q.page, pageSize: q.pageSize })
  return c.json({ ...page, items: page.items.map((item) => toOrganizationSummary(item)) }, 200)
})

trainingRequestRoutes.openapi(createRoute_, async (c) => {
  const principal = requirePrincipal(c)
  const input = c.req.valid('json')
  requireCan(c, 'training_request.create', { organizationId: input.organizationId })
  const created = await trainingRequests.create(principal, input, { submit: true }, requestMeta(c))
  const detail = await trainingRequests.get(principal, created.id)
  c.header('Cache-Control', 'no-store')
  return c.json(toDetail(detail), 201)
})

trainingRequestRoutes.openapi(detailRoute, async (c) => {
  const principal = requirePrincipal(c)
  const { id } = c.req.valid('param')
  const detail = await trainingRequests.get(principal, id)
  c.header('Cache-Control', 'private, no-store')
  return c.json(toDetail(detail), 200)
})

trainingRequestRoutes.openapi(decisionRoute, async (c) => {
  const principal = requireCan(c, 'training_request.decide')
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const result = await trainingRequests.decide(principal, { ...body, requestId: id }, requestMeta(c))
  const detail = await trainingRequests.get(principal, id)
  c.header('Cache-Control', 'no-store')
  return c.json({ request: toDetail(detail), schedule: result.schedule }, 200)
})

// -----------------------------------------------------------------------------
// Projections
// -----------------------------------------------------------------------------

type CoordinationRow = Awaited<ReturnType<typeof trainingRequests.listForCoordination>>['items'][number]
type OrganizationRow = Awaited<ReturnType<typeof trainingRequests.listForOrganization>>['items'][number]
type Detail = Awaited<ReturnType<typeof trainingRequests.get>>

function baseSummary(row: CoordinationRow | OrganizationRow) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    organizationId: row.organizationId,
    contactName: row.contactName,
    contactRole: row.contactRole,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    preferredStart: row.preferredStart,
    preferredMode: row.preferredMode,
    participantLimit: row.participantLimit,
    proposedStart: row.proposedStart,
    proposedMode: row.proposedMode,
    submittedAt: row.submittedAt,
    decidedAt: row.decidedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    modules: row.modules.map((m) => ({ id: m.id, position: m.position, course: m.course })),
    counts: { participants: row._count.participants, attachments: row._count.attachments },
  }
}

function toCoordinationSummary(row: CoordinationRow) {
  return { ...baseSummary(row), organization: row.organization, cohort: row.cohort }
}

function toOrganizationSummary(row: OrganizationRow) {
  return { ...baseSummary(row), organization: null, cohort: row.cohort }
}

function toDetail(detail: Detail) {
  return {
    id: detail.id,
    reference: detail.reference,
    status: detail.status,
    organizationId: detail.organizationId,
    organization: { id: detail.organization.id, name: detail.organization.name, acronym: detail.organization.acronym },
    requester: detail.requester,
    contactName: detail.contactName,
    contactRole: detail.contactRole,
    contactEmail: detail.contactEmail,
    contactPhone: detail.contactPhone,
    preferredStart: detail.preferredStart,
    preferredMode: detail.preferredMode,
    participantLimit: detail.participantLimit,
    motivation: detail.motivation,
    commitmentsAccepted: detail.commitmentsAccepted,
    commitmentsAcceptedAt: detail.commitmentsAcceptedAt,
    coordinatorNote: detail.coordinatorNote,
    proposedStart: detail.proposedStart,
    proposedMode: detail.proposedMode,
    submittedAt: detail.submittedAt,
    decidedAt: detail.decidedAt,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    modules: detail.modules.map((m) => ({
      id: m.id,
      position: m.position,
      course: { id: m.course.id, slug: m.course.slug, code: m.course.code, title: m.course.title, durationHours: m.course.durationHours, status: m.course.status },
    })),
    participants: detail.participants.map((p) => ({ id: p.id, fullName: p.fullName, email: p.email, phone: p.phone, jobTitle: p.jobTitle, userId: p.userId, enrolled: p.enrolled })),
    attachments: detail.attachments.map((a) => ({ id: a.id, fileName: a.fileName, mimeType: a.mimeType, size: a.size, label: a.label, createdAt: a.createdAt })),
    decisions: detail.decisions.map((d) => ({ id: d.id, fromStatus: d.fromStatus, toStatus: d.toStatus, comment: d.comment, createdAt: d.createdAt, actor: d.actor })),
    cohort: detail.cohort
      ? {
          id: detail.cohort.id,
          code: detail.cohort.code,
          name: detail.cohort.name,
          status: detail.cohort.status,
          startsAt: detail.cohort.startsAt,
          endsAt: detail.cohort.endsAt,
          trainerId: detail.cohort.trainerId,
          memberCount: detail.cohort._count.members,
          sessionCount: detail.cohort._count.sessions,
        }
      : null,
    allowedTransitions: detail.allowedTransitions,
    canDecide: detail.canDecide,
    canEdit: detail.canEdit,
  }
}
