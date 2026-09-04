import { features } from '@fetrag/config'
import { idSchema } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, ForbiddenError, NotFoundError, paginationArgs, PreconditionError, toPaginated, uniqueSlug } from '@fetrag/domain'
import { z } from 'zod'
import { assertCan, auditContext, can, isCoordination, requirePrincipal } from './lib/access'
import { safeNotifyUser } from './lib/integrations'
import { stripHtml } from './lib/text'
import type { Principal, RequestMeta } from './types'

// -----------------------------------------------------------------------------
// Schémas d'entrée
// -----------------------------------------------------------------------------

export const forumInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  courseId: idSchema.nullable().optional(),
  cohortId: idSchema.nullable().optional(),
  isModerated: z.boolean().default(true),
})
export type ForumInput = z.input<typeof forumInputSchema>

export const threadInputSchema = z.object({
  forumId: idSchema.optional(),
  forumSlug: z.string().trim().min(1).max(160).optional(),
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(2).max(20000),
})
export type ThreadInput = z.input<typeof threadInputSchema>

export const replyInputSchema = z.object({
  threadId: idSchema,
  content: z.string().trim().min(1).max(20000),
  parentId: idSchema.nullable().optional(),
})
export type ReplyInput = z.input<typeof replyInputSchema>

export const moderationInputSchema = z.object({
  targetType: z.enum(['thread', 'post']),
  targetId: idSchema,
  action: z.enum(['hide', 'unhide', 'lock', 'unlock', 'pin', 'unpin', 'delete']),
  reason: z.string().trim().max(500).optional(),
})
export type ModerationInput = z.input<typeof moderationInputSchema>

type ForumAccess = { id: string; courseId: string | null; cohortId: string | null; activityId: string | null }

function assertForumsEnabled(): void {
  if (!features.forums()) throw new PreconditionError('Les forums sont désactivés')
}

// -----------------------------------------------------------------------------
// Accès (LMS-12 : inscrits, membres de cohorte, formateurs, coordination)
// -----------------------------------------------------------------------------

/** Le principal peut-il modérer ce forum (formateur du cours / de la cohorte, coordination) ? */
export async function canModerate(p: Principal, forum: ForumAccess): Promise<boolean> {
  if (isCoordination(p)) return true
  if (forum.cohortId) {
    const cohort = await prisma.cohort.findUnique({ where: { id: forum.cohortId }, select: { trainerId: true, courseId: true } })
    if (cohort?.trainerId === p.id) return true
    if (can(p, 'cohort.teach', { cohortId: forum.cohortId, courseId: cohort?.courseId ?? forum.courseId })) return true
  }
  if (forum.courseId && can(p, 'course.teach', { courseId: forum.courseId })) return true
  if (!forum.courseId && !forum.cohortId) return can(p, 'cohort.manage')
  return false
}

/** Le principal peut-il lire et participer à ce forum ? */
export async function canAccess(p: Principal, forum: ForumAccess): Promise<boolean> {
  if (await canModerate(p, forum)) return true
  if (forum.cohortId) {
    const member = await prisma.cohortMember.findUnique({ where: { cohortId_userId: { cohortId: forum.cohortId, userId: p.id } }, select: { id: true } })
    return Boolean(member)
  }
  if (forum.courseId) {
    const enrollment = await prisma.enrollment.findFirst({ where: { userId: p.id, courseId: forum.courseId, status: { in: ['ACTIVE', 'COMPLETED'] } }, select: { id: true } })
    return Boolean(enrollment)
  }
  return true
}

async function loadForum(where: { id?: string; slug?: string }) {
  const forum = await prisma.forum.findFirst({
    where: where.id ? { id: where.id } : { slug: where.slug },
    include: { course: { select: { id: true, slug: true, title: true } }, cohort: { select: { id: true, code: true, name: true, trainerId: true } }, activity: { select: { id: true, title: true } } },
  })
  if (!forum) throw new NotFoundError('Forum', where.id ?? where.slug)
  return forum
}

// -----------------------------------------------------------------------------
// Lecture
// -----------------------------------------------------------------------------

