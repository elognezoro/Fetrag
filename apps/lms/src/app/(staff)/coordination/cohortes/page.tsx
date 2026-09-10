import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Plus, UserCheck, UsersRound } from 'lucide-react'
import { cohortStatuses, cohortStatusLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { cohorts } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, EmptyState, Pagination, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { ApproveEnrollmentButton } from '@/components/staff/cohort-actions'
import { FilterBar } from '@/components/staff/filter-bar'
import { personName } from '@/components/staff/format'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listPendingEnrollments } from '@/server/staff/coordination-queries'
import { listCoursesForSelect, listOrganizationsForSelect } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Cohortes' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ statut?: string; cours?: string; organisation?: string; q?: string; page?: string; onglet?: string }>
}

/** Cohortes (liste filtrée, création manuelle) et inscriptions en attente de validation. */
export default async function CoordinationCohortsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('cohort.manage', {}, '/coordination/cohortes')
  const params = await searchParams
  const status = (cohortStatuses as readonly string[]).includes(params.statut ?? '') ? (params.statut as (typeof cohortStatuses)[number]) : undefined
  const page = readPage(params.page)
  const [list, courses, organizations, pending] = await Promise.all([
    cohorts.list(principal, { status, courseId: params.cours || undefined, organizationId: params.organisation || undefined, q: params.q || undefined, page, pageSize: 20 }),
    listCoursesForSelect(),
    listOrganizationsForSelect(),
    listPendingEnrollments(principal, { pageSize: 20 }).catch(() => null),
  ])
  const hrefFor = (p: number) => buildHref('/coordination/cohortes', { statut: params.statut, cours: params.cours, organisation: params.organisation, q: params.q, page: p > 1 ? p : undefined })

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Cohortes' }]}
        eyebrow="Cohortes"
        title={
          <>
            {list.total} cohorte{list.total > 1 ? 's' : ''} <span className="italic text-green-700">planifiées ou animées</span>
          </>
        }
        description="Une cohorte réunit des participants sur une version figée d'un module, avec un formateur, des sessions et un forum. Elle naît d'une demande planifiée ou d'une création manuelle."
        tone="green"
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/coordination/cohortes/nouvelle">
              <Plus aria-hidden="true" />
              Créer une cohorte
            </Link>
          </Button>
        }
      />

      <FilterBar
        action="/coordination/cohortes"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Nom ou code', value: params.q },
          { name: 'statut', label: 'Statut', type: 'select', value: params.statut, options: cohortStatuses.map((s) => ({ value: s, label: cohortStatusLabels[s] })) },
          { name: 'cours', label: 'Module', type: 'select', value: params.cours, options: courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })) },
          { name: 'organisation', label: 'Organisation', type: 'select', value: params.organisation, placeholder: 'Toutes', options: organizations.map((o) => ({ value: o.id, label: o.acronym ?? o.name })) },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohorte</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="min-w-[14rem]">
                    <Link href={`/coordination/cohortes/${c.id}`} className="font-semibold text-navy hover:underline">
                      {c.name}
                    </Link>
                    <span className="block text-xs text-neutral-500">
                      {c.code} · {sessionModeLabels[c.mode]}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[12rem]">{c.course.title}</TableCell>
                  <TableCell>{c.organization ? (c.organization.acronym ?? c.organization.name) : <span className="text-neutral-400">Individuels</span>}</TableCell>
                  <TableCell className="min-w-[10rem]">{c.trainer ? personName(c.trainer) : <Badge variant="warning" size="sm">À désigner</Badge>}</TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-600">{c.startsAt ? `${formatDate(c.startsAt)}${c.endsAt ? ` - ${formatDate(c.endsAt)}` : ''}` : '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {c._count.members}
                    {c.capacity ? ` / ${c.capacity}` : ''} · {c._count.sessions} session(s)
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} labels={cohortStatusLabels} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
        </>
      ) : (
        <Card>
          <EmptyState icon={UsersRound} title="Aucune cohorte" description="Créez une cohorte manuellement ou planifiez une demande de formation acceptée." action={<Button asChild variant="primary"><Link href="/coordination/cohortes/nouvelle">Créer une cohorte</Link></Button>} />
        </Card>
      )}

      {pending && pending.items.length ? (
        <StaffSection number="02" title={`Inscriptions à valider (${pending.total})`} tone="gold" className="mt-10" description="Cours à inscription sur validation : confirmez pour activer l'accès au contenu.">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-neutral-100">
                {pending.items.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-navy">{personName(e.user)}</p>
                      <p className="text-xs text-neutral-500">
                        {e.course.title}
                        {e.organization ? ` · ${e.organization.name}` : ''} · demandée le {formatDateTime(e.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">
                        <UserCheck className="size-3" aria-hidden="true" />
                        En attente
                      </Badge>
                      <ApproveEnrollmentButton enrollmentId={e.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </StaffSection>
      ) : null}

      <p className="mt-8 inline-flex items-center gap-2 text-xs text-neutral-500">
        <CalendarDays className="size-4" aria-hidden="true" />
        Le planning global des sessions est consultable dans la rubrique Sessions.
      </p>
    </>
  )
}
