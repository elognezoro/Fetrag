'use server'

import { unstable_rethrow } from 'next/navigation'
import { newsletter } from '@fetrag/cms'
import { features } from '@fetrag/config'
import { newsletterSchema } from '@fetrag/contracts'
import { toDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { checked, field, firstErrors, type PublicFormState } from '../form-state'
import { requestContext } from '../request-context'

export type NewsletterField = 'email' | 'consent'
export type NewsletterState = PublicFormState<NewsletterField>

const HOUR = 60 * 60_000

/**
 * Inscription à la lettre d'information (double opt-in via `newsletter.subscribe`).
 * Le pot de miel `website` renvoie un succès neutre sans rien enregistrer.
 */
export async function subscribeNewsletterAction(_previous: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = field(formData, 'email').trim()
  const values = { email }

  if (field(formData, 'website').trim().length > 0) {
    return { status: 'success', message: 'Merci ! Vérifiez votre boîte de réception pour confirmer votre inscription.', values }
  }

  if (!features.newsletter()) {
    return { status: 'error', message: "La lettre d'information est momentanément indisponible.", values }
  }

  const parsed = newsletterSchema.safeParse({ email, consent: checked(formData, 'consent') ? true : undefined })
  if (!parsed.success) {
    const fieldErrors = firstErrors<NewsletterField>(parsed.error.issues)
    if (fieldErrors.consent) fieldErrors.consent = "Vous devez accepter de recevoir la lettre d'information."
    return { status: 'error', message: 'Vérifiez les informations saisies.', fieldErrors, values }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`newsletter:${ctx.ipHash ?? 'anonymous'}`, 5, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de tentatives. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`, values }
  }

  let userId: string | null = null
  try {
    userId = (await guards.getPrincipal())?.id ?? null
  } catch {
    userId = null
  }

  try {
    const result = await newsletter.subscribe(parsed.data, { source: 'web:newsletter', userId, ip: ctx.ip, userAgent: ctx.userAgent })
    if (result.state === 'already_confirmed') {
      return { status: 'success', message: "Vous êtes déjà abonné à la lettre d'information de la FETRAG.", values }
    }
    return {
      status: 'success',
      message: result.confirmationSent
        ? `Un email de confirmation vient d'être envoyé à ${result.email}. Ouvrez le lien qu'il contient pour finaliser votre inscription.`
        : 'Un email de confirmation vous a déjà été envoyé récemment. Vérifiez votre boîte de réception (et vos courriers indésirables).',
      values,
    }
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error('[web:newsletter] inscription impossible', domainError.message)
    return {
      status: 'error',
      message:
        domainError.code === 'VALIDATION_ERROR'
          ? 'Adresse email invalide.'
          : "L'inscription n'a pas pu être enregistrée. Réessayez dans quelques instants.",
      values,
    }
  }
}
