import 'server-only'
import { prisma, type ConsentKind } from '@fetrag/db'
import { getStorage } from '@fetrag/storage'
import { orders } from '@fetrag/payments'
import { certification, enrollments } from '@fetrag/lms-core'
import { events, serviceRequests } from '@fetrag/cms'
import { countUnreadNotifications, listNotifications, notificationCategories, type NotificationCategory } from '@fetrag/notifications'
import type { Principal } from '@fetrag/domain'

/** URL signée d'une clé de stockage privée (null si la signature échoue ou si la clé est vide). */
export async function signedUrlFor(key: string | null | undefined, expiresInSeconds = 900): Promise<string | null> {
  if (!key) return null
  if (/^https?:\/\//i.test(key)) return key
  try {
    return await getStorage().getSignedUrl(key, { expiresInSeconds })
  } catch (error) {
    console.error('[espace] signature d’URL impossible', error instanceof Error ? error.message : error)
    return null
  }
}

// -----------------------------------------------------------------------------
// Tableau de bord
// -----------------------------------------------------------------------------

export async function loadAccountSummary(principal: Principal) {
  const [user, myEnrollments, requests, registrations, unread, certificates, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: principal.id }, select: { firstName: true, lastName: true, name: true, email: true, createdAt: true, totpEnabled: true } }),
    enrollments.listForUser(principal, undefined, { status: ['ACTIVE', 'PENDING', 'COMPLETED'] }),
    serviceRequests.listForUser(principal, { page: 1, pageSize: 5 }),
    events.listForUser(principal),
    countUnreadNotifications(principal.id),
    certification.listForUser(principal),
    orders.listForUser(principal, { page: 1, pageSize: 3 }),
  ])
  const now = Date.now()
  const upcomingEvents = registrations.filter((r) => r.event.startsAt.getTime() >= now).sort((a, b) => a.event.startsAt.getTime() - b.event.startsAt.getTime())
  return { user, enrollments: myEnrollments, requests, upcomingEvents, unread, certificates, recentOrders }
}

/** Compteurs affichés en badge dans la navigation latérale. */
export async function loadAccountBadges(principal: Principal): Promise<{ unread: number; pendingOrders: number }> {
  const [unread, pendingOrders] = await Promise.all([
    countUnreadNotifications(principal.id),
    prisma.order.count({ where: { userId: principal.id, status: 'PENDING' } }),
  ])
  return { unread, pendingOrders }
}

// -----------------------------------------------------------------------------
// Profil, consentements, préférences
// -----------------------------------------------------------------------------

export const consentKinds: ConsentKind[] = ['NEWSLETTER', 'MARKETING']

export const consentLabels: Record<ConsentKind, { title: string; description: string }> = {
  TERMS: { title: 'Conditions d’utilisation', description: 'Acceptées lors de la création du compte.' },
  PRIVACY: { title: 'Politique de confidentialité', description: 'Acceptée lors de la création du compte.' },
  NEWSLETTER: { title: 'Lettre d’information', description: 'Recevoir les actualités, communiqués et convocations de la FETRAG par email.' },
  MARKETING: { title: 'Informations sur les formations et événements', description: 'Être informé des nouvelles sessions du programme de formation et des master class.' },
  TRAINING_COMMITMENTS: { title: 'Engagements de formation', description: 'Acceptés lors d’une demande de formation institutionnelle.' },
}

/** Catégories de notification proposées dans les préférences (les catégories essentielles ne sont pas désactivables). */
export const preferenceCategories: Array<{ category: NotificationCategory; label: string; description: string }> = [
  { category: 'training', label: 'Formations', description: 'Inscriptions, ouverture de sessions, rappels de parcours.' },
  { category: 'sessions', label: 'Séances et convocations', description: 'Convocations, rappels de séances en présentiel ou en classe virtuelle.' },
  { category: 'assignments', label: 'Devoirs', description: 'Nouveaux devoirs, échéances et retours du formateur.' },
  { category: 'results', label: 'Résultats', description: 'Notes d’évaluations et corrections.' },
  { category: 'certificates', label: 'Certificats', description: 'Émission et disponibilité des attestations.' },
  { category: 'requests', label: 'Demandes de service', description: 'Avancement de vos demandes auprès des services de la FETRAG.' },
  { category: 'forum', label: 'Forums', description: 'Réponses à vos sujets et messages de la communauté.' },
  { category: 'general', label: 'Informations générales', description: 'Annonces de la fédération et nouveautés de la plateforme.' },
]

