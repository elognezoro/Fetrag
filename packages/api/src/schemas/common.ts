// Schémas de réponse partagés (réutilisent les primitives et enums de @fetrag/contracts).
import { z } from '@hono/zod-openapi'
import {
  certificateStatuses,
  cohortStatuses,
  courseLevels,
  courseModalitySchema,
  enrollmentStatuses,
  idSchema,
  pillarSchema,
  sessionModeSchema,
} from '@fetrag/contracts'

/** Date ISO 8601 (UTC) telle que sérialisée par JSON. */
export const isoDateSchema = z.string().datetime({ offset: true }).openapi({ example: '2026-03-15T08:00:00.000Z' })
export const nullableDateSchema = isoDateSchema.nullable()

export const categoryRefSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    name: z.string(),
    color: z.string().nullable(),
  })
  .openapi('CategoryRef')

export const organizationRefSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    acronym: z.string().nullable(),
  })
  .openapi('OrganizationRef')

export const offerSummarySchema = z
  .object({
    id: idSchema,
    kind: z.enum(['COURSE', 'EVENT', 'SERVICE', 'RESOURCE']),
    name: z.string(),
    description: z.string().nullable(),
    tier: z.enum(['STANDARD', 'MEMBER', 'ORGANIZATION', 'GROUP']),
    amount: z.number().int(),
    currency: z.string(),
    validFrom: nullableDateSchema,
    validUntil: nullableDateSchema,
    quota: z.number().int().nullable(),
    isActive: z.boolean(),
  })
  .openapi('OfferSummary')

export const courseRefSchema = z
  .object({
    id: idSchema,
    slug: z.string(),
    title: z.string(),
    code: z.string(),
    pillar: pillarSchema.nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    durationHours: z.number().int().optional(),
    modality: courseModalitySchema.optional(),
    level: z.enum(courseLevels).optional(),
  })
  .openapi('CourseRef')

export const cohortRefSchema = z
  .object({
    id: idSchema,
    code: z.string(),
    name: z.string().optional(),
    status: z.enum(cohortStatuses).optional(),
    mode: sessionModeSchema.optional(),
    startsAt: nullableDateSchema.optional(),
    endsAt: nullableDateSchema.optional(),
  })
  .openapi('CohortRef')

export const certificateRefSchema = z
  .object({
    id: idSchema,
    number: z.string(),
    kind: z.enum(['CERTIFICATE', 'ATTESTATION']),
    issuedAt: isoDateSchema.optional(),
  })
  .openapi('CertificateRef')

export const enrollmentStatusSchema = z.enum(enrollmentStatuses)
export const certificateStatusSchema = z.enum(certificateStatuses)

export const userRefSchema = z
  .object({
    id: idSchema,
    name: z.string().nullable(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    email: z.string().optional(),
  })
  .openapi('UserRef')

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(160).openapi({ param: { name: 'slug', in: 'path' }, example: 'fondamentaux-du-syndicalisme-gabonais' }),
})

export const idParamSchema = z.object({
  id: idSchema.openapi({ param: { name: 'id', in: 'path' }, example: '3f6c1a2e-7d4b-4c8e-9a1f-2b3c4d5e6f70' }),
})
