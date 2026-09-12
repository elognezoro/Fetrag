import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { canReadGuide, guideForRole } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { loadGuideView } from '@/server/guides'

export const metadata: Metadata = {
  title: 'Guide d’utilisation',
  description: 'Guide du formateur sur la plateforme de formation : cohortes, séances, devoirs, notation et forums.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/** Guide du formateur, rendu dans la coquille de l'espace Formateur. */
export default async function TrainerGuidePage() {
  const principal = await guards.requireUser('/formateur/guide')
  const guide = guideForRole('lms', 'TRAINER')
  if (!guide || !canReadGuide(principal, guide)) redirect('/acces-refuse')

  return <GuideReader {...(await loadGuideView(principal, guide))} breadcrumbs={[{ label: 'Formateur', href: '/formateur' }, { label: 'Guide d’utilisation' }]} />
}
