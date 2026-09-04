import { prisma } from '@fetrag/db'
import { resolvePublicUrl } from '@fetrag/config'
import { NotFoundError } from '@fetrag/domain'
import { buildKey, getStorage } from '@fetrag/storage'
import { parseCertificateRender } from '../payloads'
import { renderCertificatePdf } from '../pdf/certificate'
import type { JobHandler } from '../types'

/** URL publique de vérification d'un certificat (page `/certificats/verifier/[code]` de la vitrine). */
export function certificateVerifyUrl(verifyCode: string): string {
  return `${resolvePublicUrl('web')}/certificats/verifier/${encodeURIComponent(verifyCode)}`
}

/**
 * Génère le PDF d'un certificat, le dépose en stockage privé et renseigne `Certificate.pdfUrl`
 * avec la clé de stockage (l'accès passe par `getStorage().getSignedUrl(key)`).
 */
export const certificateRenderHandler: JobHandler = async (payload, ctx) => {
  const { certificateId } = parseCertificateRender(payload)
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      template: true,
      cohort: { select: { name: true, startsAt: true, endsAt: true, organization: { select: { name: true } } } },
      enrollment: {
        select: {
          organization: { select: { name: true } },
          course: { select: { durationHours: true } },
        },
      },
    },
  })
  if (!certificate) throw new NotFoundError('Certificat', certificateId)
  if (certificate.status === 'REVOKED') {
    ctx.logger.warn('certificate.render.skipped', { certificateId, reason: 'revoked' })
    return { skipped: 'revoked' }
  }

  const pdf = await renderCertificatePdf({
    kind: certificate.kind,
    number: certificate.number,
    verifyCode: certificate.verifyCode,
    verifyUrl: certificateVerifyUrl(certificate.verifyCode),
    holderName: certificate.holderName,
    courseTitle: certificate.courseTitle,
    titleText: certificate.template?.titleText,
    bodyText: certificate.template?.bodyText,
    score: certificate.score,
    attendanceRate: certificate.attendanceRate,
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
    cohortName: certificate.cohort?.name,
    sessionStart: certificate.cohort?.startsAt,
    sessionEnd: certificate.cohort?.endsAt,
    durationHours: certificate.enrollment?.course.durationHours,
    signatoryName: certificate.template?.signatoryName,
    signatoryTitle: certificate.template?.signatoryTitle,
    organizationName: certificate.cohort?.organization?.name ?? certificate.enrollment?.organization?.name,
  })

  const storage = getStorage()
  const { key } = await storage.put(buildKey('certificates', `${certificate.number}.pdf`), pdf, {
    contentType: 'application/pdf',
    visibility: 'PRIVATE',
  })
  await prisma.certificate.update({ where: { id: certificateId }, data: { pdfUrl: key } })
  ctx.logger.info('certificate.render.done', { certificateId, key, bytes: pdf.byteLength })
  return { key, bytes: pdf.byteLength }
}
