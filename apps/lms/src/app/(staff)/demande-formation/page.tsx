import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ClipboardList, FilePenLine } from 'lucide-react'
import { trainingRequests } from '@fetrag/lms-core'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, StatusBadge, TriptychStrip } from '@fetrag/ui'
import { OrgSwitcher } from '@/components/staff/org-switcher'
import { RequestWizard } from '@/components/staff/request-wizard'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { canAccessOrganizationSpace } from '@/server/staff/navigation'
import { currentOrganization } from '@/server/staff/org-context'
import { listProgrammeModules, listResumableRequests, loadContactDefaults } from '@/server/staff/organizations'
import type { WizardFormInput } from '@/server/staff/schemas'

export const metadata: Metadata = { title: 'Demande de formation' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ reprendre?: string }>
}

/** Assistant de demande de formation institutionnelle (chapitre 14, étapes 1 à 5). */
export default async function TrainingRequestPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/demande-formation')
  if (!canAccessOrganizationSpace(principal)) return null
  const { reprendre } = await searchParams
  const [{ organizations, current }, modules, participantLimit, contact] = await Promise.all([
    currentOrganization(principal),
    listProgrammeModules(),
    trainingRequests.participantLimit(),
    loadContactDefaults(principal.id),
  ])
  if (!current) return null
  const managed = organizations.filter((o) => o.isManager)
  const resumable = await listResumableRequests(principal, managed.map((o) => o.id))

  let draft: Awaited<ReturnType<typeof trainingRequests.get>> | null = null
  if (reprendre) {
    try {
      const found = await trainingRequests.get(principal, reprendre)
      if (found.canEdit) draft = found
    } catch {
      draft = null
    }
  }

  const defaultValues: WizardFormInput = draft
    ? {
        organizationId: draft.organizationId,
        contactName: draft.contactName,
        contactRole: draft.contactRole ?? '',
        contactEmail: draft.contactEmail,
        contactPhone: draft.contactPhone ?? '',
        courseIds: draft.modules.map((m) => m.courseId),
        participants: draft.participants.map((p) => ({ fullName: p.fullName, email: p.email ?? '', phone: p.phone ?? '', jobTitle: p.jobTitle ?? '' })),
        preferredStart: draft.preferredStart ? draft.preferredStart.toISOString().slice(0, 10) : '',
        preferredMode: draft.preferredMode,
        motivation: draft.motivation ?? '',
        commitmentsAccepted: draft.commitmentsAccepted,
      }
    : {
        organizationId: (managed.find((o) => o.id === current.id) ?? managed[0] ?? current).id,
        contactName: contact.name,
        contactRole: contact.role,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        courseIds: [],
        participants: [],
        preferredStart: '',
        preferredMode: 'HYBRID',
        motivation: '',
        commitmentsAccepted: false,
      }

  const wizardOrganizations = managed.length ? managed : [current]

  return (
    <>
      <StaffPageHeader
        eyebrow="Demande de formation"
        title={
          <>
            Former vos <span className="italic text-green-700">leaders syndicaux</span>
          </>
        }
        description="Déposez une demande institutionnelle en six étapes : la coordination FETRAG l'instruit, propose un calendrier et un formateur, puis planifie les cohortes et crée les comptes de vos participants."
        actions={<OrgSwitcher organizations={organizations} currentId={current.id} />}
        tone="green"
      />

      {!managed.length ? (
        <Card className="mb-8">
          <CardContent className="p-5 text-sm text-neutral-700">
            Vous consultez {current.name} en lecture : seuls les responsables désignés de l&apos;organisation peuvent déposer une demande.
          </CardContent>
        </Card>
      ) : null}

      {resumable.length && !draft ? (
        <Card pillar="defense" className="mb-8">
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
              <FilePenLine className="size-5 text-gold-700" aria-hidden="true" />
              Demandes à reprendre
            </h2>
            <ul className="divide-y divide-neutral-100">
              {resumable.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                      {r.reference}
                      <StatusBadge status={r.status} size="sm" />
                    </p>
                    <p className="text-xs text-neutral-500">
                      {r.organization.name} · {r._count.modules} module(s), {r._count.participants} participant(s) · modifié le {formatDateTime(r.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/demande-formation/${r.id}`}>Suivi</Link>
                    </Button>
                    <Button asChild variant="primary" size="sm">
                      <Link href={`/demande-formation?reprendre=${r.id}`}>
                        Reprendre
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {managed.length ? (
        <RequestWizard
          key={draft?.id ?? 'new'}
          organizations={wizardOrganizations}
          modules={modules}
          participantLimit={participantLimit}
          defaultValues={defaultValues}
          draft={draft ? { id: draft.id, reference: draft.reference, status: draft.status, coordinatorNote: draft.coordinatorNote } : null}
          attachments={draft?.attachments ?? []}
        />
      ) : null}

      <div className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="size-5 text-blue-600" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-navy">Le programme s&apos;appuie sur le triptyque fondateur</h2>
          <Badge variant="gold">Session 2026</Badge>
        </div>
        <TriptychStrip variant="bar" />
      </div>
    </>
  )
}
