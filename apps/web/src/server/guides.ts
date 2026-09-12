import { toGuideMeta, type Guide, type GuideMeta } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, guidePath } from '@fetrag/guides'
import { publicEnv } from '@/lib/env'
import { siteConfig } from '@/lib/site'
import { dominantRoleLabel } from './admin/navigation'

/** Carte « Vos autres guides » (métadonnées sérialisables + chemin dans cette application). */
export interface OtherGuideLink {
  meta: GuideMeta
  href: string
  external?: boolean
}

/** URL publiques substituées aux marqueurs `{{web}}` / `{{lms}}` des guides. */
export const guideBaseUrls = { web: publicEnv.webUrl, lms: publicEnv.lmsUrl } as const

/** Coordonnées affichées en fin de guide (source : configuration du site). */
export const guideContact = {
  email: siteConfig.contact.email,
  phones: [...siteConfig.contact.phones],
  address: siteConfig.contact.address,
}

/**
 * Autres guides du site institutionnel lisibles par le principal (le guide affiché est exclu),
 * chacun pointant vers la page où il est servi dans cette application.
 */
export function otherWebGuides(principal: Principal, current: Pick<Guide, 'id'>): OtherGuideLink[] {
  return accessibleGuides(principal, 'web')
    .filter((guide) => guide.id !== current.id)
    .map((guide) => ({ meta: toGuideMeta(guide), href: guidePath(guide) }))
}

/** Props communes du lecteur de guide pour un principal donné. */
export function guideReaderProps(principal: Principal, guide: Guide) {
  return {
    guide,
    baseUrls: guideBaseUrls,
    viewerRoleLabel: dominantRoleLabel(principal),
    otherGuides: otherWebGuides(principal, guide),
    contact: guideContact,
  }
}
