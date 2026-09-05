'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { articles, categories, events, faq, media, menus, pages, partners, publishing, resources, revisions, services, type MenuItemInput, type PageBlocks } from '@fetrag/cms'
import { contentStatuses, idSchema, z } from '@fetrag/contracts'
import { type ContentStatus } from '@fetrag/db'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import {
  bool,
  int,
  list,
  nullableDate,
  nullableInt,
  nullableJson,
  nullableMoney,
  nullableText,
  optionalSlug,
  readSeo,
  relationId,
  revalidateContent,
  successState,
  text,
  toErrorState,
} from './form-helpers'

// -----------------------------------------------------------------------------
// Workflow éditorial et suppressions
// -----------------------------------------------------------------------------

const publishableSchema = z.enum(['page', 'article', 'service', 'resource', 'event'])
const deletableSchema = z.enum(['page', 'article', 'service', 'resource', 'event', 'partner', 'category', 'faq', 'media'])
export type DeletableEntity = z.infer<typeof deletableSchema>
export type PublishableEntity = z.infer<typeof publishableSchema>

const sectionPaths: Record<DeletableEntity, string> = {
  page: '/admin/pages',
  article: '/admin/actualites',
  service: '/admin/services',
  resource: '/admin/ressources',
  event: '/admin/evenements',
  partner: '/admin/partenaires',
  category: '/admin/categories',
  faq: '/admin/faq',
  media: '/admin/medias',
}

/** Change le statut éditorial d'un contenu (publier, relecture, planifier, archiver, brouillon). */
export async function transitionContentAction(entityType: string, id: string, toStatus: string, scheduledAt?: string | null): Promise<ActionState> {
  const parsed = z.object({ entityType: publishableSchema, id: idSchema, toStatus: z.enum(contentStatuses) }).safeParse({ entityType, id, toStatus })
  if (!parsed.success) return { status: 'error', message: 'Transition invalide.' }
  try {
    const principal = await requireActionCan('cms.read_drafts')
    const ctx = await adminRequestContext()
    const result = await publishing.transition(parsed.data.entityType, parsed.data.id, parsed.data.toStatus as ContentStatus, principal, {
      scheduledAt: scheduledAt ?? undefined,
      ctx,
    })
    revalidatePath(sectionPaths[parsed.data.entityType], 'layout')
    revalidatePath('/admin')
    revalidateContent(parsed.data.entityType, result.slug)
    const labels: Record<string, string> = { PUBLISHED: 'publié', REVIEW: 'envoyé en relecture', SCHEDULED: 'planifié', ARCHIVED: 'archivé', DRAFT: 'repassé en brouillon' }
    return successState(result.changed ? `« ${result.title} » a été ${labels[result.to] ?? 'mis à jour'}.` : 'Le contenu était déjà dans ce statut.')
  } catch (error) {
    return toErrorState(error)
  }
}

/** Supprime définitivement un contenu (confirmation côté client). */
export async function deleteContentAction(entityType: string, id: string): Promise<ActionState> {
  const parsed = z.object({ entityType: deletableSchema, id: idSchema }).safeParse({ entityType, id })
  if (!parsed.success) return { status: 'error', message: 'Suppression invalide.' }
  try {
    const principal = await requireActionCan(parsed.data.entityType === 'media' ? 'cms.manage_media' : parsed.data.entityType === 'service' ? 'services.manage' : 'cms.write')
    const ctx = await adminRequestContext()
    switch (parsed.data.entityType) {
      case 'page':
        await pages.remove(parsed.data.id, principal, ctx)
        break
      case 'article':
        await articles.remove(parsed.data.id, principal, ctx)
        break
      case 'service':
        await services.remove(parsed.data.id, principal, ctx)
        break
      case 'resource':
        await resources.remove(parsed.data.id, principal, ctx)
        break
      case 'event':
        await events.remove(parsed.data.id, principal, ctx)
        break
      case 'partner':
        await partners.remove(parsed.data.id, principal, ctx)
        break
      case 'category':
        await categories.remove(parsed.data.id, principal, ctx)
        break
      case 'faq':
        await faq.remove(parsed.data.id, principal, ctx)
        break
      case 'media':
        await media.remove(parsed.data.id, principal, ctx)
        break
    }
    revalidatePath(sectionPaths[parsed.data.entityType], 'layout')
    revalidateContent(parsed.data.entityType)
    return successState('Élément supprimé.')
  } catch (error) {
    return toErrorState(error)
  }
}

