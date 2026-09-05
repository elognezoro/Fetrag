import type { Metadata } from 'next'
import { LifeBuoy } from 'lucide-react'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Service introuvable',
  robots: { index: false, follow: false },
}

/** Service absent ou retiré du catalogue. */
export default function ServiceNotFound() {
  return (
    <PublicNotFound
      eyebrow="Services"
      icon={LifeBuoy}
      title={
        <>
          Ce service est <span className="italic text-green-700">introuvable</span>
        </>
      }
      description="Le service demandé n'existe pas ou n'est plus proposé. Consultez le catalogue des services de la Fédération ou contactez-nous."
      backHref="/services"
      backLabel="Tous les services"
      searchPlaceholder="Rechercher un service…"
    />
  )
}
