import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { trainingRequestStatuses, trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { trainingRequests } from '@fetrag/lms-core'
import { Badge, Button, Card, EmptyState, Pagination, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listOrganizationsForSelect } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Demandes de formation' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ statut?: string; organisation?: string; q?: string; page?: string }>
}

/** File de traitement des demandes institutionnelles (filtres statut, organisation, recherche). */
export default async function CoordinationRequestsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('training_request.decide', {}, '/coordination/demandes')
  const params = await searchParams
  const status = (trainingRequestStatuses as readonly string[]).includes(params.statut ?? '') ? (params.statut as (typeof trainingRequestStatuses)[number]) : undefined
  const page = readPage(params.page)
  const [list, organizations] = await Promise.all([
    trainingRequests.listForCoordination(principal, { status, organizationId: params.organisation || undefined, q: params.q || undefined, page, pageSize: 20 }),
    listOrganizationsForSelect(),
  ])
  const hrefFor = (p: number) => buildHref('/coordination/demandes', { statut: params.statut, organisation: params.organisation, q: params.q, page: p > 1 ? p : undefined })

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Demandes' }]}
        eyebrow="Demandes de formation"
        title={
          <>
            {list.pendingCount} demande{list.pendingCount > 1 ? 's' : ''} <span className="italic text-gold-700">à instruire</span>
          </>
        }
        description="Chaque demande suit le workflow institutionnel : soumission, complément éventuel, acceptation ou proposition de date, planification des cohortes."
        tone="gold"
      />

      <FilterBar
        action="/coordination/demandes"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Référence, organisation, contact', value: params.q },
          { name: 'statut', label: 'Statut', type: 'select', value: params.statut, options: trainingRequestStatuses.filter((s) => s !== 'DRAFT').map((s) => ({ value: s, label: trainingRequestStatusLabels[s] })) },
          { name: 'organisation', label: 'Organisation', type: 'select', value: params.organisation, placeholder: 'Toutes', options: organizations.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym} - ${o.name}` : o.name })) },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Soumise le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/coordination/demandes/${r.id}`} className="font-semibold text-navy hover:underline">
                      {r.reference}
                    </Link>
                    <span className="block text-xs text-neutral-500">{r.contactName}</span>
                  </TableCell>
                  <TableCell>{r.organization.acronym ?? r.organization.name}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 max-w-xs text-sm">{r.modules.map((m) => m.course.title).join(', ')}</span>
                  </TableCell>
                  <TableCell>
                    {r._count.participants}
                    {r._count.attachments ? <Badge variant="outline" size="sm" className="ml-2">{r._count.attachments} pièce(s)</Badge> : null}
                  </TableCell>
                  <TableCell className="text-neutral-600">{r.submittedAt ? formatDate(r.submittedAt) : '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} labels={trainingRequestStatusLabels} size="sm" />
                    {r.cohort ? (
                      <Link href={`/coordination/cohortes/${r.cohort.id}`} className="block text-xs text-blue-700 hover:underline">
                        Cohorte {r.cohort.code}
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/coordination/demandes/${r.id}`}>Instruire</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
          <p className="mt-3 text-xs text-neutral-500">{list.total} demande(s) au total.</p>
        </>
      ) : (
        <Card>
          <EmptyState icon={ClipboardList} title="Aucune demande" description={params.q || params.statut || params.organisation ? 'Aucune demande ne correspond aux filtres.' : "Les demandes déposées par les organisations affiliées s'afficheront ici."} />
        </Card>
      )}
    </>
  )
}
