// SEO : SeoRecord par contenu, métadonnées dérivées, objets Next Metadata et JSON-LD (chapitre 25, ADR-005).
import { prisma, type ContentStatus, type Prisma, type SeoRecord } from '@fetrag/db'
import { resolvePublicUrl, site } from '@fetrag/config'
import { audit, NotFoundError, type Principal } from '@fetrag/domain'
import { assertAny, auditCtx, parseInput, toJson, type Maybe, type RequestContext } from './common'
import { renderExcerpt, stripHtml } from './sanitize'
import { seoEntityKindSchema, seoInputSchema, type SeoEntityKind, type SeoInput } from './schemas'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** Données SEO résolues (enregistrement explicite fusionné avec les valeurs dérivées du contenu). */
export interface SeoData {
  title: string
  description: string | null
  canonical: string | null
  ogImageUrl: string | null
  noIndex: boolean
  structuredData: Record<string, unknown> | null
  /** Vrai si un SeoRecord explicite existe. */
  hasRecord: boolean
}

/** Sous-ensemble d'un SeoRecord accepté par les helpers de rendu. */
export interface SeoRecordLike {
  title?: string | null
  description?: string | null
  canonical?: string | null
  ogImageUrl?: string | null
  noIndex?: boolean
  structuredData?: unknown
}

/** Entité publique (page, actualité, service, événement, cours) telle que renvoyée par les lecteurs publics. */
export interface SeoEntity {
  slug: string
  title: string
  status?: ContentStatus | string | null
  excerpt?: string | null
  summary?: string | null
  subtitle?: string | null
  description?: string | null
  content?: string | null
  coverImageUrl?: string | null
  coverAlt?: string | null
  publishedAt?: Date | string | null
  updatedAt?: Date | string | null
  createdAt?: Date | string | null
  locale?: string | null
  language?: string | null
  seo?: SeoRecordLike | null
  tags?: string[]
  author?: { name?: string | null } | null
  // Événements
  kind?: string | null
  startsAt?: Date | string | null
  endsAt?: Date | string | null
  location?: string | null
  city?: string | null
  mode?: string | null
  meetingUrl?: string | null
  isFree?: boolean
  priceAmount?: number | null
  currency?: string | null
  speakerName?: string | null
  speakerTitle?: string | null
  // Cours
  durationHours?: number | null
  modality?: string | null
  level?: string | null
  objectives?: string[]
  code?: string | null
}

/** Objet compatible avec `Metadata` de Next.js (sous-ensemble, sans dépendance à next). */
export interface SiteMetadata {
  title: string
  description?: string
  keywords?: string[]
  alternates?: { canonical?: string }
  openGraph?: {
    title: string
    description?: string
    url?: string
    siteName?: string
    locale?: string
    type: 'website' | 'article'
    images?: Array<{ url: string; alt?: string }>
    publishedTime?: string
    modifiedTime?: string
  }
  twitter?: { card: 'summary' | 'summary_large_image'; title: string; description?: string; images?: string[] }
  robots?: { index: boolean; follow: boolean }
}

// -----------------------------------------------------------------------------
// Chemins publics
// -----------------------------------------------------------------------------

/** Chemin public d'un contenu selon son type (chapitre 38). */
export function publicPath(kind: SeoEntityKind, slug: string): string {
  switch (kind) {
    case 'page':
      return slug === 'accueil' || slug === 'home' ? '/' : `/${slug}`
    case 'article':
      return `/actualites/${slug}`
    case 'service':
      return `/services/${slug}`
    case 'event':
      return `/evenements/${slug}`
    case 'course':
      return `/formations/${slug}`
  }
}

function baseUrlOf(baseUrl?: string): string {
  return (baseUrl ?? resolvePublicUrl('web')).replace(/\/+$/, '')
}

