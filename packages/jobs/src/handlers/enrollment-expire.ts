import { prisma } from '@fetrag/db'
import { emit } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { parseEnrollmentExpire } from '../payloads'
import type { JobHandler } from '../types'

/** Passe en EXPIRED les inscriptions ACTIVE/PENDING dont `expiresAt` est dépassé, avec historique et notification. */
export const enrollmentExpireHandler: JobHandler = async (payload, ctx) => {
  const { batchSize } = parseEnrollmentExpire(payload)
  const now = new Date()
  const candidates = await prisma.enrollment.findMany({
    where: { status: { in: ['ACTIVE', 'PENDING'] }, expiresAt: { lt: now } },
    select: { id: true, userId: true, status: true, course: { select: { title: true, slug: true } } },
    take: batchSize ?? 500,
  })

  let expired = 0
  for (const enrollment of candidates) {
    const result = await prisma.enrollment.updateMany({
      where: { id: enrollment.id, status: enrollment.status },
      data: { status: 'EXPIRED' },
    })
    if (result.count !== 1) continue
    expired++
    await prisma.statusEvent.create({
      data: {
        entityType: 'Enrollment',
        entityId: enrollment.id,
        enrollmentId: enrollment.id,
        fromStatus: enrollment.status,
        toStatus: 'EXPIRED',
        comment: 'Expiration automatique',
      },
    })
    await emit('enrollment.created', { enrollmentId: enrollment.id, status: 'EXPIRED', reason: 'expired' }, { correlationId: ctx.jobId })
    await notifyUser(enrollment.userId, {
      title: 'Inscription expirée',
      body: `Votre inscription à la formation « ${enrollment.course.title} » a expiré. Contactez la coordination formation si vous souhaitez la prolonger.`,
      href: `/cours/${enrollment.course.slug}`,
      app: 'lms',
      category: 'training',
      email: true,
    })
  }
  ctx.logger.info('enrollment.expire.done', { candidates: candidates.length, expired })
  return { candidates: candidates.length, expired }
}
