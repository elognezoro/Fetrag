// Services aux travailleurs et organisations : catalogue public, CRUD, offres tarifaires liées.
import { prisma, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import {
  audit,
  ConflictError,
  NotFoundError,
  paginationArgs,
  PreconditionError,
  safeOrderBy,
  toPaginated,
  uniqueSlug,
  type Principal,
} from '@fetrag/domain'
import { adminListQuerySchema, assertAny, auditCtx, contains, parseInput, toJson, type Maybe, type RequestContext } from './common'
import { activeOffersInclude, syncStandardOffer, type OfferSummary } from './offers'
import { renderExcerpt, sanitizeHtml } from './sanitize'
import { serviceFormSchema, serviceInputSchema, serviceUpdateSchema, type ServiceFormField, type ServiceInput, type ServiceUpdateInput } from './schemas'
import { upsertRecord as upsertSeoRecord } from './seo'
import { z } from 'zod'

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const categorySelect = { select: { id: true, slug: true, name: true, color: true } } as const

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  icon: true,
  isPaid: true,
  priceAmount: true,
  currency: true,
  requiresAccount: true,
  slaDays: true,
  position: true,
  category: categorySelect,
} satisfies Prisma.ServiceSelect

export type ServiceCard = Prisma.ServiceGetPayload<{ select: typeof cardSelect }> & { offers: OfferSummary[] }

const adminSelect = {
  ...cardSelect,
  status: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { requests: true } },
} satisfies Prisma.ServiceSelect

export type ServiceListItem = Prisma.ServiceGetPayload<{ select: typeof adminSelect }>

const detailInclude = {
  category: categorySelect,
  seo: true,
  offers: activeOffersInclude('SERVICE'),
  _count: { select: { requests: true } },
} satisfies Prisma.ServiceInclude

export type ServiceDetail = Omit<Prisma.ServiceGetPayload<{ include: typeof detailInclude }>, 'formSchema'> & {
  formSchema: ServiceFormField[] | null
}

export const serviceListQuerySchema = adminListQuerySchema.extend({
  categoryId: z.string().uuid().optional(),
  isPaid: z.coerce.boolean().optional(),
})
export type ServiceListQuery = z.input<typeof serviceListQuerySchema>

