'use server'

import { revalidatePath } from 'next/cache'
import { idSchema, type TrainingRequestInput } from '@fetrag/contracts'
import { audit } from '@fetrag/domain'
import { auditContext, trainingRequests } from '@fetrag/lms-core'
import { buildKey, getStorage, validateUpload } from '@fetrag/storage'
import { resolvePublicUrl } from '@fetrag/config'
import { failureState, successState, type ActionState } from './action-state'
import { formFile, formString, runAction } from './context'
import { saveDraftRequest } from './organizations'
import { cancelRequestSchema, submitRequestSchema, type DraftRequestInput, type SubmitRequestInput } from './schemas'

const ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const
const ATTACHMENT_MAX_MB = 10

function revalidateRequest(requestId?: string) {
  revalidatePath('/demande-formation')
  revalidatePath('/organisation')
  revalidatePath('/organisation/demandes')
  revalidatePath('/coordination/demandes')
  if (requestId) {
    revalidatePath(`/demande-formation/${requestId}`)
    revalidatePath(`/organisation/demandes/${requestId}`)
    revalidatePath(`/coordination/demandes/${requestId}`)
  }
}

/** Enregistre l'avancement de l'assistant (brouillon DRAFT créé ou mis à jour). */
export async function saveTrainingRequestDraft(input: DraftRequestInput): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const request = await saveDraftRequest(principal, input, meta)
    revalidateRequest(request.id)
    return successState('Brouillon enregistré', { id: request.id })
  })
}

function toTrainingRequestInput(data: ReturnType<typeof submitRequestSchema.parse>): TrainingRequestInput {
  return {
    organizationId: data.organizationId,
    contactName: data.contactName,
    contactRole: data.contactRole || undefined,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone || undefined,
    courseIds: data.courseIds,
    participants: data.participants.map((p) => ({ fullName: p.fullName, email: p.email || undefined, phone: p.phone || undefined, jobTitle: p.jobTitle || undefined })),
    preferredStart: data.preferredStart ? new Date(data.preferredStart) : undefined,
    preferredMode: data.preferredMode,
    motivation: data.motivation || undefined,
    commitmentsAccepted: true,
  }
}

/** Soumission finale : crée la demande ou actualise le brouillon puis le transmet à la coordination. */
export async function submitTrainingRequest(input: SubmitRequestInput): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = submitRequestSchema.parse(input)
    const payload = toTrainingRequestInput(data)
    let requestId: string
    let reference: string
    if (data.requestId) {
      await trainingRequests.update(principal, data.requestId, payload, meta)
      const submitted = await trainingRequests.submit(principal, data.requestId, meta)
      requestId = submitted.id
      reference = submitted.reference
    } else {
      const created = await trainingRequests.create(principal, payload, { submit: true }, meta)
      requestId = created.id
      reference = created.reference
    }
    revalidateRequest(requestId)
    return successState(`Demande ${reference} transmise à la coordination FETRAG`, { id: requestId, redirectTo: `/demande-formation/${requestId}` })
  })
}

/** Annulation par l'organisation (brouillon, demande soumise ou planifiée non démarrée). */
export async function cancelTrainingRequest(input: { requestId: string; reason?: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = cancelRequestSchema.parse(input)
    await trainingRequests.cancel(principal, data.requestId, data.reason, meta)
    revalidateRequest(data.requestId)
    return successState('Demande annulée')
  })
}

/** Dépose une pièce officielle (lettre de demande, liste signée...) dans le stockage privé puis la rattache à la demande. */
export async function uploadRequestAttachment(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const requestId = idSchema.parse(formString(formData, 'requestId'))
    const label = formString(formData, 'label').slice(0, 160) || undefined
    const file = formFile(formData, 'file')
    if (!file) return failureState('Sélectionnez un fichier (PDF, image ou document Word, 10 Mo au plus).', { file: 'Fichier requis' })
    const validated = validateUpload({ name: file.name, size: file.size, type: file.type }, { maxMb: ATTACHMENT_MAX_MB, mimeTypes: ATTACHMENT_MIME_TYPES })
    const mimeType = ATTACHMENT_MIME_TYPES.find((m) => m === validated.mimeType)
    if (!mimeType) return failureState('Type de fichier non autorisé.', { file: 'Formats acceptés : PDF, JPEG, PNG, DOC, DOCX' })
    const body = Buffer.from(await file.arrayBuffer())
    const stored = await getStorage().put(buildKey(`training-requests/${requestId}`, validated.fileName), body, { contentType: mimeType, visibility: 'PRIVATE' })
    const fileUrl = /^https?:\/\//.test(stored.url) ? stored.url : `${resolvePublicUrl('lms')}${stored.url}`
    await trainingRequests.addAttachment(principal, requestId, { fileName: validated.fileName, fileUrl, mimeType, size: validated.size, label }, meta)
    revalidateRequest(requestId)
    return successState('Pièce ajoutée à la demande')
  })
}

export async function removeRequestAttachment(input: { attachmentId: string; requestId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const attachmentId = idSchema.parse(input.attachmentId)
    await trainingRequests.removeAttachment(principal, attachmentId, meta)
    await audit('content.updated', { type: 'TrainingRequest', id: input.requestId }, auditContext(principal, meta), { after: { removedAttachment: attachmentId } })
    revalidateRequest(input.requestId)
    return successState('Pièce retirée')
  })
}

/** Nouvelle transmission après une proposition de date (RESCHEDULED -> SUBMITTED) : l'organisation accepte le calendrier proposé. */
export async function resubmitTrainingRequest(input: { requestId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const requestId = idSchema.parse(input.requestId)
    const request = await trainingRequests.submit(principal, requestId, meta)
    revalidateRequest(requestId)
    return successState(`Demande ${request.reference} transmise à nouveau à la coordination`)
  })
}
