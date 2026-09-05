import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Ressource introuvable',
  robots: { index: false, follow: false },
}

/** Document absent, dépublié ou réservé à une autre organisation. */
export default function ResourceNotFound() {
  return (
    <PublicNotFound
      eyebrow="Ressources"
      icon={BookOpen}
      title={
        <>
          Ce document est <span className="italic text-blue-600">introuvable</span>
        </>
      }
      description="La ressource demandée n'existe pas, a été retirée de la bibliothèque ou n'est pas accessible avec votre compte. Parcourez les documents disponibles."
      backHref="/ressources"
      backLabel="Toute la bibliothèque"
      searchPlaceholder="Rechercher un guide, un texte, un rapport…"
    />
  )
}
