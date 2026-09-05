import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { OrganizationForm } from '@/components/admin/organization-form'
import { requireAdminCan } from '@/server/admin/context'

export const metadata: Metadata = { title: 'Nouvelle organisation' }

/** Création d'une organisation affiliée ou partenaire (organization.manage). */
export default async function NewOrganizationPage() {
  await requireAdminCan('organization.manage', '/admin/organisations/nouvelle')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title="Nouvelle organisation"
        description="Identité, coordonnées et statut. Les membres et responsables se rattachent ensuite depuis la fiche."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Organisations', href: '/admin/organisations' }, { label: 'Nouvelle organisation' }]}
      />
      <OrganizationForm />
    </div>
  )
}