/** Forums accessibles au principal : cours suivis, cohortes, cours enseignés (tous pour la coordination). */
export async function listForUser(principal: Principal) {
  assertForumsEnabled()
  const p = requirePrincipal(principal)
  const where: Prisma.ForumWhereInput = isCoordination(p)
    ? {}
    : {
        OR: [
          { cohort: { members: { some: { userId: p.id } } } },
          { cohort: { trainerId: p.id } },
          { cohortId: null, course: { enrollments: { some: { userId: p.id, status: { in: ['ACTIVE', 'COMPLETED'] } } } } },
          { course: { trainers: { some: { userId: p.id } } } },
          { courseId: null, cohortId: null },
        ],
      }
  const forums = await prisma.forum.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      course: { select: { id: true, slug: true, title: true } },
      cohort: { select: { id: true, code: true, name: true } },
      _count: { select: { threads: true } },
      threads: { orderBy: { updatedAt: 'desc' }, take: 1, select: { id: true, title: true, updatedAt: true, author: { select: { id: true, name: true } } } },
    },
  })
  return forums.map((f) => ({ ...f, lastThread: f.threads[0] ?? null }))
}

export const threadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(200).optional(),
})

/** Forum et ses fils (épinglés d'abord), avec compteurs et droits de modération. */
export async function get(principal: Principal, slug: string, query: z.input<typeof threadListQuerySchema> = {}) {
  assertForumsEnabled()
  const p = requirePrincipal(principal)
  const forum = await loadForum({ slug })
  if (!(await canAccess(p, forum))) throw new NotFoundError('Forum', slug)
  const q = threadListQuerySchema.parse(query)
  const where: Prisma.ForumThreadWhereInput = { forumId: forum.id, ...(q.q ? { title: { contains: q.q, mode: 'insensitive' } } : {}) }
  const [threads, total] = await Promise.all([
    prisma.forumThread.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      ...paginationArgs(q),
      include: {
        author: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
        _count: { select: { posts: { where: { isHidden: false } } } },
        posts: { orderBy: { createdAt: 'desc' }, take: 1, where: { isHidden: false }, select: { createdAt: true, author: { select: { id: true, name: true } } } },
      },
    }),
    prisma.forumThread.count({ where }),
  ])
  return {
    forum: { ...forum, canModerate: await canModerate(p, forum) },
    threads: toPaginated(
      threads.map((t) => ({ ...t, replyCount: Math.max(0, t._count.posts - 1), lastPost: t.posts[0] ?? null })),
      total,
      q,
    ),
  }
}

/** Fil et messages (les messages masqués sont remplacés par un marqueur pour les non-modérateurs). */
export async function getThread(principal: Principal, threadId: string) {
  assertForumsEnabled()
  const p = requirePrincipal(principal)
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      forum: { include: { course: { select: { id: true, slug: true, title: true } }, cohort: { select: { id: true, code: true, name: true } } } },
      author: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
      posts: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true, firstName: true, lastName: true, image: true } } } },
    },
  })
  if (!thread) throw new NotFoundError('Fil de discussion', threadId)
  if (!(await canAccess(p, thread.forum))) throw new NotFoundError('Fil de discussion', threadId)
  const moderator = await canModerate(p, thread.forum)
  await prisma.forumThread.update({ where: { id: threadId }, data: { viewCount: { increment: 1 } } })
  return {
    ...thread,
    canModerate: moderator,
    canReply: !thread.isLocked && !thread.forum.isLocked,
    posts: thread.posts.map((post) => ({
      ...post,
      content: post.isHidden && !moderator ? '[Message masqué par la modération]' : post.content,
      isOwn: post.authorId === p.id,
    })),
  }
}

// -----------------------------------------------------------------------------
// Écriture
// -----------------------------------------------------------------------------

