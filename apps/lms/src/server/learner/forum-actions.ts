'use server'

import { revalidatePath } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'
import { idSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit } from '@fetrag/domain'
import { forums, moderationInputSchema, replyInputSchema, threadInputSchema } from '@fetrag/lms-core'
import { notifyRole, notifyUser } from '@fetrag/notifications'
import { z } from 'zod'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, zodFieldErrors, type ActionResult } from './errors'
import { requestMeta } from './meta'
import type { ForumFormState } from './types'

function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Nouveau fil de discussion (redirige vers le fil créé). */
export async function createThreadAction(_previous: ForumFormState, formData: FormData): Promise<ForumFormState> {
  const forumSlug = field(formData, 'forumSlug')
  const principal = await guards.requireUser(`/forums/${forumSlug}`)
  const values = { title: field(formData, 'title'), content: field(formData, 'content') }
  const parsed = threadInputSchema.safeParse({ forumSlug, ...values })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez le titre et le message.', fieldErrors: zodFieldErrors(parsed.error), values }
  }
  let threadId: string
  try {
    const thread = await forums.createThread(principal, parsed.data, await requestMeta())
    threadId = thread.id
    revalidatePath(`/forums/${forumSlug}`)
    revalidatePath('/forums')
  } catch (error) {
    unstable_rethrow(error)
    const failure = actionFailure(error)
    return { status: 'error', message: failure.ok ? undefined : failure.error, values }
  }
  redirect(`/forums/${forumSlug}/${threadId}`)
}

/** Réponse dans un fil (réponse imbriquée facultative). */
export async function replyAction(_previous: ForumFormState, formData: FormData): Promise<ForumFormState> {
  const forumSlug = field(formData, 'forumSlug')
  const threadId = field(formData, 'threadId')
  const principal = await guards.requireUser(`/forums/${forumSlug}/${threadId}`)
  const values = { content: field(formData, 'content') }
  const parentId = field(formData, 'parentId')
  const parsed = replyInputSchema.safeParse({ threadId, content: values.content, parentId: parentId || null })
  if (!parsed.success) {
    return { status: 'error', message: 'Votre message est vide ou trop long.', fieldErrors: zodFieldErrors(parsed.error), values }
  }
  try {
    await forums.reply(principal, parsed.data, await requestMeta())
    revalidatePath(`/forums/${forumSlug}/${threadId}`)
    revalidatePath(`/forums/${forumSlug}`)
    return { status: 'success', message: 'Réponse publiée.' }
  } catch (error) {
    unstable_rethrow(error)
    const failure = actionFailure(error)
    return { status: 'error', message: failure.ok ? undefined : failure.error, values }
  }
}

const moderationActionSchema = moderationInputSchema.extend({ forumSlug: z.string().min(1).max(160), threadId: idSchema.optional() })

/** Modération (formateur, coordination) : masquer, verrouiller, épingler, supprimer. */
export async function moderateAction(input: z.input<typeof moderationActionSchema>): Promise<ActionResult<{ deleted: boolean }>> {
  const principal = await guards.requireUser('/forums')
  try {
    const data = moderationActionSchema.parse(input)
    const result = await forums.moderate(principal, { targetType: data.targetType, targetId: data.targetId, action: data.action, reason: data.reason }, await requestMeta())
    revalidatePath(`/forums/${data.forumSlug}`)
    if (data.threadId) revalidatePath(`/forums/${data.forumSlug}/${data.threadId}`)
    return actionSuccess({ deleted: result === null })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}

const reportSchema = z.object({
  postId: idSchema,
  forumSlug: z.string().min(1).max(160),
  threadId: idSchema,
  reason: z.string().trim().min(3, 'Précisez le motif (3 caractères minimum)').max(500),
})

/**
 * Signalement simple d'un message : journalisé dans l'audit, notifié au formateur de la cohorte
 * (ou aux coordinateurs à défaut). Helper local : lms-core ne propose pas de signalement.
 */
export async function reportPostAction(input: z.input<typeof reportSchema>): Promise<ActionResult<null>> {
  const principal = await guards.requireUser('/forums')
  try {
    const data = reportSchema.parse(input)
    const post = await prisma.forumPost.findUnique({
      where: { id: data.postId },
      select: { id: true, threadId: true, authorId: true, thread: { select: { title: true, forum: { select: { slug: true, cohort: { select: { trainerId: true } } } } } } },
    })
    if (!post || post.threadId !== data.threadId) return { ok: false, error: 'Message introuvable.', code: 'NOT_FOUND' }
    const meta = await requestMeta()
    await audit('content.updated', { type: 'ForumPost', id: post.id }, { actorId: principal.id, actorEmail: principal.email, ip: meta.ip, userAgent: meta.userAgent }, {
      after: { reported: true, reason: data.reason },
    })
    const href = `/forums/${post.thread.forum.slug}/${post.threadId}`
    const notification = {
      title: 'Message signalé',
      body: `Un participant signale un message dans « ${post.thread.title} » : ${data.reason}`,
      href,
      app: 'lms' as const,
      category: 'forum' as const,
    }
    const trainerId = post.thread.forum.cohort?.trainerId
    if (trainerId) await notifyUser(trainerId, notification)
    else await notifyRole('COORDINATOR', notification)
    return actionSuccess(null)
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}
