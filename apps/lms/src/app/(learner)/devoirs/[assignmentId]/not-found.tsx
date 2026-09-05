import type { Metadata } from 'next'
import { ClipboardList } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Devoir introuvable', robots: { index: false, follow: false } }

/** Devoir inexistant ou hors des formations suivies. */
export default function AssignmentNotFound() {
  return (
    <SectionNotFound
      eyebrow="Devoir introuvable"
      title="Ce devoir n'est pas accessible"
      description="Le devoir demandé n'existe pas ou ne fait pas partie d'une formation à laquelle vous êtes inscrit."
      backHref="/devoirs"
      backLabel="Mes devoirs"
      backIcon={ClipboardList}
    />
  )
}
