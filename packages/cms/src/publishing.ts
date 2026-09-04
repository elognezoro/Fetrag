// Workflow éditorial (WEB-18, ADR-005) : DRAFT → REVIEW → PUBLISHED → ARCHIVED, planification SCHEDULED.
import { prisma, type ContentStatus } from '@fetrag/db'
import { contentStatusSchema, contentStatusLabels } from '@fetrag/contracts'
import { audit, emit, NotFoundError, PreconditionError, ValidationError, type Action, type Principal } from '@fetrag/domain'
import { assertAny, auditCtx, parseInput, type Maybe, type RequestContext } from './common'
import { publishableEntitySchema, type PublishableEntityType } from './schemas'

// -----------------------------------------------------------------------------
// Transitions
// -----------------------------------------------------------------------------

/**
 * Transitions autorisées. Le chemin nominal est DRAFT → REVIEW → PUBLISHED → ARCHIVED ;
 * un retour en DRAFT est toujours possible ; SCHEDULED exige une date future et est
 * résolu en PUBLISHED par le job `content.publish-scheduled`.
 */
export const contentTransitions: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['REVIEW', 'SCHEDULED', 'PUBLISHED'],
  REVIEW: ['DRAFT', 'SCHEDULED', 'PUBLISHED'],
  SCHEDULED: ['DRAFT', 'REVIEW', 'PUBLISHED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
}

/** Vrai si la transition est autorisée par le workflow. */
export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return contentTransitions[from].includes(to)
}

/** Statuts atteignables depuis un statut donné. */
export function nextStatuses(from: ContentStatus): ContentStatus[] {
  return [...contentTransitions[from]]
}

/** Permissions requises selon le type de contenu et le statut cible. */
export function requiredActions(entityType: PublishableEntityType, toStatus: ContentStatus): Action[] {
  const publishing = toStatus === 'PUBLISHED' || toStatus === 'ARCHIVED'
  switch (entityType) {
    case 'course':
      return publishing ? ['course.publish'] : ['course.author']
    case 'service':
      return publishing ? ['cms.publish', 'services.manage'] : ['cms.write', 'services.manage']
    default:
      return publishing ? ['cms.publish'] : ['cms.write']
  }
}

// -----------------------------------------------------------------------------
// Adaptateurs par type de contenu
// -----------------------------------------------------------------------------

interface EntityState {
  id: string
  slug: string
  title: string
  status: ContentStatus
  scheduledAt: Date | null
  publishedAt: Date | null
}

interface EntityPatch {
  status: ContentStatus
  publishedAt?: Date | null
  scheduledAt?: Date | null
}

interface EntityAdapter {
  auditType: string
  supportsScheduling: boolean
  hasPublishedAt: boolean
  find(id: string): Promise<EntityState | null>
  update(id: string, patch: EntityPatch): Promise<void>
  findScheduled(now: Date): Promise<EntityState[]>
}

