import { describe, expect, it } from 'vitest'
import { computeBackoffMinutes, isExhausted, MAX_BACKOFF_MINUTES, nextRunAt, zombieThreshold, ZOMBIE_LOCK_MINUTES } from '../backoff'

describe('computeBackoffMinutes', () => {
  it('double le délai à chaque tentative (2^attempts minutes)', () => {
    expect(computeBackoffMinutes(1)).toBe(2)
    expect(computeBackoffMinutes(2)).toBe(4)
    expect(computeBackoffMinutes(3)).toBe(8)
    expect(computeBackoffMinutes(5)).toBe(32)
  })

  it('applique un minimum d’une minute pour des valeurs nulles ou invalides', () => {
    expect(computeBackoffMinutes(0)).toBe(1)
    expect(computeBackoffMinutes(-3)).toBe(1)
    expect(computeBackoffMinutes(Number.NaN)).toBe(1)
  })

  it('plafonne à 24 heures', () => {
    expect(computeBackoffMinutes(11)).toBe(MAX_BACKOFF_MINUTES)
    expect(computeBackoffMinutes(40)).toBe(MAX_BACKOFF_MINUTES)
  })

  it('tronque les tentatives fractionnaires', () => {
    expect(computeBackoffMinutes(2.9)).toBe(4)
  })
})

describe('nextRunAt', () => {
  it('ajoute le backoff à l’instant de référence', () => {
    const now = new Date('2026-09-04T10:00:00.000Z')
    expect(nextRunAt(1, now).toISOString()).toBe('2026-09-04T10:02:00.000Z')
    expect(nextRunAt(3, now).toISOString()).toBe('2026-09-04T10:08:00.000Z')
  })
})

describe('isExhausted', () => {
  it('déclare le job mort lorsque attempts atteint maxAttempts', () => {
    expect(isExhausted(4, 5)).toBe(false)
    expect(isExhausted(5, 5)).toBe(true)
    expect(isExhausted(7, 5)).toBe(true)
  })

  it('considère au moins une tentative', () => {
    expect(isExhausted(1, 0)).toBe(true)
  })
})

describe('zombieThreshold', () => {
  it('recule de la durée de verrou maximale', () => {
    const now = new Date('2026-09-04T10:30:00.000Z')
    const expected = new Date(now.getTime() - ZOMBIE_LOCK_MINUTES * 60_000)
    expect(zombieThreshold(now).getTime()).toBe(expected.getTime())
  })
})
