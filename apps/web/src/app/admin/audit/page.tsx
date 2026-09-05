import type { Metadata } from 'next'
import { Download, ScrollText, ShieldCheck, Tags } from 'lucide-react'
import { formatDateTime, formatRelative } from '@fetrag/domain'
import { Badge, Button, Input, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { AuditDiff } from '@/components/admin/audit-diff'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { auditEntityLabels } from '@/server/admin/audit-queries'
import { requireAdminCan } from '@/server/admin/context'
import { auditActionLabels } from '@/server/admin/labels'
import { buildListHref, pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadAuditLog } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Journal d’audit' }

const BASE = '/admin/audit'
const auditFilterKeys = ['action', 'entite', 'acteur', 'du', 'au']

function actionLabel(action: string): string {
  return auditActionLabels[action] ?? (action === 'auth.login_failed' ? 'Échec de connexion' : action)
}

function entityLabel(entity: string): string {
  return auditEntityLabels[entity] ?? entity
}

/** Journal d'audit immuable : filtres action / entité / acteur / période, détail avant-après repliable, export CSV. */
export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminCan('audit.read', BASE)
  const params = readListParams(await searchParams, auditFilterKeys)
  const result = await loadAuditLog(params)
  const hasFilters = Boolean(params.q || Object.keys(params.filters).length)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title="Journal d’audit"
        description="Trace immuable des actions sensibles : authentification, rôles, paiements, certificats, publications, exports et paramètres. Les adresses IP sont conservées sous forme d’empreinte."
        actions={
          <Button asChild variant="outline" size="md">
            <a href={buildListHref(`${BASE}/export`, params, { page: undefined })}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </a>
          </Button>
        }
      />
      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatTile value={result.total} label={hasFilters ? 'Entrées correspondant aux filtres' : 'Entrées journalisées'} icon={ScrollText} tone="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={result.actions.length} label="Types d’action distincts" icon={ShieldCheck} tone="green" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={result.entities.length} label="Types d’entité concernés" icon={Tags} tone="gold" />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Identifiant d’entité, email de l’acteur ou corrélation"
        selects={[
          { name: 'action', label: 'Action', value: params.filters.action, options: result.actions.map((a) => ({ value: a, label: actionLabel(a) })), allLabel: 'Toutes' },
          { name: 'entite', label: 'Entité', value: params.filters.entite, options: result.entities.map((e) => ({ value: e, label: entityLabel(e) })), allLabel: 'Toutes' },
        ]}
        dateRange={{ fromName: 'du', toName: 'au', fromValue: params.filters.du, toValue: params.filters.au }}
        actions={
          <div className="flex w-full flex-col gap-1 sm:w-80">
            <label htmlFor="audit-acteur" className="text-xs font-semibold text-neutral-600">
              Acteur (email)
            </label>
            <Input id="audit-acteur" name="acteur" type="email" inputMode="email" defaultValue={params.filters.acteur ?? ''} placeholder="admin@fetrag.ga" maxLength={200} />
          </div>
        }
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Journal d’audit"
        dense
        empty={{ icon: ScrollText, title: 'Aucune entrée', description: hasFilters ? 'Aucune entrée ne correspond aux filtres.' : 'Les actions sensibles apparaîtront ici dès leur exécution.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'createdAt',
            header: 'Horodatage',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                <span className="block font-semibold text-navy" title={formatDateTime(row.createdAt)}>
                  {formatRelative(row.createdAt)}
                </span>
                {formatDateTime(row.createdAt)}
              </span>
            ),
          },
          {
            key: 'action',
            header: 'Action',
            cell: (row) => (
              <span className="text-sm">
                <span className="block font-semibold text-navy">{actionLabel(row.action)}</span>
                <span className="block font-mono text-[11px] text-neutral-500">{row.action}</span>
              </span>
            ),
          },
          {
            key: 'entity',
            header: 'Entité',
            cell: (row) => (
              <span className="text-sm">
                <Badge variant="outline" size="sm">
                  {entityLabel(row.entityType)}
                </Badge>
                {row.entityId ? (
                  <span className="mt-1 block max-w-[12rem] truncate font-mono text-[11px] text-neutral-500" title={row.entityId}>
                    {row.entityId}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            key: 'actor',
            header: 'Acteur',
            hideBelow: 'md',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                <span className="block truncate font-semibold text-navy">{row.actorEmail ?? 'Système'}</span>
                {row.ipHash ? <span className="block font-mono text-[11px]">IP {row.ipHash.slice(0, 12)}…</span> : null}
              </span>
            ),
          },
          { key: 'diff', header: 'Détail', cell: (row) => <AuditDiff before={row.before} after={row.after} id={row.id} /> },
          {
            key: 'correlation',
            header: 'Corrélation',
            hideBelow: 'lg',
            cell: (row) => (row.correlationId ? <span className="font-mono text-[11px] text-neutral-500">{row.correlationId.slice(0, 16)}</span> : <span className="text-xs text-neutral-400">—</span>),
          },
        ]}
      />
    </div>
  )
}
