import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { PublicNotFound } from '@/components/public/public-not-found'

export const metadata: Metadata = {
  title: 'Formation introuvable',
  robots: { index: false, follow: false },
}

/** Module absent du catalogue publié. */
export default function CourseNotFound() {
  return (
    <PublicNotFound
      eyebrow="Formations"
      icon={GraduationCap}
      title={
        <>
          Cette formation est <span className="italic text-green-700">introuvable</span>
        </>
      }
      description="Le module demandé n'existe pas ou n'est plus publié au catalogue. Retrouvez les dix modules du Programme de formation des Leaders Syndicaux."
      backHref="/formations"
      backLabel="Tout le programme"
      searchPlaceholder="Rechercher un module, un thème…"
    />
  )
}
