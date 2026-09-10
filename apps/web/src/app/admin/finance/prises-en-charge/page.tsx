import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarX2, HandHeart, Trash2 } from 'lucide-react'
import { formatDate, formatDateTime, formatRelative } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { FinanceSubnav } from '@/components/admin/finance-subnav'
import { SponsorshipDialog } from '@/components/admin/sponsorship-form'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { loadSponsorshipOptions, loadSponsorships } from '@/server/admin/finance-queries'
import { deleteSponsorshipAction, expireSponsorshipAction } from '@/server/admin/finance-sponsorship-actions'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadOrganizationOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Prises en charge' }

const BASE = '/admin/finance/prises-en-charge'

function beneficiaryName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

/** Prises en charge (bourses, financements par une organisation) : liste, création, clôture et suppression. */
export default async function AdminSponsorshipsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('finance.read', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['organisation'])
  const [result, options, organizations] = await Promise.all([loadSponsorships(params), abilities.refund ? loadSponsorshipOptions() : null, loadOrganizationOptions()])
  const now = Date.now()
  const hasFilters = Boolean(params.q || params.status || Object.keys(params.filters).length)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Finance"
        title="Prises en charge"
        description="Pourcentage du montant pris en charge par la fédération ou une organisation pour un bénéficiaire, sur une formation, un événement ou l’ensemble de l’offre. Appliqué automatiquement au paiement."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Finance', href: '/admin/finance' }, { label: 'Prises en charge' }]}
        actions={options ? <SponsorshipDialog organizations={options.organizations} courses={options.courses} events={options.events} /> : undefined}
      />
      <FinanceSubnav current={BASE} />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StaggerItem>
          <StatTile value={result.active} label="Prises en charge en cours de validité" icon={HandHeart} tone="green" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={result.total} label={hasFilters ? 'Prises en charge correspondant aux filtres' : 'Prises en charge accordées'} tone="blue" />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Bénéficiaire, libellé ou organisation"
        selects={[
          { name: 'statut', label: 'Validité', value: params.status, options: [{ value: 'valide', label: 'En cours' }, { value: 'expire', label: 'Expirées' }], allLabel: 'Toutes' },
          { name: 'organisation', label: 'Organisation', value: params.filters.organisation, options: organizations, allLabel: 'Toutes' },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Prises en charge"
        rowClassName={(row) => (row.validUntil && row.validUntil.getTime() < now ? 'opacity-60' : undefined)}
        empty={{ icon: HandHeart, title: 'Aucune prise en charge', description: hasFilters ? 'Aucune prise en charge ne correspond aux filtres.' : 'Accordez une prise en charge à un bénéficiaire identifié par son adresse email.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'beneficiary',
            header: 'Bénéficiaire',
            cell: (row) => (
              <div className="min-w-0">
                {abilities.readUsers ? (
                  <Link href={`/admin/utilisateurs/${row.beneficiary.id}`} className="font-semibold text-navy hover:text-blue-700">
                    {beneficiaryName(row.beneficiary)}
                  </Link>
                ) : (
                  <span className="font-semibold text-navy">{beneficiaryName(row.beneficiary)}</span>
                )}
                <p className="truncate text-xs text-neutral-500">{row.beneficiary.email}</p>
              </div>
            ),
          },
          {
            key: 'label',
            header: 'Prise en charge',
            cell: (row) => (
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-navy">{row.label}</p>
                <p className="truncate text-xs text-neutral-500">{row.target ?? 'Toute l’offre'}</p>
              </div>
            ),
          },
          {
            key: 'percent',
            header: 'Taux',
            align: 'center',
            cell: (row) => (
              <Badge variant={row.percent === 100 ? 'gold' : 'green'} size="sm">
                {row.percent} %
              </Badge>
            ),
          },
          {
            key: 'organization',
            header: 'Financeur',
            hideBelow: 'md',
            cell: (row) =>
              row.organization ? (
                <Link href={`/admin/organisations/${row.organization.id}`} className="text-sm text-navy hover:text-blue-700">
                  {row.organization.acronym ?? row.organization.name}
                </Link>
              ) : (
                <span className="text-xs text-neutral-500">Fédération</span>
              ),
          },
          {
            key: 'validity',
            header: 'Validité',
            hideBelow: 'sm',
            cell: (row) => {
              const expired = Boolean(row.validUntil && row.validUntil.getTime() < now)
              return row.validUntil ? (
                <Badge variant={expired ? 'danger' : 'warning'} size="sm">
                  {expired ? 'Expirée le ' : 'Jusqu’au '}
                  {formatDate(row.validUntil, { day: '2-digit', month: 'short', year: 'numeric' })}
                </Badge>
              ) : (
                <Badge variant="success" size="sm" dot>
                  Sans limite
                </Badge>
              )
            },
          },
          {
            key: 'usage',
            header: 'Utilisations',
            align: 'center',
            hideBelow: 'lg',
            cell: (row) => <span className="text-sm tabular-nums text-navy">{row._count.orders}</span>,
          },
          {
            key: 'granted',
            header: 'Accordée',
            hideBelow: 'lg',
            cell: (row) => (
              <span className="text-xs text-neutral-600" title={formatDateTime(row.createdAt)}>
                {formatRelative(row.createdAt)}
                {row.grantedBy ? <span className="block truncate">{row.grantedBy.name ?? row.grantedBy.email}</span> : null}
              </span>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => {
              if (!abilities.refund) return null
              const expired = Boolean(row.validUntil && row.validUntil.getTime() < now)
              if (row._count.orders === 0) {
                return (
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                        Supprimer
                      </Button>
                    }
                    title={`Supprimer la prise en charge « ${row.label} » ?`}
                    description="Elle n’a été appliquée à aucune commande ; le bénéficiaire n’en profitera plus. L’opération est journalisée."
                    confirmLabel="Supprimer"
                    destructive
                    onConfirm={deleteSponsorshipAction.bind(null, row.id)}
                  />
                )
              }
              return expired ? (
                <span className="text-xs text-neutral-400">Clôturée</span>
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm" leftIcon={<CalendarX2 aria-hidden="true" />}>
                      Clôturer
                    </Button>
                  }
                  title={`Clôturer la prise en charge « ${row.label} » ?`}
                  description="Déjà utilisée sur au moins une commande, elle ne peut pas être supprimée : sa validité est ramenée à maintenant."
                  confirmLabel="Clôturer"
                  destructive
                  onConfirm={expireSponsorshipAction.bind(null, row.id)}
                />
              )
            },
          },
        ]}
      />
    </div>
  )
}
