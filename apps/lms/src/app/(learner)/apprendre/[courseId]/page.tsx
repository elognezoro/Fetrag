import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { guards } from '@/lib/auth'
import { resolveCourseEntry } from '@/server/learner/learning-queries'

export const metadata: Metadata = { title: 'Reprendre la formation', robots: { index: false, follow: false } }

interface PageProps {
  params: Promise<{ courseId: string }>
}

/**
 * Point d'entrée `/apprendre/[courseId]` : redirige vers la prochaine activité de l'inscription,
 * vers la fiche du cours si l'apprenant n'est pas (encore) inscrit, sinon 404.
 */
export default async function CourseEntryPage({ params }: PageProps) {
  const { courseId } = await params
  const principal = await guards.requireUser(`/apprendre/${courseId}`)
  const entry = await resolveCourseEntry(principal, courseId)
  if (entry.kind === 'resume') redirect(entry.href)
  if (entry.courseSlug) redirect(`/cours/${entry.courseSlug}`)
  notFound()
}
