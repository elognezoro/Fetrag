import type { Metadata } from 'next'
import { Download, Users } from 'lucide-react'
import { formatDate } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, EmptyState, Progress, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, initials } from '@fetrag/ui'
import { OrgSwitcher } from '@/components/staff/org-switcher'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { personName } from '@/components/staff/format'
import { guards } from '@/lib/auth'
import { canAccessOrganizationSpace } from '@/server/staff/navigation'
import { currentOrganization } from '@/server/staff/org-context'
import { organizationParticipants } from '@/server/staff/organizations'

export const metadata: Metadata = { title: 'Participants' }
export const dynamic = 'force-dynamic'

/** Membres de l'organisation avec la progression de chaque inscription (LMS-09) et export CSV. */
export default async function OrganisationParticipantsPage() {
  const principal = await guards.requireUser('/organisation/participants')
  if (!canAccessOrganizationSpace(principal)) return null
  const { organizations, current } = await currentOrganization(principal)
  if (!current) return null
  const rows = await organizationParticipants(principal, current.id)
  const totalEnrollments = rows.reduce((s, r) => s + r.enrollments.length, 0)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Organisation', href: '/organisation' }, { label: 'Participants' }]}
        eyebrow="Participants"
        title={
          <>
            {rows.length} membre{rows.length > 1 ? 's' : ''} <span className="italic text-green-700">en formation</span>
          </>
        }
        description={`${totalEnrollments} inscription(s) au titre de ${current.name}. Les gestionnaires apparaissent en tête de liste.`}
        actions={
          <>
            <OrgSwitcher organizations={organizations} currentId={current.id} />
            <Button asChild variant="outline" size="sm">
              <a href={`/organisation/participants/export?format=csv`}>
                <Download aria-hidden="true" />
                Export CSV
              </a>
            </Button>
          </>
        }
        tone="green"
      />

      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead>Inscriptions et progression</TableHead>
              <TableHead>Certificats</TableHead>
              <TableHead>Dernière activité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.membership.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(personName(row.user))}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                        {personName(row.user)}
                        {row.membership.isManager ? <Badge variant="gold" size="sm">Gestionnaire</Badge> : null}
                        {!row.user.isActive ? <Badge variant="danger" size="sm">Inactif</Badge> : null}
                      </p>
                      <p className="text-xs text-neutral-500">{row.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-700">{row.membership.title ?? row.user.jobTitle ?? '-'}</TableCell>
                <TableCell>
                  {row.enrollments.length ? (
                    <ul className="flex min-w-[16rem] flex-col gap-2">
                      {row.enrollments.map((e) => (
                        <li key={e.id} className="flex flex-col gap-1">
                          <span className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-ink">{e.course.title}</span>
                            <StatusBadge status={e.status} size="sm" />
                          </span>
                          <Progress value={e.progressPercent} size="sm" showValue label={`Progression ${e.course.title}`} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-neutral-500">Aucune inscription</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.certificates ? (
                    <Badge variant="success">{row.certificates}</Badge>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-neutral-600">{row.lastActivityAt ? formatDate(row.lastActivityAt) : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <EmptyState icon={Users} title="Aucun membre rattaché" description="Les participants sont rattachés à l'organisation lors de la planification d'une demande de formation ou par la coordination." />
        </Card>
      )}
    </>
  )
}
