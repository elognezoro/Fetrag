import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, CalendarDays, ClipboardList, ExternalLink, GraduationCap, MessageSquareText, Pencil, Users } from 'lucide-react'
import { cohortStatusLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime, isDomainError } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, EmptyState, Progress, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, initials } from '@fetrag/ui'
import { IssueCertificateButton } from '@/components/staff/certificate-actions'
import { CohortActions } from '@/components/staff/cohort-actions'
import { CohortForm } from '@/components/staff/cohort-form'
import { personName } from '@/components/staff/format'
import { MemberPicker, RemoveMemberButton } from '@/components/staff/member-picker'
import { ProgressRing } from '@/components/staff/progress-ring'
import { ExportLinks } from '@/components/staff/report-table'
import { RemoveSessionButton, SessionForm } from '@/components/staff/session-form'
import { DetailItem, DetailList, StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { loadCoordinationCohort } from '@/server/staff/coordination-queries'
import { cohortEligibility, listCoursesForSelect, listOrganizationsForSelect, listTrainers } from '@/server/staff/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ onglet?: string }>
}

async function load(id: string) {
  const principal = await guards.requireCan('cohort.manage', {}, `/coordination/cohortes/${id}`)
  try {
    return { principal, data: await loadCoordinationCohort(principal, id) }
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

const TABS = ['membres', 'sessions', 'certificats', 'parametres'] as const

/** Fiche de cohorte pour la coordination : membres, sessions, certificats, paramètres, clôture. */
export default async function CoordinationCohortPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { onglet } = await searchParams
  const { principal, data } = await load(id)
  const { cohort, templates, attendanceSummary, liveActivities } = data
  const tab = (TABS as readonly string[]).includes(onglet ?? '') ? onglet! : 'membres'
  const baseHref = `/coordination/cohortes/${cohort.id}`
  const [courses, organizations, trainers, eligibility] = await Promise.all([
    listCoursesForSelect(),
    listOrganizationsForSelect(),
    listTrainers(),
    tab === 'certificats' ? cohortEligibility(principal, cohort.id).catch(() => null) : Promise.resolve(null),
  ])
  const learners = cohort.members.filter((m) => m.role === 'learner')
  const liveOptions = liveActivities.map((a) => ({ id: a.id, title: a.title, linkedSessionId: a.liveSessions.find((l) => l.trainingSessionId)?.trainingSessionId ?? null }))
  const trainerName = cohort.trainer ? personName(cohort.trainer) : null
  const now = Date.now()

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Cohortes', href: '/coordination/cohortes' }, { label: cohort.name }]}
        eyebrow={`Cohorte ${cohort.code}`}
        title={cohort.name}
        description={`${cohort.course.title} · version ${cohort.courseVersion.version}${cohort.courseVersion.label ? ` (${cohort.courseVersion.label})` : ''}${cohort.organization ? ` · ${cohort.organization.name}` : ' · inscriptions individuelles'}`}
        meta={
          <>
            <StatusBadge status={cohort.status} labels={cohortStatusLabels} />
            <span>{sessionModeLabels[cohort.mode]}</span>
            <span>{cohort.startsAt ? `${formatDate(cohort.startsAt)}${cohort.endsAt ? ` - ${formatDate(cohort.endsAt)}` : ''}` : 'Dates à confirmer'}</span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="size-4" aria-hidden="true" />
              {trainerName ?? 'Formateur à désigner'}
            </span>
          </>
        }
        actions={<CohortActions cohortId={cohort.id} status={cohort.status} templates={templates.map((t) => ({ id: t.id, name: t.name, kind: t.kind, isDefault: t.isDefault }))} memberCount={learners.length} />}
        tone="green"
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card pillar="prevention">
          <CardContent className="flex flex-wrap items-center justify-around gap-4 p-5">
            <ProgressRing value={cohort.stats.averageProgress} label="Progression moyenne" size={112} />
            {attendanceSummary?.averageRate !== null && attendanceSummary?.averageRate !== undefined ? <ProgressRing value={attendanceSummary.averageRate} label="Assiduité" tone="blue" size={112} /> : null}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <DetailList columns={4}>
              <DetailItem label="Membres">{`${cohort.stats.members}${cohort.capacity ? ` / ${cohort.capacity}` : ''}`}</DetailItem>
              <DetailItem label="Terminés">{`${cohort.stats.completed} (${cohort.stats.active} en cours)`}</DetailItem>
              <DetailItem label="Sessions">{`${cohort.sessions.length} (${cohort.sessions.filter((s) => s.endsAt.getTime() < now).length} réalisées)`}</DetailItem>
              <DetailItem label="Certificats">{cohort.stats.certificates}</DetailItem>
              <DetailItem label="Lieu">{cohort.location}</DetailItem>
              <DetailItem label="Demande liée">
                {cohort.trainingRequest ? (
                  <Link href={`/coordination/demandes/${cohort.trainingRequest.id}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                    <ClipboardList className="size-4" aria-hidden="true" />
                    {cohort.trainingRequest.reference}
                  </Link>
                ) : null}
              </DetailItem>
              <DetailItem label="Forum">
                {cohort.forums[0] ? (
                  <Link href={`/forums/${cohort.forums[0].slug}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                    <MessageSquareText className="size-4" aria-hidden="true" />
                    {cohort.forums[0].title}
                  </Link>
                ) : null}
              </DetailItem>
              <DetailItem label="Espace formateur">
                <Link href={`/formateur/cohortes/${cohort.id}`} className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Présences et corrections
                </Link>
              </DetailItem>
            </DetailList>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList variant="underline" aria-label="Sections de la cohorte" className="w-full">
          <TabsTrigger value="membres" asChild>
            <Link href={`${baseHref}?onglet=membres`}>
              <Users aria-hidden="true" />
              Membres
            </Link>
          </TabsTrigger>
          <TabsTrigger value="sessions" asChild>
            <Link href={`${baseHref}?onglet=sessions`}>
              <CalendarDays aria-hidden="true" />
              Sessions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="certificats" asChild>
            <Link href={`${baseHref}?onglet=certificats`}>
              <Award aria-hidden="true" />
              Certificats
            </Link>
          </TabsTrigger>
          <TabsTrigger value="parametres" asChild>
            <Link href={`${baseHref}?onglet=parametres`}>
              <Pencil aria-hidden="true" />
              Paramètres
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membres" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">{learners.length} participant(s) inscrit(s) sur la version {cohort.courseVersion.version}.</p>
            {cohort.status !== 'CLOSED' && cohort.status !== 'CANCELLED' ? <MemberPicker cohortId={cohort.id} organizationId={cohort.organizationId} organizationName={cohort.organization?.name} /> : null}
          </div>
          {learners.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Assiduité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.map((m) => {
                  const name = personName(m.user)
                  const rate = attendanceSummary?.members.find((x) => x.user.id === m.userId)?.rate ?? null
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy">{name}</p>
                            <p className="truncate text-xs text-neutral-500">
                              {m.user.email}
                              {m.user.jobTitle ? ` · ${m.user.jobTitle}` : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[10rem]">
                        <Progress value={m.enrollment?.progressPercent ?? 0} size="sm" showValue label={`Progression de ${name}`} />
                      </TableCell>
                      <TableCell>{m.enrollment?.score === null || m.enrollment?.score === undefined ? '-' : `${m.enrollment.score} %`}</TableCell>
                      <TableCell>{rate === null ? '-' : `${rate} %`}</TableCell>
                      <TableCell>
                        {m.enrollment ? <StatusBadge status={m.enrollment.status} size="sm" /> : <Badge variant="neutral" size="sm">Sans inscription</Badge>}
                        {m.enrollment?.certificates.length ? <Badge variant="success" size="sm" className="ml-1">{m.enrollment.certificates[0]?.number}</Badge> : null}
                      </TableCell>
                      <TableCell className="text-right">{cohort.status !== 'CLOSED' ? <RemoveMemberButton cohortId={cohort.id} userId={m.userId} name={name} /> : null}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <EmptyState compact icon={Users} title="Aucun membre" description="Ajoutez des participants depuis les comptes existants ou les membres de l'organisation." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">{cohort.sessions.length} session(s). Les convocations partent à la création si l’option est cochée.</p>
            <SessionForm cohortId={cohort.id} liveActivities={liveOptions} defaultTrainerName={trainerName} />
          </div>
          {cohort.sessions.length ? (
            <ul className="flex flex-col gap-3">
              {cohort.sessions.map((s, index) => (
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
                      <p className="mt-1 flex flex-wrap gap-2">
                        <Badge variant={s.endsAt.getTime() < now ? 'neutral' : 'green'} size="sm">
                          {s.endsAt.getTime() < now ? 'Réalisée' : 'À venir'}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {s._count.attendances} présence(s)
                        </Badge>
                        {s.liveSession ? <Badge variant="blue" size="sm">Activité liée</Badge> : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/formateur/cohortes/${cohort.id}?onglet=presence&session=${s.id}`}>Émargement</Link>
                    </Button>
                    <SessionForm cohortId={cohort.id} liveActivities={liveOptions} defaultTrainerName={trainerName} session={{ id: s.id, title: s.title, description: s.description, mode: s.mode, startsAt: s.startsAt, endsAt: s.endsAt, location: s.location, meetingUrl: s.meetingUrl, trainerName: s.trainerName, activityId: s.liveSession?.activityId ?? null }} />
                    <RemoveSessionButton sessionId={s.id} cohortId={cohort.id} title={s.title} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <EmptyState compact icon={CalendarDays} title="Aucune session" description="Planifiez les séances de la cohorte." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificats" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">Éligibilité calculée selon le modèle par défaut du cours : achèvement, score minimal, assiduité.</p>
            <ExportLinks csvHref={`/coordination/rapports/export?kind=cohorte&format=csv&cohort=${cohort.id}`} pdfHref={`/coordination/rapports/export?kind=cohorte&format=pdf&cohort=${cohort.id}`} />
          </div>
          {eligibility && eligibility.rows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Assiduité</TableHead>
                  <TableHead>Éligibilité</TableHead>
                  <TableHead>
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibility.rows.map((row) => (
                  <TableRow key={row.enrollment.id}>
                    <TableCell className="font-semibold text-navy">{row.holderName}</TableCell>
                    <TableCell>{row.enrollment.progressPercent} %</TableCell>
                    <TableCell>{row.enrollment.score === null ? '-' : `${row.enrollment.score} %`}</TableCell>
                    <TableCell>{row.eligibility.attendanceRate === null ? '-' : `${row.eligibility.attendanceRate} %`}</TableCell>
                    <TableCell>
                      {row.eligibility.existingCertificateId ? (
                        <Badge variant="success" size="sm">Émis</Badge>
                      ) : row.eligibility.eligible ? (
                        <Badge variant="green" size="sm">Éligible</Badge>
                      ) : (
                        <span className="text-xs text-gold-800">{row.eligibility.reasons.join(' ; ') || 'Non éligible'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <IssueCertificateButton enrollmentId={row.enrollment.id} holderName={row.holderName} eligible={row.eligibility.eligible} reasons={row.eligibility.reasons} existingCertificateId={row.eligibility.existingCertificateId} templates={templates.map((t) => ({ id: t.id, name: t.name, isDefault: t.isDefault }))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <EmptyState compact icon={Award} title="Aucune inscription à certifier" description="Les membres inscrits apparaîtront ici avec leur éligibilité." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="parametres">
          <CohortForm
            courses={courses}
            organizations={organizations}
            trainers={trainers}
            cohort={{
              id: cohort.id,
              name: cohort.name,
              courseId: cohort.courseId,
              organizationId: cohort.organizationId,
              trainerId: cohort.trainerId,
              mode: cohort.mode,
              capacity: cohort.capacity,
              startsAt: cohort.startsAt,
              endsAt: cohort.endsAt,
              location: cohort.location,
              description: cohort.description,
              isPrivate: cohort.isPrivate,
              status: cohort.status,
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
