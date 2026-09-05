import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { publicEnv } from '@/lib/env'
import { AdminNav } from '@/components/admin/admin-nav'
import { AdminShell } from '@/components/admin/admin-shell'
import { requireAdmin } from '@/server/admin/context'
import { buildAdminNav, dominantRoleLabel } from '@/server/admin/navigation'
import { loadAdminBadges } from '@/server/admin/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s | Administration FETRAG' },
  robots: { index: false, follow: false },
}

/**
 * Coquille du back-office vitrine : accès réservé aux principaux disposant d'au moins une permission
 * d'administration (`cms.read_drafts`, services, formulaires, finance, utilisateurs, audit, paramètres).
 * Les entrées de navigation non autorisées sont masquées ; chaque page revérifie sa permission.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const principal = await requireAdmin('/admin')
  const [sections, badges] = await Promise.all([Promise.resolve(buildAdminNav(principal)), loadAdminBadges(principal).catch(() => ({}))])
  const user = { name: principal.name?.trim() || principal.email, email: principal.email, roleLabel: dominantRoleLabel(principal) }

  return (
    <AdminShell user={user} lmsUrl={publicEnv.lmsUrl} nav={<AdminNav sections={sections} badges={badges} />}>
      {children}
    </AdminShell>
  )
}