export async function loadProfile(principal: Principal) {
  const [user, consents, preferences, newsletter] = await Promise.all([
    prisma.user.findUnique({
      where: { id: principal.id },
      select: { id: true, email: true, firstName: true, lastName: true, name: true, phone: true, jobTitle: true, employer: true, locale: true, image: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.consent.findMany({ where: { userId: principal.id }, orderBy: { createdAt: 'desc' } }),
    prisma.notificationPreference.findMany({ where: { userId: principal.id, channel: 'EMAIL' } }),
    prisma.newsletterSubscription.findUnique({ where: { email: principal.email }, select: { confirmedAt: true, unsubscribedAt: true } }),
  ])
  const latestConsent = new Map<ConsentKind, boolean>()
  for (const consent of consents) {
    if (!latestConsent.has(consent.kind)) latestConsent.set(consent.kind, consent.granted)
  }
  const emailPreferences: Record<string, boolean> = {}
  for (const category of notificationCategories) {
    const found = preferences.find((p) => p.category === category)
    emailPreferences[category] = found ? found.enabled : true
  }
  return {
    user,
    consents: consentKinds.map((kind) => ({ kind, granted: latestConsent.get(kind) ?? false, ...consentLabels[kind] })),
    emailPreferences,
    newsletterState: newsletter ? (newsletter.unsubscribedAt ? 'unsubscribed' : newsletter.confirmedAt ? 'confirmed' : 'pending') : 'none',
  }
}

// -----------------------------------------------------------------------------
// Demandes, inscriptions, paiements, notifications, sécurité
// -----------------------------------------------------------------------------

export async function loadUserRequests(principal: Principal, page = 1) {
  const [requests, submissions] = await Promise.all([
    serviceRequests.listForUser(principal, { page, pageSize: 10 }),
    prisma.formSubmission.findMany({
      where: { userId: principal.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, reference: true, kind: true, subject: true, status: true, createdAt: true, answeredAt: true },
    }),
  ])
  return { requests, submissions }
}

export async function loadUserRegistrations(principal: Principal) {
  const [myEnrollments, registrations, certificates] = await Promise.all([
    enrollments.listForUser(principal),
    events.listForUser(principal),
    certification.listForUser(principal),
  ])
  return { enrollments: myEnrollments, registrations, certificates }
}

export async function loadUserOrders(principal: Principal, page = 1, status?: string) {
  const allowed = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'] as const
  const filter = allowed.find((s) => s === status)
  return orders.listForUser(principal, { page, pageSize: 10, ...(filter ? { status: filter } : {}) })
}

export async function loadUserOrder(principal: Principal, orderId: string) {
  const order = await orders.get(principal, orderId)
  const receiptUrl = await signedUrlFor(order.receipt?.pdfUrl)
  return { order, receiptUrl }
}

export async function loadUserNotifications(principal: Principal, cursor?: string, unreadOnly = false) {
  const [page, unread] = await Promise.all([
    listNotifications(principal.id, { limit: 20, cursor, unreadOnly }),
    countUnreadNotifications(principal.id),
  ])
  return { ...page, unread }
}

export async function loadSecurityState(principal: Principal) {
  const [user, recentLogins] = await Promise.all([
    prisma.user.findUnique({ where: { id: principal.id }, select: { totpEnabled: true, passwordHash: true, lastLoginAt: true, backupCodes: true } }),
    prisma.auditLog.findMany({
      where: { actorId: principal.id, action: { in: ['auth.login', 'auth.password_changed', 'auth.mfa_enabled'] } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, action: true, createdAt: true, userAgent: true },
    }),
  ])
  return {
    totpEnabled: user?.totpEnabled ?? false,
    hasPassword: Boolean(user?.passwordHash),
    backupCodesLeft: Array.isArray(user?.backupCodes) ? (user?.backupCodes as unknown[]).length : 0,
    lastLoginAt: user?.lastLoginAt ?? null,
    recentLogins,
  }
}
