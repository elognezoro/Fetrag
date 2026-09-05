import 'server-only'
import { prisma, type ContentStatus, type EnrollmentStatus, type Prisma, type QuestionType } from '@fetrag/db'
import { ForbiddenError, NotFoundError, can, hasGlobalRole, isSuperAdmin, paginationArgs, toPaginated, type Principal } from '@fetrag/domain'
import { getJobStats, listJobs } from '@fetrag/jobs'
import { certification, courseBuilder, displayName, enrollments, enrollmentTransitions, questionBank } from '@fetrag/lms-core'
import type { TreeActivity } from '@/components/staff/activity-editor'
import type { TreeModule } from '@/components/staff/course-tree'
import type { QuizQuestionRow } from '@/components/staff/quiz-builder'
import type { VersionSummary } from '@/components/staff/version-panel'
import { listCategoriesForSelect, listResourcesForSelect, listSettings, listTrainers } from './queries'

/**
 * Lecteurs de l'administration LMS (lot LMS-ADMIN) : vue d'ensemble, cours et builder,
 * banque de questions, modèles de certificats, paramètres, journal d'audit LMS.
 * Chaque lecteur vérifie la permission du principal ; les mutations restent dans admin-actions / admin-course-actions.
 */

// -----------------------------------------------------------------------------
// Vue d'ensemble
// -----------------------------------------------------------------------------

/** Préfixes d'actions du journal d'audit relevant du LMS (chapitre audit, BUILD_BRIEF §4). */
export const LMS_AUDIT_PREFIXES = ['course.', 'enrollment.', 'grade.', 'attendance.', 'certificate.', 'training_request.', 'role.'] as const

/** Entités LMS dont les actions génériques `content.*` sont affichées dans le journal d'audit LMS. */
export const LMS_AUDIT_ENTITY_TYPES = ['Course', 'CourseVersion', 'CourseModule', 'Lesson', 'Activity', 'Quiz', 'Assignment', 'LiveSession', 'Question', 'CertificateTemplate', 'Certificate', 'Cohort', 'TrainingSession', 'Enrollment', 'Organization', 'User', 'SystemSetting'] as const

const lmsAuditWhere: Prisma.AuditLogWhereInput = {
  OR: [...LMS_AUDIT_PREFIXES.map((prefix) => ({ action: { startsWith: prefix } })), { action: { startsWith: 'content.' }, entityType: { in: [...LMS_AUDIT_ENTITY_TYPES] } }, { action: 'settings.updated' }],
}

function assertAdminReader(principal: Principal): Principal {
  if (!isSuperAdmin(principal) && !can(principal, 'course.publish') && !can(principal, 'course.author')) throw new ForbiddenError('Accès à l’administration refusé')
  return principal
}

export async function adminOverview(principal: Principal) {
  assertAdminReader(principal)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const canSeeAudit = can(principal, 'audit.read') || can(principal, 'reports.read')
  const [coursesByStatus, versions, publishedVersions, questions, templates, users, activeUsers, enrollmentsByStatus, certificatesIssued, jobStats, recentAudit, recentCourses] = await Promise.all([
    prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.courseVersion.count(),
    prisma.courseVersion.count({ where: { isPublished: true } }),
    prisma.question.count({ where: { isActive: true } }),
    prisma.certificateTemplate.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true, lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.certificate.count({ where: { status: 'ISSUED' } }),
    getJobStats().catch(() => null),
    canSeeAudit ? prisma.auditLog.findMany({ where: lmsAuditWhere, orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, action: true, entityType: true, entityId: true, actorEmail: true, createdAt: true } }) : Promise.resolve([]),
    prisma.course.findMany({ orderBy: { updatedAt: 'desc' }, take: 6, select: { id: true, title: true, code: true, status: true, pillar: true, updatedAt: true, currentVersion: { select: { version: true } }, _count: { select: { enrollments: true } } } }),
  ])
  const byStatus = (rows: Array<{ status: string; _count: { _all: number } }>): Record<string, number> => Object.fromEntries(rows.map((r) => [r.status, r._count._all]))
  const courses = byStatus(coursesByStatus)
  const enrollmentStats = byStatus(enrollmentsByStatus)
  return {
    courses: { published: courses.PUBLISHED ?? 0, draft: (courses.DRAFT ?? 0) + (courses.REVIEW ?? 0), review: courses.REVIEW ?? 0, archived: courses.ARCHIVED ?? 0, total: coursesByStatus.reduce((n, r) => n + r._count._all, 0) },
    versions: { total: versions, published: publishedVersions },
    questions,
    templates,
    users: { total: users, active30Days: activeUsers },
    enrollments: { active: enrollmentStats.ACTIVE ?? 0, pending: enrollmentStats.PENDING ?? 0, completed: enrollmentStats.COMPLETED ?? 0 },
    certificatesIssued,
    jobs: jobStats,
    recentAudit,
    recentCourses,
    canSeeAudit,
  }
}

