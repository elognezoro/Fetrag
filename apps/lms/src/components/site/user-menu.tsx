import 'server-only'
import Link from 'next/link'
import { loadPrincipal } from '@fetrag/auth'
import { can, defaultDashboard, hasGlobalRole, hasRole, isSuperAdmin, type Principal } from '@fetrag/domain'
import { Button } from '@fetrag/ui'
import { auth } from '@/lib/auth'
import { webHref } from '@/lib/site'
import { dominantRoleLabel } from '@/server/staff/navigation'
import { UserMenuClient, type UserMenuLink, type UserMenuUser } from './user-menu-client'

/** Correspondance entre l'espace par défaut (`defaultDashboard`) et sa route. */
const dashboardRoutes: Record<ReturnType<typeof defaultDashboard>, string> = {
  admin: '/admin',
  coordination: '/coordination',
  formateur: '/formateur',
  organisation: '/organisation',
  dashboard: '/dashboard',
}

function initialsOf(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.charAt(0) ?? ''}${parts[parts.length - 1]?.charAt(0) ?? ''}`.toUpperCase()
  if (parts.length === 1 && parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

/** Convertit un principal en props sérialisables pour le menu client (LMS). */
export function toUserMenuUser(principal: Principal, image: string | null): UserMenuUser {
  const name = principal.name?.trim() || principal.email
  const homeHref = dashboardRoutes[defaultDashboard(principal)]

  const links: UserMenuLink[] = [
    { label: 'Tableau de bord', href: '/dashboard', icon: 'layout', group: 'personal' },
    { label: 'Mes formations', href: '/mes-formations', icon: 'book', group: 'personal' },
    { label: 'Calendrier', href: '/calendrier', icon: 'calendar', group: 'personal' },
    { label: 'Mes certificats', href: '/certificats', icon: 'award', group: 'personal' },
    { label: 'Guide d’utilisation', href: '/guide', icon: 'help', group: 'personal' },
  ]

  const isOrgManager = hasRole(principal, 'ORG_MANAGER') || principal.managedOrganizationIds.length > 0
  if (isOrgManager || can(principal, 'training_request.create', { organizationId: principal.managedOrganizationIds[0] ?? null })) {
    links.push({ label: 'Organisation', href: '/organisation', icon: 'building', group: 'roles' })
    links.push({ label: 'Demande de formation', href: '/demande-formation', icon: 'clipboard', group: 'roles' })
  }
  if (hasRole(principal, 'TRAINER')) {
    links.push({ label: 'Formateur', href: '/formateur', icon: 'users', group: 'roles' })
  }
  if (hasGlobalRole(principal, 'COORDINATOR')) {
    links.push({ label: 'Coordination', href: '/coordination', icon: 'graduation', group: 'roles' })
  }
  if (isSuperAdmin(principal) || can(principal, 'course.publish')) {
    links.push({ label: 'Administration', href: '/admin', icon: 'shield', group: 'roles' })
  }

  links.push({ label: 'Mon profil sur fetrag.ga', href: webHref('/espace/profil'), icon: 'user', external: true, group: 'cross' })
  links.push({ label: 'Sécurité du compte', href: webHref('/espace/securite'), icon: 'lock', external: true, group: 'cross' })
  links.push({ label: 'Site institutionnel', href: webHref('/'), icon: 'globe', external: true, group: 'cross' })

  return {
    id: principal.id,
    name,
    email: principal.email,
    initials: initialsOf(name, principal.email),
    image,
    roleLabel: dominantRoleLabel(principal),
    homeHref,
    links,
  }
}

/**
 * Charge l'utilisateur courant sous forme sérialisable (ou null).
 * Ne lève jamais : une base indisponible ne doit pas casser la coquille de la plateforme.
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

/** Composant serveur : menu utilisateur ou bouton « Connexion ». */
export async function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = await loadUserMenuProps()
  if (!user) {
    return (
      <Button asChild variant="primary" size="sm">
        <Link href="/connexion">Connexion</Link>
      </Button>
    )
  }
  return <UserMenuClient user={user} compact={compact} />
}
