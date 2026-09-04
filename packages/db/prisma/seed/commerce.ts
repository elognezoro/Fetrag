import { CouponType, OfferKind, OrderStatus, PaymentMethod, PaymentStatus, PricingTier, RefundStatus } from '@prisma/client'
import { prisma } from '../../src/client'
import type { SeededCatalog } from './catalog'
import type { SeededCms } from './cms'
import { addMinutes, at, daysFromNow, get, json, log, stableId } from './helpers'
import type { SeededOrganizations } from './organizations'
import type { SeededUsers } from './users'

/**
 * Commerce : offres tarifaires, coupon, commandes de démonstration (payée, échouée,
 * remboursée) avec paiements sandbox, reçus, remboursement et prise en charge.
 */

export interface SeededCommerce {
  offerIds: Record<string, string>
  orderReferences: string[]
  couponCode: string
  sponsorshipId: string
}

interface OfferSeed {
  key: string
  kind: OfferKind
  name: string
  description: string
  tier: PricingTier
  amount: number
  courseCode?: string
  eventKey?: string
  serviceSlug?: string
}

const offers: OfferSeed[] = [
  { key: 'm08-standard', kind: OfferKind.COURSE, name: 'Module 08 - Leadership Syndical et Éthique (tarif standard)', description: 'Accès individuel au module 08.', tier: PricingTier.STANDARD, amount: 25000, courseCode: 'M08' },
  { key: 'm08-member', kind: OfferKind.COURSE, name: 'Module 08 - Leadership Syndical et Éthique (tarif adhérent)', description: 'Tarif réservé aux adhérents des organisations affiliées.', tier: PricingTier.MEMBER, amount: 15000, courseCode: 'M08' },
  { key: 'm09-standard', kind: OfferKind.COURSE, name: 'Module 09 - Communication et Plaidoyer (tarif standard)', description: 'Accès individuel au module 09.', tier: PricingTier.STANDARD, amount: 25000, courseCode: 'M09' },
  { key: 'm09-member', kind: OfferKind.COURSE, name: 'Module 09 - Communication et Plaidoyer (tarif adhérent)', description: 'Tarif réservé aux adhérents des organisations affiliées.', tier: PricingTier.MEMBER, amount: 15000, courseCode: 'M09' },
  { key: 'masterclass', kind: OfferKind.EVENT, name: 'Master Class « Négocier en période de crise »', description: 'Participation à la Master Class (présentiel ou visioconférence).', tier: PricingTier.STANDARD, amount: 10000, eventKey: 'masterclass' },
  { key: 'assistance-contentieux', kind: OfferKind.SERVICE, name: 'Assistance contentieux - participation forfaitaire', description: 'Frais de constitution du dossier.', tier: PricingTier.STANDARD, amount: 15000, serviceSlug: 'assistance-contentieux' },
  { key: 'audit-convention', kind: OfferKind.SERVICE, name: 'Audit de convention collective - forfait', description: 'Forfait par entreprise auditée.', tier: PricingTier.ORGANIZATION, amount: 50000, serviceSlug: 'audit-de-convention-collective' },
]

async function seedOffers(catalog: SeededCatalog, cms: SeededCms): Promise<Record<string, string>> {
  const ids: Record<string, string> = {}
  for (const o of offers) {
    const id = stableId('offer', o.key)
    const data = {
      kind: o.kind,
      name: o.name,
      description: o.description,
      courseId: o.courseCode ? get(catalog.courses, o.courseCode, 'cours').id : null,
      eventId: o.eventKey ? get(cms.events, o.eventKey, 'événement').id : null,
      serviceId: o.serviceSlug ? get(cms.services, o.serviceSlug, 'service').id : null,
      tier: o.tier,
      amount: o.amount,
      currency: 'XAF',
      validFrom: new Date(Date.UTC(2026, 0, 1)),
      validUntil: new Date(Date.UTC(2026, 11, 31, 23, 59, 59)),
      quota: null,
      isActive: true,
    }
    await prisma.offer.upsert({ where: { id }, create: { id, ...data }, update: data })
    ids[o.key] = id
  }
  return ids
}

async function seedCoupon(): Promise<string> {
  const code = 'FETRAG10'
  const data = {
    type: CouponType.PERCENT,
    value: 10,
    maxUses: 100,
    validFrom: new Date(Date.UTC(2026, 0, 1)),
    validUntil: new Date(Date.UTC(2026, 11, 31, 23, 59, 59)),
    isActive: true,
  }
  const coupon = await prisma.coupon.upsert({
    where: { code },
    create: { id: stableId('coupon', code), code, usedCount: 1, ...data },
    update: data,
    select: { id: true },
  })
  return coupon.id
}

