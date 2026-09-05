import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Article introuvable',
  robots: { index: false, follow: false },
}

/** Article absent, retiré ou non publié. */
export default function ArticleNotFound() {
  return (
    <PublicNotFound
      eyebrow="Actualités"
      icon={Newspaper}
      title={
        <>
          Cet article est <span className="italic text-blue-600">introuvable</span>
        </>
      }
      description="La publication demandée n'existe pas, a été dépubliée ou son adresse a changé. Consultez les dernières actualités de la Fédération."
      backHref="/actualites"
      backLabel="Toutes les actualités"
      searchPlaceholder="Rechercher une actualité…"
    />
  )
}
