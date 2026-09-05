import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Inbox } from 'lucide-react'
import { serviceRequestStatusLabels, serviceRequestStatuses } from '@fetrag/contracts'
import { formatDate, formatRelative } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { loadServiceRequests } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { buildListHref, pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadHandlerOptions, loadServiceOptions } from '@/server/admin/queries'
import { serviceRequests } from '@fetrag/cms'

export const metadata: Metadata = { title: 'Demandes de service' }

const BASE = '/admin/demandes'

/** Délai restant avant l'échéance indicative (SLA) d'une demande ouverte. */
function slaState(createdAt: Date, slaDays: number | null, status: string): { label: string; tone: 'success' | 'warning' | 'danger' } | null {
  if (!slaDays || status === 'CLOSED' || status === 'RESOLVED' || status === 'REJECTED') return null
  const due = createdAt.getTime() + slaDays * 86_400_000
  const remaining = Math.ceil((due - Date.now()) / 86_400_000)
  if (remaining < 0) return { label: `Échéance dépassée de ${Math.abs(remaining)} j`, tone: 'danger' }
  if (remaining <= 2) return { label: remaining === 0 ? 'Échéance aujourd’hui' : `${remaining} j restant${remaining > 1 ? 's' : ''}`, tone: 'warning' }
  return { label: `${remaining} j restants`, tone: 'success' }
}

/** File des demandes de service : filtres, répartition par statut, export CSV. */
export default async function AdminServiceRequestsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('services.handle_requests', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['service', 'responsable'])
  const [result, counts, services, handlers] = await Promise.all([
    loadServiceRequests(principal, params),
    serviceRequests.countByStatus(principal),
    loadServiceOptions(),
    loadHandlerOptions(),
  ])
  const open = counts.NEW + counts.IN_REVIEW + counts.IN_PROGRESS

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Services"
        title="Demandes de service"
        description="Sollicitations déposées depuis le catalogue : assistance juridique, médiation, accompagnement. Attribuez, faites avancer le statut et informez le demandeur à chaque étape."
        actions={
          <Button asChild variant="outline" size="md">
            <a href={buildListHref(`${BASE}/export`, params)}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </a>
          </Button>
        }
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatTile value={counts.NEW} label="Nouvelles" tone="gold" description="À attribuer" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={counts.IN_REVIEW + counts.IN_PROGRESS} label="En examen ou en traitement" tone="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={counts.RESOLVED} label="Traitées" tone="green" description={`${counts.CLOSED} clôturées`} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={open} label="Demandes ouvertes" tone="navy" description={`${counts.REJECTED} refusée${counts.REJECTED > 1 ? 's' : ''}`} />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Référence, nom, email ou organisation"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: serviceRequestStatuses.map((s) => ({ value: s, label: serviceRequestStatusLabels[s] })) },
          { name: 'service', label: 'Service', value: params.filters.service, options: services },
          { name: 'responsable', label: 'Responsable', value: params.filters.responsable, options: [{ value: 'moi', label: 'Mes demandes' }, ...handlers] },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Demandes de service"
        rowClassName={(row) => (row.status === 'NEW' ? 'bg-gold-50/40' : undefined)}
        empty={{ icon: Inbox, title: 'Aucune demande', description: params.q || params.status ? 'Aucune demande ne correspond aux filtres.' : 'Les demandes déposées depuis le catalogue des services apparaîtront ici.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'reference',
            header: 'Demande',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {row.service.name}
                </Link>
                <p className="truncate font-mono text-xs text-neutral-500">{row.reference}</p>
              </div>
            ),
          },
          {
            key: 'requester',
            header: 'Demandeur',
            cell: (row) => (
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-navy">{row.fullName}</p>
                <p className="truncate text-xs text-neutral-500">
                  {row.email}
                  {row.organization ? ` · ${row.organization}` : ''}
                </p>
              </div>
            ),
          },
          { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'sla',
            header: 'Échéance',
            hideBelow: 'lg',
            cell: (row) => {
              const sla = slaState(row.createdAt, row.service.slaDays, row.status)
              return sla ? (
                <Badge variant={sla.tone} size="sm">
                  {sla.label}
                </Badge>
              ) : (
                <span className="text-xs text-neutral-400">—</span>
              )
            },
          },
          { key: 'assignee', header: 'Responsable', hideBelow: 'md', cell: (row) => <span className="text-xs text-neutral-600">{row.assignee?.name ?? row.assignee?.email ?? 'Non attribuée'}</span> },
          {
            key: 'createdAt',
            header: 'Déposée',
            hideBelow: 'md',
            cell: (row) => (
              <span className="text-xs text-neutral-600" title={formatDate(row.createdAt)}>
                {formatRelative(row.createdAt)}
              </span>
            ),
          },
          {
            key: 'paid',
            header: 'Paiement',
            hideBelow: 'lg',
            cell: (row) =>
              row.service.isPaid ? (
                <Badge variant={row.orderId ? 'success' : 'warning'} size="sm">
                  {row.orderId ? 'Commande liée' : 'En attente'}
                </Badge>
              ) : (
                <span className="text-xs text-neutral-400">Gratuit</span>
              ),
          },
        ]}
      />
      {!abilities.manageServices ? <p className="text-xs text-neutral-500">Les demandes sont visibles par l’équipe des services et le support ; leur suppression est réservée au responsable des services.</p> : null}
    </div>
  )
}