interface OrderSeed {
  reference: string
  userIndex: number
  status: OrderStatus
  offerKey: string
  label: string
  amount: number
  couponId: string | null
  discountAmount: number
  createdAt: Date
  paidAt: Date | null
  payment: {
    status: PaymentStatus
    method: PaymentMethod
    providerRef: string
    phoneNumber: string
    failureReason: string | null
    confirmedAt: Date | null
  }
  receiptNumber: string | null
  refund: { amount: number; reason: string; processedAt: Date } | null
  history: Array<{ from: OrderStatus | null; to: OrderStatus; comment: string }>
}

function orderSeeds(couponId: string): OrderSeed[] {
  const paidAt = daysFromNow(-4, 11, 20)
  const failedAt = daysFromNow(-3, 16)
  const refundedPaidAt = daysFromNow(-9, 10)
  return [
    {
      reference: 'CMD-2026-P4Q7RS',
      userIndex: 2,
      status: OrderStatus.PAID,
      offerKey: 'masterclass',
      label: 'Master Class « Négocier en période de crise »',
      amount: 10000,
      couponId,
      discountAmount: 1000,
      createdAt: addMinutes(paidAt, -6),
      paidAt,
      payment: {
        status: PaymentStatus.SUCCEEDED,
        method: PaymentMethod.MOBILE_MONEY,
        providerRef: 'sbx_pay_000001',
        phoneNumber: '+241 07 30 00 03',
        failureReason: null,
        confirmedAt: paidAt,
      },
      receiptNumber: 'REC-2026-000001',
      refund: null,
      history: [
        { from: null, to: OrderStatus.PENDING, comment: 'Commande créée depuis la page de l’événement.' },
        { from: OrderStatus.PENDING, to: OrderStatus.PAID, comment: 'Paiement sandbox confirmé (webhook).' },
      ],
    },
    {
      reference: 'CMD-2026-F8T2WX',
      userIndex: 3,
      status: OrderStatus.FAILED,
      offerKey: 'm09-standard',
      label: 'Module 09 - Communication et Plaidoyer (tarif standard)',
      amount: 25000,
      couponId: null,
      discountAmount: 0,
      createdAt: addMinutes(failedAt, -3),
      paidAt: null,
      payment: {
        status: PaymentStatus.FAILED,
        method: PaymentMethod.MOBILE_MONEY,
        providerRef: 'sbx_pay_000002',
        phoneNumber: '+241 07 30 00 04',
        failureReason: 'Solde insuffisant (simulation sandbox)',
        confirmedAt: null,
      },
      receiptNumber: null,
      refund: null,
      history: [
        { from: null, to: OrderStatus.PENDING, comment: 'Commande créée depuis le catalogue.' },
        { from: OrderStatus.PENDING, to: OrderStatus.FAILED, comment: 'Paiement refusé par le fournisseur : solde insuffisant.' },
      ],
    },
    {
      reference: 'CMD-2026-R5N9KD',
      userIndex: 4,
      status: OrderStatus.REFUNDED,
      offerKey: 'm08-standard',
      label: 'Module 08 - Leadership Syndical et Éthique (tarif standard)',
      amount: 25000,
      couponId: null,
      discountAmount: 0,
      createdAt: addMinutes(refundedPaidAt, -4),
      paidAt: refundedPaidAt,
      payment: {
        status: PaymentStatus.REFUNDED,
        method: PaymentMethod.CARD,
        providerRef: 'sbx_pay_000003',
        phoneNumber: '',
        failureReason: null,
        confirmedAt: refundedPaidAt,
      },
      receiptNumber: 'REC-2026-000002',
      refund: { amount: 25000, reason: 'Désistement avant le début de la session, demande acceptée par la Finance.', processedAt: daysFromNow(-6, 15) },
      history: [
        { from: null, to: OrderStatus.PENDING, comment: 'Commande créée depuis le catalogue.' },
        { from: OrderStatus.PENDING, to: OrderStatus.PAID, comment: 'Paiement sandbox confirmé.' },
        { from: OrderStatus.PAID, to: OrderStatus.REFUNDED, comment: 'Remboursement intégral traité.' },
      ],
    },
  ]
}

