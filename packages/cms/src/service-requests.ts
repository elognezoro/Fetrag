// Demandes de service : dépôt public, suivi par le demandeur, traitement par les responsables services.
import { prisma, type Prisma, type ServiceRequestStatus } from '@fetrag/db'
import { serviceRequestStatusLabels, type Paginated } from '@fetrag/contracts'
import {
  audit,
  can,
  makeReference,
  NotFoundError,
  paginationArgs,
  PreconditionError,
  safeOrderBy,
  toPaginated,
  UnauthenticatedError,
  ForbiddenError,
  ValidationError,
  type Principal,
} from '@fetrag/domain'
import { resolvePublicUrl } from '@fetrag/config'
import {
  assertAny,
  assertCan,
  auditCtx,
  contains,
  parseInput,
  requirePrincipal,
  toCsv,
  toJson,
  type Maybe,
  type RequestContext,
} from './common'
import { findActiveOffer } from './offers'
import { notifyRole, notifyUser, plainTextEmail, sendEmail } from './platform'
import { parseFormSchema } from './services'
import {
  serviceRequestInputSchema,
  serviceRequestListQuerySchema,
  serviceRequestStatusSchema,
  serviceRequestUpdateSchema,
  type ServiceFormField,
  type ServiceRequestInput,
  type ServiceRequestListQuery,
} from './schemas'
import type { z } from 'zod'

// -----------------------------------------------------------------------------
// Transitions
// -----------------------------------------------------------------------------

/** Transitions autorisées du traitement d'une demande de service. */
export const serviceRequestTransitions: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
  NEW: ['IN_REVIEW', 'IN_PROGRESS', 'REJECTED', 'CLOSED'],
  IN_REVIEW: ['IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  REJECTED: ['CLOSED', 'IN_REVIEW'],
  CLOSED: [],
}

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const listSelect = {
  id: true,
  reference: true,
  serviceId: true,
  requesterId: true,
  assigneeId: true,
  fullName: true,
  email: true,
  phone: true,
  organization: true,
  status: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
  service: { select: { id: true, slug: true, name: true, isPaid: true, slaDays: true } },
  assignee: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ServiceRequestSelect

export type ServiceRequestListItem = Prisma.ServiceRequestGetPayload<{ select: typeof listSelect }>

const detailInclude = {
  service: { select: { id: true, slug: true, name: true, isPaid: true, priceAmount: true, currency: true, slaDays: true, formSchema: true } },
  requester: { select: { id: true, name: true, email: true, phone: true } },
  assignee: { select: { id: true, name: true, email: true } },
  order: { select: { id: true, reference: true, status: true, totalAmount: true, currency: true, paidAt: true } },
  history: { orderBy: { createdAt: 'asc' }, select: { id: true, fromStatus: true, toStatus: true, actorId: true, comment: true, createdAt: true } },
} satisfies Prisma.ServiceRequestInclude

export type ServiceRequestDetail = Prisma.ServiceRequestGetPayload<{ include: typeof detailInclude }> & {
  formFields: ServiceFormField[] | null
}

export interface ServiceRequestCreateResult {
  request: ServiceRequestDetail
  /** Vrai pour un service payant : le checkout web crée la commande à partir de `offerId`. */
  requiresPayment: boolean
  offerId: string | null
  amount: number | null
  currency: string
}

const sortable = ['reference', 'createdAt', 'updatedAt', 'status', 'fullName'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeReference('SRV')
    const exists = await prisma.serviceRequest.findUnique({ where: { reference: candidate }, select: { id: true } })
    if (!exists) return candidate
  }
  return `${makeReference('SRV')}-${Date.now().toString(36).toUpperCase()}`
}

