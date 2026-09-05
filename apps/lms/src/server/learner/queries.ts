import 'server-only'
import { cache } from 'react'
import { events as cmsEvents } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { pillarSchema, type PillarName } from '@fetrag/contracts'
import { prisma, type EnrollmentStatus } from '@fetrag/db'
import { isDomainError, type Principal } from '@fetrag/domain'
import { assignments, catalog, certification, cohorts, progress, quizzes, type ProgressSummary } from '@fetrag/lms-core'
import { listNotifications } from '@fetrag/notifications'
import QRCode from 'qrcode'
import { readLowBandwidth, resolveFileUrl } from './content'

/**
 * Lecteurs de données de l'espace apprenant. Chaque fonction compose les services lms-core
 * et, lorsqu'une lecture manque, interroge prisma directement (helpers locaux signalés dans le rapport).
 */

const LEARNING_STATUSES: EnrollmentStatus[] = ['ACTIVE', 'COMPLETED']

/** Inscription apprenant sur un cours (ACTIVE en priorité, sinon COMPLETED, sinon PENDING). Helper local prisma. */
export const findEnrollmentForCourse = cache(async (userId: string, courseId: string) => {
  const rows = await prisma.enrollment.findMany({
    where: { userId, courseId, status: { in: ['ACTIVE', 'COMPLETED', 'PENDING'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, courseVersionId: true, cohortId: true, progressPercent: true, lastActivityId: true, completedAt: true },
  })
  return rows.find((r) => r.status === 'ACTIVE') ?? rows.find((r) => r.status === 'COMPLETED') ?? rows[0] ?? null
})

// -----------------------------------------------------------------------------
// Accueil formation
// -----------------------------------------------------------------------------

export interface HomeStats {
  courses: number
  learners: number
  certificates: number
  hours: number
}

export const getHomeData = cache(async () => {
  const [catalogue, masterclasses, stats] = await Promise.all([
    catalog.listPublished({ pageSize: 50 }),
    cmsEvents.listUpcoming({ kind: 'MASTERCLASS', limit: 3 }).catch(() => []),
    homeStats(),
  ])
  const courses = [...catalogue.items].sort((a, b) => a.code.localeCompare(b.code))
  return { courses, masterclasses, stats }
})

/** Indicateurs de l'accueil (helper local prisma : compteurs agrégés publics). */
async function homeStats(): Promise<HomeStats> {
  const [courses, learners, certificates, hours] = await Promise.all([
    prisma.course.count({ where: { status: 'PUBLISHED', currentVersionId: { not: null } } }),
    prisma.enrollment.findMany({ where: { status: { in: LEARNING_STATUSES } }, distinct: ['userId'], select: { userId: true } }).then((rows) => rows.length),
    prisma.certificate.count({ where: { status: 'ISSUED' } }),
    prisma.course.aggregate({ where: { status: 'PUBLISHED' }, _sum: { durationHours: true } }).then((agg) => agg._sum.durationHours ?? 0),
  ])
  return { courses, learners, certificates, hours }
}

// -----------------------------------------------------------------------------
// Catalogue
// -----------------------------------------------------------------------------

export interface CatalogueParams {
  q?: string
  pillar?: string
  modality?: string
  free?: boolean
  sort?: string
}

export type CatalogueItem = Awaited<ReturnType<typeof catalog.listPublished>>['items'][number]

export const getCatalogue = cache(async (params: CatalogueParams) => {
  const pillar = pillarSchema.safeParse(params.pillar)
  const modality = params.modality === 'ASYNC' || params.modality === 'SYNC' || params.modality === 'HYBRID' ? params.modality : undefined
  const result = await catalog.listPublished({
    q: params.q?.trim() || undefined,
    pillar: pillar.success ? pillar.data : undefined,
    modality,
    pageSize: 50,
  })
  let items = result.items
  if (params.free) items = items.filter((c) => c.isFree)
  const sort = params.sort ?? 'programme'
  const sorted = [...items].sort((a, b) => {
    switch (sort) {
      case 'titre':
        return a.title.localeCompare(b.title, 'fr')
      case 'duree':
        return a.durationHours - b.durationHours
      case 'recent':
        return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
      default:
        return a.code.localeCompare(b.code)
    }
  })
  return { items: sorted, total: sorted.length }
})

// -----------------------------------------------------------------------------
// Fiche de cours
// -----------------------------------------------------------------------------

export type PublishedCourse = Awaited<ReturnType<typeof catalog.getPublished>>

export const getCourseView = cache(async (slug: string, principal: Principal | null) => {
  let course: PublishedCourse
  try {
    course = await catalog.getPublished(slug)
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return null
    throw error
  }
  const enrollment = principal ? await findEnrollmentForCourse(principal.id, course.id) : null
  const nextActivity = enrollment && enrollment.status !== 'PENDING' ? await progress.nextActivity(enrollment.id).catch(() => null) : null
  const standardOffer = course.offers.find((o) => o.tier === 'STANDARD') ?? course.offers[0] ?? null
  return { course, enrollment, nextActivity, offer: standardOffer }
})

// -----------------------------------------------------------------------------
// Lecteur pédagogique
// -----------------------------------------------------------------------------

export type ActivityView = Awaited<ReturnType<typeof progress.activityView>>
export type LessonNode = ProgressSummary['modules'][number]['lessons'][number]

export interface LessonViewResult {
  enrollment: NonNullable<Awaited<ReturnType<typeof findEnrollmentForCourse>>>
  summary: ProgressSummary
  view: ActivityView
  /** Contenu JSON brut (les contenus média avec `url` vide ne passent pas la validation stricte). */
  rawContent: unknown
  lowBandwidth: ReturnType<typeof readLowBandwidth>
  lesson: LessonNode
  moduleTitle: string
  moduleIndex: number
  lessonIndex: number
  /** Nombre de tentatives restantes pour une évaluation (null si non applicable). */
  quizAttempts: { remaining: number; best: number | null; total: number } | null
  /** Ressource / fichier résolu en URL consultable. */
  file: { viewUrl: string | null; downloadUrl: string | null; fileName: string | null; mimeType: string | null; isExternal: boolean } | null
  /** Forum de la version (relié à l'activité ou au cours) pour les activités FORUM. */
  forumSlug: string | null
  /** Devoir lié (identifiant + état de la remise). */
  assignmentState: { id: string; state: string; dueAt: Date | null; score: number | null; maxScore: number } | null
}

export async function getLessonView(principal: Principal, courseId: string, lessonId: string, requestedActivityId?: string): Promise<LessonViewResult | null> {
  const enrollment = await findEnrollmentForCourse(principal.id, courseId)
  if (!enrollment || enrollment.status === 'PENDING') return null

  const summary = await progress.summary(enrollment.id, principal)
  let moduleIndex = -1
  let lessonIndex = -1
  let lesson: LessonNode | null = null
  summary.modules.forEach((module, mi) => {
    module.lessons.forEach((l, li) => {
      if (l.id === lessonId) {
        moduleIndex = mi
        lessonIndex = li
        lesson = l
      }
    })
  })
  if (!lesson) return null
  const currentLesson: LessonNode = lesson
  const currentModule = summary.modules[moduleIndex]
  if (!currentModule) return null

  const activityId =
    (requestedActivityId && currentLesson.activities.some((a) => a.id === requestedActivityId) ? requestedActivityId : null) ??
    currentLesson.activities.find((a) => !a.completed)?.id ??
    currentLesson.activities[0]?.id
  if (!activityId) return null

  const view = await progress.activityView(principal, enrollment.id, activityId)
  const raw = await prisma.activity.findUnique({ where: { id: activityId }, select: { content: true, resourceId: true } })
  const rawContent = raw?.content ?? null

  const [quizAttempts, file, forumSlug, assignmentState] = await Promise.all([
    view.activity.type === 'QUIZ' || view.activity.type === 'SURVEY'
      ? quizzes
          .listAttempts(principal, activityId)
          .then((r) => ({ remaining: r.remainingAttempts, best: r.bestPercent, total: r.attempts.filter((a) => a.status !== 'IN_PROGRESS').length }))
          .catch(() => null)
      : Promise.resolve(null),
    view.activity.type === 'FILE' || view.activity.type === 'PRESENTATION' ? resolveActivityFile(view, rawContent) : Promise.resolve(null),
    view.activity.type === 'FORUM' ? resolveForumSlug(view.activity.forum?.slug ?? null, courseId, enrollment.cohortId) : Promise.resolve(null),
    view.activity.type === 'ASSIGNMENT' && view.activity.assignment ? resolveAssignmentState(principal.id, view.activity.assignment.id, view.activity.assignment.maxScore, view.activity.assignment.dueAt ?? view.activity.dueAt) : Promise.resolve(null),
  ])

  return {
    enrollment,
    summary,
    view,
    rawContent,
    lowBandwidth: readLowBandwidth(view.activity.lowBandwidthAlternative),
    lesson: currentLesson,
    moduleTitle: currentModule.title,
    moduleIndex,
    lessonIndex,
    quizAttempts,
    file,
    forumSlug,
    assignmentState,
  }
}

async function resolveActivityFile(view: ActivityView, rawContent: unknown): Promise<LessonViewResult['file']> {
  const record = rawContent && typeof rawContent === 'object' ? (rawContent as Record<string, unknown>) : {}
  const resource = view.activity.resource
  const reference =
    resource?.externalUrl ??
    resource?.fileUrl ??
    (typeof record.fileUrl === 'string' ? record.fileUrl : null) ??
    (typeof record.url === 'string' ? record.url : null)
  if (!reference) return { viewUrl: null, downloadUrl: null, fileName: resource?.fileName ?? null, mimeType: resource?.mimeType ?? null, isExternal: false }
  const isExternal = Boolean(resource?.externalUrl) || (/^https?:\/\//.test(reference) && !reference.includes('/api/storage/'))
  const [viewUrl, downloadUrl] = await Promise.all([resolveFileUrl(reference), resolveFileUrl(reference, { download: true })])
  return {
    viewUrl,
    downloadUrl: isExternal ? viewUrl : downloadUrl,
    fileName: resource?.fileName ?? (typeof record.label === 'string' ? record.label : null),
    mimeType: resource?.mimeType ?? (typeof record.mimeType === 'string' ? record.mimeType : null),
    isExternal,
  }
}

/** Forum de l'activité, sinon forum de la cohorte, sinon forum du cours (helper local prisma). */
async function resolveForumSlug(activityForumSlug: string | null, courseId: string, cohortId: string | null): Promise<string | null> {
  if (activityForumSlug) return activityForumSlug
  const forum = await prisma.forum.findFirst({
    where: cohortId ? { OR: [{ cohortId }, { courseId, cohortId: null }] } : { courseId, cohortId: null },
    orderBy: [{ cohortId: 'desc' }, { createdAt: 'asc' }],
    select: { slug: true },
  })
  return forum?.slug ?? null
}

async function resolveAssignmentState(userId: string, assignmentId: string, maxScore: number, dueAt: Date | null): Promise<LessonViewResult['assignmentState']> {
  const submission = await prisma.submission.findUnique({ where: { assignmentId_userId: { assignmentId, userId } }, select: { status: true, grade: { select: { score: true } } } })
  const state = submission ? submission.status.toLowerCase() : 'todo'
  return { id: assignmentId, state, dueAt, score: submission?.grade?.score ?? null, maxScore }
}

// -----------------------------------------------------------------------------
// Tableau de bord : notifications
// -----------------------------------------------------------------------------

export async function getRecentNotifications(userId: string, limit = 6) {
  try {
    return (await listNotifications(userId, { limit })).items
  } catch {
    return []
  }
}

// -----------------------------------------------------------------------------
// Calendrier
// -----------------------------------------------------------------------------

export interface CalendarEvent {
  id: string
  kind: 'session' | 'assignment'
  title: string
  courseTitle: string
  startsAt: Date
  endsAt: Date | null
  location: string | null
  mode: string | null
  meetingUrl: string | null
  href: string
  overdue: boolean
}

export async function getCalendarEvents(principal: Principal, range: { from: Date; to: Date }): Promise<CalendarEvent[]> {
  const [sessions, learnerAssignments] = await Promise.all([cohorts.calendarForUser(principal, range), assignments.listForUser(principal)])
  const now = Date.now()
  const out: CalendarEvent[] = [
    ...sessions.map((s) => ({
      id: s.id,
      kind: 'session' as const,
      title: s.title,
      courseTitle: s.cohort.course.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      location: s.location,
      mode: s.mode,
      meetingUrl: s.meetingUrl,
      href: `/cours/${s.cohort.course.slug}`,
      overdue: false,
    })),
    ...learnerAssignments
      .filter((a): a is typeof a & { dueAt: Date } => Boolean(a.dueAt) && (a.dueAt as Date).getTime() >= range.from.getTime() && (a.dueAt as Date).getTime() <= range.to.getTime())
      .map((a) => ({
        id: a.assignment.id,
        kind: 'assignment' as const,
        title: a.activity.title,
        courseTitle: a.course.title,
        startsAt: a.dueAt,
        endsAt: null,
        location: null,
        mode: null,
        meetingUrl: null,
        href: `/devoirs/${a.assignment.id}`,
        overdue: a.dueAt.getTime() < now && (a.state === 'todo' || a.state === 'draft' || a.state === 'returned'),
      })),
  ]
  return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

// -----------------------------------------------------------------------------
// Certificats
// -----------------------------------------------------------------------------

export type CertificateDetail = Awaited<ReturnType<typeof certification.get>>

export interface CertificateView {
  certificate: CertificateDetail
  verifyUrl: string
  qrDataUrl: string
  pdfUrl: string | null
  pillar: PillarName | null
}

export async function getCertificateView(principal: Principal, certificateId: string): Promise<CertificateView | null> {
  let certificate: CertificateDetail
  try {
    certificate = await certification.get(principal, certificateId)
  } catch (error) {
    if (isDomainError(error) && error.code === 'NOT_FOUND') return null
    throw error
  }
  const verifyUrl = `${resolvePublicUrl('web')}/certificats/verifier/${encodeURIComponent(certificate.verifyCode)}`
  const [qrDataUrl, pdfUrl, course] = await Promise.all([
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, color: { dark: '#042768', light: '#ffffff' } }),
    certificate.pdfUrl ? resolveFileUrl(certificate.pdfUrl, { download: true, expiresInSeconds: 600 }) : Promise.resolve(null),
    certificate.enrollment ? prisma.course.findUnique({ where: { id: certificate.enrollment.courseId }, select: { pillar: true } }) : Promise.resolve(null),
  ])
  const pillar = pillarSchema.safeParse(course?.pillar)
  return { certificate, verifyUrl, qrDataUrl, pdfUrl, pillar: pillar.success ? pillar.data : null }
}