// -----------------------------------------------------------------------------
// Cours
// -----------------------------------------------------------------------------

export interface CourseListQuery {
  q?: string
  status?: ContentStatus
  pillar?: string
  page?: number
  pageSize?: number
}

/** Liste des cours pour l'administration : statut, version courante, inscriptions, formateurs. */
export async function listCoursesAdmin(principal: Principal, query: CourseListQuery = {}) {
  if (!can(principal, 'course.author')) throw new ForbiddenError('Accès aux cours refusé')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20))
  const where: Prisma.CourseWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.pillar ? { pillar: query.pillar } : {}),
    ...(query.q ? { OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { code: { contains: query.q, mode: 'insensitive' } }, { subtitle: { contains: query.q, mode: 'insensitive' } }] } : {}),
  }
  const [items, total, statusCounts] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: [{ position: 'asc' }, { title: 'asc' }],
      ...paginationArgs({ page, pageSize }),
      select: {
        id: true,
        slug: true,
        code: true,
        title: true,
        subtitle: true,
        pillar: true,
        status: true,
        modality: true,
        level: true,
        position: true,
        isFeatured: true,
        updatedAt: true,
        publishedAt: true,
        currentVersion: { select: { id: true, version: true, label: true, publishedAt: true } },
        trainers: { select: { isLead: true, user: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { versions: true, enrollments: true, cohorts: true } },
      },
    }),
    prisma.course.count({ where }),
    prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  return {
    ...toPaginated(
      items.map((c) => ({ ...c, trainerNames: c.trainers.map((t) => ({ id: t.user.id, name: displayName(t.user), isLead: t.isLead })) })),
      total,
      { page, pageSize },
    ),
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all])) as Partial<Record<ContentStatus, number>>,
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

/** Normalise les grilles de critères (format builder `{label, points}` ou format seed `{criterion, maxPoints}`). */
function normalizeRubric(raw: unknown): Array<{ label: string; points: number }> {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      const r = asRecord(item)
      return { label: String(r.label ?? r.criterion ?? '').trim(), points: Number(r.points ?? r.maxPoints ?? 0) || 0 }
    })
    .filter((r) => r.label.length > 0)
}

/** Normalise l'alternative bas débit (format builder `{kind,url,text}` ou format seed `{transcript,audioUrl}`). */
function normalizeLowBandwidth(raw: unknown): TreeActivity['lowBandwidthAlternative'] {
  const r = asRecord(raw)
  if (!Object.keys(r).length) return null
  if (typeof r.kind === 'string') return { kind: r.kind, url: typeof r.url === 'string' ? r.url : undefined, text: typeof r.text === 'string' ? r.text : undefined }
  const text = typeof r.transcript === 'string' ? r.transcript : undefined
  const url = typeof r.audioUrl === 'string' ? r.audioUrl : undefined
  if (!text && !url) return null
  return { kind: url ? 'audio' : 'transcript', url, text }
}

