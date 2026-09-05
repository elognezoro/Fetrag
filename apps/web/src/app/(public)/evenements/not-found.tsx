import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Événement introuvable',
  robots: { index: false, follow: false },
}

/** Événement absent ou dépublié. */
export default function EventNotFound() {
  return (
    <PublicNotFound
      eyebrow="Événements"
      icon={CalendarDays}
      title={
        <>
          Cet événement est <span className="italic text-blue-600">introuvable</span>
        </>
      }
      description="L'événement demandé n'existe pas, a été annulé ou son adresse a changé. Consultez l'agenda de la Fédération pour les prochains rendez-vous."
      backHref="/evenements"
      backLabel="Tout l'agenda"
      searchPlaceholder="Rechercher un événement…"
    />
  )
}