const adapters: Record<PublishableEntityType, EntityAdapter> = {
  page: {
    auditType: 'Page',
    supportsScheduling: true,
    hasPublishedAt: true,
    async find(id) {
      return prisma.page.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true, scheduledAt: true, publishedAt: true } })
    },
    async update(id, patch) {
      await prisma.page.update({ where: { id }, data: patch })
    },
    async findScheduled(now) {
      return prisma.page.findMany({
        where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
        select: { id: true, slug: true, title: true, status: true, scheduledAt: true, publishedAt: true },
      })
    },
  },
  article: {
    auditType: 'Article',
    supportsScheduling: true,
    hasPublishedAt: true,
    async find(id) {
      return prisma.article.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true, scheduledAt: true, publishedAt: true } })
    },
    async update(id, patch) {
      await prisma.article.update({ where: { id }, data: patch })
    },
    async findScheduled(now) {
      return prisma.article.findMany({
        where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
        select: { id: true, slug: true, title: true, status: true, scheduledAt: true, publishedAt: true },
      })
    },
  },
  service: {
    auditType: 'Service',
    supportsScheduling: false,
    hasPublishedAt: false,
    async find(id) {
      const s = await prisma.service.findUnique({ where: { id }, select: { id: true, slug: true, name: true, status: true } })
      return s ? { id: s.id, slug: s.slug, title: s.name, status: s.status, scheduledAt: null, publishedAt: null } : null
    },
    async update(id, patch) {
      await prisma.service.update({ where: { id }, data: { status: patch.status } })
    },
    async findScheduled() {
      return []
    },
  },
  resource: {
    auditType: 'Resource',
    supportsScheduling: false,
    hasPublishedAt: false,
    async find(id) {
      const r = await prisma.resource.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true } })
      return r ? { ...r, scheduledAt: null, publishedAt: null } : null
    },
    async update(id, patch) {
      await prisma.resource.update({ where: { id }, data: { status: patch.status } })
    },
    async findScheduled() {
      return []
    },
  },
  event: {
    auditType: 'Event',
    supportsScheduling: false,
    hasPublishedAt: true,
    async find(id) {
      const e = await prisma.event.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true, publishedAt: true } })
      return e ? { ...e, scheduledAt: null } : null
    },
    async update(id, patch) {
      await prisma.event.update({ where: { id }, data: { status: patch.status, publishedAt: patch.publishedAt } })
    },
    async findScheduled() {
      return []
    },
  },
  course: {
    auditType: 'Course',
    supportsScheduling: false,
    hasPublishedAt: true,
    async find(id) {
      const c = await prisma.course.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true, publishedAt: true } })
      return c ? { ...c, scheduledAt: null } : null
    },
    async update(id, patch) {
      await prisma.course.update({ where: { id }, data: { status: patch.status, publishedAt: patch.publishedAt } })
    },
    async findScheduled() {
      return []
    },
  },
}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

export interface TransitionResult {
  entityType: PublishableEntityType
  id: string
  slug: string
  title: string
  from: ContentStatus
  to: ContentStatus
  publishedAt: Date | null
  scheduledAt: Date | null
  /** Faux si le contenu était déjà dans le statut demandé (appel idempotent). */
  changed: boolean
}

export interface TransitionOptions {
  /** Date de publication planifiée (obligatoire pour SCHEDULED si le contenu n'en a pas). */
  scheduledAt?: Date | string | null
  comment?: string
  ctx?: RequestContext
}

/**
 * Change le statut éditorial d'un contenu.
 * - PUBLISHED / ARCHIVED exigent cms.publish (course.publish pour les cours) ;
 * - DRAFT / REVIEW / SCHEDULED exigent cms.write (course.author pour les cours) ;
 * - SCHEDULED exige une date future ; la publication renseigne publishedAt ;
 * - journalise `content.published` et émet l'événement `content.published`.
 */
