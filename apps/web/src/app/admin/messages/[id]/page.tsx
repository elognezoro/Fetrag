import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { formKindLabels } from '@fetrag/contracts'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EditorLayout } from '@/components/admin/editor-layout'
import { MessageActions } from '@/components/admin/message-actions'
import { loadMessageDetail } from '@/server/admin/content-queries'
import { requireAdminCan } from '@/server/admin/context'
import { deleteMessageAction } from '@/server/admin/forms-actions'
import { loadHandlerOptions } from '@/server/admin/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Message ${id.slice(0, 8)}` }
}

const payloadLabels: Record<string, string> = {
  organization: 'Organisation',
  sector: 'Secteur',
  employer: 'Employeur',
  jobTitle: 'Fonction',
  interest: 'Intérêt',
  partnershipType: 'Type de partenariat',
  source: 'Origine',
  accountFound: 'Compte existant',
  userAgent: 'Navigateur',
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Lecture d'un message reçu et traitement (réponse, statut, attribution, suppression). */
export default async function MessageDetailPage({ params }: PageProps) {
  const { id } = await params
  const principal = await requireAdminCan('forms.read', `/admin/messages/${id}`)
  const [message, handlers] = await Promise.all([loadMessageDetail(id, principal), loadHandlerOptions()])
  if (!message) notFound()
  const payload = (message.payload && typeof message.payload === 'object' && !Array.isArray(message.payload) ? message.payload : {}) as Record<string, unknown>
  const payloadEntries = Object.entries(payload).filter(([key]) => key !== 'ip' && key !== 'ipHash')

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title={message.subject || formKindLabels[message.kind]}
        description={`Référence ${message.reference} · reçu le ${formatDateTime(message.createdAt)}${message.answeredAt ? ` · répondu le ${formatDateTime(message.answeredAt)}` : ''}.`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Messages', href: '/admin/messages' }, { label: message.reference }]}
        actions={<StatusBadge status={message.status} size="lg" />}
      />
      <EditorLayout
        main={
          <>
            <Card pillar="protection">
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle as="h2">{message.fullName}</CardTitle>
                  <CardDescription>
                    <a href={`mailto:${message.email}`} className="text-blue-700 hover:underline">
                      {message.email}
                    </a>
                    {message.phone ? ` · ${message.phone}` : ''}
                    {message.user ? (
                      <>
                        {' · '}
                        <Link href={`/admin/utilisateurs/${message.user.id}`} className="text-blue-700 hover:underline">
                          compte {message.user.name ?? 'utilisateur'}
                        </Link>
                      </>
                    ) : null}
                  </CardDescription>
                </div>
                <Badge variant="outline" size="sm">
                  {formKindLabels[message.kind]}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap rounded-2xl bg-neutral-50 p-4 text-[15px] leading-relaxed text-neutral-800">{message.message}</p>
              </CardContent>
            </Card>
            {payloadEntries.length > 0 ? (
              <Card pillar="prevention">
                <CardHeader>
                  <CardTitle as="h2">Informations complémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {payloadEntries.map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{payloadLabels[key] ?? key}</dt>
                        <dd className="break-words text-sm text-navy">{renderValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ) : null}
          </>
        }
        aside={
          <>
            <MessageActions id={message.id} status={message.status} assignedTo={message.assignedTo} email={message.email} reference={message.reference} handlers={handlers} />
            <ConfirmDialog
              trigger={
                <Button type="button" variant="ghost" size="sm" className="self-start text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                  Supprimer le message
                </Button>
              }
              title={`Supprimer le message ${message.reference} ?`}
              description="Suppression définitive (droit à l’effacement ou message indésirable)."
              confirmLabel="Supprimer"
              destructive
              onConfirm={deleteMessageAction.bind(null, message.id)}
              redirectTo="/admin/messages"
            />
          </>
        }
      />
    </div>
  )
}
