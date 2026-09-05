'use server'

import { revalidatePath } from 'next/cache'
import { idSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit } from '@fetrag/domain'
import { cancelJob, retryJob } from '@fetrag/jobs'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { successState, toErrorState } from './form-helpers'

/** Relance un job en échec ou abandonné (settings.manage) : remis en file immédiatement, compteur de tentatives remis à zéro. */
export async function retryJobAction(jobId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(jobId)
  if (!parsed.success) return { status: 'error', message: 'Tâche inconnue.' }
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const before = await prisma.backgroundJob.findUnique({ where: { id: parsed.data }, select: { status: true, attempts: true, type: true } })
    const job = await retryJob(parsed.data)
    await audit('settings.updated', { type: 'BackgroundJob', id: job.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: before ? { status: before.status, attempts: before.attempts } : undefined,
      after: { status: job.status, type: job.type, action: 'retry' },
    })
    revalidatePath('/admin/parametres')
    revalidatePath('/admin')
    return successState(`Tâche « ${job.type} » remise en file.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Annule un job non encore exécuté (settings.manage) : statut DEAD avec motif explicite. */
export async function cancelJobAction(jobId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(jobId)
  if (!parsed.success) return { status: 'error', message: 'Tâche inconnue.' }
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const before = await prisma.backgroundJob.findUnique({ where: { id: parsed.data }, select: { status: true, type: true } })
    if (!before) return { status: 'error', message: 'Tâche introuvable.' }
    const cancelled = await cancelJob(parsed.data, `Annulée par ${principal.email}`)
    if (!cancelled) return { status: 'error', message: 'Seules les tâches en file ou en échec peuvent être annulées.' }
    await audit('settings.updated', { type: 'BackgroundJob', id: parsed.data }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { status: before.status },
      after: { status: 'DEAD', type: before.type, action: 'cancel' },
    })
    revalidatePath('/admin/parametres')
    revalidatePath('/admin')
    return successState(`Tâche « ${before.type} » annulée.`)
  } catch (error) {
    return toErrorState(error)
  }
}