// -----------------------------------------------------------------------------
// Pages
// -----------------------------------------------------------------------------

export type PageField = 'title' | 'slug' | 'excerpt' | 'content' | 'blocks' | 'template' | 'locale' | 'coverImageUrl' | 'scheduledAt' | 'seo'

export async function savePageAction(_previous: ActionState<PageField>, formData: FormData): Promise<ActionState<PageField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const input = {
      slug: optionalSlug(formData),
      title: text(formData, 'title'),
      excerpt: nullableText(formData, 'excerpt'),
      content: text(formData, 'content'),
      blocks: nullableJson<PageBlocks>(formData, 'blocks'),
      template: text(formData, 'template') || 'default',
      locale: (text(formData, 'locale') || 'fr') as 'fr' | 'en',
      coverImageUrl: nullableText(formData, 'coverImageUrl'),
      showInSitemap: bool(formData, 'showInSitemap'),
      scheduledAt: nullableDate(formData, 'scheduledAt'),
      seo: readSeo(formData),
    }
    if (id) {
      const page = await pages.update(id, input, principal, ctx)
      revalidatePath('/admin/pages', 'layout')
      revalidateContent('page', page.slug)
      return successState(`Page « ${page.title} » enregistrée (version ${page.version}).`)
    }
    const page = await pages.create(input, principal, ctx)
    createdId = page.id
    revalidatePath('/admin/pages', 'layout')
  } catch (error) {
    return toErrorState<PageField>(error)
  }
  redirect(`/admin/pages/${createdId}?cree=1`)
}

/** Restaure une révision antérieure d'une page (le contenu courant est d'abord sauvegardé comme nouvelle révision). */
export async function restoreRevisionAction(revisionId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(revisionId)
  if (!parsed.success) return { status: 'error', message: 'Révision inconnue.' }
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const revision = await revisions.restore(parsed.data, principal, ctx)
    revalidatePath(`/admin/pages/${revision.pageId}`)
    revalidatePath('/admin/pages', 'layout')
    revalidateContent('page')
    return successState(`Version ${revision.version} restaurée : la page est repassée en brouillon si elle était publiée.`)
  } catch (error) {
    return toErrorState(error)
  }
}

// -----------------------------------------------------------------------------
// Actualités
// -----------------------------------------------------------------------------

export type ArticleField = 'title' | 'slug' | 'excerpt' | 'content' | 'coverImageUrl' | 'coverAlt' | 'categoryId' | 'tags' | 'scheduledAt' | 'seo'

export async function saveArticleAction(_previous: ActionState<ArticleField>, formData: FormData): Promise<ActionState<ArticleField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const input = {
      slug: optionalSlug(formData),
      title: text(formData, 'title'),
      excerpt: nullableText(formData, 'excerpt'),
      content: text(formData, 'content'),
      coverImageUrl: nullableText(formData, 'coverImageUrl'),
      coverAlt: nullableText(formData, 'coverAlt'),
      categoryId: relationId(formData, 'categoryId'),
      isCommunique: bool(formData, 'isCommunique'),
      isFeatured: bool(formData, 'isFeatured'),
      locale: (text(formData, 'locale') || 'fr') as 'fr' | 'en',
      tags: list(formData, 'tags'),
      scheduledAt: nullableDate(formData, 'scheduledAt'),
      seo: readSeo(formData),
    }
    if (id) {
      const article = await articles.update(id, input, principal, ctx)
      revalidatePath('/admin/actualites', 'layout')
      revalidateContent('article', article.slug)
      return successState(`Actualité « ${article.title} » enregistrée.`)
    }
    const article = await articles.create(input, principal, ctx)
    createdId = article.id
    revalidatePath('/admin/actualites', 'layout')
  } catch (error) {
    return toErrorState<ArticleField>(error)
  }
  redirect(`/admin/actualites/${createdId}?cree=1`)
}

// -----------------------------------------------------------------------------
// Ressources documentaires
// -----------------------------------------------------------------------------

export type ResourceField =
  | 'title'
  | 'slug'
  | 'summary'
  | 'kind'
  | 'categoryId'
  | 'organizationId'
  | 'accessLevel'
  | 'fileUrl'
  | 'externalUrl'
  | 'previewUrl'
  | 'publishedOn'
  | 'keywords'
  | 'priceAmount'
  | 'source'
  | 'authorName'

