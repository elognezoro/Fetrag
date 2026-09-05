import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CreditCard, FileText } from 'lucide-react'
import { orderStatusLabels, orderStatuses, paymentMethodLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, EmptyState, Pagination, Reveal, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadUserOrders } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Paiements et reçus' }

interface PageProps {
  searchParams: Promise<{ page?: string; statut?: string }>
}

/** Historique des commandes, statuts de paiement et accès aux reçus. */
export default async function PaymentsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/espace/paiements')
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const status = params.statut
  const result = await loadUserOrders(principal, page, status)

  const hrefFor = (p: number) => `/espace/paiements?page=${p}${status ? `&statut=${status}` : ''}`

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Paiements"
        title="Paiements et reçus"
        description="Inscriptions payantes, services et ressources premium : retrouvez vos commandes, leur statut et téléchargez vos reçus numérotés."
      />

      <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        <Link
          href="/espace/paiements"
          className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold transition', !status ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-300')}
        >
          Toutes
        </Link>
        {orderStatuses.map((value) => (
          <Link
            key={value}
            href={`/espace/paiements?statut=${value}`}
            className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold transition', status === value ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-300')}
          >
            {orderStatusLabels[value]}
          </Link>
        ))}
      </nav>

      <Reveal>
        <Card pillar="defense">
          <CardContent className="p-0 sm:p-0">
            {result.items.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title={status ? 'Aucune commande pour ce statut' : 'Aucune commande'}
                description="Vos inscriptions payantes et achats de ressources apparaîtront ici avec leur reçu."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/formations">Voir les formations</Link>
                  </Button>
                }
              />
            ) : (
              <Table bare>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((order) => {
                    const payment = order.payments[0]
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-navy">{order.reference}</span>
                          <span className="block text-xs text-neutral-500">{formatDateTime(order.createdAt)}</span>
                        </TableCell>
                        <TableCell className="max-w-[16rem]">
                          {order.lines.map((line) => (
                            <span key={line.id} className="block truncate text-sm text-navy">
                              {line.quantity > 1 ? `${line.quantity} × ` : ''}
                              {line.label}
                            </span>
                          ))}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold tabular-nums text-navy">
                          {formatMoney(order.totalAmount, order.currency)}
                          {order.discountAmount > 0 ? <span className="block text-xs font-normal text-green-700">Remise {formatMoney(order.discountAmount, order.currency)}</span> : null}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">{payment ? paymentMethodLabels[payment.method] : '—'}</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {order.status === 'PENDING' || order.status === 'FAILED' ? (
                              <Button asChild variant="primary" size="sm">
                                <Link href={`/paiement/${order.id}`}>Payer</Link>
                              </Button>
                            ) : null}
                            {order.receipt ? (
                              <Badge variant="gold" size="sm" className="self-center">
                                <FileText aria-hidden="true" />
                                Reçu {order.receipt.number}
                              </Badge>
                            ) : null}
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/espace/paiements/${order.id}`}>
                                Détail
                                <ArrowRight aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Reveal>
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
    </div>
  )
}
