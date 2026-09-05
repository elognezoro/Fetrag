import 'server-only'
import { cache } from 'react'
import { prisma } from '@fetrag/db'
import { isDomainError, type Principal } from '@fetrag/domain'
import { forums } from '@fetrag/lms-core'

/** Titre d'un forum pour les métadonnées (helper local prisma : sans effet de bord ni chargement des fils). */
export const getForumTitle = cache(async (slug: string): Promise<string | null> => {
  const forum = await prisma.forum.findUnique({ where: { slug }, select: { title: true } })
  return forum?.title ?? null
})

/** Titre d'un fil pour les métadonnées (helper local prisma : `forums.getThread` incrémente le compteur de vues). */
export const getThreadTitle = cache(async (threadId: string): Promise<string | null> => {
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId }, select: { title: true } })
  return thread?.title ?? null
})

/** Lecteurs des forums : les erreurs métier « introuvable / accès refusé » deviennent `null` (page 404). */

export type ForumListItem = Awaited<ReturnType<typeof forums.listForUser>>[number]
export type ForumView = Awaited<ReturnType<typeof forums.get>>
export type ThreadView = Awaited<ReturnType<typeof forums.getThread>>

function nullOnDomainError(error: unknown): null {
  if (isDomainError(error)) return null
  throw error
}

export async function listMyForums(principal: Principal): Promise<ForumListItem[]> {
  try {
    return await forums.listForUser(principal)
  } catch (error) {
    if (isDomainError(error)) return []
    throw error
  }
}

export async function getForumView(principal: Principal, slug: string, query: { page?: number; q?: string } = {}): Promise<ForumView | null> {
  return forums.get(principal, slug, query).catch(nullOnDomainError)
}

export async function getThreadView(principal: Principal, threadId: string): Promise<ThreadView | null> {
  return forums.getThread(principal, threadId).catch(nullOnDomainError)
}
