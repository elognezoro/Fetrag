// Agenda et Master Class : CRUD éditorial, agenda public, inscriptions, liste d'attente, présence.
import { prisma, type EventRegistration, type EventRegistrationStatus, type Prisma, type SessionMode, type WaitingListEntry } from '@fetrag/db'
import { resolvePublicUrl } from '@fetrag/config'
import { sessionModeLabels, type Paginated } from '@fetrag/contracts'
import {
  audit,
  ConflictError,
  emit,
  formatDateTime,
  NotFoundError,
  paginationArgs,
  PreconditionError,
  safeOrderBy,
  toPaginated,
  uniqueSlug,
  type Principal,
} from '@fetrag/domain'
import {
  assertAny,
  assertCan,
  auditCtx,
  contains,
  parseInput,
  requirePrincipal,
  toCsv,
  type Maybe,
  type RequestContext,
} from './common'
import { activeOffersInclude, findActiveOffer, syncStandardOffer, type OfferSummary } from './offers'
import { notifyUser, plainTextEmail, sendEmail } from './platform'
import { renderExcerpt, sanitizeHtml } from './sanitize'
import {
  eventInputSchema,
  eventKindSchema,
  eventListQuerySchema,
  eventUpdateSchema,
  waitingListInputSchema,
  type EventInput,
  type EventListQuery,
  type EventUpdateInput,
  type WaitingListInput,
} from './schemas'
import { upsertRecord as upsertSeoRecord } from './seo'
import { z } from 'zod'

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const categorySelect = { select: { id: true, slug: true, name: true, color: true } } as const
const ACTIVE_STATUSES: EventRegistrationStatus[] = ['REGISTERED', 'ATTENDED']

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  kind: true,
  coverImageUrl: true,
  startsAt: true,
  endsAt: true,
  location: true,
  city: true,
  mode: true,
  speakerName: true,
  speakerTitle: true,
  speakerImageUrl: true,
  capacity: true,
  isFree: true,
  priceAmount: true,
  currency: true,
  issuesCertificate: true,
  isFeatured: true,
  publishedAt: true,
  updatedAt: true,
  category: categorySelect,
  _count: { select: { registrations: { where: { status: { in: ACTIVE_STATUSES } } } } },
} satisfies Prisma.EventSelect

type EventCardRow = Prisma.EventGetPayload<{ select: typeof cardSelect }>

/** Carte d'événement publique avec places restantes. */
export type EventCard = Omit<EventCardRow, '_count'> & {
  registeredCount: number
  remainingSeats: number | null
  isFull: boolean
  isPast: boolean
}

const adminSelect = {
  ...cardSelect,
  status: true,
  categoryId: true,
  createdAt: true,
} satisfies Prisma.EventSelect

export type EventListItem = Omit<Prisma.EventGetPayload<{ select: typeof adminSelect }>, '_count'> & {
  registeredCount: number
  remainingSeats: number | null
  isFull: boolean
  isPast: boolean
}

const detailInclude = {
  category: categorySelect,
  seo: true,
  offers: activeOffersInclude('EVENT'),
  _count: { select: { registrations: { where: { status: { in: ACTIVE_STATUSES } } }, waitingList: true } },
} satisfies Prisma.EventInclude

type EventDetailRow = Prisma.EventGetPayload<{ include: typeof detailInclude }>

export type EventDetail = Omit<EventDetailRow, '_count'> & {
  registeredCount: number
  waitingCount: number
  remainingSeats: number | null
  isFull: boolean
  isPast: boolean
}

export type PublicEvent = EventDetail & {
  /** Statut d'inscription du visiteur connecté, s'il y en a un. */
  viewerRegistration: EventRegistrationStatus | null
  offers: OfferSummary[]
}

export interface RegisterResult {
  status: 'REGISTERED' | 'WAITLISTED' | 'PAYMENT_REQUIRED' | 'ALREADY_REGISTERED'
  registration: EventRegistration | null
  requiresPayment: boolean
  offerId: string | null
  amount: number | null
  currency: string
}