export async function transition(
  entityType: PublishableEntityType,
  id: string,
  toStatus: ContentStatus,
  principal: Maybe<Principal>,
  options: TransitionOptions = {},
): Promise<TransitionResult> {
  const type = parseInput(publishableEntitySchema, entityType)
  const to = parseInput(contentStatusSchema, toStatus)
  const p = assertAny(principal, requiredActions(type, to))
  const adapter = adapters[type]
  const current = await adapter.find(id)
  if (!current) throw new NotFoundError('Contenu', id)

  const base = { entityType: type, id, slug: current.slug, title: current.title, from: current.status, to }
  if (current.status === to) {
    return { ...base, publishedAt: current.publishedAt, scheduledAt: current.scheduledAt, changed: false }
  }
  if (!canTransition(current.status, to)) {
    throw new PreconditionError(
      `Transition « ${contentStatusLabels[current.status]} » vers « ${contentStatusLabels[to]} » non autorisée`,
      { from: current.status, to, allowed: contentTransitions[current.status] },
    )
  }

  let scheduledAt: Date | null = null
  if (to === 'SCHEDULED') {
    if (!adapter.supportsScheduling) {
      throw new PreconditionError('La planification n’est pas disponible pour ce type de contenu', { entityType: type })
    }
    const requested = options.scheduledAt ? new Date(options.scheduledAt) : current.scheduledAt
    if (!requested || Number.isNaN(requested.getTime()) || requested.getTime() <= Date.now()) {
      throw new ValidationError('La date de publication planifiée doit être dans le futur', {
        fieldErrors: { scheduledAt: ['Date future requise'] },
      })
    }
    scheduledAt = requested
  }

  const now = new Date()
  const publishedAt = to === 'PUBLISHED' ? (current.publishedAt ?? now) : current.publishedAt
  await adapter.update(id, {
    status: to,
    ...(adapter.hasPublishedAt ? { publishedAt } : {}),
    ...(adapter.supportsScheduling ? { scheduledAt } : {}),
  })

  const action = to === 'PUBLISHED' ? 'content.published' : to === 'ARCHIVED' ? 'content.archived' : 'content.updated'
  await audit(action, { type: adapter.auditType, id }, auditCtx(p, options.ctx), {
    before: { status: current.status, scheduledAt: current.scheduledAt?.toISOString() ?? null },
    after: { status: to, scheduledAt: scheduledAt?.toISOString() ?? null, comment: options.comment ?? null },
  })
  if (to === 'PUBLISHED') {
    await emit(
      'content.published',
      { entityType: type, id, slug: current.slug, title: current.title, publishedAt: publishedAt?.toISOString() ?? now.toISOString() },
      { actorId: p.id },
    )
  }
  return { ...base, publishedAt: adapter.hasPublishedAt ? publishedAt : null, scheduledAt, changed: true }
}

export interface PublishScheduledResult {
  count: number
  items: Array<{ entityType: PublishableEntityType; id: string; slug: string; title: string; publishedAt: Date }>
}

/**
 * Publie les contenus SCHEDULED dont la date est atteinte (appelé par le job `content.publish-scheduled`).
 * La date de publication conservée est la date planifiée.
 */
export async function publishScheduled(now = new Date()): Promise<PublishScheduledResult> {
  const items: PublishScheduledResult['items'] = []
  for (const type of ['page', 'article'] as const) {
    const adapter = adapters[type]
    const due = await adapter.findScheduled(now)
    for (const entity of due) {
      const publishedAt = entity.scheduledAt ?? now
      await adapter.update(entity.id, { status: 'PUBLISHED', publishedAt, scheduledAt: null })
      await audit('content.published', { type: adapter.auditType, id: entity.id }, { actorEmail: 'system@fetrag.ga' }, {
        before: { status: 'SCHEDULED', scheduledAt: entity.scheduledAt?.toISOString() ?? null },
        after: { status: 'PUBLISHED', publishedAt: publishedAt.toISOString(), source: 'content.publish-scheduled' },
      })
      await emit('content.published', {
        entityType: type,
        id: entity.id,
        slug: entity.slug,
        title: entity.title,
        publishedAt: publishedAt.toISOString(),
        scheduled: true,
      })
      items.push({ entityType: type, id: entity.id, slug: entity.slug, title: entity.title, publishedAt })
    }
  }
  return { count: items.length, items }
}

/** Contenus planifiés à venir (tableau de bord éditorial) - cms.read_drafts. */
export async function listScheduled(principal: Maybe<Principal>): Promise<Array<{ entityType: 'page' | 'article'; id: string; slug: string; title: string; scheduledAt: Date | null }>> {
  assertAny(principal, ['cms.read_drafts'])
  const [pages, articles] = await Promise.all([
    prisma.page.findMany({ where: { status: 'SCHEDULED' }, select: { id: true, slug: true, title: true, scheduledAt: true }, orderBy: { scheduledAt: 'asc' } }),
    prisma.article.findMany({ where: { status: 'SCHEDULED' }, select: { id: true, slug: true, title: true, scheduledAt: true }, orderBy: { scheduledAt: 'asc' } }),
  ])
  return [
    ...pages.map((p) => ({ entityType: 'page' as const, ...p })),
    ...articles.map((a) => ({ entityType: 'article' as const, ...a })),
  ].sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0))
}
