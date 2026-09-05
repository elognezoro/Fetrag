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
  return (
    <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={label}>
      {courses.map((course) => (
        <StaggerItem key={course.id} as="li" className="h-full">
          <ModuleCard
            number={moduleNumber(course.code)}
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
