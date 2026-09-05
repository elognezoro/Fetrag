import type { Metadata } from 'next'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

/** Page introuvable du site institutionnel (groupe de routes public). */
export default function PublicSectionNotFound() {
  return (
    <PublicNotFound
      eyebrow="Erreur 404"
      title={
        <>
          Cette page est <span className="italic text-blue-600">introuvable</span>
        </>
      }
      description="L'adresse est peut-être erronée ou le contenu a été déplacé. Utilisez la recherche ou revenez à l'accueil du site de la Fédération."
      backHref="/"
      backLabel="Retour à l'accueil"
      searchPlaceholder="Rechercher une actualité, une formation, un service…"
    />
  )
}
