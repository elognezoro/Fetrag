import { resolvePublicUrl } from '@fetrag/config'
import { certificateCriteriaSchema, idSchema, type CertificateVerification } from '@fetrag/contracts'
import { prisma, type CertificateKind, type CertificateStatus, type Prisma } from '@fetrag/db'
import {
  addMonths,
  audit,
  emit,
  formatCertificateNumber,
  hashIp,
  makeVerifyCode,
  NotFoundError,
  normalizeVerifyCode,
  PreconditionError,
  toPaginated,
} from '@fetrag/domain'
import { z } from 'zod'
import { computeAttendanceRate } from './internal/attendance-rate'
import { assertCan, assertOwnerOrCan, auditContext, can, isCoordination, requirePrincipal } from './lib/access'
import { emailTemplates, safeEnqueue, safeNotifyUser, safeSendEmail } from './lib/integrations'
import { toJsonInput, toJsonValue } from './lib/json'
import { settingKeys } from './lib/settings'
import { displayName } from './lib/text'
import type { Principal, RequestMeta } from './types'

// -----------------------------------------------------------------------------
// Schémas d'entrée
// -----------------------------------------------------------------------------

export const certificateTemplateInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  kind: z.enum(['CERTIFICATE', 'ATTESTATION']).default('ATTESTATION'),
  courseId: idSchema.nullable().optional(),
  titleText: z.string().trim().min(2).max(160).default('Attestation de formation'),
  bodyText: z.string().trim().min(2).max(600).default('a suivi avec succès la formation'),
  signatoryName: z.string().trim().min(2).max(120).default('Jocelyn Louis NGOMA'),
  signatoryTitle: z.string().trim().min(2).max(160).default('Secrétaire Général de la FETRAG'),
  criteria: certificateCriteriaSchema.partial().optional(),
  validityMonths: z.number().int().positive().max(120).nullable().optional(),
  isDefault: z.boolean().default(false),
})
export type CertificateTemplateInput = z.infer<typeof certificateTemplateInputSchema>

export const revokeInputSchema = z.object({
  certificateId: idSchema,
  reason: z.string().trim().min(3).max(500),
})

// -----------------------------------------------------------------------------
// Éligibilité
// -----------------------------------------------------------------------------

export interface EligibilityResult {
  eligible: boolean
  reasons: string[]
  template: { id: string; name: string; kind: CertificateKind; validityMonths: number | null } | null
  enrollment: { id: string; userId: string; courseId: string; cohortId: string | null; status: string; progressPercent: number; score: number | null }
  attendanceRate: number | null
  existingCertificateId: string | null
}

/** Sélectionne le modèle applicable : explicite, sinon celui du cours, sinon le modèle par défaut. */
export async function resolveTemplate(courseId: string, templateId?: string | null) {
  if (templateId) {
    const template = await prisma.certificateTemplate.findUnique({ where: { id: templateId } })
    if (!template) throw new NotFoundError('Modèle de certificat', templateId)
    return template
  }
  const forCourse = await prisma.certificateTemplate.findFirst({ where: { courseId }, orderBy: { createdAt: 'desc' } })
  if (forCourse) return forCourse
  return prisma.certificateTemplate.findFirst({ where: { isDefault: true }, orderBy: { createdAt: 'desc' } })
}

/**
 * Vérifie les critères du modèle (achèvement, score minimal, assiduité minimale).
 * Un score nul (cours sans évaluation notée) ne bloque pas le critère de score.
 */
