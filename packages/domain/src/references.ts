import { randomBytes, randomInt } from 'node:crypto'

/** Alphabet sans caractères ambigus (0/O, 1/I/L). */
const SAFE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function randomCode(length = 8, alphabet = SAFE_ALPHABET): string {
  let out = ''
  for (let i = 0; i < length; i++) out += alphabet[randomInt(0, alphabet.length)]
  return out
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/**
 * Références lisibles et uniques : PREFIX-AAAA-XXXXXX.
 * Utilisées pour commandes, demandes, reçus, certificats.
 */
export function makeReference(prefix: string, date: Date = new Date()): string {
  return `${prefix}-${date.getUTCFullYear()}-${randomCode(6)}`
}

export const referencePrefixes = {
  order: 'CMD',
  payment: 'PAY',
  receipt: 'REC',
  trainingRequest: 'DF',
  serviceRequest: 'SRV',
  form: 'MSG',
  certificate: 'FETRAG',
  cohort: 'COH',
} as const

/** Numéro de certificat séquentiel formaté : FETRAG-2026-000123 */
export function formatCertificateNumber(sequence: number, date: Date = new Date()): string {
  return `${referencePrefixes.certificate}-${date.getUTCFullYear()}-${String(sequence).padStart(6, '0')}`
}

/** Code de vérification public de certificat (12 caractères, sans ambiguïté). */
export function makeVerifyCode(): string {
  const raw = randomCode(12)
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
}

export function normalizeVerifyCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length !== 12) return input.trim().toUpperCase()
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`
}

export function makeCohortCode(courseCode: string, date: Date = new Date()): string {
  return `${referencePrefixes.cohort}-${courseCode}-${date.getUTCFullYear()}-${randomCode(4)}`
}
