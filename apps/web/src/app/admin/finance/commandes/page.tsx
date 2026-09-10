import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, ShoppingBag } from 'lucide-react'
import { orderStatusLabels, orderStatuses, paymentMethodLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatMoney, formatRelative } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { FinanceSubnav } from '@/components/admin/finance-subnav'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, toDate, type SearchParams } from '@/server/admin/list-params'
import { loadOrders, loadOrganizationOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Commandes' }

const BASE = '/admin/finance/commandes'

function clientName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

function methodLabel(method: string): string {
  return paymentMethodLabels[method as keyof typeof paymentMethodLabels] ?? method
}

/** Lien d'export CSV des commandes limité à la période filtrée. */
function exportHref(du?: string, au?: string): string {
  const search = new URLSearchParams({ type: 'commandes' })
  if (du) search.set('du', du)
  if (au) search.set('au', au)
  return `/admin/finance/exports?${search.toString()}`
}

/** Liste paginée des commandes : référence, client, montant, statut, moyen de paiement, date ; filtres statut / période / organisation / recherche. */
export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('finance.read', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['du', 'au', 'organisation', 'utilisateur'], { sort: 'createdAt' })
  // La borne de fin couvre toute la journée choisie (le filtre brut s'arrêterait à minuit).
  const auInclusive = toDate(params.filters.au, true)?.toISOString()
  const queryParams = { ...params, filters: { ...params.filters, ...(auInclusive ? { au: auInclusive } : {}) } }
  const [result, organizations] = await Promise.all([loadOrders(principal, queryParams), loadOrganizationOptions()])
  const hasFilters = Boolean(params.q || params.status || Object.keys(params.filters).length)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Finance"
        title="Commandes"
        description="Formations, événements, services et ressources réglés en ligne. Ouvrez une commande pour consulter ses paiements, émettre un reçu ou procéder à un remboursement."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Finance', href: '/admin/finance' }, { label: 'Commandes' }]}
        actions={
          abilities.exportFinance ? (
            <Button asChild variant="outline" size="md">
              <a href={exportHref(params.filters.du, params.filters.au)}>
                <Download aria-hidden="true" />
                Exporter (CSV)
              </a>
            </Button>
          ) : undefined
        }
      />
      <FinanceSubnav current={BASE} />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Référence, email du client ou libellé"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: orderStatuses.map((s) => ({ value: s, label: orderStatusLabels[s] })) },
          { name: 'organisation', label: 'Organisation', value: params.filters.organisation, options: organizations, allLabel: 'Toutes' },
        ]}
        dateRange={{ fromName: 'du', toName: 'au', fromValue: params.filters.du, toValue: params.filters.au, label: 'Période de création' }}
        hidden={{ utilisateur: params.filters.utilisateur, tri: params.sort, ordre: params.order === 'asc' ? 'asc' : undefined }}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Commandes"
        rowClassName={(row) => (row.status === 'PENDING' ? 'bg-gold-50/40' : undefined)}
        empty={{ icon: ShoppingBag, title: 'Aucune commande', description: hasFilters ? 'Aucune commande ne correspond aux filtres.' : 'Les commandes passées depuis le site et la plateforme de formation apparaîtront ici.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'reference',
            header: 'Commande',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-mono text-sm font-semibold text-navy hover:text-blue-700">
                  {row.reference}
                </Link>
                <p className="line-clamp-1 text-xs text-neutral-500">
                  {row.lines[0]?.label ?? 'Sans ligne'}
                  {row.lines.length > 1 ? ` +${row.lines.length - 1}` : ''}
                </p>
                {/* Client et statut rappelés ici tant que leurs colonnes sont masquées (mobile). */}
                <p className="line-clamp-1 text-xs text-neutral-600 sm:hidden">{clientName(row.user)}</p>
                <StatusBadge status={row.status} size="sm" className="mt-1 sm:hidden" />
              </div>
            ),
          },
          {
            key: 'client',
            header: 'Client',
            hideBelow: 'sm',
            cell: (row) => (
              <div className="min-w-0 text-sm">
                {abilities.readUsers ? (
                  <Link href={`/admin/utilisateurs/${row.user.id}`} className="line-clamp-1 font-semibold text-navy hover:text-blue-700">
                    {clientName(row.user)}
                  </Link>
                ) : (
                  <p className="line-clamp-1 font-semibold text-navy">{clientName(row.user)}</p>
                )}
                <p className="line-clamp-1 break-all text-xs text-neutral-500">
                  {row.user.email}
                  {row.organization ? ` · ${row.organization.name}` : ''}
                </p>
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Montant',
            align: 'right',
            cell: (row) => (
              <span className="text-sm font-semibold tabular-nums text-navy">
                {formatMoney(row.totalAmount, row.currency)}
                {row.discountAmount > 0 ? <span className="block text-xs font-normal text-green-700">remise {formatMoney(row.discountAmount, row.currency)}</span> : null}
              </span>
            ),
          },
          { key: 'status', header: 'Statut', hideBelow: 'sm', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'payment',
            header: 'Paiement',
            hideBelow: 'md',
            cell: (row) => {
              const payment = row.payments[0]
              return payment ? (
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" size="sm">
                    {methodLabel(payment.method)}
                  </Badge>
                  <span className="line-clamp-1 break-all text-xs text-neutral-500">
                    {payment.provider}
                    {payment.providerRef ? ` · ${payment.providerRef}` : ''}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-neutral-400">Aucun paiement</span>
              )
            },
          },
          {
            key: 'createdAt',
            header: 'Date',
            hideBelow: 'lg',
            cell: (row) => (
              <span className="text-xs text-neutral-600" title={formatDateTime(row.createdAt)}>
                {formatRelative(row.createdAt)}
                {row.paidAt ? <span className="block">Payée le {formatDate(row.paidAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span> : null}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
