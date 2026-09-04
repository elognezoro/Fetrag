// Pages institutionnelles : CRUD avec révisions automatiques, lecteur public et prévisualisation.
import { prisma, type Prisma, type SeoRecord } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import {
  audit,
  can,
  ConflictError,
  NotFoundError,
  paginationArgs,
  safeOrderBy,
  toPaginated,
  uniqueSlug,
  type Principal,
} from '@fetrag/domain'
import {
  adminListQuerySchema,
  assertCan,
  auditCtx,
  contains,
  parseInput,
  toJson,
  type AdminListQuery,
  type Maybe,
  type RequestContext,
} from './common'
import { renderExcerpt, sanitizeHtml } from './sanitize'
import { pageBlocksSchema, pageInputSchema, pageUpdateSchema, type PageBlocks, type PageInput, type PageUpdateInput } from './schemas'
import { upsertRecord as upsertSeoRecord } from './seo'

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  template: true,
  status: true,
  locale: true,
  publishedAt: true,
  scheduledAt: true,
  version: true,
  showInSitemap: true,
  coverImageUrl: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PageSelect

export type PageListItem = Prisma.PageGetPayload<{ select: typeof listSelect }>

const detailInclude = {
  author: { select: { id: true, name: true, email: true } },
  seo: true,
  _count: { select: { revisions: true } },
} satisfies Prisma.PageInclude

export type PageDetail = Omit<Prisma.PageGetPayload<{ include: typeof detailInclude }>, 'blocks'> & { blocks: PageBlocks | null }

/** Page prête pour le rendu public (contenu assaini, blocs validés). */
export interface PublicPage {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  blocks: PageBlocks | null
  template: string
  locale: string
  status: string
  coverImageUrl: string | null
  publishedAt: Date | null
  updatedAt: Date
  version: number
  /** Vrai lorsqu'un contenu non publié est affiché en prévisualisation. */
  isPreview: boolean
  seo: SeoRecord | null
  author: { name: string | null } | null
}

const sortable = ['title', 'slug', 'updatedAt', 'createdAt', 'publishedAt', 'status'] as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Valide les blocs JSON stockés ; renvoie null (et journalise) si le format est invalide. */
export function parseBlocks(value: unknown): PageBlocks | null {
  if (value === null || value === undefined) return null
  const parsed = pageBlocksSchema.safeParse(value)
  if (parsed.success) return parsed.data
  console.warn('[cms] blocs de page invalides ignorés', parsed.error.issues.slice(0, 3))
  return null
}

/** Assainit les champs HTML contenus dans les blocs (richtext, FAQ, biographies). */
export function sanitizeBlocks(blocks: PageBlocks): PageBlocks {
  return blocks.map((block) => {
    switch (block.type) {
      case 'richtext':
        return { ...block, html: sanitizeHtml(block.html) }
      case 'faq':
        return { ...block, items: block.items?.map((item) => ({ ...item, answer: sanitizeHtml(item.answer) })) }
      case 'people':
        return {
          ...block,
          items: block.items.map((item) => ({ ...item, bio: item.bio === undefined ? undefined : sanitizeHtml(item.bio) })),
        }
      default:
        return block
    }
  })
}

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.page.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

/** Slug explicite (doit être libre) ou dérivé du titre (suffixé si nécessaire). */
async function resolveSlug(explicit: string | undefined, title: string, excludeId: string | null): Promise<string> {
  if (explicit) {
    if (await slugExists(explicit, excludeId)) throw new ConflictError('Ce slug est déjà utilisé', { slug: explicit })
    return explicit
  }
  return uniqueSlug(title, (candidate) => slugExists(candidate, excludeId))
}

