import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Plus, Star } from 'lucide-react'
import { contentStatusLabels, contentStatuses, eventKindLabels, eventKinds, sessionModeLabels } from '@fetrag/contracts'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { StatusActions } from '@/components/admin/status-actions'
import { loadEvents } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Événements' }

const BASE = '/admin/evenements'

/** Agenda : événements, master class, webinaires et assemblées avec inscriptions. */
export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.read_drafts', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['type', 'du', 'au'], { sort: 'startsAt' })
  const result = await loadEvents(principal, params)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Événements"
        description="Agenda de la fédération : master class, webinaires, assemblées et formations ponctuelles. Les inscriptions et la liste d’attente sont gérées automatiquement selon la capacité."
        actions={
          abilities.write ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <Plus aria-hidden="true" />
                Nouvel événement
              </Link>
            </Button>
          ) : undefined
        }
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Titre, lieu ou intervenant"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: contentStatuses.map((s) => ({ value: s, label: contentStatusLabels[s] })) },
          { name: 'type', label: 'Type', value: params.filters.type, options: eventKinds.map((k) => ({ value: k, label: eventKindLabels[k] })) },
        ]}
        dateRange={{ fromName: 'du', toName: 'au', fromValue: params.filters.du, toValue: params.filters.au }}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Événements"
        empty={{ icon: CalendarDays, title: 'Aucun événement', description: params.q || params.status ? 'Aucun événement ne correspond aux filtres.' : 'Programmez la première master class ou assemblée.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'title',
            header: 'Événement',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-blue-700">
                  {row.isFeatured ? <Star className="size-4 text-gold-500" aria-label="Mis en avant" /> : null}
                  {row.title}
                </Link>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                  <Badge variant="outline" size="sm">
                    {eventKindLabels[row.kind]}
                  </Badge>
                  {row.speakerName ? <span>{row.speakerName}</span> : null}
                </p>
              </div>
            ),
          },
          {
            key: 'date',
            header: 'Date et lieu',
            cell: (row) => (
              <span className="text-xs text-neutral-600">
                <span className="block font-semibold text-navy">{formatDateTime(row.startsAt)}</span>
                {sessionModeLabels[row.mode]}
                {row.city ? ` · ${row.city}` : ''}
                {row.isPast ? <Badge variant="neutral" size="sm" className="ml-1.5">Passé</Badge> : null}
              </span>
            ),
          },
          {
            key: 'registrations',
            header: 'Inscrits',
            hideBelow: 'md',
            align: 'center',
            cell: (row) => (
              <span className={row.isFull ? 'font-semibold text-gold-700' : 'text-neutral-700'}>
                {row.registeredCount}
                {row.capacity ? ` / ${row.capacity}` : ''}
              </span>
            ),
          },
          { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (row) => (
              <StatusActions
                entity="event"
                id={row.id}
                title={row.title}
                status={row.status}
                editHref={`${BASE}/${row.id}`}
                previewHref={`/evenements/${row.slug}?preview=1`}
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
