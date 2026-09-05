'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { features, getEnvSafe } from '@fetrag/config'
import { idSchema, paymentMethodSchema, phoneSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, ForbiddenError, NotFoundError, PreconditionError } from '@fetrag/domain'
import { applyCoupon, retryPayment, sandbox } from '@fetrag/payments'
import { guards } from '@/lib/auth'
import { firstErrors, successState, text, toErrorState, type ActionState } from './common'

export type CheckoutField = 'method' | 'phoneNumber' | 'couponCode'

const payOrderSchema = z
  .object({
    orderId: idSchema,
    method: paymentMethodSchema,
    phoneNumber: phoneSchema.optional().or(z.literal('')),
  })
  .refine((d) => d.method !== 'MOBILE_MONEY' || (d.phoneNumber && d.phoneNumber.length > 0), {
    path: ['phoneNumber'],
    message: 'Le numéro Mobile Money est requis',
  })

/** Annule une tentative PENDING lorsque le client change de moyen de paiement (le PSP sera relancé). */
async function cancelPendingAttempt(orderId: string, method: string, phoneNumber: string | null, actorId: string): Promise<void> {
  const last = await prisma.payment.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } })
  if (!last || last.status !== 'PENDING') return
  const sameChannel = last.method === method && (last.phoneNumber ?? null) === phoneNumber
  if (sameChannel) return
  await prisma.payment.update({
    where: { id: last.id },
    data: { status: 'CANCELLED', failureReason: 'Remplacé par une nouvelle tentative du client' },
  })
  await prisma.statusEvent.create({
    data: { entityType: 'Payment', entityId: last.id, orderId, fromStatus: 'PENDING', toStatus: 'CANCELLED', actorId, comment: 'Changement de moyen de paiement' },
  })
}

/**
 * Lance (ou relance) le paiement d'une commande : crée une tentative via le fournisseur configuré
 * puis suit `nextAction` (redirection PSP, instructions, ou page de retour si rien n'est dû).
 */
export async function payOrderAction(_previous: ActionState<CheckoutField>, formData: FormData): Promise<ActionState<CheckoutField>> {
  const principal = await guards.requireUser('/espace/paiements')
  if (!features.payments()) return { status: 'error', message: 'Les paiements en ligne sont momentanément désactivés.' }
  const parsed = payOrderSchema.safeParse({
    orderId: text(formData, 'orderId'),
    method: text(formData, 'method') || 'MOBILE_MONEY',
    phoneNumber: text(formData, 'phoneNumber').trim(),
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations de paiement.', fieldErrors: firstErrors<CheckoutField>(parsed.error.issues) }
  }
  const { orderId, method } = parsed.data
  const phoneNumber = parsed.data.phoneNumber ? parsed.data.phoneNumber : null
  let redirectTo: string | null = null
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true, status: true, totalAmount: true } })
    if (!order) throw new NotFoundError('Commande', orderId)
    if (order.userId !== principal.id) throw new ForbiddenError('Cette commande ne vous appartient pas')
    if (order.status === 'PAID' || order.status === 'REFUNDED' || order.status === 'PARTIALLY_REFUNDED') {
      redirectTo = `/paiement/${orderId}/retour`
    } else {
      await cancelPendingAttempt(orderId, method, phoneNumber, principal.id)
      const result = await retryPayment(principal, orderId, { method, phoneNumber })
      revalidatePath(`/paiement/${orderId}`)
      revalidatePath('/espace/paiements')
      if (result.nextAction.type === 'redirect' && result.nextAction.url) {
        redirectTo = result.nextAction.url
      } else if (result.nextAction.type === 'instructions') {
        return successState(result.nextAction.message ?? 'Suivez les instructions transmises par votre opérateur pour valider le paiement.', {
          instructions: true,
          url: result.nextAction.url ?? null,
        })
      } else {
        redirectTo = `/paiement/${orderId}/retour`
      }
    }
  } catch (error) {
    return toErrorState<CheckoutField>(error, 'Le fournisseur de paiement est momentanément indisponible. Réessayez dans quelques instants.')
  }
  redirect(redirectTo)
}

const couponSchema = z.object({ orderId: idSchema, couponCode: z.string().trim().min(2, 'Code trop court').max(40) })

/**
 * Applique un code promotionnel à une commande en attente (sans coupon ni prise en charge) :
 * recalcule la remise et le total, incrémente le compteur d'utilisations, historise.
 */
