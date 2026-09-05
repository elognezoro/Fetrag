import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowUpRight, Building2, CreditCard, Download, FileText, Mail, Phone, RefreshCw, User } from 'lucide-react'
import { idSchema, orderStatusLabels, paymentMethodLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ActionButton } from '@/components/admin/action-button'
import { EditorLayout } from '@/components/admin/editor-layout'
import { RefundDialog } from '@/components/admin/refund-dialog'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { reconcileAction } from '@/server/admin/finance-actions'
import { loadAdminOrder, refundableAmount } from '@/server/admin/finance-detail-queries'
import { regenerateReceiptAction } from '@/server/admin/finance-order-actions'
import { refundStatusLabels } from '@/server/admin/labels'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Commande ${id.slice(0, 8)}` }
}

const offerKindLabels: Record<string, string> = { COURSE: 'Formation', EVENT: 'Événement', SERVICE: 'Service', RESOURCE: 'Ressource' }
const settledStatuses = new Set(['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'])

function clientName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

function methodLabel(method: string): string {
  return paymentMethodLabels[method as keyof typeof paymentMethodLabels] ?? method
}

function orderStatusLabel(status: string): string {
  return orderStatusLabels[status as keyof typeof orderStatusLabels] ?? status
}

/** Fiche d'une commande : lignes et totaux, paiements et remboursements, reçu, historique, livrables, actions finance. */
export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const principal = await requireAdminCan('finance.read', `/admin/finance/commandes/${id}`)
  if (!idSchema.safeParse(id).success) notFound()
  const abilities = adminAbilities(principal)
  const data = await loadAdminOrder(principal, id)
  if (!data) notFound()
  const { order, receiptUrl } = data
  const settled = settledStatuses.has(order.status)
  const hasPendingPayment = order.payments.some((p) => p.status === 'PENDING' || p.status === 'INITIATED')
  const refundedTotal = order.payments.flatMap((p) => p.refunds).filter((r) => r.status === 'PROCESSED').reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Finance"
        title={
          <>
            Commande <span className="font-mono text-2xl text-blue-600 sm:text-3xl">{order.reference}</span>
          </>
        }
        description={`Passée le ${formatDateTime(order.createdAt)}${order.paidAt ? ` · réglée le ${formatDateTime(order.paidAt)}` : ''}${order.organization ? ` · pour ${order.organization.name}` : ''}.`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Finance', href: '/admin/finance' }, { label: 'Commandes', href: '/admin/finance/commandes' }, { label: order.reference }]}
        actions={<StatusBadge status={order.status} size="lg" />}
      />

      {order.status === 'PENDING' && hasPendingPayment ? (
        <Alert variant="info">
          <AlertDescription>Un paiement est en attente de confirmation par le fournisseur. Le rapprochement re-vérifie les paiements en attente depuis plus de 15 minutes.</AlertDescription>
        </Alert>
      ) : null}

      <EditorLayout
        main={
          <>
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-neutral-100">
                  {order.lines.map((line) => (
                    <li key={line.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{line.label}</p>
                        <p className="text-xs text-neutral-500">
                          {line.quantity} × {formatMoney(line.unitAmount, order.currency)}
                          {line.offer ? ` · ${offerKindLabels[line.offer.kind] ?? line.offer.kind}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-navy">{formatMoney(line.totalAmount, order.currency)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Sous-total</dt>
                    <dd className="tabular-nums">{formatMoney(order.subtotalAmount, order.currency)}</dd>
                  </div>
                  {order.discountAmount > 0 ? (
                    <div className="flex justify-between text-green-700">
                      <dt>
                        Remise
                        {order.coupon ? ` · code ${order.coupon.code}` : ''}
                        {order.sponsorship ? ` · ${order.sponsorship.label} (${order.sponsorship.percent} %)` : ''}
                      </dt>
                      <dd className="tabular-nums">− {formatMoney(order.discountAmount, order.currency)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-semibold text-navy">
                    <dt>Total</dt>
                    <dd className="font-display text-xl tabular-nums">{formatMoney(order.totalAmount, order.currency)}</dd>
                  </div>
                  {refundedTotal > 0 ? (
                    <div className="flex justify-between text-neutral-600">
                      <dt>Remboursé</dt>
                      <dd className="tabular-nums">{formatMoney(refundedTotal, order.currency)}</dd>
                    </div>
                  ) : null}
                </dl>
                {order.note ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">{order.note}</p> : null}
              </CardContent>
            </Card>

            <Card pillar="prevention">
              <CardHeader>
                <CardTitle as="h2" className="flex items-center gap-2">
                  <CreditCard className="size-5 text-green-700" aria-hidden="true" />
                  Paiements
                </CardTitle>
                <CardDescription>Tentatives de paiement et remboursements associés. Le remboursement est réservé au rôle Finance.</CardDescription>
              </CardHeader>
              <CardContent>
                {order.payments.length === 0 ? (
                  <EmptyState compact icon={CreditCard} title="Aucun paiement" description="Aucune tentative de paiement n’a encore été initiée pour cette commande." />
                ) : (
                  <Table bare>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paiement</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        {abilities.refund ? <TableHead className="text-right">Action</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.payments.map((payment) => {
                        const remaining = refundableAmount(payment)
                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <span className="block font-semibold text-navy">{methodLabel(payment.method)}</span>
                              <span className="block truncate text-xs text-neutral-500">
                                {payment.provider}
                                {payment.providerRef ? ` · ${payment.providerRef}` : ''}
                                {payment.phoneNumber ? ` · ${payment.phoneNumber}` : ''}
                              </span>
                              {payment.failureReason ? <span className="block text-xs text-red-700">{payment.failureReason}</span> : null}
                              {payment.refunds.length > 0 ? (
                                <ul className="mt-1 flex flex-col gap-0.5">
                                  {payment.refunds.map((refund) => (
                                    <li key={refund.id} className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
                                      <Badge variant={refund.status === 'PROCESSED' ? 'success' : refund.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                                        {refundStatusLabels[refund.status] ?? refund.status}
                                      </Badge>
                                      <span className="tabular-nums">{formatMoney(refund.amount, payment.currency)}</span>
                                      {refund.reason ? <span className="truncate">· {refund.reason}</span> : null}
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={payment.status} size="sm" />
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold tabular-nums text-navy">{formatMoney(payment.amount, payment.currency)}</TableCell>
                            <TableCell className="hidden text-xs text-neutral-600 md:table-cell">
                              {formatDateTime(payment.createdAt)}
                              {payment.confirmedAt ? <span className="block">Confirmé le {formatDateTime(payment.confirmedAt)}</span> : null}
                            </TableCell>
                            {abilities.refund ? (
                              <TableCell className="text-right">
                                {remaining > 0 ? (
                                  <RefundDialog paymentId={payment.id} orderId={order.id} remaining={remaining} currency={payment.currency} reference={order.reference} />
                                ) : (
                                  <span className="text-xs text-neutral-400">{payment.status === 'SUCCEEDED' ? 'Intégralement remboursé' : '—'}</span>
                                )}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {order.enrollments.length > 0 || order.eventRegistrations.length > 0 || order.serviceRequest ? (
              <Card pillar="defense">
                <CardHeader>
                  <CardTitle as="h2">Livrables</CardTitle>
                  <CardDescription>Ce que la commande a déclenché une fois réglée.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {order.enrollments.map((enrollment) => (
                    <p key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-navy">Inscription à la formation</span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={enrollment.status} size="sm" />
                        <Button asChild variant="ghost" size="sm">
                          <a href={`${publicEnv.lmsUrl}/coordination`}>
                            Plateforme de formation
                            <ArrowUpRight aria-hidden="true" />
                          </a>
                        </Button>
                      </span>
                    </p>
                  ))}
                  {order.eventRegistrations.map((registration) => (
                    <p key={registration.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-navy">Inscription à un événement</span>
                      <StatusBadge status={registration.status} size="sm" />
                    </p>
                  ))}
                  {order.serviceRequest ? (
                    <p className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-navy">
                        Demande de service <span className="font-mono">{order.serviceRequest.reference}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={order.serviceRequest.status} size="sm" />
                        {abilities.handleRequests ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/demandes/${order.serviceRequest.id}`}>
                              Voir la demande
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </Button>
                        ) : null}
                      </span>
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle as="h2">Historique</CardTitle>
              </CardHeader>
              <CardContent>
                {order.history.length === 0 ? (
                  <p className="text-sm text-neutral-600">Aucun changement de statut enregistré.</p>
                ) : (
                  <ol className="relative flex flex-col gap-4 border-l-2 border-blue-100 pl-5">
                    {order.history.map((event) => (
                      <li key={event.id} className="relative">
                        <span aria-hidden="true" className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-green-500" />
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          {event.fromStatus ? (
                            <>
                              <Badge variant="neutral" size="sm">
                                {orderStatusLabel(event.fromStatus)}
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
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Client</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="flex items-start gap-2">
                  <User className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  {abilities.readUsers ? (
                    <Link href={`/admin/utilisateurs/${order.user.id}`} className="font-semibold text-navy hover:text-blue-700">
                      {clientName(order.user)}
                    </Link>
                  ) : (
                    <span className="font-semibold text-navy">{clientName(order.user)}</span>
                  )}
                </p>
                <p className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <a href={`mailto:${order.user.email}`} className="break-all text-navy hover:underline">
                    {order.user.email}
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="text-navy">{order.user.phone ?? '—'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  {order.organization ? (
                    <Link href={`/admin/organisations/${order.organization.id}`} className="text-navy hover:text-blue-700">
                      {order.organization.name}
                    </Link>
                  ) : (
                    <span className="text-neutral-500">Commande individuelle</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card pillar="defense">
              <CardHeader>
                <CardTitle as="h2">Reçu</CardTitle>
                <CardDescription>Numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {order.receipt ? (
                  <>
                    <p className="inline-flex items-center gap-2 font-semibold text-navy">
                      <FileText className="size-4 text-gold-700" aria-hidden="true" />
                      {order.receipt.number}
                    </p>
                    <p className="text-xs text-neutral-500">Émis le {formatDateTime(order.receipt.issuedAt)}</p>
                    {receiptUrl ? (
                      <Button asChild variant="gold" size="sm">
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Download aria-hidden="true" />
                          Télécharger le PDF
                        </a>
                      </Button>
                    ) : (
                      <Alert variant="info">
                        <AlertDescription>Le PDF n’est pas encore disponible : son rendu est en file d’attente.</AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">{settled ? 'Aucun reçu émis pour cette commande réglée.' : 'Le reçu ne peut être émis qu’après règlement de la commande.'}</p>
                )}
                {settled ? (
                  <ActionButton variant="outline" size="sm" action={regenerateReceiptAction.bind(null, order.id)} pendingLabel="Mise en file" leftIcon={<RefreshCw aria-hidden="true" />}>
                    {order.receipt ? 'Régénérer le PDF' : 'Émettre le reçu'}
                  </ActionButton>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle as="h2">Rapprochement</CardTitle>
                <CardDescription>Re-vérifie auprès des fournisseurs les paiements en attente depuis plus de 15 minutes.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <ActionButton variant={hasPendingPayment ? 'primary' : 'outline'} size="sm" action={reconcileAction} pendingLabel="Rapprochement en cours" leftIcon={<RefreshCw aria-hidden="true" />}>
                  Relancer le rapprochement
                </ActionButton>
                {!hasPendingPayment ? <p className="text-xs text-neutral-500">Aucun paiement de cette commande n’est en attente.</p> : null}
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  )
}
