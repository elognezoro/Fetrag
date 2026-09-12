import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { staffGuide } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { loadGuideView } from '@/server/guides'

export const metadata: Metadata = {
  title: 'Guide d’utilisation',
  description: 'Guide de l’administration de la plateforme de formation : cours, banque de questions, modèles de certificats, comptes et rôles, paramètres et journal d’audit.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/**
 * Guide de l'espace Administration : le super administrateur lit le guide d'administration,
 * le coordinateur (qui publie les cours) lit le guide de coordination.
 */
export default async function AdminGuidePage() {
  const principal = await guards.requireUser('/admin/guide')
  const guide = staffGuide(principal, 'lms', ['SUPER_ADMIN', 'COORDINATOR'])
  if (!guide) redirect('/guide')

  return <GuideReader {...(await loadGuideView(principal, guide))} breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Guide d’utilisation' }]} />
}
