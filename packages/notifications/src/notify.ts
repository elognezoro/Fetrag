import { prisma, type Role } from '@fetrag/db'
import { resolvePublicUrl } from '@fetrag/config'
import { ValidationError } from '@fetrag/domain'
import { sendEmail, type SendEmailStatus } from './send-email'
import { notificationCategories, type NotificationCategory } from './templates/types'

export interface NotifyInput {
  title: string
  body: string
  /** Lien relatif (`/espace/...`) ou absolu. */
  href?: string
  /** Application ciblée par un lien relatif (par défaut `web`). */
  app?: 'web' | 'lms'
  category?: NotificationCategory
  /** Envoyer aussi un email (si les préférences de l'utilisateur ne l'interdisent pas). */
  email?: boolean
  /** Template email dédié (par défaut `notification`) et variables supplémentaires. */
  emailTemplate?: string
  emailVariables?: Record<string, string | number | boolean | Date | null | undefined>
}

export interface NotifyResult {
  notificationId: string | null
  emailStatus: SendEmailStatus | 'NOT_REQUESTED' | 'DISABLED' | 'NO_RECIPIENT'
}

/** Catégories dont l'email n'est jamais désactivable par préférence (sécurité, paiements, compte). */
const ALWAYS_EMAIL_CATEGORIES: ReadonlySet<NotificationCategory> = new Set(['security', 'payments', 'account'])

function validate(input: NotifyInput): Required<Pick<NotifyInput, 'title' | 'body' | 'category'>> & NotifyInput {
  const title = input.title?.trim() ?? ''
  const body = input.body?.trim() ?? ''
  if (title.length < 1 || title.length > 160) throw new ValidationError('Titre de notification invalide', { field: 'title' })
  if (body.length < 1 || body.length > 4000) throw new ValidationError('Corps de notification invalide', { field: 'body' })
  const category = input.category ?? 'general'
  if (!notificationCategories.includes(category)) {
    throw new ValidationError('Catégorie de notification inconnue', { field: 'category', category })
  }
  if (input.href && input.href.length > 600) throw new ValidationError('Lien trop long', { field: 'href' })
  if (input.href && !/^(\/|https?:\/\/)/.test(input.href)) {
    throw new ValidationError('Lien de notification invalide', { field: 'href' })
  }
  return { ...input, title, body, category }
}

function absoluteHref(href: string | undefined, app: 'web' | 'lms'): string | undefined {
  if (!href) return undefined
  if (/^https?:\/\//.test(href)) return href
  return `${resolvePublicUrl(app)}${href}`
}

/** Une préférence explicitement désactivée bloque le canal pour la catégorie. */
async function channelEnabled(userId: string, channel: 'IN_APP' | 'EMAIL', category: string): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_channel_category: { userId, channel, category } },
    select: { enabled: true },
  })
  return pref ? pref.enabled : true
}

/**
 * Crée une notification interne (IN_APP) et, sur demande, l'email correspondant.
 * L'email respecte `NotificationPreference` (canal EMAIL, catégorie) sauf pour les catégories essentielles.
 */
export async function notifyUser(userId: string, rawInput: NotifyInput): Promise<NotifyResult> {
  const input = validate(rawInput)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, name: true, isActive: true },
  })
  if (!user || !user.isActive) return { notificationId: null, emailStatus: 'NO_RECIPIENT' }

  const notification = await prisma.notification.create({
    data: {
      userId,
      channel: 'IN_APP',
      category: input.category,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      status: 'SENT',
      sentAt: new Date(),
    },
    select: { id: true },
  })

  if (!input.email) return { notificationId: notification.id, emailStatus: 'NOT_REQUESTED' }
  if (!ALWAYS_EMAIL_CATEGORIES.has(input.category) && !(await channelEnabled(userId, 'EMAIL', input.category))) {
    return { notificationId: notification.id, emailStatus: 'DISABLED' }
  }

  const firstName = user.firstName ?? user.name?.split(' ')[0] ?? ''
  const result = await sendEmail({
    to: user.email,
    userId,
    template: input.emailTemplate ?? 'notification',
    variables: {
      firstName,
      title: input.title,
      body: input.body,
      href: absoluteHref(input.href, input.app ?? 'web'),
      ...(input.emailVariables ?? {}),
    },
  })
  return { notificationId: notification.id, emailStatus: result.status }
}

/** Notifie tous les utilisateurs actifs détenant un rôle global (ex. COORDINATOR). */
export async function notifyRole(role: Role, input: NotifyInput): Promise<{ count: number; results: NotifyResult[] }> {
  const now = new Date()
  const assignments = await prisma.roleAssignment.findMany({
    where: {
      role,
      scopeType: 'GLOBAL',
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      user: { isActive: true },
    },
    select: { userId: true },
    distinct: ['userId'],
  })
  const results: NotifyResult[] = []
  for (const { userId } of assignments) {
    results.push(await notifyUser(userId, input))
  }
  return { count: results.filter((r) => r.notificationId).length, results }
}

export interface NotificationListQuery {
  unreadOnly?: boolean
  limit?: number
  cursor?: string
}

/** Notifications internes d'un utilisateur (les apps passent l'id du principal authentifié). */
export async function listNotifications(userId: string, query: NotificationListQuery = {}) {
  const limit = Math.min(100, Math.max(1, query.limit ?? 20))
  const items = await prisma.notification.findMany({
    where: { userId, channel: 'IN_APP', ...(query.unreadOnly ? { readAt: null } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: { id: true, category: true, title: true, body: true, href: true, readAt: true, createdAt: true },
  })
  const hasMore = items.length > limit
  const page = hasMore ? items.slice(0, limit) : items
  return { items: page, nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null }
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, channel: 'IN_APP', readAt: null } })
}

/** Marque une notification comme lue ; ignorée si elle n'appartient pas à l'utilisateur. */
export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date(), status: 'READ' },
  })
  return result.count > 0
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date(), status: 'READ' },
  })
  return result.count
}

/** Enregistre (ou met à jour) une préférence de notification pour l'utilisateur. */
export async function setNotificationPreference(
  userId: string,
  channel: 'IN_APP' | 'EMAIL',
  category: NotificationCategory,
  enabled: boolean,
): Promise<void> {
  if (!notificationCategories.includes(category)) {
    throw new ValidationError('Catégorie de notification inconnue', { field: 'category', category })
  }
  await prisma.notificationPreference.upsert({
    where: { userId_channel_category: { userId, channel, category } },
    create: { userId, channel, category, enabled },
    update: { enabled },
  })
}
