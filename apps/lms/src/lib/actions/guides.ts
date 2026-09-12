'use server'

import { type AssessmentResult, type GuideAnswers } from '@fetrag/contracts'
import { ForbiddenError, RateLimitedError } from '@fetrag/domain'
import { canReadGuide, guideById } from '@fetrag/guides'
import { recordGuideAssessmentAttempt } from '@fetrag/guides/attempts'
import { guards } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

const HOUR = 60 * 60 * 1000

/**
 * Enregistre une tentative d'autoévaluation d'un guide et renvoie le résultat corrigé côté serveur.
 * Vérifie l'identité, la plateforme (plateforme de formation) et le droit de lecture du guide, puis limite le
 * débit à 20 tentatives par heure et par utilisateur. Action non sensible : pas de journal d'audit ;
 * un avertissement console est émis si l'enregistrement échoue (l'erreur est propagée au client, qui
 * conserve le score calculé localement).
 */
export async function submitGuideAssessmentAction(guideId: string, answers: GuideAnswers): Promise<AssessmentResult> {
  const principal = await guards.api.requireUser()
  const guide = guideById(guideId)
  if (!guide || guide.platform !== 'lms') throw new ForbiddenError('Ce guide est indisponible sur cette plateforme.')
  if (!canReadGuide(principal, guide)) throw new ForbiddenError("Vous n'avez pas accès à ce guide.")

  const limit = checkRateLimit(`guide-assessment:${principal.id}`, 20, HOUR)
  if (!limit.allowed) throw new RateLimitedError()

  try {
    return await recordGuideAssessmentAttempt({ userId: principal.id, guide, answers })
  } catch (error) {
    console.warn('[guides] enregistrement de la tentative impossible', error instanceof Error ? error.message : error)
    throw error
  }
}
