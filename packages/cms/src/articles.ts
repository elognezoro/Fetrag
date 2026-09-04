// Actualités et communiqués : CRUD éditorial, lecteurs publics, articles liés, temps de lecture.
import { prisma, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import {
  audit,
  ConflictError,
  NotFoundError,
  paginationArgs,
  readingTimeMinutes,
  safeOrderBy,
  toPaginated,
  uniqueSlug,
  type Principal,
} from '@fetrag/domain'
import { assertCan, auditCtx, contains, normalizeTags, parseInput, type Maybe, type RequestContext } from './common'
import { renderExcerpt, sanitizeHtml } from './sanitize'
import {
  articleInputSchema,
  articleListQuerySchema,
  articleUpdateSchema,
  publicArticleQuerySchema,
  type ArticleInput,
  type ArticleListQuery,
  type ArticleUpdateInput,
  type PublicArticleQuery,
} from './schemas'
import { upsertRecord as upsertSeoRecord } from './seo'

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const categorySelect = { select: { id: true, slug: true, name: true, color: true } } as const

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  coverAlt: true,
  isCommunique: true,
  isFeatured: true,
  locale: true,
  tags: true,
  readingTime: true,
  publishedAt: true,
  updatedAt: true,
  category: categorySelect,
} satisfies Prisma.ArticleSelect

export type ArticleCard = Prisma.ArticleGetPayload<{ select: typeof cardSelect }>

const adminSelect = {
  ...cardSelect,
  status: true,
  scheduledAt: true,
  viewCount: true,
  createdAt: true,
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ArticleSelect

export type ArticleListItem = Prisma.ArticleGetPayload<{ select: typeof adminSelect }>

const detailInclude = {
  category: categorySelect,
  author: { select: { id: true, name: true, email: true } },
  seo: true,
} satisfies Prisma.ArticleInclude

export type ArticleDetail = Prisma.ArticleGetPayload<{ include: typeof detailInclude }>

const sortable = ['title', 'slug', 'updatedAt', 'createdAt', 'publishedAt', 'status', 'viewCount'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.article.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

async function resolveSlug(explicit: string | undefined, title: string, excludeId: string | null): Promise<string> {
  if (explicit) {
    if (await slugExists(explicit, excludeId)) throw new ConflictError('Ce slug est déjà utilisé', { slug: explicit })
    return explicit
  }
  return uniqueSlug(title, (candidate) => slugExists(candidate, excludeId))
}

function publishedWhere(now = new Date()): Prisma.ArticleWhereInput {
  return { status: 'PUBLISHED', OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

/** Liste d'administration paginée (cms.read_drafts) : recherche, statut, catégorie, tag, tri. */
export async function list(query: ArticleListQuery, principal: Maybe<Principal>): Promise<Paginated<ArticleListItem>> {
  assertCan(principal, 'cms.read_drafts')
  const q = parseInput(articleListQuerySchema, query)
  const where: Prisma.ArticleWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.isCommunique !== undefined ? { isCommunique: q.isCommunique } : {}),
    ...(q.isFeatured !== undefined ? { isFeatured: q.isFeatured } : {}),
    ...(q.tag ? { tags: { has: q.tag } } : {}),
    ...(q.q ? { OR: [{ title: contains(q.q) }, { slug: contains(q.q) }, { excerpt: contains(q.q) }, { tags: { has: q.q } }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      ...paginationArgs(q),
      orderBy: safeOrderBy(q.sort, q.order, sortable, 'updatedAt'),
      select: adminSelect,
    }),
    prisma.article.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Article par identifiant ; les contenus non publiés exigent cms.read_drafts si un principal est fourni. */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<ArticleDetail> {
  const article = await prisma.article.findUnique({ where: { id }, include: detailInclude })
  if (!article) throw new NotFoundError('Article', id)
  if (principal !== undefined && article.status !== 'PUBLISHED') assertCan(principal, 'cms.read_drafts')
  return article
}

/** Crée un article (cms.write) : contenu assaini, extrait et temps de lecture calculés. */
export async function create(input: ArticleInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ArticleDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(articleInputSchema, input)
  const slug = await resolveSlug(data.slug, data.title, null)
  const content = sanitizeHtml(data.content)
  const article = await prisma.article.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt?.trim() || renderExcerpt(content) || null,
      content,
      coverImageUrl: data.coverImageUrl ?? null,
      coverAlt: data.coverAlt ?? null,
      categoryId: data.categoryId ?? null,
      authorId: p.id,
      isCommunique: data.isCommunique,
      isFeatured: data.isFeatured,
      locale: data.locale,
      tags: normalizeTags(data.tags),
      readingTime: readingTimeMinutes(content),
      scheduledAt: data.scheduledAt ?? null,
    },
  })
  if (data.seo) await upsertSeoRecord('article', article.id, data.seo)
  await audit('content.created', { type: 'Article', id: article.id }, auditCtx(p, ctx), {
    after: { slug, title: data.title, status: article.status },
  })
  return getById(article.id)
}

/** Met à jour un article (cms.write). */
export async function update(id: string, input: ArticleUpdateInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ArticleDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(articleUpdateSchema, input)
  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Article', id)

  const slug = data.slug && data.slug !== existing.slug ? await resolveSlug(data.slug, existing.title, id) : existing.slug
  const content = data.content !== undefined ? sanitizeHtml(data.content) : existing.content
  const excerptText =
    data.excerpt !== undefined ? data.excerpt?.trim() || renderExcerpt(content) || null : existing.excerpt ?? (renderExcerpt(content) || null)

  await prisma.article.update({
    where: { id },
    data: {
      slug,
      title: data.title,
      excerpt: excerptText,
      content,
      coverImageUrl: data.coverImageUrl,
      coverAlt: data.coverAlt,
      categoryId: data.categoryId,
      isCommunique: data.isCommunique,
      isFeatured: data.isFeatured,
      locale: data.locale,
      tags: data.tags !== undefined ? normalizeTags(data.tags) : undefined,
      readingTime: data.content !== undefined ? readingTimeMinutes(content) : undefined,
      scheduledAt: data.scheduledAt,
    },
  })
  if (data.seo) await upsertSeoRecord('article', id, data.seo)
  await audit('content.updated', { type: 'Article', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title },
    after: { slug, title: data.title ?? existing.title },
  })
  return getById(id)
}

/** Supprime un article (cms.write ; cms.publish s'il est publié). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.write')
  const existing = await prisma.article.findUnique({ where: { id }, select: { slug: true, title: true, status: true } })
  if (!existing) throw new NotFoundError('Article', id)
  if (existing.status === 'PUBLISHED') assertCan(p, 'cms.publish')
  await prisma.article.delete({ where: { id } })
  await audit('content.archived', { type: 'Article', id }, auditCtx(p, ctx), { before: existing, after: { deleted: true } })
}

// -----------------------------------------------------------------------------
// Lecture publique
// -----------------------------------------------------------------------------

/** Actualités publiées, paginées : catégorie, tag, recherche, communiqués, à la une. */
export async function listPublished(query: PublicArticleQuery = {}): Promise<Paginated<ArticleCard>> {
  const q = parseInput(publicArticleQuerySchema, query)
  const where: Prisma.ArticleWhereInput = {
    AND: [
      publishedWhere(),
      q.categorySlug ? { category: { slug: q.categorySlug } } : {},
      q.tag ? { tags: { has: q.tag } } : {},
      q.communique !== undefined ? { isCommunique: q.communique } : {},
      q.featured !== undefined ? { isFeatured: q.featured } : {},
      q.q ? { OR: [{ title: contains(q.q) }, { excerpt: contains(q.q) }, { content: contains(q.q) }, { tags: { has: q.q } }] } : {},
    ],
  }
  const [items, total] = await prisma.$transaction([
    prisma.article.findMany({ where, ...paginationArgs(q), orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], select: cardSelect }),
    prisma.article.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Articles à la une (publiés), pour la page d'accueil. */
export async function listFeatured(limit = 3): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), isFeatured: true },
    orderBy: { publishedAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 12),
    select: cardSelect,
  })
}

