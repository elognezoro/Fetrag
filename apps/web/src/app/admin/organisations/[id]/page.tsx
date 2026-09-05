import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Building2, Contact, Globe, GraduationCap, Mail, MapPin, Phone, Power, ShieldCheck, ShieldOff, UserMinus, Users } from 'lucide-react'
import { trainingRequestStatusLabels } from '@fetrag/contracts'
import { can, formatDate, formatDateTime, formatMoney, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EditorLayout } from '@/components/admin/editor-layout'
import { OrganizationMemberForm } from '@/components/admin/organization-member-form'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { removeMembershipAction, setMembershipManagerAction, setOrganizationActiveAction } from '@/server/admin/organizations-actions'
import { loadOrganizationDetail } from '@/server/admin/organizations-queries'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Organisation ${id.slice(0, 8)}` }
}

function memberName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

/** Fiche d'une organisation : identité, membres et responsables, contacts, demandes de formation, cohortes. */
export default async function AdminOrganizationDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('organization.read', `/admin/organisations/${id}`, { organizationId: id })
  const abilities = adminAbilities(principal)
  const organization = await loadOrganizationDetail(id)
  if (!organization) notFound()
  const canManage = abilities.isSuperAdmin || can(principal, 'organization.manage', { organizationId: organization.id })
  const managers = organization.memberships.filter((m) => m.isManager)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title={organization.name}
        description={`${organization.acronym ? `${organization.acronym} · ` : ''}${organization.isAffiliate ? 'Organisation affiliée' : 'Partenaire'}${organization.sector ? ` · ${organization.sector}` : ''}${organization.city ? ` · ${organization.city}` : ''}. Créée le ${formatDate(organization.createdAt)}.`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Organisations', href: '/admin/organisations' }, { label: organization.acronym ?? organization.name }]}
        actions={
          <>
            <Badge variant={organization.isActive ? 'success' : 'neutral'} size="lg" dot>
              {organization.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {canManage ? (
              <ConfirmDialog
                trigger={
                  <Button type="button" variant="outline" size="sm" leftIcon={<Power aria-hidden="true" />}>
                    {organization.isActive ? 'Désactiver' : 'Réactiver'}
                  </Button>
                }
                title={organization.isActive ? `Désactiver ${organization.name} ?` : `Réactiver ${organization.name} ?`}
                description={organization.isActive ? 'L’organisation disparaît des listes de choix ; ses membres, demandes et cohortes sont conservés.' : 'L’organisation redevient sélectionnable dans les formulaires.'}
                confirmLabel={organization.isActive ? 'Désactiver' : 'Réactiver'}
                destructive={organization.isActive}
                onConfirm={setOrganizationActiveAction.bind(null, organization.id, !organization.isActive)}
              />
            ) : null}
          </>
        }
      />

      {query.cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>Organisation créée. Rattachez maintenant un responsable pour lui permettre de déposer des demandes de formation.</AlertDescription>
        </Alert>
      ) : managers.length === 0 && organization.isActive ? (
        <Alert variant="warning">
          <AlertDescription>Aucun responsable n’est désigné : personne ne peut déposer de demande de formation au nom de cette organisation.</AlertDescription>
        </Alert>
      ) : null}

      <EditorLayout
        main={
          <>
            <Card pillar="protection">
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle as="h2">Membres</CardTitle>
                  <CardDescription>
                    {organization._count.memberships} compte{organization._count.memberships > 1 ? 's' : ''} rattaché{organization._count.memberships > 1 ? 's' : ''} · {managers.length} responsable{managers.length > 1 ? 's' : ''}
                    {organization.memberCount ? ` · ${organization.memberCount} travailleurs déclarés` : ''}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {organization.memberships.length === 0 ? (
                  <EmptyState compact icon={Users} title="Aucun membre" description="Rattachez un compte existant à partir de son adresse email." />
                ) : (
                  <Table bare>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead className="hidden md:table-cell">Rattaché le</TableHead>
                        {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organization.memberships.map((membership) => (
                        <TableRow key={membership.id} className={membership.user.isActive ? undefined : 'opacity-60'}>
                          <TableCell>
                            {abilities.readUsers ? (
                              <Link href={`/admin/utilisateurs/${membership.user.id}`} className="font-semibold text-navy hover:text-blue-700">
                                {memberName(membership.user)}
                              </Link>
                            ) : (
                              <span className="font-semibold text-navy">{memberName(membership.user)}</span>
                            )}
                            <span className="block truncate text-xs text-neutral-500">
                              {membership.user.email}
                              {membership.title ? ` · ${membership.title}` : membership.user.jobTitle ? ` · ${membership.user.jobTitle}` : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={membership.isManager ? 'gold' : 'neutral'} size="sm">
                              {membership.isManager ? 'Responsable' : 'Membre'}
                            </Badge>
                            {!membership.user.isActive ? (
                              <Badge variant="danger" size="sm" className="ml-1">
                                Compte désactivé
                              </Badge>
                            ) : null}
                          </TableCell>
                          <TableCell className="hidden text-xs text-neutral-600 md:table-cell">
                            {formatDate(membership.joinedAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                            {membership.user.lastLoginAt ? <span className="block">Connexion {formatRelative(membership.user.lastLoginAt)}</span> : null}
                          </TableCell>
                          {canManage ? (
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-1">
                                <ConfirmDialog
                                  trigger={
                                    <Button type="button" variant="ghost" size="sm" leftIcon={membership.isManager ? <ShieldOff aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}>
                                      {membership.isManager ? 'Retirer la responsabilité' : 'Nommer responsable'}
                                    </Button>
                                  }
                                  title={membership.isManager ? `Retirer la responsabilité à ${memberName(membership.user)} ?` : `Nommer ${memberName(membership.user)} responsable ?`}
                                  description={membership.isManager ? 'Le membre ne pourra plus déposer de demandes ni consulter les rapports de l’organisation.' : 'Le responsable dépose les demandes de formation, suit les participants et consulte les rapports de l’organisation.'}
                                  confirmLabel="Confirmer"
                                  onConfirm={setMembershipManagerAction.bind(null, membership.id, !membership.isManager)}
                                />
                                <ConfirmDialog
                                  trigger={
                                    <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<UserMinus aria-hidden="true" />}>
                                      Retirer
                                    </Button>
                                  }
                                  title={`Retirer ${memberName(membership.user)} de l’organisation ?`}
                                  description="Le compte est conservé ; seules l’appartenance et la responsabilité éventuelle sont retirées."
                                  confirmLabel="Retirer"
                                  destructive
                                  onConfirm={removeMembershipAction.bind(null, membership.id)}
                                />
                              </div>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card pillar="prevention">
                <CardHeader>
                  <CardTitle as="h2">Contacts</CardTitle>
                  <CardDescription>Interlocuteurs déclarés lors des demandes et de l’adhésion.</CardDescription>
                </CardHeader>
                <CardContent>
                  {organization.contacts.length === 0 ? (
                    <EmptyState compact icon={Contact} title="Aucun contact" />
                  ) : (
                    <ul className="flex flex-col divide-y divide-neutral-100">
                      {organization.contacts.map((contact) => (
                        <li key={contact.id} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 text-sm">
                          <span className="flex items-center gap-2 font-semibold text-navy">
                            {contact.fullName}
                            {contact.isPrimary ? (
                              <Badge variant="gold" size="sm">
                                Principal
                              </Badge>
                            ) : null}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {contact.role ?? 'Fonction non précisée'}
                            {contact.email ? ` · ${contact.email}` : ''}
                            {contact.phone ? ` · ${contact.phone}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card pillar="defense">
                <CardHeader>
                  <CardTitle as="h2">Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                    <span className="text-navy">
                      {organization.address ?? '—'}
                      {organization.city || organization.country ? <span className="block text-xs text-neutral-500">{[organization.city, organization.country].filter(Boolean).join(', ')}</span> : null}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Mail className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                    {organization.email ? (
                      <a href={`mailto:${organization.email}`} className="break-all text-navy hover:underline">
                        {organization.email}
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </p>
                  <p className="flex items-start gap-2">
                    <Phone className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                    <span className="text-navy">{organization.phone ?? '—'}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Globe className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                    {organization.website ? (
                      <a href={organization.website} target="_blank" rel="noopener noreferrer" className="break-all text-navy hover:underline">
                        {organization.website}
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </p>
                  {organization.description ? <p className="whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">{organization.description}</p> : null}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle as="h2">Demandes de formation</CardTitle>
                <Button asChild variant="link" size="sm">
                  <a href={`${publicEnv.lmsUrl}/coordination`}>
                    Coordination LMS
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                {organization.trainingRequests.length === 0 ? (
                  <EmptyState compact icon={GraduationCap} title="Aucune demande" description="Les demandes de formation institutionnelle déposées par le responsable apparaîtront ici." />
                ) : (
                  <Table bare>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Demande</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden sm:table-cell">Participants</TableHead>
                        <TableHead className="hidden md:table-cell">Déposée</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organization.trainingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <a href={`${publicEnv.lmsUrl}/coordination/demandes/${request.id}`} className="font-mono text-sm font-semibold text-navy hover:text-blue-700">
                              {request.reference}
                            </a>
                            <span className="block text-xs text-neutral-500">
                              {request.contactName} · {request._count.modules} module{request._count.modules > 1 ? 's' : ''}
                              {request.preferredStart ? ` · souhaitée ${formatDate(request.preferredStart, { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={request.status} labels={trainingRequestStatusLabels} size="sm" />
                          </TableCell>
                          <TableCell className="hidden text-sm tabular-nums sm:table-cell">{request._count.participants}</TableCell>
                          <TableCell className="hidden text-xs text-neutral-600 md:table-cell">{formatDateTime(request.submittedAt ?? request.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {organization.cohorts.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle as="h2">Cohortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {organization.cohorts.map((cohort) => (
                      <li key={cohort.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <a href={`${publicEnv.lmsUrl}/coordination/cohortes/${cohort.id}`} className="truncate font-semibold text-navy hover:text-blue-700">
                            {cohort.name}
                          </a>
                          <p className="truncate text-xs text-neutral-500">
                            {cohort.code} · {cohort.course.title} · {cohort._count.members} participant{cohort._count.members > 1 ? 's' : ''}
                            {cohort.startsAt ? ` · ${formatDate(cohort.startsAt, { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={cohort.status} size="sm" />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </>
        }
        aside={
          <>
            {canManage ? (
              <Card pillar="protection">
                <CardHeader>
                  <CardTitle as="h2">Ajouter un membre</CardTitle>
                  <CardDescription>Compte existant, recherché par adresse email.</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrganizationMemberForm organizationId={organization.id} />
                </CardContent>
              </Card>
            ) : null}
            <Card>
              <CardHeader>
                <CardTitle as="h2">Activité</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Inscriptions</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{organization.stats.enrollments}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Progression moyenne</dt>
                    <dd className="font-display text-xl font-semibold text-green-700">{organization.stats.averageProgress} %</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Cohortes</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{organization._count.cohorts}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Prises en charge</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{organization._count.sponsorships}</dd>
                  </div>
                </dl>
                {abilities.readFinance ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    {organization.stats.paidOrders} commande{organization.stats.paidOrders > 1 ? 's' : ''} réglée{organization.stats.paidOrders > 1 ? 's' : ''} · {formatMoney(organization.stats.revenue)}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-col gap-2">
                  <Button asChild variant="ghost" size="sm" className="self-start">
                    <Link href={`/admin/utilisateurs?organisation=${organization.id}`}>
                      <Users aria-hidden="true" />
                      Comptes rattachés
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="self-start">
                    <Link href={`/organisations#${organization.slug}`} target="_blank" rel="noopener">
                      <Building2 aria-hidden="true" />
                      Page publique des organisations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  )
}
