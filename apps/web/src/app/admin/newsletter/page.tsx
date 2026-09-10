import type { Metadata } from 'next'
import { Download, Send, Trash2 } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { adminAbilities, requireAdminAny } from '@/server/admin/context'
import { deleteSubscriptionAction } from '@/server/admin/forms-actions'
import { buildListHref, pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadNewsletter } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Newsletter' }

const BASE = '/admin/newsletter'

const stateLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  confirmed: { label: 'Confirmé', variant: 'success' },
  pending: { label: 'En attente de confirmation', variant: 'warning' },
  unsubscribed: { label: 'Désinscrit', variant: 'neutral' },
}

/** Abonnés à la lettre d'information : états (double opt-in), export des consentements, effacement. */
export default async function AdminNewsletterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminAny(['forms.read', 'reports.read'], BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, [])
  const { list, stats } = await loadNewsletter(principal, params)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Lettre d’information"
        description="Abonnés avec confirmation en deux temps (double opt-in). L’export CSV des consentements horodatés sert de preuve ; la suppression répond au droit à l’effacement."
        actions={
          <Button asChild variant="outline" size="md">
            <a href={buildListHref(`${BASE}/export`, params)}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </a>
          </Button>
        }
      />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatTile value={stats.confirmed} label="Abonnés confirmés" icon={Send} tone="green" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={stats.pending} label="En attente de confirmation" tone="gold" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={stats.unsubscribed} label="Désinscrits" tone="navy" />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Adresse email"
        selects={[{ name: 'statut', label: 'État', value: params.status, options: Object.entries(stateLabels).map(([value, meta]) => ({ value, label: meta.label })) }]}
      />
      <DataTable
        rows={list.items}
        rowKey={(row) => row.id}
        caption="Abonnés à la lettre d’information"
        empty={{ icon: Send, title: 'Aucun abonné', description: 'Les inscriptions depuis le pied de page et le formulaire de contact apparaîtront ici.' }}
        pagination={{ page: list.page, totalPages: list.totalPages, total: list.total, pageSize: list.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          { key: 'email', header: 'Email', cell: (row) => <span className="break-all font-semibold text-navy">{row.email}</span> },
          {
            key: 'state',
            header: 'État',
            cell: (row) => {
              const meta = stateLabels[row.state] ?? { label: row.state, variant: 'neutral' as const }
              return (
                <Badge variant={meta.variant} size="sm" dot>
                  {meta.label}
                </Badge>
              )
            },
          },
          { key: 'createdAt', header: 'Inscrit le', hideBelow: 'md', cell: (row) => <span className="text-xs text-neutral-600">{formatDateTime(row.createdAt)}</span> },
          { key: 'confirmedAt', header: 'Confirmé le', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{row.confirmedAt ? formatDateTime(row.confirmedAt) : '—'}</span> },
          { key: 'source', header: 'Origine', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{row.source ?? '—'}</span> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) =>
              abilities.readForms ? (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                      Supprimer
                    </Button>
                  }
                  title={`Supprimer ${row.email} ?`}
                  description="L’adresse et son historique de consentement sont effacés définitivement."
                  confirmLabel="Supprimer"
                  destructive
                  onConfirm={deleteSubscriptionAction.bind(null, row.id)}
                />
              ) : null,
          },
        ]}
      />
    </div>
  )
}