const sortable = ['name', 'slug', 'position', 'status', 'priceAmount', 'createdAt', 'updatedAt'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Valide le schéma de formulaire stocké (JSON) ; null si absent ou invalide. */
export function parseFormSchema(value: unknown): ServiceFormField[] | null {
  if (value === null || value === undefined) return null
  const parsed = serviceFormSchema.safeParse(value)
  return parsed.success && parsed.data.length > 0 ? parsed.data : null
}

function withForm<T extends { formSchema: unknown }>(service: T): Omit<T, 'formSchema'> & { formSchema: ServiceFormField[] | null } {
  return { ...service, formSchema: parseFormSchema(service.formSchema) }
}

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.service.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

async function resolveSlug(explicit: string | undefined, name: string, excludeId: string | null): Promise<string> {
  if (explicit) {
    if (await slugExists(explicit, excludeId)) throw new ConflictError('Ce slug est déjà utilisé', { slug: explicit })
    return explicit
  }
  return uniqueSlug(name, (candidate) => slugExists(candidate, excludeId))
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

/** Liste d'administration paginée (cms.read_drafts ou services.manage). */
export async function list(query: ServiceListQuery, principal: Maybe<Principal>): Promise<Paginated<ServiceListItem>> {
  assertAny(principal, ['cms.read_drafts', 'services.manage'])
  const q = parseInput(serviceListQuerySchema, query)
  const where: Prisma.ServiceWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.isPaid !== undefined ? { isPaid: q.isPaid } : {}),
    ...(q.q ? { OR: [{ name: contains(q.q) }, { slug: contains(q.q) }, { summary: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.service.findMany({
      where,
      ...paginationArgs(q),
      orderBy: q.sort ? safeOrderBy(q.sort, q.order, sortable, 'position') : [{ position: 'asc' }, { name: 'asc' }],
      select: adminSelect,
    }),
    prisma.service.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Service par identifiant (catégorie, SEO, offres actives). Les brouillons exigent un rôle éditorial si un principal est fourni. */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<ServiceDetail> {
  const service = await prisma.service.findUnique({ where: { id }, include: detailInclude })
  if (!service) throw new NotFoundError('Service', id)
  if (principal !== undefined && service.status !== 'PUBLISHED') assertAny(principal, ['cms.read_drafts', 'services.manage'])
  return withForm(service)
}

/** Crée un service (cms.write ou services.manage) et synchronise son offre STANDARD s'il est payant. */
export async function create(input: ServiceInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ServiceDetail> {
  const p = assertAny(principal, ['cms.write', 'services.manage'])
  const data = parseInput(serviceInputSchema, input)
  const slug = await resolveSlug(data.slug, data.name, null)
  const description = sanitizeHtml(data.description)
  const service = await prisma.service.create({
    data: {
      slug,
      name: data.name,
      summary: data.summary?.trim() || renderExcerpt(description) || null,
      description,
      conditions: data.conditions ? sanitizeHtml(data.conditions) : null,
      icon: data.icon ?? null,
      categoryId: data.categoryId ?? null,
      isPaid: data.isPaid,
      priceAmount: data.isPaid ? (data.priceAmount ?? null) : null,
      currency: data.currency,
      requiresAccount: data.requiresAccount,
      formSchema: toJson(data.formSchema),
      slaDays: data.slaDays ?? null,
      position: data.position,
    },
  })
  await syncStandardOffer('SERVICE', { serviceId: service.id }, { name: service.name, amount: service.priceAmount, currency: service.currency, active: service.isPaid })
  if (data.seo) await upsertSeoRecord('service', service.id, data.seo)
  await audit('content.created', { type: 'Service', id: service.id }, auditCtx(p, ctx), { after: { slug, name: data.name, isPaid: data.isPaid } })
  return getById(service.id)
}

/** Met à jour un service (cms.write ou services.manage). */
export async function update(id: string, input: ServiceUpdateInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ServiceDetail> {
  const p = assertAny(principal, ['cms.write', 'services.manage'])
  const data = parseInput(serviceUpdateSchema, input)
  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Service', id)
  const isPaid = data.isPaid ?? existing.isPaid
  const priceAmount = data.priceAmount !== undefined ? data.priceAmount : existing.priceAmount
  if (isPaid && (!priceAmount || priceAmount <= 0)) {
    throw new PreconditionError('Un service payant doit avoir un tarif strictement positif', { fieldErrors: { priceAmount: ['Tarif requis'] } })
  }
  const slug = data.slug && data.slug !== existing.slug ? await resolveSlug(data.slug, existing.name, id) : existing.slug
  const description = data.description !== undefined ? sanitizeHtml(data.description) : existing.description
  const service = await prisma.service.update({
    where: { id },
    data: {
      slug,
      name: data.name,
      summary: data.summary !== undefined ? data.summary?.trim() || renderExcerpt(description) || null : undefined,
      description,
      conditions: data.conditions === undefined ? undefined : data.conditions ? sanitizeHtml(data.conditions) : null,
      icon: data.icon,
      categoryId: data.categoryId,
      isPaid,
      priceAmount: isPaid ? priceAmount : null,
      currency: data.currency,
      requiresAccount: data.requiresAccount,
      formSchema: toJson(data.formSchema),
      slaDays: data.slaDays,
      position: data.position,
    },
  })
  await syncStandardOffer('SERVICE', { serviceId: id }, { name: service.name, amount: service.priceAmount, currency: service.currency, active: service.isPaid })
  if (data.seo) await upsertSeoRecord('service', id, data.seo)
  await audit('content.updated', { type: 'Service', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, name: existing.name, isPaid: existing.isPaid, priceAmount: existing.priceAmount },
    after: { slug, name: service.name, isPaid: service.isPaid, priceAmount: service.priceAmount },
  })
  return getById(id)
}

/** Supprime un service sans demande associée (cms.publish ou services.manage). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertAny(principal, ['cms.publish', 'services.manage'])
  const existing = await prisma.service.findUnique({ where: { id }, include: { _count: { select: { requests: true } } } })
  if (!existing) throw new NotFoundError('Service', id)
  if (existing._count.requests > 0) {
    throw new PreconditionError('Ce service a des demandes associées : archivez-le plutôt que de le supprimer', {
      requests: existing._count.requests,
    })
  }
  await prisma.service.delete({ where: { id } })
  await audit('content.archived', { type: 'Service', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, name: existing.name, status: existing.status },
    after: { deleted: true },
  })
}

/** Réordonne les services selon l'ordre des identifiants (cms.write ou services.manage). */
export async function reorder(ids: string[], principal: Maybe<Principal>): Promise<void> {
  assertAny(principal, ['cms.write', 'services.manage'])
  await prisma.$transaction(ids.map((id, position) => prisma.service.update({ where: { id }, data: { position } })))
}

// -----------------------------------------------------------------------------
// Lecture publique
// -----------------------------------------------------------------------------

/** Services publiés, ordonnés par position, avec leurs offres actives. */
export async function listPublished(): Promise<ServiceCard[]> {
  return prisma.service.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    select: { ...cardSelect, offers: activeOffersInclude('SERVICE') },
  })
}

export type PublicService = ServiceDetail

/** Service publié par slug (description et conditions assainies, formulaire validé). */
export async function getPublished(slug: string): Promise<PublicService | null> {
  const service = await prisma.service.findFirst({ where: { slug, status: 'PUBLISHED' }, include: detailInclude })
  if (!service) return null
  return withForm({
    ...service,
    description: sanitizeHtml(service.description),
    conditions: service.conditions ? sanitizeHtml(service.conditions) : null,
  })
}

/** Slugs des services publiés (sitemap). */
export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  return prisma.service.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true }, orderBy: { position: 'asc' } })
}
