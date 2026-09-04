import { prisma, type Coupon } from '@fetrag/db'
import { ValidationError } from '@fetrag/domain'
import { computeCouponDiscount } from './totals'

export interface AppliedCoupon {
  coupon: Pick<Coupon, 'id' | 'code' | 'type' | 'value'>
  discountAmount: number
  totalAmount: number
}

/** Normalisation du code saisi (insensible à la casse et aux espaces). */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * Vérifie un coupon (actif, période de validité, quota d'utilisations) et calcule la remise
 * sur `amount`. Lève `ValidationError` avec un message affichable si le code est refusé.
 */
export async function applyCoupon(code: string, amount: number, now: Date = new Date()): Promise<AppliedCoupon> {
  const normalized = normalizeCouponCode(code)
  if (normalized.length < 2 || normalized.length > 40) {
    throw new ValidationError('Code promotionnel invalide', { field: 'couponCode' })
  }
  const coupon = await prisma.coupon.findFirst({
    where: { code: { equals: normalized, mode: 'insensitive' } },
  })
  if (!coupon || !coupon.isActive) throw new ValidationError('Code promotionnel inconnu ou inactif', { field: 'couponCode' })
  if (coupon.validFrom && coupon.validFrom > now) {
    throw new ValidationError('Ce code promotionnel n’est pas encore valable', { field: 'couponCode' })
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    throw new ValidationError('Ce code promotionnel a expiré', { field: 'couponCode' })
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new ValidationError('Ce code promotionnel a atteint son nombre maximal d’utilisations', { field: 'couponCode' })
  }
  const discountAmount = computeCouponDiscount(coupon, amount)
  return {
    coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
    discountAmount,
    totalAmount: Math.max(0, amount - discountAmount),
  }
}
