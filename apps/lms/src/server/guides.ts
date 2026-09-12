import 'server-only'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, guidePath, toGuideMeta, type Guide } from '@fetrag/guides'
import { loadGuideAssessmentSummary, type AttemptSummaryEntry } from '@fetrag/guides/attempts'
import type { GuideAssessmentSummaryView, GuideReaderProps } from '@fetrag/ui'
import { submitGuideAssessmentAction } from '@/lib/actions/guides'
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

/** Props du lecteur pour un guide donné (hors fil d'Ariane et hors autoévaluation, propre à chaque espace). */
export function lmsGuideReaderProps(principal: Principal, guide: Guide): Omit<GuideReaderProps, 'breadcrumbs' | 'className'> {
  return {
    guide,
    baseUrls: guideBaseUrls,
    viewerRoleLabel: dominantRoleLabel(principal),
    otherGuides: otherLmsGuides(principal, guide),
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
  const base = lmsGuideReaderProps(principal, guide)
  if (!guide.selfAssessment) return base
  const summary = await loadAssessmentSummary(principal, guide)
  return { ...base, assessment: { summary, onSubmit: submitGuideAssessmentAction.bind(null, guide.id) } }
}
