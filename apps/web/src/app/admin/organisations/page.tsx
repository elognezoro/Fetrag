import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Handshake, Plus, Users } from 'lucide-react'
import { can, formatDate } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadOrganizations, loadSectorOptions } from '@/server/admin/organizations-queries'

export const metadata: Metadata = { title: 'Organisations' }

const BASE = '/admin/organisations'

/** Organisations affiliées et partenaires : membres, demandes de formation, cohortes. */
export default async function AdminOrganizationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('organization.read', BASE)
  const abilities = adminAbilities(principal)
  const canManage = abilities.isSuperAdmin || can(principal, 'organization.manage')
  const params = readListParams(await searchParams, ['type', 'secteur'], { sort: 'name', order: 'asc' })
  const [result, sectors] = await Promise.all([loadOrganizations(params), loadSectorOptions()])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title="Organisations"
        description="Syndicats affiliés et organisations partenaires : membres rattachés, responsables habilités à déposer des demandes de formation, cohortes et contacts."
        actions={
          canManage ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouvelle`}>
                <Plus aria-hidden="true" />
                Nouvelle organisation
              </Link>
            </Button>
          ) : undefined
        }
      />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatTile value={result.counts.affiliates} label="Organisations affiliées" icon={Building2} tone="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={result.counts.partners} label="Partenaires actifs" icon={Handshake} tone="green" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={result.counts.inactive} label="Organisations inactives" icon={Users} tone="gold" description="Masquées des listes de choix" />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom, sigle, secteur ou ville"
        selects={[
          { name: 'type', label: 'Type', value: params.filters.type, options: [{ value: 'affiliee', label: 'Affiliées' }, { value: 'partenaire', label: 'Partenaires' }], allLabel: 'Toutes' },
          { name: 'secteur', label: 'Secteur', value: params.filters.secteur, options: sectors },
          { name: 'statut', label: 'Statut', value: params.status, options: [{ value: 'actif', label: 'Actives' }, { value: 'inactif', label: 'Inactives' }], allLabel: 'Toutes' },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Organisations"
        rowClassName={(row) => (row.isActive ? undefined : 'opacity-60')}
        empty={{ icon: Building2, title: 'Aucune organisation', description: params.q || params.status || Object.keys(params.filters).length ? 'Aucune organisation ne correspond aux filtres.' : 'Créez la première organisation affiliée.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'name',
            header: 'Organisation',
            cell: (row) => (
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-display text-sm font-semibold text-blue-700">{(row.acronym ?? row.name).slice(0, 2).toUpperCase()}</span>
                <div className="min-w-0">
                  <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                    {row.name}
                  </Link>
                  <p className="truncate text-xs text-neutral-500">
                    {row.acronym ? `${row.acronym} · ` : ''}
                    {row.sector ?? 'Secteur non renseigné'}
                    {row.city ? ` · ${row.city}` : ''}
                  </p>
                </div>
              </div>
            ),
          },
          { key: 'type', header: 'Type', hideBelow: 'md', cell: (row) => <Badge variant={row.isAffiliate ? 'blue' : 'outline'} size="sm">{row.isAffiliate ? 'Affiliée' : 'Partenaire'}</Badge> },
          {
            key: 'members',
            header: 'Membres',
            align: 'center',
            cell: (row) => (
              <span className="text-sm tabular-nums text-navy">
                {row._count.memberships}
                {row.memberCount ? <span className="block text-xs text-neutral-500">{row.memberCount} déclarés</span> : null}
              </span>
            ),
          },
          {
            key: 'activity',
            header: 'Formation',
            hideBelow: 'lg',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                {row._count.trainingRequests} demande{row._count.trainingRequests > 1 ? 's' : ''} · {row._count.cohorts} cohorte{row._count.cohorts > 1 ? 's' : ''}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Statut',
            hideBelow: 'sm',
            cell: (row) => (
              <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          { key: 'createdAt', header: 'Créée', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{formatDate(row.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
        ]}
      />
    </div>
  )
}