/** Nouveau fil (premier message inclus). */
export async function createThread(principal: Principal, input: ThreadInput, meta: RequestMeta = {}) {
  assertForumsEnabled()
  const p = requirePrincipal(principal)
  const data = threadInputSchema.parse(input)
  if (!data.forumId && !data.forumSlug) throw new PreconditionError('Forum non précisé')
  const forum = await loadForum(data.forumId ? { id: data.forumId } : { slug: data.forumSlug })
  if (!(await canAccess(p, forum))) throw new ForbiddenError("Vous n'avez pas accès à ce forum")
  if (forum.isLocked) throw new PreconditionError('Ce forum est verrouillé')
  const content = stripHtml(data.content)
  if (content.length < 2) throw new PreconditionError('Message vide')
  const thread = await prisma.forumThread.create({
    data: { forumId: forum.id, authorId: p.id, title: stripHtml(data.title), posts: { create: { authorId: p.id, content } } },
    include: { posts: true, author: { select: { id: true, name: true } } },
  })
  await audit('content.created', { type: 'ForumThread', id: thread.id }, auditContext(p, meta), { after: { forumId: forum.id, title: thread.title } })
  if (forum.cohort?.trainerId && forum.cohort.trainerId !== p.id) {
    await safeNotifyUser(forum.cohort.trainerId, { title: 'Nouveau fil de discussion', body: `${thread.author.name ?? 'Un participant'} : « ${thread.title} »`, href: `/forums/${forum.slug}/${thread.id}`, category: 'forum' })
  }
  return thread
}

/** Réponse dans un fil (avec réponse imbriquée optionnelle). Notifie l'auteur du fil. */
export async function reply(principal: Principal, input: ReplyInput, meta: RequestMeta = {}) {
  assertForumsEnabled()
  const p = requirePrincipal(principal)
  const data = replyInputSchema.parse(input)
  const thread = await prisma.forumThread.findUnique({ where: { id: data.threadId }, include: { forum: true } })
  if (!thread) throw new NotFoundError('Fil de discussion', data.threadId)
  if (!(await canAccess(p, thread.forum))) throw new ForbiddenError("Vous n'avez pas accès à ce forum")
  if (thread.isLocked || thread.forum.isLocked) throw new PreconditionError('Ce fil est verrouillé')
  if (data.parentId) {
    const parent = await prisma.forumPost.findUnique({ where: { id: data.parentId }, select: { threadId: true } })
    if (!parent || parent.threadId !== thread.id) throw new NotFoundError('Message', data.parentId)
  }
  const content = stripHtml(data.content)
  if (!content) throw new PreconditionError('Message vide')
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.forumPost.create({
      data: { threadId: thread.id, authorId: p.id, content, parentId: data.parentId ?? null },
      include: { author: { select: { id: true, name: true, firstName: true, lastName: true, image: true } } },
    })
    await tx.forumThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } })
    return created
  })
  await audit('content.created', { type: 'ForumPost', id: post.id }, auditContext(p, meta), { after: { threadId: thread.id } })
  if (thread.authorId !== p.id) {
    await safeNotifyUser(thread.authorId, { title: 'Nouvelle réponse', body: `Réponse dans « ${thread.title} ».`, href: `/forums/${thread.forum.slug}/${thread.id}`, category: 'forum' })
  }
  return post
}

/** Modification de son propre message (dans les 24 h) ou par un modérateur. */
export async function editPost(principal: Principal, postId: string, content: string, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const post = await prisma.forumPost.findUnique({ where: { id: postId }, include: { thread: { include: { forum: true } } } })
  if (!post) throw new NotFoundError('Message', postId)
  const moderator = await canModerate(p, post.thread.forum)
  const own = post.authorId === p.id && Date.now() - post.createdAt.getTime() < 24 * 3600 * 1000
  if (!moderator && !own) throw new ForbiddenError('Modification refusée')
  const clean = stripHtml(z.string().trim().min(1).max(20000).parse(content))
  const updated = await prisma.forumPost.update({ where: { id: postId }, data: { content: clean } })
  await audit('content.updated', { type: 'ForumPost', id: postId }, auditContext(p, meta))
  return updated
}

