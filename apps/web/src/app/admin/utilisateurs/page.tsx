import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { roleLabels, roles } from '@fetrag/contracts'
import { formatDate, formatRelative } from '@fetrag/domain'
import { Badge, Button, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { DataTable } from '@/components/admin/data-table'
import { FilterBar } from '@/components/admin/filter-bar'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadOrganizationOptions, loadUsers } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Utilisateurs et rôles' }

const BASE = '/admin/utilisateurs'

function displayName(user: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

/** Annuaire des comptes : recherche, filtres rôle / statut / organisation, accès à la fiche et à la création. */
export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('users.read', BASE)
  const abilities = adminAbilities(principal)
  const params = readListParams(await searchParams, ['role', 'organisation'], { sort: 'createdAt' })
  const [result, organizations] = await Promise.all([loadUsers(params), loadOrganizationOptions()])
  const now = Date.now()
  const count = (role: keyof typeof result.roleCounts) => result.roleCounts[role] ?? 0

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Administration"
        title="Utilisateurs et rôles"
        description="Comptes des deux plateformes (site et formation). Les rôles à portée limitée s’attribuent depuis la fiche de chaque utilisateur ; la création manuelle est réservée au super administrateur."
        actions={
          abilities.manageUsers ? (
            <Button asChild variant="primary" size="md">
              <Link href={`${BASE}/nouveau`}>
                <UserPlus aria-hidden="true" />
                Nouveau compte
              </Link>
            </Button>
          ) : undefined
        }
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatTile value={result.total} label={params.q || params.status || Object.keys(params.filters).length ? 'Comptes correspondant aux filtres' : 'Comptes enregistrés'} icon={Users} tone="blue" />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={count('LEARNER')} label="Apprenants" icon={GraduationCap} tone="green" description={`${count('ORG_MANAGER')} responsable${count('ORG_MANAGER') > 1 ? 's' : ''} d’organisation`} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={count('TRAINER') + count('COORDINATOR')} label="Équipe pédagogique" tone="gold" description={`${count('TRAINER')} formateur${count('TRAINER') > 1 ? 's' : ''} · ${count('COORDINATOR')} coordination`} />
        </StaggerItem>
        <StaggerItem>
          <StatTile value={count('SUPER_ADMIN') + count('EDITOR') + count('SERVICES_MANAGER') + count('FINANCE') + count('SUPPORT')} label="Équipe d’administration" icon={ShieldCheck} tone="navy" description={`${count('SUPER_ADMIN')} super administrateur${count('SUPER_ADMIN') > 1 ? 's' : ''}`} />
        </StaggerItem>
      </Stagger>
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom, email ou employeur"
        selects={[
          { name: 'role', label: 'Rôle', value: params.filters.role, options: roles.map((role) => ({ value: role, label: roleLabels[role] })) },
          { name: 'statut', label: 'Statut', value: params.status, options: [{ value: 'actif', label: 'Actifs' }, { value: 'inactif', label: 'Désactivés' }] },
          { name: 'organisation', label: 'Organisation', value: params.filters.organisation, options: organizations, allLabel: 'Toutes' },
        ]}
        hidden={{ tri: params.sort, ordre: params.order === 'asc' ? 'asc' : undefined }}
      />
      <DataTable
        rows={result.items}
        rowKey={(row) => row.id}
        caption="Utilisateurs"
        rowClassName={(row) => (row.isActive ? undefined : 'opacity-60')}
        empty={{ icon: Users, title: 'Aucun utilisateur', description: params.q || params.status || Object.keys(params.filters).length ? 'Aucun compte ne correspond aux filtres.' : 'Les comptes créés par inscription ou par l’administration apparaîtront ici.' }}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, pageSize: result.pageSize, hrefFor: pageHref(BASE, params) }}
        columns={[
          {
            key: 'user',
            header: 'Utilisateur',
            cell: (row) => (
              <div className="min-w-0">
                <Link href={`${BASE}/${row.id}`} className="font-semibold text-navy hover:text-blue-700">
                  {displayName(row)}
                </Link>
                <p className="truncate text-xs text-neutral-500">
                  {row.email}
                  {row.employer ? ` · ${row.employer}` : ''}
                </p>
              </div>
            ),
          },
          {
            key: 'roles',
            header: 'Rôles',
            cell: (row) => {
              const active = row.roleAssignments.filter((r) => !r.expiresAt || r.expiresAt.getTime() > now)
              return active.length === 0 ? (
                <span className="text-xs text-neutral-400">Aucun rôle</span>
              ) : (
                <ul className="flex flex-wrap gap-1">
                  {active.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <Badge variant={r.role === 'SUPER_ADMIN' ? 'navy' : r.scopeType === 'GLOBAL' ? 'blue' : 'outline'} size="sm">
                        {roleLabels[r.role]}
                        {r.scopeType !== 'GLOBAL' ? ' (limité)' : ''}
                      </Badge>
                    </li>
                  ))}
                  {active.length > 3 ? (
                    <li>
                      <Badge variant="neutral" size="sm">
                        +{active.length - 3}
                      </Badge>
                    </li>
                  ) : null}
                </ul>
              )
            },
          },
          {
            key: 'organizations',
            header: 'Organisations',
            hideBelow: 'lg',
            cell: (row) =>
              row.memberships.length === 0 ? (
                <span className="text-xs text-neutral-400">—</span>
              ) : (
                <span className="text-xs text-neutral-700">
                  {row.memberships
                    .slice(0, 2)
                    .map((m) => `${m.organization.acronym ?? m.organization.name}${m.isManager ? ' (resp.)' : ''}`)
                    .join(', ')}
                  {row.memberships.length > 2 ? ` +${row.memberships.length - 2}` : ''}
                </span>
              ),
          },
          {
            key: 'security',
            header: 'Sécurité',
            hideBelow: 'md',
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                <Badge variant={row.isActive ? 'success' : 'danger'} size="sm" dot>
                  {row.isActive ? 'Actif' : 'Désactivé'}
                </Badge>
                {row.totpEnabled ? (
                  <Badge variant="green" size="sm">
                    MFA
                  </Badge>
                ) : null}
              </div>
            ),
          },
          {
            key: 'lastLogin',
            header: 'Dernière connexion',
            hideBelow: 'md',
            cell: (row) =>
              row.lastLoginAt ? (
                <span className="text-xs text-neutral-600" title={formatDate(row.lastLoginAt)}>
                  {formatRelative(row.lastLoginAt)}
                </span>
              ) : (
                <span className="text-xs text-neutral-400">Jamais</span>
              ),
          },
          { key: 'createdAt', header: 'Créé', hideBelow: 'lg', cell: (row) => <span className="text-xs text-neutral-600">{formatDate(row.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
        ]}
      />
    </div>
  )
}
