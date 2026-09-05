'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { idSchema, slugSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { toDomainError } from '@fetrag/domain'
import { createCheckout } from '@fetrag/payments'
import { guards } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { field, type PublicFormState } from '../form-state'

export type ResourcePurchaseState = PublicFormState<never>

const HOUR = 60 * 60_000

/**
 * Achat d'une ressource PREMIUM : vérifie l'offre active rattachée à la ressource,
 * crée la commande via `createCheckout` puis redirige vers le parcours de paiement.
 */
export async function purchaseResourceAction(_previous: ResourcePurchaseState, formData: FormData): Promise<ResourcePurchaseState> {
  const resourceId = idSchema.safeParse(field(formData, 'resourceId'))
  const slug = slugSchema.safeParse(field(formData, 'slug'))
  if (!resourceId.success || !slug.success) {
    return { status: 'error', message: 'Ressource inconnue. Rechargez la page et réessayez.' }
  }
  const resourcePath = `/ressources/${slug.data}`

  const principal = await guards.getPrincipal()
  if (!principal) redirect(`/connexion?callbackUrl=${encodeURIComponent(resourcePath)}`)

  const limit = checkRateLimit(`resource-purchase:${principal.id}`, 10, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.` }
  }

  const now = new Date()
  const offer = await prisma.offer.findFirst({
    where: {
      resourceId: resourceId.data,
      kind: 'RESOURCE',
      isActive: true,
      resource: { status: 'PUBLISHED', slug: slug.data },
      AND: [{ OR: [{ validFrom: null }, { validFrom: { lte: now } }] }, { OR: [{ validUntil: null }, { validUntil: { gte: now } }] }],
    },
    orderBy: [{ tier: 'asc' }, { amount: 'asc' }],
    select: { id: true },
  })
  if (!offer) {
    return { status: 'error', message: "Cette ressource n'est pas disponible à l'achat pour le moment." }
  }

  let redirectTo: string
  try {
    const checkout = await createCheckout(principal, {
      offerId: offer.id,
      quantity: 1,
      method: 'MOBILE_MONEY',
      idempotencyKey: `resource:${resourceId.data}:${principal.id}`,
    })
    redirectTo = checkout.status === 'PAID' ? `${resourcePath}/telecharger` : `/paiement/${checkout.orderId}`
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error('[web:resources] création du checkout impossible', domainError.message)
    return {
      status: 'error',
      message:
        domainError.code === 'PRECONDITION_FAILED'
          ? domainError.message
          : "Le paiement n'a pas pu être initié. Réessayez dans quelques instants.",
    }
  }
  redirect(redirectTo)
}