/** Vérifie le contenu du formulaire dynamique du service (champs obligatoires, options, formats). */
export function validatePayload(fields: ServiceFormField[] | null, payload: Record<string, unknown> | undefined): Record<string, string[]> | null {
  if (!fields || fields.length === 0) return null
  const errors: Record<string, string[]> = {}
  for (const field of fields) {
    const value = payload?.[field.name]
    const empty =
      value === undefined || value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0)
    if (empty) {
      if (field.required) errors[field.name] = ['Champ obligatoire']
      continue
    }
    switch (field.type) {
      case 'select':
        if (field.options && !field.options.includes(String(value))) errors[field.name] = ['Valeur non autorisée']
        break
      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.name] = ['Adresse email invalide']
        break
      case 'number':
        if (Number.isNaN(Number(value))) errors[field.name] = ['Nombre attendu']
        break
      case 'date':
        if (Number.isNaN(new Date(String(value)).getTime())) errors[field.name] = ['Date invalide']
        break
      case 'checkbox':
        if (typeof value !== 'boolean') errors[field.name] = ['Valeur booléenne attendue']
        break
      default:
        if (typeof value === 'string' && value.length > 5000) errors[field.name] = ['Texte trop long']
    }
  }
  return Object.keys(errors).length > 0 ? errors : null
}

/** Ne conserve que les champs déclarés par le formulaire du service (ou le payload borné si aucun formulaire). */
function pickPayload(fields: ServiceFormField[] | null, payload: Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (!payload) return null
  if (JSON.stringify(payload).length > 20000) throw new ValidationError('Le formulaire est trop volumineux')
  if (!fields || fields.length === 0) return payload
  const out: Record<string, unknown> = {}
  for (const field of fields) if (payload[field.name] !== undefined) out[field.name] = payload[field.name]
  return out
}

function withFields(request: Prisma.ServiceRequestGetPayload<{ include: typeof detailInclude }>): ServiceRequestDetail {
  return { ...request, formFields: parseFormSchema(request.service.formSchema) }
}

function canHandle(principal: Principal): boolean {
  return can(principal, 'services.handle_requests')
}

async function requireAccess(id: string, principal: Maybe<Principal>): Promise<ServiceRequestDetail> {
  const p = requirePrincipal(principal)
  const request = await prisma.serviceRequest.findUnique({ where: { id }, include: detailInclude })
  if (!request) throw new NotFoundError('Demande', id)
  if (request.requesterId !== p.id && !canHandle(p)) throw new ForbiddenError('Vous n’avez pas accès à cette demande')
  return withFields(request)
}

async function safeNotify(task: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await task()
  } catch (error) {
    console.error(`[cms] notification « ${label} » impossible`, error)
  }
}

// -----------------------------------------------------------------------------
// Dépôt et consultation
// -----------------------------------------------------------------------------

/**
 * Crée une demande de service (statut NEW, référence SRV-AAAA-XXXXXX).
 * Un service payant ne crée pas de commande ici : le résultat indique `requiresPayment`
 * et l'offre à utiliser par le checkout ; `fulfillOrder` liera ensuite la commande.
 */
export async function create(
  serviceId: string,
  input: ServiceRequestInput,
  principal?: Maybe<Principal>,
  ctx?: RequestContext,
): Promise<ServiceRequestCreateResult> {
  const data = parseInput(serviceRequestInputSchema, input)
  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service || service.status !== 'PUBLISHED') throw new NotFoundError('Service', serviceId)
  if (service.requiresAccount && !principal) throw new UnauthenticatedError('Ce service nécessite un compte FETRAG')

  const fields = parseFormSchema(service.formSchema)
  const fieldErrors = validatePayload(fields, data.payload)
  if (fieldErrors) throw new ValidationError('Formulaire incomplet', { fieldErrors })
  const payload = pickPayload(fields, data.payload)
  const reference = await uniqueReference()

  const created = await prisma.$transaction(async (tx) => {
    const request = await tx.serviceRequest.create({
      data: {
        reference,
        serviceId,
        requesterId: principal?.id ?? null,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        organization: data.organization?.trim() || null,
        message: data.message?.trim() || null,
        payload: toJson(payload),
        status: 'NEW',
      },
    })
    await tx.statusEvent.create({
      data: {
        entityType: 'ServiceRequest',
        entityId: request.id,
        serviceRequestId: request.id,
        fromStatus: null,
        toStatus: 'NEW',
        actorId: principal?.id ?? null,
      },
    })
    return request
  })

  const offer = service.isPaid ? await findActiveOffer({ serviceId }) : null
  const amount = service.isPaid ? (offer?.amount ?? service.priceAmount) : null
  const currency = offer?.currency ?? service.currency
  const baseUrl = resolvePublicUrl('web')

  await safeNotify(
    () =>
      sendEmail({
        to: data.email,
        subject: `Votre demande ${reference} - ${service.name}`,
        template: 'service-request-received',
        variables: {
          fullName: data.fullName,
          reference,
          serviceName: service.name,
          requiresPayment: service.isPaid,
          amount,
          currency,
          dashboardUrl: `${baseUrl}/espace/demandes`,
        },
        text: plainTextEmail([
          `Bonjour ${data.fullName},`,
          '',
          `Nous avons bien reçu votre demande « ${service.name} » (référence ${reference}).`,
          service.isPaid ? 'Elle sera traitée dès confirmation du paiement.' : 'Elle sera examinée par notre équipe dans les meilleurs délais.',
          service.slaDays ? `Délai indicatif de traitement : ${service.slaDays} jours.` : null,
          `Suivi : ${baseUrl}/espace/demandes`,
        ]),
      }),
    'accusé de réception',
  )
  await safeNotify(
    () =>
      notifyRole('SERVICES_MANAGER', {
        title: 'Nouvelle demande de service',
        body: `${data.fullName} - ${service.name} (${reference})`,
        href: `/admin/demandes/${created.id}`,
        category: 'requests',
      }),
    'responsables services',
  )
  await audit('service_request.status_changed', { type: 'ServiceRequest', id: created.id }, auditCtx(principal, ctx), {
    after: { reference, status: 'NEW', serviceId },
  })

  const request = await requireAccessOrSystem(created.id)
  return { request, requiresPayment: service.isPaid, offerId: offer?.id ?? null, amount, currency }
}

