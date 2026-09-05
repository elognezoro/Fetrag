import 'server-only'
import {
  articles,
  categories,
  events,
  faq,
  forms,
  media,
  menus,
  pages,
  partners,
  resources,
  revisions,
  serviceRequests,
  services,
  type ArticleDetail,
  type EventDetail,
  type PageDetail,
  type ResourceDetail,
  type ServiceDetail,
} from '@fetrag/cms'
import { contentStatuses, formKinds, serviceRequestStatuses } from '@fetrag/contracts'
import { formSubmissionStatuses, partnerKinds, menuLocations, categoryKinds } from '@fetrag/cms'
import type { Partner } from '@fetrag/db'
import { isDomainError, type Principal } from '@fetrag/domain'
import type { ArticleFormValues } from '@/components/admin/article-form'
import type { EventFormValues } from '@/components/admin/event-form'
import type { PageFormValues } from '@/components/admin/page-form'
import type { PartnerFormValues } from '@/components/admin/partner-form'
import type { ResourceFormValues } from '@/components/admin/resource-form'
import type { ServiceFormValues } from '@/components/admin/service-form'
import { oneOf, toCmsQuery, toDate, type ListParams } from './list-params'

/** Exécute un chargement de détail et renvoie `null` pour les erreurs « introuvable » (page 404). */
export async function orNull<T>(task: () => Promise<T>): Promise<T | null> {
  try {
    return await task()
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return null
    throw error
  }
}

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// -----------------------------------------------------------------------------
// Listes
// -----------------------------------------------------------------------------

export function loadPages(principal: Principal, params: ListParams) {
  return pages.list({ ...toCmsQuery(params), status: oneOf(params.status, contentStatuses) }, principal)
}

export function loadArticles(principal: Principal, params: ListParams) {
  return articles.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, contentStatuses),
      categoryId: params.filters.categorie,
      isCommunique: params.filters.type === 'communique' ? true : undefined,
      isFeatured: params.filters.type === 'une' ? true : undefined,
    },
    principal,
  )
}

export function loadResources(principal: Principal, params: ListParams) {
  return resources.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, contentStatuses),
      kind: oneOf(params.filters.type, ['DOCUMENT', 'GUIDE', 'REPORT', 'LEGAL_TEXT', 'FORM', 'VIDEO', 'AUDIO', 'PRESENTATION'] as const),
      accessLevel: oneOf(params.filters.acces, ['PUBLIC', 'MEMBER', 'ORGANIZATION', 'PREMIUM'] as const),
      categoryId: params.filters.categorie,
    },
    principal,
  )
}

export function loadEvents(principal: Principal, params: ListParams) {
  return events.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, contentStatuses),
      kind: oneOf(params.filters.type, ['EVENT', 'MASTERCLASS', 'WEBINAR', 'ASSEMBLY', 'TRAINING'] as const),
      from: toDate(params.filters.du),
      to: toDate(params.filters.au, true),
    },
    principal,
  )
}

export function loadServices(principal: Principal, params: ListParams) {
  return services.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, contentStatuses),
      categoryId: params.filters.categorie,
      isPaid: params.filters.tarif === 'payant' ? true : params.filters.tarif === 'gratuit' ? false : undefined,
    },
    principal,
  )
}

export function loadPartners(principal: Principal, params: ListParams) {
  return partners.list(
    {
      ...toCmsQuery(params),
      sort: params.sort ?? 'position',
      order: params.sort ? params.order : 'asc',
      kind: oneOf(params.filters.type, partnerKinds),
      isActive: params.status === 'actif' ? true : params.status === 'inactif' ? false : undefined,
    },
    principal,
  )
}

export function loadCategories(principal: Principal, params: ListParams) {
  return categories.list({ ...toCmsQuery(params), pageSize: Math.max(params.pageSize, 50), kind: oneOf(params.filters.domaine, categoryKinds) }, principal)
}

export async function loadFaq(principal: Principal, params: ListParams) {
  const [list, groups] = await Promise.all([
    faq.list(
      {
        ...toCmsQuery(params),
        pageSize: Math.max(params.pageSize, 50),
        sort: params.sort ?? 'position',
        order: params.sort ? params.order : 'asc',
        group: params.filters.theme,
        isActive: params.status === 'actif' ? true : params.status === 'inactif' ? false : undefined,
      },
      principal,
    ),
    faq.listGroups(),
  ])
  return { list, groups }
}

export async function loadMedia(principal: Principal, params: ListParams) {
  const [list, folders] = await Promise.all([
    media.list(
      {
        ...toCmsQuery(params),
        pageSize: Math.max(params.pageSize, 24),
        folder: params.filters.dossier,
        visibility: oneOf(params.filters.visibilite, ['PUBLIC', 'PRIVATE'] as const),
        mimeType: params.filters.type === 'image' ? 'image/' : params.filters.type === 'document' ? 'application/' : params.filters.type === 'video' ? 'video/' : params.filters.type === 'audio' ? 'audio/' : undefined,
      },
      principal,
    ),
    media.listFolders(principal),
  ])
  return { list, folders }
}

export async function loadMenus() {
  const summaries = await menus.list()
  return menuLocations.map((location) => {
    const found = summaries.find((m) => m.location === location)
    return { location, id: found?.id ?? null, name: found?.name ?? null, itemCount: found?.itemCount ?? 0 }
  })
}

export function loadMenu(location: string) {
  const loc = oneOf(location, menuLocations)
  if (!loc) return null
  return menus.get(loc)
}

