import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ResourceForm } from '@/components/admin/resource-form'
import { requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions, loadOrganizationOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Nouvelle ressource' }

/** Dépôt d'une nouvelle ressource documentaire (brouillon). */
export default async function NewResourcePage() {
  await requireAdminCan('cms.write', '/admin/ressources/nouveau')
  const [categories, organizations] = await Promise.all([loadCategoryOptions('resource'), loadOrganizationOptions()])
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Nouvelle ressource"
        description="Déposez un fichier (stocké en privé pour les niveaux réservés) ou indiquez une URL externe, puis renseignez les métadonnées documentaires."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Ressources', href: '/admin/ressources' }, { label: 'Nouvelle ressource' }]}
      />
      <ResourceForm categories={categories} organizations={organizations} />
    </div>
  )
}
