// Module pur (sans Prisma) : importé par les tests unitaires. `@fetrag/domain/money` évite de charger l'audit/Prisma.
import { computeTotals, type OrderTotals } from '@fetrag/domain/money'

export interface CouponLike {
  type: 'PERCENT' | 'FIXED'
  value: number
}

export interface CheckoutTotalsInput {
  unitAmount: number
  quantity: number
  coupon?: CouponLike | null
  /** Pourcentage pris en charge (bourse, exonération, sponsoring), 0-100. */
  sponsorshipPercent?: number | null
}

export interface CheckoutTotals extends OrderTotals {
  /** Part de la remise due au coupon. */
  couponDiscount: number
  /** Part de la remise due à la prise en charge. */
  sponsorshipDiscount: number
  /** `true` si aucun paiement n'est nécessaire. */
  isFree: boolean
}

/** Remise d'un coupon sur un montant : pourcentage arrondi ou montant fixe plafonné au sous-total. */
export function computeCouponDiscount(coupon: CouponLike | null | undefined, amount: number): number {
  if (!coupon || amount <= 0) return 0
  if (coupon.type === 'PERCENT') {
    const percent = Math.min(100, Math.max(0, coupon.value))
    return Math.round((amount * percent) / 100)
  }
  return Math.min(amount, Math.max(0, coupon.value))
}

/**
 * Totaux d'une commande : sous-total, remise coupon puis prise en charge (appliquée sur le reste),
 * total à payer (entier XAF). Délègue au calcul de référence `computeTotals` du domaine.
 */
export function buildOrderTotals(input: CheckoutTotalsInput): CheckoutTotals {
  const quantity = Math.max(1, Math.floor(input.quantity))
  const unitAmount = Math.max(0, Math.round(input.unitAmount))
  const totals = computeTotals([{ unitAmount, quantity }], input.coupon ?? null, input.sponsorshipPercent ?? null)
  const couponDiscount = computeCouponDiscount(input.coupon, totals.subtotalAmount)
  return {
    ...totals,
    couponDiscount,
    sponsorshipDiscount: totals.discountAmount - couponDiscount,
    isFree: totals.totalAmount === 0,
  }
}