async function seedOrders(users: SeededUsers, orgs: SeededOrganizations, cms: SeededCms, offerIds: Record<string, string>, couponId: string): Promise<string[]> {
  const references: string[] = []
  for (const o of orderSeeds(couponId)) {
    const user = at(users.learners, o.userIndex, 'apprenant')
    const offerId = get(offerIds, o.offerKey, 'offre')
    const totalAmount = o.amount - o.discountAmount

    await prisma.$transaction(
      async (tx) => {
        const orderData = {
          userId: user.id,
          organizationId: orgs.synatep.id,
          status: o.status,
          subtotalAmount: o.amount,
          discountAmount: o.discountAmount,
          totalAmount,
          currency: 'XAF',
          couponId: o.couponId,
          sponsorshipId: null,
          idempotencyKey: `seed:order:${o.reference}`,
          note: null,
          paidAt: o.paidAt,
          createdAt: o.createdAt,
        }
        const order = await tx.order.upsert({
          where: { reference: o.reference },
          create: { id: stableId('order', o.reference), reference: o.reference, ...orderData },
          update: orderData,
          select: { id: true },
        })

        const lineId = stableId('order-line', o.reference, 1)
        const lineData = { offerId, label: o.label, quantity: 1, unitAmount: o.amount, totalAmount: o.amount }
        await tx.orderLine.upsert({ where: { id: lineId }, create: { id: lineId, orderId: order.id, ...lineData }, update: lineData })

        const paymentId = stableId('payment', o.reference, 1)
        const paymentData = {
          provider: 'sandbox',
          providerRef: o.payment.providerRef,
          method: o.payment.method,
          status: o.payment.status,
          amount: totalAmount,
          currency: 'XAF',
          phoneNumber: o.payment.phoneNumber || null,
          idempotencyKey: `seed:payment:${o.reference}`,
          failureReason: o.payment.failureReason,
          rawPayload: json({ provider: 'sandbox', simulated: true, reference: o.payment.providerRef, status: o.payment.status }),
          confirmedAt: o.payment.confirmedAt,
          createdAt: o.createdAt,
        }
        await tx.payment.upsert({ where: { id: paymentId }, create: { id: paymentId, orderId: order.id, ...paymentData }, update: paymentData })

        if (o.refund) {
          const refundId = stableId('refund', o.reference, 1)
          const refundData = {
            amount: o.refund.amount,
            reason: o.refund.reason,
            status: RefundStatus.PROCESSED,
            providerRef: `${o.payment.providerRef}_rf1`,
            processedAt: o.refund.processedAt,
          }
          await tx.refund.upsert({ where: { id: refundId }, create: { id: refundId, paymentId, ...refundData }, update: refundData })
        }

        if (o.receiptNumber) {
          await tx.receipt.upsert({
            where: { orderId: order.id },
            create: { id: stableId('receipt', o.receiptNumber), orderId: order.id, number: o.receiptNumber, pdfUrl: null, issuedAt: o.paidAt ?? o.createdAt },
            update: { number: o.receiptNumber, issuedAt: o.paidAt ?? o.createdAt },
          })
        }

        for (const [index, h] of o.history.entries()) {
          const id = stableId('status-event', 'order', o.reference, index)
          await tx.statusEvent.upsert({
            where: { id },
            create: {
              id,
              entityType: 'Order',
              entityId: order.id,
              orderId: order.id,
              fromStatus: h.from,
              toStatus: h.to,
              actorId: h.to === OrderStatus.REFUNDED ? users.finance.id : null,
              comment: h.comment,
              createdAt: addMinutes(o.createdAt, index * 3),
            },
            update: { comment: h.comment },
          })
        }

        // La commande payée de la Master Class est rattachée à l'inscription de l'apprenant 3.
        if (o.offerKey === 'masterclass' && o.status === OrderStatus.PAID && cms.masterclassRegistrationId) {
          await tx.eventRegistration.update({ where: { id: cms.masterclassRegistrationId }, data: { orderId: order.id } })
        }
      },
      { maxWait: 15_000, timeout: 60_000 },
    )
    references.push(o.reference)
  }
  return references
}

async function seedSponsorship(users: SeededUsers, orgs: SeededOrganizations, catalog: SeededCatalog): Promise<string> {
  const beneficiary = at(users.learners, 5, 'apprenant')
  const id = stableId('sponsorship', 'synatep', beneficiary.email, 'M09')
  const data = {
    organizationId: orgs.synatep.id,
    beneficiaryId: beneficiary.id,
    grantedById: users.responsable.id,
    label: 'Prise en charge SYNATEP - Module 09 Communication et Plaidoyer',
    percent: 100,
    courseId: get(catalog.courses, 'M09', 'cours').id,
    eventId: null,
    validUntil: new Date(Date.UTC(2026, 11, 31)),
  }
  await prisma.sponsorship.upsert({ where: { id }, create: { id, ...data }, update: data })
  return id
}

/** Charge offres, coupon, commandes de démonstration et prise en charge. */
export async function seedCommerce(users: SeededUsers, orgs: SeededOrganizations, catalog: SeededCatalog, cms: SeededCms): Promise<SeededCommerce> {
  log.step('Commerce : offres, coupon, commandes, paiements sandbox, reçus, remboursement')
  const offerIds = await seedOffers(catalog, cms)
  const couponId = await seedCoupon()
  log.done(`${offers.length} offres, coupon FETRAG10 (10 %)`)
  const orderReferences = await seedOrders(users, orgs, cms, offerIds, couponId)
  const sponsorshipId = await seedSponsorship(users, orgs, catalog)
  log.done(`${orderReferences.length} commandes (payée, échouée, remboursée), 1 prise en charge SYNATEP`)
  return { offerIds, orderReferences, couponCode: 'FETRAG10', sponsorshipId }
}
