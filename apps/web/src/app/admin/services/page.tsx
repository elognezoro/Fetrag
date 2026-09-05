import type { Metadata } from 'next'
import Link from 'next/link'
import { LifeBuoy, Plus } from 'lucide-react'
import { contentStatusLabels, contentStatuses } from '@fetrag/contracts'
import { formatMoney } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { StatusActions } from '@/components/admin/status-actions'
import { loadServices } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminAny } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Catalogue des services' }

const BASE = '/admin/services'

/** Catalogue des services proposés aux travailleurs et aux organisations (assistance juridique, médiation, accompagnement...). */
export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminAny(['services.manage', 'cms.read_drafts'], BASE)
  const abilities = adminAbilities(principal)
  const canWrite = abilities.manageServices
  const canPublish = abilities.manageServices || abilities.publish
  const params = readListParams(await searchParams, ['categorie', 'tarif'], { sort: 'position', order: 'asc' })
  const [result, categories] = await Promise.all([loadServices(principal, params), loadCategoryOptions('service')])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Services"
        title="Catalogue des services"
        description="Services rendus par la FETRAG : assistance juridique, médiation sociale, accompagnement à la création de sections, formation à la demande. Chaque service définit son formulaire de demande et son éventuel tarif."
        actions={
          canWrite ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouveau service
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom ou résumé"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: contentStatuses.map((s) => ({ value: s, label: contentStatusLabels[s] })) },
          { name: 'categorie', label: 'Catégorie', value: params.filters.categorie, options: categories, allLabel: 'Toutes' },
          { name: 'tarif', label: 'Tarif', value: params.filters.tarif, options: [{ value: 'gratuit', label: 'Gratuits' }, { value: 'payant', label: 'Payants' }] },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Services"
        empty={{ icon: LifeBuoy, title: 'Aucun service', description: params.q || params.status ? 'Aucun service ne correspond aux filtres.' : 'Décrivez le premier service proposé par la fédération.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'name',
            header: 'Service',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {row.name}
                </Link>
                <p className="truncate text-xs text-neutral-500">
                  {row.category?.name ?? 'Sans catégorie'}
                  {row.slaDays ? ` · délai ${row.slaDays} j` : ''}
                  {row.requiresAccount ? '' : ' · sans compte'}
                </p>
              </div>
            ),
          },
          {
            key: 'price',
            header: 'Tarif',
            hideBelow: 'md',
            cell: (row) =>
              row.isPaid ? (
                <Badge variant="gold" size="sm">
                  {formatMoney(row.priceAmount ?? 0, row.currency)}
                </Badge>
              ) : (
                <Badge variant="green" size="sm">
                  Gratuit
                </Badge>
              ),
          },
          { key: 'requests', header: 'Demandes', hideBelow: 'lg', align: 'center', cell: (row) => <span className="tabular-nums text-neutral-700">{row._count.requests}</span> },
          { key: 'position', header: 'Ordre', hideBelow: 'lg', align: 'center', cell: (row) => <span className="font-mono text-xs text-neutral-500">{row.position}</span> },
          { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              <StatusActions
                entity="service"
                id={row.id}
                title={row.name}
                status={row.status}
                editHref={`${BASE}/${row.id}`}
                previewHref={`/services/${row.slug}?preview=1`}
                canWrite={canWrite}
                canPublish={canPublish}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
