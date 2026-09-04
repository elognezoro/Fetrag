// Bibliothèque documentaire (WEB-12) : niveaux d'accès PUBLIC / MEMBER / ORGANIZATION / PREMIUM,
// téléchargement signé pour les fichiers privés, CRUD éditorial.
import { prisma, type AccessLevel, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import {
  audit,
  ConflictError,
  DomainError,
  ForbiddenError,
  hasGlobalRole,
  isSuperAdmin,
  NotFoundError,
  paginationArgs,
  PreconditionError,
  safeOrderBy,
  toPaginated,
  UnauthenticatedError,
  uniqueSlug,
  type Principal,
} from '@fetrag/domain'
import { assertCan, auditCtx, contains, normalizeTags, parseInput, type Maybe, type RequestContext } from './common'
import { activeOffersInclude, findActiveOffer, syncStandardOffer, type OfferSummary } from './offers'
import { isStorageKey, trySignedUrl } from './platform'
import {
  publicResourceQuerySchema,
  resourceInputSchema,
  resourceListQuerySchema,
  resourceUpdateSchema,
  type PublicResourceQuery,
  type ResourceInput,
  type ResourceListQuery,
  type ResourceUpdateInput,
} from './schemas'

// -----------------------------------------------------------------------------
// Sélections et types
// -----------------------------------------------------------------------------

const categorySelect = { select: { id: true, slug: true, name: true, color: true } } as const
const organizationSelect = { select: { id: true, slug: true, name: true, acronym: true } } as const

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  kind: true,
  accessLevel: true,
  organizationId: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  previewUrl: true,
  language: true,
  source: true,
  authorName: true,
  publishedOn: true,
  keywords: true,
  downloadCount: true,
  isPremium: true,
  createdAt: true,
  updatedAt: true,
  category: categorySelect,
  organization: organizationSelect,
} satisfies Prisma.ResourceSelect

export type ResourceCard = Prisma.ResourceGetPayload<{ select: typeof cardSelect }>

/** Ressource publique enrichie du droit d'accès du visiteur et du lien de téléchargement. */
export type PublicResource = ResourceCard & {
  accessible: boolean
  href: string | null
  hasFile: boolean
  isExternal: boolean
  offer: OfferSummary | null
}

const adminSelect = {
  ...cardSelect,
  status: true,
  fileUrl: true,
  externalUrl: true,
  categoryId: true,
} satisfies Prisma.ResourceSelect

export type ResourceListItem = Prisma.ResourceGetPayload<{ select: typeof adminSelect }>

const detailInclude = {
  category: categorySelect,
  organization: organizationSelect,
  offers: activeOffersInclude('RESOURCE'),
} satisfies Prisma.ResourceInclude

export type ResourceDetail = Prisma.ResourceGetPayload<{ include: typeof detailInclude }>

/** Champs minimaux nécessaires à la décision d'accès. */
export interface AccessSubject {
  id: string
  accessLevel: AccessLevel
  organizationId: string | null
}

const sortable = ['title', 'slug', 'kind', 'accessLevel', 'status', 'downloadCount', 'publishedOn', 'createdAt', 'updatedAt'] as const
const SIGNED_URL_TTL = 900

// -----------------------------------------------------------------------------
// Décision d'accès
// -----------------------------------------------------------------------------

/** Rôles disposant de tous les documents (éditorial, coordination, finance, services, support). */
function isPrivileged(principal: Principal): boolean {
  return isSuperAdmin(principal) || hasGlobalRole(principal, 'EDITOR', 'COORDINATOR', 'FINANCE', 'SERVICES_MANAGER', 'SUPPORT')
}

/**
 * Calcule l'accessibilité d'un lot de ressources pour un visiteur, en une seule requête
 * pour les ressources PREMIUM (commande PAID d'une offre liée).
 */
