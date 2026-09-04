// Helper interne : offres tarifaires (Offer) rattachées aux services, événements et ressources premium.
// Le paiement lui-même est pris en charge par @fetrag/payments (checkout) ; le CMS ne fait que
// maintenir l'offre STANDARD cohérente avec le tarif saisi par l'éditeur.
import { prisma, type Offer, type OfferKind, type Prisma } from '@fetrag/db'

export type OfferLink = { serviceId: string } | { eventId: string } | { resourceId: string } | { courseId: string }

export const offerSelect = {
  id: true,
  kind: true,
  name: true,
  description: true,
  tier: true,
  amount: true,
  currency: true,
  validFrom: true,
  validUntil: true,
  quota: true,
  isActive: true,
} satisfies Prisma.OfferSelect

export type OfferSummary = Prisma.OfferGetPayload<{ select: typeof offerSelect }>

/** Argument `include` des offres actives d'un contenu, triées par palier puis montant. */
export function activeOffersInclude(kind: OfferKind) {
  return {
    where: { kind, isActive: true },
    orderBy: [{ tier: 'asc' as const }, { amount: 'asc' as const }],
    select: offerSelect,
  }
}

function validityWhere(now: Date): Prisma.OfferWhereInput {
  return {
    AND: [
      { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
      { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
    ],
  }
}

/** Première offre active et valide d'un contenu (palier STANDARD en priorité). */
export async function findActiveOffer(link: OfferLink, now = new Date()): Promise<Offer | null> {
  return prisma.offer.findFirst({
    where: { ...link, isActive: true, ...validityWhere(now) },
    orderBy: [{ tier: 'asc' }, { amount: 'asc' }],
  })
}

/**
 * Crée, met à jour ou désactive l'offre STANDARD d'un contenu selon le tarif saisi.
 * `active=false` (contenu gratuit ou non premium) désactive l'offre sans la supprimer
 * afin de préserver l'historique des commandes.
 */
export async function syncStandardOffer(
  kind: OfferKind,
  link: OfferLink,
  params: { name: string; amount: number | null | undefined; currency: string; active: boolean },
): Promise<Offer | null> {
  const existing = await prisma.offer.findFirst({ where: { ...link, kind, tier: 'STANDARD' }, orderBy: { createdAt: 'asc' } })
  const amount = params.amount ?? null
  const shouldBeActive = params.active && amount !== null && amount > 0
  if (shouldBeActive) {
    if (existing) {
      return prisma.offer.update({ where: { id: existing.id }, data: { name: params.name, amount, currency: params.currency, isActive: true } })
    }
    return prisma.offer.create({ data: { kind, ...link, name: params.name, tier: 'STANDARD', amount, currency: params.currency, isActive: true } })
  }
  if (existing && existing.isActive) {
    return prisma.offer.update({ where: { id: existing.id }, data: { isActive: false } })
  }
  return existing
}
