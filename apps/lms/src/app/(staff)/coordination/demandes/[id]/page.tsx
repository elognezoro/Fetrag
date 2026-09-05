import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { trainingRequestStatusLabels } from '@fetrag/contracts'
import { isDomainError } from '@fetrag/domain'
import { trainingRequests } from '@fetrag/lms-core'
import { Alert, AlertDescription, AlertTitle, Button, StatusBadge } from '@fetrag/ui'
import { DecisionPanel } from '@/components/staff/decision-panel'
import { RequestDetail } from '@/components/staff/request-detail'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listTrainers } from '@/server/staff/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadRequest(id: string) {
  const principal = await guards.requireCan('training_request.decide', {}, `/coordination/demandes/${id}`)
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

/** Instruction d'une demande : fiche complète et panneau de décision (chapitre 14). */
export default async function CoordinationRequestPage({ params }: PageProps) {
  const { id } = await params
  const { request } = await loadRequest(id)
  const trainers = await listTrainers()
  const withoutEmail = request.participants.filter((p) => !p.email).length
  const unpublished = request.modules.filter((m) => m.course.status !== 'PUBLISHED' || !m.course.currentVersionId)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Demandes', href: '/coordination/demandes' }, { label: request.reference }]}
        eyebrow="Instruction"
        title={request.reference}
        description={`${request.organization.name} · ${request.modules.length} module(s) pour ${request.participants.length} participant(s) · personne ressource : ${request.contactName}.`}
        meta={<StatusBadge status={request.status} labels={trainingRequestStatusLabels} />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/coordination/organisations/${request.organizationId}`}>
              <Building2 aria-hidden="true" />
              Fiche de l&apos;organisation
            </Link>
          </Button>
        }
        tone="gold"
      />

      <RequestDetail request={request} cohortHref={(cohortId) => `/coordination/cohortes/${cohortId}`}>
        {unpublished.length && request.allowedTransitions.includes('SCHEDULED') ? (
          <Alert variant="warning" className="mb-6">
            <AlertTitle>Modules non planifiables</AlertTitle>
            <AlertDescription>
              {unpublished.map((m) => m.course.title).join(', ')} : publiez une version depuis l&apos;administration avant de planifier ({' '}
              <Link href="/admin/cours" className="font-semibold hover:underline">
                gérer les cours
              </Link>
              ).
            </AlertDescription>
          </Alert>
        ) : null}
        {request.canDecide ? (
          <div className="mb-8">
            <DecisionPanel
              requestId={request.id}
              reference={request.reference}
              status={request.status}
              allowedTransitions={request.allowedTransitions}
              preferredStart={request.preferredStart}
              preferredMode={request.preferredMode}
              proposedStart={request.proposedStart}
              proposedMode={request.proposedMode}
              organizationName={request.organization.name}
              moduleTitles={request.modules.map((m) => m.course.title)}
              participantCount={request.participants.length}
              participantsWithoutEmail={withoutEmail}
              trainers={trainers}
              suggestedTrainerId={request.cohort?.trainerId ?? null}
            />
          </div>
        ) : null}
      </RequestDetail>
    </>
  )
}
