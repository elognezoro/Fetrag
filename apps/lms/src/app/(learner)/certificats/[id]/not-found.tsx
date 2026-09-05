import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import { SectionNotFound } from '@/components/learner/section-not-found'

export const metadata: Metadata = { title: 'Certificat introuvable', robots: { index: false, follow: false } }

/** Certificat inexistant ou n'appartenant pas à l'apprenant. */
export default function CertificateNotFound() {
  return (
    <SectionNotFound
      eyebrow="Certificat introuvable"
      title="Ce document n'est pas accessible"
      description="Le certificat demandé n'existe pas ou n'est pas rattaché à votre compte. Vos attestations et certificats sont listés dans votre espace."
      backHref="/certificats"
      backLabel="Mes certificats"
      backIcon={Award}
    />
  )
}
