import { features, resolvePublicUrl } from '@fetrag/config'
import { checkoutInputSchema, type CheckoutInput } from '@fetrag/contracts'
import { Prisma, prisma, type OrderStatus, type PaymentMethod } from '@fetrag/db'
import {
  audit,
  ConflictError,
  emit,
  ForbiddenError,
  makeReference,
  NotFoundError,
  PreconditionError,
  referencePrefixes,
  ValidationError,
  type Principal,
} from '@fetrag/domain'
import { applyCoupon } from './coupons'
import { confirmPayment } from './confirm'
import type { NextAction } from './provider'
import { getPaymentProvider } from './providers/index'
import { buildOrderTotals } from './totals'

export interface CheckoutResult {
  orderId: string
  paymentId: string
  reference: string
  status: OrderStatus
  totalAmount: number
  currency: string
  nextAction: NextAction
}

const ACTIVE_LINE_STATUSES: OrderStatus[] = ['PAID', 'PENDING', 'PARTIALLY_REFUNDED']

/** Représentation d'une commande existante (idempotence ou reprise de paiement). */
async function describeOrder(orderId: string): Promise<CheckoutResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!order) throw new NotFoundError('Commande', orderId)
  const payment = order.payments[0]
  const webUrl = resolvePublicUrl('web')
  let nextAction: NextAction = { type: 'none' }
  if (order.status === 'PAID') {
    nextAction = { type: 'none', message: 'Commande déjà réglée' }
  } else if (payment && payment.status === 'PENDING' && payment.provider === 'sandbox') {
    nextAction = { type: 'redirect', url: `${webUrl}/paiement/${order.id}/sandbox?paymentId=${payment.id}` }
  } else if (order.status === 'PENDING' || order.status === 'FAILED') {
    nextAction = { type: 'instructions', message: 'Reprenez le paiement depuis la page de la commande', url: `${webUrl}/paiement/${order.id}` }
  }
  return {
    orderId: order.id,
    paymentId: payment?.id ?? '',
    reference: order.reference,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    nextAction,
  }
}

/** Vérifie que l'offre est vendable maintenant (active, fenêtre de validité, contenu publié, quota). */
async function loadSellableOffer(offerId: string, quantity: number, now: Date) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      course: { select: { id: true, title: true, status: true, currentVersionId: true } },
      event: { select: { id: true, title: true, status: true, startsAt: true, capacity: true } },
      service: { select: { id: true, name: true, status: true } },
      resource: { select: { id: true, title: true, status: true } },
    },
  })
  if (!offer) throw new NotFoundError('Offre', offerId)
  if (!offer.isActive) throw new PreconditionError('Cette offre n’est plus disponible', { offerId })
  if (offer.validFrom && offer.validFrom > now) throw new PreconditionError('Cette offre n’est pas encore ouverte', { offerId })
  if (offer.validUntil && offer.validUntil < now) throw new PreconditionError('Cette offre est expirée', { offerId })

  if (offer.kind === 'COURSE') {
    if (!offer.course || offer.course.status !== 'PUBLISHED' || !offer.course.currentVersionId) {
      throw new PreconditionError('La formation n’est pas ouverte à l’inscription', { offerId })
    }
  } else if (offer.kind === 'EVENT') {
    if (!offer.event || offer.event.status !== 'PUBLISHED') throw new PreconditionError('L’événement n’est pas publié', { offerId })
    if (offer.event.startsAt < now) throw new PreconditionError('L’événement est déjà passé', { offerId })
  } else if (offer.kind === 'SERVICE') {
    if (!offer.service || offer.service.status !== 'PUBLISHED') throw new PreconditionError('Le service n’est pas disponible', { offerId })
  } else if (offer.kind === 'RESOURCE') {
    if (!offer.resource || offer.resource.status !== 'PUBLISHED') throw new PreconditionError('La ressource n’est pas disponible', { offerId })
  }

  if (offer.quota !== null) {
    const reserved = await prisma.orderLine.aggregate({
      _sum: { quantity: true },
      where: { offerId, order: { status: { in: ACTIVE_LINE_STATUSES } } },
    })
    if ((reserved._sum.quantity ?? 0) + quantity > offer.quota) {
      throw new PreconditionError('Le quota de cette offre est atteint', { offerId, quota: offer.quota })
    }
  }
  return offer
}