type VersionTree = NonNullable<Awaited<ReturnType<typeof courseBuilder.getCourse>>['selectedVersion']>

function toTreeModules(version: VersionTree): TreeModule[] {
  return version.modules.map((module) => ({
    id: module.id,
    title: module.title,
    summary: module.summary,
    position: module.position,
    durationMinutes: module.durationMinutes,
    isOptional: module.isOptional,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      position: lesson.position,
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
      activities: lesson.activities.map((activity): TreeActivity => {
        const quizQuestions: QuizQuestionRow[] = activity.quiz
          ? activity.quiz.questions.map((qq) => ({ questionId: qq.questionId, position: qq.position, points: qq.points ?? qq.question.points, type: qq.question.type, prompt: qq.question.prompt, optionCount: qq.question.options.length }))
          : []
        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          instructions: activity.instructions,
          content: asRecord(activity.content),
          position: activity.position,
          durationMinutes: activity.durationMinutes,
          isRequired: activity.isRequired,
          completionRule: activity.completionRule,
          maxScore: activity.maxScore,
          passScore: activity.passScore,
          weight: activity.weight,
          lowBandwidthAlternative: normalizeLowBandwidth(activity.lowBandwidthAlternative),
          availableFrom: activity.availableFrom,
          dueAt: activity.dueAt,
          resourceId: activity.resourceId,
          quiz: activity.quiz
            ? {
                id: activity.quiz.id,
                description: activity.quiz.description,
                timeLimitMinutes: activity.quiz.timeLimitMinutes,
                maxAttempts: activity.quiz.maxAttempts,
                shuffleQuestions: activity.quiz.shuffleQuestions,
                shuffleOptions: activity.quiz.shuffleOptions,
                showCorrection: activity.quiz.showCorrection,
                passScore: activity.quiz.passScore,
                isSurvey: activity.quiz.isSurvey,
                questionCount: quizQuestions.length,
                questions: quizQuestions,
              }
            : null,
          assignment: activity.assignment
            ? {
                id: activity.assignment.id,
                description: activity.assignment.description,
                allowFile: activity.assignment.allowFile,
                allowText: activity.assignment.allowText,
                maxFileSizeMb: activity.assignment.maxFileSizeMb,
                dueAt: activity.assignment.dueAt,
                lateAllowed: activity.assignment.lateAllowed,
                maxScore: activity.assignment.maxScore,
                rubric: normalizeRubric(activity.assignment.rubric),
              }
            : null,
          liveSessions: activity.liveSessions.map((s) => ({ id: s.id, title: s.title, startsAt: s.startsAt, endsAt: s.endsAt, speakerName: s.speakerName, meetingUrl: s.meetingUrl, replayUrl: s.replayUrl, transcriptUrl: s.transcriptUrl, trainingSessionId: s.trainingSessionId })),
          forum: activity.forum ? { id: activity.forum.id, slug: activity.forum.slug, title: activity.forum.title } : null,
        }
      }),
    })),
  }))
}

export interface CourseEnrollmentQuery {
  q?: string
  status?: EnrollmentStatus
  page?: number
}

/**
 * Fiche complète pour le builder : cours, versions, arbre de la version sélectionnée,
 * listes de sélection (catégories, formateurs, ressources, catégories de questions) et inscriptions.
 */
