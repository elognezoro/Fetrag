import 'server-only'
import { features, getEnvSafe } from '@fetrag/config'
import { prisma } from '@fetrag/db'
import { isDomainError, type Principal } from '@fetrag/domain'
import { orders } from '@fetrag/payments'
import { signedUrlFor } from './queries'

export type CheckoutOrder = Awaited<ReturnType<typeof orders.get>>

/** Commande du parcours de paiement (propriétaire uniquement) ; `null` si introuvable ou inaccessible. */
export async function loadCheckoutOrder(principal: Principal, orderId: string): Promise<CheckoutOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null
  try {
    const order = await orders.get(principal, orderId)
    if (order.userId !== principal.id) return null
    return order
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) return null
    throw error
  }
}

/** Paramètres du parcours : fournisseur configuré, paiements activés. */
export function checkoutSettings(): { providerId: string; paymentsEnabled: boolean; sandbox: boolean } {
  const providerId = getEnvSafe().PAYMENT_PROVIDER ?? 'sandbox'
  return { providerId, paymentsEnabled: features.payments(), sandbox: providerId === 'sandbox' }
}

/** Numéro de téléphone proposé par défaut pour Mobile Money (dernière tentative, sinon profil). */
export async function defaultPhoneFor(principal: Principal, order: CheckoutOrder): Promise<string> {
  const last = order.payments.find((p) => p.phoneNumber)
  if (last?.phoneNumber) return last.phoneNumber
  const user = await prisma.user.findUnique({ where: { id: principal.id }, select: { phone: true } })
  return user?.phone ?? ''
}

/** Détails de ce que la commande a débloqué (liens vers les ressources acquises). */
export async function loadFulfillmentLinks(order: CheckoutOrder, lmsUrl: string) {
  const courseIds = order.enrollments.map((e) => e.courseId)
  const eventIds = order.eventRegistrations.map((r) => r.eventId)
  const resourceIds = order.lines.map((l) => l.offer?.resourceId).filter((id): id is string => Boolean(id))
  const [courses, events, resources] = await Promise.all([
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, slug: true, title: true, code: true } }) : [],
    eventIds.length ? prisma.event.findMany({ where: { id: { in: eventIds } }, select: { id: true, slug: true, title: true, startsAt: true } }) : [],
    resourceIds.length ? prisma.resource.findMany({ where: { id: { in: resourceIds } }, select: { id: true, slug: true, title: true } }) : [],
  ])
  return {
    courses: courses.map((c) => ({ ...c, href: `${lmsUrl}/cours/${c.slug}` })),
    events: events.map((e) => ({ ...e, href: `/evenements/${e.slug}` })),
    resources: resources.map((r) => ({ ...r, href: `/ressources/${r.slug}` })),
    serviceRequest: order.serviceRequest ? { ...order.serviceRequest, href: '/espace/demandes' } : null,
    receiptUrl: await signedUrlFor(order.receipt?.pdfUrl),
  }
}
