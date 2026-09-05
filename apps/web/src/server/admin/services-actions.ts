'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { serviceRequests, services, type ServiceFormField } from '@fetrag/cms'
import { idSchema, serviceRequestStatuses, z } from '@fetrag/contracts'
import type { ServiceRequestStatus } from '@fetrag/db'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { bool, int, nullableInt, nullableJson, nullableMoney, nullableText, optionalSlug, readSeo, relationId, revalidateContent, successState, text, toErrorState } from './form-helpers'

// -----------------------------------------------------------------------------
// Catalogue des services
// -----------------------------------------------------------------------------

export type ServiceField =
  | 'name'
  | 'slug'
  | 'summary'
  | 'description'
  | 'conditions'
  | 'icon'
  | 'categoryId'
  | 'priceAmount'
  | 'currency'
  | 'formSchema'
  | 'slaDays'
  | 'position'
  | 'seo'

export async function saveServiceAction(_previous: ActionState<ServiceField>, formData: FormData): Promise<ActionState<ServiceField>> {
  const id = text(formData, 'id') || null
  let createdId: string | null = null
  try {
    const principal = await requireActionCan('services.manage')
    const ctx = await adminRequestContext()
    const input = {
      slug: optionalSlug(formData),
      name: text(formData, 'name'),
      summary: nullableText(formData, 'summary'),
      description: text(formData, 'description'),
      conditions: nullableText(formData, 'conditions'),
      icon: nullableText(formData, 'icon'),
      categoryId: relationId(formData, 'categoryId'),
      isPaid: bool(formData, 'isPaid'),
      priceAmount: nullableMoney(formData, 'priceAmount'),
      currency: (text(formData, 'currency') || 'XAF').toUpperCase(),
      requiresAccount: bool(formData, 'requiresAccount'),
      formSchema: nullableJson<ServiceFormField[]>(formData, 'formSchema'),
      slaDays: nullableInt(formData, 'slaDays'),
      position: int(formData, 'position') ?? 0,
      seo: readSeo(formData),
    }
    if (id) {
      const service = await services.update(id, input, principal, ctx)
      revalidatePath('/admin/services', 'layout')
      revalidateContent('service', service.slug)
      return successState(`Service « ${service.name} » enregistré.`)
    }
    const service = await services.create(input, principal, ctx)
    createdId = service.id
    revalidatePath('/admin/services', 'layout')
  } catch (error) {
    return toErrorState<ServiceField>(error)
  }
  redirect(`/admin/services/${createdId}?cree=1`)
}

// -----------------------------------------------------------------------------
// Demandes de service
// -----------------------------------------------------------------------------

export type RequestField = 'assigneeId' | 'status' | 'comment' | 'internalNote'

/** Attribue (ou retire) le responsable d'une demande. */
export async function assignRequestAction(_previous: ActionState<RequestField>, formData: FormData): Promise<ActionState<RequestField>> {
  const parsed = z.object({ requestId: idSchema, assigneeId: idSchema.nullable() }).safeParse({ requestId: text(formData, 'requestId'), assigneeId: relationId(formData, 'assigneeId') })
  if (!parsed.success) return { status: 'error', message: 'Attribution invalide.', fieldErrors: { assigneeId: 'Responsable invalide' } }
  try {
    const principal = await requireActionCan('services.handle_requests')
    const ctx = await adminRequestContext()
    const request = await serviceRequests.assign(parsed.data.requestId, parsed.data.assigneeId, principal, ctx)
    revalidatePath('/admin/demandes', 'layout')
    return successState(parsed.data.assigneeId ? `Demande ${request.reference} attribuée à ${request.assignee?.name ?? request.assignee?.email ?? 'un responsable'}.` : `Attribution retirée pour ${request.reference}.`)
  } catch (error) {
    return toErrorState<RequestField>(error)
  }
}

/** Change le statut d'une demande avec un commentaire transmis au demandeur. */
export async function setRequestStatusAction(_previous: ActionState<RequestField>, formData: FormData): Promise<ActionState<RequestField>> {
  const parsed = z
    .object({ requestId: idSchema, status: z.enum(serviceRequestStatuses), comment: z.string().trim().max(3000).optional() })
    .safeParse({ requestId: text(formData, 'requestId'), status: text(formData, 'status'), comment: text(formData, 'comment') })
  if (!parsed.success) return { status: 'error', message: 'Statut invalide.', fieldErrors: { status: 'Choisissez un statut' } }
  try {
    const principal = await requireActionCan('services.handle_requests')
    const ctx = await adminRequestContext()
    const request = await serviceRequests.setStatus(parsed.data.requestId, parsed.data.status as ServiceRequestStatus, principal, { comment: parsed.data.comment, ctx })
    revalidatePath('/admin/demandes', 'layout')
    revalidatePath('/espace/demandes')
    return successState(`Demande ${request.reference} mise à jour ; le demandeur est informé par email.`)
  } catch (error) {
    return toErrorState<RequestField>(error)
  }
}

/** Note interne (visible uniquement par l'équipe). */
export async function updateRequestNoteAction(_previous: ActionState<RequestField>, formData: FormData): Promise<ActionState<RequestField>> {
  const requestId = idSchema.safeParse(text(formData, 'requestId'))
  if (!requestId.success) return { status: 'error', message: 'Demande inconnue.' }
  try {
    const principal = await requireActionCan('services.handle_requests')
    const ctx = await adminRequestContext()
    await serviceRequests.update(requestId.data, { internalNote: nullableText(formData, 'internalNote') }, principal, ctx)
    revalidatePath(`/admin/demandes/${requestId.data}`)
    return successState('Note interne enregistrée.')
  } catch (error) {
    return toErrorState<RequestField>(error)
  }
}

/** Supprime une demande clôturée ou refusée (services.manage). */
export async function deleteRequestAction(requestId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(requestId)
  if (!parsed.success) return { status: 'error', message: 'Demande inconnue.' }
  try {
    const principal = await requireActionCan('services.manage')
    const ctx = await adminRequestContext()
    await serviceRequests.remove(parsed.data, principal, ctx)
    revalidatePath('/admin/demandes', 'layout')
    return successState('Demande supprimée.')
  } catch (error) {
    return toErrorState(error)
  }
}