/** Prise en charge la plus favorable dont bénéficie le principal pour l'offre (spécifique ou générale). */
async function findSponsorship(userId: string, offer: { courseId: string | null; eventId: string | null }, now: Date) {
  return prisma.sponsorship.findFirst({
    where: {
      beneficiaryId: userId,
      OR: [
        ...(offer.courseId ? [{ courseId: offer.courseId }] : []),
        ...(offer.eventId ? [{ eventId: offer.eventId }] : []),
        { courseId: null, eventId: null },
      ],
      AND: [{ OR: [{ validUntil: null }, { validUntil: { gt: now } }] }],
    },
    orderBy: { percent: 'desc' },
    select: { id: true, percent: true, label: true, organizationId: true },
  })
}

/**
 * Crée une commande et son paiement pour une offre (chapitre 19) :
 * offre vendable, coupon, prise en charge, totaux entiers XAF, idempotence, PSP ou validation immédiate si total nul.
 */
export async function createCheckout(principal: Principal, rawInput: CheckoutInput): Promise<CheckoutResult> {
  if (!features.payments()) throw new PreconditionError('Les paiements en ligne sont désactivés')
  const parsed = checkoutInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new ValidationError('Données de commande invalides', { issues: parsed.error.flatten().fieldErrors })
  }
  const input = parsed.data
  const now = new Date()

  const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { id: true, userId: true } })
  if (existing) {
    if (existing.userId !== principal.id) throw new ConflictError('Clé d’idempotence déjà utilisée')
    return describeOrder(existing.id)
  }

  const offer = await loadSellableOffer(input.offerId, input.quantity, now)
  const user = await prisma.user.findUnique({ where: { id: principal.id }, select: { id: true, email: true, name: true, isActive: true } })
  if (!user || !user.isActive) throw new ForbiddenError('Compte inactif')

  const subtotal = offer.amount * input.quantity
  const coupon = input.couponCode ? await applyCoupon(input.couponCode, subtotal, now) : null
  const sponsorship = await findSponsorship(principal.id, offer, now)
  const totals = buildOrderTotals({
    unitAmount: offer.amount,
    quantity: input.quantity,
    coupon: coupon?.coupon,
    sponsorshipPercent: sponsorship?.percent,
  })
  const method: PaymentMethod = totals.isFree ? (sponsorship && totals.sponsorshipDiscount > 0 ? 'SPONSORSHIP' : 'FREE') : input.method
  const phoneNumber = input.phoneNumber ? input.phoneNumber : null

  let created: { orderId: string; paymentId: string; reference: string } | null = null
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const reference = makeReference(referencePrefixes.order, now)
    try {
      created = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            reference,
            userId: principal.id,
            organizationId: sponsorship?.organizationId ?? null,
            status: 'PENDING',
            subtotalAmount: totals.subtotalAmount,
            discountAmount: totals.discountAmount,
            totalAmount: totals.totalAmount,
            currency: offer.currency,
            couponId: coupon?.coupon.id ?? null,
            sponsorshipId: sponsorship?.id ?? null,
            idempotencyKey: input.idempotencyKey,
            lines: {
              create: {
                offerId: offer.id,
                label: offer.name,
                quantity: input.quantity,
                unitAmount: offer.amount,
                totalAmount: subtotal,
              },
            },
          },
          select: { id: true, reference: true },
        })
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            provider: totals.isFree ? 'internal' : getPaymentProvider().id,
            method,
            status: 'INITIATED',
            amount: totals.totalAmount,
            currency: offer.currency,
            phoneNumber,
            idempotencyKey: `${input.idempotencyKey}:payment`,
          },
          select: { id: true },
        })
        if (coupon) {
          await tx.coupon.update({ where: { id: coupon.coupon.id }, data: { usedCount: { increment: 1 } } })
        }
        await tx.statusEvent.create({
          data: { entityType: 'Order', entityId: order.id, orderId: order.id, fromStatus: null, toStatus: 'PENDING', actorId: principal.id, comment: 'Commande créée' },
        })
        return { orderId: order.id, paymentId: payment.id, reference: order.reference }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[] | string | undefined) ?? ''
        const targets = Array.isArray(target) ? target : [target]
        if (targets.some((t) => t.includes('idempotencyKey'))) {
          const dup = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { id: true } })
          if (dup) return describeOrder(dup.id)
        }
        continue
      }
      throw error
    }
  }
  if (!created) throw new PreconditionError('Impossible de créer la commande (référence non unique)')

  await audit('order.created', { type: 'Order', id: created.orderId }, { actorId: principal.id, actorEmail: principal.email }, {
    after: { reference: created.reference, offerId: offer.id, quantity: input.quantity, totalAmount: totals.totalAmount, couponId: coupon?.coupon.id ?? null, sponsorshipId: sponsorship?.id ?? null },
  })
  await emit('order.created', { orderId: created.orderId, userId: principal.id, offerId: offer.id, totalAmount: totals.totalAmount }, { actorId: principal.id })

  if (totals.isFree) {
    const confirmation = await confirmPayment(created.paymentId, 'SUCCEEDED', `${method}-${created.reference}`, { actorId: principal.id })
    return {
      orderId: created.orderId,
      paymentId: created.paymentId,
      reference: created.reference,
      status: confirmation.orderStatus,
      totalAmount: 0,
      currency: offer.currency,
      nextAction: { type: 'none', message: sponsorship ? `Prise en charge : ${sponsorship.label}` : 'Aucun paiement requis' },
    }
  }

  return startProviderPayment(created.orderId, created.paymentId, created.reference, {
    amount: totals.totalAmount,
    currency: offer.currency,
    method,
    phoneNumber,
    customer: { id: user.id, email: user.email, name: user.name },
    description: `${offer.name} (${created.reference})`,
    idempotencyKey: input.idempotencyKey,
  })
}

