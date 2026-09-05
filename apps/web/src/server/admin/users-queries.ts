import 'server-only'
import { prisma, type ConsentKind } from '@fetrag/db'

/** Libellés des consentements (RGPD / loi gabonaise sur la protection des données). */
export const consentKindLabels: Record<ConsentKind, string> = {
  TERMS: 'Conditions d’utilisation',
  PRIVACY: 'Politique de confidentialité',
  NEWSLETTER: 'Lettre d’information',
  MARKETING: 'Communications de la fédération',
  TRAINING_COMMITMENTS: 'Engagements de formation',
}

/**
 * Activité d'un utilisateur pour la fiche d'administration : derniers consentements par type,
 * dernières connexions (journal d'audit `auth.login`), inscriptions LMS et commandes.
 */
export async function loadUserActivity(userId: string) {
  const [consents, logins, enrollments, orders, certificates] = await Promise.all([
    prisma.consent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true, kind: true, granted: true, version: true, createdAt: true } }),
    prisma.auditLog.findMany({
      where: { actorId: userId, action: { in: ['auth.login', 'auth.login_failed', 'auth.password_changed', 'auth.mfa_enabled'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, createdAt: true, userAgent: true },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        status: true,
        progressPercent: true,
        score: true,
        createdAt: true,
        completedAt: true,
        course: { select: { id: true, code: true, title: true, slug: true } },
        cohort: { select: { id: true, code: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, reference: true, status: true, totalAmount: true, currency: true, createdAt: true, paidAt: true },
    }),
    prisma.certificate.count({ where: { userId, status: 'ISSUED' } }),
  ])

  // Dernier consentement enregistré par type (l'historique complet reste en base).
  const latestByKind = new Map<ConsentKind, (typeof consents)[number]>()
  for (const consent of consents) {
    if (!latestByKind.has(consent.kind)) latestByKind.set(consent.kind, consent)
  }

  return { consents: [...latestByKind.values()], consentHistory: consents.length, logins, enrollments, orders, certificates }
}

export type AdminUserActivity = Awaited<ReturnType<typeof loadUserActivity>>
