import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, BarChart3, CalendarDays, ClipboardCheck, ExternalLink, MessageSquareText, UserCheck, Users } from 'lucide-react'
import { cohortStatusLabels, sessionModeLabels } from '@fetrag/contracts'
import { isDomainError, formatDate, formatDateTime } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, EmptyState, Progress, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, initials } from '@fetrag/ui'
import { AttendanceSheet } from '@/components/staff/attendance-sheet'
import { CohortMessageForm } from '@/components/staff/cohort-message-form'
import { personName } from '@/components/staff/format'
import { EssayGradingForm, GradingForm } from '@/components/staff/grading-form'
import { ProgressRing } from '@/components/staff/progress-ring'
import { ExportLinks, MiniBar, ReportTable } from '@/components/staff/report-table'
import { RemoveSessionButton, SessionForm } from '@/components/staff/session-form'
import { DetailItem, DetailList, StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { loadAttendanceSheet, loadEssayReview, loadSubmission, loadTrainerCohort } from '@/server/staff/trainer-queries'

export const dynamic = 'force-dynamic'

const TABS = ['participants', 'presence', 'corrections', 'messages', 'statistiques', 'sessions'] as const
type Tab = (typeof TABS)[number]

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ onglet?: string; session?: string; remise?: string; tentative?: string }>
}

async function load(id: string) {
  const principal = await guards.requireUser(`/formateur/cohortes/${id}`)
  try {
    return { principal, data: await loadTrainerCohort(principal, id) }
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data } = await load(id)
  return { title: `Cohorte ${data.cohort.name}` }
}