export async function accessMap(resources: AccessSubject[], principal?: Maybe<Principal>): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>()
  const privileged = principal ? isPrivileged(principal) : false
  const premiumIds = resources.filter((r) => r.accessLevel === 'PREMIUM').map((r) => r.id)
  let paid = new Set<string>()
  if (principal && !privileged && premiumIds.length > 0) {
    const lines = await prisma.orderLine.findMany({
      where: {
        offer: { resourceId: { in: premiumIds } },
        order: { userId: principal.id, status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } },
      },
      select: { offer: { select: { resourceId: true } } },
    })
    paid = new Set(lines.map((l) => l.offer?.resourceId).filter((v): v is string => Boolean(v)))
  }
  for (const r of resources) {
    let ok: boolean
    switch (r.accessLevel) {
      case 'PUBLIC':
        ok = true
        break
      case 'MEMBER':
        ok = Boolean(principal)
        break
      case 'ORGANIZATION':
        ok =
          privileged ||
          Boolean(
            principal && (r.organizationId ? principal.organizationIds.includes(r.organizationId) : principal.organizationIds.length > 0),
          )
        break
      case 'PREMIUM':
        ok = privileged || paid.has(r.id)
        break
    }
    result.set(r.id, ok)
  }
  return result
}

/** Décision d'accès pour une ressource et un visiteur (anonyme si absent). */
export async function canAccess(resource: AccessSubject, principal?: Maybe<Principal>): Promise<boolean> {
  const map = await accessMap([resource], principal)
  return map.get(resource.id) ?? false
}

/** Lien de téléchargement : URL signée pour une clé privée, sinon URL publique ou externe. */
async function resolveHref(resource: { fileUrl: string | null; externalUrl: string | null }): Promise<string | null> {
  if (resource.fileUrl) {
    if (isStorageKey(resource.fileUrl)) return trySignedUrl(resource.fileUrl, SIGNED_URL_TTL)
    return resource.fileUrl
  }
  return resource.externalUrl ?? null
}

function publishedWhere(principal?: Maybe<Principal>): Prisma.ResourceWhereInput {
  const privileged = principal ? isPrivileged(principal) : false
  if (privileged) return { status: 'PUBLISHED' }
  const orgIds = principal?.organizationIds ?? []
  return {
    status: 'PUBLISHED',
    OR: [{ accessLevel: { not: 'ORGANIZATION' } }, { organizationId: null }, ...(orgIds.length ? [{ organizationId: { in: orgIds } }] : [])],
  }
}

async function toPublic(
  rows: Array<ResourceCard & { fileUrl: string | null; externalUrl: string | null }>,
  principal?: Maybe<Principal>,
): Promise<PublicResource[]> {
  const access = await accessMap(rows, principal)
  const premiumIds = rows.filter((r) => r.accessLevel === 'PREMIUM').map((r) => r.id)
  const offers = premiumIds.length
    ? await prisma.offer.findMany({
        where: { resourceId: { in: premiumIds }, kind: 'RESOURCE', isActive: true },
        orderBy: [{ tier: 'asc' }, { amount: 'asc' }],
        select: { ...activeOffersInclude('RESOURCE').select, resourceId: true },
      })
    : []
  const offerByResource = new Map<string, OfferSummary>()
  for (const offer of offers) {
    if (offer.resourceId && !offerByResource.has(offer.resourceId)) {
      const { resourceId: _ignored, ...summary } = offer
      offerByResource.set(offer.resourceId, summary)
    }
  }
  return Promise.all(
    rows.map(async ({ fileUrl, externalUrl, ...card }) => {
      const accessible = access.get(card.id) ?? false
      return {
        ...card,
        accessible,
        href: accessible ? await resolveHref({ fileUrl, externalUrl }) : null,
        hasFile: Boolean(fileUrl || externalUrl),
        isExternal: Boolean(externalUrl && !fileUrl),
        offer: offerByResource.get(card.id) ?? null,
      }
    }),
  )
}

// -----------------------------------------------------------------------------
// Lecture publique
// -----------------------------------------------------------------------------

/** Ressources publiées avec droit d'accès et lien de téléchargement pour le visiteur. */
export async function listPublished(query: PublicResourceQuery = {}, principal?: Maybe<Principal>): Promise<Paginated<PublicResource>> {
  const q = parseInput(publicResourceQuerySchema, query)
  const where: Prisma.ResourceWhereInput = {
    AND: [
      publishedWhere(principal),
      q.kind ? { kind: q.kind } : {},
      q.accessLevel ? { accessLevel: q.accessLevel } : {},
      q.categorySlug ? { category: { slug: q.categorySlug } } : {},
      q.organizationId ? { organizationId: q.organizationId } : {},
      q.q
        ? { OR: [{ title: contains(q.q) }, { summary: contains(q.q) }, { authorName: contains(q.q) }, { source: contains(q.q) }, { keywords: { has: q.q } }] }
        : {},
    ],
  }
  const [rows, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,
      ...paginationArgs(q),
      orderBy: [{ publishedOn: 'desc' }, { createdAt: 'desc' }],
      select: { ...cardSelect, fileUrl: true, externalUrl: true },
    }),
    prisma.resource.count({ where }),
  ])
  return toPaginated(await toPublic(rows, principal), total, q)
}

