import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Évaluation introuvable', robots: { index: false, follow: false } }

/** Activité inexistante, non évaluative ou inaccessible. */
export default function EvaluationNotFound() {
  return (
    <SectionNotFound
      eyebrow="Évaluation introuvable"
      title="Cette évaluation n'est pas disponible"
      description="L'évaluation demandée n'existe pas ou ne fait pas partie d'une formation à laquelle vous êtes inscrit."
      backHref="/mes-formations"
      backLabel="Mes formations"
      backIcon={GraduationCap}
    />
  )
}
