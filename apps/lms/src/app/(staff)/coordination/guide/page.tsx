import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { canReadGuide, guideForRole } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { lmsGuideReaderProps } from '@/server/guides'

export const metadata: Metadata = {
  title: 'Guide d’utilisation',
  description: 'Guide de la coordination formation : demandes, cohortes, sessions, certificats, organisations et rapports.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** Guide de la coordination, rendu dans la coquille de l'espace Coordination. */
export default async function CoordinationGuidePage() {
  const principal = await guards.requireUser('/coordination/guide')
  const guide = guideForRole('lms', 'COORDINATOR')
  if (!guide || !canReadGuide(principal, guide)) redirect('/acces-refuse')

  return <GuideReader {...lmsGuideReaderProps(principal, guide)} breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Guide d’utilisation' }]} />
}
