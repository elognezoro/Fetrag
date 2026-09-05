import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, UsersRound } from 'lucide-react'
import { cohortStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { cohorts } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, EmptyState, Stagger, StaggerItem, StatusBadge } from '@fetrag/ui'
import { GradingForm, EssayGradingForm } from '@/components/staff/grading-form'
import { personName } from '@/components/staff/format'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { loadEssayReview, loadSubmission, loadTrainerCorrections } from '@/server/staff/trainer-queries'

export const metadata: Metadata = { title: 'Mes cohortes' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ remise?: string; tentative?: string }>
}

/** Cohortes du formateur et file de corrections transverse. */
export default async function TrainerCohortsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/formateur/cohortes')
  const { remise, tentative } = await searchParams
  const [list, corrections] = await Promise.all([cohorts.listForTrainer(principal), loadTrainerCorrections(principal)])
  const submission = remise ? await loadSubmission(principal, remise).catch(() => null) : null
  const review = tentative ? await loadEssayReview(principal, tentative).catch(() => null) : null
  const grouped = {
    active: list.filter((c) => c.status === 'RUNNING' || c.status === 'OPEN'),
    planned: list.filter((c) => c.status === 'PLANNED'),
    closed: list.filter((c) => c.status === 'CLOSED'),
  }

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Formateur', href: '/formateur' }, { label: 'Cohortes' }]}
        eyebrow="Mes cohortes"
        title={
          <>
            {list.length} cohorte{list.length > 1 ? 's' : ''} <span className="italic text-green-700">à animer</span>
          </>
        }
        description="Chaque cohorte suit une version figée du module : participants, présence, corrections, messages, statistiques et sessions."
        tone="green"
      />

      {submission ? (
        <StaffSection number="00" title="Correction du devoir" tone="gold" className="mb-10" actions={<Button asChild variant="ghost" size="sm"><Link href="/formateur/cohortes">Fermer</Link></Button>}>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <GradingForm submission={submission} />
            </CardContent>
          </Card>
        </StaffSection>
      ) : null}
      {review ? (
        <StaffSection number="00" title="Correction des compositions" tone="gold" className="mb-10" actions={<Button asChild variant="ghost" size="sm"><Link href="/formateur/cohortes">Fermer</Link></Button>}>
          <Card>
            <CardContent className="p-5 sm:p-6">
              <EssayGradingForm review={review} />
            </CardContent>
          </Card>
        </StaffSection>
      ) : null}

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={UsersRound} title="Aucune cohorte assignée" description="La coordination vous affecte une cohorte lors de la planification d'une formation." />
        </Card>
      ) : null}

      {(
        [
          ['01', 'En cours et ouvertes', grouped.active, 'prevention'],
          ['02', 'Planifiées', grouped.planned, 'protection'],
          ['03', 'Clôturées', grouped.closed, 'defense'],
        ] as const
      ).map(([number, title, items, pillar]) =>
        items.length ? (
          <StaffSection key={number} number={number} title={title} tone={pillar === 'prevention' ? 'green' : pillar === 'defense' ? 'gold' : 'blue'}>
            <Stagger className="grid gap-4 md:grid-cols-2">
              {items.map((c) => (
                <StaggerItem key={c.id}>
                  <Card pillar={pillar} interactive className="h-full">
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
                        <StatusBadge status={c.status} labels={cohortStatusLabels} size="sm" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-1">
                          <UsersRound className="size-4" aria-hidden="true" />
                          {c._count.members} membre(s) · {c._count.sessions} session(s)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {c.nextSession ? `Prochaine session ${formatDateTime(c.nextSession.startsAt)}` : c.startsAt ? `${formatDate(c.startsAt)}${c.endsAt ? ` - ${formatDate(c.endsAt)}` : ''}` : 'Dates à confirmer'}
                        </span>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                        {c.organization ? <Badge variant="blue" size="sm">{c.organization.acronym ?? c.organization.name}</Badge> : <Badge variant="neutral" size="sm">Inscriptions individuelles</Badge>}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/formateur/cohortes/${c.id}`}>Ouvrir la cohorte</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </StaffSection>
        ) : null,
      )}

      {corrections.submissions.length || corrections.essays.length ? (
        <StaffSection number="04" title="File de corrections" tone="gold" description="Toutes cohortes confondues.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-display text-base font-semibold text-navy">Devoirs remis</h3>
                {corrections.submissions.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {corrections.submissions.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{personName(s.user)}</p>
                          <p className="text-xs text-neutral-500">
                            {s.assignment.activity.title} · {s.submittedAt ? formatDateTime(s.submittedAt) : ''}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/formateur/cohortes?remise=${s.id}`}>Corriger</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Aucun devoir en attente.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-display text-base font-semibold text-navy">Compositions soumises</h3>
                {corrections.essays.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {corrections.essays.map((e) => (
                      <li key={e.attemptId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{personName(e.user)}</p>
                          <p className="text-xs text-neutral-500">
                            {e.activity.title} · {e.pendingQuestions} question(s)
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/formateur/cohortes?tentative=${e.attemptId}`}>Corriger</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Aucune composition en attente.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </StaffSection>
      ) : null}
    </>
  )
}
