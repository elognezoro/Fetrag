import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Mail } from 'lucide-react'
import { forms, formSubmissionStatusLabels, formSubmissionStatuses } from '@fetrag/cms'
import { formKindLabels, formKinds } from '@fetrag/contracts'
import { formatDate, formatRelative } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { loadMessages } from '@/server/admin/content-queries'
import { requireAdminCan } from '@/server/admin/context'
import { buildListHref, pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadHandlerOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Messages reçus' }

const BASE = '/admin/messages'

/** Boîte de réception des formulaires publics (contact, adhésion, partenariat, assistance). */
export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('forms.read', BASE)
  const params = readListParams(await searchParams, ['type', 'responsable'])
  const [result, counts, handlers] = await Promise.all([loadMessages(principal, params), forms.countByStatus(principal), loadHandlerOptions()])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Messages reçus"
        description="Formulaires transmis depuis le site : contact, demandes d’adhésion ou d’information, propositions de partenariat, assistance. Chaque message reçoit une référence et un accusé de réception."
        actions={
          <Button asChild variant="outline" size="md">
            <a href={buildListHref(`${BASE}/export`, params)}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </a>
          </Button>
        }
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatTile value={counts.NEW} label="Nouveaux" tone="gold" description="À lire" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={counts.ASSIGNED} label="Attribués" tone="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={counts.ANSWERED} label="Répondus" tone="green" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={counts.CLOSED} label="Clôturés" tone="navy" description={counts.SPAM > 0 ? `${counts.SPAM} indésirable${counts.SPAM > 1 ? 's' : ''}` : undefined} />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Référence, nom, email, objet ou texte"
        selects={[
          { name: 'statut', label: 'Statut', value: params.status, options: formSubmissionStatuses.map((s) => ({ value: s, label: formSubmissionStatusLabels[s] })) },
          { name: 'type', label: 'Type', value: params.filters.type, options: formKinds.map((k) => ({ value: k, label: formKindLabels[k] })) },
          { name: 'responsable', label: 'Responsable', value: params.filters.responsable, options: handlers },
        ]}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Messages reçus"
        rowClassName={(row) => (row.status === 'NEW' ? 'bg-gold-50/40 font-medium' : undefined)}
        empty={{ icon: Mail, title: 'Aucun message', description: params.q || params.status ? 'Aucun message ne correspond aux filtres.' : 'Les formulaires envoyés depuis le site apparaîtront ici.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'subject',
            header: 'Message',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {row.subject || formKindLabels[row.kind]}
                </Link>
                <p className="line-clamp-1 text-xs text-neutral-500">{row.message}</p>
              </div>
            ),
          },
          { key: 'kind', header: 'Type', hideBelow: 'md', cell: (row) => <Badge variant="outline" size="sm">{formKindLabels[row.kind]}</Badge> },
          {
            key: 'sender',
            header: 'Expéditeur',
            cell: (row) => (
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold text-navy">{row.fullName}</p>
                <p className="truncate text-xs text-neutral-500">{row.email}</p>
              </div>
            ),
          },
          { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
          {
            key: 'createdAt',
            header: 'Reçu',
            hideBelow: 'md',
            cell: (row) => (
              <span className="text-xs text-neutral-600" title={formatDate(row.createdAt)}>
                {formatRelative(row.createdAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
