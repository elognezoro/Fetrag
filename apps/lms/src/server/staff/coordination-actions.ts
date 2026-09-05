'use server'

import { revalidatePath } from 'next/cache'
import { idSchema, trainingRequestDecisionSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, can, ForbiddenError, NotFoundError, PreconditionError, slugify, uniqueSlug } from '@fetrag/domain'
import { enqueue, JobTypes } from '@fetrag/jobs'
import { auditContext, certification, cohortInputSchema, cohortUpdateSchema, cohorts, enrollments, trainingRequests } from '@fetrag/lms-core'
import { failureState, successState, type ActionState } from './action-state'
import { formBoolean, formDate, formInt, formList, formNullable, formOptional, formString, runAction } from './context'
import { organizationFormSchema, organizationManagerSchema } from './schemas'

function revalidateCoordination(paths: string[] = []) {
  revalidatePath('/coordination')
  for (const path of paths) revalidatePath(path)
}

// -----------------------------------------------------------------------------
// Demandes de formation : décisions (chapitre 14, étapes 6 et 7)
// -----------------------------------------------------------------------------

/** Décision de la coordination : complément, acceptation, refus, autre date, planification ou annulation. */
export async function decideTrainingRequest(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = trainingRequestDecisionSchema.parse({
      requestId: formString(formData, 'requestId'),
      decision: formString(formData, 'decision'),
      comment: formOptional(formData, 'comment'),
      proposedStart: formDate(formData, 'proposedStart'),
      proposedMode: formOptional(formData, 'proposedMode'),
      cohortName: formOptional(formData, 'cohortName'),
      trainerId: formOptional(formData, 'trainerId'),
    })
    const result = await trainingRequests.decide(principal, data, meta)
    revalidateCoordination(['/coordination/demandes', `/coordination/demandes/${data.requestId}`, '/coordination/cohortes', `/organisation/demandes/${data.requestId}`, `/demande-formation/${data.requestId}`, '/organisation', '/formateur'])
    if (result.schedule) {
      const { cohorts: created, accounts } = result.schedule
      return successState(
        `Formation planifiée : ${created.length} cohorte(s), ${accounts.enrolled} participant(s) inscrit(s) (${accounts.created} compte(s) créé(s))${accounts.skipped.length ? `, ${accounts.skipped.length} participant(s) sans email ignoré(s)` : ''}`,
        { payload: { cohorts: created, skipped: accounts.skipped } },
      )
    }
    const labels: Record<string, string> = {
      INFO_REQUESTED: 'Complément demandé à l’organisation',
      ACCEPTED: 'Demande acceptée : passez à la planification',
      REJECTED: 'Demande refusée et organisation informée',
      RESCHEDULED: 'Nouvelle date proposée à l’organisation',
      CANCELLED: 'Demande annulée',
    }
    return successState(labels[data.decision] ?? 'Décision enregistrée')
  })
}

// -----------------------------------------------------------------------------
// Cohortes
// -----------------------------------------------------------------------------

function cohortInputFromForm(formData: FormData) {
  return {
    courseId: formString(formData, 'courseId'),
    courseVersionId: formOptional(formData, 'courseVersionId'),
    name: formOptional(formData, 'name'),
    organizationId: formNullable(formData, 'organizationId'),
    trainerId: formNullable(formData, 'trainerId'),
    mode: formString(formData, 'mode') || 'HYBRID',
    capacity: formInt(formData, 'capacity') ?? null,
    startsAt: formDate(formData, 'startsAt') ?? null,
    endsAt: formDate(formData, 'endsAt') ?? null,
    location: formNullable(formData, 'location'),
    description: formNullable(formData, 'description'),
    isPrivate: formBoolean(formData, 'isPrivate'),
    status: formString(formData, 'status') || 'PLANNED',
  }
}