/** Ressource publiée par slug (null si absente, non publiée ou réservée à une autre organisation). */
export async function getPublished(slug: string, principal?: Maybe<Principal>): Promise<PublicResource | null> {
  const row = await prisma.resource.findFirst({
    where: { slug, ...publishedWhere(principal) },
    select: { ...cardSelect, fileUrl: true, externalUrl: true },
  })
  if (!row) return null
  const [item] = await toPublic([row], principal)
  return item ?? null
}

export interface DownloadResult {
  url: string
  fileName: string | null
  mimeType: string | null
  fileSize: number | null
  isExternal: boolean
}

/**
 * Autorise le téléchargement d'une ressource publiée, incrémente le compteur et renvoie l'URL
 * (signée pour un fichier privé). Erreurs : UNAUTHENTICATED (connexion requise),
 * PAYMENT_REQUIRED (premium non acheté, `offerId` en détail), FORBIDDEN (organisation).
 */
export async function download(id: string, principal?: Maybe<Principal>, ctx?: RequestContext): Promise<DownloadResult> {
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource || resource.status !== 'PUBLISHED') throw new NotFoundError('Ressource', id)
  const accessible = await canAccess(resource, principal)
  if (!accessible) {
    if (!principal) throw new UnauthenticatedError('Connectez-vous pour accéder à cette ressource')
    if (resource.accessLevel === 'PREMIUM') {
      const offer = await findActiveOffer({ resourceId: id })
      throw new DomainError('PAYMENT_REQUIRED', 'Cette ressource est réservée aux acheteurs', {
        offerId: offer?.id ?? null,
        amount: offer?.amount ?? null,
        currency: offer?.currency ?? 'XAF',
      })
    }
    throw new ForbiddenError('Cette ressource est réservée aux membres de son organisation')
  }
  const url = await resolveHref(resource)
  if (!url) throw new PreconditionError('Aucun fichier n’est associé à cette ressource')
  await prisma.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch((error: unknown) => {
    console.error('[cms] incrément des téléchargements impossible', id, error)
  })
  if (ctx?.correlationId) {
    // Trace légère pour l'analyse d'usage (sans données personnelles).
    console.info('[cms] téléchargement', { resourceId: id, correlationId: ctx.correlationId })
  }
  return { url, fileName: resource.fileName, mimeType: resource.mimeType, fileSize: resource.fileSize, isExternal: Boolean(resource.externalUrl && !resource.fileUrl) }
}