function withBlocks<T extends { blocks: unknown }>(page: T): Omit<T, 'blocks'> & { blocks: PageBlocks | null } {
  return { ...page, blocks: parseBlocks(page.blocks) }
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

/** Liste d'administration paginée (cms.read_drafts) : recherche, statut, tri whitelisté. */
export async function list(query: AdminListQuery, principal: Maybe<Principal>): Promise<Paginated<PageListItem>> {
  assertCan(principal, 'cms.read_drafts')
  const q = parseInput(adminListQuerySchema, query)
  const where: Prisma.PageWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.q ? { OR: [{ title: contains(q.q) }, { slug: contains(q.q) }, { excerpt: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.page.findMany({ where, ...paginationArgs(q), orderBy: safeOrderBy(q.sort, q.order, sortable, 'updatedAt'), select: listSelect }),
    prisma.page.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/**
 * Page par identifiant (auteur, SEO, nombre de révisions).
 * Si un principal est fourni, les contenus non publiés exigent cms.read_drafts.
 */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<PageDetail> {
  const page = await prisma.page.findUnique({ where: { id }, include: detailInclude })
  if (!page) throw new NotFoundError('Page', id)
  if (principal !== undefined && page.status !== 'PUBLISHED') assertCan(principal, 'cms.read_drafts')
  return withBlocks(page)
}

/** Crée une page (cms.write) avec sa première révision. */
export async function create(input: PageInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<PageDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(pageInputSchema, input)
  const slug = await resolveSlug(data.slug, data.title, null)
  const content = sanitizeHtml(data.content)
  const blocks = data.blocks ? sanitizeBlocks(data.blocks) : (data.blocks ?? null)
  const excerptText = data.excerpt?.trim() || renderExcerpt(content) || null

  const page = await prisma.page.create({
    data: {
      slug,
      title: data.title,
      excerpt: excerptText,
      content,
      blocks: toJson(blocks),
      template: data.template,
      locale: data.locale,
      coverImageUrl: data.coverImageUrl ?? null,
      showInSitemap: data.showInSitemap,
      scheduledAt: data.scheduledAt ?? null,
      authorId: p.id,
      version: 1,
      revisions: { create: { version: 1, title: data.title, content, blocks: toJson(blocks), editedBy: p.id } },
    },
  })
  if (data.seo) await upsertSeoRecord('page', page.id, data.seo)
  await audit('content.created', { type: 'Page', id: page.id }, auditCtx(p, ctx), {
    after: { slug, title: data.title, status: page.status, version: 1 },
  })
  return getById(page.id)
}

/** Met à jour une page (cms.write) ; toute modification de titre/contenu/blocs crée une révision. */
export async function update(id: string, input: PageUpdateInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<PageDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(pageUpdateSchema, input)
  const existing = await prisma.page.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Page', id)

  const slug = data.slug && data.slug !== existing.slug ? await resolveSlug(data.slug, existing.title, id) : existing.slug
  const title = data.title ?? existing.title
  const content = data.content !== undefined ? sanitizeHtml(data.content) : existing.content
  const blocks: PageBlocks | null | undefined = data.blocks === undefined ? undefined : data.blocks === null ? null : sanitizeBlocks(data.blocks)
  const blocksChanged = blocks !== undefined && JSON.stringify(blocks) !== JSON.stringify(existing.blocks ?? null)
  const revisionNeeded = title !== existing.title || content !== existing.content || blocksChanged
  const version = revisionNeeded ? existing.version + 1 : existing.version
  const excerptText =
    data.excerpt !== undefined ? data.excerpt?.trim() || renderExcerpt(content) || null : existing.excerpt ?? (renderExcerpt(content) || null)

  await prisma.page.update({
    where: { id },
    data: {
      slug,
      title,
      excerpt: excerptText,
      content,
      blocks: toJson(blocks),
      template: data.template,
      locale: data.locale,
      coverImageUrl: data.coverImageUrl,
      showInSitemap: data.showInSitemap,
      scheduledAt: data.scheduledAt,
      version,
      ...(revisionNeeded
        ? {
            revisions: {
              create: {
                version,
                title,
                content,
                blocks: toJson(blocks === undefined ? existing.blocks : blocks),
                editedBy: p.id,
              },
            },
          }
        : {}),
    },
  })
  if (data.seo) await upsertSeoRecord('page', id, data.seo)
  await audit('content.updated', { type: 'Page', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title, version: existing.version },
    after: { slug, title, version },
  })
  return getById(id)
}

/** Supprime une page et ses révisions (cms.write ; cms.publish si elle est publiée). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.write')
  const existing = await prisma.page.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true } })
  if (!existing) throw new NotFoundError('Page', id)
  if (existing.status === 'PUBLISHED') assertCan(p, 'cms.publish')
  await prisma.page.delete({ where: { id } })
  await audit('content.archived', { type: 'Page', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title, status: existing.status },
    after: { deleted: true },
  })
}

// -----------------------------------------------------------------------------
// Lecture publique
// -----------------------------------------------------------------------------

/**
 * Page publiée par slug. En mode `preview`, un principal disposant de cms.read_drafts
 * voit aussi les brouillons, relectures et contenus planifiés (marqués `isPreview`).
 */
export async function getPublished(
  slug: string,
  options: { preview?: boolean; principal?: Maybe<Principal> } = {},
): Promise<PublicPage | null> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { seo: true, author: { select: { name: true } } },
  })
  if (!page) return null
  const now = Date.now()
  const published = page.status === 'PUBLISHED' && (!page.publishedAt || page.publishedAt.getTime() <= now)
  if (!published && !(options.preview && can(options.principal, 'cms.read_drafts'))) return null
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: sanitizeHtml(page.content),
    blocks: parseBlocks(page.blocks),
    template: page.template,
    locale: page.locale,
    status: page.status,
    coverImageUrl: page.coverImageUrl,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    version: page.version,
    isPreview: !published,
    seo: page.seo,
    author: page.author,
  }
}

/** Slugs des pages publiées à inclure dans le sitemap. */
export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }>> {
  return prisma.page.findMany({
    where: { status: 'PUBLISHED', showInSitemap: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}
