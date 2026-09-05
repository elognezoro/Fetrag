import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { PartnerForm } from '@/components/admin/partner-form'
import { requireAdminCan } from '@/server/admin/context'

export const metadata: Metadata = { title: 'Nouveau partenaire' }

/** Ajout d'une organisation affiliée, d'un partenaire ou d'une institution. */
export default async function NewPartnerPage() {
  await requireAdminCan('cms.write', '/admin/partenaires/nouveau')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Nouveau partenaire"
        description="Identité, secteur, logo et coordonnées de l’organisation. Le logo doit être lisible sur fond blanc."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Partenaires', href: '/admin/partenaires' }, { label: 'Nouveau partenaire' }]}
      />
      <PartnerForm />
    </div>
  )
}
