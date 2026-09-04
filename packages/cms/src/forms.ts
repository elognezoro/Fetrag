// Formulaires publics (WEB-06) : contact, assistance, service, adhésion, partenariat.
// Anti-abus : champ pot de miel (spam silencieux) et plafond de 5 soumissions par heure et par email.
import { prisma, type FormKind, type FormSubmission, type FormSubmissionStatus, type Prisma } from '@fetrag/db'
import {
  contactFormSchema,
  formKindLabels,
  formKindSchema,
  membershipFormSchema,
  partnershipFormSchema,
  type Paginated,
} from '@fetrag/contracts'
import type { RoleName } from '@fetrag/contracts'
import {
  audit,
  emit,
  hashIp,
  makeReference,
  NotFoundError,
  paginationArgs,
  PreconditionError,
  RateLimitedError,
  safeOrderBy,
  toPaginated,
  type Principal,
} from '@fetrag/domain'
import { assertCan, auditCtx, contains, parseInput, toCsv, toJson, type Maybe, type RequestContext } from './common'
import { notifyRole, plainTextEmail, sendEmail } from './platform'
import { formListQuerySchema, formSubmissionStatusLabels, formSubmissionStatusSchema, formUpdateSchema, type FormListQuery } from './schemas'
import type { z } from 'zod'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ParsedForm {
  kind: FormKind
  fullName: string
  email: string
  phone?: string
  subject?: string
  message: string
  organization?: string
  consent: true
  sector?: string
  employer?: string
  jobTitle?: string
  interest?: string
  partnershipType?: string
}

const schemasByKind: Record<FormKind, z.ZodType<ParsedForm, z.ZodTypeDef, unknown>> = {
  CONTACT: contactFormSchema,
  SUPPORT: contactFormSchema,
  SERVICE: contactFormSchema,
  MEMBERSHIP: membershipFormSchema,
  PARTNERSHIP: partnershipFormSchema,
}

const roleByKind: Record<FormKind, RoleName> = {
  CONTACT: 'EDITOR',
  SUPPORT: 'SUPPORT',
  SERVICE: 'SERVICES_MANAGER',
  MEMBERSHIP: 'EDITOR',
  PARTNERSHIP: 'EDITOR',
}

/** Contexte de soumission transmis par la Server Action (adresse IP hachée, agent utilisateur). */
export interface SubmitContext extends RequestContext {
  /** Identifiant de l'utilisateur connecté, s'il y en a un. */
  userId?: string | null
}

export interface SubmitResult {
  id: string | null
  reference: string
  kind: FormKind
  status: FormSubmissionStatus
  /** Vrai lorsque la soumission a été classée indésirable (pot de miel) ; l'appelant répond comme pour un succès. */
  spam: boolean
}

const RATE_LIMIT_PER_HOUR = 5
const sortable = ['createdAt', 'kind', 'status', 'fullName', 'email', 'reference'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeReference('MSG')
    const exists = await prisma.formSubmission.findUnique({ where: { reference: candidate }, select: { id: true } })
    if (!exists) return candidate
  }
  return `${makeReference('MSG')}-${Date.now().toString(36).toUpperCase()}`
}

function buildPayload(data: ParsedForm, ctx: SubmitContext): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const key of ['organization', 'sector', 'employer', 'jobTitle', 'interest', 'partnershipType'] as const) {
    const value = data[key]
    if (value !== undefined && value !== '') payload[key] = value
  }
  payload.consent = { granted: true, at: new Date().toISOString(), ipHash: hashIp(ctx.ip), userAgent: ctx.userAgent?.slice(0, 200) ?? null }
  return payload
}

async function safeNotify(task: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await task()
  } catch (error) {
    console.error(`[cms] notification « ${label} » impossible`, error)
  }
}

// -----------------------------------------------------------------------------
// Soumission publique
// -----------------------------------------------------------------------------

/**
 * Enregistre une soumission de formulaire :
 * - pot de miel `website` renseigné → enregistrée en SPAM sans aucune notification ;
 * - plus de 5 soumissions par heure pour le même email → RATE_LIMITED ;
 * - sinon référence MSG-AAAA-XXXXXX, accusé de réception (template `form-ack`),
 *   notification au rôle concerné et événement `form.submitted`.
 */
