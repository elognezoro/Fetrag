// Médiathèque : envoi de fichiers via @fetrag/storage, enregistrement des métadonnées (MediaAsset), gestion.
import { prisma, type MediaAsset, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import { audit, NotFoundError, paginationArgs, safeOrderBy, toPaginated, ValidationError, type Principal } from '@fetrag/domain'
import { assertCan, auditCtx, contains, parseInput, type Maybe, type RequestContext } from './common'
import { buildKey, getStorage, validateUpload, type UploadFile } from './platform'
import {
  mediaListQuerySchema,
  mediaRegisterSchema,
  mediaUpdateSchema,
  mediaUploadOptionsSchema,
  type MediaListQuery,
  type MediaRegisterInput,
  type MediaUploadOptions,
} from './schemas'
import type { z } from 'zod'

// -----------------------------------------------------------------------------
// Règles d'envoi
// -----------------------------------------------------------------------------

/** Types MIME acceptés par famille (SVG exclu : risque d'injection de script). */
export const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    'text/csv',
  ],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm'],
  video: ['video/mp4', 'video/webm'],
} as const

export const allMimeTypes: string[] = [...allowedMimeTypes.image, ...allowedMimeTypes.document, ...allowedMimeTypes.audio, ...allowedMimeTypes.video]

/** Taille maximale par défaut (Mo) selon la famille de fichier. */
export function defaultMaxMb(mimeType: string): number {
  if (mimeType.startsWith('image/')) return 8
  if (mimeType.startsWith('video/')) return 200
  if (mimeType.startsWith('audio/')) return 60
  return 25
}

const sortable = ['createdAt', 'fileName', 'size', 'mimeType', 'folder'] as const

// -----------------------------------------------------------------------------
// Envoi et enregistrement
// -----------------------------------------------------------------------------

/**
 * Valide puis envoie un fichier au stockage et enregistre son MediaAsset (cms.manage_media).
 * `file.name` est normalisé dans la clé de stockage ; le nom d'origine est conservé en métadonnée.
 */
export async function upload(file: UploadFile, options: MediaUploadOptions, principal: Maybe<Principal>, ctx?: RequestContext): Promise<MediaAsset> {
  const p = assertCan(principal, 'cms.manage_media')
  const opts = parseInput(mediaUploadOptionsSchema, options)
  if (!file || typeof file.name !== 'string' || !file.name.trim()) throw new ValidationError('Nom de fichier manquant')
  const declaredType = (file.type || 'application/octet-stream').toLowerCase()
  const validated = validateUpload({ ...file, type: declaredType }, { maxMb: opts.maxMb ?? defaultMaxMb(declaredType), mimeTypes: allMimeTypes })
  const mimeType = validated.mimeType
  const key = buildKey(opts.folder, validated.fileName)
  const stored = await getStorage().put(key, file.buffer, { contentType: mimeType, visibility: opts.visibility })
  const asset = await prisma.mediaAsset.create({
    data: {
      key: stored.key,
      url: stored.url,
      fileName: validated.fileName.slice(0, 255),
      mimeType,
      size: validated.size,
      alt: opts.alt ?? null,
      caption: opts.caption ?? null,
      visibility: opts.visibility,
      folder: opts.folder,
      uploadedById: p.id,
    },
  })
  await audit('content.created', { type: 'MediaAsset', id: asset.id }, auditCtx(p, ctx), {
    after: { key: asset.key, fileName: asset.fileName, mimeType, size: file.size, visibility: opts.visibility },
  })
  return asset
}

