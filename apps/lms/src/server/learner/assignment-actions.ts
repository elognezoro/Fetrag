'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { resolvePublicUrl } from '@fetrag/config'
import { idSchema } from '@fetrag/contracts'
import { assignments } from '@fetrag/lms-core'
import { buildKey, getStorage, storageRoutePath, validateUpload } from '@fetrag/storage'
import { z } from 'zod'
import { guards } from '@/lib/auth'
import { actionFailure, type ActionResult } from './errors'
import type { SubmissionFormState } from './types'

const fieldsSchema = z.object({
  assignmentId: idSchema,
  courseId: z.string().optional(),
  intent: z.enum(['draft', 'submit']).default('draft'),
  text: z.string().max(50000).optional(),
})

function field(formData: FormData, name: string): string | undefined {
  const value = formData.get(name)
  return typeof value === 'string' ? value : undefined
}

/**
 * Brouillon ou remise d'un devoir : validation Zod, fichier contrôlé par `validateUpload`
 * (taille et types autorisés par le devoir), stockage privé, puis `assignments.saveDraft/submit`.
 */
export async function saveSubmissionAction(_previous: SubmissionFormState, formData: FormData): Promise<SubmissionFormState> {
  const principal = await guards.requireUser('/devoirs')
  const parsed = fieldsSchema.safeParse({
    assignmentId: field(formData, 'assignmentId'),
    courseId: field(formData, 'courseId'),
    intent: field(formData, 'intent'),
    text: field(formData, 'text'),
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations saisies.', text: field(formData, 'text') }
  }
  const data = parsed.data
  const text = data.text?.trim() ?? ''

  try {
    const learnerView = await assignments.getForLearner(principal, data.assignmentId)
    const file = formData.get('file')
    let fileUrl: string | undefined
    let fileName: string | undefined

    if (file instanceof File && file.size > 0) {
      if (!learnerView.assignment.allowFile) {
        return { status: 'error', message: "Ce devoir n'accepte pas de fichier.", fieldErrors: { file: 'Fichier non autorisé' }, text }
      }
      let validated
      try {
        validated = validateUpload(file, { maxMb: learnerView.assignment.maxFileSizeMb, mimeTypes: learnerView.assignment.allowedMimeTypes })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Fichier refusé'
        return { status: 'error', message, fieldErrors: { file: message }, text }
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { key } = await getStorage().put(buildKey(`submissions/${data.assignmentId}`, validated.fileName), bytes, {
        contentType: validated.mimeType,
        visibility: 'PRIVATE',
      })
      // `submissionInputSchema.fileUrl` exige une URL absolue : la route applicative signée sert le fichier.
      fileUrl = `${resolvePublicUrl('lms')}${storageRoutePath(key)}`
      fileName = validated.fileName
    }

    if (text && !learnerView.assignment.allowText) {
      return { status: 'error', message: "Ce devoir n'accepte pas de réponse texte.", fieldErrors: { text: 'Réponse texte non autorisée' }, text }
    }
    if (data.intent === 'submit' && !text && !fileUrl && !learnerView.submission?.fileUrl && !learnerView.submission?.text) {
      return { status: 'error', message: 'Ajoutez un texte ou un fichier avant de soumettre.', fieldErrors: { text: 'Réponse requise' }, text }
    }

    const input = { assignmentId: data.assignmentId, text: text || undefined, fileUrl, fileName }
    if (data.intent === 'submit') await assignments.submit(principal, input)
    else await assignments.saveDraft(principal, input)

    revalidatePath(`/devoirs/${data.assignmentId}`)
    revalidatePath('/devoirs')
    revalidatePath('/dashboard')
    if (data.courseId) revalidatePath(`/apprendre/${data.courseId}`, 'layout')
    return data.intent === 'submit'
      ? { status: 'submitted', message: 'Votre devoir a été remis. Le formateur sera notifié.' }
      : { status: 'saved', message: 'Brouillon enregistré. Vous pourrez le compléter avant de le soumettre.' }
  } catch (error) {
    unstable_rethrow(error)
    const failure: ActionResult<never> = actionFailure(error)
    return { status: 'error', message: failure.ok ? undefined : failure.error, fieldErrors: failure.ok ? undefined : failure.fieldErrors, text }
  }
}
