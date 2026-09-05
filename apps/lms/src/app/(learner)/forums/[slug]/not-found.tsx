import type { Metadata } from 'next'
import { MessagesSquare } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Forum introuvable', robots: { index: false, follow: false } }

/** Forum ou fil inexistant, ou réservé à une cohorte / formation dont l'apprenant ne fait pas partie. */
export default function ForumNotFound() {
  return (
    <SectionNotFound
      eyebrow="Forum introuvable"
      title="Cet espace d'échange n'est pas accessible"
      description="Le forum ou le fil demandé n'existe pas, ou il est réservé aux participants d'une formation ou d'une cohorte à laquelle vous n'êtes pas inscrit."
      backHref="/forums"
      backLabel="Tous les forums"
      backIcon={MessagesSquare}
    />
  )
}