async function requireAccessOrSystem(id: string): Promise<ServiceRequestDetail> {
  const request = await prisma.serviceRequest.findUnique({ where: { id }, include: detailInclude })
  if (!request) throw new NotFoundError('Demande', id)
  return withFields(request)
}

/** Demande par identifiant : accessible au demandeur et aux titulaires de services.handle_requests. */
export async function getById(id: string, principal: Maybe<Principal>): Promise<ServiceRequestDetail> {
  return requireAccess(id, principal)
}

/** Demande par référence (suivi public par le demandeur connecté). */
export async function getByReference(reference: string, principal: Maybe<Principal>): Promise<ServiceRequestDetail> {
  const found = await prisma.serviceRequest.findUnique({ where: { reference }, select: { id: true } })
  if (!found) throw new NotFoundError('Demande', reference)
  return requireAccess(found.id, principal)
}

/**
 * Liste selon le rôle : les responsables services et le support voient tout (filtres statut,
 * service, assigné, `mine`) ; un utilisateur ne voit que ses propres demandes.
 */
export async function list(query: ServiceRequestListQuery, principal: Maybe<Principal>): Promise<Paginated<ServiceRequestListItem>> {
  const p = requirePrincipal(principal)
  const q = parseInput(serviceRequestListQuerySchema, query)
  const handler = canHandle(p)
  const where: Prisma.ServiceRequestWhereInput = {
    ...(handler ? {} : { requesterId: p.id }),
    ...(handler && q.mine ? { assigneeId: p.id } : {}),
    ...(handler && q.assigneeId ? { assigneeId: q.assigneeId } : {}),
    ...(q.status ? { status: q.status } : {}),
    ...(q.serviceId ? { serviceId: q.serviceId } : {}),
    ...(q.q
      ? { OR: [{ reference: contains(q.q) }, { fullName: contains(q.q) }, { email: contains(q.q) }, { organization: contains(q.q) }] }
      : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({ where, ...paginationArgs(q), orderBy: safeOrderBy(q.sort, q.order, sortable, 'createdAt'), select: listSelect }),
    prisma.serviceRequest.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Alias explicite de `list` (BUILD_BRIEF). */
export const listForRole = list

/** Demandes du principal connecté. */
export async function listForUser(principal: Maybe<Principal>, query: ServiceRequestListQuery = {}): Promise<Paginated<ServiceRequestListItem>> {
  const p = requirePrincipal(principal)
  const q = parseInput(serviceRequestListQuerySchema, query)
  const where: Prisma.ServiceRequestWhereInput = { requesterId: p.id, ...(q.status ? { status: q.status } : {}) }
  const [items, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({ where, ...paginationArgs(q), orderBy: { createdAt: 'desc' }, select: listSelect }),
    prisma.serviceRequest.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Répartition des demandes par statut (tableau de bord services). */
export async function countByStatus(principal: Maybe<Principal>): Promise<Record<ServiceRequestStatus, number>> {
  assertCan(principal, 'services.handle_requests')
  const rows = await prisma.serviceRequest.groupBy({ by: ['status'], _count: { _all: true } })
  const out: Record<ServiceRequestStatus, number> = { NEW: 0, IN_REVIEW: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0, CLOSED: 0 }
  for (const row of rows) out[row.status] = row._count._all
  return out
}

// -----------------------------------------------------------------------------
// Traitement
// -----------------------------------------------------------------------------

/** Attribue (ou retire) un responsable ; une demande NEW passe automatiquement en examen. */
export async function assign(id: string, assigneeId: string | null, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ServiceRequestDetail> {
  const p = assertCan(principal, 'services.handle_requests')
  const existing = await prisma.serviceRequest.findUnique({ where: { id }, select: { id: true, reference: true, status: true, assigneeId: true } })
  if (!existing) throw new NotFoundError('Demande', id)
  if (assigneeId) {
    const eligible = await prisma.roleAssignment.findFirst({
      where: {
        userId: assigneeId,
        scopeType: 'GLOBAL',
        role: { in: ['SERVICES_MANAGER', 'SUPPORT', 'SUPER_ADMIN'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })
    if (!eligible) throw new ValidationError('Le responsable désigné doit avoir le rôle Responsable services ou Support')
  }
  const nextStatus: ServiceRequestStatus = existing.status === 'NEW' && assigneeId ? 'IN_REVIEW' : existing.status
  await prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({ where: { id }, data: { assigneeId, status: nextStatus } })
    if (nextStatus !== existing.status) {
      await tx.statusEvent.create({
        data: { entityType: 'ServiceRequest', entityId: id, serviceRequestId: id, fromStatus: existing.status, toStatus: nextStatus, actorId: p.id },
      })
    }
  })
  await audit('service_request.status_changed', { type: 'ServiceRequest', id }, auditCtx(p, ctx), {
    before: { status: existing.status, assigneeId: existing.assigneeId },
    after: { status: nextStatus, assigneeId },
  })
  if (assigneeId && assigneeId !== p.id) {
    await safeNotify(
      () =>
        notifyUser(assigneeId, {
          title: 'Demande de service attribuée',
          body: `La demande ${existing.reference} vous a été attribuée.`,
          href: `/admin/demandes/${id}`,
          category: 'requests',
        }),
      'attribution',
    )
  }
  return requireAccessOrSystem(id)
}

/** Change le statut (transitions contrôlées), historise, journalise et informe le demandeur. */
export async function setStatus(
  id: string,
  status: ServiceRequestStatus,
  principal: Maybe<Principal>,
  options: { comment?: string; ctx?: RequestContext } = {},
): Promise<ServiceRequestDetail> {
  const p = assertCan(principal, 'services.handle_requests')
  const to = parseInput(serviceRequestStatusSchema, status)
  const existing = await prisma.serviceRequest.findUnique({ where: { id }, include: { service: { select: { name: true } } } })
  if (!existing) throw new NotFoundError('Demande', id)
  if (existing.status === to) return requireAccessOrSystem(id)
  if (!serviceRequestTransitions[existing.status].includes(to)) {
    throw new PreconditionError(
      `Transition « ${serviceRequestStatusLabels[existing.status]} » vers « ${serviceRequestStatusLabels[to]} » non autorisée`,
      { from: existing.status, to, allowed: serviceRequestTransitions[existing.status] },
    )
  }
  const comment = options.comment?.trim().slice(0, 3000) || null
  await prisma.$transaction([
    prisma.serviceRequest.update({ where: { id }, data: { status: to, assigneeId: existing.assigneeId ?? p.id } }),
    prisma.statusEvent.create({
      data: { entityType: 'ServiceRequest', entityId: id, serviceRequestId: id, fromStatus: existing.status, toStatus: to, actorId: p.id, comment },
    }),
  ])
  await audit('service_request.status_changed', { type: 'ServiceRequest', id }, auditCtx(p, options.ctx), {
    before: { status: existing.status },
    after: { status: to, comment },
  })

  const statusLabel = serviceRequestStatusLabels[to]
  const baseUrl = resolvePublicUrl('web')
  await safeNotify(
    () =>
      sendEmail({
        to: existing.email,
        subject: `Demande ${existing.reference} : ${statusLabel}`,
        template: 'service-request-status',
        variables: { fullName: existing.fullName, reference: existing.reference, serviceName: existing.service.name, status: to, statusLabel, comment, dashboardUrl: `${baseUrl}/espace/demandes` },
        text: plainTextEmail([
          `Bonjour ${existing.fullName},`,
          '',
          `Votre demande « ${existing.service.name} » (référence ${existing.reference}) est désormais : ${statusLabel}.`,
          comment ? `Message de l'équipe : ${comment}` : null,
          `Suivi : ${baseUrl}/espace/demandes`,
        ]),
      }),
    'statut demande',
  )
  if (existing.requesterId) {
    await safeNotify(
      () =>
        notifyUser(existing.requesterId as string, {
          title: `Demande ${existing.reference} : ${statusLabel}`,
          body: comment ?? `Votre demande « ${existing.service.name} » a changé de statut.`,
          href: '/espace/demandes',
          category: 'requests',
        }),
      'notification demandeur',
    )
  }
  return requireAccessOrSystem(id)
}

/** Met à jour les informations internes d'une demande (note, coordonnées, données du formulaire). */
export async function update(
  id: string,
  input: z.input<typeof serviceRequestUpdateSchema>,
  principal: Maybe<Principal>,
  ctx?: RequestContext,
): Promise<ServiceRequestDetail> {
  const p = assertCan(principal, 'services.handle_requests')
  const data = parseInput(serviceRequestUpdateSchema, input)
  const existing = await prisma.serviceRequest.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new NotFoundError('Demande', id)
  await prisma.serviceRequest.update({
    where: { id },
    data: { internalNote: data.internalNote, phone: data.phone, organization: data.organization, payload: toJson(data.payload) },
  })
  await audit('service_request.status_changed', { type: 'ServiceRequest', id }, auditCtx(p, ctx), { after: { updated: Object.keys(data) } })
  return requireAccessOrSystem(id)
}

/** Supprime une demande clôturée ou refusée (services.manage). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertAny(principal, ['services.manage'])
  const existing = await prisma.serviceRequest.findUnique({ where: { id }, select: { reference: true, status: true } })
  if (!existing) throw new NotFoundError('Demande', id)
  if (existing.status !== 'CLOSED' && existing.status !== 'REJECTED') {
    throw new PreconditionError('Seules les demandes clôturées ou refusées peuvent être supprimées', { status: existing.status })
  }
  await prisma.serviceRequest.delete({ where: { id } })
  await audit('service_request.status_changed', { type: 'ServiceRequest', id }, auditCtx(p, ctx), {
    before: { reference: existing.reference, status: existing.status },
    after: { deleted: true },
  })
}

/** Historique des statuts d'une demande. */
export async function history(id: string, principal: Maybe<Principal>): Promise<ServiceRequestDetail['history']> {
  const request = await requireAccess(id, principal)
  return request.history
}

/** Export CSV des demandes filtrées (services.handle_requests), 5 000 lignes maximum. */
export async function exportCsv(query: ServiceRequestListQuery, principal: Maybe<Principal>, ctx?: RequestContext): Promise<string> {
  const p = assertCan(principal, 'services.handle_requests')
  const q = parseInput(serviceRequestListQuerySchema, query)
  const where: Prisma.ServiceRequestWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.serviceId ? { serviceId: q.serviceId } : {}),
    ...(q.assigneeId ? { assigneeId: q.assigneeId } : {}),
    ...(q.q ? { OR: [{ reference: contains(q.q) }, { fullName: contains(q.q) }, { email: contains(q.q) }] } : {}),
  }
  const rows = await prisma.serviceRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5000, select: listSelect })
  await audit('export.generated', { type: 'ServiceRequest' }, auditCtx(p, ctx), { after: { count: rows.length, filters: q } })
  return toCsv(
    ['Référence', 'Service', 'Statut', 'Nom', 'Email', 'Téléphone', 'Organisation', 'Responsable', 'Créée le', 'Mise à jour le'],
    rows.map((r) => [
      r.reference,
      r.service.name,
      serviceRequestStatusLabels[r.status],
      r.fullName,
      r.email,
      r.phone,
      r.organization,
      r.assignee?.name ?? r.assignee?.email ?? '',
      r.createdAt,
      r.updatedAt,
    ]),
  )
}
