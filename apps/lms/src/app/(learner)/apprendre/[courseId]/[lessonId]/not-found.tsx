import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Leçon introuvable', robots: { index: false, follow: false } }

/** Leçon absente de la version suivie ou inscription inexistante. */
export default function LessonNotFound() {
  return (
    <SectionNotFound
      eyebrow="Leçon introuvable"
      title="Cette leçon n'est pas accessible"
      description="La leçon demandée n'existe pas dans la version du cours que vous suivez, ou votre inscription n'est pas active. Reprenez votre parcours depuis vos formations."
      backHref="/mes-formations"
      backLabel="Mes formations"
      backIcon={GraduationCap}
    />
  )
}
