import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { UserForm } from '@/components/admin/user-form'
import { requireAdminCan } from '@/server/admin/context'
import { loadOrganizationOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Nouveau compte' }

/** Création manuelle d'un compte par le super administrateur (rôle initial, organisation, mot de passe temporaire). */
export default async function NewUserPage() {
  await requireAdminCan('users.manage', '/admin/utilisateurs/nouveau')
  const organizations = await loadOrganizationOptions()
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title="Nouveau compte"
        description="Créez un compte pour un membre de l’équipe, un formateur ou un responsable d’organisation. Un mot de passe temporaire est généré et affiché une seule fois."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Utilisateurs', href: '/admin/utilisateurs' }, { label: 'Nouveau compte' }]}
      />
      <UserForm organizations={organizations} />
    </div>
  )
}
