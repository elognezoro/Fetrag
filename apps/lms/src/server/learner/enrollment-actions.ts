'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { idSchema } from '@fetrag/contracts'
import { enrollments, progress } from '@fetrag/lms-core'
import { createCheckout } from '@fetrag/payments'
import { z } from 'zod'
import { guards } from '@/lib/auth'
import { webHref } from '@/lib/site'
import { actionFailure, actionSuccess, type ActionResult } from './errors'
import { requestMeta } from './meta'

const enrollSchema = z.object({ courseId: idSchema, slug: z.string().min(1).max(160) })

export interface EnrollOutcome {
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'OTHER'
  href: string | null
}

/** Inscription directe (politique SELF) ou demande d'inscription (politique APPROVAL). */
export async function enrollAction(input: { courseId: string; slug: string }): Promise<ActionResult<EnrollOutcome>> {
  const principal = await guards.requireUser(`/cours/${input.slug}`)
  try {
    const data = enrollSchema.parse(input)
    const meta = await requestMeta()
    const enrollment = await enrollments.enroll(principal, data.courseId, { source: 'self' }, meta)
    revalidatePath(`/cours/${data.slug}`)
    revalidatePath('/dashboard')
    revalidatePath('/mes-formations')
    if (enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED') {
      const next = await progress.nextActivity(enrollment.id).catch(() => null)
      return actionSuccess({ status: enrollment.status, href: next?.href ?? `/apprendre/${data.courseId}` })
    }
    return actionSuccess({ status: enrollment.status === 'PENDING' ? 'PENDING' : 'OTHER', href: null })
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
}

const checkoutSchema = z.object({
  offerId: idSchema,
  slug: z.string().min(1).max(160),
  idempotencyKey: z.string().min(8).max(120),
})

/**
 * Formation payante : crée la commande et redirige vers le parcours de paiement du site institutionnel
 * (`/paiement/<orderId>`). En cas d'échec, renvoie le message à afficher sous le bouton.
 */
export async function checkoutAction(input: { offerId: string; slug: string; idempotencyKey: string }): Promise<ActionResult<{ orderId: string }>> {
  const principal = await guards.requireUser(`/cours/${input.slug}`)
  let target: string | null = null
  try {
    const data = checkoutSchema.parse(input)
    const result = await createCheckout(principal, {
      offerId: data.offerId,
      quantity: 1,
      method: 'MOBILE_MONEY',
      idempotencyKey: data.idempotencyKey,
    })
    if (result.status === 'PAID') {
      revalidatePath(`/cours/${data.slug}`)
      revalidatePath('/mes-formations')
      target = '/mes-formations'
    } else {
      target = result.nextAction.type === 'redirect' && result.nextAction.url ? result.nextAction.url : webHref(`/paiement/${result.orderId}`)
    }
  } catch (error) {
    unstable_rethrow(error)
    return actionFailure(error)
  }
  redirect(target)
}