export async function submit(kind: FormKind, input: unknown, ctx: SubmitContext = {}): Promise<SubmitResult> {
  const k = parseInput(formKindSchema, kind)
  const raw = isRecord(input) ? { ...input, kind: k } : input
  const honeypot = isRecord(raw) && typeof raw.website === 'string' && raw.website.trim().length > 0
  if (honeypot) {
    const { website: _website, ...rest } = raw
    const parsed = schemasByKind[k].safeParse(rest)
    if (!parsed.success) return { id: null, reference: makeReference('MSG'), kind: k, status: 'SPAM', spam: true }
    const spam = await prisma.formSubmission.create({
      data: {
        reference: await uniqueReference(),
        kind: k,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
        payload: toJson({ ...buildPayload(parsed.data, ctx), honeypot: true }),
        status: 'SPAM',
      },
    })
    return { id: spam.id, reference: spam.reference, kind: k, status: 'SPAM', spam: true }
  }

  const data = parseInput(schemasByKind[k], raw)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recent = await prisma.formSubmission.count({ where: { email: data.email, createdAt: { gte: oneHourAgo } } })
  if (recent >= RATE_LIMIT_PER_HOUR) throw new RateLimitedError('Trop de messages envoyés récemment, réessayez dans une heure')

  const reference = await uniqueReference()
  const submission = await prisma.formSubmission.create({
    data: {
      reference,
      kind: k,
      userId: ctx.userId ?? null,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject ?? null,
      message: data.message,
      payload: toJson(buildPayload(data, ctx)),
      status: 'NEW',
    },
  })

  const kindLabel = formKindLabels[k]
  await safeNotify(
    () =>
      sendEmail({
        to: data.email,
        subject: `Nous avons bien reçu votre message (${reference})`,
        template: 'form-received',
        variables: { fullName: data.fullName, reference, kind: k, kindLabel, subject: data.subject ?? null, message: data.message },
        text: plainTextEmail([
          `Bonjour ${data.fullName},`,
          '',
          `Nous avons bien reçu votre message (${kindLabel}) sous la référence ${reference}.`,
          'Notre équipe vous répondra dans les meilleurs délais.',
          '',
          'Rappel de votre message :',
          data.message,
        ]),
      }),
    'accusé de réception',
  )
  await safeNotify(
    () =>
      notifyRole(roleByKind[k], {
        title: `Nouveau message : ${kindLabel}`,
        body: `${data.fullName} <${data.email}> - ${data.subject ?? data.message.slice(0, 80)}`,
        href: `/admin/messages/${submission.id}`,
        category: 'requests',
      }),
    'notification équipe',
  )
  await emit('form.submitted', { id: submission.id, reference, kind: k, email: data.email }, { actorId: ctx.userId ?? undefined })
  return { id: submission.id, reference, kind: k, status: 'NEW', spam: false }
}

/** Alias de `submit` pour le contrat générique (`create(input, principal)` n'a pas de sens ici). */
export const create = submit

// -----------------------------------------------------------------------------
// Administration (forms.read)
// -----------------------------------------------------------------------------

export type FormSubmissionListItem = FormSubmission & { user: { id: string; name: string | null } | null }

function whereFor(q: z.output<typeof formListQuerySchema>): Prisma.FormSubmissionWhereInput {
  return {
    ...(q.kind ? { kind: q.kind } : {}),
    ...(q.status ? { status: q.status } : {}),
    ...(q.assignedTo ? { assignedTo: q.assignedTo } : {}),
    ...(q.q
      ? { OR: [{ reference: contains(q.q) }, { fullName: contains(q.q) }, { email: contains(q.q) }, { subject: contains(q.q) }, { message: contains(q.q) }] }
      : {}),
  }
}

