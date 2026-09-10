import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, Lock, ShieldCheck, Smartphone } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Emblem, Reveal, Ribbon, StatusBadge } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { CheckoutForm } from '@/components/account/checkout-form'
import { checkoutSettings, defaultPhoneFor, loadCheckoutOrder } from '@/server/account/checkout'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ orderId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params
  return { title: `Régler la commande ${orderId.slice(0, 8)}`, robots: { index: false, follow: false } }
}

const offerKindLabels: Record<string, string> = { COURSE: 'Formation', EVENT: 'Événement', SERVICE: 'Service', RESOURCE: 'Ressource' }

/** Checkout : récapitulatif de la commande, moyen de paiement, code promotionnel, lancement du paiement. */
export default async function CheckoutPage({ params }: PageProps) {
  const { orderId } = await params
  const principal = await guards.requireUser(`/paiement/${orderId}`)
  const order = await loadCheckoutOrder(principal, orderId)
  if (!order) notFound()
  if (order.status === 'PAID' || order.status === 'REFUNDED' || order.status === 'PARTIALLY_REFUNDED') {
    redirect(`/paiement/${order.id}/retour`)
  }

  const settings = checkoutSettings()
  const lastPayment = order.payments[0]
  const pendingSandbox = lastPayment && lastPayment.status === 'PENDING' && lastPayment.provider === 'sandbox'
  const defaultPhone = await defaultPhoneFor(principal, order)
  const defaultMethod = lastPayment?.method === 'CARD' ? 'CARD' : 'MOBILE_MONEY'
  const couponAllowed = !order.couponId && !order.sponsorshipId && (order.status === 'PENDING' || order.status === 'FAILED')
  const cancelled = order.status === 'CANCELLED'

  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <header className="mb-8 flex flex-col gap-3">
          <Ribbon tone="blue" size="sm">
            Paiement sécurisé
          </Ribbon>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-4xl">
                Régler la commande <span className="font-mono text-2xl text-blue-600 sm:text-3xl">{order.reference}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-neutral-600">
                Créée le {formatDateTime(order.createdAt)}. Vos informations de paiement sont transmises directement à notre prestataire : la FETRAG ne conserve aucune donnée bancaire.
              </p>
            </div>
            <StatusBadge status={order.status} size="lg" />
          </div>
          <div aria-hidden="true" className="h-[3px] w-24 rounded-full bg-[linear-gradient(90deg,var(--color-blue-500),var(--color-green-500),var(--color-gold-500))]" />
        </header>
      </Reveal>

      {cancelled ? (
        <Alert variant="warning" className="mb-6">
          <AlertTitle>Commande annulée</AlertTitle>
          <AlertDescription>
            Cette commande a été annulée et ne peut plus être réglée. Vous pouvez repasser commande depuis la page de la formation, de l’événement ou du service concerné.
          </AlertDescription>
        </Alert>
      ) : null}

      {order.status === 'FAILED' && lastPayment?.failureReason ? (
        <Alert variant="danger" className="mb-6">
          <AlertTitle>Le dernier paiement a échoué</AlertTitle>
          <AlertDescription>
            {lastPayment.failureReason}. Vous pouvez relancer le paiement ci-dessous avec le même moyen ou un autre.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card pillar="protection" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Moyen de paiement</CardTitle>
              <CardDescription>Choisissez comment régler puis validez : la confirmation est automatique dès réception du paiement.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSandbox ? (
                <Alert variant="info" className="mb-5">
                  <AlertTitle>Un paiement de démonstration est en cours</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    <span>Une tentative {paymentMethodLabels[lastPayment.method]} est en attente de confirmation. Terminez-la sur la page de simulation ou choisissez un autre moyen ci-dessous.</span>
                    <Button asChild variant="accent" size="sm" className="self-start">
                      <Link href={`/paiement/${order.id}/sandbox?paymentId=${lastPayment.id}`}>
                        Poursuivre la simulation
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              {lastPayment && lastPayment.status === 'PENDING' && lastPayment.provider !== 'sandbox' ? (
                <Alert variant="info" className="mb-5" icon={Smartphone}>
                  <AlertTitle>Confirmation en attente</AlertTitle>
                  <AlertDescription>
                    Une demande de paiement {paymentMethodLabels[lastPayment.method]}
                    {lastPayment.phoneNumber ? ` vers le ${lastPayment.phoneNumber}` : ''} a été envoyée le {formatDateTime(lastPayment.createdAt)}. Validez-la sur votre téléphone ; cette page se mettra à jour automatiquement.
                  </AlertDescription>
                </Alert>
              ) : null}
              {cancelled ? (
                <Button asChild variant="outline">
                  <Link href="/espace/paiements">Retour à mes paiements</Link>
                </Button>
              ) : (
                <CheckoutForm
                  orderId={order.id}
                  totalLabel={formatMoney(order.totalAmount, order.currency)}
                  defaultMethod={defaultMethod}
                  defaultPhone={defaultPhone}
                  couponAllowed={couponAllowed}
                  providerId={settings.providerId}
                  paymentsEnabled={settings.paymentsEnabled}
                />
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-2">
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="divide-y divide-neutral-100">
                {order.lines.map((line) => (
                  <li key={line.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-navy">{line.label}</p>
                      <p className="text-xs text-neutral-500">
                        {line.quantity} × {formatMoney(line.unitAmount, order.currency)}
                        {line.offer ? ` · ${offerKindLabels[line.offer.kind] ?? line.offer.kind}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-navy">{formatMoney(line.totalAmount, order.currency)}</span>
                  </li>
                ))}
              </ul>
              <dl className="flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Sous-total</dt>
                  <dd className="tabular-nums">{formatMoney(order.subtotalAmount, order.currency)}</dd>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="flex justify-between text-green-700">
                    <dt>
                      Remise
                      {order.coupon ? ` (code ${order.coupon.code})` : ''}
                      {order.sponsorship ? ` · ${order.sponsorship.label}` : ''}
                    </dt>
                    <dd className="tabular-nums">− {formatMoney(order.discountAmount, order.currency)}</dd>
                  </div>
                ) : null}
                <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-neutral-200 pt-3">
                  <dt className="font-semibold text-navy">Total à régler</dt>
                  <dd className="font-display text-2xl font-semibold tabular-nums text-navy">{formatMoney(order.totalAmount, order.currency)}</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2 rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-600">
                <p className="inline-flex items-center gap-2 font-semibold text-navy">
                  <Lock className="size-4 text-blue-600" aria-hidden="true" />
                  Transaction chiffrée et journalisée
                </p>
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-green-700" aria-hidden="true" />
                  Reçu numéroté envoyé par email après confirmation
                </p>
              </div>
              {order.payments.length > 0 ? (
                <div>
                  <p className="eyebrow mb-2 text-[10px] text-neutral-500">Tentatives précédentes</p>
                  <ul className="flex flex-col gap-1.5">
                    {order.payments.slice(0, 4).map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-neutral-600">
                          {paymentMethodLabels[payment.method]} · {formatDateTime(payment.createdAt)}
                        </span>
                        <StatusBadge status={payment.status} size="sm" />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Emblem size={40} decorative />
        <p className="max-w-lg text-xs text-neutral-500">
          Une question sur cette commande ? Contactez la fédération en indiquant la référence <span className="font-mono font-semibold text-navy">{order.reference}</span>.{' '}
          <Link href="/espace/paiements" className="font-semibold text-blue-600 hover:underline">
            Retour à mes paiements
          </Link>
        </p>
        <Badge variant="outline" size="sm">
          Travail · Efficacité · Solidarité
        </Badge>
      </div>
    </div>
  )
}
