import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { PageForm } from '@/components/admin/page-form'
import { requireAdminCan } from '@/server/admin/context'

export const metadata: Metadata = { title: 'Nouvelle page' }

/** Création d'une page institutionnelle (brouillon). */
export default async function NewPagePage() {
  await requireAdminCan('cms.write', '/admin/pages/nouveau')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Nouvelle page"
        description="La page est créée en brouillon ; publiez-la depuis son panneau de publication une fois relue."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Pages', href: '/admin/pages' }, { label: 'Nouvelle page' }]}
      />
      <PageForm />
    </div>
  )
}
