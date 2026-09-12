import { redirect } from 'next/navigation'
import { staffGuide } from '@fetrag/guides'
import { requireAdmin } from '@/server/admin/context'

/** Entrée « Guide de mon rôle » : redirige vers le guide du rôle dominant dans le back-office. */
export default async function AdminGuideIndexPage() {
  const principal = await requireAdmin('/admin/guide')
  const guide = staffGuide(principal, 'web', ['SUPER_ADMIN', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT'])
  redirect(guide ? `/admin/guide/${guide.id}` : '/espace/guide')
}