export async function checkEligibility(enrollmentId: string, templateId?: string | null): Promise<EligibilityResult> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { certificates: { where: { status: 'ISSUED' }, select: { id: true } } },
  })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)

  const template = await resolveTemplate(enrollment.courseId, templateId)
  const reasons: string[] = []
  if (!template) reasons.push("Aucun modèle de certificat n'est configuré pour ce cours.")

  const criteria = certificateCriteriaSchema.parse(template?.criteria ?? {})
  if (criteria.requireCompletion && enrollment.status !== 'COMPLETED') {
    reasons.push("La formation n'est pas terminée.")
  }
  if (enrollment.status === 'CANCELLED' || enrollment.status === 'SUSPENDED' || enrollment.status === 'EXPIRED') {
    reasons.push("L'inscription n'est plus active.")
  }
  if (criteria.minScore > 0 && enrollment.score !== null && enrollment.score < criteria.minScore) {
    reasons.push(`Score insuffisant (${enrollment.score} % < ${criteria.minScore} %).`)
  }

  let attendanceRate: number | null = null
  if (enrollment.cohortId) {
    const result = await computeAttendanceRate(prisma, enrollment.userId, enrollment.cohortId)
    attendanceRate = result.rate
    if (criteria.minAttendanceRate > 0 && result.totalSessions > 0) {
      const rate = result.rate ?? 0
      if (rate < criteria.minAttendanceRate) {
        reasons.push(`Assiduité insuffisante (${rate} % < ${criteria.minAttendanceRate} %).`)
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    template: template ? { id: template.id, name: template.name, kind: template.kind, validityMonths: template.validityMonths } : null,
    enrollment: {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      cohortId: enrollment.cohortId,
      status: enrollment.status,
      progressPercent: enrollment.progressPercent,
      score: enrollment.score,
    },
    attendanceRate,
    existingCertificateId: enrollment.certificates[0]?.id ?? null,
  }
}

// -----------------------------------------------------------------------------
// Émission
// -----------------------------------------------------------------------------

/** Incrémente atomiquement le compteur `certificates.sequence` (SystemSetting) et renvoie la nouvelle valeur. */
async function nextCertificateSequence(tx: Prisma.TransactionClient): Promise<number> {
  const key = settingKeys.certificateSequence
  await tx.$executeRaw`INSERT INTO "SystemSetting" ("key", "value", "description", "updatedAt") VALUES (${key}, '0'::jsonb, 'Compteur séquentiel des certificats', NOW()) ON CONFLICT ("key") DO NOTHING`
  const rows = await tx.$queryRaw<Array<{ value: number }>>`UPDATE "SystemSetting" SET "value" = to_jsonb(COALESCE(("value" #>> '{}')::int, 0) + 1), "updatedAt" = NOW() WHERE "key" = ${key} RETURNING ("value" #>> '{}')::int AS "value"`
  const value = rows[0]?.value
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new PreconditionError('Impossible de générer le numéro de certificat')
  }
  return Number(value)
}

interface IssueActor {
  principal?: Principal | null
  meta?: RequestMeta
}

/**
 * Émission interne (sans contrôle de permission) : idempotente par inscription,
 * numéro séquentiel en transaction, job de rendu PDF, audit, événement, notification.
 */
