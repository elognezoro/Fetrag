import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { trainingRequestStatusLabels } from '@fetrag/contracts'
import { isDomainError } from '@fetrag/domain'
import { trainingRequests } from '@fetrag/lms-core'
import { StatusBadge } from '@fetrag/ui'
import { RequestOrgActions } from '@/components/staff/request-actions'
import { EditRequestLink, RequestDetail } from '@/components/staff/request-detail'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadRequest(id: string) {
  const principal = await guards.requireUser(`/organisation/demandes/${id}`)
  try {
    return { principal, request: await trainingRequests.get(principal, id) }
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { request } = await loadRequest(id)
  return { title: `Demande ${request.reference}` }
}

/** Détail d'une demande de formation dans le tableau de bord de l'organisation. */
export default async function OrganisationRequestPage({ params }: PageProps) {
  const { id } = await params
  const { principal, request } = await loadRequest(id)
  const isOwner = request.requesterId === principal.id || request.canEdit
  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Organisation', href: '/organisation' }, { label: 'Demandes', href: '/organisation#demandes' }, { label: request.reference }]}
        eyebrow="Demande de formation"
        title={request.reference}
        description={`${request.organization.name} · ${request.modules.length} module(s), ${request.participants.length} participant(s).`}
        meta={<StatusBadge status={request.status} labels={trainingRequestStatusLabels} />}
        actions={
          <>
            {request.canEdit ? <EditRequestLink requestId={request.id} /> : null}
            <RequestOrgActions requestId={request.id} canCancel={isOwner && request.allowedTransitions.includes('CANCELLED')} canResubmit={isOwner && request.status === 'RESCHEDULED'} />
          </>
        }
      />
      <RequestDetail request={request} />
    </>
  )
}
