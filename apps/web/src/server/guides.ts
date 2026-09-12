import 'server-only'
import { toGuideMeta, type Guide, type GuideMeta } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, guidePath } from '@fetrag/guides'
import { loadGuideAssessmentSummary, type AttemptSummaryEntry } from '@fetrag/guides/attempts'
import type { GuideAssessmentSummaryView, GuideReaderProps } from '@fetrag/ui'
import { submitGuideAssessmentAction } from '@/lib/actions/guides'
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

/** Props communes du lecteur de guide pour un principal donné (hors autoévaluation). */
export function guideReaderProps(principal: Principal, guide: Guide) {
  return {
    guide,
    baseUrls: guideBaseUrls,
    viewerRoleLabel: dominantRoleLabel(principal),
    otherGuides: otherWebGuides(principal, guide),
    contact: guideContact,
  }
}

/** Convertit une entrée de résumé serveur (date `Date`) en vue sérialisable (date ISO). */
function toSummaryEntry(entry: AttemptSummaryEntry | null): GuideAssessmentSummaryView['last'] {
  return entry ? { percent: entry.percent, passed: entry.passed, createdAt: entry.createdAt.toISOString() } : null
}

/**
 * Résumé sérialisable des tentatives d'autoévaluation de l'utilisateur pour ce guide.
 * Renvoie `undefined` si la base est indisponible : la page s'affiche alors sans historique.
 */
async function loadAssessmentSummary(principal: Principal, guide: Guide): Promise<GuideAssessmentSummaryView | undefined> {
  if (!guide.selfAssessment) return undefined
  try {
    const summary = await loadGuideAssessmentSummary(principal.id, guide.id)
    return { count: summary.count, last: toSummaryEntry(summary.last), best: toSummaryEntry(summary.best) }
  } catch (error) {
    console.warn('[guides] résumé d’autoévaluation indisponible', error instanceof Error ? error.message : error)
    return undefined
  }
}

/**
 * Props du lecteur de guide, avec le module « Testez votre maîtrise » branché quand le guide en définit un :
 * résumé des tentatives précédentes + action serveur d'enregistrement (`submitGuideAssessmentAction`).
 */
export async function loadGuideView(principal: Principal, guide: Guide): Promise<Omit<GuideReaderProps, 'breadcrumbs' | 'className'>> {
  const base = guideReaderProps(principal, guide)
  if (!guide.selfAssessment) return base
  const summary = await loadAssessmentSummary(principal, guide)
  return { ...base, assessment: { summary, onSubmit: submitGuideAssessmentAction.bind(null, guide.id) } }
}