export interface AttendeeRow {
  userId: string
  fullName: string
  email: string
  phone: string | null
  employer: string | null
  status: EventRegistrationStatus
  registeredAt: Date
  attendedAt: Date | null
  orderReference: string | null
}

export const upcomingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(6),
  kind: eventKindSchema.optional(),
  featured: z.coerce.boolean().optional(),
})
export type UpcomingQuery = z.input<typeof upcomingQuerySchema>

export const pastQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  kind: eventKindSchema.optional(),
})
export type PastQuery = z.input<typeof pastQuerySchema>

const sortable = ['title', 'startsAt', 'kind', 'status', 'createdAt', 'updatedAt'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function seats(capacity: number | null, registered: number): { remainingSeats: number | null; isFull: boolean } {
  if (capacity === null) return { remainingSeats: null, isFull: false }
  return { remainingSeats: Math.max(0, capacity - registered), isFull: registered >= capacity }
}

function isPastEvent(event: { startsAt: Date; endsAt: Date | null }, now = new Date()): boolean {
  return (event.endsAt ?? event.startsAt).getTime() < now.getTime()
}

function toCard<T extends EventCardRow>(row: T): Omit<T, '_count'> & EventCard {
  const { _count, ...rest } = row
  const registered = _count.registrations
  return { ...rest, registeredCount: registered, ...seats(row.capacity, registered), isPast: isPastEvent(row) }
}

function toDetail(row: EventDetailRow): EventDetail {
  const { _count, ...rest } = row
  const registered = _count.registrations
  return { ...rest, registeredCount: registered, waitingCount: _count.waitingList, ...seats(row.capacity, registered), isPast: isPastEvent(row) }
}

function upcomingWhere(now = new Date()): Prisma.EventWhereInput {
  return { status: 'PUBLISHED', OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }] }
}

function pastWhere(now = new Date()): Prisma.EventWhereInput {
  return { status: 'PUBLISHED', OR: [{ endsAt: { lt: now } }, { endsAt: null, startsAt: { lt: now } }] }
}

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.event.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

async function resolveSlug(explicit: string | undefined, title: string, excludeId: string | null): Promise<string> {
  if (explicit) {
    if (await slugExists(explicit, excludeId)) throw new ConflictError('Ce slug est déjà utilisé', { slug: explicit })
    return explicit
  }
  return uniqueSlug(title, (candidate) => slugExists(candidate, excludeId))
}

async function countActive(eventId: string): Promise<number> {
  return prisma.eventRegistration.count({ where: { eventId, status: { in: ACTIVE_STATUSES } } })
}

async function safeNotify(task: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await task()
  } catch (error) {
    console.error(`[cms] notification « ${label} » impossible`, error)
  }
}

function eventUrl(slug: string): string {
  return `${resolvePublicUrl('web')}/evenements/${slug}`
}

async function sendRegistrationEmail(
  user: { email: string; name: string | null },
  event: { slug: string; title: string; startsAt: Date; location: string | null; city: string | null; meetingUrl: string | null; mode: SessionMode },
): Promise<void> {
  const when = formatDateTime(event.startsAt)
  const where = event.mode === 'VIRTUAL' ? 'En ligne' : [event.location, event.city].filter(Boolean).join(', ') || 'Lieu communiqué ultérieurement'
  await sendEmail({
    to: user.email,
    subject: `Inscription confirmée : ${event.title}`,
    template: 'event-registered',
    variables: {
      firstName: user.name?.split(' ')[0] ?? '',
      eventTitle: event.title,
      startsAt: when,
      location: where,
      mode: sessionModeLabels[event.mode],
      meetingUrl: event.meetingUrl,
      eventUrl: eventUrl(event.slug),
    },
    text: plainTextEmail([
      `Bonjour ${user.name ?? ''},`.trim(),
      '',
      `Votre inscription à « ${event.title} » est confirmée.`,
      `Date : ${when}`,
      `Lieu : ${where}`,
      event.meetingUrl ? `Lien de connexion : ${event.meetingUrl}` : null,
      `Détails : ${eventUrl(event.slug)}`,
    ]),
  })
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

/** Liste d'administration paginée (cms.read_drafts) : statut, type, période, recherche, tri. */
export async function list(query: EventListQuery, principal: Maybe<Principal>): Promise<Paginated<EventListItem>> {
  assertCan(principal, 'cms.read_drafts')
  const q = parseInput(eventListQuerySchema, query)
  const where: Prisma.EventWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.kind ? { kind: q.kind } : {}),
    ...(q.from || q.to ? { startsAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } } : {}),
    ...(q.q ? { OR: [{ title: contains(q.q) }, { slug: contains(q.q) }, { summary: contains(q.q) }, { speakerName: contains(q.q) }] } : {}),
  }
  const [rows, total] = await prisma.$transaction([
    prisma.event.findMany({ where, ...paginationArgs(q), orderBy: safeOrderBy(q.sort, q.order, sortable, 'startsAt'), select: adminSelect }),
    prisma.event.count({ where }),
  ])
  return toPaginated(rows.map(toCard), total, q)
}