/** Liste paginée des soumissions (forms.read) : type, statut, attribution, recherche. */
export async function list(query: FormListQuery, principal: Maybe<Principal>): Promise<Paginated<FormSubmissionListItem>> {
  assertCan(principal, 'forms.read')
  const q = parseInput(formListQuerySchema, query)
  const where = whereFor(q)
  const [items, total] = await prisma.$transaction([
    prisma.formSubmission.findMany({
      where,
      ...paginationArgs(q),
      orderBy: safeOrderBy(q.sort, q.order, sortable, 'createdAt'),
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.formSubmission.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Soumission par identifiant (forms.read). */
export async function getById(id: string, principal: Maybe<Principal>): Promise<FormSubmissionListItem> {
  assertCan(principal, 'forms.read')
  const submission = await prisma.formSubmission.findUnique({ where: { id }, include: { user: { select: { id: true, name: true } } } })
  if (!submission) throw new NotFoundError('Message', id)
  return submission
}

/** Change le statut (ANSWERED renseigne answeredAt) - forms.read. */
export async function setStatus(id: string, status: FormSubmissionStatus, principal: Maybe<Principal>, ctx?: RequestContext): Promise<FormSubmission> {
  const p = assertCan(principal, 'forms.read')
  const to = parseInput(formSubmissionStatusSchema, status)
  const existing = await prisma.formSubmission.findUnique({ where: { id }, select: { status: true, reference: true } })
  if (!existing) throw new NotFoundError('Message', id)
  const submission = await prisma.formSubmission.update({
    where: { id },
    data: { status: to, answeredAt: to === 'ANSWERED' ? new Date() : undefined },
  })
  await audit('content.updated', { type: 'FormSubmission', id }, auditCtx(p, ctx), {
    before: { status: existing.status },
    after: { status: to, reference: existing.reference },
  })
  return submission
}

/** Attribue la soumission à un membre de l'équipe (statut ASSIGNED si elle était NEW) - forms.read. */
export async function assign(id: string, assignedTo: string | null, principal: Maybe<Principal>, ctx?: RequestContext): Promise<FormSubmission> {
  const p = assertCan(principal, 'forms.read')
  const existing = await prisma.formSubmission.findUnique({ where: { id }, select: { status: true, assignedTo: true } })
  if (!existing) throw new NotFoundError('Message', id)
  const submission = await prisma.formSubmission.update({
    where: { id },
    data: { assignedTo, status: existing.status === 'NEW' && assignedTo ? 'ASSIGNED' : undefined },
  })
  await audit('content.updated', { type: 'FormSubmission', id }, auditCtx(p, ctx), {
    before: { assignedTo: existing.assignedTo },
    after: { assignedTo },
  })
  return submission
}

/** Mise à jour combinée statut / attribution (contrat générique). */
export async function update(id: string, input: z.input<typeof formUpdateSchema>, principal: Maybe<Principal>, ctx?: RequestContext): Promise<FormSubmission> {
  const data = parseInput(formUpdateSchema, input)
  let submission = await getById(id, principal)
  if (data.assignedTo !== undefined) submission = { ...submission, ...(await assign(id, data.assignedTo, principal, ctx)) }
  if (data.status !== undefined) submission = { ...submission, ...(await setStatus(id, data.status, principal, ctx)) }
  return submission
}

/** Supprime une soumission indésirable ou clôturée (forms.read). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'forms.read')
  const existing = await prisma.formSubmission.findUnique({ where: { id }, select: { status: true, reference: true } })
  if (!existing) throw new NotFoundError('Message', id)
  if (existing.status !== 'SPAM' && existing.status !== 'CLOSED') {
    throw new PreconditionError('Seuls les messages indésirables ou clôturés peuvent être supprimés', { status: existing.status })
  }
  await prisma.formSubmission.delete({ where: { id } })
  await audit('content.archived', { type: 'FormSubmission', id }, auditCtx(p, ctx), { before: existing, after: { deleted: true } })
}

/** Répartition par statut (tableau de bord). */
export async function countByStatus(principal: Maybe<Principal>): Promise<Record<FormSubmissionStatus, number>> {
  assertCan(principal, 'forms.read')
  const rows = await prisma.formSubmission.groupBy({ by: ['status'], _count: { _all: true } })
  const out: Record<FormSubmissionStatus, number> = { NEW: 0, ASSIGNED: 0, ANSWERED: 0, CLOSED: 0, SPAM: 0 }
  for (const row of rows) out[row.status] = row._count._all
  return out
}

/** Export CSV des soumissions filtrées (forms.read), 5 000 lignes maximum, journalisé. */
export async function exportCsv(query: FormListQuery, principal: Maybe<Principal>, ctx?: RequestContext): Promise<string> {
  const p = assertCan(principal, 'forms.read')
  const q = parseInput(formListQuerySchema, query)
  const rows = await prisma.formSubmission.findMany({ where: whereFor(q), orderBy: { createdAt: 'desc' }, take: 5000 })
  await audit('export.generated', { type: 'FormSubmission' }, auditCtx(p, ctx), { after: { count: rows.length, filters: q } })
  return toCsv(
    ['Référence', 'Type', 'Statut', 'Nom', 'Email', 'Téléphone', 'Objet', 'Message', 'Reçu le', 'Répondu le'],
    rows.map((r) => [
      r.reference,
      formKindLabels[r.kind],
      formSubmissionStatusLabels[r.status],
      r.fullName,
      r.email,
      r.phone,
      r.subject,
      r.message,
      r.createdAt,
      r.answeredAt,
    ]),
  )
}

/** Alias explicite de `exportCsv` (BUILD_BRIEF : `forms.export`). */
export { exportCsv as export }