export async function issueInternal(enrollmentId: string, templateId: string | null | undefined, actor: IssueActor = {}) {
  const eligibility = await checkEligibility(enrollmentId, templateId)
  if (eligibility.existingCertificateId) {
    const existing = await prisma.certificate.findUnique({ where: { id: eligibility.existingCertificateId } })
    if (existing) return { certificate: existing, created: false }
  }
  if (!eligibility.eligible || !eligibility.template) {
    throw new PreconditionError("Les conditions d'émission ne sont pas remplies", { reasons: eligibility.reasons })
  }

  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
      course: { select: { id: true, title: true, code: true } },
      cohort: { select: { id: true, code: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
  })
  const template = await prisma.certificateTemplate.findUniqueOrThrow({ where: { id: eligibility.template.id } })
  const issuedAt = new Date()
  const holderName = displayName(enrollment.user)

  const certificate = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.certificate.findFirst({ where: { enrollmentId, status: 'ISSUED' } })
    if (duplicate) return duplicate
    const sequence = await nextCertificateSequence(tx)
    const verifyCode = makeVerifyCode()
    return tx.certificate.create({
      data: {
        number: formatCertificateNumber(sequence, issuedAt),
        verifyCode,
        kind: template.kind,
        status: 'ISSUED',
        userId: enrollment.userId,
        enrollmentId: enrollment.id,
        cohortId: enrollment.cohortId,
        templateId: template.id,
        courseTitle: enrollment.course.title,
        holderName,
        score: enrollment.score,
        attendanceRate: eligibility.attendanceRate,
        issuedAt,
        expiresAt: template.validityMonths ? addMonths(issuedAt, template.validityMonths) : null,
        metadata: toJsonValue({
          courseCode: enrollment.course.code,
          organizationId: enrollment.organization?.id ?? null,
          organizationName: enrollment.organization?.name ?? null,
          cohortCode: enrollment.cohort?.code ?? null,
          cohortName: enrollment.cohort?.name ?? null,
          templateName: template.name,
          titleText: template.titleText,
          bodyText: template.bodyText,
          signatoryName: template.signatoryName,
          signatoryTitle: template.signatoryTitle,
          verifyUrl: `${resolvePublicUrl('web')}/certificats/verifier/${verifyCode}`,
          issuedById: actor.principal?.id ?? null,
        }),
      },
    })
  })

  await safeEnqueue('certificate.render', { certificateId: certificate.id }, { idempotencyKey: `certificate.render:${certificate.id}` })
  await audit(
    'certificate.issued',
    { type: 'Certificate', id: certificate.id },
    auditContext(actor.principal, actor.meta),
    { after: { number: certificate.number, enrollmentId, userId: enrollment.userId } },
  )
  await emit(
    'certificate.issued',
    { certificateId: certificate.id, number: certificate.number, userId: enrollment.userId, enrollmentId, courseId: enrollment.courseId },
    actor.principal ? { actorId: actor.principal.id } : {},
  )
  await safeNotifyUser(enrollment.userId, {
    title: template.kind === 'CERTIFICATE' ? 'Votre certificat est disponible' : 'Votre attestation est disponible',
    body: `${template.titleText} - ${enrollment.course.title} (${certificate.number}).`,
    href: `/certificats/${certificate.id}`,
    category: 'certificates',
    email: false,
  })
  await safeSendEmail({
    to: enrollment.user.email,
    userId: enrollment.userId,
    template: emailTemplates.certificateIssued,
    variables: {
      firstName: enrollment.user.firstName ?? holderName,
      holderName,
      courseTitle: enrollment.course.title,
      certificateNumber: certificate.number,
      kindLabel: template.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation',
      verifyUrl: `${resolvePublicUrl('web')}/certificats/verifier/${certificate.verifyCode}`,
      certificateUrl: `${resolvePublicUrl('lms')}/certificats/${certificate.id}`,
    },
  })
  return { certificate, created: true }
}

/** Émission par un rôle habilité (coordination). */
export async function issue(principal: Principal, enrollmentId: string, templateId?: string | null, meta: RequestMeta = {}) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId }, select: { courseId: true, cohortId: true, organizationId: true } })
  if (!enrollment) throw new NotFoundError('Inscription', enrollmentId)
  assertCan(principal, 'certificate.issue', { courseId: enrollment.courseId, cohortId: enrollment.cohortId, organizationId: enrollment.organizationId })
  return issueInternal(enrollmentId, templateId, { principal, meta })
}

/**
 * Émission automatique à l'achèvement d'un cours : uniquement si un modèle existe
 * (par cours ou par défaut) et que les critères sont remplis. Ne lève jamais.
 */
export async function autoIssueForEnrollment(enrollmentId: string): Promise<{ id: string; number: string } | null> {
  try {
    const eligibility = await checkEligibility(enrollmentId)
    if (eligibility.existingCertificateId) {
      const existing = await prisma.certificate.findUnique({ where: { id: eligibility.existingCertificateId }, select: { id: true, number: true } })
      return existing
    }
    if (!eligibility.template || !eligibility.eligible) return null
    const { certificate } = await issueInternal(enrollmentId, eligibility.template.id)
    return { id: certificate.id, number: certificate.number }
  } catch (error) {
    console.error('[lms-core] émission automatique du certificat impossible', enrollmentId, error)
    return null
  }
}

