import type { Metadata } from 'next'
import Link from 'next/link'
import { Handshake, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge, Button } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { partnerKindLabels } from '@/components/admin/partner-form'
import { deleteContentAction } from '@/server/admin/content-actions'
import { loadPartners } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Partenaires et organisations' }

const BASE = '/admin/partenaires'
const kinds = ['AFFILIATE', 'PARTNER', 'INSTITUTION', 'INTERNATIONAL'] as const

/** Organisations affiliées, partenaires, institutions et partenaires internationaux affichés sur le site. */
export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['type'])
  const result = await loadPartners(principal, params)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Partenaires et organisations"
        description="Organisations syndicales affiliées, partenaires institutionnels, financiers et internationaux. Les logos défilent dans le bandeau des partenaires et alimentent la page des organisations."
        actions={
          abilities.write ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouveau partenaire
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom, sigle ou secteur"
        selects={[
          { name: 'type', label: 'Type', value: params.filters.type, options: kinds.map((k) => ({ value: k, label: partnerKindLabels[k] })) },
          { name: 'statut', label: 'Visibilité', value: params.status, options: [{ value: 'actif', label: 'Visibles' }, { value: 'inactif', label: 'Masqués' }], allLabel: 'Toutes' },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Partenaires et organisations"
        empty={{ icon: Handshake, title: 'Aucun partenaire', description: 'Ajoutez les organisations affiliées et les partenaires de la fédération.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'name',
            header: 'Organisation',
            cell: (row) => (
              <div className="flex items-center gap-3">
                {row.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.logoUrl} alt="" className="size-10 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-1" />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-display text-sm font-semibold text-blue-700">{(row.acronym ?? row.name).slice(0, 2).toUpperCase()}</span>
                )}
                <div className="min-w-0">
                  <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                    {row.name}
                  </Link>
                  <p className="line-clamp-1 text-xs text-neutral-500">
                    {row.acronym ? `${row.acronym} · ` : ''}
                    {row.sector ?? partnerKindLabels[row.kind]}
                    {row.city ? ` · ${row.city}` : ''}
                  </p>
                  {/* Visibilité rappelée ici tant que sa colonne est masquée (mobile). */}
                  <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot className="mt-1 sm:hidden">
                    {row.isActive ? 'Visible' : 'Masqué'}
                  </Badge>
                </div>
              </div>
            ),
          },
          { key: 'kind', header: 'Type', hideBelow: 'md', cell: (row) => <Badge variant={row.kind === 'AFFILIATE' ? 'blue' : row.kind === 'INTERNATIONAL' ? 'gold' : 'outline'} size="sm">{partnerKindLabels[row.kind]}</Badge> },
          { key: 'position', header: 'Ordre', hideBelow: 'lg', align: 'center', cell: (row) => <span className="font-mono text-xs text-neutral-500">{row.position}</span> },
          {
            key: 'active',
            header: 'Visibilité',
            hideBelow: 'sm',
            cell: (row) => (
              <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
                {row.isActive ? 'Visible' : 'Masqué'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              // Mobile : boutons empilés (icône + libellé) ; à partir de `sm` : rangée.
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${BASE}/${row.id}`}>
                    <Pencil aria-hidden="true" />
                    Modifier
                  </Link>
                </Button>
                {abilities.write ? (
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                        Supprimer
                      </Button>
                    }
                    title={`Supprimer « ${row.name} » ?`}
                    description="Le partenaire disparaît du site ; préférez le masquer si la relation est suspendue."
                    confirmLabel="Supprimer"
                    destructive
                    onConfirm={deleteContentAction.bind(null, 'partner', row.id)}
                  />
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
