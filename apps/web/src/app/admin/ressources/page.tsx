import type { Metadata } from 'next'
import Link from 'next/link'
import { BookMarked, Lock, Plus } from 'lucide-react'
import { accessLevelLabels, accessLevels, contentStatusLabels, contentStatuses, resourceKindLabels, resourceKinds } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { StatusActions } from '@/components/admin/status-actions'
import { loadResources } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Ressources' }

const BASE = '/admin/ressources'

/** Bibliothèque documentaire : liste avec filtres de statut, type, niveau d'accès et catégorie. */
export default async function AdminResourcesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['type', 'acces', 'categorie'], { sort: 'updatedAt' })
  const [result, categories] = await Promise.all([loadResources(principal, params), loadCategoryOptions('resource')])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Ressources documentaires"
        description="Guides pratiques, textes juridiques, rapports, formulaires et médias mis à disposition des travailleurs et des organisations. Le niveau d’accès détermine qui peut télécharger."
        actions={
          abilities.write ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouvelle ressource
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Titre, résumé ou mot-clé"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: contentStatuses.map((s) => ({ value: s, label: contentStatusLabels[s] })) },
          { name: 'type', label: 'Type', value: params.filters.type, options: resourceKinds.map((k) => ({ value: k, label: resourceKindLabels[k] })) },
          { name: 'acces', label: 'Accès', value: params.filters.acces, options: accessLevels.map((a) => ({ value: a, label: accessLevelLabels[a] })) },
          { name: 'categorie', label: 'Catégorie', value: params.filters.categorie, options: categories, allLabel: 'Toutes' },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Ressources documentaires"
        empty={{ icon: BookMarked, title: 'Aucune ressource', description: params.q || params.status ? 'Aucune ressource ne correspond aux filtres.' : 'Déposez le premier document de la bibliothèque.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'title',
            header: 'Ressource',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {row.title}
                </Link>
                <p className="truncate text-xs text-neutral-500">
                  {resourceKindLabels[row.kind]}
                  {row.category ? ` · ${row.category.name}` : ''}
                  {row.fileName ? ` · ${row.fileName}` : row.externalUrl ? ' · lien externe' : ''}
                </p>
              </div>
            ),
          },
          {
            key: 'access',
            header: 'Accès',
            hideBelow: 'md',
            cell: (row) => (
              <Badge variant={row.accessLevel === 'PUBLIC' ? 'green' : row.accessLevel === 'PREMIUM' ? 'gold' : 'blue'} size="sm">
                {row.accessLevel !== 'PUBLIC' ? <Lock className="size-3" aria-hidden="true" /> : null}
                {accessLevelLabels[row.accessLevel]}
              </Badge>
            ),
          },
          { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          { key: 'downloads', header: 'Téléch.', hideBelow: 'lg', align: 'right', cell: (row) => <span className="tabular-nums text-xs text-neutral-600">{row.downloadCount}</span> },
          { key: 'date', header: 'Document daté', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{row.publishedOn ? formatDate(row.publishedOn) : '—'}</span> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              <StatusActions
                entity="resource"
                id={row.id}
                title={row.title}
                status={row.status}
                editHref={`${BASE}/${row.id}`}
                previewHref={`/ressources/${row.slug}?preview=1`}
                canWrite={abilities.write}
                canPublish={abilities.publish}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
