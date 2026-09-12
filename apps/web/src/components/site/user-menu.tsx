import 'server-only'
import Link from 'next/link'
import { loadPrincipal } from '@fetrag/auth'
import { roleLabels, type RoleName } from '@fetrag/contracts'
import { can, hasRole, isSuperAdmin, type Action, type Principal } from '@fetrag/domain'
import { Button } from '@fetrag/ui'
import { auth } from '@/lib/auth'
import { lmsHref } from '@/lib/site'
import { UserMenuClient, type UserMenuLink, type UserMenuUser } from './user-menu-client'

/** Actions dont l'une suffit pour accéder au back-office vitrine. */
const adminActions: Action[] = [
  'cms.read_drafts',
  'cms.write',
  'services.manage',
  'services.handle_requests',
  'forms.read',
  'finance.read',
  'users.read',
  'audit.read',
  'settings.manage',
]

/** Rôle dominant affiché dans le menu. */
function dominantRole(principal: Principal): RoleName {
  const order: RoleName[] = ['SUPER_ADMIN', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT', 'TRAINER', 'ORG_MANAGER', 'LEARNER']
  for (const role of order) {
    if (hasRole(principal, role)) return role
  }
  return 'LEARNER'
}

function initialsOf(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.charAt(0) ?? ''}${parts[parts.length - 1]?.charAt(0) ?? ''}`.toUpperCase()
  if (parts.length === 1 && parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

/** Convertit un principal en props sérialisables pour le menu client (site web). */
export function toUserMenuUser(principal: Principal, image: string | null): UserMenuUser {
  const name = principal.name?.trim() || principal.email
  const links: UserMenuLink[] = [
    { label: 'Mon espace', href: '/espace', icon: 'layout', group: 'personal' },
    { label: 'Mon profil', href: '/espace/profil', icon: 'user', group: 'personal' },
    { label: 'Mes inscriptions', href: '/espace/inscriptions', icon: 'book', group: 'personal' },
    { label: 'Notifications', href: '/espace/notifications', icon: 'bell', group: 'personal' },
    { label: 'Sécurité', href: '/espace/securite', icon: 'lock', group: 'personal' },
    { label: 'Guide d’utilisation', href: '/espace/guide', icon: 'help', group: 'personal' },
  ]
  if (isSuperAdmin(principal) || adminActions.some((action) => can(principal, action))) {
    links.push({ label: 'Administration du site', href: '/admin', icon: 'shield', group: 'roles' })
  }
  links.push({ label: 'Plateforme de formation', href: lmsHref('/dashboard'), icon: 'graduation', external: true, group: 'cross' })
  return {
    id: principal.id,
    name,
    email: principal.email,
    initials: initialsOf(name, principal.email),
    image,
    roleLabel: roleLabels[dominantRole(principal)],
    links,
  }
}

/**
 * Charge l'utilisateur courant sous forme sérialisable (ou null).
 * Ne lève jamais : une base indisponible ne doit pas casser la coquille du site.
 */
export async function loadUserMenuProps(): Promise<UserMenuUser | null> {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return null
    const principal = await loadPrincipal(userId, Boolean(session?.user?.mfaVerified))
    if (!principal) return null
    return toUserMenuUser(principal, session?.user?.image ?? null)
  } catch (error) {
    console.warn('[user-menu] session illisible :', error instanceof Error ? error.message : error)
    return null
  }
}

/** Composant serveur : menu utilisateur ou bouton « Espace personnel ». */
export async function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = await loadUserMenuProps()
  if (!user) {
    return (
      <Button asChild variant="primary" size="sm">
        <Link href="/connexion">Espace personnel</Link>
      </Button>
    )
  }
  return <UserMenuClient user={user} compact={compact} />
}
