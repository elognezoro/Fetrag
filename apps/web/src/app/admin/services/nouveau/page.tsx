import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ServiceForm } from '@/components/admin/service-form'
import { requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Nouveau service' }

/** Création d'un service du catalogue (brouillon). */
export default async function NewServicePage() {
  await requireAdminCan('services.manage', '/admin/services/nouveau')
  const categories = await loadCategoryOptions('service')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Services"
        title="Nouveau service"
        description="Décrivez le service, ses conditions d’accès, son tarif éventuel et composez le formulaire que remplira le demandeur."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Services', href: '/admin/services' }, { label: 'Nouveau service' }]}
      />
      <ServiceForm categories={categories} />
    </div>
  )
}
