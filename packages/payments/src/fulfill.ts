import { resolvePublicUrl } from '@fetrag/config'
import { prisma } from '@fetrag/db'
import { audit, emit, formatDateTime, NotFoundError, PreconditionError } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'

export interface FulfillmentResult {
  orderId: string
  enrollments: string[]
  eventRegistrations: string[]
  serviceRequests: string[]
  resources: string[]
}

/**
 * Délivre ce qui a été acheté après confirmation du paiement (idempotent) :
 * COURSE → inscription ACTIVE (unique userId+courseId sans cohorte) ; EVENT → inscription REGISTERED ;
 * SERVICE → demande de service liée à la commande et passée en examen ; RESOURCE → accès par commande PAID.
 */
export async function fulfillOrder(orderId: string): Promise<FulfillmentResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true, firstName: true, name: true } },
      lines: {
        include: {
          offer: {
            include: {
              course: { select: { id: true, slug: true, title: true, status: true, currentVersionId: true, durationHours: true } },
              event: { select: { id: true, slug: true, title: true, startsAt: true, location: true, mode: true } },
              service: { select: { id: true, name: true } },
              resource: { select: { id: true, slug: true, title: true } },
            },
          },
        },
      },
    },
  })
  if (!order) throw new NotFoundError('Commande', orderId)
  if (order.status !== 'PAID' && order.status !== 'PARTIALLY_REFUNDED') {
    throw new PreconditionError('La commande doit être payée avant d’être délivrée', { status: order.status })
  }

  const result: FulfillmentResult = { orderId, enrollments: [], eventRegistrations: [], serviceRequests: [], resources: [] }
  const lmsUrl = resolvePublicUrl('lms')
  const webUrl = resolvePublicUrl('web')
  const userId = order.user.id
  const firstName = order.user.firstName ?? order.user.name?.split(' ')[0] ?? ''

  for (const line of order.lines) {
    const offer = line.offer
    if (!offer) continue

    if (offer.kind === 'COURSE' && offer.course) {
      const course = offer.course
      if (!course.currentVersionId) {
        throw new PreconditionError('Le cours n’a pas de version publiée', { courseId: course.id })
      }
      const existing = await prisma.enrollment.findFirst({ where: { userId, courseId: course.id, cohortId: null } })
      let enrollmentId: string
      let created = false
      if (existing) {
        enrollmentId = existing.id
        if (existing.status !== 'ACTIVE' && existing.status !== 'COMPLETED') {
          await prisma.enrollment.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', orderId: order.id, organizationId: existing.organizationId ?? order.organizationId, startedAt: existing.startedAt ?? new Date() },
          })
          await prisma.statusEvent.create({
            data: { entityType: 'Enrollment', entityId: existing.id, enrollmentId: existing.id, fromStatus: existing.status, toStatus: 'ACTIVE', actorId: userId, comment: `Commande ${order.reference}` },
          })
          created = true
        }
      } else {
        const enrollment = await prisma.enrollment.create({
          data: {
            userId,
            courseId: course.id,
            courseVersionId: course.currentVersionId,
            organizationId: order.organizationId,
            status: 'ACTIVE',
            source: 'purchase',
            orderId: order.id,
            startedAt: new Date(),
          },
        })
        enrollmentId = enrollment.id
        created = true
        await prisma.statusEvent.create({
          data: { entityType: 'Enrollment', entityId: enrollment.id, enrollmentId: enrollment.id, fromStatus: null, toStatus: 'ACTIVE', actorId: userId, comment: `Commande ${order.reference}` },
        })
      }
      result.enrollments.push(enrollmentId)
      if (created) {
        await audit('enrollment.created', { type: 'Enrollment', id: enrollmentId }, { actorId: userId, actorEmail: order.user.email }, { after: { courseId: course.id, orderId: order.id, source: 'purchase' } })
        await emit('enrollment.created', { enrollmentId, userId, courseId: course.id, orderId: order.id, source: 'purchase' }, { actorId: userId })
        await notifyUser(userId, {
          title: `Inscription confirmée : ${course.title}`,
          body: `Votre inscription à la formation « ${course.title} » est active. Vous pouvez commencer dès maintenant.`,
          href: `/cours/${course.slug}`,
          app: 'lms',
          category: 'training',
          email: true,
          emailTemplate: 'enrollment-confirmed',
          emailVariables: { firstName, courseTitle: course.title, courseUrl: `${lmsUrl}/cours/${course.slug}`, durationHours: course.durationHours },
        })
      }
      continue
    }

    if (offer.kind === 'EVENT' && offer.event) {
      const event = offer.event
      const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId } } })
      let registrationId: string
      let created = false
      if (existing) {
        registrationId = existing.id
        if (existing.status === 'CANCELLED' || existing.status === 'WAITLISTED') {
          await prisma.eventRegistration.update({ where: { id: existing.id }, data: { status: 'REGISTERED', orderId: order.id } })
          created = true
        } else if (!existing.orderId) {
          await prisma.eventRegistration.update({ where: { id: existing.id }, data: { orderId: order.id } })
        }
      } else {
        const registration = await prisma.eventRegistration.create({
          data: { eventId: event.id, userId, status: 'REGISTERED', orderId: order.id },
        })
        registrationId = registration.id
        created = true
      }
      result.eventRegistrations.push(registrationId)
      if (created) {
        await emit('event.registered', { eventId: event.id, userId, registrationId, orderId: order.id }, { actorId: userId })
        await notifyUser(userId, {
          title: `Inscription confirmée : ${event.title}`,
          body: `Votre place pour « ${event.title} » (${formatDateTime(event.startsAt)}) est réservée.`,
          href: `/evenements/${event.slug}`,
          app: 'web',
          category: 'general',
          email: true,
          emailTemplate: 'event-registered',
          emailVariables: {
            firstName,
            eventTitle: event.title,
            startsAt: formatDateTime(event.startsAt),
            location: event.location,
            eventUrl: `${webUrl}/evenements/${event.slug}`,
          },
        })
      }
      continue
    }

    if (offer.kind === 'SERVICE' && offer.service) {
      const linked =
        (await prisma.serviceRequest.findUnique({ where: { orderId: order.id } })) ??
        (await prisma.serviceRequest.findFirst({
          where: { serviceId: offer.service.id, requesterId: userId, orderId: null, status: { in: ['NEW', 'IN_REVIEW'] } },
          orderBy: { createdAt: 'desc' },
        }))
      if (linked) {
        const toStatus = linked.status === 'NEW' ? 'IN_REVIEW' : linked.status
        await prisma.serviceRequest.update({ where: { id: linked.id }, data: { orderId: order.id, status: toStatus } })
        if (toStatus !== linked.status) {
          await prisma.statusEvent.create({
            data: { entityType: 'ServiceRequest', entityId: linked.id, serviceRequestId: linked.id, fromStatus: linked.status, toStatus, actorId: userId, comment: `Paiement reçu (${order.reference})` },
          })
          await audit('service_request.status_changed', { type: 'ServiceRequest', id: linked.id }, { actorId: userId }, { before: { status: linked.status }, after: { status: toStatus, orderId: order.id } })
        }
        result.serviceRequests.push(linked.id)
      }
      continue
    }

    if (offer.kind === 'RESOURCE' && offer.resource) {
      result.resources.push(offer.resource.id)
    }
  }

  return result
}
