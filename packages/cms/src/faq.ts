// Questions fréquentes : CRUD éditorial et lecteur public par groupe.
import { prisma, type Faq, type Prisma } from '@fetrag/db'
import type { Paginated } from '@fetrag/contracts'
import { audit, can, NotFoundError, paginationArgs, safeOrderBy, toPaginated, type Principal } from '@fetrag/domain'
import { assertCan, auditCtx, contains, parseInput, type Maybe, type RequestContext } from './common'
import { sanitizeHtml } from './sanitize'
import { faqInputSchema, faqListQuerySchema, faqUpdateSchema, type FaqInput } from './schemas'
import type { z } from 'zod'

export type FaqListQuery = z.input<typeof faqListQuerySchema>

const sortable = ['question', 'group', 'position', 'isActive'] as const

/** Liste paginée ; sans principal éditorial, seules les questions actives sont renvoyées. */
export async function list(query: FaqListQuery = {}, principal?: Maybe<Principal>): Promise<Paginated<Faq>> {
  const q = parseInput(faqListQuerySchema, query)
  const editorial = can(principal, 'cms.read_drafts')
  const where: Prisma.FaqWhereInput = {
    ...(editorial ? (q.isActive !== undefined ? { isActive: q.isActive } : {}) : { isActive: true }),
    ...(q.group ? { group: q.group } : {}),
    ...(q.q ? { OR: [{ question: contains(q.q) }, { answer: contains(q.q) }] } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.faq.findMany({
      where,
      ...paginationArgs(q),
      orderBy: q.sort ? safeOrderBy(q.sort, q.order, sortable, 'position') : [{ group: 'asc' }, { position: 'asc' }],
    }),
    prisma.faq.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Entrée de FAQ par identifiant. */
export async function getById(id: string): Promise<Faq> {
  const faq = await prisma.faq.findUnique({ where: { id } })
  if (!faq) throw new NotFoundError('Question', id)
  return faq
}

/** Questions actives (réponses assainies), optionnellement filtrées par groupe. */
export async function listActive(group?: string): Promise<Faq[]> {
  const rows = await prisma.faq.findMany({
    where: { isActive: true, ...(group ? { group } : {}) },
    orderBy: [{ group: 'asc' }, { position: 'asc' }],
  })
  return rows.map((row) => ({ ...row, answer: sanitizeHtml(row.answer) }))
}

/** Groupes existants avec le nombre de questions actives. */
export async function listGroups(): Promise<Array<{ group: string; count: number }>> {
  const rows = await prisma.faq.groupBy({ by: ['group'], where: { isActive: true }, _count: { _all: true }, orderBy: { group: 'asc' } })
  return rows.map((r) => ({ group: r.group, count: r._count._all }))
}

/** Crée une question (cms.write) ; la réponse HTML est assainie. */
export async function create(input: FaqInput, principal: Maybe<Principal>, ctx?: RequestContext): Promise<Faq> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(faqInputSchema, input)
  const faq = await prisma.faq.create({
    data: { question: data.question, answer: sanitizeHtml(data.answer), group: data.group, position: data.position, isActive: data.isActive },
  })
  await audit('content.created', { type: 'Faq', id: faq.id }, auditCtx(p, ctx), { after: { question: data.question, group: data.group } })
  return faq
}

/** Met à jour une question (cms.write). */
export async function update(id: string, input: z.input<typeof faqUpdateSchema>, principal: Maybe<Principal>, ctx?: RequestContext): Promise<Faq> {
  const p = assertCan(principal, 'cms.write')
  const data = parseInput(faqUpdateSchema, input)
  const existing = await getById(id)
  const faq = await prisma.faq.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer !== undefined ? sanitizeHtml(data.answer) : undefined,
      group: data.group,
      position: data.position,
      isActive: data.isActive,
    },
  })
  await audit('content.updated', { type: 'Faq', id }, auditCtx(p, ctx), {
    before: { question: existing.question, isActive: existing.isActive },
    after: { question: faq.question, isActive: faq.isActive },
  })
  return faq
}

/** Supprime une question (cms.write). */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'cms.write')
  const existing = await getById(id)
  await prisma.faq.delete({ where: { id } })
  await audit('content.archived', { type: 'Faq', id }, auditCtx(p, ctx), { before: { question: existing.question }, after: { deleted: true } })
}

/** Réordonne les questions d'un groupe selon l'ordre des identifiants (cms.write). */
export async function reorder(ids: string[], principal: Maybe<Principal>): Promise<void> {
  assertCan(principal, 'cms.write')
  await prisma.$transaction(ids.map((id, position) => prisma.faq.update({ where: { id }, data: { position } })))
}