/** Événement par identifiant (offres, compteurs) ; brouillons réservés aux rôles éditoriaux si un principal est fourni. */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<EventDetail> {
  const event = await prisma.event.findUnique({ where: { id }, include: detailInclude })
  if (!event) throw new NotFoundError('Événement', id)
  if (principal !== undefined && event.status !== 'PUBLISHED') assertCan(principal, 'cms.read_drafts')
  return toDetail(event)
}

/** Crée un événement (cms.write) ; un événement payant obtient une offre STANDARD. */
export async function create(input: EventInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<EventDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(eventInputSchema, input)
  const slug = await resolveSlug(data.slug, data.title, null)
  const description = sanitizeHtml(data.description)
  const event = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      summary: data.summary?.trim() || renderExcerpt(description) || null,
      description,
      kind: data.kind,
      categoryId: data.categoryId ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      startsAt: data.startsAt,
      endsAt: data.endsAt ?? null,
      location: data.location ?? null,
      city: data.city ?? null,
      mode: data.mode,
      meetingUrl: data.meetingUrl ?? null,
      replayUrl: data.replayUrl ?? null,
      speakerName: data.speakerName ?? null,
      speakerTitle: data.speakerTitle ?? null,
      speakerBio: data.speakerBio ? sanitizeHtml(data.speakerBio) : null,
      speakerImageUrl: data.speakerImageUrl ?? null,
      capacity: data.capacity ?? null,
      isFree: data.isFree,
      priceAmount: data.isFree ? null : (data.priceAmount ?? null),
      currency: data.currency,
      issuesCertificate: data.issuesCertificate,
      isFeatured: data.isFeatured,
    },
  })
  await syncStandardOffer('EVENT', { eventId: event.id }, { name: event.title, amount: event.priceAmount, currency: event.currency, active: !event.isFree })
  if (data.seo) await upsertSeoRecord('event', event.id, data.seo)
  await audit('content.created', { type: 'Event', id: event.id }, auditCtx(p, ctx), { after: { slug, title: data.title, startsAt: data.startsAt.toISOString() } })
  return getById(event.id)
}

