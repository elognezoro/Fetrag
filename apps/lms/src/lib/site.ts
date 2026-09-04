import { site } from '@fetrag/config'
import { publicEnv } from './env'

/** Élément de navigation sérialisable (utilisable côté client). */
export interface NavItem {
  label: string
  href: string
  description?: string
  external?: boolean
  /** Visible uniquement pour un utilisateur connecté. */
  requiresAuth?: boolean
}

/** Identité de la plateforme de formation et coordonnées (source : @fetrag/config). */
export const siteConfig = {
  name: 'FETRAG Formation',
  shortName: 'Formation',
  brand: site.name,
  fullName: site.fullName,
  description:
    'Plateforme de formation syndicale de la Fédération des Travailleurs du Gabon : catalogue des dix modules du programme 2026, parcours à distance et en présentiel, évaluations, attestations et certificats vérifiables.',
  motto: site.motto,
  mottoText: site.motto.join(' · '),
  url: publicEnv.lmsUrl,
  webUrl: publicEnv.webUrl,
  domains: site.domains,
  contact: {
    address: site.contact.address,
    email: site.contact.email,
    phones: site.contact.phones,
  },
  secretaryGeneral: site.secretaryGeneral,
  locale: site.locale,
  timezone: site.timezone,
  copyrightYear: 2026,
} as const

/** Navigation principale de la barre LMS. */
export const mainNavigation: NavItem[] = [
  { label: 'Catalogue', href: '/catalogue', description: 'Les formations ouvertes aux inscriptions' },
  { label: 'Tableau de bord', href: '/dashboard', description: 'Votre progression et vos prochaines échéances', requiresAuth: true },
  { label: 'Mes formations', href: '/mes-formations', description: 'Inscriptions et parcours en cours', requiresAuth: true },
  { label: 'Calendrier', href: '/calendrier', description: 'Sessions, séances en direct et échéances', requiresAuth: true },
  { label: 'Certificats', href: '/certificats', description: 'Attestations et certificats obtenus', requiresAuth: true },
]

/** Liens du pied de page compact (vers le site institutionnel pour les pages légales). */
export const footerNavigation: NavItem[] = [
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Demande de formation', href: '/demande-formation' },
  { label: 'Vérifier un certificat', href: `${publicEnv.webUrl}/certificats/verifier`, external: true },
  { label: 'Contact', href: `${publicEnv.webUrl}/contact`, external: true },
  { label: 'Mentions légales', href: `${publicEnv.webUrl}/mentions-legales`, external: true },
  { label: 'Confidentialité', href: `${publicEnv.webUrl}/confidentialite`, external: true },
]

/** Construit une URL absolue vers le site institutionnel. */
export function webHref(path = '/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${publicEnv.webUrl}${suffix}`
}

/** Construit une URL absolue vers la plateforme de formation. */
export function lmsHref(path = '/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${publicEnv.lmsUrl}${suffix}`
}

/** Indique si un lien de navigation correspond au chemin courant (préfixe de section). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