/** Rend une URL absolue à partir d'un chemin relatif éventuel. */
export function absoluteUrl(value: string | null | undefined, baseUrl?: string): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${baseUrlOf(baseUrl)}${value.startsWith('/') ? value : `/${value}`}`
}

function toIso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

// -----------------------------------------------------------------------------
// Accès aux enregistrements
// -----------------------------------------------------------------------------

type SeoLink = Pick<Prisma.SeoRecordUncheckedCreateInput, 'pageId' | 'articleId' | 'serviceId' | 'courseId' | 'eventId'>

/** Clé étrangère du contenu lié (un seul champ renseigné). */
function linkFields(kind: SeoEntityKind, id: string): SeoLink {
  switch (kind) {
    case 'page':
      return { pageId: id }
    case 'article':
      return { articleId: id }
    case 'service':
      return { serviceId: id }
    case 'course':
      return { courseId: id }
    case 'event':
      return { eventId: id }
  }
}

function uniqueWhere(kind: SeoEntityKind, id: string): Prisma.SeoRecordWhereUniqueInput {
  switch (kind) {
    case 'page':
      return { pageId: id }
    case 'article':
      return { articleId: id }
    case 'service':
      return { serviceId: id }
    case 'course':
      return { courseId: id }
    case 'event':
      return { eventId: id }
  }
}

interface SeoSource {
  title: string
  excerpt: string | null
  imageUrl: string | null
  status: ContentStatus
}

/** Charge les champs du contenu nécessaires à la dérivation SEO. */
async function loadSource(kind: SeoEntityKind, id: string): Promise<SeoSource | null> {
  switch (kind) {
    case 'page': {
      const p = await prisma.page.findUnique({
        where: { id },
        select: { title: true, excerpt: true, content: true, coverImageUrl: true, status: true },
      })
      return p ? { title: p.title, excerpt: p.excerpt ?? renderExcerpt(p.content), imageUrl: p.coverImageUrl, status: p.status } : null
    }
    case 'article': {
      const a = await prisma.article.findUnique({
        where: { id },
        select: { title: true, excerpt: true, content: true, coverImageUrl: true, status: true },
      })
      return a ? { title: a.title, excerpt: a.excerpt ?? renderExcerpt(a.content), imageUrl: a.coverImageUrl, status: a.status } : null
    }
    case 'service': {
      const s = await prisma.service.findUnique({
        where: { id },
        select: { name: true, summary: true, description: true, status: true },
      })
      return s ? { title: s.name, excerpt: s.summary ?? renderExcerpt(s.description), imageUrl: null, status: s.status } : null
    }
    case 'course': {
      const c = await prisma.course.findUnique({
        where: { id },
        select: { title: true, summary: true, description: true, coverImageUrl: true, status: true },
      })
      return c ? { title: c.title, excerpt: c.summary ?? renderExcerpt(c.description), imageUrl: c.coverImageUrl, status: c.status } : null
    }
    case 'event': {
      const e = await prisma.event.findUnique({
        where: { id },
        select: { title: true, summary: true, description: true, coverImageUrl: true, status: true },
      })
      return e ? { title: e.title, excerpt: e.summary ?? renderExcerpt(e.description), imageUrl: e.coverImageUrl, status: e.status } : null
    }
  }
}

/** SeoRecord brut d'un contenu (null s'il n'existe pas). */
export async function getRecord(kind: SeoEntityKind, id: string): Promise<SeoRecord | null> {
  return prisma.seoRecord.findUnique({ where: uniqueWhere(kind, id) })
}

/**
 * Données SEO d'un contenu : l'enregistrement explicite prime, les valeurs manquantes sont
 * dérivées (titre, extrait, image, noindex si non publié). Null si le contenu n'existe pas.
 */
export async function forEntity(kind: SeoEntityKind, id: string): Promise<SeoData | null> {
  const k = parseInput(seoEntityKindSchema, kind)
  const [record, source] = await Promise.all([getRecord(k, id), loadSource(k, id)])
  if (!source) return null
  const structured = record?.structuredData
  return {
    title: record?.title?.trim() || source.title,
    description: record?.description?.trim() || (source.excerpt ? stripHtml(source.excerpt) : null),
    canonical: record?.canonical ?? null,
    ogImageUrl: record?.ogImageUrl ?? source.imageUrl,
    noIndex: Boolean(record?.noIndex) || source.status !== 'PUBLISHED',
    structuredData: structured && typeof structured === 'object' && !Array.isArray(structured) ? (structured as Record<string, unknown>) : null,
    hasRecord: Boolean(record),
  }
}

/** Écrit ou met à jour le SeoRecord (usage interne : les permissions sont vérifiées par l'appelant). */
export async function upsertRecord(kind: SeoEntityKind, id: string, input: SeoInput): Promise<SeoRecord> {
  const data = parseInput(seoInputSchema, input)
  const fields = {
    title: data.title === undefined ? undefined : data.title?.trim() || null,
    description: data.description === undefined ? undefined : data.description?.trim() || null,
    canonical: data.canonical === undefined ? undefined : data.canonical || null,
    ogImageUrl: data.ogImageUrl === undefined ? undefined : data.ogImageUrl || null,
    noIndex: data.noIndex,
    structuredData: toJson(data.structuredData),
  }
  return prisma.seoRecord.upsert({
    where: uniqueWhere(kind, id),
    update: fields,
    create: { ...linkFields(kind, id), ...fields, noIndex: data.noIndex ?? false },
  })
}

/** Met à jour le SEO d'un contenu (cms.write ; course.author pour les cours). */
export async function upsert(
  kind: SeoEntityKind,
  id: string,
  input: SeoInput,
  principal: Maybe<Principal>,
  ctx?: RequestContext,
): Promise<SeoRecord> {
  const k = parseInput(seoEntityKindSchema, kind)
  const p = assertAny(principal, k === 'course' ? ['course.author'] : k === 'service' ? ['cms.write', 'services.manage'] : ['cms.write'])
  const source = await loadSource(k, id)
  if (!source) throw new NotFoundError('Contenu', id)
  const record = await upsertRecord(k, id, input)
  await audit('content.updated', { type: 'SeoRecord', id: record.id }, auditCtx(p, ctx), { after: { kind: k, entityId: id } })
  return record
}

/** Supprime le SeoRecord explicite (les valeurs dérivées reprennent le relais). */
export async function remove(kind: SeoEntityKind, id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const k = parseInput(seoEntityKindSchema, kind)
  const p = assertAny(principal, k === 'course' ? ['course.author'] : ['cms.write', 'services.manage'])
  const record = await getRecord(k, id)
  if (!record) return
  await prisma.seoRecord.delete({ where: { id: record.id } })
  await audit('content.updated', { type: 'SeoRecord', id: record.id }, auditCtx(p, ctx), { before: { kind: k, entityId: id } })
}

// -----------------------------------------------------------------------------
// Helpers de rendu (Next Metadata, JSON-LD)
// -----------------------------------------------------------------------------

function resolvedDescription(entity: SeoEntity): string | undefined {
  const explicit = entity.seo?.description?.trim()
  if (explicit) return explicit
  const short = entity.excerpt?.trim() || entity.summary?.trim()
  if (short) return stripHtml(short).slice(0, 200)
  const long = entity.content ?? entity.description
  const derived = long ? renderExcerpt(long, 200) : ''
  return derived || undefined
}

function resolvedImage(entity: SeoEntity, baseUrl?: string): string | null {
  return absoluteUrl(entity.seo?.ogImageUrl ?? entity.coverImageUrl ?? null, baseUrl)
}

function isPublished(entity: SeoEntity): boolean {
  return entity.status === undefined || entity.status === null || entity.status === 'PUBLISHED'
}

/**
 * Construit un objet compatible avec `Metadata` de Next.js pour un contenu public.
 * Les contenus non publiés (prévisualisation) portent `noindex`.
 */
export function buildMetadata(kind: SeoEntityKind, entity: SeoEntity, baseUrl?: string): SiteMetadata {
  const base = baseUrlOf(baseUrl)
  const title = entity.seo?.title?.trim() || entity.title
  const description = resolvedDescription(entity)
  const canonical = entity.seo?.canonical?.trim() || `${base}${publicPath(kind, entity.slug)}`
  const image = resolvedImage(entity, base)
  const noIndex = Boolean(entity.seo?.noIndex) || !isPublished(entity)
  const isArticle = kind === 'article'
  const locale = (entity.locale ?? entity.language ?? 'fr') === 'en' ? 'en_GB' : 'fr_GA'

  const metadata: SiteMetadata = {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.fullName,
      locale,
      type: isArticle ? 'article' : 'website',
      images: image ? [{ url: image, alt: entity.coverAlt ?? title }] : undefined,
      publishedTime: isArticle ? toIso(entity.publishedAt) : undefined,
      modifiedTime: isArticle ? toIso(entity.updatedAt) : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  }
  if (entity.tags && entity.tags.length > 0) metadata.keywords = entity.tags
  if (noIndex) metadata.robots = { index: false, follow: false }
  return metadata
}

/** JSON-LD `Organization` de la FETRAG (à inclure sur la page d'accueil et le layout). */
export function organizationJsonLd(baseUrl?: string): Record<string, unknown> {
  const base = baseUrlOf(baseUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: site.name,
    legalName: site.fullName,
    alternateName: site.name,
    url: base,
    logo: `${base}/brand/logo-fetrag.webp`,
    slogan: site.motto.join(' · '),
    address: { '@type': 'PostalAddress', streetAddress: site.contact.address, addressLocality: 'Libreville', addressCountry: 'GA' },
    contactPoint: site.contact.phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone,
      email: site.contact.email,
      contactType: 'customer service',
      availableLanguage: ['fr'],
    })),
    sameAs: [`https://${site.domains.web}`, `https://${site.domains.lms}`],
  }
}

