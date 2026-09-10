import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, BookOpen, Building2, GraduationCap, Mail, Phone, ShieldCheck, UsersRound } from 'lucide-react'
import { certificateStatusLabels, cohortStatusLabels, enrollmentStatusLabels, roleLabels, type ScopeTypeName } from '@fetrag/contracts'
import { can, formatDate, formatDateTime, isDomainError } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, EmptyState, Progress, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, initials } from '@fetrag/ui'
import { CertificateRowActions } from '@/components/staff/certificate-actions'
import { RevokeRoleButton, RoleForm, UserActiveToggle } from '@/components/staff/role-form'
import { DetailItem, DetailList, StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { loadUserAdmin } from '@/server/staff/admin-user-queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const scopeLabels: Record<ScopeTypeName, string> = { GLOBAL: 'Globale', ORGANIZATION: 'Organisation', COURSE: 'Cours', COHORT: 'Cohorte' }

async function load(id: string) {
  const principal = await guards.requireCan('users.read', {}, `/admin/utilisateurs/${id}`)
  try {
    return { principal, data: await loadUserAdmin(principal, id) }
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data } = await load(id)
  return { title: `Compte · ${data.user.displayName}` }
}

/**
 * Fiche d'un compte : identité et sécurité, rôles LMS avec portée et expiration (attribution / retrait),
 * organisations rattachées, inscriptions, certificats, cours et cohortes enseignés.
 */
export default async function AdminUserPage({ params }: PageProps) {
  const { id } = await params
  const { principal, data } = await load(id)
  const { user, certificates, enrollmentTotal, capabilities, selects, roleAssignments } = data
  const canIssue = can(principal, 'certificate.issue')
  const isSelf = user.id === principal.id
  const activeAssignments = roleAssignments.filter((r) => !r.expiresAt || new Date(r.expiresAt).getTime() > Date.now())

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Utilisateurs et rôles', href: '/admin/utilisateurs' }, { label: user.displayName }]}
        eyebrow={user.isActive ? 'Compte actif' : 'Compte désactivé'}
        title={
          <span className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
            </Avatar>
            {user.displayName}
          </span>
        }
        description={[user.jobTitle, user.employer].filter(Boolean).join(' · ') || undefined}
        tone="navy"
        meta={
          <>
            {!user.isActive ? <Badge variant="danger">Désactivé</Badge> : null}
            {user.totpEnabled ? <Badge variant="success">MFA activée</Badge> : <Badge variant="neutral">Sans MFA</Badge>}
            <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1 hover:underline">
              <Mail className="size-4" aria-hidden="true" />
              {user.email}
            </a>
            {user.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-4" aria-hidden="true" />
                {user.phone}
              </span>
            ) : null}
            <span>Créé le {formatDate(user.createdAt)}</span>
            <span>{user.lastLoginAt ? `Dernière connexion ${formatDateTime(user.lastLoginAt)}` : 'Jamais connecté'}</span>
          </>
        }
        actions={user.canManageUsers && !isSelf ? <UserActiveToggle userId={user.id} isActive={user.isActive} /> : undefined}
      />

      <StatGrid
        items={[
          { value: activeAssignments.length, label: 'Rôles actifs', icon: ShieldCheck, tone: 'blue', description: roleAssignments.length > activeAssignments.length ? `${roleAssignments.length - activeAssignments.length} expiré(s)` : 'Apprenant par défaut' },
          { value: user.memberships.length, label: 'Organisations', icon: Building2, tone: 'green', description: `${user.memberships.filter((m) => m.isManager).length} en tant que gestionnaire` },
          { value: enrollmentTotal, label: 'Inscriptions', icon: BookOpen, tone: 'gold', description: `${user.enrollments.filter((e) => e.status === 'COMPLETED').length} terminée(s) sur les 10 dernières` },
          { value: certificates.length, label: 'Certificats', icon: Award, tone: 'navy', description: `${certificates.filter((c) => c.status === 'ISSUED').length} en cours de validité` },
        ]}
      />

      <StaffSection
        number="01"
        title="Rôles et portées"
        className="mt-10"
        tone="navy"
        description={capabilities.grantableRoles.length ? (capabilities.grantableRoles.length === 1 ? 'La coordination désigne des formateurs sur un cours ou une cohorte ; les autres rôles relèvent de la super administration.' : 'Attribution et retrait réservés à la super administration ; chaque opération est journalisée.') : 'Lecture seule : les rôles sont gérés par la super administration.'}
      >
        {roleAssignments.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rôle</TableHead>
                <TableHead>Portée</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Attribué</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleAssignments.map((r) => {
                const expired = Boolean(r.expiresAt && new Date(r.expiresAt).getTime() <= Date.now())
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant={r.role === 'SUPER_ADMIN' ? 'navy' : r.scopeType === 'GLOBAL' ? 'blue' : 'outline'} size="sm">
                        {roleLabels[r.role]}
                      </Badge>
                      {expired ? <Badge variant="danger" size="sm" className="ml-1">Expiré</Badge> : null}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-navy">{scopeLabels[r.scopeType]}</span>
                      {r.scopeLabel ? <span className="block max-w-[16rem] truncate text-xs text-neutral-500">{r.scopeLabel}</span> : null}
                    </TableCell>
                    <TableCell className="text-neutral-700">{r.expiresAt ? formatDate(r.expiresAt) : 'Sans limite'}</TableCell>
                    <TableCell className="text-neutral-600">
                      {formatDate(r.createdAt)}
                      {r.grantedBy ? <span className="block text-xs text-neutral-500">par {r.grantedBy.name ?? r.grantedBy.email}</span> : null}
                    </TableCell>
                    <TableCell className="text-right">{r.canRevoke && !(isSelf && r.role === 'SUPER_ADMIN') ? <RevokeRoleButton assignmentId={r.id} label={roleLabels[r.role]} /> : null}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={ShieldCheck} title="Aucun rôle explicite" description="Sans rôle attribué, le compte dispose des droits d'un apprenant : catalogue, inscriptions libres, forums." />
          </Card>
        )}
        {capabilities.grantableRoles.length ? (
          <div className="mt-4">
            <RoleForm userId={user.id} grantableRoles={capabilities.grantableRoles} allowedScopeTypes={capabilities.allowedScopeTypes} organizations={selects.organizations} courses={selects.courses} cohorts={selects.cohorts} />
          </div>
        ) : null}
      </StaffSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StaffSection number="02" title="Organisations" tone="green" description="Appartenances déclarées ; les gestionnaires déposent les demandes de formation.">
          {user.memberships.length ? (
            <ul className="flex flex-col gap-2">
              {user.memberships.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-soft">
                  <div>
                    <Link href={`/coordination/organisations/${m.organization.id}`} className="font-semibold text-navy hover:underline">
                      {m.organization.acronym ? `${m.organization.acronym} · ` : ''}
                      {m.organization.name}
                    </Link>
                    {m.title ? <p className="text-xs text-neutral-500">{m.title}</p> : null}
                  </div>
                  {m.isManager ? <Badge variant="gold" size="sm">Gestionnaire</Badge> : <Badge variant="neutral" size="sm">Membre</Badge>}
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <EmptyState compact icon={Building2} title="Aucune organisation" description="Le compte n'est rattaché à aucune organisation affiliée." />
            </Card>
          )}
        </StaffSection>

        <StaffSection number="03" title="Enseignement" tone="blue" description="Cours dont le compte est formateur et cohortes qu'il anime.">
          {user.courseTrainers.length || user.cohortTrainers.length ? (
            <Card>
              <CardContent className="p-5">
                <DetailList columns={2}>
                  <DetailItem label="Cours">
                    {user.courseTrainers.length ? (
                      <ul className="flex flex-col gap-1">
                        {user.courseTrainers.map((t) => (
                          <li key={t.course.id}>
                            <Link href={`/admin/cours/${t.course.id}`} className="hover:underline">
                              {t.course.code} · {t.course.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </DetailItem>
                  <DetailItem label="Cohortes animées">
                    {user.cohortTrainers.length ? (
                      <ul className="flex flex-col gap-1">
                        {user.cohortTrainers.map((c) => (
                          <li key={c.id} className="flex flex-wrap items-center gap-2">
                            <Link href={`/coordination/cohortes/${c.id}`} className="hover:underline">
                              {c.code} · {c.name}
                            </Link>
                            <StatusBadge status={c.status} labels={cohortStatusLabels} size="sm" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </DetailItem>
                </DetailList>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <EmptyState compact icon={GraduationCap} title="Aucune mission d'enseignement" description="Rattachez le compte à un cours depuis le builder ou désignez-le formateur d'une cohorte." />
            </Card>
          )}
        </StaffSection>
      </div>

      <StaffSection number="04" title="Inscriptions" tone="gold" description={enrollmentTotal > 10 ? `Les 10 plus récentes sur ${enrollmentTotal}.` : undefined}>
        {user.enrollments.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Cohorte</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <span className="font-semibold text-navy">{e.course.title}</span>
                    <span className="block text-xs text-neutral-500">{e.course.code}</span>
                  </TableCell>
                  <TableCell className="text-neutral-700">{e.cohort ? e.cohort.name : <span className="text-neutral-400">Individuel</span>}</TableCell>
                  <TableCell className="min-w-[10rem]">
                    <Progress value={e.progressPercent} size="sm" showValue label={`Progression sur ${e.course.title}`} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} labels={enrollmentStatusLabels} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={UsersRound} title="Aucune inscription" description="Le compte n'est inscrit à aucune formation." />
          </Card>
        )}
      </StaffSection>

      <StaffSection
        number="05"
        title="Certificats"
        tone="navy"
        actions={
          canIssue ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/coordination/certificats?q=${encodeURIComponent(user.email)}`}>Registre des certificats</Link>
            </Button>
          ) : undefined
        }
      >
        {certificates.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Émis le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>PDF</TableHead>
                {canIssue ? (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-navy">{c.number}</span>
                    <span className="block text-xs text-neutral-500">{c.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'}</span>
                  </TableCell>
                  <TableCell className="text-neutral-700">{c.courseTitle}</TableCell>
                  <TableCell className="text-neutral-600">
                    {formatDate(c.issuedAt)}
                    {c.expiresAt ? <span className="block text-xs text-neutral-500">expire le {formatDate(c.expiresAt)}</span> : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} labels={certificateStatusLabels} size="sm" />
                  </TableCell>
                  <TableCell>{c.pdfUrl ? <Badge variant="success" size="sm">Disponible</Badge> : <Badge variant="neutral" size="sm">En génération</Badge>}</TableCell>
                  {canIssue ? (
                    <TableCell className="text-right">
                      <CertificateRowActions certificateId={c.id} number={c.number} status={c.status} hasPdf={Boolean(c.pdfUrl)} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={Award} title="Aucun certificat" description="Les attestations et certificats émis au nom de ce compte apparaîtront ici." />
          </Card>
        )}
      </StaffSection>
    </>
  )
}
