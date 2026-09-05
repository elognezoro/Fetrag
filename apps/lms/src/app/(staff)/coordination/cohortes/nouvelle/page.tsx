import type { Metadata } from 'next'
import { CohortForm } from '@/components/staff/cohort-form'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listCoursesForSelect, listOrganizationsForSelect, listTrainers } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Nouvelle cohorte' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ organisation?: string }>
}

/** Création manuelle d'une cohorte (hors workflow de demande). */
export default async function NewCohortPage({ searchParams }: PageProps) {
  await guards.requireCan('cohort.manage', {}, '/coordination/cohortes/nouvelle')
  const { organisation } = await searchParams
  const [courses, organizations, trainers] = await Promise.all([listCoursesForSelect(), listOrganizationsForSelect(), listTrainers()])
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Cohortes', href: '/coordination/cohortes' }, { label: 'Nouvelle cohorte' }]}
        eyebrow="Création manuelle"
        title={
          <>
            Constituer une <span className="italic text-green-700">nouvelle cohorte</span>
          </>
        }
        description="Choisissez le module et sa version, l'organisation bénéficiaire, le formateur et le calendrier. Les membres s'ajoutent ensuite depuis la fiche de la cohorte."
        tone="green"
      />
      <CohortForm courses={courses} organizations={organizations} trainers={trainers} defaultOrganizationId={organisation ?? null} />
    </>
  )
}
