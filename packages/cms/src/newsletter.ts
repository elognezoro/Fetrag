// Newsletter (WEB-13) : inscription en double opt-in, confirmation, désinscription, export des consentements.
import { randomUUID } from 'node:crypto'
import { prisma, type NewsletterSubscription, type Prisma } from '@fetrag/db'
import { features, resolvePublicUrl } from '@fetrag/config'
import { newsletterSchema, type Paginated } from '@fetrag/contracts'
import { audit, hashIp, NotFoundError, paginationArgs, PreconditionError, toPaginated, type Principal } from '@fetrag/domain'
import { assertAny, assertCan, auditCtx, contains, parseInput, toCsv, type Maybe, type RequestContext } from './common'
import { plainTextEmail, sendEmail } from './platform'
import { newsletterListQuerySchema } from './schemas'
import type { z } from 'zod'

export type NewsletterListQuery = z.input<typeof newsletterListQuerySchema>
export type SubscriptionState = 'pending' | 'confirmed' | 'unsubscribed'

export interface SubscribeOptions extends RequestContext {
  /** Origine de l'inscription (formulaire pied de page, inscription compte, événement...). */
  source?: string
  /** Utilisateur connecté à rattacher à l'abonnement. */
  userId?: string | null
}

export interface SubscribeResult {
  state: SubscriptionState | 'already_confirmed'
  email: string
  /** Vrai si un email de confirmation vient d'être envoyé. */
  confirmationSent: boolean
}

const RESEND_COOLDOWN_MS = 10 * 60 * 1000

/** État lisible d'un abonnement. */
export function stateOf(sub: Pick<NewsletterSubscription, 'confirmedAt' | 'unsubscribedAt'>): SubscriptionState {
  if (sub.unsubscribedAt) return 'unsubscribed'
  return sub.confirmedAt ? 'confirmed' : 'pending'
}

function ensureEnabled(): void {
  if (!features.newsletter()) throw new PreconditionError('La newsletter est désactivée')
}

function confirmUrl(token: string): string {
  return `${resolvePublicUrl('web')}/newsletter/confirmer?token=${encodeURIComponent(token)}`
}

function unsubscribeUrl(token: string): string {
  return `${resolvePublicUrl('web')}/newsletter/desinscription?token=${encodeURIComponent(token)}`
}

async function sendConfirmation(email: string, token: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Confirmez votre inscription à la lettre d’information FETRAG',
    template: 'newsletter-confirmation',
    variables: { confirmUrl: confirmUrl(token), unsubscribeUrl: unsubscribeUrl(token) },
    text: plainTextEmail([
      'Bonjour,',
      '',
      'Merci de votre intérêt pour la Fédération des Travailleurs du Gabon.',
      'Pour confirmer votre inscription à notre lettre d’information, ouvrez le lien suivant :',
      confirmUrl(token),
      '',
      'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement ce message.',
    ]),
  })
}

async function recordConsent(userId: string | null | undefined, granted: boolean, ctx: RequestContext): Promise<void> {
  if (!userId) return
  await prisma.consent
    .create({ data: { userId, kind: 'NEWSLETTER', granted, ipAddress: hashIp(ctx.ip), userAgent: ctx.userAgent?.slice(0, 300) ?? null } })
    .catch((error: unknown) => console.error('[cms] enregistrement du consentement impossible', error))
}

// -----------------------------------------------------------------------------
// Parcours public
// -----------------------------------------------------------------------------

/**
 * Inscription en double opt-in : crée ou réactive l'abonnement, génère un jeton et envoie
 * l'email de confirmation (lien `/newsletter/confirmer?token=`). Pot de miel `website` → succès silencieux.
 */
export async function subscribe(input: unknown, options: SubscribeOptions = {}): Promise<SubscribeResult> {
  ensureEnabled()
  const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
  if (typeof raw.website === 'string' && raw.website.trim().length > 0) {
    const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : ''
    return { state: 'pending', email, confirmationSent: false }
  }
  const data = parseInput(newsletterSchema, { ...raw, website: undefined })
  const existing = await prisma.newsletterSubscription.findUnique({ where: { email: data.email } })

  if (existing && existing.confirmedAt && !existing.unsubscribedAt) {
    return { state: 'already_confirmed', email: data.email, confirmationSent: false }
  }
  if (existing && !existing.confirmedAt && !existing.unsubscribedAt && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { state: 'pending', email: data.email, confirmationSent: false }
  }

  const token = randomUUID()
  const subscription = existing
    ? await prisma.newsletterSubscription.update({
        where: { id: existing.id },
        data: { token, unsubscribedAt: null, confirmedAt: null, source: options.source ?? existing.source, userId: options.userId ?? existing.userId, createdAt: new Date() },
      })
    : await prisma.newsletterSubscription.create({
        data: { email: data.email, token, source: options.source ?? 'web', userId: options.userId ?? null },
      })

  try {
    await sendConfirmation(subscription.email, subscription.token)
  } catch (error) {
    console.error('[cms] envoi de la confirmation newsletter impossible', error)
    return { state: 'pending', email: subscription.email, confirmationSent: false }
  }
  return { state: 'pending', email: subscription.email, confirmationSent: true }
}

export interface ConfirmResult {
  email: string
  state: SubscriptionState
  alreadyConfirmed: boolean
}

/** Confirme l'inscription à partir du jeton reçu par email ; enregistre le consentement horodaté. */
export async function confirm(token: string, ctx: RequestContext = {}): Promise<ConfirmResult> {
  const sub = await prisma.newsletterSubscription.findUnique({ where: { token } })
  if (!sub) throw new NotFoundError('Lien de confirmation')
  if (sub.confirmedAt && !sub.unsubscribedAt) return { email: sub.email, state: 'confirmed', alreadyConfirmed: true }
  const updated = await prisma.newsletterSubscription.update({
    where: { id: sub.id },
    data: { confirmedAt: new Date(), unsubscribedAt: null },
  })
  await recordConsent(updated.userId, true, ctx)
  return { email: updated.email, state: 'confirmed', alreadyConfirmed: false }
}

