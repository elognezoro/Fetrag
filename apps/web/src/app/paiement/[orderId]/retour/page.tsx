import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock, Download, FileText, RefreshCw, XCircle } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, ArcRing, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CertificateSeal, Reveal, Ribbon, StatusBadge } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { publicEnv } from '@/lib/env'
import { loadCheckoutOrder, loadFulfillmentLinks } from '@/server/account/checkout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Résultat du paiement', robots: { index: false, follow: false } }

interface PageProps {
  params: Promise<{ orderId: string }>
}

/** Page de retour après paiement : statut final, reçu, accès à la ressource acquise, relance si échec. */
export default async function PaymentReturnPage({ params }: PageProps) {
  const { orderId } = await params
  const principal = await guards.requireUser(`/paiement/${orderId}/retour`)
  const order = await loadCheckoutOrder(principal, orderId)
  if (!order) notFound()
  const links = await loadFulfillmentLinks(order, publicEnv.lmsUrl)
  const lastPayment = order.payments[0]

  const paid = order.status === 'PAID' || order.status === 'PARTIALLY_REFUNDED' || order.status === 'REFUNDED'
  const pending = order.status === 'PENDING' && lastPayment?.status === 'PENDING'
  const failed = order.status === 'FAILED' || order.status === 'CANCELLED' || (order.status === 'PENDING' && !pending)

  const tone = paid ? 'green' : pending ? 'gold' : 'navy'
  const Icon = paid ? CheckCircle2 : pending ? Clock : XCircle
  const headline = paid ? 'Paiement confirmé' : pending ? 'Paiement en attente de confirmation' : 'Le paiement n’a pas abouti'
  const hasAcquired = links.courses.length > 0 || links.events.length > 0 || links.resources.length > 0 || links.serviceRequest

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <Card className="overflow-hidden">
          <div aria-hidden="true" className="tricolor-band h-1 w-full" />
          <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:flex-row sm:items-center sm:text-left">
            <ArcRing size={112} stroke={9} progress={paid ? 100 : pending ? 60 : 25} tone={tone} animate>
              <Icon className={paid ? 'size-10 text-green-600' : pending ? 'size-10 text-gold-700' : 'size-10 text-navy'} strokeWidth={1.75} aria-hidden="true" />
            </ArcRing>
            <div className="flex flex-col gap-2">
              <Ribbon tone={tone} size="sm" className="self-center sm:self-start">
                Commande {order.reference}
              </Ribbon>
              <h1 className="font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">{headline}</h1>
              <p className="text-neutral-600">
                {paid
                  ? `Merci pour votre confiance. Votre commande de ${formatMoney(order.totalAmount, order.currency)} a été réglée${order.paidAt ? ` le ${formatDateTime(order.paidAt)}` : ''} ; un email de confirmation vous a été envoyé.`
                  : pending
                    ? 'Nous attendons la confirmation de votre opérateur. Selon le moyen choisi, cela prend de quelques secondes à quelques minutes.'
                    : 'Aucun montant n’a été débité. Vous pouvez relancer le paiement avec le même moyen ou en choisir un autre.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <StatusBadge status={order.status} />
                {lastPayment ? (
                  <span className="text-xs text-neutral-500">
                    {paymentMethodLabels[lastPayment.method]}
                    {lastPayment.providerRef ? ` · réf. ${lastPayment.providerRef}` : ''}
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {paid ? (
          <Reveal>
            <Card pillar="defense" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Votre reçu</CardTitle>
                <CardDescription>Reçu numéroté conservé dans votre espace personnel.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <CertificateSeal size={64} label="Reçu" decorative />
                  <div>
                    <p className="inline-flex items-center gap-2 font-semibold text-navy">
                      <FileText className="size-4 text-gold-700" aria-hidden="true" />
                      {order.receipt ? order.receipt.number : 'Numérotation en cours'}
                    </p>
                    <p className="text-xs text-neutral-500">{order.receipt ? `Émis le ${formatDate(order.receipt.issuedAt)}` : 'Le reçu est émis dès la confirmation définitive.'}</p>
                  </div>
                </div>
                {links.receiptUrl ? (
                  <Button asChild variant="gold" size="sm" className="self-start">
                    <a href={links.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Download aria-hidden="true" />
                      Télécharger le PDF
                    </a>
                  </Button>
                ) : (
                  <Alert variant="info">
                    <AlertDescription>Le PDF du reçu est en cours de génération : il sera disponible dans quelques minutes depuis « Paiements et reçus ».</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {paid && hasAcquired ? (
          <Reveal delay={0.08}>
            <Card pillar="prevention" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Ce que vous avez obtenu</CardTitle>
                <CardDescription>Vos accès sont activés immédiatement.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {links.courses.map((course) => (
                  <Button key={course.id} asChild variant="secondary" size="sm" className="justify-between">
                    <a href={course.href}>
                      Module {course.code} · {course.title}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                ))}
                {links.events.map((event) => (
                  <Button key={event.id} asChild variant="secondary" size="sm" className="justify-between">
                    <Link href={event.href}>
                      {event.title} · {formatDate(event.startsAt)}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ))}
                {links.resources.map((resource) => (
                  <Button key={resource.id} asChild variant="secondary" size="sm" className="justify-between">
                    <Link href={resource.href}>
                      {resource.title}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ))}
                {links.serviceRequest ? (
                  <Button asChild variant="secondary" size="sm" className="justify-between">
                    <Link href={links.serviceRequest.href}>
                      Demande {links.serviceRequest.reference} prise en charge
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {pending ? (
          <Reveal className="md:col-span-2">
            <Alert variant="info" icon={Clock}>
              <AlertTitle>Que faire pendant l’attente</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>
                  Validez la demande sur votre téléphone si vous avez choisi Mobile Money. Dès confirmation, votre accès sera activé et un email envoyé. Vous pouvez fermer cette page :
                  le suivi reste disponible dans « Paiements et reçus ».
                </span>
                <span className="flex flex-wrap gap-2">
                  <Button asChild variant="primary" size="sm">
                    <Link href={`/paiement/${order.id}/retour`}>
                      <RefreshCw aria-hidden="true" />
                      Actualiser le statut
                    </Link>
                  </Button>
                  {lastPayment?.provider === 'sandbox' ? (
                    <Button asChild variant="accent" size="sm">
                      <Link href={`/paiement/${order.id}/sandbox?paymentId=${lastPayment.id}`}>Terminer la simulation</Link>
                    </Button>
                  ) : null}
                </span>
              </AlertDescription>
            </Alert>
          </Reveal>
        ) : null}

        {failed ? (
          <Reveal className="md:col-span-2">
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Relancer le paiement</CardTitle>
                <CardDescription>
                  {lastPayment?.failureReason ? `Motif communiqué : ${lastPayment.failureReason}.` : 'Le fournisseur n’a pas confirmé la transaction.'}
                  {order.status === 'CANCELLED' ? ' Cette commande est annulée : repassez commande depuis la page concernée.' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {order.status !== 'CANCELLED' ? (
                  <Button asChild variant="primary">
                    <Link href={`/paiement/${order.id}`}>
                      <RefreshCw aria-hidden="true" />
                      Réessayer le paiement
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link href="/espace/paiements">Mes paiements</Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/espace/paiements/${order.id}`}>Détail de la commande</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/espace">Mon espace</Link>
        </Button>
      </div>
    </div>
  )
}
