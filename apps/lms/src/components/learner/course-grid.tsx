import { BookOpen } from 'lucide-react'
import { Button, EmptyState, ModuleCard, Stagger, StaggerItem } from '@fetrag/ui'
import type { CatalogueItem } from '@/server/learner/queries'
import { priceLabel } from './course-meta'
import Link from 'next/link'

interface CourseGridProps {
  courses: CatalogueItem[]
  /** Titre accessible de la liste. */
  label?: string
  emptyTitle?: string
  emptyDescription?: string
}

/** Numéro de module à partir du code (« M01 » → « 01 »). */
export function moduleNumber(code: string): string {
  const digits = code.replace(/\D/g, '')
  return digits ? digits.padStart(2, '0').slice(-2) : code
}

/** Libellé d'un cours : « Module 02 » pour le programme numéroté, sinon le code tel quel (séminaires). */
export function moduleLabel(code: string): string {
  const digits = code.replace(/\D/g, '')
  return digits ? `Module ${digits.padStart(2, '0').slice(-2)}` : code
}

/** Numéro compact pour les cartes : « 02 » pour le programme, sinon le premier segment du code (« DTC »). */
export function moduleShort(code: string): string {
  const digits = code.replace(/\D/g, '')
  return digits ? digits.padStart(2, '0').slice(-2) : (code.split('-')[0] ?? code)
}

/** Grille des 10 modules du programme (cartes numérotées, filet par pilier, révélation en cascade). */
export function CourseGrid({ courses, label = 'Formations', emptyTitle = 'Aucune formation ne correspond à votre recherche', emptyDescription }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription ?? 'Modifiez vos filtres ou explorez l’ensemble du programme.'}
        action={
          <Button asChild variant="secondary">
            <Link href="/catalogue">Voir tout le catalogue</Link>
          </Button>
        }
      />
    )
  }
  // Liste haute (dix cartes en colonne unique sur mobile) : la cascade démarre dès que la grille entre dans le
  // viewport plutôt qu'à 15 % de visibilité (≈ 720 px), sans quoi la première carte reste invisible au premier défilement.
  return (
    <Stagger
      as="ul"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-label={label}
      viewport={{ once: true, amount: 'some', margin: '0px 0px -8% 0px' }}
    >
      {courses.map((course) => (
        <StaggerItem key={course.id} as="li" className="h-full">
          <ModuleCard
            number={moduleShort(course.code)}
            title={course.title}
            items={course.objectives.slice(0, 3)}
            pillar={course.pillar ?? 'blue'}
            href={`/cours/${course.slug}`}
            duration={`${course.durationHours} h`}
            badge={course.isFree ? 'Gratuit' : priceLabel(course.isFree, course.priceAmount, course.currency)}
            linkLabel="Voir la fiche"
            className="h-full"
          />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
