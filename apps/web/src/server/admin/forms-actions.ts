'use server'

import { revalidatePath } from 'next/cache'
import { forms, formSubmissionStatuses, newsletter } from '@fetrag/cms'
import { idSchema, z } from '@fetrag/contracts'
import type { FormSubmissionStatus } from '@fetrag/db'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { relationId, successState, text, toErrorState } from './form-helpers'

/** Change le statut d'un message reçu (nouveau, attribué, répondu, clôturé, indésirable). */
export async function setMessageStatusAction(id: string, status: string): Promise<ActionState> {
  const parsed = z.object({ id: idSchema, status: z.enum(formSubmissionStatuses) }).safeParse({ id, status })
  if (!parsed.success) return { status: 'error', message: 'Statut invalide.' }
  try {
    const principal = await requireActionCan('forms.read')
    const ctx = await adminRequestContext()
    const submission = await forms.setStatus(parsed.data.id, parsed.data.status as FormSubmissionStatus, principal, ctx)
    revalidatePath('/admin/messages', 'layout')
    revalidatePath('/espace/demandes')
    return successState(`Message ${submission.reference} mis à jour.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Attribue un message à un membre de l'équipe. */
export async function assignMessageAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ id: idSchema, assignedTo: idSchema.nullable() }).safeParse({ id: text(formData, 'id'), assignedTo: relationId(formData, 'assignedTo') })
  if (!parsed.success) return { status: 'error', message: 'Attribution invalide.', fieldErrors: { assignedTo: 'Responsable invalide' } }
  try {
    const principal = await requireActionCan('forms.read')
    const ctx = await adminRequestContext()
    await forms.assign(parsed.data.id, parsed.data.assignedTo, principal, ctx)
    revalidatePath('/admin/messages', 'layout')
    return successState(parsed.data.assignedTo ? 'Message attribué.' : 'Attribution retirée.')
  } catch (error) {
    return toErrorState(error)
  }
}

/** Supprime un message indésirable ou clôturé. */
export async function deleteMessageAction(id: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return { status: 'error', message: 'Message inconnu.' }
  try {
    const principal = await requireActionCan('forms.read')
    const ctx = await adminRequestContext()
    await forms.remove(parsed.data, principal, ctx)
    revalidatePath('/admin/messages', 'layout')
    return successState('Message supprimé.')
  } catch (error) {
    return toErrorState(error)
  }
}

/** Supprime un abonné de la lettre d'information (droit à l'effacement). */
export async function deleteSubscriptionAction(id: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return { status: 'error', message: 'Abonnement inconnu.' }
  try {
    const principal = await requireActionCan('forms.read')
    const ctx = await adminRequestContext()
    await newsletter.remove(parsed.data, principal, ctx)
    revalidatePath('/admin/newsletter')
    return successState('Abonné supprimé.')
  } catch (error) {
    return toErrorState(error)
  }
}
