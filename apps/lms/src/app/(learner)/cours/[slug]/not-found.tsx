import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Formation introuvable', robots: { index: false, follow: false } }

/** Fiche de formation absente ou non publiée. */
export default function CourseNotFound() {
  return (
    <SectionNotFound
      eyebrow="Formation introuvable"
      title="Cette formation n'est pas disponible"
      description="Le module demandé n'existe pas ou n'est plus publié. Les dix modules du programme 2026 sont présentés dans le catalogue."
      backHref="/catalogue"
      backLabel="Voir le catalogue"
      backIcon={BookOpen}
    />
  )
}
