import type { PillarName } from '@fetrag/contracts'
import type { catalog } from '@fetrag/lms-core'

/** Élément du catalogue public tel que renvoyé par `catalog.listPublished`. */
export type CatalogItem = Awaited<ReturnType<typeof catalog.listPublished>>['items'][number]

/** Module du programme prêt pour une `ModuleCard`. */
export interface ProgrammeModule {
  number: string
  slug: string | null
  title: string
  items: string[]
  pillar: PillarName
  durationHours: number | null
  isFree: boolean
  priceAmount: number | null
  currency: string
  isFeatured: boolean
}

/** Slogan officiel du programme (docs/specs/programme_formation_2026.md). */
export const PROGRAMME_SLOGAN = "Ensemble, construisons l'avenir du mouvement syndical"

/**
 * Programme de formation des Leaders Syndicaux - Session 2026 (10 modules).
 * Sert de repli lorsque le catalogue LMS est vide ou indisponible : les contenus sont ceux du programme officiel.
 */
export const programmeFallback: ProgrammeModule[] = [
  {
    number: '01',
    slug: 'fondamentaux-du-syndicalisme-gabonais',
    title: 'Fondamentaux du Syndicalisme Gabonais',
    items: [
      'Historique du mouvement syndical au Gabon',
      'Cadre juridique et réglementaire (Code du travail, conventions collectives)',
      'La FETRAG : mission, valeurs et triptyque fondateur',
    ],
    pillar: 'protection',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: true,
  },
  {
    number: '02',
    slug: 'droit-du-travail-et-contentieux',
    title: 'Droit du Travail et Contentieux',
    items: [
      'Sources du droit du travail gabonais',
      'Procédures disciplinaires et licenciements',
      'Contentieux individuels et collectifs devant les juridictions compétentes',
    ],
    pillar: 'defense',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '03',
    slug: 'negociation-collective-et-dialogue-social',
    title: 'Négociation Collective et Dialogue Social',
    items: [
      'Techniques de négociation et préparation des revendications',
      'Rédaction et application des conventions collectives',
      'Médiation, conciliation et arbitrage',
    ],
    pillar: 'prevention',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '04',
    slug: 'organisation-et-gestion-syndicale',
    title: 'Organisation et Gestion Syndicale',
    items: [
      "Constitution et fonctionnement d'une section syndicale",
      'Gestion financière et transparence',
      'Communication interne et mobilisation des adhérents',
    ],
    pillar: 'protection',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '05',
    slug: 'prevention-et-gestion-des-conflits-sociaux',
    title: 'Prévention et Gestion des Conflits Sociaux',
    items: ['Diagnostic des tensions sociales', 'Stratégies de prévention des conflits du travail', 'Organisation et encadrement des mouvements de grève'],
    pillar: 'prevention',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '06',
    slug: 'defense-des-interets-materiels-et-moraux',
    title: 'Défense des Intérêts Matériels et Moraux',
    items: [
      'Analyse des conditions de travail et rémunération',
      "Protection de l'emploi et sécurité professionnelle",
      'Lutte contre les discriminations et harcèlements',
    ],
    pillar: 'defense',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '07',
    slug: 'protection-de-l-outil-de-production',
    title: "Protection de l'Outil de Production",
    items: [
      "Compréhension des enjeux économiques de l'entreprise",
      "Négociation de sauvegarde de l'emploi",
      'Accompagnement aux restructurations et plans sociaux',
    ],
    pillar: 'protection',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '08',
    slug: 'leadership-syndical-et-ethique',
    title: 'Leadership Syndical et Éthique',
    items: ['Rôle et posture du leader syndical', "Gestion des conflits internes et cohésion d'équipe", 'Intégrité, déontologie et responsabilité'],
    pillar: 'protection',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '09',
    slug: 'communication-et-plaidoyer',
    title: 'Communication et Plaidoyer',
    items: [
      'Techniques de prise de parole en public',
      'Médias et communication numérique syndicale',
      'Plaidoyer auprès des institutions et partenaires sociaux',
    ],
    pillar: 'prevention',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
  {
    number: '10',
    slug: 'sante-securite-et-conditions-de-travail-ssct',
    title: 'Santé, Sécurité et Conditions de Travail (SSCT)',
    items: [
      'Cadre réglementaire de la prévention des risques professionnels',
      'Rôle des délégués du personnel et CHSCT',
      'Accident du travail et maladies professionnelles',
    ],
    pillar: 'defense',
    durationHours: 12,
    isFree: true,
    priceAmount: null,
    currency: 'XAF',
    isFeatured: false,
  },
]

/** Numéro de module (« 01 ») déduit du code (« M01 ») ou de la position dans la liste. */
export function moduleNumber(code: string | null | undefined, index: number): string {
  const match = code?.match(/(\d{1,2})\s*$/)
  const n = match?.[1] ? Number.parseInt(match[1], 10) : index + 1
  return String(n).padStart(2, '0')
}

/** Pilier par défaut d'un module sans pilier explicite (alternance bleu, vert, or). */
export function fallbackPillar(index: number): PillarName {
  const cycle: PillarName[] = ['protection', 'prevention', 'defense']
  return cycle[index % cycle.length] ?? 'protection'
}

/** Convertit un cours du catalogue LMS en module du programme (première objectifs comme contenus). */
export function toProgrammeModule(course: CatalogItem, index: number): ProgrammeModule {
  const fallback = programmeFallback.find((m) => m.slug === course.slug)
  const items = course.objectives.length > 0 ? course.objectives.slice(0, 3) : (fallback?.items ?? [])
  return {
    number: moduleNumber(course.code, index),
    slug: course.slug,
    title: course.title,
    items,
    pillar: course.pillar ?? fallback?.pillar ?? fallbackPillar(index),
    durationHours: course.durationHours,
    isFree: course.isFree,
    priceAmount: course.priceAmount,
    currency: course.currency,
    isFeatured: course.isFeatured,
  }
}

/** Durée lisible (« 12 h »). */
export function formatHours(hours: number | null | undefined): string | undefined {
  if (!hours || hours <= 0) return undefined
  return `${hours} h`
}