export async function saveResourceAction(_previous: ActionState<ResourceField>, formData: FormData): Promise<ActionState<ResourceField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const fileUrl = nullableText(formData, 'fileUrl')
    const externalUrl = nullableText(formData, 'externalUrl')
    if (!fileUrl && !externalUrl) {
      return { status: 'error', message: 'Indiquez un fichier ou une URL externe.', fieldErrors: { fileUrl: 'Fichier ou URL externe requis' } }
    }
    const input = {
      slug: optionalSlug(formData),
      title: text(formData, 'title'),
      summary: nullableText(formData, 'summary'),
      kind: text(formData, 'kind') || 'DOCUMENT',
      categoryId: relationId(formData, 'categoryId'),
      organizationId: relationId(formData, 'organizationId'),
      accessLevel: text(formData, 'accessLevel') || 'PUBLIC',
      fileUrl,
      fileName: nullableText(formData, 'fileName'),
      fileSize: nullableInt(formData, 'fileSize'),
      mimeType: nullableText(formData, 'mimeType'),
      previewUrl: nullableText(formData, 'previewUrl'),
      externalUrl,
      language: (text(formData, 'language') || 'fr') as 'fr' | 'en',
      source: nullableText(formData, 'source'),
      authorName: nullableText(formData, 'authorName'),
      publishedOn: nullableDate(formData, 'publishedOn'),
      keywords: list(formData, 'keywords'),
      priceAmount: nullableMoney(formData, 'priceAmount'),
      currency: (text(formData, 'currency') || 'XAF').toUpperCase(),
    } as Parameters<typeof resources.create>[0]
    if (id) {
      const resource = await resources.update(id, input, principal, ctx)
      revalidatePath('/admin/ressources', 'layout')
      revalidateContent('resource', resource.slug)
      return successState(`Ressource « ${resource.title} » enregistrée.`)
    }
    const resource = await resources.create(input, principal, ctx)
    createdId = resource.id
    revalidatePath('/admin/ressources', 'layout')
  } catch (error) {
    return toErrorState<ResourceField>(error)
  }
  redirect(`/admin/ressources/${createdId}?cree=1`)
}

// -----------------------------------------------------------------------------
// Événements
// -----------------------------------------------------------------------------

export type EventField =
  | 'title'
  | 'slug'
  | 'summary'
  | 'description'
  | 'kind'
  | 'categoryId'
  | 'coverImageUrl'
  | 'startsAt'
  | 'endsAt'
  | 'location'
  | 'city'
  | 'mode'
  | 'meetingUrl'
  | 'replayUrl'
  | 'speakerName'
  | 'speakerTitle'
  | 'speakerBio'
  | 'speakerImageUrl'
  | 'capacity'
  | 'priceAmount'
  | 'seo'

export async function saveEventAction(_previous: ActionState<EventField>, formData: FormData): Promise<ActionState<EventField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const startsAt = nullableDate(formData, 'startsAt')
    if (!startsAt) return { status: 'error', message: 'La date de début est obligatoire.', fieldErrors: { startsAt: 'Date de début requise' } }
    const input = {
      slug: optionalSlug(formData),
      title: text(formData, 'title'),
      summary: nullableText(formData, 'summary'),
      description: text(formData, 'description'),
      kind: text(formData, 'kind') || 'EVENT',
      categoryId: relationId(formData, 'categoryId'),
      coverImageUrl: nullableText(formData, 'coverImageUrl'),
      startsAt,
      endsAt: nullableDate(formData, 'endsAt'),
      location: nullableText(formData, 'location'),
      city: nullableText(formData, 'city'),
      mode: text(formData, 'mode') || 'IN_PERSON',
      meetingUrl: nullableText(formData, 'meetingUrl'),
      replayUrl: nullableText(formData, 'replayUrl'),
      speakerName: nullableText(formData, 'speakerName'),
      speakerTitle: nullableText(formData, 'speakerTitle'),
      speakerBio: nullableText(formData, 'speakerBio'),
      speakerImageUrl: nullableText(formData, 'speakerImageUrl'),
      capacity: nullableInt(formData, 'capacity'),
      isFree: bool(formData, 'isFree'),
      priceAmount: nullableMoney(formData, 'priceAmount'),
      currency: (text(formData, 'currency') || 'XAF').toUpperCase(),
      issuesCertificate: bool(formData, 'issuesCertificate'),
      isFeatured: bool(formData, 'isFeatured'),
      seo: readSeo(formData),
    } as Parameters<typeof events.create>[0]
    if (id) {
      const event = await events.update(id, input, principal, ctx)
      revalidatePath('/admin/evenements', 'layout')
      revalidateContent('event', event.slug)
      return successState(`Événement « ${event.title} » enregistré.`)
    }
    const event = await events.create(input, principal, ctx)
    createdId = event.id
    revalidatePath('/admin/evenements', 'layout')
  } catch (error) {
    return toErrorState<EventField>(error)
  }
  redirect(`/admin/evenements/${createdId}?cree=1`)
}