/** Création manuelle d'une cohorte (cours, version, organisation, formateur, dates, capacité). */
export async function createCohort(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = cohortInputSchema.parse(cohortInputFromForm(formData))
    const cohort = await cohorts.create(principal, data, meta)
    const memberIds = formList(formData, 'memberIds')
    let added = 0
    if (memberIds.length) {
      const result = await cohorts.addMembers(principal, cohort.id, memberIds, { source: 'coordination' }, meta)
      added = result.done.length
    }
    revalidateCoordination(['/coordination/cohortes', '/formateur', '/organisation'])
    return successState(`Cohorte ${cohort.code} créée${added ? ` avec ${added} membre(s)` : ''}`, { id: cohort.id, redirectTo: `/coordination/cohortes/${cohort.id}` })
  })
}

export async function updateCohort(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const cohortId = idSchema.parse(formString(formData, 'cohortId'))
    const { courseId: _courseId, courseVersionId: _versionId, ...rest } = cohortInputFromForm(formData)
    const data = cohortUpdateSchema.parse(rest)
    await cohorts.update(principal, cohortId, data, meta)
    revalidateCoordination(['/coordination/cohortes', `/coordination/cohortes/${cohortId}`, `/formateur/cohortes/${cohortId}`, '/coordination/sessions'])
    return successState('Cohorte mise à jour')
  })
}

export async function setCohortStatus(input: { cohortId: string; status: 'PLANNED' | 'OPEN' | 'RUNNING' | 'CLOSED' | 'CANCELLED' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const cohortId = idSchema.parse(input.cohortId)
    const status = z.enum(['PLANNED', 'OPEN', 'RUNNING', 'CLOSED', 'CANCELLED']).parse(input.status)
    await cohorts.setStatus(principal, cohortId, status, meta)
    revalidateCoordination(['/coordination/cohortes', `/coordination/cohortes/${cohortId}`, `/formateur/cohortes/${cohortId}`, '/organisation'])
    return successState('Statut de la cohorte mis à jour')
  })
}

/** Clôture de la cohorte (étape 9) puis émission des certificats des membres éligibles. */
export async function closeCohortAndIssue(input: { cohortId: string; issueCertificates: boolean; templateId?: string | null }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const cohortId = idSchema.parse(input.cohortId)
    await cohorts.close(principal, cohortId, meta)
    let summary = 'Cohorte clôturée'
    let payload: Record<string, unknown> | undefined
    if (input.issueCertificates) {
      const result = await certification.issueForCohort(principal, cohortId, input.templateId ?? undefined, meta)
      summary += ` : ${result.issued.filter((i) => i.created).length} certificat(s) émis, ${result.skipped.length} participant(s) non éligible(s)`
      payload = { issued: result.issued, skipped: result.skipped }
    }
    revalidateCoordination(['/coordination/cohortes', `/coordination/cohortes/${cohortId}`, '/coordination/certificats', `/formateur/cohortes/${cohortId}`, '/organisation', '/certificats'])
    return successState(summary, { payload })
  })
}

export async function addCohortMembers(input: { cohortId: string; userIds: string[] }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const cohortId = idSchema.parse(input.cohortId)
    const userIds = z.array(idSchema).min(1, 'Sélectionnez au moins un utilisateur').parse(input.userIds)
    const result = await cohorts.addMembers(principal, cohortId, userIds, { source: 'coordination' }, meta)
    revalidateCoordination([`/coordination/cohortes/${cohortId}`, `/formateur/cohortes/${cohortId}`, '/organisation/participants'])
    return successState(`${result.done.length} membre(s) ajouté(s)${result.skipped.length ? `, ${result.skipped.length} ignoré(s)` : ''}`, { payload: { skipped: result.skipped } })
  })
}

export async function removeCohortMember(input: { cohortId: string; userId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await cohorts.removeMember(principal, idSchema.parse(input.cohortId), idSchema.parse(input.userId), meta)
    revalidateCoordination([`/coordination/cohortes/${input.cohortId}`, `/formateur/cohortes/${input.cohortId}`])
    return successState('Membre retiré de la cohorte')
  })
}

