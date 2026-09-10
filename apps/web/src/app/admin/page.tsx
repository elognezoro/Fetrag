import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, CalendarClock, Eye, FileCheck2, HandCoins, Inbox, Mail, MailWarning, Newspaper, Users } from 'lucide-react'
import { formKindLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Reveal, Stagger, StaggerItem, StatTile, StatusBadge } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { SimpleBarChart, VisitsChart } from '@/components/admin/charts'
import { adminAbilities, requireAdmin } from '@/server/admin/context'
import { loadAdminDashboard } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Tableau de bord' }

const entityLabels: Record<string, string> = { page: 'Page', article: 'Actualité', resource: 'Ressource', event: 'Événement', service: 'Service' }

/** Tableau de bord du back-office : indicateurs, graphiques, éléments à traiter, contenus en relecture. */
export default async function AdminDashboardPage() {
  const principal = await requireAdmin('/admin')
  const abilities = adminAbilities(principal)
  const data = await loadAdminDashboard(principal)
  const firstName = principal.name?.trim().split(/\s+/)[0] || principal.email

  const openRequests = data.requestCounts ? (data.requestCounts.NEW ?? 0) + (data.requestCounts.IN_REVIEW ?? 0) + (data.requestCounts.IN_PROGRESS ?? 0) : null
  const newMessages = data.messageCounts ? (data.messageCounts.NEW ?? 0) : null
  const jobsToWatch = data.jobs ? data.jobs.FAILED + data.jobs.DEAD : 0

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Pilotage"
        title={
          <>
            Bonjour <span className="italic text-blue-600">{firstName}</span>
          </>
        }
        description="Vue d’ensemble du site institutionnel fetrag.ga : audience, sollicitations reçues, contenus en attente de validation et activité financière."
        actions={
          abilities.readReports ? (
            <Button asChild variant="outline" size="md">
              <Link href="/admin/rapports">
                <BarChart3 aria-hidden="true" />
                Rapports détaillés
              </Link>
            </Button>
          ) : undefined
        }
      />

      {abilities.isSuperAdmin && (jobsToWatch > 0 || data.failedEmails24h > 0) ? (
        <Alert variant="warning" icon={AlertTriangle}>
          <AlertTitle>Traitements en arrière-plan à surveiller</AlertTitle>
          <AlertDescription>
            {jobsToWatch > 0 ? `${jobsToWatch} tâche${jobsToWatch > 1 ? 's' : ''} en échec ou abandonnée${jobsToWatch > 1 ? 's' : ''}` : null}
            {jobsToWatch > 0 && data.failedEmails24h > 0 ? ' · ' : null}
            {data.failedEmails24h > 0 ? `${data.failedEmails24h} email${data.failedEmails24h > 1 ? 's' : ''} non délivré${data.failedEmails24h > 1 ? 's' : ''} sur 24 h` : null}
            {data.jobs ? ` · ${data.jobs.QUEUED} en file, ${data.jobs.dueNow} à exécuter maintenant.` : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Mobile : deux tuiles par ligne ; la tuile monétaire (valeur longue) occupe toute la largeur. */}
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {data.web ? (
          <StaggerItem>
            <StatTile value={data.web.visits.totalViews} label="Pages vues sur 30 jours" icon={Eye} tone="blue" description={`${data.web.visits.uniqueVisitors} visiteurs uniques`} />
          </StaggerItem>
        ) : null}
        {data.web ? (
          <StaggerItem>
            <StatTile value={data.web.forms.total} label="Formulaires reçus sur 30 jours" icon={Mail} tone="green" description={newMessages !== null ? `${newMessages} à traiter` : undefined} />
          </StaggerItem>
        ) : null}
        {openRequests !== null ? (
          <StaggerItem>
            <StatTile value={openRequests} label="Demandes de service en cours" icon={Inbox} tone="gold" description={`${data.requestCounts?.NEW ?? 0} nouvelle${(data.requestCounts?.NEW ?? 0) > 1 ? 's' : ''}`} />
          </StaggerItem>
        ) : null}
        {data.finance ? (
          <StaggerItem className="col-span-2 sm:col-span-1">
            <StatTile value={formatMoney(data.finance.revenue, data.finance.currency)} label="Chiffre d’affaires sur 12 mois" icon={HandCoins} tone="navy" description={`${data.finance.ordersPaid} commande${data.finance.ordersPaid > 1 ? 's' : ''} payée${data.finance.ordersPaid > 1 ? 's' : ''}`} />
          </StaggerItem>
        ) : null}
        {!data.web && !data.finance && openRequests === null ? (
          <StaggerItem className="col-span-2 xl:col-span-4">
            <Alert variant="info">
              <AlertDescription>Vos permissions ne donnent accès à aucun indicateur global ; utilisez la navigation pour rejoindre votre section.</AlertDescription>
            </Alert>
          </StaggerItem>
        ) : null}
      </Stagger>

      {data.web ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card pillar="protection" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Audience du site</CardTitle>
                <CardDescription>Pages vues et visiteurs uniques (30 derniers jours, sans cookie de suivi).</CardDescription>
              </CardHeader>
              <CardContent>
                <VisitsChart data={data.web.visits.byDay} />
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card pillar="prevention" className="h-full">
              <CardHeader>
                <CardTitle as="h2">Formulaires par type</CardTitle>
                <CardDescription>Contact, adhésion, partenariat, assistance, service.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.web.forms.byKind.length === 0 ? (
                  <EmptyState compact icon={Mail} title="Aucun formulaire" description="Les messages reçus apparaîtront ici." />
                ) : (
                  <SimpleBarChart
                    data={data.web.forms.byKind.map((f) => ({ kind: formKindLabels[f.kind as keyof typeof formKindLabels] ?? f.kind, count: f.count }))}
                    xKey="kind"
                    series={[{ key: 'count', label: 'Formulaires' }]}
                    ariaLabel="Formulaires reçus par type sur 30 jours"
                    height={220}
                  />
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {abilities.readDrafts ? (
          <Reveal>
            <Card pillar="defense" className="h-full">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <CardTitle as="h2">Contenus en relecture</CardTitle>
                <Badge variant={data.reviewContents.length > 0 ? 'gold' : 'neutral'} size="sm">
                  {data.reviewContents.length}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {data.reviewContents.length === 0 ? (
                  <EmptyState compact icon={FileCheck2} title="Rien à relire" description="Les contenus envoyés en relecture par les rédacteurs apparaîtront ici." />
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {data.reviewContents.map((item) => (
                      <li key={`${item.entityType}-${item.id}`} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <Link href={item.href} className="block truncate font-semibold text-navy hover:text-blue-700">
                            {item.title}
                          </Link>
                          <p className="text-xs text-neutral-500">
                            {entityLabels[item.entityType] ?? item.entityType} · modifié {formatRelative(item.updatedAt)}
                          </p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={item.href}>
                            Relire
                            <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {data.scheduled.length > 0 ? (
                  <div className="border-t border-neutral-100 pt-4">
                    <p className="eyebrow mb-2 flex items-center gap-1.5 text-[10px] text-neutral-500">
                      <CalendarClock className="size-3.5" aria-hidden="true" />
                      Publications planifiées
                    </p>
                    <ul className="flex flex-col gap-1.5 text-sm">
                      {data.scheduled.slice(0, 5).map((item) => (
                        <li key={`${item.entityType}-${item.id}`} className="flex items-center justify-between gap-3">
                          <Link href={item.entityType === 'page' ? `/admin/pages/${item.id}` : `/admin/actualites/${item.id}`} className="min-w-0 truncate font-semibold text-navy hover:text-blue-700">
                            {item.title}
                          </Link>
                          <span className="shrink-0 text-xs text-neutral-500">{item.scheduledAt ? formatDateTime(item.scheduledAt) : '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {abilities.handleRequests ? (
          <Reveal delay={0.08}>
            <Card pillar="protection" className="h-full">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <CardTitle as="h2">Dernières demandes de service</CardTitle>
                <Button asChild variant="link" size="sm">
                  <Link href="/admin/demandes">Toutes les demandes</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.latestRequests.length === 0 ? (
                  <EmptyState compact icon={Inbox} title="Aucune demande" description="Les demandes déposées depuis le catalogue des services apparaîtront ici." />
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {data.latestRequests.map((request) => (
                      <li key={request.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <Link href={`/admin/demandes/${request.id}`} className="block truncate font-semibold text-navy hover:text-blue-700">
                            {request.service.name}
                          </Link>
                          <p className="truncate text-xs text-neutral-500">
                            {request.reference} · {request.fullName} · {formatRelative(request.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={request.status} size="sm" />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {abilities.readForms ? (
          <Reveal>
            <Card pillar="prevention" className="h-full">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <CardTitle as="h2">Messages reçus</CardTitle>
                <Button asChild variant="link" size="sm">
                  <Link href="/admin/messages">Boîte de réception</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.latestMessages.length === 0 ? (
                  <EmptyState compact icon={MailWarning} title="Aucun message" description="Les formulaires de contact, d’adhésion et de partenariat arrivent ici." />
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {data.latestMessages.map((message) => (
                      <li key={message.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <Link href={`/admin/messages/${message.id}`} className="block truncate font-semibold text-navy hover:text-blue-700">
                            {message.subject || formKindLabels[message.kind] || message.kind}
                          </Link>
                          <p className="truncate text-xs text-neutral-500">
                            {message.fullName} · {formatRelative(message.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={message.status} size="sm" />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        {data.finance ? (
          <Reveal delay={0.08}>
            <Card pillar="defense" className="h-full">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <CardTitle as="h2">Ventes mensuelles</CardTitle>
                <Button asChild variant="link" size="sm">
                  <Link href="/admin/finance">Finance</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={data.finance.revenueByMonth.slice(-12).map((m) => ({ month: m.month, revenue: m.revenue }))}
                  xKey="month"
                  xFormat="month"
                  valueFormat="money"
                  series={[{ key: 'revenue', label: 'Chiffre d’affaires' }]}
                  ariaLabel="Chiffre d’affaires mensuel des 12 derniers mois"
                  height={220}
                />
                <p className="mt-3 text-xs text-neutral-500">
                  Panier moyen {formatMoney(data.finance.averageBasket, data.finance.currency)} · {data.finance.unpaid.count} commande{data.finance.unpaid.count > 1 ? 's' : ''} en attente ({formatMoney(data.finance.unpaid.amount, data.finance.currency)})
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ) : null}
      </div>

      {data.top || data.lms ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.top ? (
            <Reveal className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle as="h2">Contenus les plus consultés</CardTitle>
                  <CardDescription>Actualités, ressources et formations qui retiennent l’attention.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-blue-700">Actualités</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {data.top.articles.slice(0, 5).map((a, index) => (
                        <li key={a.id} className="flex gap-2">
                          <span className="font-display font-semibold text-blue-600">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/actualites/${a.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {a.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs text-neutral-500">{a.viewCount}</span>
                        </li>
                      ))}
                      {data.top.articles.length === 0 ? <li className="text-xs text-neutral-500">Aucune actualité publiée.</li> : null}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-green-700">Ressources</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {data.top.resources.slice(0, 5).map((r, index) => (
                        <li key={r.id} className="flex gap-2">
                          <span className="font-display font-semibold text-green-700">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/ressources/${r.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {r.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs text-neutral-500">{r.downloadCount}</span>
                        </li>
                      ))}
                      {data.top.resources.length === 0 ? <li className="text-xs text-neutral-500">Aucune ressource publiée.</li> : null}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-gold-700">Formations</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {data.top.courses.slice(0, 5).map((c, index) => (
                        <li key={c.id} className="flex gap-2">
                          <span className="font-display font-semibold text-gold-700">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/formations/${c.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {c.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs text-neutral-500">{c.enrollments}</span>
                        </li>
                      ))}
                      {data.top.courses.length === 0 ? <li className="text-xs text-neutral-500">Aucune inscription.</li> : null}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}
          {data.lms ? (
            <Reveal delay={0.08}>
              <Card className="h-full bg-navy-gradient text-white">
                <CardHeader>
                  <CardTitle as="h2" className="text-white">
                    Plateforme de formation
                  </CardTitle>
                  <CardDescription className="text-white/70">Indicateurs LMS des 30 derniers jours.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/10 p-3">
                      <dt className="text-xs text-white/70">Apprenants actifs</dt>
                      <dd className="font-display text-2xl font-semibold">{data.lms.activeLearners30d}</dd>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <dt className="text-xs text-white/70">Nouvelles inscriptions</dt>
                      <dd className="font-display text-2xl font-semibold">{data.lms.enrollments.last30d}</dd>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <dt className="text-xs text-white/70">Taux de complétion</dt>
                      <dd className="font-display text-2xl font-semibold text-green-400">{data.lms.completionRate} %</dd>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <dt className="text-xs text-white/70">Certificats émis</dt>
                      <dd className="font-display text-2xl font-semibold text-gold-400">{data.lms.certificates.last30d}</dd>
                    </div>
                  </dl>
                  <Button asChild variant="gold" size="sm" className="w-full sm:w-auto sm:self-start">
                    <a href={`${publicEnv.lmsUrl}/coordination`}>
                      Coordination LMS
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}
        </div>
      ) : null}

      {abilities.readUsers || abilities.readDrafts ? (
        <Reveal>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            {abilities.write ? (
              <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                <Link href="/admin/actualites/nouveau">
                  <Newspaper aria-hidden="true" />
                  Nouvelle actualité
                </Link>
              </Button>
            ) : null}
            {abilities.readUsers ? (
              <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                <Link href="/admin/utilisateurs">
                  <Users aria-hidden="true" />
                  Utilisateurs
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
              <Link href="/" target="_blank" rel="noopener">
                Voir le site
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      ) : null}
    </div>
  )
}
