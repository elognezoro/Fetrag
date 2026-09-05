import type { Metadata } from 'next'
import { CourseForm } from '@/components/staff/course-form'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listCategoriesForSelect, listTrainers } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Nouveau cours' }
export const dynamic = 'force-dynamic'

/** Création d'un cours : la fiche descriptive puis la version 1 (brouillon) sont créées ensemble. */
export default async function NewCoursePage() {
  await guards.requireCan('course.author', {}, '/admin/cours/nouveau')
  const [categories, trainers] = await Promise.all([listCategoriesForSelect(), listTrainers()])
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Cours', href: '/admin/cours' }, { label: 'Nouveau cours' }]}
        eyebrow="Nouveau module"
        title={
          <>
            Créer un <span className="italic text-blue-600">cours du programme</span>
          </>
        }
        description="Renseignez la fiche descriptive : la version 1 est créée en brouillon, vous structurez ensuite modules, leçons et activités depuis le builder, puis publiez la version."
      />
      <CourseForm categories={categories} trainers={trainers} />
    </>
  )
}
