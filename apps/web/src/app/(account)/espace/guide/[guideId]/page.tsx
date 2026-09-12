import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { canReadGuide, guideById, guidePath } from '@fetrag/guides'
import { GuideReader } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { guideReaderProps } from '@/server/guides'

interface PageProps {
  params: Promise<{ guideId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { guideId } = await params
  const guide = guideById(guideId)
  return { title: guide && guide.platform === 'web' ? guide.title : 'Guide d’utilisation' }
}

/**
 * Guide de rôle servi dans l'espace personnel (responsable d'organisation).
 * Le guide commun a sa propre page ; les guides du back-office sont servis sous /admin/guide.
 */
export default async function AccountRoleGuidePage({ params }: PageProps) {
  const { guideId } = await params
  const principal = await guards.requireUser(`/espace/guide/${guideId}`)
  const guide = guideById(guideId)
  if (!guide || guide.platform !== 'web') notFound()
  if (guide.role === 'MEMBER') redirect('/espace/guide')
  if (!canReadGuide(principal, guide)) redirect('/acces-refuse')
  const expectedPath = guidePath(guide)
  if (expectedPath !== `/espace/guide/${guide.id}`) redirect(expectedPath)

  return (
    <GuideReader
      {...guideReaderProps(principal, guide)}
      breadcrumbs={[{ label: 'Espace personnel', href: '/espace' }, { label: 'Guide d’utilisation', href: '/espace/guide' }, { label: guide.title }]}
    />
  )
}
