// Certificats : vérification publique GET /certificates/verify/{code} et émission
// POST /certificates/{enrollmentId}/issue (coordination, Idempotency-Key obligatoire).
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { certificateVerificationSchema, idSchema } from '@fetrag/contracts'
import { certification } from '@fetrag/lms-core'
import type { ApiEnv } from '../env'
import { errorResponses, jsonContent, protectedErrors } from '../lib/responses'
import { requestMeta } from '../lib/request'
import { authenticated, requireCan } from '../middleware/auth'
import { idempotencyRequired } from '../middleware/idempotency'
import { strictRateLimit } from '../middleware/rate-limit'
import { protectedSecurity } from '../openapi'
import { certificateStatusSchema, isoDateSchema, nullableDateSchema } from '../schemas/common'

export const certificateSchema = z
  .object({
    id: idSchema,
    number: z.string().openapi({ example: 'FETRAG-2026-000123' }),
    verifyCode: z.string().openapi({ example: 'H7K2-P9QX-4MW3' }),
    kind: z.enum(['CERTIFICATE', 'ATTESTATION']),
    status: certificateStatusSchema,
    userId: idSchema,
    enrollmentId: z.string().nullable(),
    cohortId: z.string().nullable(),
    templateId: z.string().nullable(),
    courseTitle: z.string(),
    holderName: z.string(),
    score: z.number().int().nullable(),
    attendanceRate: z.number().int().nullable(),
    issuedAt: isoDateSchema,
    expiresAt: nullableDateSchema,
    revokedAt: nullableDateSchema,
    revokedReason: z.string().nullable(),
    pdfUrl: z.string().nullable().openapi({ description: 'Clé ou URL du PDF (rendu asynchrone par le job certificate.render)' }),
  })
  .openapi('Certificate')

const verifyParams = z.object({
  code: z
    .string()
    .trim()
    .min(4)
    .max(40)
    .openapi({ param: { name: 'code', in: 'path' }, description: 'Code de vérification (H7K2-P9QX-4MW3) ou numéro (FETRAG-2026-000123)', example: 'H7K2-P9QX-4MW3' }),
})

const verifyRoute = createRoute({
  method: 'get',
  path: '/certificates/verify/{code}',
  tags: ['Certificats'],
  summary: 'Vérification publique d’un certificat ou d’une attestation',
  description: 'Chaque consultation est journalisée (adresse IP hachée). Seules les données minimales sont renvoyées.',
  middleware: [strictRateLimit],
  request: { params: verifyParams },
  responses: {
    200: jsonContent(certificateVerificationSchema.openapi('CertificateVerification'), 'Résultat de vérification (valid=false si inconnu)'),
    ...errorResponses(400, 429, 500),
  },
})

const issueParams = z.object({
  enrollmentId: idSchema.openapi({ param: { name: 'enrollmentId', in: 'path' } }),
})

const issueBodySchema = z.object({
  templateId: idSchema.optional().openapi({ description: 'Modèle de certificat ; par défaut celui du cours ou le modèle par défaut' }),
})

const issueRoute = createRoute({
  method: 'post',
  path: '/certificates/{enrollmentId}/issue',
  tags: ['Certificats'],
  summary: 'Émettre le certificat d’une inscription (coordination)',
  description:
    'Permission `certificate.issue` (coordination, super administrateur). Idempotent : une inscription n’a qu’un certificat valide. ' +
    'L’en-tête `Idempotency-Key` est obligatoire (428 sinon). Le PDF est rendu de façon asynchrone.',
  security: protectedSecurity,
  middleware: [authenticated, strictRateLimit, idempotencyRequired],
  request: {
    params: issueParams,
    body: { content: { 'application/json': { schema: issueBodySchema } }, required: false },
  },
  responses: {
    200: jsonContent(z.object({ certificate: certificateSchema, created: z.boolean() }), 'Certificat existant renvoyé'),
    201: jsonContent(z.object({ certificate: certificateSchema, created: z.boolean() }), 'Certificat émis'),
    ...protectedErrors(),
    ...errorResponses(412, 428),
  },
})

export const certificateRoutes = new OpenAPIHono<ApiEnv>()

certificateRoutes.openapi(verifyRoute, async (c) => {
  const { code } = c.req.valid('param')
  const meta = requestMeta(c)
  const result = await certification.verify(code, { ip: meta.ip, userAgent: meta.userAgent })
  c.header('Cache-Control', 'no-store')
  return c.json(result, 200)
})

certificateRoutes.openapi(issueRoute, async (c) => {
  const principal = requireCan(c, 'certificate.issue')
  const { enrollmentId } = c.req.valid('param')
  const body = c.req.valid('json') ?? {}
  const result = await certification.issue(principal, enrollmentId, body.templateId ?? null, requestMeta(c))
  const payload = { certificate: toCertificateDto(result.certificate), created: result.created }
  return result.created ? c.json(payload, 201) : c.json(payload, 200)
})

/** Projection stable d'un certificat (jamais les métadonnées internes). */
export function toCertificateDto(certificate: {
  id: string
  number: string
  verifyCode: string
  kind: 'CERTIFICATE' | 'ATTESTATION'
  status: 'ISSUED' | 'REVOKED' | 'EXPIRED'
  userId: string
  enrollmentId: string | null
  cohortId: string | null
  templateId: string | null
  courseTitle: string
  holderName: string
  score: number | null
  attendanceRate: number | null
  issuedAt: Date
  expiresAt: Date | null
  revokedAt: Date | null
  revokedReason: string | null
  pdfUrl: string | null
}) {
  return {
    id: certificate.id,
    number: certificate.number,
    verifyCode: certificate.verifyCode,
    kind: certificate.kind,
    status: certificate.status,
    userId: certificate.userId,
    enrollmentId: certificate.enrollmentId,
    cohortId: certificate.cohortId,
    templateId: certificate.templateId,
    courseTitle: certificate.courseTitle,
    holderName: certificate.holderName,
    score: certificate.score,
    attendanceRate: certificate.attendanceRate,
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
    revokedAt: certificate.revokedAt,
    revokedReason: certificate.revokedReason,
    pdfUrl: certificate.pdfUrl,
  }
}