/** Marque la présence (ou l'absence) d'un inscrit à un événement (cms.write). */
export async function setEventAttendanceAction(eventId: string, userId: string, attended: boolean): Promise<ActionState> {
  const parsed = z.object({ eventId: idSchema, userId: idSchema }).safeParse({ eventId, userId })
  if (!parsed.success) return { status: 'error', message: 'Inscription inconnue.' }
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    await events.markAttendance(parsed.data.eventId, parsed.data.userId, attended, principal, ctx)
    revalidatePath(`/admin/evenements/${parsed.data.eventId}`)
    return successState(attended ? 'Participant marqué présent.' : 'Présence retirée.')
  } catch (error) {
    return toErrorState(error)
  }
}

// -----------------------------------------------------------------------------
// Partenaires et organisations affiliées
// -----------------------------------------------------------------------------

export type PartnerField = 'name' | 'slug' | 'acronym' | 'kind' | 'sector' | 'description' | 'logoUrl' | 'website' | 'city' | 'country' | 'position'

export async function savePartnerAction(_previous: ActionState<PartnerField>, formData: FormData): Promise<ActionState<PartnerField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const input = {
      slug: optionalSlug(formData),
      name: text(formData, 'name'),
      acronym: nullableText(formData, 'acronym'),
      kind: text(formData, 'kind') || 'PARTNER',
      sector: nullableText(formData, 'sector'),
      description: nullableText(formData, 'description'),
      logoUrl: nullableText(formData, 'logoUrl'),
      website: nullableText(formData, 'website'),
      city: nullableText(formData, 'city'),
      country: (text(formData, 'country') || 'GA').toUpperCase(),
      position: int(formData, 'position') ?? 0,
      isActive: bool(formData, 'isActive'),
    } as Parameters<typeof partners.create>[0]
    if (id) {
      const partner = await partners.update(id, input, principal, ctx)
      revalidatePath('/admin/partenaires', 'layout')
      revalidateContent('partner')
      return successState(`« ${partner.name} » enregistré.`)
    }
    const partner = await partners.create(input, principal, ctx)
    createdId = partner.id
    revalidatePath('/admin/partenaires', 'layout')
    revalidateContent('partner')
  } catch (error) {
    return toErrorState<PartnerField>(error)
  }
  redirect(`/admin/partenaires/${createdId}?cree=1`)
}

// -----------------------------------------------------------------------------
// Catégories et FAQ (formulaires en dialogue : pas de redirection)
// -----------------------------------------------------------------------------

export type CategoryField = 'name' | 'slug' | 'description' | 'color' | 'kind' | 'position'

export async function saveCategoryAction(_previous: ActionState<CategoryField>, formData: FormData): Promise<ActionState<CategoryField>> {
  const id = text(formData, 'id') || null
  try {
    const principal = await requireActionCan('cms.read_drafts')
    const ctx = await adminRequestContext()
    const input = {
      slug: optionalSlug(formData),
      name: text(formData, 'name'),
      description: nullableText(formData, 'description'),
      color: nullableText(formData, 'color'),
      kind: text(formData, 'kind') || 'article',
      position: int(formData, 'position') ?? 0,
    } as Parameters<typeof categories.create>[0]
    const category = id ? await categories.update(id, input, principal, ctx) : await categories.create(input, principal, ctx)
    revalidatePath('/admin/categories')
    revalidateContent('category')
    return successState(`Catégorie « ${category.name} » enregistrée.`, { id: category.id })
  } catch (error) {
    return toErrorState<CategoryField>(error)
  }
}

export type FaqField = 'question' | 'answer' | 'group' | 'position'

