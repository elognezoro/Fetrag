import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, ClipboardList, Globe, Mail, MapPin, Phone, Plus, Users, UsersRound } from 'lucide-react'
import { cohortStatusLabels, trainingRequestStatusLabels } from '@fetrag/contracts'
import { formatDate, isDomainError } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, initials } from '@fetrag/ui'
import { personName } from '@/components/staff/format'
import { OrganizationForm } from '@/components/staff/organization-form'
import { AddOrganizationMemberForm, RemoveOrganizationMemberButton } from '@/components/staff/organization-members'
import { ProgressRing } from '@/components/staff/progress-ring'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { getOrganizationAdmin } from '@/server/staff/queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function load(id: string) {
  const principal = await guards.requireCan('organization.read', { organizationId: id }, `/coordination/organisations/${id}`)
  try {
    return await getOrganizationAdmin(principal, id)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const organization = await load(id)
  return { title: organization.acronym ?? organization.name }
}

/** Fiche d'une organisation affiliée : identité, gestionnaires et membres, demandes, cohortes, édition. */
export default async function CoordinationOrganizationPage({ params }: PageProps) {
  const { id } = await params
  const organization = await load(id)
  const managers = organization.memberships.filter((m) => m.isManager)
  const members = organization.memberships.filter((m) => !m.isManager)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Organisations', href: '/coordination/organisations' }, { label: organization.acronym ?? organization.name }]}
        eyebrow={organization.isAffiliate ? 'Organisation affiliée' : 'Organisation partenaire'}
        title={organization.acronym ? `${organization.acronym} · ${organization.name}` : organization.name}
        description={organization.description ?? [organization.sector, organization.city].filter(Boolean).join(' · ')}
        meta={
          <>
            {!organization.isActive ? <Badge variant="danger">Inactive</Badge> : null}
            {organization.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden="true" />
                {organization.city}
              </span>
            ) : null}
            {organization.email ? (
              <a href={`mailto:${organization.email}`} className="inline-flex items-center gap-1 hover:underline">
                <Mail className="size-4" aria-hidden="true" />
                {organization.email}
              </a>
            ) : null}
            {organization.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-4" aria-hidden="true" />
                {organization.phone}
              </span>
            ) : null}
            {organization.website ? (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                <Globe className="size-4" aria-hidden="true" />
                Site web
              </a>
            ) : null}
          </>
        }
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href={`/coordination/cohortes/nouvelle?organisation=${organization.id}`}>
              <Plus aria-hidden="true" />
              Cohorte pour cette organisation
            </Link>
          </Button>
        }
      />

      <StatGrid
        items={[
          { value: organization._count.memberships, label: 'Comptes rattachés', icon: Users, tone: 'blue', description: `${managers.length} gestionnaire(s)` },
          { value: organization._count.trainingRequests, label: 'Demandes de formation', icon: ClipboardList, tone: 'gold' },
          { value: organization._count.cohorts, label: 'Cohortes', icon: UsersRound, tone: 'green' },
          { value: organization.stats.certificates, label: 'Certificats', icon: Award, tone: 'navy', description: `${organization._count.enrollments} inscription(s)` },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card pillar="protection">
          <CardContent className="flex items-center justify-center p-5">
            <ProgressRing value={organization.stats.averageProgress} label="Progression moyenne des inscrits" />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <StaffSection number="01" title="Gestionnaires et membres" className="mb-0" description="Les gestionnaires déposent les demandes et consultent les rapports de l'organisation.">
            {organization.memberships.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compte</TableHead>
                    <TableHead>Fonction</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...managers, ...members].map((m) => {
                    const name = personName(m.user)
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{initials(name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-navy">{name}</p>
                              <p className="truncate text-xs text-neutral-500">{m.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-700">{m.title ?? m.user.jobTitle ?? '-'}</TableCell>
                        <TableCell>
                          {m.isManager ? <Badge variant="gold" size="sm">Gestionnaire</Badge> : <Badge variant="neutral" size="sm">Membre</Badge>}
                          {!m.user.isActive ? <Badge variant="danger" size="sm" className="ml-1">Inactif</Badge> : null}
                        </TableCell>
                        <TableCell className="text-neutral-600">{m.user.lastLoginAt ? formatDate(m.user.lastLoginAt) : 'Jamais'}</TableCell>
                        <TableCell className="text-right">{organization.canManage ? <RemoveOrganizationMemberButton organizationId={organization.id} userId={m.user.id} name={name} /> : null}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <Card>
                <EmptyState compact icon={Users} title="Aucun compte rattaché" description="Rattachez le responsable de l'organisation pour qu'il puisse déposer des demandes." />
              </Card>
            )}
            {organization.canManage ? (
              <div className="mt-4">
                <AddOrganizationMemberForm organizationId={organization.id} />
              </div>
            ) : null}
          </StaffSection>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <StaffSection number="02" title="Demandes récentes" tone="gold">
          {organization.trainingRequests.length ? (
            <ul className="flex flex-col gap-2">
              {organization.trainingRequests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                  <div>
                    <Link href={`/coordination/demandes/${r.id}`} className="font-semibold text-navy hover:underline">
                      {r.reference}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {r._count.modules} module(s), {r._count.participants} participant(s) · {r.submittedAt ? formatDate(r.submittedAt) : formatDate(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} labels={trainingRequestStatusLabels} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Aucune demande déposée.</p>
          )}
        </StaffSection>
        <StaffSection number="03" title="Cohortes" tone="green">
          {organization.cohorts.length ? (
            <ul className="flex flex-col gap-2">
              {organization.cohorts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                  <div>
                    <Link href={`/coordination/cohortes/${c.id}`} className="font-semibold text-navy hover:underline">
                      {c.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {c.course.title} · {c._count.members} membre(s) · {c.startsAt ? formatDate(c.startsAt) : 'dates à confirmer'}
                    </p>
                  </div>
                  <StatusBadge status={c.status} labels={cohortStatusLabels} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Aucune cohorte pour cette organisation.</p>
          )}
        </StaffSection>
      </div>

      {organization.canManage ? (
        <StaffSection number="04" title="Fiche de l'organisation" tone="navy" className="mt-4">
          <OrganizationForm
            organization={{
              id: organization.id,
              name: organization.name,
              acronym: organization.acronym,
              sector: organization.sector,
              description: organization.description,
              address: organization.address,
              city: organization.city,
              phone: organization.phone,
              email: organization.email,
              website: organization.website,
              isAffiliate: organization.isAffiliate,
              isActive: organization.isActive,
              memberCount: organization.memberCount,
            }}
          />
        </StaffSection>
      ) : null}
    </>
  )
}