/** Appelle le PSP pour un paiement INITIATED et enregistre sa réponse. */
async function startProviderPayment(
  orderId: string,
  paymentId: string,
  reference: string,
  ctx: { amount: number; currency: string; method: PaymentMethod; phoneNumber: string | null; customer: { id: string; email: string; name: string | null }; description: string; idempotencyKey: string },
): Promise<CheckoutResult> {
  const provider = getPaymentProvider()
  try {
    const result = await provider.createPayment({
      paymentId,
      orderId,
      orderReference: reference,
      amount: ctx.amount,
      currency: ctx.currency,
      method: ctx.method,
      phoneNumber: ctx.phoneNumber,
      customer: ctx.customer,
      description: ctx.description,
      returnUrl: `${resolvePublicUrl('web')}/paiement/${orderId}/retour`,
      idempotencyKey: ctx.idempotencyKey,
    })
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        provider: provider.id,
        providerRef: result.providerRef,
        status: result.status,
        rawPayload: result.raw ? (result.raw as Prisma.InputJsonObject) : undefined,
      },
    })
    return { orderId, paymentId, reference, status: 'PENDING', totalAmount: ctx.amount, currency: ctx.currency, nextAction: result.nextAction }
  } catch (error) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED', failureReason: (error instanceof Error ? error.message : 'Fournisseur indisponible').slice(0, 500) },
    })
    throw error
  }
}

/**
 * Relance le paiement d'une commande PENDING/FAILED (nouveau `Payment`), par exemple après un échec.
 * Réservé au propriétaire de la commande.
 */
export async function retryPayment(principal: Principal, orderId: string, options: { method?: PaymentMethod; phoneNumber?: string | null } = {}): Promise<CheckoutResult> {
  if (!features.payments()) throw new PreconditionError('Les paiements en ligne sont désactivés')
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { id: true, email: true, name: true } }, lines: { take: 1 }, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!order) throw new NotFoundError('Commande', orderId)
  if (order.userId !== principal.id) throw new ForbiddenError('Cette commande ne vous appartient pas')
  if (order.status !== 'PENDING' && order.status !== 'FAILED') {
    throw new PreconditionError('Cette commande ne peut plus être payée', { status: order.status })
  }
  const last = order.payments[0]
  if (last && last.status === 'PENDING') return describeOrder(order.id)

  const idempotencyKey = `${order.idempotencyKey ?? order.id}:retry:${Date.now()}`
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: getPaymentProvider().id,
      method: options.method ?? last?.method ?? 'MOBILE_MONEY',
      status: 'INITIATED',
      amount: order.totalAmount,
      currency: order.currency,
      phoneNumber: options.phoneNumber ?? last?.phoneNumber ?? null,
      idempotencyKey: `${idempotencyKey}:payment`,
    },
    select: { id: true, method: true, phoneNumber: true },
  })
  if (order.status === 'FAILED') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PENDING' } })
    await prisma.statusEvent.create({
      data: { entityType: 'Order', entityId: order.id, orderId: order.id, fromStatus: 'FAILED', toStatus: 'PENDING', actorId: principal.id, comment: 'Nouvelle tentative de paiement' },
    })
  }
  return startProviderPayment(order.id, payment.id, order.reference, {
    amount: order.totalAmount,
    currency: order.currency,
    method: payment.method,
    phoneNumber: payment.phoneNumber,
    customer: { id: order.user.id, email: order.user.email, name: order.user.name },
    description: `${order.lines[0]?.label ?? 'Commande'} (${order.reference})`,
    idempotencyKey,
  })
}
