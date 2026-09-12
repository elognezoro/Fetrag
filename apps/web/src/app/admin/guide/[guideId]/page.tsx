import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { canReadGuide, guideById, guidePath } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { requireAdmin } from '@/server/admin/context'
import { loadGuideView } from '@/server/guides'

interface PageProps {
  params: Promise<{ guideId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { guideId } = await params
  const guide = guideById(guideId)
  return { title: guide && guide.platform === 'web' ? guide.title : 'Guide d’utilisation' }
}

/** Guide d'un rôle du back-office (éditeur, services, finance, support, coordination, administration). */
export default async function AdminRoleGuidePage({ params }: PageProps) {
  const { guideId } = await params
  const principal = await requireAdmin(`/admin/guide/${guideId}`)
  const guide = guideById(guideId)
  // Identifiant inconnu ou guide d'une autre plateforme : retour au guide du rôle.
  if (!guide || guide.platform !== 'web') redirect('/admin/guide')
  // Guides servis dans l'espace personnel (membre, responsable d'organisation) : chemin canonique.
  if (guide.role === 'MEMBER' || guide.role === 'ORG_MANAGER') redirect(guidePath(guide))
  if (!canReadGuide(principal, guide)) redirect('/acces-refuse')

  return (
    <GuideReader
      {...(await loadGuideView(principal, guide))}
      breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Guide d’utilisation' }]}
    />
  )
}
