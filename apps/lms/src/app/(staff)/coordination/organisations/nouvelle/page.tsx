import type { Metadata } from 'next'
import { OrganizationForm } from '@/components/staff/organization-form'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'

export const metadata: Metadata = { title: 'Nouvelle organisation' }
export const dynamic = 'force-dynamic'

export default async function NewOrganizationPage() {
  await guards.requireCan('organization.manage', {}, '/coordination/organisations/nouvelle')
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Organisations', href: '/coordination/organisations' }, { label: 'Nouvelle organisation' }]}
        eyebrow="Affiliation"
        title={
          <>
            Créer la fiche d&apos;une <span className="italic text-blue-600">organisation</span>
          </>
        }
        description="Renseignez l'identité de l'organisation puis rattachez ses gestionnaires depuis sa fiche : ils pourront déposer des demandes de formation."
      />
      <OrganizationForm />
    </>
  )
}
