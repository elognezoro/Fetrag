import { site } from '@fetrag/config'
import { publicEnv } from './env'

/** Élément de navigation sérialisable (utilisable côté client). */
export interface NavItem {
  label: string
  href: string
  description?: string
  external?: boolean
}

/** Identité et coordonnées de la fédération (source : @fetrag/config). */
export const siteConfig = {
  name: site.name,
  fullName: site.fullName,
  shortDescription: 'Fédération des Travailleurs du Gabon',
  description:
    "La Fédération des Travailleurs du Gabon (FETRAG) protège l'outil de production, prévient les conflits sociaux et défend les intérêts matériels et moraux des travailleurs. Actualités, services, ressources et plateforme de formation syndicale.",
  motto: site.motto,
  mottoText: site.motto.join(' · '),
  url: publicEnv.webUrl,
  lmsUrl: publicEnv.lmsUrl,
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

/** Navigation principale du site institutionnel (header). */
export const mainNavigation: NavItem[] = [
  { label: 'La FETRAG', href: '/la-fetrag', description: 'Histoire, missions, valeurs et gouvernance' },
  { label: 'Actualités', href: '/actualites', description: 'Communiqués et actualités syndicales' },
  { label: 'Formations', href: '/formations', description: 'Catalogue des formations FETRAG' },
  { label: 'Services', href: '/services', description: 'Services aux travailleurs et aux organisations' },
  { label: 'Ressources', href: '/ressources', description: 'Bibliothèque documentaire' },
  { label: 'Événements', href: '/evenements', description: 'Agenda, master class et assemblées' },
  { label: 'Contact', href: '/contact', description: 'Nous écrire ou nous rencontrer' },
]

/** Colonnes du pied de page. */
export const footerNavigation: Record<'institution' | 'formation' | 'services', { title: string; items: NavItem[] }> = {
  institution: {
    title: 'Institution',
    items: [
      { label: 'La FETRAG', href: '/la-fetrag' },
      { label: 'Organisations affiliées', href: '/organisations' },
      { label: 'Actualités', href: '/actualites' },
      { label: 'Événements', href: '/evenements' },
      { label: 'Adhésion', href: '/adhesion' },
      { label: 'Partenariat', href: '/partenariat' },
    ],
  },
  formation: {
    title: 'Formation',
    items: [
      { label: 'Catalogue des formations', href: '/formations' },
      { label: 'Plateforme de formation', href: `${publicEnv.lmsUrl}/`, external: true },
      { label: 'Demande de formation', href: `${publicEnv.lmsUrl}/demande-formation`, external: true },
      { label: 'Vérifier un certificat', href: '/certificats/verifier' },
    ],
  },
  services: {
    title: 'Services',
    items: [
      { label: 'Catalogue des services', href: '/services' },
      { label: 'Ressources documentaires', href: '/ressources' },
      { label: 'Espace personnel', href: '/espace' },
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Recherche', href: '/recherche' },
    ],
  },
}

/** Liens légaux (bas de page). */
export const legalNavigation: NavItem[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'FAQ', href: '/faq' },
]

/** Construit une URL absolue vers la plateforme de formation (LMS). */
export function lmsHref(path = '/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${publicEnv.lmsUrl}${suffix}`
}

/** Construit une URL absolue vers le site institutionnel. */
export function webHref(path = '/'): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${publicEnv.webUrl}${suffix}`
}

/** Indique si un lien de navigation correspond au chemin courant (préfixe de section). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
