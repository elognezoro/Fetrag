import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowUpRight, Award, BarChart3, Download, Eye, GraduationCap, Mail, Search, TrendingUp, Users } from 'lucide-react'
import { formKindLabels, trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDuration } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Reveal, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { SimpleBarChart, VisitsChart } from '@/components/admin/charts'
import { requireAdminCan } from '@/server/admin/context'
import { loadReports } from '@/server/admin/reports-queries'

export const metadata: Metadata = { title: 'Rapports' }

const BASE = '/admin/rapports'

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

/** Rapports : audience du site, activité pédagogique, qualité de la formation, contenus populaires, exports CSV. */
export default async function AdminReportsPage() {
  const principal = await requireAdminCan('reports.read', BASE)
  const data = await loadReports(principal)
  const { web, lms, overview, top } = data
  const requestEntries = overview ? Object.entries(overview.requests).filter(([, count]) => (count ?? 0) > 0) : []

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Pilotage"
        title="Rapports"
        description="Indicateurs du site institutionnel et de la plateforme de formation, sans cookie de suivi. Les exports CSV sont journalisés."
        actions={
          <Button asChild variant="outline" size="md">
            <a href={`${publicEnv.lmsUrl}/coordination/rapports`}>
              <BarChart3 aria-hidden="true" />
              Rapports détaillés du LMS
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        }
      />

      {!web && !lms ? (
        <Alert variant="warning" icon={AlertTriangle}>
          <AlertTitle>Indicateurs indisponibles</AlertTitle>
          <AlertDescription>Le calcul des statistiques a échoué ; réessayez dans quelques instants.</AlertDescription>
        </Alert>
      ) : null}

      <section aria-labelledby="rapports-web" className="flex flex-col gap-4">
        <h2 id="rapports-web" className="font-display text-2xl font-semibold text-navy">
          Site institutionnel <span className="text-base font-normal text-neutral-500">· 30 derniers jours</span>
        </h2>
        {web ? (
          <>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StaggerItem>
                <StatTile value={web.visits.totalViews} label="Pages vues" icon={Eye} tone="blue" description={`${plural(web.visits.uniqueVisitors, 'visiteur unique', 'visiteurs uniques')}`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={web.forms.total} label="Formulaires reçus" icon={Mail} tone="green" description={`${plural(web.serviceRequests.total, 'demande de service', 'demandes de service')}`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={web.eventRegistrations} label="Inscriptions aux événements" icon={Users} tone="gold" description={`${plural(web.newsletter.confirmed, 'abonné confirmé', 'abonnés confirmés')} à la lettre d’information`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={web.orders.conversionRate} suffix=" %" label="Conversion des commandes" icon={TrendingUp} tone="navy" description={`${web.orders.paid} payée${web.orders.paid > 1 ? 's' : ''} sur ${web.orders.total}`} />
              </StaggerItem>
            </Stagger>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <Card pillar="protection" className="h-full">
                  <CardHeader>
                    <CardTitle as="h3">Visites</CardTitle>
                    <CardDescription>
                      Pages vues et visiteurs uniques du {formatDate(web.period.from, { day: '2-digit', month: 'short' })} au {formatDate(web.period.to, { day: '2-digit', month: 'short' })}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VisitsChart data={web.visits.byDay} height={260} />
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.08}>
                <Card pillar="prevention" className="h-full">
                  <CardHeader>
                    <CardTitle as="h3">Formulaires et recherches</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {web.forms.byKind.length === 0 ? (
                      <EmptyState compact icon={Mail} title="Aucun formulaire" />
                    ) : (
                      <SimpleBarChart
                        data={web.forms.byKind.map((f) => ({ kind: formKindLabels[f.kind as keyof typeof formKindLabels] ?? f.kind, count: f.count }))}
                        xKey="kind"
                        series={[{ key: 'count', label: 'Formulaires' }]}
                        ariaLabel="Formulaires reçus par type sur 30 jours"
                        height={180}
                      />
                    )}
                    <div>
                      <p className="eyebrow mb-2 flex items-center gap-1.5 text-[10px] text-neutral-500">
                        <Search className="size-3.5" aria-hidden="true" />
                        Recherches fréquentes
                      </p>
                      {web.topSearches.length === 0 ? (
                        <p className="text-xs text-neutral-500">Aucune recherche enregistrée.</p>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {web.topSearches.slice(0, 8).map((s) => (
                            <li key={s.query}>
                              <Badge variant="outline" size="sm">
                                {s.query} · {s.count}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-600">Indicateurs du site indisponibles.</p>
        )}
      </section>

      <section aria-labelledby="rapports-lms" className="flex flex-col gap-4">
        <h2 id="rapports-lms" className="font-display text-2xl font-semibold text-navy">
          Plateforme de formation
        </h2>
        {lms ? (
          <>
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StaggerItem>
                <StatTile value={lms.activeLearners30d} label="Apprenants actifs sur 30 jours" icon={Users} tone="blue" description={`${plural(lms.enrollments.total, 'inscription')} au total`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={lms.enrollments.last30d} label="Nouvelles inscriptions sur 30 jours" icon={GraduationCap} tone="green" description={`${lms.cohorts.running} cohorte${lms.cohorts.running > 1 ? 's' : ''} en cours · ${lms.cohorts.planned} planifiée${lms.cohorts.planned > 1 ? 's' : ''}`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={lms.completionRate} suffix=" %" label="Taux de complétion" icon={TrendingUp} tone="gold" description={`Progression moyenne ${lms.averageCompletion} %`} />
              </StaggerItem>
              <StaggerItem>
                <StatTile value={lms.certificates.last30d} label="Certificats émis sur 30 jours" icon={Award} tone="navy" description={`${lms.certificates.total} valides · ${lms.certificates.revoked} révoqué${lms.certificates.revoked > 1 ? 's' : ''}`} />
              </StaggerItem>
            </Stagger>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <Card pillar="prevention" className="h-full">
                  <CardHeader>
                    <CardTitle as="h3">Inscriptions et complétions</CardTitle>
                    <CardDescription>Inscriptions créées et parcours terminés par mois, 12 derniers mois.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.enrollmentsByMonth.length === 0 ? (
                      <EmptyState compact icon={GraduationCap} title="Aucune donnée" />
                    ) : (
                      <SimpleBarChart
                        data={data.enrollmentsByMonth.map((m) => ({ month: m.month, enrollments: m.enrollments, completed: m.completed }))}
                        xKey="month"
                        xFormat="month"
                        series={[
                          { key: 'enrollments', label: 'Inscriptions' },
                          { key: 'completed', label: 'Terminées' },
                        ]}
                        ariaLabel="Inscriptions et complétions par mois sur 12 mois"
                        height={260}
                      />
                    )}
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.08}>
                <Card pillar="defense" className="h-full">
                  <CardHeader>
                    <CardTitle as="h3">Qualité de la formation</CardTitle>
                    <CardDescription>Évaluations, assiduité et satisfaction.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overview ? (
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Réussite aux évaluations</dt>
                          <dd className="font-display text-xl font-semibold text-navy">{overview.assessments.passRate} %</dd>
                          <dd className="text-xs text-neutral-500">{plural(overview.assessments.graded, 'tentative corrigée', 'tentatives corrigées')}</dd>
                        </div>
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Score moyen</dt>
                          <dd className="font-display text-xl font-semibold text-navy">{overview.averageScore === null ? '—' : `${overview.averageScore} / 100`}</dd>
                        </div>
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Assiduité</dt>
                          <dd className="font-display text-xl font-semibold text-green-700">{overview.attendanceRate === null ? '—' : `${overview.attendanceRate} %`}</dd>
                        </div>
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Enquêtes de satisfaction</dt>
                          <dd className="font-display text-xl font-semibold text-gold-700">{overview.satisfactionResponses}</dd>
                          <dd className="text-xs text-neutral-500">réponses reçues</dd>
                        </div>
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Temps moyen par inscription</dt>
                          <dd className="font-display text-xl font-semibold text-navy">{formatDuration(Math.round(overview.averageTimeSeconds / 60))}</dd>
                        </div>
                        <div className="rounded-xl bg-neutral-50 p-3">
                          <dt className="text-xs text-neutral-500">Inscriptions en attente</dt>
                          <dd className="font-display text-xl font-semibold text-navy">{overview.enrollments.pending}</dd>
                          <dd className="text-xs text-neutral-500">{overview.enrollments.dropped} abandonnées ou expirées</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-neutral-600">Indicateurs de qualité indisponibles.</p>
                    )}
                    {requestEntries.length > 0 ? (
                      <div className="mt-4 border-t border-neutral-100 pt-3">
                        <p className="eyebrow mb-2 text-[10px] text-neutral-500">Demandes de formation</p>
                        <ul className="flex flex-wrap gap-1.5">
                          {requestEntries.map(([status, count]) => (
                            <li key={status}>
                              <Badge variant="outline" size="sm">
                                {trainingRequestStatusLabels[status as keyof typeof trainingRequestStatusLabels] ?? status} · {count}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-600">Indicateurs de la plateforme de formation indisponibles.</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle as="h2">Contenus populaires</CardTitle>
              <CardDescription>Actualités, ressources, formations et événements qui retiennent l’attention.</CardDescription>
            </CardHeader>
            <CardContent>
              {top ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-blue-700">Actualités (vues)</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {top.articles.slice(0, 6).map((a, index) => (
                        <li key={a.id} className="flex gap-2">
                          <span className="font-display font-semibold text-blue-600">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/actualites/${a.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {a.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-500">{a.viewCount}</span>
                        </li>
                      ))}
                      {top.articles.length === 0 ? <li className="text-xs text-neutral-500">Aucune actualité publiée.</li> : null}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-green-700">Ressources (téléchargements)</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {top.resources.slice(0, 6).map((r, index) => (
                        <li key={r.id} className="flex gap-2">
                          <span className="font-display font-semibold text-green-700">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/ressources/${r.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {r.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-500">{r.downloadCount}</span>
                        </li>
                      ))}
                      {top.resources.length === 0 ? <li className="text-xs text-neutral-500">Aucune ressource publiée.</li> : null}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-gold-700">Formations (inscriptions)</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {top.courses.slice(0, 6).map((c, index) => (
                        <li key={c.id} className="flex gap-2">
                          <span className="font-display font-semibold text-gold-700">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/formations/${c.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {c.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-500">{c.enrollments}</span>
                        </li>
                      ))}
                      {top.courses.length === 0 ? <li className="text-xs text-neutral-500">Aucune inscription.</li> : null}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-[10px] text-navy">Événements (inscriptions)</p>
                    <ol className="flex flex-col gap-1.5 text-sm">
                      {top.events.slice(0, 6).map((e, index) => (
                        <li key={e.id} className="flex gap-2">
                          <span className="font-display font-semibold text-navy">{String(index + 1).padStart(2, '0')}</span>
                          <Link href={`/evenements/${e.slug}`} className="min-w-0 truncate text-navy hover:text-blue-700">
                            {e.title}
                          </Link>
                          <span className="ml-auto shrink-0 text-xs tabular-nums text-neutral-500">{e.registrations}</span>
                        </li>
                      ))}
                      {top.events.length === 0 ? <li className="text-xs text-neutral-500">Aucun événement publié.</li> : null}
                    </ol>
                  </div>
                </div>
              ) : (
                <EmptyState compact icon={Eye} title="Contenus indisponibles" />
              )}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card pillar="protection" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Exports CSV</CardTitle>
              <CardDescription>UTF-8, séparateur point-virgule. Chaque export est journalisé dans le journal d’audit.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" size="md" className="justify-start">
                <a href={`${BASE}/export?type=web`}>
                  <Download aria-hidden="true" />
                  Indicateurs du site
                </a>
              </Button>
              <Button asChild variant="outline" size="md" className="justify-start">
                <a href={`${BASE}/export?type=lms`}>
                  <Download aria-hidden="true" />
                  Indicateurs de formation
                </a>
              </Button>
              <Button asChild variant="outline" size="md" className="justify-start">
                <a href={`${BASE}/export?type=contenus`}>
                  <Download aria-hidden="true" />
                  Contenus populaires
                </a>
              </Button>
              {lms && lms.topCourses.length > 0 ? (
                <div className="mt-2 border-t border-neutral-100 pt-3">
                  <p className="eyebrow mb-2 text-[10px] text-neutral-500">Formations les plus suivies</p>
                  <ul className="flex flex-col gap-1 text-sm">
                    {lms.topCourses.map((c) => (
                      <li key={c.id} className="flex justify-between gap-2">
                        <span className="min-w-0 truncate text-navy">{c.title}</span>
                        <span className="shrink-0 text-xs tabular-nums text-neutral-500">{c.enrollments}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
