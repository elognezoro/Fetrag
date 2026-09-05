import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, CreditCard, Download, FileText } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney, isDomainError } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Reveal, StatusBadge } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { lmsHref } from '@/lib/site'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadUserOrder } from '@/server/account/queries'

interface PageProps {
  params: Promise<{ orderId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params
  return { title: `Commande ${orderId.slice(0, 8)}` }
}

/** Détail d'une commande : lignes, paiements, remboursements, reçu signé et ressource acquise. */
export default async function OrderDetailPage({ params }: PageProps) {
  const principal = await guards.requireUser('/espace/paiements')
  const { orderId } = await params
  let data: Awaited<ReturnType<typeof loadUserOrder>>
  try {
    data = await loadUserOrder(principal, orderId)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
  const { order, receiptUrl } = data
  const payable = order.status === 'PENDING' || order.status === 'FAILED'

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Commande"
        breadcrumbs={[{ label: 'Paiements et reçus', href: '/espace/paiements' }, { label: order.reference }]}
        title={
          <>
            Commande <span className="font-mono text-2xl text-blue-600 sm:text-3xl">{order.reference}</span>
          </>
        }
        description={`Passée le ${formatDateTime(order.createdAt)}${order.paidAt ? ` · réglée le ${formatDateTime(order.paidAt)}` : ''}.`}
        actions={
          <>
            <StatusBadge status={order.status} size="lg" />
            {payable ? (
              <Button asChild variant="primary">
                <Link href={`/paiement/${order.id}`}>
                  <CreditCard aria-hidden="true" />
                  Régler la commande
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card pillar="protection" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-neutral-100">
                {order.lines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <div>
                      <p className="font-semibold text-navy">{line.label}</p>
                      <p className="text-xs text-neutral-500">
                        {line.quantity} × {formatMoney(line.unitAmount, order.currency)}
                        {line.offer ? ` · ${line.offer.kind === 'COURSE' ? 'Formation' : line.offer.kind === 'EVENT' ? 'Événement' : line.offer.kind === 'SERVICE' ? 'Service' : 'Ressource'}` : ''}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums text-navy">{formatMoney(line.totalAmount, order.currency)}</span>
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
                      Remise{order.coupon ? ` (code ${order.coupon.code})` : ''}
                      {order.sponsorship ? ` · ${order.sponsorship.label}` : ''}
                    </dt>
                    <dd className="tabular-nums">− {formatMoney(order.discountAmount, order.currency)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-semibold text-navy">
                  <dt>Total</dt>
                  <dd className="font-display text-xl tabular-nums">{formatMoney(order.totalAmount, order.currency)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Reçu</CardTitle>
              <CardDescription>Le reçu numéroté est généré automatiquement après confirmation du paiement.</CardDescription>
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
                      <AlertDescription>Le PDF est en cours de génération ; il sera disponible dans quelques minutes.</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <p className="text-sm text-neutral-600">{payable ? 'Aucun reçu tant que la commande n’est pas réglée.' : 'Aucun reçu disponible pour cette commande.'}</p>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {order.enrollments.length > 0 || order.eventRegistrations.length > 0 || order.serviceRequest ? (
        <Reveal>
          <Card pillar="prevention">
            <CardHeader>
              <CardTitle as="h2">Ce que vous avez obtenu</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {order.enrollments.map((enrollment) => (
                <Button key={enrollment.id} asChild variant="secondary" size="sm">
                  <a href={lmsHref('/mes-formations')}>
                    Formation inscrite ({enrollment.status === 'ACTIVE' ? 'active' : enrollment.status.toLowerCase()})
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              ))}
              {order.eventRegistrations.map((registration) => (
                <Button key={registration.id} asChild variant="secondary" size="sm">
                  <Link href="/espace/inscriptions">Inscription à l’événement confirmée</Link>
                </Button>
              ))}
              {order.serviceRequest ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href="/espace/demandes">Demande {order.serviceRequest.reference}</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {order.payments.length === 0 ? (
              <p className="text-sm text-neutral-600">Aucune tentative de paiement enregistrée.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-neutral-100">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-navy">
                        {paymentMethodLabels[payment.method]}
                        {payment.phoneNumber ? ` · ${payment.phoneNumber}` : ''}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateTime(payment.createdAt)}
                        {payment.providerRef ? ` · réf. ${payment.providerRef}` : ''}
                        {payment.failureReason ? ` · ${payment.failureReason}` : ''}
                      </p>
                      {payment.refunds.length > 0 ? (
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {payment.refunds.map((refund) => (
                            <li key={refund.id}>
                              <Badge variant="warning" size="sm">
                                Remboursement {formatMoney(refund.amount, payment.currency)} · {refund.status.toLowerCase()}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-navy">{formatMoney(payment.amount, payment.currency)}</span>
                      <StatusBadge status={payment.status} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {order.history.length > 0 ? (
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle as="h2">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-4 border-l-2 border-blue-100 pl-5">
                {order.history.map((event) => (
                  <li key={event.id} className="relative">
                    <span aria-hidden="true" className="absolute -left-[1.45rem] top-1.5 size-3 rounded-full border-2 border-white bg-blue-500" />
                    <p className="text-sm font-semibold text-navy">
                      <StatusBadge status={event.toStatus} size="sm" />
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDateTime(event.createdAt)}
                      {event.comment ? ` · ${event.comment}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}
    </div>
  )
}
