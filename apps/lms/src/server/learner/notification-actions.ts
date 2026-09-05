'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { idSchema } from '@fetrag/contracts'
import { markAllNotificationsRead, markNotificationRead } from '@fetrag/notifications'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, type ActionResult } from './errors'

/** Marque une notification interne comme lue (ignorée si elle n'appartient pas à l'utilisateur). */
export async function markNotificationReadAction(notificationId: string): Promise<ActionResult<{ updated: boolean }>> {
  const principal = await guards.requireUser('/dashboard')
  try {
    const id = idSchema.parse(notificationId)
    const updated = await markNotificationRead(principal.id, id)
    revalidatePath('/dashboard')
    return actionSuccess({ updated })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>> {
  const principal = await guards.requireUser('/dashboard')
  try {
    const count = await markAllNotificationsRead(principal.id)
    revalidatePath('/dashboard')
    return actionSuccess({ count })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}
