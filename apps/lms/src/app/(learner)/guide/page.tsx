import type { Metadata } from 'next'
import { commonGuide } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { loadGuideView } from '@/server/guides'

export const metadata: Metadata = {
  title: 'Guide d’utilisation',
  description: 'Prendre en main la plateforme de formation : inscription, parcours, évaluations, certificats et assistance, pas à pas.',
  robots: { index: false, follow: false },
}

/** Guide commun à tous les comptes connectés (apprenant) ; les guides de rôle sont servis dans chaque espace. */
export default async function LearnerGuidePage() {
  const principal = await guards.requireUser('/guide')
  const guide = commonGuide('lms')

  return (
    <div className="container-fetrag py-8 sm:py-12">
      <GuideReader {...(await loadGuideView(principal, guide))} breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Guide d’utilisation' }]} />
    </div>
  )
}