/** Met à jour un événement (cms.write). */
export async function update(id: string, input: EventUpdateInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<EventDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(eventUpdateSchema, input)
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Événement', id)
  const startsAt = data.startsAt ?? existing.startsAt
  const endsAt = data.endsAt !== undefined ? data.endsAt : existing.endsAt
  if (endsAt && endsAt.getTime() < startsAt.getTime()) {
    throw new PreconditionError('La date de fin doit être postérieure à la date de début', { fieldErrors: { endsAt: ['Date invalide'] } })
  }
  const isFree = data.isFree ?? existing.isFree
  const priceAmount = data.priceAmount !== undefined ? data.priceAmount : existing.priceAmount
  if (!isFree && (!priceAmount || priceAmount <= 0)) {
    throw new PreconditionError('Un événement payant doit avoir un tarif strictement positif', { fieldErrors: { priceAmount: ['Tarif requis'] } })
  }
  const slug = data.slug && data.slug !== existing.slug ? await resolveSlug(data.slug, existing.title, id) : existing.slug
  const description = data.description !== undefined ? sanitizeHtml(data.description) : existing.description
  const event = await prisma.event.update({
    where: { id },
    data: {
      slug,
      title: data.title,
      summary: data.summary !== undefined ? data.summary?.trim() || renderExcerpt(description) || null : undefined,
      description,
      kind: data.kind,
      categoryId: data.categoryId,
      coverImageUrl: data.coverImageUrl,
      startsAt,
      endsAt,
      location: data.location,
      city: data.city,
      mode: data.mode,
      meetingUrl: data.meetingUrl,
      replayUrl: data.replayUrl,
      speakerName: data.speakerName,
      speakerTitle: data.speakerTitle,
      speakerBio: data.speakerBio === undefined ? undefined : data.speakerBio ? sanitizeHtml(data.speakerBio) : null,
      speakerImageUrl: data.speakerImageUrl,
      capacity: data.capacity,
      isFree,
      priceAmount: isFree ? null : priceAmount,
      currency: data.currency,
      issuesCertificate: data.issuesCertificate,
      isFeatured: data.isFeatured,
    },
  })
  await syncStandardOffer('EVENT', { eventId: id }, { name: event.title, amount: event.priceAmount, currency: event.currency, active: !event.isFree })
  if (data.seo) await upsertSeoRecord('event', id, data.seo)
  await audit('content.updated', { type: 'Event', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title, startsAt: existing.startsAt.toISOString(), isFree: existing.isFree },
    after: { slug, title: event.title, startsAt: event.startsAt.toISOString(), isFree: event.isFree },
  })
  return getById(id)
}

/** Supprime un événement (cms.write ; cms.publish s'il est publié ou s'il a des inscrits). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.write')
  const existing = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { registrations: true } } } })
  if (!existing) throw new NotFoundError('Événement', id)
  if (existing.status === 'PUBLISHED' || existing._count.registrations > 0) assertCan(p, 'cms.publish')
  await prisma.event.delete({ where: { id } })
  await audit('content.archived', { type: 'Event', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title, status: existing.status, registrations: existing._count.registrations },
    after: { deleted: true },
  })
}

// -----------------------------------------------------------------------------
// Agenda public
// -----------------------------------------------------------------------------

/** Événements publiés à venir (ou en cours), du plus proche au plus lointain. */
export async function listUpcoming(query: UpcomingQuery = {}): Promise<EventCard[]> {
  const q = parseInput(upcomingQuerySchema, query)
  const rows = await prisma.event.findMany({
    where: { ...upcomingWhere(), ...(q.kind ? { kind: q.kind } : {}), ...(q.featured !== undefined ? { isFeatured: q.featured } : {}) },
    orderBy: { startsAt: 'asc' },
    take: q.limit,
    select: cardSelect,
  })
  return rows.map(toCard)
}

/** Événements passés, paginés, du plus récent au plus ancien. */
export async function listPast(query: PastQuery = {}): Promise<Paginated<EventCard>> {
  const q = parseInput(pastQuerySchema, query)
  const where: Prisma.EventWhereInput = { ...pastWhere(), ...(q.kind ? { kind: q.kind } : {}) }
  const [rows, total] = await prisma.$transaction([
    prisma.event.findMany({ where, ...paginationArgs(q), orderBy: { startsAt: 'desc' }, select: cardSelect }),
    prisma.event.count({ where }),
  ])
  return toPaginated(rows.map(toCard), total, q)
}

/** Événement publié par slug (description assainie, offres, statut d'inscription du visiteur). */
export async function getPublished(slug: string, principal?: Maybe<Principal>): Promise<PublicEvent | null> {
  const event = await prisma.event.findFirst({ where: { slug, status: 'PUBLISHED' }, include: detailInclude })
  if (!event) return null
  const viewer = principal
    ? await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: principal.id } }, select: { status: true } })
    : null
  const detail = toDetail({ ...event, description: sanitizeHtml(event.description), speakerBio: event.speakerBio ? sanitizeHtml(event.speakerBio) : null })
  return { ...detail, viewerRegistration: viewer?.status ?? null }
}

