// Historique des versions de pages (PageRevision) : consultation, instantané, restauration.
import { prisma, type PageRevision, type Prisma } from '@fetrag/db'
import { paginationQuerySchema, type Paginated } from '@fetrag/contracts'
import { audit, NotFoundError, paginationArgs, PreconditionError, toPaginated, type Principal } from '@fetrag/domain'
import { assertCan, auditCtx, parseInput, toJson, type Maybe, type RequestContext } from './common'
import { parseBlocks } from './pages'
import type { PageBlocks } from './schemas'

const summarySelect = {
  id: true,
  pageId: true,
  version: true,
  title: true,
  editedBy: true,
  createdAt: true,
} satisfies Prisma.PageRevisionSelect

export type RevisionSummary = Prisma.PageRevisionGetPayload<{ select: typeof summarySelect }> & {
  editor: { id: string; name: string | null; email: string } | null
}

export type RevisionDetail = Omit<PageRevision, 'blocks'> & { blocks: PageBlocks | null }

/** Liste paginée des révisions d'une page, de la plus récente à la plus ancienne (cms.read_drafts). */
export async function list(
  pageId: string,
  principal: Maybe<Principal>,
  query: { page?: number; pageSize?: number } = {},
): Promise<Paginated<RevisionSummary>> {
  assertCan(principal, 'cms.read_drafts')
  const q = parseInput(paginationQuerySchema, query)
  const where: Prisma.PageRevisionWhereInput = { pageId }
  const [rows, total] = await prisma.$transaction([
    prisma.pageRevision.findMany({ where, ...paginationArgs(q), orderBy: { version: 'desc' }, select: summarySelect }),
    prisma.pageRevision.count({ where }),
  ])
  const editorIds = [...new Set(rows.map((r) => r.editedBy).filter((v): v is string => Boolean(v)))]
  const editors = editorIds.length
    ? await prisma.user.findMany({ where: { id: { in: editorIds } }, select: { id: true, name: true, email: true } })
    : []
  const byId = new Map(editors.map((e) => [e.id, e]))
  const items = rows.map((r) => ({ ...r, editor: r.editedBy ? (byId.get(r.editedBy) ?? null) : null }))
  return toPaginated(items, total, q)
}

/** Révision complète (contenu et blocs) - cms.read_drafts. */
export async function getById(id: string, principal: Maybe<Principal>): Promise<RevisionDetail> {
  assertCan(principal, 'cms.read_drafts')
  const revision = await prisma.pageRevision.findUnique({ where: { id } })
  if (!revision) throw new NotFoundError('Révision', id)
  return { ...revision, blocks: parseBlocks(revision.blocks) }
}

/** Crée un instantané manuel de l'état courant de la page (version++) - cms.write. */
export async function create(pageId: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<RevisionDetail> {
  const p = assertCan(principal, 'cms.write')
  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) throw new NotFoundError('Page', pageId)
  const version = page.version + 1
  const [, revision] = await prisma.$transaction([
    prisma.page.update({ where: { id: pageId }, data: { version } }),
    prisma.pageRevision.create({
      data: { pageId, version, title: page.title, content: page.content, blocks: toJson(page.blocks), editedBy: p.id },
    }),
  ])
  await audit('content.updated', { type: 'Page', id: pageId }, auditCtx(p, ctx), { after: { snapshotVersion: version } })
  return { ...revision, blocks: parseBlocks(revision.blocks) }
}

/**
 * Restaure une révision : le titre, le contenu et les blocs de la page sont remplacés
 * et une nouvelle révision (version++) matérialise la restauration - cms.write.
 */
export async function restore(revisionId: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<RevisionDetail> {
  const p = assertCan(principal, 'cms.write')
  const revision = await prisma.pageRevision.findUnique({ where: { id: revisionId }, include: { page: true } })
  if (!revision) throw new NotFoundError('Révision', revisionId)
  const version = revision.page.version + 1
  const [, created] = await prisma.$transaction([
    prisma.page.update({
      where: { id: revision.pageId },
      data: { title: revision.title, content: revision.content, blocks: toJson(revision.blocks), version },
    }),
    prisma.pageRevision.create({
      data: {
        pageId: revision.pageId,
        version,
        title: revision.title,
        content: revision.content,
        blocks: toJson(revision.blocks),
        editedBy: p.id,
      },
    }),
  ])
  await audit('content.updated', { type: 'Page', id: revision.pageId }, auditCtx(p, ctx), {
    before: { version: revision.page.version },
    after: { version, restoredFrom: revision.version },
  })
  return { ...created, blocks: parseBlocks(created.blocks) }
}

/** Supprime une révision (cms.publish). La dernière révision d'une page ne peut pas être supprimée. */
export async function remove(revisionId: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.publish')
  const revision = await prisma.pageRevision.findUnique({ where: { id: revisionId }, select: { id: true, pageId: true, version: true } })
  if (!revision) throw new NotFoundError('Révision', revisionId)
  const count = await prisma.pageRevision.count({ where: { pageId: revision.pageId } })
  if (count <= 1) throw new PreconditionError('La dernière révision d’une page ne peut pas être supprimée')
  await prisma.pageRevision.delete({ where: { id: revisionId } })
  await audit('content.updated', { type: 'Page', id: revision.pageId }, auditCtx(p, ctx), {
    before: { deletedRevision: revision.version },
  })
}

export interface RevisionComparison {
  from: RevisionSummary
  to: RevisionSummary
  changed: Array<'title' | 'content' | 'blocks'>
}

/** Compare deux révisions d'une même page et indique les champs modifiés. */
export async function compare(fromId: string, toId: string, principal: Maybe<Principal>): Promise<RevisionComparison> {
  assertCan(principal, 'cms.read_drafts')
  const [from, to] = await Promise.all([
    prisma.pageRevision.findUnique({ where: { id: fromId } }),
    prisma.pageRevision.findUnique({ where: { id: toId } }),
  ])
  if (!from) throw new NotFoundError('Révision', fromId)
  if (!to) throw new NotFoundError('Révision', toId)
  if (from.pageId !== to.pageId) throw new PreconditionError('Les révisions comparées doivent appartenir à la même page')
  const changed: RevisionComparison['changed'] = []
  if (from.title !== to.title) changed.push('title')
  if (from.content !== to.content) changed.push('content')
  if (JSON.stringify(from.blocks ?? null) !== JSON.stringify(to.blocks ?? null)) changed.push('blocks')
  const summarize = (r: PageRevision): RevisionSummary => ({
    id: r.id,
    pageId: r.pageId,
    version: r.version,
    title: r.title,
    editedBy: r.editedBy,
    createdAt: r.createdAt,
    editor: null,
  })
  return { from: summarize(from), to: summarize(to), changed }
}
