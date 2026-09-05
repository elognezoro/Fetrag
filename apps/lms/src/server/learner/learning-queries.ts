import 'server-only'
import { cache } from 'react'
import { prisma } from '@fetrag/db'
import type { Principal } from '@fetrag/domain'
import { progress } from '@fetrag/lms-core'
import { findEnrollmentForCourse } from './queries'

/** Titres de la leçon et du cours pour les métadonnées du lecteur (helper local prisma, sans données personnelles). */
export const getLessonTitle = cache(async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, module: { select: { title: true, courseVersion: { select: { course: { select: { title: true } } } } } } },
  })
  if (!lesson) return null
  return { lessonTitle: lesson.title, moduleTitle: lesson.module.title, courseTitle: lesson.module.courseVersion.course.title }
})

export type CourseEntry =
  | { kind: 'resume'; href: string }
  | { kind: 'not-enrolled'; courseSlug: string | null }
  | { kind: 'pending'; courseSlug: string | null }
  | { kind: 'empty'; courseSlug: string | null }

/**
 * Point d'entrée du lecteur (`/apprendre/[courseId]`) : prochaine activité de l'inscription,
 * sinon première leçon de la version suivie, sinon retour vers la fiche du cours.
 */
export async function resolveCourseEntry(principal: Principal, courseId: string): Promise<CourseEntry> {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { slug: true } })
  const enrollment = await findEnrollmentForCourse(principal.id, courseId)
  if (!enrollment) return { kind: 'not-enrolled', courseSlug: course?.slug ?? null }
  if (enrollment.status === 'PENDING') return { kind: 'pending', courseSlug: course?.slug ?? null }

  const next = await progress.nextActivity(enrollment.id).catch(() => null)
  if (next) return { kind: 'resume', href: next.href }

  // Toutes les activités sont achevées : on rouvre la dernière activité consultée ou la première leçon.
  if (enrollment.lastActivityId) {
    const last = await prisma.activity.findUnique({ where: { id: enrollment.lastActivityId }, select: { id: true, lessonId: true } })
    if (last) return { kind: 'resume', href: `/apprendre/${courseId}/${last.lessonId}?activite=${last.id}` }
  }
  const firstLesson = await prisma.lesson.findFirst({
    where: { module: { courseVersionId: enrollment.courseVersionId } },
    orderBy: [{ module: { position: 'asc' } }, { position: 'asc' }],
    select: { id: true },
  })
  if (firstLesson) return { kind: 'resume', href: `/apprendre/${courseId}/${firstLesson.id}` }
  return { kind: 'empty', courseSlug: course?.slug ?? null }
}
