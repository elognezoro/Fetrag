import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { trainingRequestStatusLabels } from '@fetrag/contracts'
import { isDomainError } from '@fetrag/domain'
import { trainingRequests } from '@fetrag/lms-core'
import { Alert, AlertDescription, AlertTitle, StatusBadge } from '@fetrag/ui'
import { RequestOrgActions } from '@/components/staff/request-actions'
import { EditRequestLink, RequestDetail } from '@/components/staff/request-detail'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadRequest(id: string) {
  const principal = await guards.requireUser(`/demande-formation/${id}`)
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

/** Suivi d'une demande de formation par l'organisation : frise des statuts, décisions, pièces, réponse à un complément. */
export default async function TrainingRequestTrackingPage({ params }: PageProps) {
  const { id } = await params
  const { principal, request } = await loadRequest(id)
  const isOwner = request.requesterId === principal.id || request.canEdit
  const canCancel = isOwner && request.allowedTransitions.includes('CANCELLED')
  const canResubmit = isOwner && request.status === 'RESCHEDULED'

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Demande de formation', href: '/demande-formation' }, { label: request.reference }]}
        eyebrow="Suivi de la demande"
        title={request.reference}
        description={`${request.modules.length} module(s) pour ${request.participants.length} participant(s) de ${request.organization.name}.`}
        meta={<StatusBadge status={request.status} labels={trainingRequestStatusLabels} />}
        actions={
          <>
            {request.canEdit ? <EditRequestLink requestId={request.id} /> : null}
            <RequestOrgActions requestId={request.id} canCancel={canCancel} canResubmit={canResubmit} />
          </>
        }
        tone="green"
      />

      <RequestDetail request={request}>
        {request.status === 'INFO_REQUESTED' ? (
          <Alert variant="warning" className="mb-8">
            <AlertTitle>La coordination attend un complément</AlertTitle>
            <AlertDescription>
              {request.coordinatorNote ? <p className="mb-2">« {request.coordinatorNote} »</p> : null}
              Complétez la demande depuis l&apos;assistant (modules, participants, pièces) puis transmettez-la à nouveau.
            </AlertDescription>
          </Alert>
        ) : null}
        {request.status === 'RESCHEDULED' ? (
          <Alert variant="info" className="mb-8">
            <AlertTitle>Une autre date vous est proposée</AlertTitle>
            <AlertDescription>Consultez la proposition ci-dessous : acceptez-la pour que la coordination planifie la formation, ou annulez la demande.</AlertDescription>
          </Alert>
        ) : null}
        {request.status === 'DRAFT' ? (
          <Alert variant="info" className="mb-8">
            <AlertTitle>Brouillon non transmis</AlertTitle>
            <AlertDescription>Cette demande n&apos;a pas encore été transmise à la coordination : reprenez l&apos;assistant pour la finaliser.</AlertDescription>
          </Alert>
        ) : null}
      </RequestDetail>
    </>
  )
}
