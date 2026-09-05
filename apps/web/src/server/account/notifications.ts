'use server'

import { revalidatePath } from 'next/cache'
import { idSchema } from '@fetrag/contracts'
import { markAllNotificationsRead, markNotificationRead } from '@fetrag/notifications'
import { guards } from '@/lib/auth'
import { successState, toErrorState, type ActionState } from './common'

/** Marque une notification comme lue (uniquement celles du principal). */
export async function markNotificationReadAction(notificationId: string): Promise<ActionState> {
  const principal = await guards.requireUser('/espace/notifications')
  const parsed = idSchema.safeParse(notificationId)
  if (!parsed.success) return { status: 'error', message: 'Notification inconnue.' }
  try {
    await markNotificationRead(principal.id, parsed.data)
    revalidatePath('/espace', 'layout')
    return successState('Notification marquée comme lue.')
  } catch (error) {
    return toErrorState(error)
  }
}

/** Marque toutes les notifications non lues du principal comme lues. */
export async function markAllNotificationsReadAction(): Promise<ActionState> {
  const principal = await guards.requireUser('/espace/notifications')
  try {
    const count = await markAllNotificationsRead(principal.id)
    revalidatePath('/espace', 'layout')
    return successState(count > 0 ? `${count} notification${count > 1 ? 's' : ''} marquée${count > 1 ? 's' : ''} comme lue${count > 1 ? 's' : ''}.` : 'Aucune notification à marquer.')
  } catch (error) {
    return toErrorState(error)
  }
}
