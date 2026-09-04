import { notifyRole, notifyUser, notificationCategories, type NotificationCategory } from '@fetrag/notifications'
import { parseNotificationDispatch } from '../payloads'
import type { JobHandler } from '../types'

function toCategory(value: string | undefined): NotificationCategory | undefined {
  if (!value) return undefined
  return (notificationCategories as readonly string[]).includes(value) ? (value as NotificationCategory) : 'general'
}

/** Envoi différé d'une notification interne (+ email optionnel) à un utilisateur ou à un rôle global. */
export const notificationDispatchHandler: JobHandler = async (payload) => {
  const input = parseNotificationDispatch(payload)
  const notify = {
    title: input.title,
    body: input.body,
    href: input.href,
    app: input.app,
    category: toCategory(input.category),
    email: input.email,
  }
  if (input.userId) return notifyUser(input.userId, notify)
  if (input.role) {
    const result = await notifyRole(input.role, notify)
    return { count: result.count }
  }
  return { count: 0 }
}