export function loadServiceRequests(principal: Principal, params: ListParams) {
  return serviceRequests.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, serviceRequestStatuses),
      serviceId: params.filters.service,
      assigneeId: params.filters.responsable && params.filters.responsable !== 'moi' ? params.filters.responsable : undefined,
      mine: params.filters.responsable === 'moi' ? true : undefined,
    },
    principal,
  )
}

export function loadMessages(principal: Principal, params: ListParams) {
  return forms.list(
    {
      ...toCmsQuery(params),
      status: oneOf(params.status, formSubmissionStatuses),
      kind: oneOf(params.filters.type, formKinds),
      assignedTo: params.filters.responsable,
    },
    principal,
  )
}

// -----------------------------------------------------------------------------
// Détails et conversion vers les valeurs de formulaire
// -----------------------------------------------------------------------------

function seoValues(seo: { title: string | null; description: string | null; canonical: string | null; ogImageUrl: string | null; noIndex: boolean } | null | undefined) {
  if (!seo) return null
  return { title: seo.title, description: seo.description, canonical: seo.canonical, ogImageUrl: seo.ogImageUrl, noIndex: seo.noIndex }
}

export async function loadPageDetail(id: string, principal: Principal) {
  const page = await orNull(() => pages.getById(id, principal))
  if (!page) return null
  const history = await revisions.list(page.id, principal, { page: 1, pageSize: 12 }).catch(() => null)
  return { page, revisions: history?.items ?? [] }
}

export function toPageFormValues(page: PageDetail): PageFormValues {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    excerpt: page.excerpt,
    content: page.content,
    blocks: page.blocks,
    template: page.template,
    locale: page.locale,
    coverImageUrl: page.coverImageUrl,
    showInSitemap: page.showInSitemap,
    scheduledAt: iso(page.scheduledAt),
    seo: seoValues(page.seo),
  }
}

export function loadArticleDetail(id: string, principal: Principal) {
  return orNull(() => articles.getById(id, principal))
}

export function toArticleFormValues(article: ArticleDetail): ArticleFormValues {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    coverImageUrl: article.coverImageUrl,
    coverAlt: article.coverAlt,
    categoryId: article.categoryId,
    isCommunique: article.isCommunique,
    isFeatured: article.isFeatured,
    locale: article.locale,
    tags: article.tags,
    scheduledAt: iso(article.scheduledAt),
    seo: seoValues(article.seo),
  }
}

export function loadResourceDetail(id: string, principal: Principal) {
  return orNull(() => resources.getById(id, principal))
}

export function toResourceFormValues(resource: ResourceDetail): ResourceFormValues {
  const offer = resource.offers[0]
  return {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    summary: resource.summary,
    kind: resource.kind,
    categoryId: resource.categoryId,
    organizationId: resource.organizationId,
    accessLevel: resource.accessLevel,
    fileUrl: resource.fileUrl,
    fileName: resource.fileName,
    fileSize: resource.fileSize,
    mimeType: resource.mimeType,
    previewUrl: resource.previewUrl,
    externalUrl: resource.externalUrl,
    language: resource.language,
    source: resource.source,
    authorName: resource.authorName,
    publishedOn: iso(resource.publishedOn),
    keywords: resource.keywords,
    priceAmount: offer?.amount ?? null,
    currency: offer?.currency ?? 'XAF',
  }
}

export function loadEventDetail(id: string, principal: Principal) {
  return orNull(() => events.getById(id, principal))
}

export function toEventFormValues(event: EventDetail): EventFormValues {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    kind: event.kind,
    categoryId: event.categoryId,
    coverImageUrl: event.coverImageUrl,
    startsAt: iso(event.startsAt),
    endsAt: iso(event.endsAt),
    location: event.location,
    city: event.city,
    mode: event.mode,
    meetingUrl: event.meetingUrl,
    replayUrl: event.replayUrl,
    speakerName: event.speakerName,
    speakerTitle: event.speakerTitle,
    speakerBio: event.speakerBio,
    speakerImageUrl: event.speakerImageUrl,
    capacity: event.capacity,
    isFree: event.isFree,
    priceAmount: event.priceAmount,
    currency: event.currency,
    issuesCertificate: event.issuesCertificate,
    isFeatured: event.isFeatured,
    seo: seoValues(event.seo),
  }
}

export function loadServiceDetail(id: string, principal: Principal) {
  return orNull(() => services.getById(id, principal))
}

export function toServiceFormValues(service: ServiceDetail): ServiceFormValues {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    summary: service.summary,
    description: service.description,
    conditions: service.conditions,
    icon: service.icon,
    categoryId: service.categoryId,
    isPaid: service.isPaid,
    priceAmount: service.priceAmount,
    currency: service.currency,
    requiresAccount: service.requiresAccount,
    formSchema: service.formSchema,
    slaDays: service.slaDays,
    position: service.position,
    seo: seoValues(service.seo),
  }
}

export function loadPartnerDetail(id: string) {
  return orNull(() => partners.getById(id))
}

export function toPartnerFormValues(partner: Partner): PartnerFormValues {
  return {
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    acronym: partner.acronym,
    kind: partner.kind,
    sector: partner.sector,
    description: partner.description,
    logoUrl: partner.logoUrl,
    website: partner.website,
    city: partner.city,
    country: partner.country,
    position: partner.position,
    isActive: partner.isActive,
  }
}

export function loadServiceRequestDetail(id: string, principal: Principal) {
  return orNull(() => serviceRequests.getById(id, principal))
}

export function loadMessageDetail(id: string, principal: Principal) {
  return orNull(() => forms.getById(id, principal))
}

export async function loadEventAttendees(eventId: string, principal: Principal) {
  try {
    return await events.listAttendees(eventId, principal)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND')) return null
    throw error
  }
}