/** Émet les certificats de tous les membres éligibles d'une cohorte. */
export async function issueForCohort(principal: Principal, cohortId: string, templateId?: string | null, meta: RequestMeta = {}) {
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { id: true, courseId: true, organizationId: true } })
  if (!cohort) throw new NotFoundError('Cohorte', cohortId)
  assertCan(principal, 'certificate.issue', { courseId: cohort.courseId, cohortId, organizationId: cohort.organizationId })
  const enrollments = await prisma.enrollment.findMany({
    where: { cohortId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    select: { id: true, userId: true, user: { select: { name: true, firstName: true, lastName: true, email: true } } },
  })
  const issued: Array<{ enrollmentId: string; certificateId: string; number: string; holderName: string; created: boolean }> = []
  const skipped: Array<{ enrollmentId: string; holderName: string; reasons: string[] }> = []
  for (const enrollment of enrollments) {
    const holderName = displayName(enrollment.user)
    const eligibility = await checkEligibility(enrollment.id, templateId)
    if (!eligibility.eligible && !eligibility.existingCertificateId) {
      skipped.push({ enrollmentId: enrollment.id, holderName, reasons: eligibility.reasons })
      continue
    }
    try {
      const { certificate, created } = await issueInternal(enrollment.id, templateId, { principal, meta })
      issued.push({ enrollmentId: enrollment.id, certificateId: certificate.id, number: certificate.number, holderName, created })
    } catch (error) {
      skipped.push({ enrollmentId: enrollment.id, holderName, reasons: [error instanceof Error ? error.message : 'Erreur inconnue'] })
    }
  }
  return { issued, skipped }
}

// -----------------------------------------------------------------------------
// Révocation, vérification, consultation
// -----------------------------------------------------------------------------

export async function revoke(principal: Principal, certificateId: string, reason: string, meta: RequestMeta = {}) {
  const input = revokeInputSchema.parse({ certificateId, reason })
  const certificate = await prisma.certificate.findUnique({
    where: { id: input.certificateId },
    include: { enrollment: { select: { courseId: true, organizationId: true, cohortId: true } } },
  })
  if (!certificate) throw new NotFoundError('Certificat', certificateId)
  assertCan(principal, 'certificate.revoke', {
    courseId: certificate.enrollment?.courseId,
    cohortId: certificate.cohortId,
    organizationId: certificate.enrollment?.organizationId,
  })
  if (certificate.status === 'REVOKED') return certificate
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { status: 'REVOKED', revokedAt: new Date(), revokedReason: input.reason },
  })
  await audit('certificate.revoked', { type: 'Certificate', id: certificate.id }, auditContext(principal, meta), {
    before: { status: certificate.status },
    after: { status: 'REVOKED', reason: input.reason },
  })
  await emit('certificate.revoked', { certificateId: certificate.id, number: certificate.number, userId: certificate.userId, reason: input.reason }, { actorId: principal.id })
  await safeNotifyUser(certificate.userId, {
    title: 'Certificat révoqué',
    body: `Le certificat ${certificate.number} a été révoqué : ${input.reason}`,
    href: `/certificats/${certificate.id}`,
    category: 'certificates',
    email: true,
  })
  return updated
}

const emptyVerification: CertificateVerification = {
  valid: false,
  status: null,
  number: null,
  holderName: null,
  courseTitle: null,
  issuedAt: null,
  expiresAt: null,
  kind: null,
}

/**
 * Vérification publique par code (ou numéro). Journalise chaque consultation
 * (IP hachée) et ne renvoie que les données minimales du certificat.
 */
