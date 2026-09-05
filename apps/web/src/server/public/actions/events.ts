'use server'

import { revalidatePath } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'
import { events, waitingListInputSchema } from '@fetrag/cms'
import { idSchema, slugSchema } from '@fetrag/contracts'
import { toDomainError, type Principal } from '@fetrag/domain'
import { createCheckout } from '@fetrag/payments'
import { guards } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { field, firstErrors, pickValues, type PublicFormState } from '../form-state'
import { requestContext } from '../request-context'

export type EventActionState = PublicFormState<'fullName' | 'email'>

const HOUR = 60 * 60_000

function readTarget(formData: FormData): { eventId: string; slug: string } | null {
  const eventId = idSchema.safeParse(field(formData, 'eventId'))
  const slug = slugSchema.safeParse(field(formData, 'slug'))
  if (!eventId.success || !slug.success) return null
  return { eventId: eventId.data, slug: slug.data }
}

function revalidateEvent(slug: string): void {
  revalidatePath(`/evenements/${slug}`)
  revalidatePath('/evenements')
  revalidatePath('/espace/inscriptions')
}

/**
 * Inscription d'un visiteur connecté à un événement publié.
 * Gratuit → inscription confirmée ; complet → liste d'attente ; payant → commande et redirection vers /paiement/[orderId].
 */
export async function registerEventAction(_previous: EventActionState, formData: FormData): Promise<EventActionState> {
  const target = readTarget(formData)
  if (!target) return { status: 'error', message: 'Événement inconnu. Rechargez la page et réessayez.' }
  const eventPath = `/evenements/${target.slug}`

  const principal = await guards.getPrincipal()
  if (!principal) redirect(`/connexion?callbackUrl=${encodeURIComponent(eventPath)}`)

  const ctx = await requestContext()
  const limit = checkRateLimit(`event-register:${principal.id}`, 10, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.` }
  }

  let redirectTo: string | null = null
  let state: EventActionState

  try {
    const result = await events.register(principal, target.eventId, { ip: ctx.ip, userAgent: ctx.userAgent })
    switch (result.status) {
      case 'REGISTERED':
        state = { status: 'success', message: 'Votre inscription est confirmée. Un email récapitulatif vous a été envoyé.' }
        break
      case 'ALREADY_REGISTERED':
        state = {
          status: 'success',
          message:
            result.registration?.status === 'WAITLISTED'
              ? "Vous êtes déjà inscrit sur la liste d'attente de cet événement."
              : 'Vous êtes déjà inscrit à cet événement.',
        }
        break
      case 'WAITLISTED':
        state = { status: 'success', message: "L'événement est complet : vous êtes inscrit sur la liste d'attente et serez prévenu si une place se libère." }
        break
      case 'PAYMENT_REQUIRED': {
        if (!result.offerId) {
          state = { status: 'error', message: "L'inscription payante n'est pas encore ouverte pour cet événement. Réessayez plus tard." }
          break
        }
        try {
          const checkout = await createCheckout(principal, {
            offerId: result.offerId,
            quantity: 1,
            method: 'MOBILE_MONEY',
            idempotencyKey: `event:${target.eventId}:${principal.id}`,
          })
          redirectTo = checkout.status === 'PAID' ? eventPath : `/paiement/${checkout.orderId}`
          state = { status: 'success', message: 'Redirection vers le paiement…' }
        } catch (error) {
          unstable_rethrow(error)
          const domainError = toDomainError(error)
          console.error('[web:events] création du checkout impossible', domainError.message)
          state = {
            status: 'error',
            message:
              domainError.code === 'PRECONDITION_FAILED'
                ? domainError.message
                : "Le paiement n'a pas pu être initié. Réessayez dans quelques instants.",
          }
        }
        break
      }
    }
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error('[web:events] inscription impossible', domainError.message)
    return {
      status: 'error',
      message:
        domainError.code === 'PRECONDITION_FAILED' || domainError.code === 'NOT_FOUND'
          ? domainError.message
          : "L'inscription n'a pas pu être enregistrée. Réessayez dans quelques instants.",
    }
  }

  revalidateEvent(target.slug)
  if (redirectTo) redirect(redirectTo)
  return state
}

/** Annulation de l'inscription du visiteur connecté (la place libérée est proposée à la liste d'attente). */
export async function cancelEventRegistrationAction(_previous: EventActionState, formData: FormData): Promise<EventActionState> {
  const target = readTarget(formData)
  if (!target) return { status: 'error', message: 'Événement inconnu. Rechargez la page et réessayez.' }

  const principal = await guards.getPrincipal()
  if (!principal) redirect(`/connexion?callbackUrl=${encodeURIComponent(`/evenements/${target.slug}`)}`)

  const ctx = await requestContext()
  try {
    await events.cancelRegistration(principal, target.eventId, { ip: ctx.ip, userAgent: ctx.userAgent })
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    return {
      status: 'error',
      message: domainError.code === 'PRECONDITION_FAILED' ? domainError.message : "L'annulation n'a pas pu être enregistrée.",
    }
  }
  revalidateEvent(target.slug)
  return { status: 'success', message: 'Votre inscription a été annulée.' }
}

/** Inscription sur la liste d'attente par email (événement complet), ouverte aux visiteurs non connectés. */
export async function joinWaitingListAction(_previous: EventActionState, formData: FormData): Promise<EventActionState> {
  const target = readTarget(formData)
  const values = pickValues(formData, ['fullName', 'email'])
  if (!target) return { status: 'error', message: 'Événement inconnu. Rechargez la page et réessayez.', values }

  if (field(formData, 'website').trim().length > 0) {
    return { status: 'success', message: "Vous êtes inscrit sur la liste d'attente." }
  }

  const parsed = waitingListInputSchema.safeParse({ fullName: values.fullName, email: values.email })
  if (!parsed.success) {
    return { status: 'error', message: 'Vérifiez les informations saisies.', fieldErrors: firstErrors<'fullName' | 'email'>(parsed.error.issues), values }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`waiting-list:${ctx.ipHash ?? 'anonymous'}`, 5, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`, values }
  }

  let principal: Principal | null = null
  try {
    principal = await guards.getPrincipal()
  } catch {
    principal = null
  }

  try {
    const entry = await events.joinWaitingList(target.eventId, parsed.data, principal)
    revalidateEvent(target.slug)
    return {
      status: 'success',
      message: `Vous êtes inscrit en position ${entry.position} sur la liste d'attente. Nous vous préviendrons par email si une place se libère.`,
    }
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    return {
      status: 'error',
      message: domainError.code === 'PRECONDITION_FAILED' || domainError.code === 'NOT_FOUND' ? domainError.message : "L'inscription n'a pas pu être enregistrée.",
      values,
    }
  }
}
