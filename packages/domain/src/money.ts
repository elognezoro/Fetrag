/**
 * Montants stockés en unités entières de la plus petite devise.
 * Le franc CFA (XAF) n'a pas de sous-unité : 1 unité = 1 FCFA.
 */
export const DEFAULT_CURRENCY = 'XAF'

const minorUnits: Record<string, number> = { XAF: 0, XOF: 0, EUR: 2, USD: 2 }

export function minorUnitDigits(currency: string): number {
  return minorUnits[currency.toUpperCase()] ?? 2
}

export function formatMoney(amount: number, currency: string = DEFAULT_CURRENCY, locale = 'fr-GA'): string {
  const digits = minorUnitDigits(currency)
  const major = amount / Math.pow(10, digits)
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      currencyDisplay: 'code',
    }).format(major)
    return currency === 'XAF' ? formatted.replace('XAF', '').trim() + ' FCFA' : formatted
  } catch {
    return `${major.toLocaleString(locale)} ${currency}`
  }
}

export function applyPercentDiscount(amount: number, percent: number): number {
  const p = Math.min(100, Math.max(0, percent))
  return Math.round(amount - (amount * p) / 100)
}

export function applyFixedDiscount(amount: number, discount: number): number {
  return Math.max(0, amount - Math.max(0, discount))
}

export interface OrderTotals {
  subtotalAmount: number
  discountAmount: number
  totalAmount: number
}

export function computeTotals(
  lines: Array<{ unitAmount: number; quantity: number }>,
  discount?: { type: 'PERCENT' | 'FIXED'; value: number } | null,
  sponsorshipPercent?: number | null,
): OrderTotals {
  const subtotalAmount = lines.reduce((s, l) => s + l.unitAmount * l.quantity, 0)
  let afterCoupon = subtotalAmount
  if (discount) {
    afterCoupon =
      discount.type === 'PERCENT'
        ? applyPercentDiscount(subtotalAmount, discount.value)
        : applyFixedDiscount(subtotalAmount, discount.value)
  }
  const afterSponsorship = sponsorshipPercent ? applyPercentDiscount(afterCoupon, sponsorshipPercent) : afterCoupon
  return {
    subtotalAmount,
    discountAmount: subtotalAmount - afterSponsorship,
    totalAmount: afterSponsorship,
  }
}
