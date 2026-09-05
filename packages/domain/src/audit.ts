import type { Prisma } from '@fetrag/db'
import { sha256Hex } from './hash'

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.mfa_enabled'
  | 'auth.password_changed'
  | 'user.registered'
  | 'user.updated'
  | 'role.granted'
  | 'role.revoked'
  | 'content.created'
  | 'content.updated'
  | 'content.published'
  | 'content.archived'
  | 'course.published'
  | 'course.version_created'
  | 'enrollment.created'
  | 'enrollment.status_changed'
  | 'grade.recorded'
  | 'attendance.recorded'
  | 'certificate.issued'
  | 'certificate.revoked'
  | 'training_request.submitted'
  | 'training_request.decided'
  | 'order.created'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded'
  | 'service_request.status_changed'
  | 'settings.updated'
  | 'export.generated'

export interface AuditContext {
  actorId?: string | null
  actorEmail?: string | null
  ip?: string | null
  userAgent?: string | null
  correlationId?: string | null
}

/** Empreinte pseudonymisée d'une adresse IP (SEC-09) - synchrone et universelle. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  return sha256Hex(`fetrag:${ip}`).slice(0, 32)
}

/**
 * Journal d'audit fonctionnellement immuable (SHR-07).
 * Ne jamais y écrire de données personnelles sensibles inutiles (SEC-09).
 * Le client Prisma est chargé à l'exécution uniquement : ce module reste importable
 * depuis un composant client (le bundle navigateur n'instancie jamais Prisma).
 */
export async function audit(
  action: AuditAction,
  entity: { type: string; id?: string | null },
  ctx: AuditContext = {},
  diff?: { before?: unknown; after?: unknown },
): Promise<void> {
  try {
    const { prisma } = await import('@fetrag/db')
    await prisma.auditLog.create({
      data: {
        action,
        entityType: entity.type,
        entityId: entity.id ?? null,
        actorId: ctx.actorId ?? null,
        actorEmail: ctx.actorEmail ?? null,
        ipHash: hashIp(ctx.ip),
        userAgent: ctx.userAgent?.slice(0, 300) ?? null,
        correlationId: ctx.correlationId ?? null,
        before: (diff?.before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: (diff?.after ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    // L'audit ne doit jamais faire échouer l'opération métier, mais l'échec est visible dans les logs.
    console.error('[audit] échec d’écriture', action, error)
  }
}
