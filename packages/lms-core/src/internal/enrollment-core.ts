import type { Enrollment, EnrollmentStatus } from '@fetrag/db'
import type { Db } from './db'

export interface CreateEnrollmentParams {
  userId: string
  courseId: string
  courseVersionId: string
  cohortId?: string | null
  organizationId?: string | null
  orderId?: string | null
  source: string
  status: EnrollmentStatus
  actorId?: string | null
  expiresAt?: Date | null
}

export interface CreateEnrollmentResult {
  enrollment: Enrollment
  created: boolean
  reactivated: boolean
}

const REUSABLE: EnrollmentStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED']

/**
 * Crée (ou réactive) une inscription de façon idempotente dans une transaction.
 * Ajoute le membre à la cohorte si nécessaire et historise le statut (StatusEvent).
 */
export async function createEnrollmentTx(tx: Db, params: CreateEnrollmentParams): Promise<CreateEnrollmentResult> {
  const cohortId = params.cohortId ?? null
  const existing = await tx.enrollment.findFirst({
    where: { userId: params.userId, courseId: params.courseId, cohortId },
    orderBy: { createdAt: 'desc' },
  })

  if (existing && REUSABLE.includes(existing.status)) {
    return { enrollment: existing, created: false, reactivated: false }
  }

  if (existing) {
    const reactivated = await tx.enrollment.update({
      where: { id: existing.id },
      data: {
        status: params.status,
        courseVersionId: params.courseVersionId,
        organizationId: params.organizationId ?? existing.organizationId,
        orderId: params.orderId ?? existing.orderId,
        source: params.source,
        expiresAt: params.expiresAt ?? null,
        completedAt: null,
      },
    })
    await tx.statusEvent.create({
      data: {
        entityType: 'Enrollment',
        entityId: existing.id,
        enrollmentId: existing.id,
        fromStatus: existing.status,
        toStatus: params.status,
        actorId: params.actorId ?? null,
        comment: 'Réactivation',
      },
    })
    if (cohortId) await ensureCohortMember(tx, cohortId, params.userId)
    return { enrollment: reactivated, created: false, reactivated: true }
  }

  const enrollment = await tx.enrollment.create({
    data: {
      userId: params.userId,
      courseId: params.courseId,
      courseVersionId: params.courseVersionId,
      cohortId,
      organizationId: params.organizationId ?? null,
      orderId: params.orderId ?? null,
      source: params.source,
      status: params.status,
      expiresAt: params.expiresAt ?? null,
    },
  })
  await tx.statusEvent.create({
    data: {
      entityType: 'Enrollment',
      entityId: enrollment.id,
      enrollmentId: enrollment.id,
      fromStatus: null,
      toStatus: params.status,
      actorId: params.actorId ?? null,
    },
  })
  if (cohortId) await ensureCohortMember(tx, cohortId, params.userId)
  return { enrollment, created: true, reactivated: false }
}

/** Ajoute l'utilisateur à la cohorte s'il n'en est pas déjà membre. */
export async function ensureCohortMember(tx: Db, cohortId: string, userId: string, role = 'learner'): Promise<void> {
  await tx.cohortMember.upsert({
    where: { cohortId_userId: { cohortId, userId } },
    create: { cohortId, userId, role },
    update: {},
  })
}

/** Transitions de statut d'inscription autorisées. */
export const enrollmentTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['SUSPENDED', 'CANCELLED', 'COMPLETED', 'EXPIRED'],
  SUSPENDED: ['ACTIVE', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['ACTIVE'],
  EXPIRED: ['ACTIVE'],
}
