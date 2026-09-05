'use server'

import { unstable_rethrow } from 'next/navigation'
import { forms } from '@fetrag/cms'
import { contactFormSchema, membershipFormSchema, partnershipFormSchema, type z } from '@fetrag/contracts'
import type { FormKind } from '@fetrag/db'
import { toDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { checkRateLimit, formatRetryDelay } from '@/lib/rate-limit'
import { checked, field, firstErrors, pickValues, type PublicFormState } from '../form-state'
import { requestContext } from '../request-context'

export type PublicFormField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'subject'
  | 'message'
  | 'organization'
  | 'sector'
  | 'employer'
  | 'jobTitle'
  | 'interest'
  | 'partnershipType'
  | 'consent'

export type ContactFormState = PublicFormState<PublicFormField>

const HOUR = 60 * 60_000
const textFields: readonly PublicFormField[] = [
  'fullName',
  'email',
  'phone',
  'subject',
  'message',
  'organization',
  'sector',
  'employer',
  'jobTitle',
  'interest',
  'partnershipType',
]

const successMessages: Record<FormKind, string> = {
  CONTACT: 'Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.',
  SUPPORT: 'Votre demande d’assistance a bien été enregistrée.',
  SERVICE: 'Votre demande a bien été enregistrée.',
  MEMBERSHIP: "Votre demande d'adhésion a bien été enregistrée. Un responsable de la Fédération vous contactera sous cinq jours ouvrés.",
  PARTNERSHIP: 'Votre proposition de partenariat a bien été transmise au Secrétariat général de la FETRAG.',
}

function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** Construit l'entrée brute commune à tous les formulaires publics. */
function rawInput(kind: FormKind, formData: FormData): Record<string, unknown> {
  return {
    kind,
    fullName: field(formData, 'fullName').trim(),
    email: field(formData, 'email').trim(),
    phone: field(formData, 'phone').trim(),
    subject: optional(field(formData, 'subject')),
    message: field(formData, 'message').trim(),
    organization: optional(field(formData, 'organization')),
    sector: optional(field(formData, 'sector')),
    employer: optional(field(formData, 'employer')),
    jobTitle: optional(field(formData, 'jobTitle')),
    interest: optional(field(formData, 'interest')),
    partnershipType: optional(field(formData, 'partnershipType')),
    consent: checked(formData, 'consent') ? true : undefined,
    website: field(formData, 'website'),
  }
}

/** Dépôt d'un formulaire public : validation Zod, pot de miel, limitation de débit puis `forms.submit`. */
async function submitPublicForm(kind: FormKind, schema: z.ZodTypeAny, formData: FormData): Promise<ContactFormState> {
  const values = pickValues(formData, textFields)
  const raw = rawInput(kind, formData)

  // Pot de miel : réponse neutre, `forms.submit` classe la soumission en indésirable sans notification.
  const honeypot = typeof raw.website === 'string' && raw.website.trim().length > 0

  if (!honeypot) {
    const parsed = schema.safeParse({ ...raw, website: undefined })
    if (!parsed.success) {
      const fieldErrors = firstErrors<PublicFormField>(parsed.error.issues)
      if (fieldErrors.consent) fieldErrors.consent = 'Vous devez accepter le traitement de vos données.'
      return { status: 'error', message: 'Certains champs sont incomplets ou invalides.', fieldErrors, values }
    }
  }

  const ctx = await requestContext()
  const limit = checkRateLimit(`form:${kind}:${ctx.ipHash ?? 'anonymous'}`, 5, HOUR)
  if (!limit.allowed) {
    return { status: 'error', message: `Trop de messages envoyés depuis cette connexion. Réessayez dans ${formatRetryDelay(limit.retryAfterSeconds)}.`, values }
  }

  let userId: string | null = null
  try {
    userId = (await guards.getPrincipal())?.id ?? null
  } catch {
    userId = null
  }

  try {
    const result = await forms.submit(kind, raw, { ip: ctx.ip, userAgent: ctx.userAgent, userId })
    return {
      status: 'success',
      message: successMessages[kind],
      reference: result.spam ? undefined : result.reference,
    }
  } catch (error) {
    unstable_rethrow(error)
    const domainError = toDomainError(error)
    console.error(`[web:forms] dépôt ${kind} impossible`, domainError.message)
    if (domainError.code === 'RATE_LIMITED') {
      return { status: 'error', message: domainError.message, values }
    }
    if (domainError.code === 'VALIDATION_ERROR') {
      return { status: 'error', message: 'Certains champs sont incomplets ou invalides.', values }
    }
    return { status: 'error', message: "Votre message n'a pas pu être envoyé. Réessayez dans quelques instants.", values }
  }
}

/** Formulaire de contact (page /contact). */
export async function contactAction(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  return submitPublicForm('CONTACT', contactFormSchema, formData)
}

/** Formulaire d'adhésion / d'intérêt (page /adhesion). */
export async function membershipAction(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  return submitPublicForm('MEMBERSHIP', membershipFormSchema, formData)
}

/** Formulaire de partenariat (page /partenariat). */
export async function partnershipAction(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  return submitPublicForm('PARTNERSHIP', partnershipFormSchema, formData)
}