export async function approvePendingEnrollment(input: { enrollmentId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await enrollments.approve(principal, idSchema.parse(input.enrollmentId), meta)
    revalidateCoordination(['/coordination/cohortes'])
    return successState('Inscription validée')
  })
}

// -----------------------------------------------------------------------------
// Certificats
// -----------------------------------------------------------------------------

export async function issueCertificate(input: { enrollmentId: string; templateId?: string | null }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const enrollmentId = idSchema.parse(input.enrollmentId)
    const result = await certification.issue(principal, enrollmentId, input.templateId ?? undefined, meta)
    revalidateCoordination(['/coordination/certificats', '/certificats'])
    return successState(result.created ? `Certificat ${result.certificate.number} émis, le PDF est en cours de génération` : `Un certificat existe déjà (${result.certificate.number})`, { id: result.certificate.id })
  })
}

export async function revokeCertificate(input: { certificateId: string; reason: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const certificate = await certification.revoke(principal, idSchema.parse(input.certificateId), input.reason, meta)
    revalidateCoordination(['/coordination/certificats', `/certificats/${certificate.id}`])
    return successState(`Certificat ${certificate.number} révoqué`)
  })
}

/** Relance la génération du PDF (job idempotent `certificate.render`). */
export async function regenerateCertificatePdf(input: { certificateId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const certificateId = idSchema.parse(input.certificateId)
    const certificate = await prisma.certificate.findUnique({ where: { id: certificateId }, select: { id: true, number: true, cohortId: true, enrollment: { select: { courseId: true, organizationId: true } } } })
    if (!certificate) throw new NotFoundError('Certificat', certificateId)
    if (!can(principal, 'certificate.issue', { courseId: certificate.enrollment?.courseId, cohortId: certificate.cohortId, organizationId: certificate.enrollment?.organizationId })) {
      throw new ForbiddenError('Régénération refusée')
    }
    await prisma.certificate.update({ where: { id: certificateId }, data: { pdfUrl: null } })
    const job = await enqueue(JobTypes.certificateRender, { certificateId }, { idempotencyKey: `certificate.render:${certificateId}:${Date.now()}`, priority: 3 })
    await audit('content.updated', { type: 'Certificate', id: certificateId }, auditContext(principal, meta), { after: { regenerate: true, jobId: job.id } })
    revalidateCoordination(['/coordination/certificats'])
    return successState(`Régénération du PDF ${certificate.number} planifiée`)
  })
}

// -----------------------------------------------------------------------------
// Organisations
// -----------------------------------------------------------------------------

function organizationInputFromForm(formData: FormData) {
  return organizationFormSchema.parse({
    name: formString(formData, 'name'),
    acronym: formOptional(formData, 'acronym'),
    sector: formOptional(formData, 'sector'),
    description: formOptional(formData, 'description'),
    address: formOptional(formData, 'address'),
    city: formOptional(formData, 'city'),
    phone: formString(formData, 'phone'),
    email: formString(formData, 'email').toLowerCase(),
    website: formString(formData, 'website'),
    isAffiliate: formBoolean(formData, 'isAffiliate'),
    isActive: formData.has('isActive') ? formBoolean(formData, 'isActive') : true,
    memberCount: formInt(formData, 'memberCount'),
  })
}

export async function createOrganization(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'organization.manage')) throw new ForbiddenError('Création d’organisation refusée')
    const data = organizationInputFromForm(formData)
    const slug = await uniqueSlug(slugify(data.acronym || data.name), async (candidate) => Boolean(await prisma.organization.findUnique({ where: { slug: candidate }, select: { id: true } })))
    const organization = await prisma.organization.create({
      data: {
        slug,
        name: data.name,
        acronym: data.acronym ?? null,
        sector: data.sector ?? null,
        description: data.description ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        isAffiliate: data.isAffiliate,
        isActive: data.isActive,
        memberCount: data.memberCount ?? null,
      },
    })
    await audit('content.created', { type: 'Organization', id: organization.id }, auditContext(principal, meta), { after: { name: organization.name } })
    revalidateCoordination(['/coordination/organisations'])
    return successState(`Organisation « ${organization.name} » créée`, { id: organization.id, redirectTo: `/coordination/organisations/${organization.id}` })
  })
}

