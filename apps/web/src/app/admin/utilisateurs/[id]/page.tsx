import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Briefcase, Building2, CalendarClock, KeyRound, Mail, Phone, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX } from 'lucide-react'
import { roleLabels, type ScopeTypeName } from '@fetrag/contracts'
import { formatDate, formatDateTime, formatMoney, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EditorLayout } from '@/components/admin/editor-layout'
import { RoleGrantDialog } from '@/components/admin/role-grant-dialog'
import { TemporaryPasswordDialog } from '@/components/admin/temporary-password-dialog'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { auditActionLabels } from '@/server/admin/labels'
import { loadScopeOptions, loadUserDetail } from '@/server/admin/queries'
import { resetUserMfaAction, revokeRoleAction, setUserActiveAction } from '@/server/admin/users-actions'
import { consentKindLabels, loadUserActivity } from '@/server/admin/users-queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Utilisateur ${id.slice(0, 8)}` }
}

const scopeLabels: Record<ScopeTypeName, string> = { GLOBAL: 'Globale', ORGANIZATION: 'Organisation', COURSE: 'Cours', COHORT: 'Cohorte' }

function displayName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

/** Fiche utilisateur : profil, rôles et portées, organisations, inscriptions, commandes, consentements, connexions, journal. */
export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params
  const principal = await requireAdminCan('users.read', `/admin/utilisateurs/${id}`)
  const abilities = adminAbilities(principal)
  const user = await loadUserDetail(id)
  if (!user) notFound()
  const [activity, scopeOptions] = await Promise.all([loadUserActivity(user.id), abilities.manageRoles ? loadScopeOptions() : null])
  const now = Date.now()
  const name = displayName(user)
  const isSelf = user.id === principal.id

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title={name}
        description={`${user.email} · compte créé le ${formatDate(user.createdAt)}${user.lastLoginAt ? ` · dernière connexion ${formatRelative(user.lastLoginAt)}` : ' · jamais connecté'}.`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Utilisateurs', href: '/admin/utilisateurs' }, { label: name }]}
        actions={
          <>
            <Badge variant={user.isActive ? 'success' : 'danger'} size="lg" dot>
              {user.isActive ? 'Compte actif' : 'Compte désactivé'}
            </Badge>
            {user.totpEnabled ? (
              <Badge variant="green" size="lg">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                MFA active
              </Badge>
            ) : null}
          </>
        }
      />

      {isSelf ? (
        <Alert variant="info">
          <AlertDescription>Vous consultez votre propre fiche : la désactivation du compte et le retrait du rôle de super administrateur sont bloqués.</AlertDescription>
        </Alert>
      ) : null}

      <EditorLayout
        main={
          <>
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Profil</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <p className="flex items-start gap-2 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <a href={`mailto:${user.email}`} className="break-all font-semibold text-navy hover:underline">
                      {user.email}
                    </a>
                    <span className="block text-xs text-neutral-500">{user.emailVerified ? `Vérifié le ${formatDate(user.emailVerified)}` : 'Adresse non vérifiée'}</span>
                  </span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Phone className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="text-navy">{user.phone ?? '—'}</span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Briefcase className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <span className="block text-navy">{user.jobTitle ?? '—'}</span>
                    <span className="block text-xs text-neutral-500">{user.employer ?? 'Employeur non renseigné'}</span>
                  </span>
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <span className="block text-navy">{user.hasPassword ? 'Mot de passe local défini' : 'Aucun mot de passe local (fournisseur externe)'}</span>
                    <span className="block text-xs text-neutral-500">
                      Langue {user.locale === 'en' ? 'anglais' : 'français'} · {user._count.sessions} session{user._count.sessions > 1 ? 's' : ''} ouverte{user._count.sessions > 1 ? 's' : ''}
                    </span>
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card pillar="prevention">
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle as="h2">Rôles et portées</CardTitle>
                  <CardDescription>Les rôles globaux couvrent toute la plateforme ; les rôles limités ne s’appliquent qu’à leur organisation, cours ou cohorte.</CardDescription>
                </div>
                {abilities.manageRoles && scopeOptions ? <RoleGrantDialog userId={user.id} userLabel={name} scopeOptions={scopeOptions} /> : null}
              </CardHeader>
              <CardContent>
                {user.roleAssignments.length === 0 ? (
                  <EmptyState compact icon={ShieldOff} title="Aucun rôle" description="Sans rôle, le compte ne peut que consulter les contenus publics et son espace personnel." />
                ) : (
                  <Table bare>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Portée</TableHead>
                        <TableHead className="hidden md:table-cell">Expiration</TableHead>
                        <TableHead className="hidden lg:table-cell">Attribué</TableHead>
                        {abilities.manageRoles ? <TableHead className="text-right">Action</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.roleAssignments.map((assignment) => {
                        const expired = Boolean(assignment.expiresAt && assignment.expiresAt.getTime() <= now)
                        const lockedSelf = isSelf && assignment.role === 'SUPER_ADMIN'
                        return (
                          <TableRow key={assignment.id} className={expired ? 'opacity-60' : undefined}>
                            <TableCell>
                              <Badge variant={assignment.role === 'SUPER_ADMIN' ? 'navy' : assignment.scopeType === 'GLOBAL' ? 'blue' : 'outline'} size="sm">
                                {roleLabels[assignment.role]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="font-semibold text-navy">{scopeLabels[assignment.scopeType]}</span>
                              {assignment.scopeId ? <span className="block truncate text-xs text-neutral-500">{user.scopeLabels[assignment.scopeId] ?? assignment.scopeId}</span> : null}
                            </TableCell>
                            <TableCell className="hidden text-xs text-neutral-600 md:table-cell">
                              {assignment.expiresAt ? (
                                <Badge variant={expired ? 'danger' : 'warning'} size="sm">
                                  {expired ? 'Expiré le ' : 'Jusqu’au '}
                                  {formatDate(assignment.expiresAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Badge>
                              ) : (
                                'Sans limite'
                              )}
                            </TableCell>
                            <TableCell className="hidden text-xs text-neutral-600 lg:table-cell">
                              {formatDate(assignment.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                              {assignment.grantedBy ? <span className="block truncate">{assignment.grantedBy.name ?? assignment.grantedBy.email}</span> : null}
                            </TableCell>
                            {abilities.manageRoles ? (
                              <TableCell className="text-right">
                                {lockedSelf ? (
                                  <span className="text-xs text-neutral-400">Protégé</span>
                                ) : (
                                  <ConfirmDialog
                                    trigger={
                                      <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                                        Révoquer
                                      </Button>
                                    }
                                    title={`Révoquer le rôle « ${roleLabels[assignment.role]} » ?`}
                                    description="L’utilisateur perd immédiatement les droits associés. L’opération est journalisée."
                                    confirmLabel="Révoquer"
                                    destructive
                                    onConfirm={revokeRoleAction.bind(null, assignment.id)}
                                  />
                                )}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card pillar="defense">
              <CardHeader>
                <CardTitle as="h2">Organisations</CardTitle>
                <CardDescription>Appartenances déclarées ; un responsable dépose les demandes de formation de son organisation.</CardDescription>
              </CardHeader>
              <CardContent>
                {user.memberships.length === 0 ? (
                  <EmptyState compact icon={Building2} title="Aucune organisation" description="Rattachez ce compte depuis la fiche d’une organisation." />
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {user.memberships.map((membership) => (
                      <li key={membership.organizationId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <Link href={`/admin/organisations/${membership.organizationId}`} className="min-w-0 truncate font-semibold text-navy hover:text-blue-700">
                          {membership.organization.name}
                          {membership.organization.acronym ? <span className="text-xs font-normal text-neutral-500"> ({membership.organization.acronym})</span> : null}
                        </Link>
                        <Badge variant={membership.isManager ? 'gold' : 'neutral'} size="sm">
                          {membership.isManager ? 'Responsable' : 'Membre'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle as="h2">Inscriptions à la formation</CardTitle>
                <Badge variant={activity.enrollments.length > 0 ? 'blue' : 'neutral'} size="sm">
                  {user._count.enrollments} · {activity.certificates} certificat{activity.certificates > 1 ? 's' : ''}
                </Badge>
              </CardHeader>
              <CardContent>
                {activity.enrollments.length === 0 ? (
                  <EmptyState compact title="Aucune inscription" description="Les inscriptions aux formations du LMS apparaîtront ici." />
                ) : (
                  <Table bare>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden sm:table-cell">Progression</TableHead>
                        <TableHead className="hidden md:table-cell">Inscrit le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <span className="block font-semibold text-navy">{enrollment.course.title}</span>
                            <span className="block truncate text-xs text-neutral-500">
                              {enrollment.course.code}
                              {enrollment.cohort ? ` · ${enrollment.cohort.name}` : ''}
                              {enrollment.organization ? ` · ${enrollment.organization.name}` : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={enrollment.status} size="sm" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm tabular-nums text-navy">{enrollment.progressPercent} %</span>
                            {enrollment.score !== null ? <span className="block text-xs text-neutral-500">Score {enrollment.score}</span> : null}
                          </TableCell>
                          <TableCell className="hidden text-xs text-neutral-600 md:table-cell">
                            {formatDate(enrollment.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                            {enrollment.completedAt ? <span className="block">Terminé le {formatDate(enrollment.completedAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span> : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle as="h2">Commandes</CardTitle>
                <Badge variant={activity.orders.length > 0 ? 'gold' : 'neutral'} size="sm">
                  {user._count.orders}
                </Badge>
              </CardHeader>
              <CardContent>
                {activity.orders.length === 0 ? (
                  <EmptyState compact title="Aucune commande" description="Formations payantes, événements et services réglés en ligne." />
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-100">
                    {activity.orders.map((order) => (
                      <li key={order.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          {abilities.readFinance ? (
                            <Link href={`/admin/finance/commandes/${order.id}`} className="font-mono text-sm font-semibold text-navy hover:text-blue-700">
                              {order.reference}
                            </Link>
                          ) : (
                            <span className="font-mono text-sm font-semibold text-navy">{order.reference}</span>
                          )}
                          <p className="text-xs text-neutral-500">
                            {formatDateTime(order.createdAt)}
                            {order.paidAt ? ` · payée ${formatRelative(order.paidAt)}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums text-navy">{formatMoney(order.totalAmount, order.currency)}</span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle as="h2">Consentements</CardTitle>
                  <CardDescription>Dernier état enregistré par type ({activity.consentHistory} enregistrement{activity.consentHistory > 1 ? 's' : ''} au total).</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.consents.length === 0 ? (
                    <p className="text-sm text-neutral-600">Aucun consentement enregistré (compte créé par l’administration ou par un fournisseur externe).</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-neutral-100">
                      {activity.consents.map((consent) => (
                        <li key={consent.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0 text-sm">
                          <span>
                            <span className="block font-semibold text-navy">{consentKindLabels[consent.kind]}</span>
                            <span className="block text-xs text-neutral-500">
                              Version {consent.version} · {formatDateTime(consent.createdAt)}
                            </span>
                          </span>
                          <Badge variant={consent.granted ? 'success' : 'neutral'} size="sm">
                            {consent.granted ? 'Accordé' : 'Refusé'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle as="h2">Dernières connexions</CardTitle>
                  <CardDescription>Journal d’authentification (adresses IP conservées sous forme d’empreinte).</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.logins.length === 0 ? (
                    <p className="text-sm text-neutral-600">Aucune connexion journalisée.</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-neutral-100">
                      {activity.logins.map((entry) => (
                        <li key={entry.id} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0 text-sm">
                          <span className="min-w-0">
                            <span className="block font-semibold text-navy">{auditActionLabels[entry.action] ?? (entry.action === 'auth.login_failed' ? 'Échec de connexion' : entry.action)}</span>
                            <span className="block truncate text-xs text-neutral-500">{entry.userAgent ?? 'Agent inconnu'}</span>
                          </span>
                          <span className="shrink-0 text-xs text-neutral-500" title={formatDateTime(entry.createdAt)}>
                            {formatRelative(entry.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {abilities.readAudit && user.audit.length > 0 ? (
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle as="h2">Journal d’audit</CardTitle>
                  <Button asChild variant="link" size="sm">
                    <Link href={`/admin/audit?acteur=${encodeURIComponent(user.email)}`}>Tout le journal</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ol className="relative flex flex-col gap-3 border-l-2 border-blue-100 pl-5">
                    {user.audit.map((entry) => (
                      <li key={entry.id} className="relative text-sm">
                        <span aria-hidden="true" className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-white bg-blue-500" />
                        <span className="font-semibold text-navy">{auditActionLabels[entry.action] ?? entry.action}</span>
                        <span className="block text-xs text-neutral-500">
                          {formatDateTime(entry.createdAt)} · {entry.actorEmail ?? 'système'} · {entry.entityType}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : null}
          </>
        }
        aside={
          <>
            <Card pillar="protection">
              <CardHeader>
                <CardTitle as="h2">Compte</CardTitle>
                <CardDescription>{abilities.manageUsers ? 'Actions réservées au super administrateur ; chacune est journalisée.' : 'Consultation seule.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Inscriptions</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{user._count.enrollments}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Certificats</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{user._count.certificates}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Commandes</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{user._count.orders}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="text-xs text-neutral-500">Demandes</dt>
                    <dd className="font-display text-xl font-semibold text-navy">{user._count.serviceRequests}</dd>
                  </div>
                </dl>
                {abilities.manageUsers ? (
                  <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
                    {user.isActive ? (
                      <ConfirmDialog
                        trigger={
                          <Button type="button" variant="outline" size="sm" disabled={isSelf} leftIcon={<UserX aria-hidden="true" />}>
                            Désactiver le compte
                          </Button>
                        }
                        title={`Désactiver le compte de ${name} ?`}
                        description="L’utilisateur ne pourra plus se connecter et ses sessions ouvertes seront fermées. Ses données sont conservées."
                        confirmLabel="Désactiver"
                        destructive
                        onConfirm={setUserActiveAction.bind(null, user.id, false)}
                      />
                    ) : (
                      <ConfirmDialog
                        trigger={
                          <Button type="button" variant="primary" size="sm" leftIcon={<UserCheck aria-hidden="true" />}>
                            Réactiver le compte
                          </Button>
                        }
                        title={`Réactiver le compte de ${name} ?`}
                        description="L’utilisateur pourra de nouveau se connecter avec ses identifiants."
                        confirmLabel="Réactiver"
                        onConfirm={setUserActiveAction.bind(null, user.id, true)}
                      />
                    )}
                    {abilities.isSuperAdmin ? (
                      <ConfirmDialog
                        trigger={
                          <Button type="button" variant="outline" size="sm" disabled={!user.totpEnabled} leftIcon={<ShieldOff aria-hidden="true" />}>
                            Réinitialiser la MFA
                          </Button>
                        }
                        title="Réinitialiser la vérification en deux étapes ?"
                        description="Le secret TOTP et les codes de secours sont supprimés ; l’utilisateur devra réactiver la MFA depuis son espace (obligatoire pour les rôles privilégiés)."
                        confirmLabel="Réinitialiser"
                        destructive
                        onConfirm={resetUserMfaAction.bind(null, user.id)}
                      />
                    ) : null}
                    {abilities.isSuperAdmin && !isSelf && user.isActive ? <TemporaryPasswordDialog userId={user.id} userEmail={user.email} /> : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle as="h2">Repères</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="flex items-center gap-2 text-neutral-700">
                  <CalendarClock className="size-4 text-blue-600" aria-hidden="true" />
                  Mis à jour {formatRelative(user.updatedAt)}
                </p>
                <Button asChild variant="ghost" size="sm" className="self-start">
                  <a href={`${publicEnv.lmsUrl}/admin/utilisateurs/${user.id}`}>
                    Fiche sur la plateforme de formation
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  )
}
