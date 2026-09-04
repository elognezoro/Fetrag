// Partenaires, organisations affiliées et institutions : CRUD éditorial et lecteurs publics.
import { prisma, type Partner, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import { audit, can, ConflictError, NotFoundError, paginationArgs, safeOrderBy, toPaginated, uniqueSlug, type Principal } from '@fetrag/domain'
import { assertCan, auditCtx, contains, parseInput, type Maybe, type RequestContext } from './common'
import { partnerInputSchema, partnerKindSchema, partnerListQuerySchema, partnerUpdateSchema, type PartnerInput } from './schemas'
import type { z } from 'zod'

export type PartnerKind = z.infer<typeof partnerKindSchema>
export type PartnerListQuery = z.input<typeof partnerListQuerySchema>

const sortable = ['name', 'kind', 'position', 'createdAt', 'updatedAt', 'city'] as const

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.partner.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

/**
 * Liste paginée. Sans principal éditorial (cms.read_drafts), seuls les partenaires actifs sont renvoyés.
 */
export async function list(query: PartnerListQuery = {}, principal?: Maybe<Principal>): Promise<Paginated<Partner>> {
  const q = parseInput(partnerListQuerySchema, query)
  const editorial = can(principal, 'cms.read_drafts')
  const where: Prisma.PartnerWhereInput = {
    ...(editorial ? (q.isActive !== undefined ? { isActive: q.isActive } : {}) : { isActive: true }),
    ...(q.kind ? { kind: q.kind } : {}),
    ...(q.q ? { OR: [{ name: contains(q.q) }, { acronym: contains(q.q) }, { sector: contains(q.q) }, { city: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.partner.findMany({
      where,
      ...paginationArgs(q),
      orderBy: q.sort ? safeOrderBy(q.sort, q.order, sortable, 'position') : [{ position: 'asc' }, { name: 'asc' }],
    }),
    prisma.partner.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Partenaire par identifiant. */
export async function getById(id: string): Promise<Partner> {
  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) throw new NotFoundError('Partenaire', id)
  return partner
}

/** Partenaire actif par slug (lecture publique). */
export async function getBySlug(slug: string): Promise<Partner | null> {
  return prisma.partner.findFirst({ where: { slug, isActive: true } })
}

/** Partenaires actifs, éventuellement filtrés par type, ordonnés par position puis nom. */
export async function listActive(kind?: PartnerKind): Promise<Partner[]> {
  const k = kind ? parseInput(partnerKindSchema, kind) : undefined
  return prisma.partner.findMany({ where: { isActive: true, ...(k ? { kind: k } : {}) }, orderBy: [{ position: 'asc' }, { name: 'asc' }] })
}

/** Crée un partenaire (cms.write). */
export async function create(input: PartnerInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<Partner> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(partnerInputSchema, input)
  let slug: string
  if (data.slug) {
    if (await slugExists(data.slug, null)) throw new ConflictError('Ce slug est déjà utilisé', { slug: data.slug })
    slug = data.slug
  } else {
    slug = await uniqueSlug(data.acronym ?? data.name, (candidate) => slugExists(candidate, null))
  }
  const partner = await prisma.partner.create({
    data: {
      slug,
      name: data.name,
      acronym: data.acronym ?? null,
      kind: data.kind,
      sector: data.sector ?? null,
      description: data.description ?? null,
      logoUrl: data.logoUrl ?? null,
      website: data.website ?? null,
      city: data.city ?? null,
      country: data.country,
      position: data.position,
      isActive: data.isActive,
    },
  })
  await audit('content.created', { type: 'Partner', id: partner.id }, auditCtx(p, ctx), { after: { slug, name: data.name, kind: data.kind } })
  return partner
}

/** Met à jour un partenaire (cms.write). */
export async function update(
  id: string,
  input: z.input<typeof partnerUpdateSchema>,
  principal: Maybe<Principal>,
  ctx?: RequestContext,
): Promise<Partner> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(partnerUpdateSchema, input)
  const existing = await getById(id)
  if (data.slug && data.slug !== existing.slug && (await slugExists(data.slug, id))) {
    throw new ConflictError('Ce slug est déjà utilisé', { slug: data.slug })
  }
  const partner = await prisma.partner.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      acronym: data.acronym,
      kind: data.kind,
      sector: data.sector,
      description: data.description,
      logoUrl: data.logoUrl,
      website: data.website,
      city: data.city,
      country: data.country,
      position: data.position,
      isActive: data.isActive,
    },
  })
  await audit('content.updated', { type: 'Partner', id }, auditCtx(p, ctx), {
    before: { name: existing.name, isActive: existing.isActive },
    after: { name: partner.name, isActive: partner.isActive },
  })
  return partner
}

/** Supprime un partenaire (cms.publish). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.publish')
  const existing = await getById(id)
  await prisma.partner.delete({ where: { id } })
  await audit('content.archived', { type: 'Partner', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, name: existing.name },
    after: { deleted: true },
  })
}

/** Réordonne les partenaires selon l'ordre des identifiants fournis (cms.write). */
export async function reorder(ids: string[], principal: Maybe<Principal>): Promise<void> {
  assertCan(principal, 'cms.write')
  await prisma.$transaction(ids.map((id, position) => prisma.partner.update({ where: { id }, data: { position } })))
}