/** Slugs des événements publiés (sitemap). */
export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  return prisma.event.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true }, orderBy: { startsAt: 'desc' } })
}

// -----------------------------------------------------------------------------
// Inscriptions
// -----------------------------------------------------------------------------

/**
 * Inscrit le principal à un événement publié :
 * - complet → WAITLISTED ; gratuit → REGISTERED + email de confirmation + événement `event.registered` ;
 * - payant → aucune inscription créée, renvoie `requiresPayment` et l'offre pour le checkout
 *   (le paiement confirmé crée l'inscription via `fulfillOrder`).
 */
export async function register(principal: Maybe<Principal>, eventId: string, ctx?: RequestContext): Promise<RegisterResult> {
  const p = requirePrincipal(principal)
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.status !== 'PUBLISHED') throw new NotFoundError('Événement', eventId)
  if (isPastEvent(event)) throw new PreconditionError('Les inscriptions à cet événement sont closes')

  const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId: p.id } } })
  if (existing && existing.status !== 'CANCELLED') {
    return { status: 'ALREADY_REGISTERED', registration: existing, requiresPayment: false, offerId: null, amount: null, currency: event.currency }
  }

  const registered = await countActive(eventId)
  if (event.capacity !== null && registered >= event.capacity) {
    const registration = existing
      ? await prisma.eventRegistration.update({ where: { id: existing.id }, data: { status: 'WAITLISTED', createdAt: new Date() } })
      : await prisma.eventRegistration.create({ data: { eventId, userId: p.id, status: 'WAITLISTED' } })
    await safeNotify(
      () =>
        sendEmail({
          to: p.email,
          subject: `Liste d’attente : ${event.title}`,
          template: 'custom',
          variables: { fullName: p.name ?? '', eventTitle: event.title, eventUrl: eventUrl(event.slug) },
          text: plainTextEmail([
            `Bonjour ${p.name ?? ''},`.trim(),
            '',
            `L'événement « ${event.title} » est complet. Vous êtes inscrit sur la liste d'attente et serez prévenu si une place se libère.`,
            `Détails : ${eventUrl(event.slug)}`,
          ]),
        }),
      'liste d’attente',
    )
    return { status: 'WAITLISTED', registration, requiresPayment: false, offerId: null, amount: null, currency: event.currency }
  }

  if (!event.isFree) {
    const offer = await findActiveOffer({ eventId })
    return {
      status: 'PAYMENT_REQUIRED',
      registration: null,
      requiresPayment: true,
      offerId: offer?.id ?? null,
      amount: offer?.amount ?? event.priceAmount,
      currency: offer?.currency ?? event.currency,
    }
  }

  const registration = existing
    ? await prisma.eventRegistration.update({ where: { id: existing.id }, data: { status: 'REGISTERED', createdAt: new Date() } })
    : await prisma.eventRegistration.create({ data: { eventId, userId: p.id, status: 'REGISTERED' } })
  await safeNotify(() => sendRegistrationEmail({ email: p.email, name: p.name ?? null }, event), 'confirmation d’inscription')
  await safeNotify(
    () =>
      notifyUser(p.id, {
        title: 'Inscription confirmée',
        body: `Vous êtes inscrit à « ${event.title} » (${formatDateTime(event.startsAt)}).`,
        href: `/evenements/${event.slug}`,
        category: 'general',
      }),
    'notification inscription',
  )
  await emit('event.registered', { eventId, registrationId: registration.id, userId: p.id, slug: event.slug }, { actorId: p.id, correlationId: ctx?.correlationId ?? undefined })
  return { status: 'REGISTERED', registration, requiresPayment: false, offerId: null, amount: null, currency: event.currency }
}

