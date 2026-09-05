import { Download, UserCheck, UserMinus, Users } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Button, StatusBadge } from '@fetrag/ui'
import { setEventAttendanceAction } from '@/server/admin/content-actions'
import { ActionButton } from './action-button'
import { DataTable } from './data-table'

export interface AttendeeItem {
  userId: string
  fullName: string
  email: string
  phone: string | null
  employer: string | null
  status: string
  registeredAt: Date
  attendedAt: Date | null
  orderReference: string | null
}

export interface AttendeeTableProps {
  eventId: string
  attendees: AttendeeItem[]
  canMark: boolean
  exportHref: string
}

const registrationLabels: Record<string, string> = { REGISTERED: 'Inscrit', WAITLISTED: 'Liste d’attente', CANCELLED: 'Annulé', ATTENDED: 'Présent' }

/** Participants d'un événement : inscrits, liste d'attente, présence, export CSV. Composant serveur. */
export function AttendeeTable({ eventId, attendees, canMark, exportHref }: AttendeeTableProps) {
  const registered = attendees.filter((a) => a.status === 'REGISTERED' || a.status === 'ATTENDED').length
  const attended = attendees.filter((a) => a.status === 'ATTENDED').length
  const waiting = attendees.filter((a) => a.status === 'WAITLISTED').length
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-navy">{registered}</span> inscrit{registered > 1 ? 's' : ''} · <span className="font-semibold text-navy">{attended}</span> présent{attended > 1 ? 's' : ''}
          {waiting > 0 ? ` · ${waiting} en liste d’attente` : ''}
        </p>
        {attendees.length > 0 ? (
          <Button asChild variant="outline" size="sm">
            <a href={exportHref}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </a>
          </Button>
        ) : null}
      </div>
      <DataTable<AttendeeItem>
        rows={attendees}
        rowKey={(row) => row.userId}
        caption="Participants de l’événement"
        empty={{ icon: Users, title: 'Aucun inscrit', description: 'Les inscriptions apparaîtront ici dès la publication de l’événement.' }}
        columns={[
          {
            key: 'name',
            header: 'Participant',
            cell: (row) => (
              <div className="min-w-0">
                <p className="font-semibold text-navy">{row.fullName || row.email}</p>
                <p className="truncate text-xs text-neutral-500">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ''}
                </p>
              </div>
            ),
          },
          { key: 'employer', header: 'Employeur', hideBelow: 'md', cell: (row) => <span className="text-neutral-600">{row.employer ?? '—'}</span> },
          { key: 'registeredAt', header: 'Inscrit le', hideBelow: 'lg', cell: (row) => <span className="whitespace-nowrap text-neutral-600">{formatDateTime(row.registeredAt)}</span> },
          {
            key: 'status',
            header: 'Statut',
            cell: (row) => (
              <div className="flex flex-col gap-1">
                <StatusBadge status={row.status} labels={registrationLabels} size="sm" />
                {row.orderReference ? <span className="font-mono text-[11px] text-neutral-500">{row.orderReference}</span> : null}
              </div>
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Présence</span>,
            align: 'right',
            cell: (row) =>
              canMark && (row.status === 'REGISTERED' || row.status === 'ATTENDED') ? (
                row.status === 'ATTENDED' ? (
                  <ActionButton variant="ghost" size="sm" action={setEventAttendanceAction.bind(null, eventId, row.userId, false)} leftIcon={<UserMinus aria-hidden="true" />}>
                    Retirer
                  </ActionButton>
                ) : (
                  <ActionButton variant="secondary" size="sm" action={setEventAttendanceAction.bind(null, eventId, row.userId, true)} leftIcon={<UserCheck aria-hidden="true" />}>
                    Présent
                  </ActionButton>
                )
              ) : null,
          },
        ]}
      />
    </div>
  )
}