function organizationRef(base: string): Record<string, unknown> {
  return { '@type': 'Organization', '@id': `${base}/#organization`, name: site.fullName, url: base }
}

function attendanceMode(mode: string | null | undefined): string {
  switch (mode) {
    case 'VIRTUAL':
      return 'https://schema.org/OnlineEventAttendanceMode'
    case 'HYBRID':
      return 'https://schema.org/MixedEventAttendanceMode'
    default:
      return 'https://schema.org/OfflineEventAttendanceMode'
  }
}

function courseMode(modality: string | null | undefined): string {
  switch (modality) {
    case 'ASYNC':
      return 'online'
    case 'SYNC':
      return 'onsite'
    default:
      return 'blended'
  }
}

/**
 * Données structurées JSON-LD selon le type de contenu :
 * NewsArticle, Event, Course, Service ou WebPage. Un `structuredData` explicite du SeoRecord
 * complète (et prime sur) l'objet généré.
 */
export function jsonLd(kind: SeoEntityKind, entity: SeoEntity, baseUrl?: string): Record<string, unknown> {
  const base = baseUrlOf(baseUrl)
  const url = entity.seo?.canonical?.trim() || `${base}${publicPath(kind, entity.slug)}`
  const description = resolvedDescription(entity)
  const image = resolvedImage(entity, base)
  const name = entity.seo?.title?.trim() || entity.title
  let generated: Record<string, unknown>

  switch (kind) {
    case 'article':
      generated = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: name,
        description,
        image: image ? [image] : undefined,
        datePublished: toIso(entity.publishedAt) ?? toIso(entity.createdAt),
        dateModified: toIso(entity.updatedAt) ?? toIso(entity.publishedAt),
        author: entity.author?.name ? { '@type': 'Person', name: entity.author.name } : organizationRef(base),
        publisher: { ...organizationRef(base), logo: { '@type': 'ImageObject', url: `${base}/brand/logo-fetrag.webp` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: entity.tags && entity.tags.length > 0 ? entity.tags.join(', ') : undefined,
        inLanguage: entity.locale ?? 'fr',
      }
      break
    case 'event': {
      const online = entity.mode === 'VIRTUAL'
      const place = entity.location || entity.city
      generated = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name,
        description,
        image: image ? [image] : undefined,
        url,
        startDate: toIso(entity.startsAt),
        endDate: toIso(entity.endsAt) ?? toIso(entity.startsAt),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: attendanceMode(entity.mode),
        location: online
          ? { '@type': 'VirtualLocation', url: entity.meetingUrl ?? url }
          : {
              '@type': 'Place',
              name: place ?? site.fullName,
              address: { '@type': 'PostalAddress', addressLocality: entity.city ?? 'Libreville', addressCountry: 'GA' },
            },
        organizer: organizationRef(base),
        performer: entity.speakerName ? { '@type': 'Person', name: entity.speakerName, jobTitle: entity.speakerTitle ?? undefined } : undefined,
        offers: {
          '@type': 'Offer',
          url,
          price: entity.isFree === false && entity.priceAmount ? entity.priceAmount : 0,
          priceCurrency: entity.currency ?? site.currency,
          availability: 'https://schema.org/InStock',
        },
      }
      break
    }
    case 'course':
      generated = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        url,
        image: image ?? undefined,
        courseCode: entity.code ?? undefined,
        provider: organizationRef(base),
        inLanguage: entity.language ?? entity.locale ?? 'fr',
        educationalLevel: entity.level ?? undefined,
        teaches: entity.objectives && entity.objectives.length > 0 ? entity.objectives : undefined,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: courseMode(entity.modality),
          courseWorkload: entity.durationHours ? `PT${entity.durationHours}H` : undefined,
        },
        offers: {
          '@type': 'Offer',
          url,
          price: entity.isFree === false && entity.priceAmount ? entity.priceAmount : 0,
          priceCurrency: entity.currency ?? site.currency,
          category: entity.isFree === false ? 'Paid' : 'Free',
        },
      }
      break
    case 'service':
      generated = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        url,
        serviceType: name,
        provider: organizationRef(base),
        areaServed: { '@type': 'Country', name: 'Gabon' },
        offers:
          entity.isFree === false && entity.priceAmount
            ? { '@type': 'Offer', url, price: entity.priceAmount, priceCurrency: entity.currency ?? site.currency }
            : undefined,
      }
      break
    case 'page':
      generated = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
        url,
        image: image ?? undefined,
        inLanguage: entity.locale ?? 'fr',
        isPartOf: { '@type': 'WebSite', name: site.fullName, url: base },
        about: organizationRef(base),
        dateModified: toIso(entity.updatedAt),
      }
      break
  }

  const explicit = entity.seo?.structuredData
  const extra = explicit && typeof explicit === 'object' && !Array.isArray(explicit) ? (explicit as Record<string, unknown>) : {}
  const merged: Record<string, unknown> = { ...generated, ...extra }
  for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key]
  return merged
}
