import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FlaskConical } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardDescription, CardHeader, Reveal, Ribbon, StatusBadge } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { SandboxSimulator } from '@/components/account/sandbox-simulator'
import { checkoutSettings, loadCheckoutOrder } from '@/server/account/checkout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Simulation de paiement', robots: { index: false, follow: false } }

interface PageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ paymentId?: string }>
}

/** Page de simulation du fournisseur sandbox : issue réussie ou échec (PAYMENT_PROVIDER=sandbox uniquement). */
export default async function SandboxPaymentPage({ params, searchParams }: PageProps) {
  const settings = checkoutSettings()
  if (!settings.sandbox) notFound()
  const [{ orderId }, { paymentId }] = await Promise.all([params, searchParams])
  const principal = await guards.requireUser(`/paiement/${orderId}/sandbox`)
  const order = await loadCheckoutOrder(principal, orderId)
  if (!order) notFound()
  if (order.status === 'PAID' || order.status === 'REFUNDED' || order.status === 'PARTIALLY_REFUNDED') redirect(`/paiement/${order.id}/retour`)

  const payment = (paymentId ? order.payments.find((p) => p.id === paymentId) : undefined) ?? order.payments.find((p) => p.status === 'PENDING' && p.provider === 'sandbox')
  if (!payment || payment.provider !== 'sandbox') redirect(`/paiement/${order.id}`)
  if (payment.status !== 'PENDING' && payment.status !== 'INITIATED') redirect(`/paiement/${order.id}/retour`)

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <Card pillar="prevention" className="overflow-hidden">
          <CardHeader className="gap-3">
            <Ribbon tone="green" size="sm">
              Environnement de démonstration
            </Ribbon>
            <h1 className="font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
              Simuler le fournisseur de paiement
            </h1>
            <CardDescription>
              Aucun débit réel n’est effectué. Cette page remplace le parcours de l’opérateur Mobile Money ou de la banque : choisissez l’issue de la transaction pour tester la
              confirmation de commande, l’inscription automatique et la génération du reçu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <dl className="grid grid-cols-1 gap-3 rounded-2xl bg-neutral-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Commande</dt>
                <dd className="font-mono font-semibold text-navy">{order.reference}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Montant</dt>
                <dd className="font-display text-xl font-semibold text-navy">{formatMoney(payment.amount, payment.currency)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Moyen</dt>
                <dd className="text-navy">
                  {paymentMethodLabels[payment.method]}
                  {payment.phoneNumber ? ` · ${payment.phoneNumber}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Référence fournisseur</dt>
                <dd className="flex items-center gap-2 font-mono text-xs text-navy">
                  {payment.providerRef ?? '—'}
                  <StatusBadge status={payment.status} size="sm" />
                </dd>
              </div>
            </dl>

            <Alert variant="info" icon={FlaskConical}>
              <AlertTitle>Comment fonctionne la simulation</AlertTitle>
              <AlertDescription>
                Chaque bouton génère un webhook signé (HMAC) identique à celui d’un opérateur réel, le journalise puis le traite : le statut de la commande, l’inscription et le reçu
                sont mis à jour comme en production.
              </AlertDescription>
            </Alert>

            <SandboxSimulator orderId={order.id} paymentId={payment.id} />

            <div className="flex justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/paiement/${order.id}`}>Revenir au choix du moyen de paiement</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
