import type { Metadata } from 'next'
import { HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge, Button } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { FaqFormDialog } from '@/components/admin/faq-form'
import { FilterBar } from '@/components/admin/filter-bar'
import { deleteContentAction } from '@/server/admin/content-actions'
import { loadFaq } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Questions fréquentes' }

const BASE = '/admin/faq'

/** Questions fréquentes affichées sur la page /faq et dans les blocs de pages. */
export default async function AdminFaqPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['theme'])
  const { list, groups } = await loadFaq(principal, params)
  const groupNames = groups.map((g) => g.group)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Questions fréquentes"
        description="Réponses aux questions des travailleurs et des organisations : adhésion, formation, services, plateforme. Regroupées par thème et ordonnées."
        actions={abilities.write ? <FaqFormDialog groups={groupNames} trigger={<Button type="button" variant="primary" size="md" leftIcon={<Plus aria-hidden="true" />}>Nouvelle question</Button>} /> : undefined}
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Question ou réponse"
        selects={[
          { name: 'theme', label: 'Thème', value: params.filters.theme, options: groups.map((g) => ({ value: g.group, label: `${g.group} (${g.count})` })) },
          { name: 'statut', label: 'Visibilité', value: params.status, options: [{ value: 'actif', label: 'Visibles' }, { value: 'inactif', label: 'Masquées' }], allLabel: 'Toutes' },
        ]}
      />
      <DataTable
        rows={list.items}
        rowKey={(row) => row.id}
        caption="Questions fréquentes"
        empty={{ icon: HelpCircle, title: 'Aucune question', description: 'Ajoutez les questions les plus posées à la fédération.' }}
        pagination={{ page: list.page, totalPages: list.totalPages, total: list.total, pageSize: list.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'question',
            header: 'Question',
            cell: (row) => (
              <div className="min-w-0">
                <p className="font-semibold text-navy">{row.question}</p>
                <p className="line-clamp-2 text-xs text-neutral-500">{row.answer.replace(/<[^>]+>/g, ' ').trim()}</p>
              </div>
            ),
          },
          { key: 'group', header: 'Thème', hideBelow: 'md', cell: (row) => <Badge variant="outline" size="sm">{row.group}</Badge> },
          { key: 'position', header: 'Ordre', hideBelow: 'lg', align: 'center', cell: (row) => <span className="font-mono text-xs text-neutral-500">{row.position}</span> },
          {
            key: 'active',
            header: 'Visibilité',
            cell: (row) => (
              <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
                {row.isActive ? 'Visible' : 'Masquée'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) =>
              abilities.write ? (
                <div className="flex items-center justify-end gap-1">
                  <FaqFormDialog
                    groups={groupNames}
                    item={{ id: row.id, question: row.question, answer: row.answer, group: row.group, position: row.position, isActive: row.isActive }}
                    trigger={
                      <Button type="button" variant="ghost" size="sm" leftIcon={<Pencil aria-hidden="true" />}>
                        Modifier
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                        Supprimer
                      </Button>
                    }
                    title="Supprimer cette question ?"
                    description={row.question}
                    confirmLabel="Supprimer"
                    destructive
                    onConfirm={deleteContentAction.bind(null, 'faq', row.id)}
                  />
                </div>
              ) : null,
          },
        ]}
      />
    </div>
  )
}
