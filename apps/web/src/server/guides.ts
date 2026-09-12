import 'server-only'
import { toGuideMeta, type Guide, type GuideMeta } from '@fetrag/contracts'
import type { Principal } from '@fetrag/domain'
import { accessibleGuides, guidePath } from '@fetrag/guides'
import { loadGuideAssessmentSummaries, loadGuideAssessmentSummary, type AttemptSummaryEntry } from '@fetrag/guides/attempts'
import type { GuideAssessmentSummaryView, GuideReaderProps } from '@fetrag/ui'
import { submitGuideAssessmentAction } from '@/lib/actions/guides'
import { publicEnv } from '@/lib/env'
import { siteConfig } from '@/lib/site'
import { dominantRoleLabel } from './admin/navigation'

/** Carte « Vos autres guides » (métadonnées sérialisables + chemin + maîtrise éventuelle du lecteur). */
export interface OtherGuideLink {
  meta: GuideMeta
  href: string
  external?: boolean
  mastery?: { percent: number; passed: boolean; date: string }
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
export async function otherWebGuides(principal: Principal, current: Pick<Guide, 'id'>): Promise<OtherGuideLink[]> {
  const others = accessibleGuides(principal, 'web').filter((guide) => guide.id !== current.id)
  const withAssessment = others.filter((guide) => guide.selfAssessment)
  let summaries: Awaited<ReturnType<typeof loadGuideAssessmentSummaries>> = {}
  if (withAssessment.length > 0) {
    try {
      summaries = await loadGuideAssessmentSummaries(principal.id, withAssessment.map((guide) => guide.id))
    } catch (error) {
      console.warn('[guides] maîtrise des autres guides indisponible', error instanceof Error ? error.message : error)
    }
  }
  return others.map((guide) => {
    const last = summaries[guide.id]?.last
    return {
      meta: toGuideMeta(guide),
      href: guidePath(guide),
      mastery: last ? { percent: last.percent, passed: last.passed, date: last.createdAt.toISOString() } : undefined,
    }
  })
}

/** Props communes du lecteur de guide pour un principal donné (hors autoévaluation). */
export async function guideReaderProps(principal: Principal, guide: Guide) {
  return {
    guide,
    baseUrls: guideBaseUrls,
    viewerRoleLabel: dominantRoleLabel(principal),
    otherGuides: await otherWebGuides(principal, guide),
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
  const base = await guideReaderProps(principal, guide)
  if (!guide.selfAssessment) return base
  const summary = await loadAssessmentSummary(principal, guide)
  return { ...base, assessment: { summary, onSubmit: submitGuideAssessmentAction.bind(null, guide.id) } }
}