/** Promeut le premier inscrit en liste d'attente si une place s'est libérée (événements gratuits). */
async function promoteFromWaitingList(event: {
  id: string
  slug: string
  title: string
  startsAt: Date
  endsAt: Date | null
  location: string | null
  city: string | null
  meetingUrl: string | null
  mode: SessionMode
  capacity: number | null
  isFree: boolean
}): Promise<void> {
  if (!event.isFree || event.capacity === null || isPastEvent(event)) return
  const registered = await countActive(event.id)
  if (registered >= event.capacity) return
  const next = await prisma.eventRegistration.findFirst({
    where: { eventId: event.id, status: 'WAITLISTED' },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, email: true, name: true } } },
  })
  if (next) {
    await prisma.eventRegistration.update({ where: { id: next.id }, data: { status: 'REGISTERED' } })
    await safeNotify(() => sendRegistrationEmail(next.user, event), 'promotion liste d’attente')
    await safeNotify(
      () =>
        notifyUser(next.user.id, {
          title: 'Une place s’est libérée',
          body: `Votre inscription à « ${event.title} » est confirmée.`,
          href: `/evenements/${event.slug}`,
          category: 'general',
        }),
      'notification promotion',
    )
    return
  }
  const entry = await prisma.waitingListEntry.findFirst({ where: { eventId: event.id, notifiedAt: null }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] })
  if (!entry) return
  await prisma.waitingListEntry.update({ where: { id: entry.id }, data: { notifiedAt: new Date() } })
  await safeNotify(
    () =>
      sendEmail({
        to: entry.email,
        subject: `Une place s’est libérée : ${event.title}`,
        template: 'custom',
        variables: { fullName: entry.fullName, eventTitle: event.title, eventUrl: eventUrl(event.slug) },
        text: plainTextEmail([
          `Bonjour ${entry.fullName},`,
          '',
          `Une place s'est libérée pour « ${event.title} ». Inscrivez-vous rapidement : ${eventUrl(event.slug)}`,
        ]),
      }),
    'place disponible',
  )
}

/** Annule l'inscription du principal ; une place libérée est proposée à la liste d'attente. */
export async function cancelRegistration(principal: Maybe<Principal>, eventId: string, ctx?: RequestContext): Promise<EventRegistration> {
  const p = requirePrincipal(principal)
  const registration = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId: p.id } }, include: { event: true } })
  if (!registration) throw new NotFoundError('Inscription')
  if (registration.status === 'CANCELLED') return registration
  if (registration.status === 'ATTENDED') throw new PreconditionError('Une participation enregistrée ne peut pas être annulée')
  const wasRegistered = registration.status === 'REGISTERED'
  const updated = await prisma.eventRegistration.update({ where: { id: registration.id }, data: { status: 'CANCELLED' } })
  await audit('enrollment.status_changed', { type: 'EventRegistration', id: registration.id }, auditCtx(p, ctx), {
    before: { status: registration.status },
    after: { status: 'CANCELLED', eventId },
  })
  if (wasRegistered) await promoteFromWaitingList(registration.event)
  return updated
}

/** Inscription sur la liste d'attente par email (visiteur connecté ou non). */
export async function joinWaitingList(eventId: string, input: WaitingListInput, principal?: Maybe<Principal>): Promise<WaitingListEntry> {
  const data = parseInput(waitingListInputSchema, input)
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.status !== 'PUBLISHED') throw new NotFoundError('Événement', eventId)
  if (isPastEvent(event)) throw new PreconditionError('Cet événement est terminé')
  const existing = await prisma.waitingListEntry.findUnique({ where: { eventId_email: { eventId, email: data.email } } })
  if (existing) return existing
  const position = (await prisma.waitingListEntry.count({ where: { eventId } })) + 1
  const entry = await prisma.waitingListEntry.create({
    data: { eventId, email: data.email, fullName: data.fullName, userId: principal?.id ?? null, position },
  })
  await safeNotify(
    () =>
      sendEmail({
        to: data.email,
        subject: `Liste d’attente : ${event.title}`,
        template: 'custom',
        variables: { fullName: data.fullName, eventTitle: event.title, position, eventUrl: eventUrl(event.slug) },
        text: plainTextEmail([
          `Bonjour ${data.fullName},`,
          '',
          `Vous êtes inscrit en position ${position} sur la liste d'attente de « ${event.title} ».`,
          `Nous vous préviendrons par email si une place se libère. Détails : ${eventUrl(event.slug)}`,
        ]),
      }),
    'liste d’attente',
  )
  return entry
}

