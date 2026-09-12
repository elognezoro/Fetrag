import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { canReadGuide, guideForRole } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { lmsGuideReaderProps } from '@/server/guides'

export const metadata: Metadata = {
  title: 'Guide d’utilisation',
  description: 'Guide du responsable d’organisation sur la plateforme de formation : demandes de formation, participants et rapports.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** Guide du responsable d'organisation, rendu dans la coquille de l'espace Organisation. */
export default async function OrganisationGuidePage() {
  const principal = await guards.requireUser('/organisation/guide')
  const guide = guideForRole('lms', 'ORG_MANAGER')
  if (!guide || !canReadGuide(principal, guide)) redirect('/acces-refuse')

  return <GuideReader {...lmsGuideReaderProps(principal, guide)} breadcrumbs={[{ label: 'Organisation', href: '/organisation' }, { label: 'Guide d’utilisation' }]} />
}
