import 'server-only'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, guidePath, toGuideMeta, type Guide } from '@fetrag/guides'
import type { GuideReaderProps } from '@fetrag/ui'
import { publicEnv } from '@/lib/env'
import { siteConfig } from '@/lib/site'
import { dominantRoleLabel } from './staff/navigation'

/**
 * Données communes aux pages « Guide d'utilisation » de la plateforme de formation :
 * URL publiques substituées aux marqueurs `{{web}}` / `{{lms}}`, carte contact, rôle affiché
 * et cartes « Vos autres guides » (uniquement les guides que le principal a le droit de lire).
 */

/** URL publiques des deux applications (substitution des marqueurs dans les textes et les liens). */
export const guideBaseUrls: GuideReaderProps['baseUrls'] = { web: publicEnv.webUrl, lms: publicEnv.lmsUrl }

/** Coordonnées affichées en fin de guide. */
export const guideContact: NonNullable<GuideReaderProps['contact']> = {
  email: siteConfig.contact.email,
  phones: [...siteConfig.contact.phones],
  address: siteConfig.contact.address,
}

/** Autres guides de la plateforme accessibles au principal (le guide affiché exclu). */
export function otherLmsGuides(principal: Principal, current: Pick<Guide, 'id'>): NonNullable<GuideReaderProps['otherGuides']> {
  return accessibleGuides(principal, 'lms')
    .filter((guide) => guide.id !== current.id)
    .map((guide) => ({ meta: toGuideMeta(guide), href: guidePath(guide) }))
}

/** Props du lecteur pour un guide donné (hors fil d'Ariane, propre à chaque espace). */
export function lmsGuideReaderProps(principal: Principal, guide: Guide): Omit<GuideReaderProps, 'breadcrumbs' | 'className'> {
  return {
    guide,
    baseUrls: guideBaseUrls,
    viewerRoleLabel: dominantRoleLabel(principal),
    otherGuides: otherLmsGuides(principal, guide),
    contact: guideContact,
  }
}