export type PublicArticle = ArticleDetail & { content: string }

/** Article publié par slug ; incrémente le compteur de vues. Null si absent ou non publié. */
export async function getPublished(slug: string): Promise<PublicArticle | null> {
  const article = await prisma.article.findFirst({ where: { slug, ...publishedWhere() }, include: detailInclude })
  if (!article) return null
  await prisma.article.updateMany({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch((error: unknown) => {
    console.error('[cms] incrément des vues impossible', article.id, error)
  })
  return { ...article, content: sanitizeHtml(article.content), viewCount: article.viewCount + 1 }
}

/** Articles liés : même catégorie (puis les plus récents), publiés, hors article courant. */
export async function related(id: string, limit = 3): Promise<ArticleCard[]> {
  const source = await prisma.article.findUnique({ where: { id }, select: { categoryId: true, tags: true } })
  if (!source) return []
  const take = Math.min(Math.max(limit, 1), 12)
  const base: Prisma.ArticleWhereInput = { ...publishedWhere(), id: { not: id } }
  const primary = source.categoryId
    ? await prisma.article.findMany({ where: { ...base, categoryId: source.categoryId }, orderBy: { publishedAt: 'desc' }, take, select: cardSelect })
    : []
  if (primary.length >= take) return primary
  const excluded = [id, ...primary.map((a) => a.id)]
  const fallback = await prisma.article.findMany({
    where: { ...publishedWhere(), id: { notIn: excluded } },
    orderBy: { publishedAt: 'desc' },
    take: take - primary.length,
    select: cardSelect,
  })
  return [...primary, ...fallback]
}

/** Tags les plus utilisés parmi les articles publiés. */
export async function listTags(limit = 30): Promise<Array<{ tag: string; count: number }>> {
  const rows = await prisma.article.findMany({ where: publishedWhere(), select: { tags: true } })
  const counts = new Map<string, number>()
  for (const row of rows) for (const tag of row.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'fr'))
    .slice(0, Math.max(1, limit))
}

/** Slugs des articles publiés (sitemap). */
export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }>> {
  return prisma.article.findMany({
    where: publishedWhere(),
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  })
}
