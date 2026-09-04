import { createHash } from 'node:crypto'
import { prisma, type Prisma } from '@fetrag/db'

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

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  return createHash('sha256').update(`fetrag:${ip}`).digest('hex').slice(0, 32)
}

/**
 * Journal d'audit fonctionnellement immuable (SHR-07).
 * Ne jamais y écrire de données personnelles sensibles inutiles (SEC-09).
 */
export async function audit(
  action: AuditAction,
  entity: { type: string; id?: string | null },
  ctx: AuditContext = {},
  diff?: { before?: unknown; after?: unknown },
): Promise<void> {
  try {
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