/** Enregistre (ou met à jour par clé) les métadonnées d'un fichier déjà présent dans le stockage. */
export async function register(meta: MediaRegisterInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<MediaAsset> {
  const p = assertCan(principal, 'cms.manage_media')
  const data = parseInput(mediaRegisterSchema, meta)
  const asset = await prisma.mediaAsset.upsert({
    where: { key: data.key },
    update: {
      url: data.url,
      fileName: data.fileName,
      mimeType: data.mimeType,
      size: data.size,
      width: data.width ?? null,
      height: data.height ?? null,
      alt: data.alt,
      caption: data.caption,
      visibility: data.visibility,
      folder: data.folder,
    },
    create: {
      key: data.key,
      url: data.url,
      fileName: data.fileName,
      mimeType: data.mimeType,
      size: data.size,
      width: data.width ?? null,
      height: data.height ?? null,
      alt: data.alt ?? null,
      caption: data.caption ?? null,
      visibility: data.visibility,
      folder: data.folder,
      uploadedById: p.id,
    },
  })
  await audit('content.created', { type: 'MediaAsset', id: asset.id }, auditCtx(p, ctx), { after: { key: asset.key, fileName: asset.fileName } })
  return asset
}

/** Alias de `register` pour respecter le contrat générique des namespaces. */
export const create = register

// -----------------------------------------------------------------------------
// Consultation
// -----------------------------------------------------------------------------

export type MediaListItem = MediaAsset & { uploadedBy: { id: string; name: string | null } | null }

/** Liste paginée (cms.manage_media) : dossier, visibilité, préfixe MIME, recherche sur nom/alt. */
export async function list(query: MediaListQuery, principal: Maybe<Principal>): Promise<Paginated<MediaListItem>> {
  assertCan(principal, 'cms.manage_media')
  const q = parseInput(mediaListQuerySchema, query)
  const where: Prisma.MediaAssetWhereInput = {
    ...(q.folder ? { folder: q.folder } : {}),
    ...(q.visibility ? { visibility: q.visibility } : {}),
    ...(q.mimeType ? { mimeType: { startsWith: q.mimeType } } : {}),
    ...(q.q ? { OR: [{ fileName: contains(q.q) }, { alt: contains(q.q) }, { caption: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.mediaAsset.findMany({
      where,
      ...paginationArgs(q),
      orderBy: safeOrderBy(q.sort, q.order, sortable, 'createdAt'),
      include: { uploadedBy: { select: { id: true, name: true } } },
    }),
    prisma.mediaAsset.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Média par identifiant ; les fichiers privés exigent cms.manage_media si un principal est fourni. */
export async function getById(id: string, principal?: Maybe<Principal>): Promise<MediaAsset> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new NotFoundError('Média', id)
  if (principal !== undefined && asset.visibility === 'PRIVATE') assertCan(principal, 'cms.manage_media')
  return asset
}

/** Dossiers existants avec le nombre de fichiers. */
export async function listFolders(principal: Maybe<Principal>): Promise<Array<{ folder: string; count: number }>> {
  assertCan(principal, 'cms.manage_media')
  const rows = await prisma.mediaAsset.groupBy({ by: ['folder'], _count: { _all: true }, orderBy: { folder: 'asc' } })
  return rows.map((r) => ({ folder: r.folder, count: r._count._all }))
}

/** URL d'accès : publique telle quelle, privée signée pour une durée limitée (cms.manage_media). */
export async function accessUrl(id: string, principal: Maybe<Principal>, expiresInSeconds = 900): Promise<string> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new NotFoundError('Média', id)
  if (asset.visibility === 'PUBLIC') return asset.url
  assertCan(principal, 'cms.manage_media')
  return getStorage().getSignedUrl(asset.key, { expiresInSeconds: Math.min(Math.max(expiresInSeconds, 60), 86400) })
}

// -----------------------------------------------------------------------------
// Modification et suppression
// -----------------------------------------------------------------------------

/** Met à jour les métadonnées éditoriales (texte alternatif, légende, dossier). */
export async function update(id: string, input: z.input<typeof mediaUpdateSchema>, principal: Maybe<Principal>, ctx?: RequestContext): Promise<MediaAsset> {
  const p = assertCan(principal, 'cms.manage_media')
  const data = parseInput(mediaUpdateSchema, input)
  const existing = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new NotFoundError('Média', id)
  const asset = await prisma.mediaAsset.update({ where: { id }, data: { alt: data.alt, caption: data.caption, folder: data.folder } })
  await audit('content.updated', { type: 'MediaAsset', id }, auditCtx(p, ctx), { after: data })
  return asset
}

/** Supprime le fichier du stockage puis son enregistrement (cms.manage_media). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.manage_media')
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new NotFoundError('Média', id)
  try {
    await getStorage().delete(asset.key)
  } catch (error) {
    // Le fichier peut déjà avoir disparu du stockage ; l'enregistrement est supprimé quoi qu'il arrive.
    console.error('[cms] suppression du fichier de stockage impossible', asset.key, error)
  }
  await prisma.mediaAsset.delete({ where: { id } })
  await audit('content.archived', { type: 'MediaAsset', id }, auditCtx(p, ctx), {
    before: { key: asset.key, fileName: asset.fileName },
    after: { deleted: true },
  })
}
