import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'
import { contentStatusLabels, contentStatuses } from '@fetrag/contracts'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { StatusActions } from '@/components/admin/status-actions'
import { loadPages } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Pages' }

const BASE = '/admin/pages'

/** Liste des pages institutionnelles avec recherche, filtre de statut et actions du workflow. */
export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, [], { sort: 'updatedAt' })
  const result = await loadPages(principal, params)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Pages"
        description="Pages institutionnelles du site : présentation de la fédération, mentions légales, pages d’atterrissage. Chaque enregistrement crée une version restaurable."
        actions={
          abilities.write ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouvelle page
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Titre ou slug"
        selects={[{ name: 'statut', label: 'Statut', value: params.status, options: contentStatuses.map((s) => ({ value: s, label: contentStatusLabels[s] })) }]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Pages du site"
        empty={{ icon: FileText, title: 'Aucune page', description: params.q || params.status ? 'Aucune page ne correspond aux filtres.' : 'Créez la première page institutionnelle.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'title',
            header: 'Page',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {row.title}
                </Link>
                <p className="line-clamp-1 break-all font-mono text-xs text-neutral-500">/{row.slug}</p>
                {/* Statut rappelé ici tant que sa colonne est masquée (mobile). */}
                <StatusBadge status={row.status} size="sm" className="mt-1 sm:hidden" />
              </div>
            ),
          },
          { key: 'template', header: 'Gabarit', hideBelow: 'md', cell: (row) => <Badge variant="outline" size="sm">{row.template}</Badge> },
          { key: 'status', header: 'Statut', hideBelow: 'sm', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          { key: 'version', header: 'Version', hideBelow: 'lg', align: 'center', cell: (row) => <span className="font-mono text-xs">v{row.version}</span> },
          {
            key: 'updatedAt',
            header: 'Modifiée',
            hideBelow: 'md',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                {formatDateTime(row.updatedAt)}
                {row.author ? <span className="block truncate">{row.author.name ?? row.author.email}</span> : null}
              </span>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              <StatusActions
                entity="page"
                id={row.id}
                title={row.title}
                status={row.status}
                editHref={`${BASE}/${row.id}`}
                previewHref={`/${row.slug}?preview=1`}
                canWrite={abilities.write}
                canPublish={abilities.publish}
                supportsScheduling
              />
            ),
          },
        ]}
      />
    </div>
  )
}
