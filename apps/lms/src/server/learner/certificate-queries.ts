import 'server-only'
import { pillarSchema, type PillarName } from '@fetrag/contracts'
import { isDomainError, type Principal } from '@fetrag/domain'
import { certification } from '@fetrag/lms-core'

/** Numéro et nature d'un certificat pour les métadonnées (contrôle d'accès lms-core, sans génération de QR). */
export async function getCertificateMeta(principal: Principal, certificateId: string): Promise<{ number: string; kind: 'CERTIFICATE' | 'ATTESTATION' } | null> {
  try {
    const certificate = await certification.get(principal, certificateId)
    return { number: certificate.number, kind: certificate.kind }
  } catch (error) {
    if (isDomainError(error)) return null
    throw error
  }
}

export type CertificateRow = Awaited<ReturnType<typeof certification.listForUser>>[number]

export interface CertificateListItem {
  certificate: CertificateRow
  pillar: PillarName | null
  /** Statut effectif (un certificat ISSUED dont la date de validité est dépassée est affiché « Expiré »). */
  effectiveStatus: 'ISSUED' | 'REVOKED' | 'EXPIRED'
}

export async function listMyCertificates(principal: Principal): Promise<CertificateListItem[]> {
  const rows = await certification.listForUser(principal)
  const now = Date.now()
  return rows.map((certificate) => {
    const pillar = pillarSchema.safeParse(certificate.enrollment?.course.pillar)
    const expired = certificate.status === 'ISSUED' && certificate.expiresAt !== null && certificate.expiresAt.getTime() < now
    return {
      certificate,
      pillar: pillar.success ? pillar.data : null,
      effectiveStatus: expired ? 'EXPIRED' : certificate.status,
    }
  })
}
