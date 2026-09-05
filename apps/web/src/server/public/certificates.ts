import 'server-only'
import type { CertificateVerification } from '@fetrag/contracts'
import { certification } from '@fetrag/lms-core'
import { requestContext } from './request-context'

/** Forme acceptée d'un code de vérification ou d'un numéro de certificat (saisie utilisateur bornée). */
const CODE_PATTERN = /^[A-Za-z0-9-]{4,40}$/

/** Normalise la saisie (espaces retirés, majuscules) ; `null` si le format est manifestement invalide. */
export function normalizeCodeInput(raw: string | undefined): string | null {
  const value = (raw ?? '').replace(/\s+/g, '').trim().toUpperCase()
  if (!value || !CODE_PATTERN.test(value)) return null
  return value
}

export interface VerificationOutcome {
  code: string
  result: CertificateVerification | null
  /** Vrai si la vérification n'a pas pu être effectuée (service indisponible). */
  unavailable: boolean
}

/**
 * Vérification publique d'un certificat par son code (ou son numéro) via `certification.verify`.
 * Chaque consultation est journalisée côté LMS (IP hachée, agent utilisateur).
 */
export async function verifyCertificate(code: string): Promise<VerificationOutcome> {
  const ctx = await requestContext()
  try {
    const result = await certification.verify(code, { ip: ctx.ip, userAgent: ctx.userAgent })
    return { code, result, unavailable: false }
  } catch (error) {
    console.error('[web:certificates] vérification impossible :', error instanceof Error ? error.message : error)
    return { code, result: null, unavailable: true }
  }
}