export async function applyCouponAction(_previous: ActionState<CheckoutField>, formData: FormData): Promise<ActionState<CheckoutField>> {
  const principal = await guards.requireUser('/espace/paiements')
  const parsed = couponSchema.safeParse({ orderId: text(formData, 'orderId'), couponCode: text(formData, 'couponCode') })
  if (!parsed.success) {
    return { status: 'error', message: 'Code promotionnel invalide.', fieldErrors: firstErrors<CheckoutField>(parsed.error.issues) }
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true, id: true } } },
    })
    if (!order) throw new NotFoundError('Commande', parsed.data.orderId)
    if (order.userId !== principal.id) throw new ForbiddenError('Cette commande ne vous appartient pas')
    if (order.status !== 'PENDING' && order.status !== 'FAILED') throw new PreconditionError('Cette commande ne peut plus être modifiée', { status: order.status })
    if (order.couponId) throw new PreconditionError('Un code promotionnel est déjà appliqué à cette commande')
    if (order.sponsorshipId) throw new PreconditionError('Une prise en charge est déjà appliquée : le code promotionnel n’est pas cumulable')

    const applied = await applyCoupon(parsed.data.couponCode, order.subtotalAmount)
    const pending = order.payments[0]
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { couponId: applied.coupon.id, discountAmount: applied.discountAmount, totalAmount: applied.totalAmount },
      })
      await tx.coupon.update({ where: { id: applied.coupon.id }, data: { usedCount: { increment: 1 } } })
      if (pending && (pending.status === 'PENDING' || pending.status === 'INITIATED')) {
        await tx.payment.update({ where: { id: pending.id }, data: { status: 'CANCELLED', failureReason: 'Montant modifié par un code promotionnel' } })
      }
      await tx.statusEvent.create({
        data: {
          entityType: 'Order',
          entityId: order.id,
          orderId: order.id,
          fromStatus: order.status,
          toStatus: order.status,
          actorId: principal.id,
          comment: `Code ${applied.coupon.code} appliqué : remise ${applied.discountAmount} ${order.currency}`,
        },
      })
    })
    await audit('order.created', { type: 'Order', id: order.id }, { actorId: principal.id, actorEmail: principal.email }, {
      before: { discountAmount: order.discountAmount, totalAmount: order.totalAmount },
      after: { couponId: applied.coupon.id, discountAmount: applied.discountAmount, totalAmount: applied.totalAmount },
    })
    revalidatePath(`/paiement/${order.id}`)
    revalidatePath(`/espace/paiements/${order.id}`)
    return successState(
      applied.discountAmount > 0 ? `Code ${applied.coupon.code} appliqué : la remise a été déduite du total.` : `Code ${applied.coupon.code} enregistré.`,
      { discountAmount: applied.discountAmount, totalAmount: applied.totalAmount },
    )
  } catch (error) {
    return toErrorState<CheckoutField>(error)
  }
}

const simulateSchema = z.object({ orderId: idSchema, paymentId: idSchema, outcome: z.enum(['success', 'failure']) })

/** Simulation PSP sandbox : génère un webhook signé et le traite immédiatement (PAYMENT_PROVIDER=sandbox uniquement). */
export async function simulateSandboxAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const principal = await guards.requireUser('/espace/paiements')
  if (getEnvSafe().PAYMENT_PROVIDER !== 'sandbox') return { status: 'error', message: 'La simulation n’est disponible qu’avec le fournisseur sandbox.' }
  const parsed = simulateSchema.safeParse({ orderId: text(formData, 'orderId'), paymentId: text(formData, 'paymentId'), outcome: text(formData, 'outcome') })
  if (!parsed.success) return { status: 'error', message: 'Paramètres de simulation invalides.' }
  try {
    const payment = await prisma.payment.findUnique({ where: { id: parsed.data.paymentId }, select: { orderId: true, order: { select: { userId: true } } } })
    if (!payment || payment.orderId !== parsed.data.orderId) throw new NotFoundError('Paiement', parsed.data.paymentId)
    if (payment.order.userId !== principal.id) throw new ForbiddenError('Cette commande ne vous appartient pas')
    await sandbox.simulate(parsed.data.paymentId, parsed.data.outcome)
    revalidatePath(`/paiement/${parsed.data.orderId}`, 'layout')
    revalidatePath('/espace', 'layout')
  } catch (error) {
    return toErrorState(error)
  }
  redirect(`/paiement/${parsed.data.orderId}/retour`)
}
