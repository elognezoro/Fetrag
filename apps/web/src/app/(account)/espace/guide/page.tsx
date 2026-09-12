import type { Metadata } from 'next'
import { commonGuide } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { guideReaderProps } from '@/server/guides'

export const metadata: Metadata = { title: 'Guide d’utilisation' }

/** Guide commun à tout compte connecté sur le site institutionnel (les guides de rôle sont listés en fin de page). */
export default async function AccountGuidePage() {
  const principal = await guards.requireUser('/espace/guide')
  const guide = commonGuide('web')

  return (
    <GuideReader
      {...guideReaderProps(principal, guide)}
      breadcrumbs={[{ label: 'Espace personnel', href: '/espace' }, { label: 'Guide d’utilisation' }]}
    />
  )
}
