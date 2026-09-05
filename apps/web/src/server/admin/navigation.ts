import { roleLabels, type RoleName } from '@fetrag/contracts'
import { can, hasRole, isSuperAdmin, type Action, type Principal } from '@fetrag/domain'

/**
 * Navigation du back-office (chapitre 38) : sections, entrées et permissions.
 * Fichier pur (sans `server-only`) : les structures sont sérialisables vers les composants client,
 * les icônes sont référencées par clé et instanciées côté client.
 */

export type AdminIconKey =
  | 'dashboard'
  | 'pages'
  | 'news'
  | 'tags'
  | 'library'
  | 'image'
  | 'menu'
  | 'help'
  | 'services'
  | 'inbox'
  | 'calendar'
  | 'handshake'
  | 'mail'
  | 'newsletter'
  | 'users'
  | 'finance'
  | 'reports'
  | 'audit'
  | 'settings'

export interface AdminNavItem {
  label: string
  href: string
  icon: AdminIconKey
  /** Une des permissions suffit ; vide = tout utilisateur admis dans le back-office. */
  actions: Action[]
  exact?: boolean
}

export interface AdminNavSection {
  title: string
  items: AdminNavItem[]
}

/** Actions dont l'une suffit pour entrer dans le back-office. */
export const adminEntryActions: Action[] = [
  'cms.read_drafts',
  'cms.write',
  'cms.manage_media',
  'cms.manage_menus',
  'services.manage',
  'services.handle_requests',
  'forms.read',
  'finance.read',
  'users.read',
  'audit.read',
  'settings.manage',
  'reports.read',
]

const sections: AdminNavSection[] = [
  {
    title: 'Pilotage',
    items: [{ label: 'Tableau de bord', href: '/admin', icon: 'dashboard', actions: [], exact: true }],
  },
  {
    title: 'Contenus',
    items: [
      { label: 'Pages', href: '/admin/pages', icon: 'pages', actions: ['cms.read_drafts'] },
      { label: 'Actualités', href: '/admin/actualites', icon: 'news', actions: ['cms.read_drafts'] },
      { label: 'Catégories', href: '/admin/categories', icon: 'tags', actions: ['cms.read_drafts', 'services.manage'] },
      { label: 'Ressources', href: '/admin/ressources', icon: 'library', actions: ['cms.read_drafts'] },
      { label: 'Médias', href: '/admin/medias', icon: 'image', actions: ['cms.manage_media'] },
      { label: 'Menus', href: '/admin/menus', icon: 'menu', actions: ['cms.manage_menus'] },
      { label: 'FAQ', href: '/admin/faq', icon: 'help', actions: ['cms.read_drafts'] },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Catalogue', href: '/admin/services', icon: 'services', actions: ['services.manage', 'cms.read_drafts'] },
      { label: 'Demandes', href: '/admin/demandes', icon: 'inbox', actions: ['services.handle_requests'] },
    ],
  },
  {
    title: 'Relations',
    items: [
      { label: 'Événements', href: '/admin/evenements', icon: 'calendar', actions: ['cms.read_drafts'] },
      { label: 'Partenaires et organisations', href: '/admin/partenaires', icon: 'handshake', actions: ['cms.read_drafts'] },
      { label: 'Messages reçus', href: '/admin/messages', icon: 'mail', actions: ['forms.read'] },
      { label: 'Newsletter', href: '/admin/newsletter', icon: 'newsletter', actions: ['forms.read', 'reports.read'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Utilisateurs et rôles', href: '/admin/utilisateurs', icon: 'users', actions: ['users.read'] },
      { label: 'Finance', href: '/admin/finance', icon: 'finance', actions: ['finance.read'] },
      { label: 'Rapports', href: '/admin/rapports', icon: 'reports', actions: ['reports.read'] },
      { label: 'Journal d’audit', href: '/admin/audit', icon: 'audit', actions: ['audit.read'] },
      { label: 'Paramètres', href: '/admin/parametres', icon: 'settings', actions: ['settings.manage'] },
    ],
  },
]

/** Vrai si le principal peut exercer l'une des actions (aucune action = accès libre dans le back-office). */
export function canAny(principal: Principal, actions: Action[]): boolean {
  if (actions.length === 0) return true
  return isSuperAdmin(principal) || actions.some((action) => can(principal, action))
}

/** Le principal peut-il ouvrir le back-office ? */
export function canAccessAdmin(principal: Principal): boolean {
  return canAny(principal, adminEntryActions)
}

/** Sections et entrées visibles pour le principal (les entrées non autorisées sont masquées). */
export function buildAdminNav(principal: Principal): AdminNavSection[] {
  return sections
    .map((section) => ({ title: section.title, items: section.items.filter((item) => canAny(principal, item.actions)) }))
    .filter((section) => section.items.length > 0)
}

/** Libellé du rôle dominant (affiché dans la barre latérale). */
export function dominantRoleLabel(principal: Principal): string {
  const order: RoleName[] = ['SUPER_ADMIN', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT', 'TRAINER', 'ORG_MANAGER', 'LEARNER']
  for (const role of order) {
    if (hasRole(principal, role)) return roleLabels[role]
  }
  return roleLabels.LEARNER
}

/** Titre de section pour la barre supérieure, déduit du chemin courant. */
export function adminTitleFor(pathname: string): string {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)) return item.label
    }
  }
  return 'Administration'
}
