import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, CreditCard, Mail, Phone, Trash2, User } from 'lucide-react'
import { serviceRequestTransitions } from '@fetrag/cms'
import { serviceRequestStatusLabels } from '@fetrag/contracts'
import type { ServiceRequestStatus } from '@fetrag/db'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EditorLayout } from '@/components/admin/editor-layout'
import { RequestPanel } from '@/components/admin/request-panel'
import { loadServiceRequestDetail } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { loadHandlerOptions } from '@/server/admin/queries'
import { deleteRequestAction } from '@/server/admin/services-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Demande ${id.slice(0, 8)}` }
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Détail d'une demande de service : demandeur, informations saisies, paiement, historique et panneau de traitement. */
export default async function ServiceRequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const principal = await requireAdminCan('services.handle_requests', `/admin/demandes/${id}`)
  const abilities = adminAbilities(principal)
  const [request, handlers] = await Promise.all([loadServiceRequestDetail(id, principal), loadHandlerOptions()])
  if (!request) notFound()

  const payload = (request.payload && typeof request.payload === 'object' && !Array.isArray(request.payload) ? request.payload : {}) as Record<string, unknown>
  const fields = request.formFields ?? []
  const extraKeys = Object.keys(payload).filter((key) => !fields.some((f) => f.name === key))
  const nextStatuses = serviceRequestTransitions[request.status as ServiceRequestStatus] ?? []

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Services"
        title={request.service.name}
        description={`Demande ${request.reference} déposée le ${formatDateTime(request.createdAt)} par ${request.fullName}.`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Demandes', href: '/admin/demandes' }, { label: request.reference }]}
        actions={<StatusBadge status={request.status} size="lg" />}
      />
      <EditorLayout
        main={
          <>
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Demandeur</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <p className="flex items-start gap-2 text-sm">
                  <User className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-navy">{request.fullName}</span>
                    {request.requester ? (
                      <Link href={`/admin/utilisateurs/${request.requester.id}`} className="text-xs text-blue-700 hover:underline">
                        Compte : {request.requester.email}
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-500">Sans compte</span>
                    )}
                  </span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <a href={`mailto:${request.email}`} className="break-all text-navy hover:underline">
                    {request.email}
                  </a>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Phone className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="text-navy">{request.phone ?? '—'}</span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="text-navy">{request.organization ?? '—'}</span>
                </p>
                {request.message ? (
                  <div className="sm:col-span-2">
                    <p className="eyebrow mb-1 text-[10px] text-neutral-500">Message</p>
                    <p className="whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">{request.message}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {fields.length > 0 || extraKeys.length > 0 ? (
              <Card pillar="prevention">
                <CardHeader>
                  <CardTitle as="h2">Informations saisies</CardTitle>
                  <CardDescription>Champs spécifiques du formulaire « {request.service.name} ».</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.name} className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{field.label}</dt>
                        <dd className="break-words text-sm text-navy">{renderValue(payload[field.name])}</dd>
                      </div>
                    ))}
                    {extraKeys.map((key) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{key}</dt>
                        <dd className="break-words text-sm text-navy">{renderValue(payload[key])}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ) : null}

            {request.service.isPaid ? (
              <Card pillar="defense">
                <CardHeader>
                  <CardTitle as="h2" className="flex items-center gap-2">
                    <CreditCard className="size-5 text-gold-700" aria-hidden="true" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  {request.order ? (
                    <>
                      <span>
                        Commande <span className="font-mono font-semibold text-navy">{request.order.reference}</span> · {formatMoney(request.order.totalAmount, request.order.currency)}
                        {request.order.paidAt ? ` · payée le ${formatDateTime(request.order.paidAt)}` : ''}
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={request.order.status} size="sm" />
                        {abilities.readFinance ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/finance/commandes/${request.order.id}`}>
                              Voir la commande
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </Button>
                        ) : null}
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-600">
                      Service payant ({formatMoney(request.service.priceAmount ?? 0, request.service.currency)}) : aucune commande réglée n’est encore associée.
                    </span>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle as="h2">Historique</CardTitle>
              </CardHeader>
              <CardContent>
                {request.history.length === 0 ? (
                  <p className="text-sm text-neutral-600">Aucun changement de statut enregistré.</p>
                ) : (
                  <ol className="relative flex flex-col gap-4 border-l-2 border-blue-100 pl-5">
                    {request.history.map((event) => (
                      <li key={event.id} className="relative">
                        <span aria-hidden="true" className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-green-500" />
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          {event.fromStatus ? (
                            <>
                              <Badge variant="neutral" size="sm">
                                {serviceRequestStatusLabels[event.fromStatus as ServiceRequestStatus] ?? event.fromStatus}
                              </Badge>
                              <ArrowRight className="size-3.5 text-neutral-400" aria-hidden="true" />
                            </>
                          ) : null}
                          <StatusBadge status={event.toStatus} size="sm" />
                          <span className="text-xs text-neutral-500">{formatDateTime(event.createdAt)}</span>
                        </p>
                        {event.comment ? <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{event.comment}</p> : null}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </>
        }
        aside={
          <>
            <RequestPanel requestId={request.id} status={request.status} assigneeId={request.assigneeId} internalNote={request.internalNote} handlers={handlers} nextStatuses={nextStatuses} />
            {abilities.manageServices && (request.status === 'CLOSED' || request.status === 'REJECTED') ? (
              <ConfirmDialog
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="self-start text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                    Supprimer la demande
                  </Button>
                }
                title={`Supprimer la demande ${request.reference} ?`}
                description="Suppression définitive (droit à l’effacement). L’historique de statut est supprimé avec la demande."
                confirmLabel="Supprimer"
                destructive
                onConfirm={deleteRequestAction.bind(null, request.id)}
                redirectTo="/admin/demandes"
              />
            ) : null}
          </>
        }
      />
    </div>
  )
}