export async function verify(code: string, ctx: { ip?: string | null; userAgent?: string | null } = {}): Promise<CertificateVerification> {
  const raw = (code ?? '').trim()
  if (!raw) return emptyVerification
  const normalized = normalizeVerifyCode(raw)
  let certificate = await prisma.certificate.findUnique({ where: { verifyCode: normalized } })
  if (!certificate) certificate = await prisma.certificate.findUnique({ where: { number: raw.toUpperCase() } })
  if (!certificate) return emptyVerification

  let status: CertificateStatus = certificate.status
  if (status === 'ISSUED' && certificate.expiresAt && certificate.expiresAt.getTime() < Date.now()) {
    status = 'EXPIRED'
    await prisma.certificate.update({ where: { id: certificate.id }, data: { status: 'EXPIRED' } })
  }
  const result = status === 'ISSUED' ? 'valid' : status.toLowerCase()
  await prisma.certificateVerificationEvent.create({
    data: { certificateId: certificate.id, ipHash: hashIp(ctx.ip), userAgent: ctx.userAgent?.slice(0, 300) ?? null, result },
  })
  return {
    valid: status === 'ISSUED',
    status,
    number: certificate.number,
    holderName: certificate.holderName,
    courseTitle: certificate.courseTitle,
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
    kind: certificate.kind,
  }
}

/** Certificats d'un utilisateur (le sien par défaut ; un tiers exige un rôle habilité). */
export async function listForUser(principal: Principal, userId?: string) {
  const p = requirePrincipal(principal)
  const target = userId ?? p.id
  if (target !== p.id) assertCan(p, 'users.read', {}, "Consultation des certificats d'un tiers refusée")
  return prisma.certificate.findMany({
    where: { userId: target },
    orderBy: { issuedAt: 'desc' },
    include: {
      cohort: { select: { id: true, code: true, name: true } },
      enrollment: { select: { id: true, courseId: true, course: { select: { slug: true, title: true, pillar: true } } } },
    },
  })
}

/** Détail d'un certificat : titulaire, coordination, ou responsable de l'organisation concernée. */
export async function get(principal: Principal, certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } },
      cohort: { select: { id: true, code: true, name: true, organizationId: true } },
      enrollment: { select: { id: true, courseId: true, organizationId: true, course: { select: { slug: true, title: true, code: true } } } },
      template: true,
      verifications: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!certificate) throw new NotFoundError('Certificat', certificateId)
  const organizationId = certificate.enrollment?.organizationId ?? certificate.cohort?.organizationId ?? null
  const p = requirePrincipal(principal)
  const allowed =
    certificate.userId === p.id ||
    can(p, 'certificate.issue', { courseId: certificate.enrollment?.courseId, cohortId: certificate.cohortId }) ||
    (organizationId ? can(p, 'organization.read', { organizationId }) : false)
  if (!allowed) throw new NotFoundError('Certificat', certificateId)
  return certificate
}

/** Liste paginée pour la coordination (filtres statut / cours / organisation / recherche). */
export async function list(
  principal: Principal,
  query: { page?: number; pageSize?: number; q?: string; status?: CertificateStatus; courseId?: string; organizationId?: string } = {},
) {
  assertCan(principal, 'certificate.issue')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20))
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q ? { OR: [{ number: { contains: query.q, mode: 'insensitive' as const } }, { holderName: { contains: query.q, mode: 'insensitive' as const } }] } : {}),
    ...(query.courseId || query.organizationId
      ? { enrollment: { ...(query.courseId ? { courseId: query.courseId } : {}), ...(query.organizationId ? { organizationId: query.organizationId } : {}) } }
      : {}),
  }
  const [items, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { cohort: { select: { code: true, name: true } }, enrollment: { select: { organization: { select: { name: true } } } } },
    }),
    prisma.certificate.count({ where }),
  ])
  return toPaginated(items, total, { page, pageSize })
}

// -----------------------------------------------------------------------------
// Modèles de certificats
// -----------------------------------------------------------------------------

