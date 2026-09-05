import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Users } from 'lucide-react'
import { roleLabels, roles, type RoleName } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Avatar, AvatarFallback, Badge, Button, Card, EmptyState, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, initials } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listUsersAdmin } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Utilisateurs et rôles' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; inactifs?: string; page?: string }>
}

const scopeShort: Record<string, string> = { GLOBAL: '', ORGANIZATION: 'organisation', COURSE: 'cours', COHORT: 'cohorte' }

/** Comptes de la plateforme : recherche, filtre par rôle, rôles et portées, organisations, MFA, dernière connexion. */
export default async function AdminUsersPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('users.read', {}, '/admin/utilisateurs')
  const params = await searchParams
  const role = (roles as readonly string[]).includes(params.role ?? '') ? (params.role as RoleName) : undefined
  const page = readPage(params.page)
  const list = await listUsersAdmin(principal, { q: params.q || undefined, role, inactive: params.inactifs === '1', page, pageSize: 25 })
  const hrefFor = (p: number) => buildHref('/admin/utilisateurs', { q: params.q, role: params.role, inactifs: params.inactifs, page: p > 1 ? p : undefined })
  const filtered = Boolean(params.q || params.role || params.inactifs)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Utilisateurs et rôles' }]}
        eyebrow="Comptes et rôles"
        title={
          <>
            {list.total} compte{list.total > 1 ? 's' : ''} <span className="italic text-blue-600">sur la plateforme</span>
          </>
        }
        description="Chaque compte porte des rôles à portée globale, d'organisation, de cours ou de cohorte. Les rôles privilégiés exigent la double authentification. Toute attribution ou retrait est journalisé."
        tone="navy"
        meta={
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {role ? `Filtre : ${roleLabels[role]}` : 'Tous les rôles'}
          </span>
        }
      />

      <FilterBar
        action="/admin/utilisateurs"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Nom ou email', value: params.q },
          { name: 'role', label: 'Rôle', type: 'select', value: params.role, options: roles.map((r) => ({ value: r, label: roleLabels[r] })) },
          { name: 'inactifs', label: 'Périmètre', type: 'select', value: params.inactifs, placeholder: 'Comptes actifs', options: [{ value: '1', label: 'Inclure les comptes désactivés' }] },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                <TableHead>Fonction</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead>Organisations</TableHead>
                <TableHead>Sécurité</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{initials(u.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link href={`/admin/utilisateurs/${u.id}`} className="font-semibold text-navy hover:underline">
                          {u.displayName}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {u.jobTitle ?? '-'}
                    {u.employer ? <span className="block text-xs text-neutral-500">{u.employer}</span> : null}
                  </TableCell>
                  <TableCell>
                    {u.roleAssignments.length ? (
                      <span className="flex max-w-xs flex-wrap gap-1">
                        {u.roleAssignments.slice(0, 4).map((r) => (
                          <Badge key={r.id} variant={r.role === 'SUPER_ADMIN' ? 'navy' : r.scopeType === 'GLOBAL' ? 'blue' : 'outline'} size="sm">
                            {roleLabels[r.role]}
                            {r.scopeType !== 'GLOBAL' ? ` (${scopeShort[r.scopeType]})` : ''}
                          </Badge>
                        ))}
                        {u.roleAssignments.length > 4 ? <span className="text-xs text-neutral-500">+{u.roleAssignments.length - 4}</span> : null}
                      </span>
                    ) : (
                      <Badge variant="neutral" size="sm">Apprenant (implicite)</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-700">
                    {u.memberships.length ? (
                      <ul className="text-sm">
                        {u.memberships.slice(0, 2).map((m) => (
                          <li key={m.organization.id} className={m.isManager ? 'font-semibold text-navy' : ''}>
                            {m.organization.acronym ?? m.organization.name}
                            {m.isManager ? ' · gestionnaire' : ''}
                          </li>
                        ))}
                        {u.memberships.length > 2 ? <li className="text-xs text-neutral-500">+{u.memberships.length - 2}</li> : null}
                      </ul>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {!u.isActive ? <Badge variant="danger" size="sm">Désactivé</Badge> : null}
                      {u.totpEnabled ? <Badge variant="success" size="sm">MFA</Badge> : <Badge variant="neutral" size="sm">Sans MFA</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-600">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Jamais'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/utilisateurs/${u.id}`}>Ouvrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
        </>
      ) : (
        <Card>
          <EmptyState icon={Users} title="Aucun compte" description={filtered ? 'Aucun compte ne correspond aux filtres.' : 'Les comptes créés à l’inscription, par les demandes de formation ou par la coordination apparaîtront ici.'} />
        </Card>
      )}
    </>
  )
}
