'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { idSchema } from '@fetrag/contracts'
import { enqueue, JobTypes, processJobs, registerDefaultHandlers } from '@fetrag/jobs'
import { certification } from '@fetrag/lms-core'
import { guards } from '@/lib/auth'
import { actionFailure, actionSuccess, type ActionResult } from './errors'
import { resolveFileUrl } from './content'

export interface RenderOutcome {
  ready: boolean
  pdfUrl: string | null
  message: string
}

/**
 * Génère (ou relance) le PDF d'un certificat : job `certificate.render` idempotent,
 * traité immédiatement pour un rendu synchrone en recette, puis lien signé.
 */
export async function renderCertificateAction(certificateId: string): Promise<ActionResult<RenderOutcome>> {
  const principal = await guards.requireUser('/certificats')
  try {
    const id = idSchema.parse(certificateId)
    // Vérifie que le certificat est consultable par le principal (titulaire, coordination, organisation).
    const certificate = await certification.get(principal, id)
    if (certificate.status === 'REVOKED') {
      return { ok: false, error: 'Ce certificat a été révoqué : aucun PDF ne peut être généré.', code: 'PRECONDITION_FAILED' }
    }
    registerDefaultHandlers()
    const job = await enqueue(JobTypes.certificateRender, { certificateId: id }, { idempotencyKey: `certificate.render:${id}`, priority: 2 })
    if (!job.created && (job.status === 'DEAD' || job.status === 'FAILED')) {
      // Une tentative précédente a échoué : nouvelle mise en file sous une clé distincte.
      await enqueue(JobTypes.certificateRender, { certificateId: id }, { idempotencyKey: `certificate.render:${id}:${Date.now()}`, priority: 2 })
    }
    await processJobs({ limit: 3, workerId: 'lms-inline', sweepEmails: false })
    const refreshed = await certification.get(principal, id)
    revalidatePath(`/certificats/${id}`)
    revalidatePath('/certificats')
    if (refreshed.pdfUrl) {
      const pdfUrl = await resolveFileUrl(refreshed.pdfUrl, { download: true, expiresInSeconds: 600 })
      return actionSuccess({ ready: Boolean(pdfUrl), pdfUrl, message: 'Le PDF de votre certificat est prêt.' })
    }
    return actionSuccess({ ready: false, pdfUrl: null, message: 'Génération en cours : le document sera disponible dans quelques instants.' })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}
