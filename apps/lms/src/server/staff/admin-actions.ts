'use server'

import { revalidatePath } from 'next/cache'
import { enrollmentStatuses, idSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, can, ForbiddenError, hasGlobalRole, isSuperAdmin, NotFoundError, PreconditionError, type Principal } from '@fetrag/domain'
import { processJobs, registerDefaultHandlers } from '@fetrag/jobs'
import { auditContext, certification, certificateTemplateInputSchema, enrollments, questionBank, questionInputSchema } from '@fetrag/lms-core'
import { failureState, successState, type ActionState } from './action-state'
import { formBoolean, formInt, formJson, formLines, formNullable, formOptional, formString, runAction } from './context'
import { parseQuestionCsv, roleGrantSchema, settingSchema } from './schemas'

// -----------------------------------------------------------------------------
// Banque de questions
// -----------------------------------------------------------------------------

interface OptionRow {
  id?: string
  label: string
  isCorrect?: boolean
  feedback?: string | null
  matchValue?: string | null
  position?: number
}

function questionInputFromForm(formData: FormData) {
  const type = formString(formData, 'type')
  const optionsRaw = formJson<OptionRow[]>(formData, 'options') ?? []
  const options = optionsRaw
    .filter((o) => o && typeof o.label === 'string' && o.label.trim().length > 0)
    .map((o, index) => ({ id: o.id || undefined, label: o.label.trim(), isCorrect: Boolean(o.isCorrect), feedback: o.feedback?.trim() || null, matchValue: o.matchValue?.trim() || null, position: index }))
  let config: Record<string, unknown> = {}
  switch (type) {
    case 'SINGLE_CHOICE':
      config = { shuffle: formBoolean(formData, 'shuffle') }
      break
    case 'MULTIPLE_CHOICE':
      config = { shuffle: formBoolean(formData, 'shuffle'), partialCredit: formBoolean(formData, 'partialCredit') }
      break
    case 'TRUE_FALSE':
      config = { answer: formString(formData, 'answer') === 'true' }
      break
    case 'FILL_BLANK':
      config = {
        text: formString(formData, 'blankText'),
        answers: formLines(formData, 'blankAnswers').map((line) => line.split('|').map((s) => s.trim()).filter(Boolean)),
        partialCredit: formBoolean(formData, 'partialCredit'),
      }
      break
    case 'MATCHING':
      config = { distractors: formLines(formData, 'distractors'), shuffle: formBoolean(formData, 'shuffle') }
      break
    case 'ORDERING':
      config = { shuffle: formBoolean(formData, 'shuffle') }
      break
    case 'SHORT_ANSWER':
      config = { accepted: formLines(formData, 'accepted'), caseSensitive: formBoolean(formData, 'caseSensitive') }
      break
    case 'ESSAY': {
      const rubric = formJson<Array<{ label: string; points: number }>>(formData, 'rubric')
      config = { minWords: formInt(formData, 'minWords'), maxWords: formInt(formData, 'maxWords'), rubric: Array.isArray(rubric) && rubric.length ? rubric : undefined }
      break
    }
    default:
      break
  }
  return questionInputSchema.parse({
    type,
    prompt: formString(formData, 'prompt'),
    explanation: formNullable(formData, 'explanation'),
    category: formNullable(formData, 'category'),
    difficulty: formInt(formData, 'difficulty') ?? 1,
    points: formInt(formData, 'points') ?? 1,
    tags: formString(formData, 'tags')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    config,
    options,
    isActive: formData.has('isActive') ? formBoolean(formData, 'isActive') : true,
  })
}

export async function saveQuestion(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const questionId = formOptional(formData, 'questionId')
    const data = questionInputFromForm(formData)
    if (questionId) {
      const result = await questionBank.update(principal, idSchema.parse(questionId), data, meta)
      revalidatePath('/admin/questions')
      revalidatePath(`/admin/questions/${questionId}`)
      revalidatePath(`/admin/questions/${result.question.id}`)
      return successState(result.supersededId ? 'Nouvelle version de la question créée (l’ancienne, déjà répondue, est désactivée)' : 'Question enregistrée', { id: result.question.id, redirectTo: result.supersededId ? `/admin/questions/${result.question.id}` : undefined })
    }
    const question = await questionBank.create(principal, data, meta)
    revalidatePath('/admin/questions')
    return successState('Question ajoutée à la banque', { id: question.id })
  })
}

export async function removeQuestion(input: { questionId: string; redirectTo?: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const result = await questionBank.remove(principal, idSchema.parse(input.questionId), meta)
    revalidatePath('/admin/questions')
    return successState(result.deleted ? 'Question supprimée' : 'Question désactivée (déjà utilisée dans un quiz ou des réponses)', { redirectTo: result.deleted && input.redirectTo ? input.redirectTo : undefined })
  })
}

