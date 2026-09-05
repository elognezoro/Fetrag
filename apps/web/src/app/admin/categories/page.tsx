import type { Metadata } from 'next'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { Badge, Button } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { CategoryFormDialog, categoryKindLabels } from '@/components/admin/category-form'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { deleteContentAction } from '@/server/admin/content-actions'
import { loadCategories } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminAny } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Catégories' }

const BASE = '/admin/categories'

/** Catégories transverses (actualités, ressources, formations, services, événements). */
export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminAny(['cms.read_drafts', 'services.manage'], BASE)
  const abilities = adminAbilities(principal)
  const canEdit = abilities.readDrafts
  const params = readListParams(await searchParams, ['domaine'])
  const result = await loadCategories(principal, params)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Catégories"
        description="Classement des actualités, ressources, formations, services et événements. Une catégorie utilisée ne peut pas être supprimée."
        actions={canEdit ? <CategoryFormDialog defaultKind={params.filters.domaine ?? 'article'} trigger={<Button type="button" variant="primary" size="md" leftIcon={<Plus aria-hidden="true" />}>Nouvelle catégorie</Button>} /> : undefined}
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom ou slug"
        selects={[{ name: 'domaine', label: 'Domaine', value: params.filters.domaine, options: Object.entries(categoryKindLabels).map(([value, label]) => ({ value, label })) }]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Catégories"
        empty={{ icon: Tags, title: 'Aucune catégorie', description: 'Créez des catégories pour structurer les contenus du site.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'name',
            header: 'Catégorie',
            cell: (row) => (
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: row.color ?? '#0259C7' }} />
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{row.name}</p>
                  <p className="truncate font-mono text-xs text-neutral-500">{row.slug}</p>
                </div>
              </div>
            ),
          },
          { key: 'kind', header: 'Domaine', hideBelow: 'md', cell: (row) => <Badge variant="outline" size="sm">{categoryKindLabels[row.kind] ?? row.kind}</Badge> },
          {
            key: 'usage',
            header: 'Utilisations',
            hideBelow: 'md',
            cell: (row) => {
              const total = row.counts.articles + row.counts.resources + row.counts.courses + row.counts.services + row.counts.events
              return <span className="tabular-nums text-neutral-700">{total}</span>
            },
          },
          { key: 'position', header: 'Ordre', hideBelow: 'lg', align: 'center', cell: (row) => <span className="font-mono text-xs text-neutral-500">{row.position}</span> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) =>
              canEdit ? (
                <div className="flex items-center justify-end gap-1">
                  <CategoryFormDialog
                    category={{ id: row.id, name: row.name, slug: row.slug, description: row.description, color: row.color, kind: row.kind, position: row.position }}
                    trigger={
                      <Button type="button" variant="ghost" size="sm" leftIcon={<Pencil aria-hidden="true" />}>
                        Modifier
                      </Button>
                    }
                  />
                  {abilities.write ? (
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                          Supprimer
                        </Button>
                      }
                      title={`Supprimer « ${row.name} » ?`}
                      description="La suppression est refusée si des contenus utilisent encore cette catégorie."
                      confirmLabel="Supprimer"
                      destructive
                      onConfirm={deleteContentAction.bind(null, 'category', row.id)}
                    />
                  ) : null}
                </div>
              ) : null,
          },
        ]}
      />
    </div>
  )
}
