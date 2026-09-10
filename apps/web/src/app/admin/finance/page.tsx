import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Clock, HandCoins, HandHeart, RefreshCw, ShoppingBag, Undo2, Webhook } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Reveal, Stagger, StaggerItem, StatTile, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ActionButton } from '@/components/admin/action-button'
import { DonutChart, SimpleBarChart } from '@/components/admin/charts'
import { FinanceExportForm } from '@/components/admin/finance-export-form'
import { FinanceSubnav } from '@/components/admin/finance-subnav'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { reconcileAction } from '@/server/admin/finance-actions'
import { loadFinanceDashboard } from '@/server/admin/finance-queries'

export const metadata: Metadata = { title: 'Finance' }

const BASE = '/admin/finance'

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

function methodLabel(method: string): string {
  return paymentMethodLabels[method as keyof typeof paymentMethodLabels] ?? method
}

function clientName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

/** Tableau de bord financier : chiffre d'affaires, impayés, remboursements, panier moyen, ventes mensuelles, dernières commandes, webhooks, exports. */
export default async function AdminFinancePage() {
  const principal = await requireAdminCan('finance.read', BASE)
  const abilities = adminAbilities(principal)
  const data = await loadFinanceDashboard(principal)
  const year = data.year
  const month = data.month
  const currency = year?.currency ?? 'XAF'
  const failedWebhooks = data.webhooks.filter((w) => w.error || !w.verified).length

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Finance"
        title="Finance"
        description="Commandes, paiements mobile money et remboursements des deux plateformes. Les montants sont exprimés en francs CFA, sans sous-unité."
        actions={
          <ActionButton variant="outline" size="md" action={reconcileAction} pendingLabel="Rapprochement en cours" leftIcon={<RefreshCw aria-hidden="true" />}>
            Lancer le rapprochement
          </ActionButton>
        }
      />
      <FinanceSubnav current={BASE} />

      {!year ? (
        <Alert variant="warning" icon={AlertTriangle}>
          <AlertTitle>Indicateurs indisponibles</AlertTitle>
          <AlertDescription>Le calcul des statistiques financières a échoué ; les listes de commandes restent accessibles. Réessayez dans quelques instants.</AlertDescription>
        </Alert>
      ) : null}

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatTile value={formatMoney(month?.revenue ?? 0, currency)} label="Chiffre d’affaires du mois" icon={HandCoins} tone="blue" description={month ? `${plural(month.ordersPaid, 'commande payée', 'commandes payées')} ce mois-ci` : undefined} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={year?.unpaid.count ?? 0} label="Commandes en attente" icon={Clock} tone="gold" description={year ? `${formatMoney(year.unpaid.amount, currency)} · ${plural(data.pendingPayments, 'paiement à confirmer', 'paiements à confirmer')}` : undefined} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={formatMoney(year?.refunds.amount ?? 0, currency)} label="Remboursés sur 12 mois" icon={Undo2} tone="navy" description={year ? `${plural(year.refunds.count, 'remboursement traité', 'remboursements traités')} · ${plural(year.failed, 'commande échouée', 'commandes échouées')}` : undefined} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={formatMoney(year?.averageBasket ?? 0, currency)} label="Panier moyen" icon={ShoppingBag} tone="green" description={year ? `${plural(year.ordersPaid, 'commande payée', 'commandes payées')} sur 12 mois` : undefined} />
        </StaggerItem>
      </Stagger>

      {year ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card pillar="protection" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Chiffre d’affaires mensuel</CardTitle>
                <CardDescription>Commandes payées (ou partiellement remboursées) par mois de règlement, 12 derniers mois.</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={year.revenueByMonth.slice(-12).map((m) => ({ month: m.month, revenue: m.revenue, orders: m.orders }))}
                  xKey="month"
                  xFormat="month"
                  valueFormat="money"
                  series={[{ key: 'revenue', label: 'Chiffre d’affaires' }]}
                  ariaLabel="Chiffre d’affaires mensuel des 12 derniers mois"
                  height={260}
                />
                <p className="mt-3 text-xs text-neutral-500">
                  Total sur la période : <span className="font-semibold text-navy">{formatMoney(year.revenue, currency)}</span>
                </p>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card pillar="prevention" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Moyens de paiement</CardTitle>
                <CardDescription>Montants encaissés par moyen sur 12 mois.</CardDescription>
              </CardHeader>
              <CardContent>
                {year.byMethod.length === 0 ? (
                  <EmptyState compact icon={HandCoins} title="Aucun paiement" description="Les encaissements apparaîtront ici." />
                ) : (
                  <DonutChart data={year.byMethod.map((m) => ({ name: methodLabel(m.method), value: m.amount }))} ariaLabel="Répartition des encaissements par moyen de paiement" valueFormat="money" />
                )}
                {year.byOfferKind.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-1 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                    {year.byOfferKind.map((k) => (
                      <li key={k.kind} className="flex items-center justify-between gap-2">
                        <span>{k.kind === 'COURSE' ? 'Formations' : k.kind === 'EVENT' ? 'Événements' : k.kind === 'SERVICE' ? 'Services' : k.kind === 'RESOURCE' ? 'Ressources' : k.kind}</span>
                        <span className="tabular-nums text-navy">
                          {formatMoney(k.amount, currency)} · {k.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal>
          <Card pillar="defense" className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle as="h2">Dernières commandes</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href={`${BASE}/commandes`}>Toutes les commandes</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length === 0 ? (
                <EmptyState compact icon={ShoppingBag} title="Aucune commande" description="Les commandes passées depuis le site et la plateforme de formation apparaîtront ici." />
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {data.recentOrders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <Link href={`${BASE}/commandes/${order.id}`} className="font-mono text-sm font-semibold text-navy hover:text-blue-700">
                          {order.reference}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {clientName(order.user)} · {formatRelative(order.createdAt)}
                          {order.lines[0] ? ` · ${order.lines[0].label}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-navy">{formatMoney(order.totalAmount, order.currency)}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle as="h2">Webhooks de paiement</CardTitle>
                <CardDescription>Notifications reçues des fournisseurs, vérifiées par signature avant traitement.</CardDescription>
              </div>
              {failedWebhooks > 0 ? (
                <Badge variant="warning" size="sm">
                  {plural(failedWebhooks, 'anomalie')}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent>
              {data.webhooks.length === 0 ? (
                <EmptyState compact icon={Webhook} title="Aucun webhook" description="Aucune notification de fournisseur n’a encore été reçue." />
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {data.webhooks.map((hook) => (
                    <li key={hook.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {hook.provider} · {hook.eventType}
                        </p>
                        <p className="truncate text-xs text-neutral-500" title={formatDateTime(hook.createdAt)}>
                          {formatRelative(hook.createdAt)}
                          {hook.externalId ? ` · ${hook.externalId}` : ''}
                          {hook.error ? ` · ${hook.error}` : ''}
                        </p>
                      </div>
                      <Badge variant={hook.error ? 'danger' : !hook.verified ? 'warning' : hook.processedAt ? 'success' : 'blue'} size="sm" dot>
                        {hook.error ? 'Erreur' : !hook.verified ? 'Non vérifié' : hook.processedAt ? 'Traité' : 'En file'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {abilities.exportFinance ? (
          <Reveal className="lg:col-span-2">
            <Card pillar="protection" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Exports comptables</CardTitle>
                <CardDescription>Commandes ou paiements sur une période, au format CSV, pour la comptabilité de la fédération.</CardDescription>
              </CardHeader>
              <CardContent>
                <FinanceExportForm action={`${BASE}/exports`} />
              </CardContent>
            </Card>
          </Reveal>
        ) : null}
        <Reveal delay={0.08} className={abilities.exportFinance ? undefined : 'lg:col-span-3'}>
          <Card className="h-full bg-navy-gradient text-white">
            <CardHeader>
              <CardTitle as="h2" className="text-white">
                Prises en charge
              </CardTitle>
              <CardDescription className="text-white/70">Bourses et financements accordés par la fédération ou une organisation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="font-display text-4xl font-semibold text-gold-400">{data.sponsorships}</p>
              <p className="text-sm text-white/80">{plural(data.sponsorships, 'prise en charge en cours de validité', 'prises en charge en cours de validité')}</p>
              <Button asChild variant="gold" size="sm" className="self-start">
                <Link href={`${BASE}/prises-en-charge`}>
                  <HandHeart aria-hidden="true" />
                  Gérer les prises en charge
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