/** Désinscription par jeton (lien présent dans chaque envoi). */
export async function unsubscribe(token: string, ctx: RequestContext = {}): Promise<{ email: string; state: SubscriptionState }> {
  const sub = await prisma.newsletterSubscription.findUnique({ where: { token } })
  if (!sub) throw new NotFoundError('Lien de désinscription')
  if (sub.unsubscribedAt) return { email: sub.email, state: 'unsubscribed' }
  const updated = await prisma.newsletterSubscription.update({ where: { id: sub.id }, data: { unsubscribedAt: new Date() } })
  await recordConsent(updated.userId, false, ctx)
  return { email: updated.email, state: 'unsubscribed' }
}

/** État de l'abonnement d'un email (espace personnel). */
export async function statusFor(email: string): Promise<SubscriptionState | null> {
  const sub = await prisma.newsletterSubscription.findUnique({ where: { email: email.trim().toLowerCase() } })
  return sub ? stateOf(sub) : null
}

// -----------------------------------------------------------------------------
// Administration
// -----------------------------------------------------------------------------

export type SubscriptionListItem = NewsletterSubscription & { state: SubscriptionState }

function whereFor(q: z.output<typeof newsletterListQuerySchema>): Prisma.NewsletterSubscriptionWhereInput {
  const byState: Record<SubscriptionState, Prisma.NewsletterSubscriptionWhereInput> = {
    pending: { confirmedAt: null, unsubscribedAt: null },
    confirmed: { confirmedAt: { not: null }, unsubscribedAt: null },
    unsubscribed: { unsubscribedAt: { not: null } },
  }
  return { ...(q.state ? byState[q.state] : {}), ...(q.q ? { email: contains(q.q) } : {}) }
}

/** Liste paginée des abonnements (forms.read) avec filtre d'état et recherche. */
export async function list(query: NewsletterListQuery, principal: Maybe<Principal>): Promise<Paginated<SubscriptionListItem>> {
  assertCan(principal, 'forms.read')
  const q = parseInput(newsletterListQuerySchema, query)
  const where = whereFor(q)
  const [rows, total] = await prisma.$transaction([
    prisma.newsletterSubscription.findMany({ where, ...paginationArgs(q), orderBy: { createdAt: q.order } }),
    prisma.newsletterSubscription.count({ where }),
  ])
  return toPaginated(
    rows.map((r) => ({ ...r, state: stateOf(r) })),
    total,
    q,
  )
}

/** Abonnement par identifiant (forms.read). */
export async function getById(id: string, principal: Maybe<Principal>): Promise<SubscriptionListItem> {
  assertCan(principal, 'forms.read')
  const sub = await prisma.newsletterSubscription.findUnique({ where: { id } })
  if (!sub) throw new NotFoundError('Abonnement', id)
  return { ...sub, state: stateOf(sub) }
}

/** Effectifs par état (tableau de bord). */
export async function stats(principal: Maybe<Principal>): Promise<Record<SubscriptionState, number>> {
  assertAny(principal, ['forms.read', 'reports.read'])
  const [pending, confirmed, unsubscribed] = await prisma.$transaction([
    prisma.newsletterSubscription.count({ where: { confirmedAt: null, unsubscribedAt: null } }),
    prisma.newsletterSubscription.count({ where: { confirmedAt: { not: null }, unsubscribedAt: null } }),
    prisma.newsletterSubscription.count({ where: { unsubscribedAt: { not: null } } }),
  ])
  return { pending, confirmed, unsubscribed }
}

/** Suppression définitive d'un abonnement (droit à l'effacement) - forms.read, journalisée. */
export async function remove(id: string, principal: Maybe<Principal>, ctx?: RequestContext): Promise<void> {
  const p = assertCan(principal, 'forms.read')
  const sub = await prisma.newsletterSubscription.findUnique({ where: { id }, select: { id: true } })
  if (!sub) throw new NotFoundError('Abonnement', id)
  await prisma.newsletterSubscription.delete({ where: { id } })
  await audit('content.archived', { type: 'NewsletterSubscription', id }, auditCtx(p, ctx), { after: { deleted: true } })
}

/**
 * Export CSV des consentements horodatés (forms.read ou reports.read), journalisé :
 * email, état, date d'inscription, de confirmation, de désinscription, source.
 */
export async function exportCsv(principal: Maybe<Principal>, query: NewsletterListQuery = {}, ctx?: RequestContext): Promise<string> {
  const p = assertAny(principal, ['forms.read', 'reports.read'])
  const q = parseInput(newsletterListQuerySchema, query)
  const rows = await prisma.newsletterSubscription.findMany({ where: whereFor(q), orderBy: { createdAt: 'desc' }, take: 20000 })
  await audit('export.generated', { type: 'NewsletterSubscription' }, auditCtx(p, ctx), { after: { count: rows.length, state: q.state ?? 'all' } })
  const stateLabels: Record<SubscriptionState, string> = { pending: 'En attente de confirmation', confirmed: 'Confirmé', unsubscribed: 'Désinscrit' }
  return toCsv(
    ['Email', 'État', 'Inscrit le', 'Confirmé le', 'Désinscrit le', 'Source'],
    rows.map((r) => [r.email, stateLabels[stateOf(r)], r.createdAt, r.confirmedAt, r.unsubscribedAt, r.source]),
  )
}

/** Alias explicite de `exportCsv` (BUILD_BRIEF : `newsletter.export`). */
export { exportCsv as export }