export async function duplicateQuestion(input: { questionId: string; openCopy?: boolean }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const question = await questionBank.duplicate(principal, idSchema.parse(input.questionId), meta)
    revalidatePath('/admin/questions')
    return successState('Question dupliquée', { id: question.id, redirectTo: input.openCopy ? `/admin/questions/${question.id}` : undefined })
  })
}

/** Import CSV simple (type;question;points;catégorie;options A|B|C;correctes 1|3). */
export async function importQuestionsCsv(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const text = formString(formData, 'csv')
    if (!text) return failureState('Collez au moins une ligne CSV.', { csv: 'Contenu requis' })
    const items = parseQuestionCsv(text)
    if (items.length === 0) return failureState('Aucune ligne exploitable dans le contenu collé.', { csv: 'Format attendu : type;question;points;catégorie;options;correctes' })
    const result = await questionBank.import(principal, items, meta)
    revalidatePath('/admin/questions')
    const errors = result.errors.map((e) => `ligne ${e.index + 1} : ${e.message}`)
    return successState(`${result.created.length} question(s) importée(s)${errors.length ? `, ${errors.length} ligne(s) rejetée(s)` : ''}`, { payload: { errors } })
  })
}

// -----------------------------------------------------------------------------
// Modèles de certificats
// -----------------------------------------------------------------------------

function templateInputFromForm(formData: FormData) {
  return certificateTemplateInputSchema.parse({
    name: formString(formData, 'name'),
    kind: formString(formData, 'kind') || 'ATTESTATION',
    courseId: formNullable(formData, 'courseId'),
    titleText: formString(formData, 'titleText') || undefined,
    bodyText: formString(formData, 'bodyText') || undefined,
    signatoryName: formString(formData, 'signatoryName') || undefined,
    signatoryTitle: formString(formData, 'signatoryTitle') || undefined,
    criteria: { minScore: formInt(formData, 'minScore'), minAttendanceRate: formInt(formData, 'minAttendanceRate'), requireCompletion: formBoolean(formData, 'requireCompletion') },
    validityMonths: formInt(formData, 'validityMonths') ?? null,
    isDefault: formBoolean(formData, 'isDefault'),
  })
}

export async function saveCertificateTemplate(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const templateId = formOptional(formData, 'templateId')
    const data = templateInputFromForm(formData)
    const template = templateId ? await certification.updateTemplate(principal, idSchema.parse(templateId), data, meta) : await certification.createTemplate(principal, data, meta)
    revalidatePath('/admin/certificats')
    revalidatePath(`/admin/certificats/${template.id}`)
    revalidatePath('/coordination/certificats')
    return successState(templateId ? 'Modèle enregistré' : 'Modèle de certificat créé', { id: template.id })
  })
}

export async function removeCertificateTemplate(input: { templateId: string; redirectTo?: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await certification.removeTemplate(principal, idSchema.parse(input.templateId), meta)
    revalidatePath('/admin/certificats')
    return successState('Modèle supprimé', { redirectTo: input.redirectTo })
  })
}

// -----------------------------------------------------------------------------
// Utilisateurs et rôles LMS
// -----------------------------------------------------------------------------

function assertRoleManager(principal: Principal | null | undefined) {
  if (!principal || (!can(principal, 'roles.manage') && !isSuperAdmin(principal))) throw new ForbiddenError('Gestion des rôles réservée à l’administration')
}

/**
 * Exception à `roles.manage` (BUILD_BRIEF §4) : la coordination peut désigner un formateur
 * sur un cours ou une cohorte (portée limitée), rien d'autre.
 */
function isCoordinationOnly(principal: Principal | null | undefined): boolean {
  if (!principal) return false
  return can(principal, 'training_request.decide') && !isSuperAdmin(principal) && !can(principal, 'roles.manage')
}

function coordinationMayHandle(role: string, scopeType: string): boolean {
  return role === 'TRAINER' && (scopeType === 'COURSE' || scopeType === 'COHORT')
}

