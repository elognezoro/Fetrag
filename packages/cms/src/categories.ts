// Catégories (actualités, ressources, cours, services, événements) : CRUD et lecteurs publics.
import { prisma, type Category, type Prisma } from '@fetrag/db'
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
import { assertAny, assertCan, auditCtx, contains, parseInput, type Maybe, type RequestContext } from './common'
import { categoryInputSchema, categoryKindSchema, categoryListQuerySchema, categoryUpdateSchema, type CategoryInput } from './schemas'
import type { z } from 'zod'

export type CategoryKind = z.infer<typeof categoryKindSchema>
export type CategoryListQuery = z.input<typeof categoryListQuerySchema>

export type CategoryWithCounts = Category & {
  counts: { articles: number; resources: number; courses: number; services: number; events: number }
}

const sortable = ['name', 'slug', 'position', 'createdAt', 'kind'] as const

const countInclude = { _count: { select: { articles: true, resources: true, courses: true, services: true, events: true } } } satisfies Prisma.CategoryInclude

function withCounts(row: Prisma.CategoryGetPayload<{ include: typeof countInclude }>): CategoryWithCounts {
  const { _count, ...category } = row
  return { ...category, counts: _count }
}

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.category.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

/** Liste paginée (lecture publique autorisée ; filtres kind + recherche, tri whitelisté). */
export async function list(query: CategoryListQuery = {}, _principal?: Maybe<Principal>): Promise<Paginated<CategoryWithCounts>> {
  const q = parseInput(categoryListQuerySchema, query)
  const where: Prisma.CategoryWhereInput = {
    ...(q.kind ? { kind: q.kind } : {}),
    ...(q.q ? { OR: [{ name: contains(q.q) }, { slug: contains(q.q) }] } : {}),
  }
  const [rows, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      ...paginationArgs(q),
      orderBy: q.sort ? safeOrderBy(q.sort, q.order, sortable, 'position') : [{ position: 'asc' }, { name: 'asc' }],
      include: countInclude,
    }),
    prisma.category.count({ where }),
  ])
  return toPaginated(rows.map(withCounts), total, q)
}

/** Catégorie par identifiant. */
export async function getById(id: string): Promise<CategoryWithCounts> {
  const row = await prisma.category.findUnique({ where: { id }, include: countInclude })
  if (!row) throw new NotFoundError('Catégorie', id)
  return withCounts(row)
}

/** Catégorie par slug (lecture publique). */
export async function getBySlug(slug: string): Promise<CategoryWithCounts | null> {
  const row = await prisma.category.findUnique({ where: { slug }, include: countInclude })
  return row ? withCounts(row) : null
}

/** Catégories d'un type, ordonnées par position, avec compteurs (lecture publique). */
export async function listActive(kind: CategoryKind = 'article'): Promise<CategoryWithCounts[]> {
  const k = parseInput(categoryKindSchema, kind)
  const rows = await prisma.category.findMany({ where: { kind: k }, orderBy: [{ position: 'asc' }, { name: 'asc' }], include: countInclude })
  return rows.map(withCounts)
}

/** Crée une catégorie (cms.write ; services.manage pour le type « service »). */
export async function create(input: CategoryInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<CategoryWithCounts> {
  const data = parseInput(categoryInputSchema, input)
  const p = assertAny(principal, data.kind === 'service' ? ['cms.write', 'services.manage'] : ['cms.write', 'course.author'])
  let slug: string
  if (data.slug) {
    if (await slugExists(data.slug, null)) throw new ConflictError('Ce slug est déjà utilisé', { slug: data.slug })
    slug = data.slug
  } else {
    slug = await uniqueSlug(data.name, (candidate) => slugExists(candidate, null))
  }
  const category = await prisma.category.create({
    data: { slug, name: data.name, description: data.description ?? null, color: data.color ?? null, kind: data.kind, position: data.position },
  })
  await audit('content.created', { type: 'Category', id: category.id }, auditCtx(p, ctx), { after: { slug, name: data.name, kind: data.kind } })
  return getById(category.id)
}

/** Met à jour une catégorie (cms.write). */
export async function update(
  id: string,
  input: z.input<typeof categoryUpdateSchema>,
  principal: Maybe<Principal>,
  ctx?: RequestContext,
): Promise<CategoryWithCounts> {
  const p = assertAny(principal, ['cms.write', 'services.manage', 'course.author'])
  const data = parseInput(categoryUpdateSchema, input)
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Catégorie', id)
  if (data.slug && data.slug !== existing.slug && (await slugExists(data.slug, id))) {
    throw new ConflictError('Ce slug est déjà utilisé', { slug: data.slug })
  }
  await prisma.category.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      color: data.color,
      kind: data.kind,
      position: data.position,
    },
  })
  await audit('content.updated', { type: 'Category', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, name: existing.name },
    after: { slug: data.slug ?? existing.slug, name: data.name ?? existing.name },
  })
  return getById(id)
}

/** Supprime une catégorie vide (cms.publish). Les contenus rattachés doivent être déplacés au préalable. */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.publish')
  const existing = await getById(id)
  const used = Object.values(existing.counts).reduce((sum, n) => sum + n, 0)
  if (used > 0) {
    throw new PreconditionError('Cette catégorie est encore utilisée par des contenus', { counts: existing.counts })
  }
  await prisma.category.delete({ where: { id } })
  await audit('content.archived', { type: 'Category', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, name: existing.name },
    after: { deleted: true },
  })
}

/** Réordonne des catégories (positions séquentielles selon l'ordre des identifiants fournis). */
export async function reorder(ids: string[], principal: Maybe<Principal>): Promise<void> {
  assertAny(principal, ['cms.write', 'services.manage'])
  await prisma.$transaction(ids.map((id, position) => prisma.category.update({ where: { id }, data: { position } })))
}
