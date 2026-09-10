import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ClipboardCheck, MessageSquare, UsersRound } from 'lucide-react'
import { sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { dashboards } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Reveal, Stagger, StaggerItem, StatusBadge, TriptychStrip } from '@fetrag/ui'
import { personName } from '@/components/staff/format'
import { ProgressRing } from '@/components/staff/progress-ring'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'

export const metadata: Metadata = { title: 'Espace formateur' }
export const dynamic = 'force-dynamic'

/** Tableau de bord du formateur (LMS-10) : cohortes assignées, sessions à venir, corrections en attente. */
export default async function TrainerDashboardPage() {
  const principal = await guards.requireUser('/formateur')
  const dashboard = await dashboards.trainer(principal)
  const firstName = principal.name?.split(' ')[0] ?? 'formateur'

  return (
    <>
      <StaffPageHeader
        eyebrow="Espace formateur"
        title={
          <>
            Bonjour {firstName}, vos <span className="italic text-green-700">cohortes</span> vous attendent
          </>
        }
        description="Suivez la progression de vos participants, émargez les sessions, corrigez les devoirs et les compositions, animez le forum de chaque cohorte."
        tone="green"
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/formateur/cohortes">
              <UsersRound aria-hidden="true" />
              Mes cohortes
            </Link>
          </Button>
        }
      />

      <StatGrid
        items={[
          { value: dashboard.stats.cohorts, label: 'Cohortes assignées', icon: UsersRound, tone: 'blue', description: `${dashboard.stats.running} en cours` },
          { value: dashboard.stats.learners, label: 'Participants suivis', icon: ClipboardCheck, tone: 'green' },
          { value: dashboard.stats.pendingCorrections, label: 'Corrections en attente', icon: MessageSquare, tone: 'gold' },
          { value: dashboard.upcomingSessions.length, label: 'Sessions à venir', icon: CalendarDays, tone: 'navy' },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Reveal>
          <Card pillar="prevention" className="h-full">
            <CardHeader>
              <CardTitle>Progression de vos participants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-around gap-6">
              <ProgressRing value={dashboard.stats.averageProgress} label="Progression moyenne" />
              {dashboard.stats.averageScore !== null ? <ProgressRing value={dashboard.stats.averageScore} label="Score moyen" tone="gold" /> : null}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Sessions à venir</CardTitle>
              <CalendarDays className="size-5 text-green-700" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {dashboard.upcomingSessions.length ? (
                <ul className="divide-y divide-neutral-100">
                  {dashboard.upcomingSessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{s.title}</p>
                        <p className="text-xs text-neutral-500">
                          {s.cohort.name} · {sessionModeLabels[s.mode]}
                          {s.location ? ` · ${s.location}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-ink">{formatDateTime(s.startsAt)}</p>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/formateur/cohortes/${s.cohort.id}?onglet=presence&session=${s.id}`}>Émarger</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={CalendarDays} title="Aucune session programmée" description="Ajoutez des sessions depuis la fiche d'une cohorte : les participants recevront une convocation." />
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <StaffSection
        number="01"
        title="Mes cohortes"
        className="mt-10"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/formateur/cohortes">
              Toutes les cohortes
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        {dashboard.cohorts.length ? (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dashboard.cohorts.slice(0, 6).map((c) => (
              <StaggerItem key={c.id}>
                <Card pillar={c.status === 'RUNNING' ? 'prevention' : c.status === 'CLOSED' ? 'defense' : 'protection'} interactive className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/formateur/cohortes/${c.id}`} className="font-display text-lg font-semibold leading-tight text-navy hover:underline">
                          {c.name}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {c.code} · {c.course.title}
                        </p>
                      </div>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="size-4" aria-hidden="true" />
                        {c._count.members} membre(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {c.nextSession ? `Prochaine session ${formatDateTime(c.nextSession.startsAt)}` : c.startsAt ? `Début ${formatDate(c.startsAt)}` : 'Dates à confirmer'}
                      </span>
                    </div>
                    {c.organization ? <Badge variant="blue" size="sm" className="w-fit">{c.organization.acronym ?? c.organization.name}</Badge> : null}
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Card>
            <EmptyState icon={UsersRound} title="Aucune cohorte assignée" description="La coordination vous affecte une cohorte lors de la planification d'une formation. Vous serez notifié dès l'affectation." />
          </Card>
        )}
      </StaffSection>

      <StaffSection number="02" title="Corrections en attente" tone="gold" description="Devoirs remis et compositions soumises par vos participants, du plus ancien au plus récent.">
        {dashboard.pendingSubmissions.length || dashboard.pendingEssays.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle as="h3">Devoirs ({dashboard.pendingSubmissions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.pendingSubmissions.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {dashboard.pendingSubmissions.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{s.learner}</p>
                          <p className="text-xs text-neutral-500">
                            {s.activityTitle} · {s.submittedAt ? formatDateTime(s.submittedAt) : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={s.status} size="sm" />
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/formateur/cohortes?remise=${s.id}`}>Corriger</Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Aucun devoir à corriger.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle as="h3">Compositions ({dashboard.pendingEssays.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard.pendingEssays.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {dashboard.pendingEssays.map((e) => (
                      <li key={e.attemptId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{personName(e.user)}</p>
                          <p className="text-xs text-neutral-500">
                            {e.activity.title} · {e.course.title} · {e.pendingQuestions} question(s)
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/formateur/cohortes?tentative=${e.attemptId}`}>Corriger</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Aucune composition à corriger.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <EmptyState compact icon={ClipboardCheck} title="Tout est corrigé" description="Aucun devoir ni composition n'attend votre correction." />
          </Card>
        )}
      </StaffSection>

      {dashboard.recentThreads.length ? (
        <StaffSection number="03" title="Activité des forums" tone="navy">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dashboard.recentThreads.map((t) => (
              <li key={t.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                <Link href={`/forums/${t.forum.slug}/${t.id}`} className="font-semibold text-navy hover:underline">
                  {t.title}
                </Link>
                <p className="text-xs text-neutral-500">
                  {t.author.name ?? 'Participant'} · {t._count.posts} message(s) · {formatDateTime(t.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </StaffSection>
      ) : null}

      <div className="mt-12">
        <TriptychStrip variant="bar" />
      </div>
    </>
  )
}