export async function grantRole(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = roleGrantSchema.parse({
      userId: formString(formData, 'userId'),
      role: formString(formData, 'role'),
      scopeType: formString(formData, 'scopeType') || 'GLOBAL',
      scopeId: formString(formData, 'scopeId'),
      expiresAt: formOptional(formData, 'expiresAt'),
    })
    if (isCoordinationOnly(principal)) {
      if (!coordinationMayHandle(data.role, data.scopeType)) throw new ForbiddenError('La coordination ne peut attribuer que le rôle Formateur sur un cours ou une cohorte')
    } else {
      assertRoleManager(principal)
    }
    if (data.scopeType !== 'GLOBAL' && !data.scopeId) return failureState('Indiquez la portée (cours, cohorte ou organisation) du rôle.', { scopeId: 'Portée requise' })
    const scopeId = data.scopeType === 'GLOBAL' ? null : (data.scopeId ?? null)
    if (scopeId) {
      const exists =
        data.scopeType === 'COURSE'
          ? await prisma.course.findUnique({ where: { id: scopeId }, select: { id: true } })
          : data.scopeType === 'COHORT'
            ? await prisma.cohort.findUnique({ where: { id: scopeId }, select: { id: true } })
            : await prisma.organization.findUnique({ where: { id: scopeId }, select: { id: true } })
      if (!exists) return failureState('La portée indiquée est introuvable.', { scopeId: 'Identifiant inconnu' })
    }
    const user = await prisma.user.findUnique({ where: { id: data.userId }, select: { id: true, email: true } })
    if (!user) throw new NotFoundError('Utilisateur', data.userId)
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
    const existing = await prisma.roleAssignment.findFirst({ where: { userId: user.id, role: data.role, scopeType: data.scopeType, scopeId } })
    if (existing) {
      await prisma.roleAssignment.update({ where: { id: existing.id }, data: { expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null, grantedById: principal.id } })
    } else {
      await prisma.roleAssignment.create({ data: { userId: user.id, role: data.role, scopeType: data.scopeType, scopeId, expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null, grantedById: principal.id } })
    }
    await audit('role.granted', { type: 'User', id: user.id }, auditContext(principal, meta), { after: { role: data.role, scopeType: data.scopeType, scopeId, expiresAt } })
    revalidatePath('/admin/utilisateurs')
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    return successState(`Rôle ${data.role} attribué à ${user.email}`)
  })
}

export async function revokeRole(input: { assignmentId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const assignment = await prisma.roleAssignment.findUnique({ where: { id: idSchema.parse(input.assignmentId) } })
    if (!assignment) throw new NotFoundError('Attribution de rôle', input.assignmentId)
    if (isCoordinationOnly(principal)) {
      if (!coordinationMayHandle(assignment.role, assignment.scopeType)) throw new ForbiddenError('Retrait de ce rôle réservé à l’administration')
    } else {
      assertRoleManager(principal)
    }
    if (assignment.userId === principal.id && assignment.role === 'SUPER_ADMIN') throw new PreconditionError('Vous ne pouvez pas retirer votre propre rôle de super administrateur')
    await prisma.roleAssignment.delete({ where: { id: assignment.id } })
    await audit('role.revoked', { type: 'User', id: assignment.userId }, auditContext(principal, meta), { before: { role: assignment.role, scopeType: assignment.scopeType, scopeId: assignment.scopeId } })
    revalidatePath('/admin/utilisateurs')
    revalidatePath(`/admin/utilisateurs/${assignment.userId}`)
    return successState('Rôle retiré')
  })
}

export async function setUserActive(input: { userId: string; isActive: boolean }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'users.manage') && !isSuperAdmin(principal)) throw new ForbiddenError('Activation des comptes réservée à l’administration')
    const userId = idSchema.parse(input.userId)
    if (userId === principal.id) throw new PreconditionError('Vous ne pouvez pas désactiver votre propre compte')
    const user = await prisma.user.update({ where: { id: userId }, data: { isActive: input.isActive }, select: { id: true, email: true, isActive: true } })
    await audit('user.updated', { type: 'User', id: user.id }, auditContext(principal, meta), { after: { isActive: user.isActive } })
    revalidatePath('/admin/utilisateurs')
    revalidatePath(`/admin/utilisateurs/${userId}`)
    return successState(user.isActive ? 'Compte réactivé' : 'Compte désactivé')
  })
}

// -----------------------------------------------------------------------------
// Paramètres système
// -----------------------------------------------------------------------------

function parseSettingValue(raw: string): unknown {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    return JSON.parse(trimmed)
  } catch {
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
    if (trimmed === 'true' || trimmed === 'false') return trimmed === 'true'
    return trimmed
  }
}