/** Slugs des ressources publiques publiées (sitemap). */
export async function listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
  return prisma.resource.findMany({
    where: { status: 'PUBLISHED', accessLevel: 'PUBLIC' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

async function slugExists(slug: string, excludeId: string | null): Promise<boolean> {
  const found = await prisma.resource.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })
  return Boolean(found)
}

async function resolveSlug(explicit: string | undefined, title: string, excludeId: string | null): Promise<string> {
  if (explicit) {
    if (await slugExists(explicit, excludeId)) throw new ConflictError('Ce slug est déjà utilisé', { slug: explicit })
    return explicit
  }
  return uniqueSlug(title, (candidate) => slugExists(candidate, excludeId))
}

/** Liste d'administration paginée (cms.read_drafts). */
export async function list(query: ResourceListQuery, principal: Maybe<Principal>): Promise<Paginated<ResourceListItem>> {
  assertCan(principal, 'cms.read_drafts')
  const q = parseInput(resourceListQuerySchema, query)
  const where: Prisma.ResourceWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.kind ? { kind: q.kind } : {}),
    ...(q.accessLevel ? { accessLevel: q.accessLevel } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.organizationId ? { organizationId: q.organizationId } : {}),
    ...(q.q ? { OR: [{ title: contains(q.q) }, { slug: contains(q.q) }, { summary: contains(q.q) }, { fileName: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.resource.findMany({ where, ...paginationArgs(q), orderBy: safeOrderBy(q.sort, q.order, sortable, 'updatedAt'), select: adminSelect }),
    prisma.resource.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Ressource par identifiant (offres actives incluses) ; brouillons réservés aux rôles éditoriaux si un principal est fourni. */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<ResourceDetail> {
  const resource = await prisma.resource.findUnique({ where: { id }, include: detailInclude })
  if (!resource) throw new NotFoundError('Ressource', id)
  if (principal !== undefined && resource.status !== 'PUBLISHED') assertCan(principal, 'cms.read_drafts')
  return resource
}

/** Crée une ressource (cms.write). Une ressource PREMIUM avec `priceAmount` obtient une offre STANDARD. */
export async function create(input: ResourceInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ResourceDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(resourceInputSchema, input)
  const slug = await resolveSlug(data.slug, data.title, null)
  const resource = await prisma.resource.create({
    data: {
      slug,
      title: data.title,
      summary: data.summary ?? null,
      kind: data.kind,
      categoryId: data.categoryId ?? null,
      organizationId: data.organizationId ?? null,
      accessLevel: data.accessLevel,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      mimeType: data.mimeType ?? null,
      previewUrl: data.previewUrl ?? null,
      externalUrl: data.externalUrl ?? null,
      language: data.language,
      source: data.source ?? null,
      authorName: data.authorName ?? null,
      publishedOn: data.publishedOn ?? null,
      keywords: normalizeTags(data.keywords),
      isPremium: data.accessLevel === 'PREMIUM',
    },
  })
  await syncStandardOffer(
    'RESOURCE',
    { resourceId: resource.id },
    { name: resource.title, amount: data.priceAmount, currency: data.currency, active: resource.accessLevel === 'PREMIUM' },
  )
  await audit('content.created', { type: 'Resource', id: resource.id }, auditCtx(p, ctx), {
    after: { slug, title: data.title, accessLevel: data.accessLevel },
  })
  return getById(resource.id)
}

/** Met à jour une ressource (cms.write). */
export async function update(id: string, input: ResourceUpdateInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<ResourceDetail> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(resourceUpdateSchema, input)
  const existing = await prisma.resource.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Ressource', id)
  const slug = data.slug && data.slug !== existing.slug ? await resolveSlug(data.slug, existing.title, id) : existing.slug
  const accessLevel = data.accessLevel ?? existing.accessLevel
  const resource = await prisma.resource.update({
    where: { id },
    data: {
      slug,
      title: data.title,
      summary: data.summary,
      kind: data.kind,
      categoryId: data.categoryId,
      organizationId: data.organizationId,
      accessLevel,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      previewUrl: data.previewUrl,
      externalUrl: data.externalUrl,
      language: data.language,
      source: data.source,
      authorName: data.authorName,
      publishedOn: data.publishedOn,
      keywords: data.keywords !== undefined ? normalizeTags(data.keywords) : undefined,
      isPremium: accessLevel === 'PREMIUM',
    },
  })
  if (data.priceAmount !== undefined || data.accessLevel !== undefined || data.currency !== undefined) {
    const current = await findActiveOffer({ resourceId: id })
    await syncStandardOffer(
      'RESOURCE',
      { resourceId: id },
      {
        name: resource.title,
        amount: data.priceAmount !== undefined ? data.priceAmount : (current?.amount ?? null),
        currency: data.currency ?? current?.currency ?? 'XAF',
        active: accessLevel === 'PREMIUM',
      },
    )
  }
  await audit('content.updated', { type: 'Resource', id }, auditCtx(p, ctx), {
    before: { slug: existing.slug, title: existing.title, accessLevel: existing.accessLevel },
    after: { slug, title: resource.title, accessLevel: resource.accessLevel },
  })
  return getById(id)
}

/** Supprime une ressource (cms.write ; cms.publish si publiée). Les activités LMS liées sont détachées (SetNull). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.write')
  const existing = await prisma.resource.findUnique({ where: { id }, select: { slug: true, title: true, status: true } })
  if (!existing) throw new NotFoundError('Ressource', id)
  if (existing.status === 'PUBLISHED') assertCan(p, 'cms.publish')
  await prisma.resource.delete({ where: { id } })
  await audit('content.archived', { type: 'Resource', id }, auditCtx(p, ctx), { before: existing, after: { deleted: true } })
}