/** Modération : masquer / démasquer un message, verrouiller / épingler un fil, supprimer. */
export async function moderate(principal: Principal, input: ModerationInput, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const data = moderationInputSchema.parse(input)

  if (data.targetType === 'thread') {
    const thread = await prisma.forumThread.findUnique({ where: { id: data.targetId }, include: { forum: true } })
    if (!thread) throw new NotFoundError('Fil de discussion', data.targetId)
    if (!(await canModerate(p, thread.forum))) throw new ForbiddenError('Modération refusée')
    let result
    switch (data.action) {
      case 'lock':
      case 'unlock':
        result = await prisma.forumThread.update({ where: { id: thread.id }, data: { isLocked: data.action === 'lock' } })
        break
      case 'pin':
      case 'unpin':
        result = await prisma.forumThread.update({ where: { id: thread.id }, data: { isPinned: data.action === 'pin' } })
        break
      case 'hide':
      case 'unhide':
        await prisma.forumPost.updateMany({ where: { threadId: thread.id }, data: { isHidden: data.action === 'hide', hiddenReason: data.action === 'hide' ? (data.reason ?? null) : null } })
        result = await prisma.forumThread.update({ where: { id: thread.id }, data: { isLocked: data.action === 'hide' ? true : thread.isLocked } })
        break
      case 'delete':
        await prisma.forumThread.delete({ where: { id: thread.id } })
        result = null
        break
    }
    await audit('content.updated', { type: 'ForumThread', id: thread.id }, auditContext(p, meta), { after: { moderation: data.action, reason: data.reason ?? null } })
    return result
  }

  const post = await prisma.forumPost.findUnique({ where: { id: data.targetId }, include: { thread: { include: { forum: true } } } })
  if (!post) throw new NotFoundError('Message', data.targetId)
  if (!(await canModerate(p, post.thread.forum))) throw new ForbiddenError('Modération refusée')
  let result
  switch (data.action) {
    case 'hide':
    case 'unhide':
      result = await prisma.forumPost.update({ where: { id: post.id }, data: { isHidden: data.action === 'hide', hiddenReason: data.action === 'hide' ? (data.reason ?? null) : null } })
      break
    case 'delete':
      await prisma.forumPost.delete({ where: { id: post.id } })
      result = null
      break
    default:
      throw new PreconditionError(`Action ${data.action} non applicable à un message`)
  }
  await audit('content.updated', { type: 'ForumPost', id: post.id }, auditContext(p, meta), { after: { moderation: data.action, reason: data.reason ?? null } })
  if (data.action === 'hide' && post.authorId !== p.id) {
    await safeNotifyUser(post.authorId, { title: 'Message masqué', body: `Un de vos messages a été masqué par la modération.${data.reason ? ' Motif : ' + data.reason : ''}`, href: `/forums/${post.thread.forum.slug}/${post.threadId}`, category: 'forum' })
  }
  return result
}

/** Création d'un forum de cours ou de cohorte (coordination / formateur du cours). */
export async function createForum(principal: Principal, input: ForumInput, meta: RequestMeta = {}) {
  const data = forumInputSchema.parse(input)
  const p = data.courseId ? assertCan(principal, 'course.teach', { courseId: data.courseId, cohortId: data.cohortId ?? null }) : assertCan(principal, 'cohort.manage')
  if (data.cohortId) {
    const cohort = await prisma.cohort.findUnique({ where: { id: data.cohortId }, select: { courseId: true } })
    if (!cohort) throw new NotFoundError('Cohorte', data.cohortId)
    if (data.courseId && cohort.courseId !== data.courseId) throw new PreconditionError('La cohorte ne correspond pas au cours')
  }
  const forum = await prisma.forum.create({
    data: {
      slug: await uniqueSlug(data.title, async (c) => Boolean(await prisma.forum.findUnique({ where: { slug: c }, select: { id: true } }))),
      title: data.title,
      description: data.description ?? null,
      courseId: data.courseId ?? null,
      cohortId: data.cohortId ?? null,
      isModerated: data.isModerated,
    },
  })
  await audit('content.created', { type: 'Forum', id: forum.id }, auditContext(p, meta), { after: { title: forum.title } })
  return forum
}

/** Verrouillage / déverrouillage global d'un forum. */
export async function setLocked(principal: Principal, forumId: string, isLocked: boolean, meta: RequestMeta = {}) {
  const p = requirePrincipal(principal)
  const forum = await loadForum({ id: forumId })
  if (!(await canModerate(p, forum))) throw new ForbiddenError('Modération refusée')
  const updated = await prisma.forum.update({ where: { id: forumId }, data: { isLocked } })
  await audit('content.updated', { type: 'Forum', id: forumId }, auditContext(p, meta), { after: { isLocked } })
  return updated
}