export async function listTemplates(principal: Principal) {
  assertCan(principal, 'certificate.issue')
  return prisma.certificateTemplate.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    include: { course: { select: { id: true, title: true, code: true } }, _count: { select: { certificates: true } } },
  })
}

export async function createTemplate(principal: Principal, input: CertificateTemplateInput, meta: RequestMeta = {}) {
  assertCan(principal, 'certificate.issue')
  const data = certificateTemplateInputSchema.parse(input)
  const template = await prisma.$transaction(async (tx) => {
    if (data.isDefault) await tx.certificateTemplate.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    return tx.certificateTemplate.create({
      data: {
        name: data.name,
        kind: data.kind,
        courseId: data.courseId ?? null,
        titleText: data.titleText,
        bodyText: data.bodyText,
        signatoryName: data.signatoryName,
        signatoryTitle: data.signatoryTitle,
        criteria: toJsonValue(certificateCriteriaSchema.parse(data.criteria ?? {})),
        validityMonths: data.validityMonths ?? null,
        isDefault: data.isDefault,
      },
    })
  })
  await audit('content.created', { type: 'CertificateTemplate', id: template.id }, auditContext(principal, meta), { after: { name: template.name } })
  return template
}

export async function updateTemplate(principal: Principal, templateId: string, input: Partial<CertificateTemplateInput>, meta: RequestMeta = {}) {
  assertCan(principal, 'certificate.issue')
  const existing = await prisma.certificateTemplate.findUnique({ where: { id: templateId } })
  if (!existing) throw new NotFoundError('Modèle de certificat', templateId)
  const data = certificateTemplateInputSchema.partial().parse(input)
  const template = await prisma.$transaction(async (tx) => {
    if (data.isDefault) await tx.certificateTemplate.updateMany({ where: { isDefault: true, id: { not: templateId } }, data: { isDefault: false } })
    return tx.certificateTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        kind: data.kind,
        courseId: data.courseId === undefined ? undefined : data.courseId,
        titleText: data.titleText,
        bodyText: data.bodyText,
        signatoryName: data.signatoryName,
        signatoryTitle: data.signatoryTitle,
        criteria: data.criteria === undefined ? undefined : toJsonInput(certificateCriteriaSchema.parse({ ...certificateCriteriaSchema.parse(existing.criteria ?? {}), ...data.criteria })),
        validityMonths: data.validityMonths === undefined ? undefined : data.validityMonths,
        isDefault: data.isDefault,
      },
    })
  })
  await audit('content.updated', { type: 'CertificateTemplate', id: template.id }, auditContext(principal, meta), {
    before: { name: existing.name },
    after: { name: template.name },
  })
  return template
}

/** Suppression d'un modèle jamais utilisé (sinon 412). */
export async function removeTemplate(principal: Principal, templateId: string, meta: RequestMeta = {}) {
  assertCan(principal, 'certificate.issue')
  const template = await prisma.certificateTemplate.findUnique({ where: { id: templateId }, include: { _count: { select: { certificates: true } } } })
  if (!template) throw new NotFoundError('Modèle de certificat', templateId)
  if (template._count.certificates > 0) {
    throw new PreconditionError('Ce modèle a déjà servi à émettre des certificats et ne peut pas être supprimé')
  }
  await prisma.certificateTemplate.delete({ where: { id: templateId } })
  await audit('content.archived', { type: 'CertificateTemplate', id: templateId }, auditContext(principal, meta), { before: { name: template.name } })
}

/** Vérifie qu'un principal peut consulter les certificats d'une inscription (propriétaire ou coordination). */
export function assertCertificateReader(principal: Principal, enrollment: { userId: string; courseId: string; organizationId: string | null }) {
  return assertOwnerOrCan(principal, 'certificate.issue', { ownerId: enrollment.userId, courseId: enrollment.courseId, organizationId: enrollment.organizationId })
}

export { isCoordination }