export async function saveSetting(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'settings.manage')) throw new ForbiddenError('Modification des paramètres réservée à l’administration')
    const data = settingSchema.parse({ key: formString(formData, 'key'), value: formString(formData, 'value'), description: formOptional(formData, 'description') })
    const value = parseSettingValue(data.value)
    if (data.key === 'certificates.sequence') throw new PreconditionError('Le compteur des certificats est géré automatiquement et ne peut pas être modifié')
    if (data.key === 'training.participantLimit') {
      const limit = z.number().int().min(1).max(500).safeParse(value)
      if (!limit.success) return failureState('La limite de participants doit être un entier entre 1 et 500.', { value: 'Entier attendu (1 à 500)' })
    }
    if (data.key === 'quiz.partialCredit' && typeof value !== 'boolean') {
      return failureState('Le crédit partiel attend « true » ou « false ».', { value: 'Booléen attendu' })
    }
    if (data.key === 'lms.welcomeMessage') {
      const message = z.string().max(2000).safeParse(value)
      if (!message.success) return failureState('Le message d’accueil doit être un texte de 2000 caractères au plus.', { value: 'Texte attendu (2000 caractères au plus)' })
    }
    const existing = await prisma.systemSetting.findUnique({ where: { key: data.key } })
    const json = value as Parameters<typeof prisma.systemSetting.create>[0]['data']['value']
    const setting = await prisma.systemSetting.upsert({
      where: { key: data.key },
      create: { key: data.key, value: json, description: data.description ?? null },
      update: { value: json, description: data.description ?? existing?.description ?? null },
    })
    await audit('settings.updated', { type: 'SystemSetting', id: setting.key }, auditContext(principal, meta), { before: { value: existing?.value ?? null }, after: { value } })
    revalidatePath('/admin/parametres')
    revalidatePath('/demande-formation')
    revalidatePath('/dashboard')
    return successState(`Paramètre « ${setting.key} » enregistré`)
  })
}

// -----------------------------------------------------------------------------
// File de jobs (recette)
// -----------------------------------------------------------------------------

/**
 * Traite immédiatement un lot de jobs (recette hors Vercel Cron). Réservé à la super administration
 * et à la coordination ; les jobs sont idempotents et le traitement est journalisé par le package jobs.
 */
export async function processJobsNow(): Promise<ActionState> {
  return runAction(async (principal) => {
    if (!isSuperAdmin(principal) && !can(principal, 'settings.manage') && !hasGlobalRole(principal, 'COORDINATOR')) {
      throw new ForbiddenError('Traitement manuel des jobs réservé à l’administration')
    }
    await registerDefaultHandlers()
    try {
      // Le package paiements enregistre le traitement des webhooks (jobs ne peut pas l'importer : cycle).
      const payments: Record<string, unknown> = await import('@fetrag/payments')
      if (typeof payments.registerPaymentJobHandlers === 'function') (payments.registerPaymentJobHandlers as () => void)()
    } catch {
      // Sans le module paiements, les jobs webhook.process restent en file : le cron les traitera.
    }
    const result = await processJobs({ limit: 10, workerId: `admin-${principal.id.slice(0, 8)}` })
    revalidatePath('/admin/parametres')
    revalidatePath('/admin')
    return successState(`${result.processed} job(s) traité(s), ${result.failed} en échec, ${result.remaining} restant(s)`, { payload: { processed: result.processed, failed: result.failed, remaining: result.remaining } })
  })
}

// -----------------------------------------------------------------------------
// Inscriptions d'un cours (onglet Inscriptions du builder)
// -----------------------------------------------------------------------------

export async function setEnrollmentStatusAdmin(input: { enrollmentId: string; courseId: string; status: string; comment?: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const enrollmentId = idSchema.parse(input.enrollmentId)
    const status = z.enum(enrollmentStatuses).parse(input.status)
    const enrollment = await enrollments.setStatus(principal, enrollmentId, status, { comment: input.comment?.trim() || undefined }, meta)
    revalidatePath(`/admin/cours/${input.courseId}`)
    revalidatePath('/coordination/cohortes')
    revalidatePath('/mes-formations')
    return successState(`Inscription ${enrollment.status === 'ACTIVE' ? 'activée' : enrollment.status === 'COMPLETED' ? 'marquée terminée' : enrollment.status === 'SUSPENDED' ? 'suspendue' : enrollment.status === 'CANCELLED' ? 'annulée' : 'mise à jour'}`)
  })
}

export async function removeSetting(input: { key: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    if (!can(principal, 'settings.manage')) throw new ForbiddenError('Modification des paramètres réservée à l’administration')
    const protectedKeys = ['training.participantLimit', 'certificates.sequence', 'site.motto', 'api.keys']
    if (protectedKeys.includes(input.key)) throw new PreconditionError('Ce paramètre est requis par la plateforme et ne peut pas être supprimé')
    await prisma.systemSetting.delete({ where: { key: input.key } })
    await audit('settings.updated', { type: 'SystemSetting', id: input.key }, auditContext(principal, meta), { before: { deleted: true } })
    revalidatePath('/admin/parametres')
    return successState('Paramètre supprimé')
  })
}