export async function saveFaqAction(_previous: ActionState<FaqField>, formData: FormData): Promise<ActionState<FaqField>> {
  const id = text(formData, 'id') || null
  try {
    const principal = await requireActionCan('cms.write')
    const ctx = await adminRequestContext()
    const input = {
      question: text(formData, 'question'),
      answer: text(formData, 'answer'),
      group: text(formData, 'group') || 'general',
      position: int(formData, 'position') ?? 0,
      isActive: bool(formData, 'isActive'),
    }
    const item = id ? await faq.update(id, input, principal, ctx) : await faq.create(input, principal, ctx)
    revalidatePath('/admin/faq')
    revalidateContent('faq')
    return successState('Question enregistrée.', { id: item.id })
  } catch (error) {
    return toErrorState<FaqField>(error)
  }
}

/** Réordonne des éléments (catégories, FAQ, partenaires, services) selon la liste d'identifiants. */
export async function reorderAction(kind: 'category' | 'faq' | 'partner' | 'service', ids: string[]): Promise<ActionState> {
  const parsed = z.array(idSchema).min(1).max(500).safeParse(ids)
  if (!parsed.success) return { status: 'error', message: 'Ordre invalide.' }
  try {
    const principal = await requireActionCan(kind === 'service' ? 'services.manage' : 'cms.write')
    if (kind === 'category') await categories.reorder(parsed.data, principal)
    else if (kind === 'faq') await faq.reorder(parsed.data, principal)
    else if (kind === 'partner') await partners.reorder(parsed.data, principal)
    else await services.reorder(parsed.data, principal)
    revalidatePath('/admin', 'layout')
    return successState('Ordre enregistré.')
  } catch (error) {
    return toErrorState(error)
  }
}

// -----------------------------------------------------------------------------
// Menus
// -----------------------------------------------------------------------------

const menuLocationSchema = z.enum(['HEADER', 'FOOTER', 'FOOTER_SECONDARY', 'LMS_HEADER'])

export async function saveMenuAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const location = menuLocationSchema.safeParse(text(formData, 'location'))
  if (!location.success) return { status: 'error', message: 'Emplacement de menu inconnu.' }
  try {
    const principal = await requireActionCan('cms.manage_menus')
    const ctx = await adminRequestContext()
    const items = nullableJson<MenuItemInput[]>(formData, 'items') ?? []
    const tree = await menus.upsertTree(location.data, items, principal, { name: nullableText(formData, 'name') ?? undefined, ctx })
    revalidatePath('/admin/menus', 'layout')
    revalidateContent('menu')
    return successState(`Menu « ${tree.name} » enregistré (${items.length} entrée${items.length > 1 ? 's' : ''} de premier niveau).`)
  } catch (error) {
    return toErrorState(error)
  }
}

// -----------------------------------------------------------------------------
// Médias
// -----------------------------------------------------------------------------

export interface UploadedMedia {
  id: string
  url: string
  key: string
  fileName: string
  mimeType: string
  size: number
}

/** Envoie un fichier dans la médiathèque (cms.manage_media) et renvoie ses métadonnées. */
export async function uploadMediaAction(formData: FormData): Promise<ActionState> {
  try {
    const principal = await requireActionCan('cms.manage_media')
    const ctx = await adminRequestContext()
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Sélectionnez un fichier.', fieldErrors: { file: 'Fichier requis' } }
    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await media.upload(
      { name: file.name, type: file.type, size: file.size, buffer },
      {
        folder: text(formData, 'folder') || 'uploads',
        visibility: text(formData, 'visibility') === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
        alt: nullableText(formData, 'alt'),
        caption: nullableText(formData, 'caption'),
      },
      principal,
      ctx,
    )
    revalidatePath('/admin/medias')
    const uploaded: UploadedMedia = { id: asset.id, url: asset.url, key: asset.key, fileName: asset.fileName, mimeType: asset.mimeType, size: asset.size }
    return successState(`« ${asset.fileName} » envoyé.`, { ...uploaded })
  } catch (error) {
    return toErrorState(error, 'L’envoi du fichier a échoué.')
  }
}

export async function updateMediaAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(text(formData, 'id'))
  if (!id.success) return { status: 'error', message: 'Média inconnu.' }
  try {
    const principal = await requireActionCan('cms.manage_media')
    const ctx = await adminRequestContext()
    await media.update(id.data, { alt: nullableText(formData, 'alt'), caption: nullableText(formData, 'caption'), folder: nullableText(formData, 'folder') ?? undefined }, principal, ctx)
    revalidatePath('/admin/medias')
    return successState('Média mis à jour.')
  } catch (error) {
    return toErrorState(error)
  }
}
