import { describe, expect, it } from 'vitest'
import { buildOrderTotals, computeCouponDiscount } from '../totals'

describe('computeCouponDiscount', () => {
  it('calcule un pourcentage arrondi à l’entier', () => {
    expect(computeCouponDiscount({ type: 'PERCENT', value: 10 }, 25000)).toBe(2500)
    expect(computeCouponDiscount({ type: 'PERCENT', value: 33 }, 1000)).toBe(330)
    expect(computeCouponDiscount({ type: 'PERCENT', value: 15 }, 999)).toBe(150)
  })

  it('plafonne le pourcentage entre 0 et 100', () => {
    expect(computeCouponDiscount({ type: 'PERCENT', value: 150 }, 5000)).toBe(5000)
    expect(computeCouponDiscount({ type: 'PERCENT', value: -5 }, 5000)).toBe(0)
  })

  it('limite un montant fixe au sous-total', () => {
    expect(computeCouponDiscount({ type: 'FIXED', value: 3000 }, 25000)).toBe(3000)
    expect(computeCouponDiscount({ type: 'FIXED', value: 30000 }, 25000)).toBe(25000)
    expect(computeCouponDiscount({ type: 'FIXED', value: -10 }, 25000)).toBe(0)
  })

  it('renvoie 0 sans coupon ou pour un montant nul', () => {
    expect(computeCouponDiscount(null, 25000)).toBe(0)
    expect(computeCouponDiscount({ type: 'FIXED', value: 100 }, 0)).toBe(0)
  })
})

describe('buildOrderTotals', () => {
  it('calcule le sous-total à partir du prix unitaire et de la quantité', () => {
    const totals = buildOrderTotals({ unitAmount: 15000, quantity: 3 })
    expect(totals).toEqual({
      subtotalAmount: 45000,
      discountAmount: 0,
      totalAmount: 45000,
      couponDiscount: 0,
      sponsorshipDiscount: 0,
      isFree: false,
    })
  })

  it('applique le coupon puis la prise en charge sur le reste', () => {
    const totals = buildOrderTotals({
      unitAmount: 20000,
      quantity: 1,
      coupon: { type: 'PERCENT', value: 10 },
      sponsorshipPercent: 50,
    })
    expect(totals.subtotalAmount).toBe(20000)
    expect(totals.couponDiscount).toBe(2000)
    expect(totals.sponsorshipDiscount).toBe(9000)
    expect(totals.discountAmount).toBe(11000)
    expect(totals.totalAmount).toBe(9000)
    expect(totals.isFree).toBe(false)
  })

  it('reconnaît une commande gratuite avec une prise en charge totale', () => {
    const totals = buildOrderTotals({ unitAmount: 20000, quantity: 2, sponsorshipPercent: 100 })
    expect(totals.totalAmount).toBe(0)
    expect(totals.discountAmount).toBe(40000)
    expect(totals.sponsorshipDiscount).toBe(40000)
    expect(totals.isFree).toBe(true)
  })

  it('ne descend jamais sous zéro avec un coupon fixe supérieur au sous-total', () => {
    const totals = buildOrderTotals({ unitAmount: 5000, quantity: 1, coupon: { type: 'FIXED', value: 8000 } })
    expect(totals.totalAmount).toBe(0)
    expect(totals.discountAmount).toBe(5000)
    expect(totals.isFree).toBe(true)
  })

  it('normalise une quantité ou un montant invalides', () => {
    const totals = buildOrderTotals({ unitAmount: 1234.6, quantity: 0.4 })
    expect(totals.subtotalAmount).toBe(1235)
    expect(totals.totalAmount).toBe(1235)
  })

  it('produit toujours des entiers (XAF sans sous-unité)', () => {
    const totals = buildOrderTotals({ unitAmount: 3333, quantity: 3, coupon: { type: 'PERCENT', value: 7 }, sponsorshipPercent: 33 })
    for (const value of [totals.subtotalAmount, totals.discountAmount, totals.totalAmount, totals.couponDiscount, totals.sponsorshipDiscount]) {
      expect(Number.isInteger(value)).toBe(true)
    }
    expect(totals.subtotalAmount - totals.discountAmount).toBe(totals.totalAmount)
  })
})