export async function loadCourseBuilder(principal: Principal, courseId: string, options: { versionId?: string; enrollments?: CourseEnrollmentQuery } = {}) {
  const course = await courseBuilder.getCourse(principal, courseId, { versionId: options.versionId })
  const canAuthor = can(principal, 'course.author', { courseId })
  const canPublish = can(principal, 'course.publish', { courseId })
  const [categories, trainers, resources, questionCategories, enrollmentList] = await Promise.all([
    canAuthor ? listCategoriesForSelect() : Promise.resolve([]),
    listTrainers(),
    canAuthor ? listResourcesForSelect() : Promise.resolve([]),
    can(principal, 'question_bank.write') ? questionBank.categories(principal).then((rows) => rows.map((r) => r.category).filter((c): c is string => Boolean(c))) : Promise.resolve([]),
    enrollments.listForCourse(principal, courseId, { q: options.enrollments?.q, status: options.enrollments?.status, page: options.enrollments?.page ?? 1, pageSize: 25 }).catch(() => null),
  ])
  const selected = course.selectedVersion
  const versions: VersionSummary[] = course.versions.map((v) => ({
    id: v.id,
    version: v.version,
    label: v.label,
    changelog: v.changelog,
    isPublished: v.isPublished,
    publishedAt: v.publishedAt,
    createdAt: v.createdAt,
    counts: { modules: v._count.modules, enrollments: v._count.enrollments, cohorts: v._count.cohorts },
  }))
  return {
    course,
    canAuthor,
    canPublish,
    versions,
    selectedVersion: selected
      ? {
          id: selected.id,
          version: selected.version,
          label: selected.label,
          changelog: selected.changelog,
          isPublished: selected.isPublished,
          locked: selected.locked,
          completionRules: selected.completionRules,
          counts: { enrollments: selected._count.enrollments, cohorts: selected._count.cohorts },
          modules: toTreeModules(selected),
        }
      : null,
    categories,
    trainers,
    resources,
    questionCategories,
    enrollments: enrollmentList
      ? {
          ...enrollmentList,
          items: enrollmentList.items.map((e) => ({ ...e, holderName: displayName(e.user), allowedTransitions: enrollmentTransitions[e.status] ?? [] })),
        }
      : null,
  }
}

// -----------------------------------------------------------------------------
// Banque de questions
// -----------------------------------------------------------------------------

export interface QuestionAdminQuery {
  q?: string
  type?: QuestionType
  category?: string
  tag?: string
  includeInactive?: boolean
  page?: number
}

export async function listQuestionsAdmin(principal: Principal, query: QuestionAdminQuery = {}) {
  const [list, categories, tags] = await Promise.all([
    questionBank.list(principal, { q: query.q, type: query.type, category: query.category, tag: query.tag, includeInactive: query.includeInactive ?? false, page: query.page ?? 1, pageSize: 25 }),
    questionBank.categories(principal),
    questionBank.tags(principal),
  ])
  return { list, categories: categories.map((c) => c.category).filter((c): c is string => Boolean(c)), tags: tags.map((t) => t.tag) }
}

export async function getQuestionAdmin(principal: Principal, questionId: string) {
  const [question, categories] = await Promise.all([questionBank.get(principal, questionId), questionBank.categories(principal)])
  return { question, categories: categories.map((c) => c.category).filter((c): c is string => Boolean(c)) }
}

export async function questionCategoriesForSelect(principal: Principal): Promise<string[]> {
  const rows = await questionBank.categories(principal)
  return rows.map((r) => r.category).filter((c): c is string => Boolean(c))
}

// -----------------------------------------------------------------------------
// Modèles de certificats
// -----------------------------------------------------------------------------

export async function listTemplatesAdmin(principal: Principal) {
  const [templates, recent] = await Promise.all([certification.listTemplates(principal), certification.list(principal, { page: 1, pageSize: 10 })])
  return { templates, recent }
}

export async function getTemplateAdmin(principal: Principal, templateId: string) {
  if (!can(principal, 'certificate.issue')) throw new ForbiddenError('Accès aux modèles de certificats refusé')
  const template = await prisma.certificateTemplate.findUnique({
    where: { id: templateId },
    include: {
      course: { select: { id: true, title: true, code: true } },
      _count: { select: { certificates: true } },
      certificates: { orderBy: { issuedAt: 'desc' }, take: 10, select: { id: true, number: true, holderName: true, courseTitle: true, status: true, issuedAt: true, pdfUrl: true } },
    },
  })
  if (!template) throw new NotFoundError('Modèle de certificat', templateId)
  return template
}

// -----------------------------------------------------------------------------
// Paramètres et file de jobs
// -----------------------------------------------------------------------------

