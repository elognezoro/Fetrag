import { prisma, type ConsentKind } from '@fetrag/db'

/** Dernier consentement enregistré d'un utilisateur pour un type donné (`true` si accordé). */
export async function hasConsent(userId: string, kind: ConsentKind): Promise<boolean> {
  const last = await prisma.consent.findFirst({
    where: { userId, kind },
    orderBy: { createdAt: 'desc' },
    select: { granted: true },
  })
  return last?.granted === true
}

/**
 * Consentement aux communications non essentielles (lettre d'information, marketing) :
 * consentement NEWSLETTER accordé sur le compte, ou abonnement newsletter confirmé et non résilié.
 */
export async function hasNewsletterConsent(target: { userId?: string | null; email?: string | null }): Promise<boolean> {
  const email = target.email?.trim().toLowerCase()
  let userId = target.userId ?? null
  if (!userId && email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    userId = user?.id ?? null
  }
  if (userId && (await hasConsent(userId, 'NEWSLETTER'))) return true
  if (!email) return false
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { email },
    select: { confirmedAt: true, unsubscribedAt: true },
  })
  return Boolean(subscription?.confirmedAt && !subscription.unsubscribedAt)
}