/** Fiche d'une cohorte pour le formateur : onglets participants, présence, corrections, messages, statistiques, sessions. */
export default async function TrainerCohortPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const query = await searchParams
  const { principal, data } = await load(id)
  const { cohort, attendanceSummary, submissions, essays, report, liveActivities } = data
  const tab: Tab = (TABS as readonly string[]).includes(query.onglet ?? '') ? (query.onglet as Tab) : 'participants'
  const baseHref = `/formateur/cohortes/${cohort.id}`

  const now = Date.now()
  const defaultSession = cohort.sessions.find((s) => s.endsAt.getTime() >= now && s.startsAt.getTime() <= now + 36 * 3600 * 1000) ?? [...cohort.sessions].reverse().find((s) => s.startsAt.getTime() <= now) ?? cohort.sessions[0] ?? null
  const sessionId = query.session && cohort.sessions.some((s) => s.id === query.session) ? query.session : (defaultSession?.id ?? null)
  const sheet = sessionId ? await loadAttendanceSheet(principal, sessionId) : null
  const submission = query.remise ? await loadSubmission(principal, query.remise).catch(() => null) : null
  const review = query.tentative ? await loadEssayReview(principal, query.tentative).catch(() => null) : null
  const pendingSubmissions = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'LATE')
  const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED' || s.status === 'RETURNED')
  const liveOptions = liveActivities.map((a) => ({ id: a.id, title: a.title, linkedSessionId: a.liveSessions.find((l) => l.trainingSessionId)?.trainingSessionId ?? null }))
  const trainerName = cohort.trainer ? personName(cohort.trainer) : null

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Formateur', href: '/formateur' }, { label: 'Cohortes', href: '/formateur/cohortes' }, { label: cohort.name }]}
        eyebrow={`Cohorte ${cohort.code}`}
        title={cohort.name}
        description={`${cohort.course.title} · version ${cohort.courseVersion.version}${cohort.courseVersion.label ? ` (${cohort.courseVersion.label})` : ''}${cohort.organization ? ` · ${cohort.organization.name}` : ''}`}
        meta={
          <>
            <StatusBadge status={cohort.status} labels={cohortStatusLabels} />
            <span>{sessionModeLabels[cohort.mode]}</span>
            <span>{cohort.startsAt ? `${formatDate(cohort.startsAt)}${cohort.endsAt ? ` - ${formatDate(cohort.endsAt)}` : ''}` : 'Dates à confirmer'}</span>
            {cohort.location ? <span>{cohort.location}</span> : null}
          </>
        }
        actions={
          <>
            {cohort.forums[0] ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/forums/${cohort.forums[0].slug}`}>
                  <MessageSquareText aria-hidden="true" />
                  Forum
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/cours/${cohort.course.slug}`}>
                <ExternalLink aria-hidden="true" />
                Fiche du module
              </Link>
            </Button>
          </>
        }
        tone="green"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Membres" value={String(cohort.stats.members)} tone="blue" />
        <Stat icon={UserCheck} label="Formation terminée" value={`${cohort.stats.completed}`} tone="green" hint={`${cohort.stats.active} en cours`} />
        <Stat icon={ClipboardCheck} label="Corrections en attente" value={String(pendingSubmissions.length + essays.length)} tone="gold" />
        <Stat icon={Award} label="Certificats émis" value={String(cohort.stats.certificates)} tone="navy" />
      </div>

      <Tabs defaultValue={tab} className="flex flex-col">
        <TabsList variant="underline" aria-label="Sections de la cohorte" className="w-full">
          <TabsTrigger value="participants" asChild>
            <Link href={`${baseHref}?onglet=participants`}>
              <Users aria-hidden="true" />
              Participants
            </Link>
          </TabsTrigger>
          <TabsTrigger value="presence" asChild>
            <Link href={`${baseHref}?onglet=presence`}>
              <UserCheck aria-hidden="true" />
              Présence
            </Link>
          </TabsTrigger>
          <TabsTrigger value="corrections" asChild>
            <Link href={`${baseHref}?onglet=corrections`}>
              <ClipboardCheck aria-hidden="true" />
              Corrections {pendingSubmissions.length + essays.length ? <Badge variant="gold" size="sm">{pendingSubmissions.length + essays.length}</Badge> : null}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="messages" asChild>
            <Link href={`${baseHref}?onglet=messages`}>
              <MessageSquareText aria-hidden="true" />
              Messages
            </Link>
          </TabsTrigger>
          <TabsTrigger value="statistiques" asChild>
            <Link href={`${baseHref}?onglet=statistiques`}>
              <BarChart3 aria-hidden="true" />
              Statistiques
            </Link>
          </TabsTrigger>
          <TabsTrigger value="sessions" asChild>
            <Link href={`${baseHref}?onglet=sessions`}>
              <CalendarDays aria-hidden="true" />
              Sessions
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          {cohort.members.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Assiduité</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohort.members
                  .filter((m) => m.role === 'learner')
                  .map((m) => {
                    const name = personName(m.user)
                    const rate = attendanceSummary?.members.find((x) => x.user.id === m.userId)?.rate ?? null
                    const memberReport = report?.members.find((x) => x.userId === m.userId)
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{initials(name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-navy">{name}</p>
                              <p className="truncate text-xs text-neutral-500">{m.user.jobTitle ?? m.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[10rem]">
                          <Progress value={m.enrollment?.progressPercent ?? 0} size="sm" showValue label={`Progression de ${name}`} />
                        </TableCell>
                        <TableCell>{m.enrollment?.score === null || m.enrollment?.score === undefined ? '-' : `${m.enrollment.score} %`}</TableCell>
                        <TableCell>{rate === null ? '-' : `${rate} %`}</TableCell>
                        <TableCell className="text-neutral-600">{memberReport?.completedAt ? `Terminé le ${formatDate(memberReport.completedAt)}` : m.enrollment?.completedAt ? formatDate(m.enrollment.completedAt) : '-'}</TableCell>
                        <TableCell>
                          {m.enrollment ? <StatusBadge status={m.enrollment.status} size="sm" /> : <Badge variant="neutral" size="sm">Sans inscription</Badge>}
                          {m.enrollment?.certificates.length ? <Badge variant="success" size="sm" className="ml-1">Certifié</Badge> : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <EmptyState compact icon={Users} title="Aucun participant" description="La coordination ajoute les membres lors de la planification ou depuis la fiche de la cohorte." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="presence">
          {sheet ? (
            <AttendanceSheet sheet={sheet} sessions={cohort.sessions.map((s) => ({ id: s.id, title: s.title, startsAt: s.startsAt }))} baseHref={baseHref} />
          ) : (
            <Card>
              <EmptyState compact icon={CalendarDays} title="Aucune session" description="Ajoutez une session dans l'onglet Sessions pour ouvrir une feuille d'émargement." action={<SessionForm cohortId={cohort.id} liveActivities={liveOptions} defaultTrainerName={trainerName} />} />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="corrections" className="flex flex-col gap-6">
          {submission ? (
            <Card pillar="defense">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-navy">Correction du devoir</h3>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`${baseHref}?onglet=corrections`}>Fermer</Link>
                  </Button>
                </div>
                <GradingForm submission={submission} cohortId={cohort.id} />
              </CardContent>
            </Card>
          ) : null}
          {review ? (
            <Card pillar="defense">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-navy">Correction des compositions</h3>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`${baseHref}?onglet=corrections`}>Fermer</Link>
                  </Button>
                </div>
                <EssayGradingForm review={review} cohortId={cohort.id} />
              </CardContent>
            </Card>
          ) : null}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-display text-base font-semibold text-navy">Devoirs à noter ({pendingSubmissions.length})</h3>
                {pendingSubmissions.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {pendingSubmissions.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{personName(s.user)}</p>
                          <p className="text-xs text-neutral-500">
                            {s.assignment.activity.title} · remis le {s.submittedAt ? formatDateTime(s.submittedAt) : '-'}
                            {s.isLate ? ' · en retard' : ''}
                          </p>
                        </div>
                        <Button asChild variant={query.remise === s.id ? 'primary' : 'outline'} size="sm">
                          <Link href={`${baseHref}?onglet=corrections&remise=${s.id}`}>Corriger</Link>
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
                <h3 className="mb-3 font-display text-base font-semibold text-navy">Compositions à noter ({essays.length})</h3>
                {essays.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {essays.map((e) => (
                      <li key={e.attemptId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold text-navy">{personName(e.user)}</p>
                          <p className="text-xs text-neutral-500">
                            {e.activity.title} · {e.pendingQuestions} question(s) · {e.submittedAt ? formatDateTime(e.submittedAt) : ''}
                          </p>
                        </div>
                        <Button asChild variant={query.tentative === e.attemptId ? 'primary' : 'outline'} size="sm">
                          <Link href={`${baseHref}?onglet=corrections&tentative=${e.attemptId}`}>Corriger</Link>
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
          {gradedSubmissions.length ? (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-display text-base font-semibold text-navy">Devoirs corrigés ({gradedSubmissions.length})</h3>
                <ul className="divide-y divide-neutral-100">
                  {gradedSubmissions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <div>
                        <p className="font-semibold text-navy">{personName(s.user)}</p>
                        <p className="text-xs text-neutral-500">
                          {s.assignment.activity.title}
                          {s.grade ? ` · ${s.grade.score} / ${s.grade.maxScore}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} size="sm" />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`${baseHref}?onglet=corrections&remise=${s.id}`}>Revoir</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <CohortMessageForm cohortId={cohort.id} memberCount={cohort.members.filter((m) => m.role === 'learner').length} hasForum={Boolean(cohort.forums[0])} />
            <Card pillar="prevention">
              <CardContent className="flex flex-col gap-3 p-5 text-sm text-neutral-700">
                <h3 className="font-display text-base font-semibold text-navy">Forum de la cohorte</h3>
                {cohort.forums[0] ? (
                  <>
                    <p>Le forum « {cohort.forums[0].title} » est l’espace d’échange des participants : questions, ressources partagées, retours d’expérience.</p>
                    <Button asChild variant="outline" size="sm" className="w-fit">
                      <Link href={`/forums/${cohort.forums[0].slug}`}>Ouvrir le forum</Link>
                    </Button>
                  </>
                ) : (
                  <p>Aucun forum n’est rattaché à cette cohorte.</p>
                )}
                <p className="text-xs text-neutral-500">Les messages envoyés depuis ce formulaire apparaissent dans les notifications de chaque participant et, si vous le cochez, par email.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistiques">
          {report ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-600">Rapport de cohorte au {formatDate(new Date())}.</p>
                <ExportLinks csvHref={`/coordination/rapports/export?kind=cohorte&format=csv&cohort=${cohort.id}`} pdfHref={`/coordination/rapports/export?kind=cohorte&format=pdf&cohort=${cohort.id}`} />
              </div>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-around gap-6 p-6">
                  <ProgressRing value={report.stats.averageProgress} label="Progression moyenne" />
                  <ProgressRing value={report.stats.completionRate} label="Taux d'achèvement" tone="blue" />
                  {report.stats.averageScore !== null ? <ProgressRing value={report.stats.averageScore} label="Score moyen" tone="gold" /> : null}
                  {report.stats.averageAttendance !== null ? <ProgressRing value={report.stats.averageAttendance} label="Assiduité moyenne" tone="green" /> : null}
                </CardContent>
              </Card>
              <DetailList columns={4}>
                <DetailItem label="Membres">{report.stats.members}</DetailItem>
                <DetailItem label="Réussite aux évaluations">{report.stats.passRate === null ? '-' : `${report.stats.passRate} %`}</DetailItem>
                <DetailItem label="Sessions réalisées">{`${report.stats.pastSessions} / ${report.stats.sessions}`}</DetailItem>
                <DetailItem label="Certificats">{report.stats.certificates}</DetailItem>
              </DetailList>
              <ReportTable
                caption="Assiduité par session"
                columns={[
                  { key: 'session', label: 'Session' },
                  { key: 'date', label: 'Date' },
                  { key: 'present', label: 'Présents', align: 'right' },
                  { key: 'late', label: 'Retards', align: 'right' },
                  { key: 'absent', label: 'Absents', align: 'right' },
                  { key: 'excused', label: 'Excusés', align: 'right' },
                  { key: 'rate', label: 'Taux' },
                ]}
                rows={report.sessions.map((s) => {
                  const total = s.present + s.late + s.absent + s.excused
                  return {
                    session: <span className="font-semibold text-navy">{s.title}</span>,
                    date: formatDateTime(s.startsAt),
                    present: s.present,
                    late: s.late,
                    absent: s.absent,
                    excused: s.excused,
                    rate: <MiniBar value={total ? ((s.present + s.late) / total) * 100 : 0} label="Taux de présence" />,
                  }
                })}
                rowKey={(_, index) => report.sessions[index]?.id ?? String(index)}
                emptyLabel="Aucune session planifiée."
              />
            </div>
          ) : (
            <Card>
              <EmptyState compact icon={BarChart3} title="Statistiques indisponibles" description="Le rapport de cohorte n'a pas pu être calculé." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600">{cohort.sessions.length} session(s) planifiée(s). Les convocations sont envoyées aux membres à la création.</p>
              <SessionForm cohortId={cohort.id} liveActivities={liveOptions} defaultTrainerName={trainerName} />
            </div>
            {cohort.sessions.length ? (
              <ul className="flex flex-col gap-3">
                {cohort.sessions.map((s, index) => {
                  const past = s.endsAt.getTime() < now
                  return (
                    <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-green-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-semibold text-navy">{s.title}</p>
                          <p className="text-xs text-neutral-500">
                            {formatDateTime(s.startsAt)} - {formatDateTime(s.endsAt)} · {sessionModeLabels[s.mode]}
                            {s.location ? ` · ${s.location}` : ''}
                            {s.trainerName ? ` · ${s.trainerName}` : ''}
                          </p>
                          <p className="mt-1 flex flex-wrap gap-2 text-xs">
                            <Badge variant={past ? 'neutral' : 'green'} size="sm">
                              {past ? 'Réalisée' : 'À venir'}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {s._count.attendances} présence(s) enregistrée(s)
                            </Badge>
                            {s.liveSession ? <Badge variant="blue" size="sm">Activité liée</Badge> : null}
                            {s.meetingUrl ? (
                              <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                                Lien visio <ExternalLink className="size-3" aria-hidden="true" />
                              </a>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`${baseHref}?onglet=presence&session=${s.id}`}>Émarger</Link>
                        </Button>
                        <SessionForm cohortId={cohort.id} liveActivities={liveOptions} defaultTrainerName={trainerName} session={{ id: s.id, title: s.title, description: s.description, mode: s.mode, startsAt: s.startsAt, endsAt: s.endsAt, location: s.location, meetingUrl: s.meetingUrl, trainerName: s.trainerName, activityId: s.liveSession?.activityId ?? null }} />
                        <RemoveSessionButton sessionId={s.id} cohortId={cohort.id} title={s.title} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <Card>
                <EmptyState compact icon={CalendarDays} title="Aucune session" description="Planifiez les séances de la cohorte : présentiel, classe virtuelle ou hybride." />
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

function Stat({ icon: Icon, label, value, hint, tone }: { icon: typeof Users; label: string; value: string; hint?: string; tone: 'blue' | 'green' | 'gold' | 'navy' }) {
  const color = tone === 'green' ? 'bg-green-50 text-green-700' : tone === 'gold' ? 'bg-gold-50 text-gold-700' : tone === 'navy' ? 'bg-neutral-100 text-navy' : 'bg-blue-50 text-blue-600'
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none text-navy">{value}</p>
        <p className="mt-1 text-xs text-neutral-500">
          {label}
          {hint ? ` · ${hint}` : ''}
        </p>
      </div>
    </div>
  )
}