/** Paramètres gérés par l'écran d'administration LMS, avec valeur par défaut et description. */
export const MANAGED_SETTINGS = [
  { key: 'training.participantLimit', label: 'Participants par demande de formation', description: 'Nombre maximal de participants qu’une organisation peut inscrire dans une demande (chapitre 14).', defaultValue: 10, readOnly: false, kind: 'number' as const },
  { key: 'quiz.partialCredit', label: 'Crédit partiel des quiz', description: 'Accorde un score partiel aux questions à choix multiples partiellement correctes.', defaultValue: false, readOnly: false, kind: 'boolean' as const },
  { key: 'certificates.sequence', label: 'Compteur des certificats', description: 'Dernier numéro séquentiel attribué. Incrémenté automatiquement à chaque émission ; non modifiable.', defaultValue: 0, readOnly: true, kind: 'number' as const },
  { key: 'lms.welcomeMessage', label: 'Message d’accueil de la plateforme', description: 'Texte affiché aux apprenants sur leur tableau de bord (vide = message par défaut).', defaultValue: '', readOnly: false, kind: 'text' as const },
] as const

export type ManagedSettingKey = (typeof MANAGED_SETTINGS)[number]['key']

export async function adminSettingsOverview(principal: Principal) {
  const settings = await listSettings(principal)
  const canProcessJobs = isSuperAdmin(principal) || can(principal, 'settings.manage') || hasGlobalRole(principal, 'COORDINATOR')
  const [jobStats, jobs] = await Promise.all([getJobStats().catch(() => null), listJobs({ pageSize: 8 }).catch(() => null)])
  const byKey = new Map(settings.map((s) => [s.key, s]))
  const managed = MANAGED_SETTINGS.map((definition) => {
    const row = byKey.get(definition.key)
    return { ...definition, exists: Boolean(row), value: row ? row.value : definition.defaultValue, storedDescription: row?.description ?? null, updatedAt: row?.updatedAt ?? null, canEdit: !definition.readOnly && (row?.canEdit ?? can(principal, 'settings.manage')) }
  })
  const managedKeys = new Set<string>(MANAGED_SETTINGS.map((m) => m.key))
  const others = settings.filter((s) => !managedKeys.has(s.key))
  return { managed, others, jobStats, jobs, canProcessJobs, canEdit: can(principal, 'settings.manage') }
}

// -----------------------------------------------------------------------------
// Journal d'audit LMS
// -----------------------------------------------------------------------------

export interface LmsAuditQuery {
  q?: string
  action?: string
  entityType?: string
  page?: number
  pageSize?: number
}

export async function listLmsAudit(principal: Principal, query: LmsAuditQuery = {}) {
  if (!isSuperAdmin(principal) && !can(principal, 'audit.read') && !can(principal, 'reports.read')) throw new ForbiddenError('Accès au journal refusé')
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 30))
  const where: Prisma.AuditLogWhereInput = {
    AND: [
      lmsAuditWhere,
      ...(query.action ? [{ action: query.action }] : []),
      ...(query.entityType ? [{ entityType: query.entityType }] : []),
      ...(query.q ? [{ OR: [{ actorEmail: { contains: query.q, mode: 'insensitive' as const } }, { entityId: { contains: query.q } }, { correlationId: { contains: query.q } }] }] : []),
    ],
  }
  const [items, total, actions, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, ...paginationArgs({ page, pageSize }) }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ['action'], where: lmsAuditWhere, _count: { _all: true }, orderBy: { action: 'asc' } }),
    prisma.auditLog.groupBy({ by: ['entityType'], where: lmsAuditWhere, _count: { _all: true }, orderBy: { entityType: 'asc' } }),
  ])
  return { ...toPaginated(items, total, { page, pageSize }), actions: actions.map((a) => ({ action: a.action, count: a._count._all })), entityTypes: entityTypes.map((e) => ({ entityType: e.entityType, count: e._count._all })) }
}