/** Inscriptions du principal (agenda personnel), événements à venir en premier. */
export async function listForUser(principal: Maybe<Principal>): Promise<Array<EventRegistration & { event: EventCard }>> {
  const p = requirePrincipal(principal)
  const rows = await prisma.eventRegistration.findMany({
    where: { userId: p.id, status: { not: 'CANCELLED' } },
    include: { event: { select: cardSelect } },
    orderBy: { event: { startsAt: 'desc' } },
  })
  return rows.map((r) => ({ ...r, event: toCard(r.event) }))
}

/** Marque la présence (ou la retire) d'un inscrit - cms.write ou reports.read. */
export async function markAttendance(eventId: string, userId: string, attended: boolean, principal: Maybe<Principal>, ctx?: RequestContext): Promise<EventRegistration> {
  const p = assertAny(principal, ['cms.write', 'reports.read'])
  const registration = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } })
  if (!registration) throw new NotFoundError('Inscription')
  if (registration.status === 'CANCELLED' || registration.status === 'WAITLISTED') {
    throw new PreconditionError('Seuls les inscrits confirmés peuvent être marqués présents', { status: registration.status })
  }
  const updated = await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: attended ? { status: 'ATTENDED', attendedAt: new Date() } : { status: 'REGISTERED', attendedAt: null },
  })
  await audit('attendance.recorded', { type: 'EventRegistration', id: registration.id }, auditCtx(p, ctx), {
    before: { status: registration.status },
    after: { status: updated.status, eventId },
  })
  return updated
}

/** Participants d'un événement (inscrits, présents, liste d'attente) - cms.write ou reports.read. */
export async function listAttendees(eventId: string, principal: Maybe<Principal>): Promise<AttendeeRow[]> {
  assertAny(principal, ['cms.write', 'reports.read'])
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } })
  if (!event) throw new NotFoundError('Événement', eventId)
  const rows = await prisma.eventRegistration.findMany({
    where: { eventId, status: { not: 'CANCELLED' } },
    include: { user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, employer: true } }, order: { select: { reference: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
  })
  return rows.map((r) => ({
    userId: r.user.id,
    fullName: r.user.name ?? [r.user.firstName, r.user.lastName].filter(Boolean).join(' '),
    email: r.user.email,
    phone: r.user.phone,
    employer: r.user.employer,
    status: r.status,
    registeredAt: r.createdAt,
    attendedAt: r.attendedAt,
    orderReference: r.order?.reference ?? null,
  }))
}

export interface AttendeesExport {
  fileName: string
  csv: string
  rows: AttendeeRow[]
}

const registrationStatusLabels: Record<EventRegistrationStatus, string> = {
  REGISTERED: 'Inscrit',
  WAITLISTED: 'Liste d’attente',
  CANCELLED: 'Annulé',
  ATTENDED: 'Présent',
}

/** Export CSV des participants (cms.write ou reports.read), journalisé. */
export async function attendees(eventId: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<AttendeesExport> {
  const p = assertAny(principal, ['cms.write', 'reports.read'])
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true, title: true } })
  if (!event) throw new NotFoundError('Événement', eventId)
  const rows = await listAttendees(eventId, p)
  await audit('export.generated', { type: 'Event', id: eventId }, auditCtx(p, ctx), { after: { count: rows.length, export: 'attendees' } })
  const csv = toCsv(
    ['Nom', 'Email', 'Téléphone', 'Employeur', 'Statut', 'Inscrit le', 'Présent le', 'Commande'],
    rows.map((r) => [r.fullName, r.email, r.phone, r.employer, registrationStatusLabels[r.status], r.registeredAt, r.attendedAt, r.orderReference]),
  )
  return { fileName: `participants-${event.slug}.csv`, csv, rows }
}
