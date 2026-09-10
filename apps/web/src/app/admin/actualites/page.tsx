import type { Metadata } from 'next'
import Link from 'next/link'
import { Newspaper, Plus, Star } from 'lucide-react'
import { contentStatusLabels, contentStatuses } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { StatusActions } from '@/components/admin/status-actions'
import { loadArticles } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Actualités' }

const BASE = '/admin/actualites'

/** Liste des actualités et communiqués avec filtres (statut, catégorie, type) et actions du workflow. */
export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['categorie', 'type'], { sort: 'updatedAt' })
  const [result, categories] = await Promise.all([loadArticles(principal, params), loadCategoryOptions('article')])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Actualités et communiqués"
        description="Informations de la fédération, prises de position officielles et retours sur les événements. Les contenus « à la une » sont mis en avant sur l’accueil."
        actions={
          abilities.write ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouvelle actualité
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Titre, extrait ou mot-clé"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: contentStatuses.map((s) => ({ value: s, label: contentStatusLabels[s] })) },
          { name: 'categorie', label: 'Catégorie', value: params.filters.categorie, options: categories, allLabel: 'Toutes' },
          { name: 'type', label: 'Type', value: params.filters.type, options: [{ value: 'communique', label: 'Communiqués' }, { value: 'une', label: 'À la une' }] },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Actualités"
        empty={{ icon: Newspaper, title: 'Aucune actualité', description: params.q || params.status ? 'Aucune actualité ne correspond aux filtres.' : 'Rédigez la première actualité de la fédération.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'title',
            header: 'Actualité',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-blue-700">
                  {row.isFeatured ? <Star className="size-4 text-gold-500" aria-label="À la une" /> : null}
                  {row.title}
                </Link>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                  {row.category ? <span>{row.category.name}</span> : null}
                  {row.isCommunique ? (
                    <Badge variant="navy" size="sm">
                      Communiqué
                    </Badge>
                  ) : null}
                  {/* Statut rappelé ici tant que sa colonne est masquée (mobile). */}
                  <StatusBadge status={row.status} size="sm" className="sm:hidden" />
                </p>
              </div>
            ),
          },
          { key: 'status', header: 'Statut', hideBelow: 'sm', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'publishedAt',
            header: 'Publication',
            hideBelow: 'md',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                {row.publishedAt ? formatDate(row.publishedAt) : row.scheduledAt ? `Planifiée ${formatDateTime(row.scheduledAt)}` : '—'}
              </span>
            ),
          },
          { key: 'views', header: 'Vues', hideBelow: 'lg', align: 'right', cell: (row) => <span className="tabular-nums text-xs text-neutral-600">{row.viewCount}</span> },
          { key: 'author', header: 'Auteur', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{row.author?.name ?? row.author?.email ?? '—'}</span> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              <StatusActions
                entity="article"
                id={row.id}
                title={row.title}
                status={row.status}
                editHref={`${BASE}/${row.id}`}
                previewHref={`/actualites/${row.slug}?preview=1`}
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
