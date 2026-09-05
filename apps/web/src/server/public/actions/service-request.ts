'use server'

import { revalidatePath } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'
import { serviceRequests } from '@fetrag/cms'
import { idSchema, serviceRequestFormSchema, slugSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { toDomainError } from '@fetrag/domain'
import { createCheckout } from '@fetrag/payments'
import { guards } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { checked, field, firstErrors, pickValues, type PublicFormState } from '../form-state'
import { requestContext } from '../request-context'

export type ServiceRequestField = 'fullName' | 'email' | 'phone' | 'organization' | 'message' | 'consent' | (string & {})
export type ServiceRequestState = PublicFormState<ServiceRequestField>

const HOUR = 60 * 60_000
const DYNAMIC_PREFIX = 'field.'
const textFields = ['fullName', 'email', 'phone', 'organization', 'message'] as const

/** Champs du formulaire dynamique du service (`field.<nom>`), convertis en payload JSON borné. */
function dynamicPayload(formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(DYNAMIC_PREFIX) || typeof value !== 'string') continue
    const name = key.slice(DYNAMIC_PREFIX.length)
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(name)) continue
    const trimmed = value.trim().slice(0, 5000)
    if (trimmed === 'on') payload[name] = true
    else if (trimmed.length > 0) payload[name] = trimmed
  }
  return payload
}

function dynamicValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(DYNAMIC_PREFIX) && typeof value === 'string') values[key] = value
  }
  return values
}

/**
 * Dépôt d'une demande de service (page /services/[slug]).
 * Service payant : la commande est créée via `createCheckout` et l'utilisateur est redirigé vers /paiement/[orderId].
 * Service gratuit : confirmation avec la référence SRV-….
 */
export async function createServiceRequestAction(_previous: ServiceRequestState, formData: FormData): Promise<ServiceRequestState> {
  const values = { ...pickValues(formData, textFields), ...dynamicValues(formData) }
  const serviceId = idSchema.safeParse(field(formData, 'serviceId'))
  const slug = slugSchema.safeParse(field(formData, 'slug'))
  if (!serviceId.success || !slug.success) {
    return { status: 'error', message: 'Service inconnu. Rechargez la page et réessayez.', values }
  }
  const servicePath = `/services/${slug.data}`

  // Pot de miel : réponse neutre sans enregistrement.
  if (field(formData, 'website').trim().length > 0) {
    return { status: 'success', message: 'Votre demande a bien été enregistrée.' }
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId.data, status: 'PUBLISHED' },
    select: { id: true, name: true, requiresAccount: true, isPaid: true },
  })
  if (!service) {
    return { status: 'error', message: "Ce service n'est plus disponible.", values }
  }

  const principal = await guards.getPrincipal()
  if ((service.requiresAccount || service.isPaid) && !principal) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(servicePath)}`)
  }

  const parsed = serviceRequestFormSchema.safeParse({
    serviceId: service.id,
    fullName: field(formData, 'fullName').trim() || principal?.name || '',
    email: field(formData, 'email').trim() || principal?.email || '',
    phone: field(formData, 'phone').trim(),
    organization: field(formData, 'organization').trim() || undefined,
    message: field(formData, 'message').trim() || undefined,
    payload: dynamicPayload(formData),
    consent: checked(formData, 'consent') ? true : undefined,
  })
  if (!parsed.success) {
    const fieldErrors = firstErrors<ServiceRequestField>(parsed.error.issues)
    if (fieldErrors.consent) fieldErrors.consent = 'Vous devez accepter le traitement de vos données.'
    return { status: 'error', message: 'Certains champs sont incomplets ou invalides.', fieldErrors, values }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`service-request:${principal?.id ?? ctx.ipHash ?? 'anonymous'}`, 5, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de demandes envoyées. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`, values }
  }

  const { serviceId: _serviceId, ...input } = parsed.data
  let redirectTo: string | null = null
  let state: ServiceRequestState

  try {
    const result = await serviceRequests.create(service.id, input, principal, { ip: ctx.ip, userAgent: ctx.userAgent })
    const reference = result.request.reference
    state = {
      status: 'success',
      reference,
      message: `Votre demande « ${service.name} » a été enregistrée sous la référence ${reference}. Un accusé de réception vous a été envoyé par email.`,
    }

    if (result.requiresPayment && principal) {
      if (!result.offerId) {
        state.message = `${state.message} Le paiement de ce service sera proposé depuis votre espace personnel.`
      } else {
        try {
          const checkout = await createCheckout(principal, {
            offerId: result.offerId,
            quantity: 1,
            method: 'MOBILE_MONEY',
            idempotencyKey: `service-request:${result.request.id}`,
          })
          redirectTo = checkout.status === 'PAID' ? '/espace/demandes' : `/paiement/${checkout.orderId}`
        } catch (error) {
          unstable_rethrow(error)
          console.error('[web:services] création du checkout impossible', toDomainError(error).message)
          state.message = `${state.message} Le paiement n'a pas pu être initié : vous pourrez le régler depuis votre espace personnel.`
        }
      }
    }
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error('[web:services] dépôt de demande impossible', domainError.message)
    const details = domainError.details?.fieldErrors
    const fieldErrors: Partial<Record<ServiceRequestField, string>> = {}
    if (details && typeof details === 'object') {
      for (const [key, messages] of Object.entries(details as Record<string, unknown>)) {
        const first = Array.isArray(messages) ? messages[0] : messages
        if (typeof first === 'string') fieldErrors[`${DYNAMIC_PREFIX}${key}`] = first
      }
    }
    return {
      status: 'error',
      message:
        domainError.code === 'UNAUTHENTICATED'
          ? 'Connectez-vous pour déposer cette demande.'
          : domainError.code === 'VALIDATION_ERROR'
            ? 'Le formulaire est incomplet : vérifiez les champs signalés.'
            : "Votre demande n'a pas pu être enregistrée. Réessayez dans quelques instants.",
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      values,
    }
  }

  revalidatePath(servicePath)
  revalidatePath('/espace/demandes')
  if (redirectTo) redirect(redirectTo)
  return state
}