export async function updateOrganization(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'organization.manage')) throw new ForbiddenError('Modification d’organisation refusée')
    const organizationId = idSchema.parse(formString(formData, 'organizationId'))
    const existing = await prisma.organization.findUnique({ where: { id: organizationId } })
    if (!existing) throw new NotFoundError('Organisation', organizationId)
    const data = organizationInputFromForm(formData)
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        acronym: data.acronym ?? null,
        sector: data.sector ?? null,
        description: data.description ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        isAffiliate: data.isAffiliate,
        isActive: data.isActive,
        memberCount: data.memberCount ?? null,
      },
    })
    await audit('content.updated', { type: 'Organization', id: organizationId }, auditContext(principal, meta), { before: { name: existing.name, isActive: existing.isActive }, after: { name: organization.name, isActive: organization.isActive } })
    revalidateCoordination(['/coordination/organisations', `/coordination/organisations/${organizationId}`, '/organisation'])
    return successState('Organisation mise à jour')
  })
}

/** Rattache un utilisateur existant (par email) comme gestionnaire ou membre de l'organisation. */
export async function addOrganizationManager(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'organization.manage')) throw new ForbiddenError('Gestion des membres refusée')
    const data = organizationManagerSchema.parse({
      organizationId: formString(formData, 'organizationId'),
      email: formString(formData, 'email'),
      title: formOptional(formData, 'title'),
      isManager: formBoolean(formData, 'isManager'),
    })
    const user = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true, isActive: true } })
    if (!user || !user.isActive) return failureState('Aucun compte actif ne correspond à cette adresse : l’utilisateur doit d’abord créer son compte sur fetrag.ga.', { email: 'Compte introuvable' })
    await prisma.$transaction(async (tx) => {
      await tx.organizationMembership.upsert({
        where: { organizationId_userId: { organizationId: data.organizationId, userId: user.id } },
        create: { organizationId: data.organizationId, userId: user.id, title: data.title ?? null, isManager: data.isManager },
        update: { title: data.title ?? undefined, isManager: data.isManager },
      })
      if (data.isManager) {
        const existing = await tx.roleAssignment.findFirst({ where: { userId: user.id, role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: data.organizationId } })
        if (!existing) await tx.roleAssignment.create({ data: { userId: user.id, role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: data.organizationId, grantedById: principal.id } })
      }
    })
    await audit(data.isManager ? 'role.granted' : 'content.updated', { type: 'Organization', id: data.organizationId }, auditContext(principal, meta), { after: { userId: user.id, isManager: data.isManager } })
    revalidateCoordination([`/coordination/organisations/${data.organizationId}`, '/organisation'])
    return successState(data.isManager ? 'Gestionnaire rattaché à l’organisation' : 'Membre rattaché à l’organisation')
  })
}

export async function removeOrganizationMember(input: { organizationId: string; userId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'organization.manage')) throw new ForbiddenError('Gestion des membres refusée')
    const organizationId = idSchema.parse(input.organizationId)
    const userId = idSchema.parse(input.userId)
    const active = await prisma.enrollment.count({ where: { organizationId, userId, status: { in: ['ACTIVE', 'PENDING'] } } })
    if (active > 0) throw new PreconditionError('Ce membre a des inscriptions en cours au titre de l’organisation : annulez-les avant de le retirer')
    await prisma.$transaction(async (tx) => {
      await tx.organizationMembership.deleteMany({ where: { organizationId, userId } })
      await tx.roleAssignment.deleteMany({ where: { userId, role: 'ORG_MANAGER', scopeType: 'ORGANIZATION', scopeId: organizationId } })
    })
    await audit('role.revoked', { type: 'Organization', id: organizationId }, auditContext(principal, meta), { before: { userId } })
    revalidateCoordination([`/coordination/organisations/${organizationId}`])
    return successState('Membre retiré')
  })
}
