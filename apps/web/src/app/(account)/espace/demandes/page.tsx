import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Inbox, MessageSquare } from 'lucide-react'
import { formKindLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Pagination, Reveal, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadUserRequests } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Mes demandes' }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

/** Demandes de service et messages envoyés via les formulaires du site. */
export default async function RequestsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/espace/demandes')
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const { requests, submissions } = await loadUserRequests(principal, page)

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Mes demandes"
        title="Demandes de service et messages"
        description="Suivez l’avancement de vos demandes auprès des services de la FETRAG (assistance juridique, médiation, accompagnement) et les messages transmis via nos formulaires."
        actions={
          <Button asChild variant="primary" size="md">
            <Link href="/services">
              Nouvelle demande
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <Reveal>
        <Card pillar="protection">
          <CardHeader>
            <CardTitle as="h2">Demandes de service</CardTitle>
            <CardDescription>Chaque demande reçoit une référence SRV et un suivi par statut jusqu’à sa clôture.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.items.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Aucune demande de service"
                description="La FETRAG accompagne les travailleurs et les sections syndicales : découvrez le catalogue des services."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/services">Voir le catalogue</Link>
                  </Button>
                }
              />
            ) : (
              <>
                <Table bare>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Déposée le</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Suivi par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.items.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs font-semibold text-navy">{request.reference}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-navy">{request.service.name}</span>
                          {request.service.slaDays ? <span className="block text-xs text-neutral-500">Délai indicatif : {request.service.slaDays} jours</span> : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-neutral-600">{formatDate(request.createdAt)}</TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-neutral-600">{request.assignee?.name ?? 'En attente d’attribution'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={requests.page} totalPages={requests.totalPages} hrefFor={(p) => `/espace/demandes?page=${p}`} className="mt-6" />
              </>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.08}>
        <Card pillar="prevention">
          <CardHeader>
            <CardTitle as="h2">Messages envoyés</CardTitle>
            <CardDescription>Formulaires de contact, d’adhésion, de partenariat et d’assistance transmis depuis le site.</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <EmptyState compact icon={MessageSquare} title="Aucun message" description="Vos échanges avec la fédération apparaîtront ici avec leur référence." />
            ) : (
              <ul className="flex flex-col divide-y divide-neutral-100">
                {submissions.map((submission) => (
                  <li key={submission.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{submission.subject || formKindLabels[submission.kind] || submission.kind}</p>
                      <p className="text-xs text-neutral-500">
                        {submission.reference} · {formatDateTime(submission.createdAt)}
                        {submission.answeredAt ? ` · répondu le ${formatDate(submission.answeredAt)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {formKindLabels[submission.kind] ?? submission.kind}
                      </Badge>
                      <StatusBadge status={submission.status} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
