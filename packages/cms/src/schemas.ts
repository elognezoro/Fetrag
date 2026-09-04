// Schémas Zod d'entrée du CMS (validation au bord : Server Actions, routes API).
// Les enums et primitives partagés viennent de @fetrag/contracts ; rien n'est dupliqué.
import { z } from 'zod'
import {
  accessLevelSchema,
  eventKinds,
  formKindSchema,
  idSchema,
  localeSchema,
  moneySchema,
  paginationQuerySchema,
  resourceKinds,
  serviceRequestFormSchema,
  serviceRequestStatuses,
  sessionModeSchema,
  slugSchema,
} from '@fetrag/contracts'

// -----------------------------------------------------------------------------
// Primitives locales
// -----------------------------------------------------------------------------

/** URL absolue http(s) ou chemin relatif commençant par « / ». */
export const urlOrPathSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => /^https?:\/\/\S+$/i.test(v) || /^\/(?!\/)/.test(v), 'URL invalide (http(s) ou chemin relatif)')

export const absoluteUrlSchema = z.string().trim().url().max(2048)
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur hexadécimale attendue (#RRGGBB)')
export const iconNameSchema = z.string().trim().max(40).regex(/^[a-z0-9-]+$/i, 'Nom d’icône lucide invalide')

export const partnerKinds = ['AFFILIATE', 'PARTNER', 'INSTITUTION', 'INTERNATIONAL'] as const
export const partnerKindSchema = z.enum(partnerKinds)
export const partnerKindLabels: Record<(typeof partnerKinds)[number], string> = {
  AFFILIATE: 'Organisation affiliée',
  PARTNER: 'Partenaire',
  INSTITUTION: 'Institution',
  INTERNATIONAL: 'Partenaire international',
}

export const menuLocations = ['HEADER', 'FOOTER', 'FOOTER_SECONDARY', 'LMS_HEADER'] as const
export const menuLocationSchema = z.enum(menuLocations)

export const mediaVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE'])
export const eventKindSchema = z.enum(eventKinds)
export const resourceKindSchema = z.enum(resourceKinds)
export const serviceRequestStatusSchema = z.enum(serviceRequestStatuses)
export const formSubmissionStatuses = ['NEW', 'ASSIGNED', 'ANSWERED', 'CLOSED', 'SPAM'] as const
export const formSubmissionStatusSchema = z.enum(formSubmissionStatuses)
export const formSubmissionStatusLabels: Record<(typeof formSubmissionStatuses)[number], string> = {
  NEW: 'Nouveau',
  ASSIGNED: 'Attribué',
  ANSWERED: 'Répondu',
  CLOSED: 'Clôturé',
  SPAM: 'Indésirable',
}
export const eventRegistrationStatuses = ['REGISTERED', 'WAITLISTED', 'CANCELLED', 'ATTENDED'] as const
export const eventRegistrationStatusSchema = z.enum(eventRegistrationStatuses)

export const publishableEntityTypes = ['page', 'article', 'service', 'resource', 'event', 'course'] as const
export const publishableEntitySchema = z.enum(publishableEntityTypes)
export type PublishableEntityType = z.infer<typeof publishableEntitySchema>

export const seoEntityKinds = ['page', 'article', 'service', 'course', 'event'] as const
export const seoEntityKindSchema = z.enum(seoEntityKinds)
export type SeoEntityKind = z.infer<typeof seoEntityKindSchema>

// -----------------------------------------------------------------------------
// SEO
// -----------------------------------------------------------------------------

export const seoInputSchema = z.object({
  title: z.string().trim().max(70).nullable().optional(),
  description: z.string().trim().max(200).nullable().optional(),
  canonical: absoluteUrlSchema.nullable().optional(),
  ogImageUrl: urlOrPathSchema.nullable().optional(),
  noIndex: z.boolean().optional(),
  structuredData: z.record(z.unknown()).nullable().optional(),
})
export type SeoInput = z.infer<typeof seoInputSchema>

// -----------------------------------------------------------------------------
// Blocs de page (schéma souple : type + props, propriétés inconnues conservées)
// -----------------------------------------------------------------------------

export const pageBlockTypes = ['hero', 'richtext', 'timeline', 'values', 'people', 'cta', 'faq', 'stats', 'triptych'] as const
export type PageBlockType = (typeof pageBlockTypes)[number]

const blockBase = {
  id: z.string().max(64).optional(),
  anchor: z.string().max(64).optional(),
  title: z.string().max(200).optional(),
}
const blockLinkSchema = z.object({ label: z.string().trim().min(1).max(80), href: urlOrPathSchema })
const toneSchema = z.enum(['blue', 'green', 'gold', 'navy']).optional()

export const pageBlockSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('hero'),
      ...blockBase,
      eyebrow: z.string().max(80).optional(),
      subtitle: z.string().max(600).optional(),
      imageUrl: urlOrPathSchema.optional(),
      imageAlt: z.string().max(200).optional(),
      primaryCta: blockLinkSchema.optional(),
      secondaryCta: blockLinkSchema.optional(),
      tone: toneSchema,
    })
    .passthrough(),
  z.object({ type: z.literal('richtext'), ...blockBase, html: z.string().max(200000).default('') }).passthrough(),
  z
    .object({
      type: z.literal('timeline'),
      ...blockBase,
      items: z
        .array(z.object({ date: z.string().max(40), title: z.string().max(200), description: z.string().max(1000).optional() }))
        .max(40)
        .default([]),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('values'),
      ...blockBase,
      items: z
        .array(
          z.object({
            title: z.string().max(120),
            description: z.string().max(600).optional(),
            icon: iconNameSchema.optional(),
            tone: toneSchema,
          }),
        )
        .max(12)
        .default([]),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('people'),
      ...blockBase,
      items: z
        .array(
          z.object({
            name: z.string().max(120),
            role: z.string().max(160).optional(),
            imageUrl: urlOrPathSchema.optional(),
            bio: z.string().max(4000).optional(),
          }),
        )
        .max(40)
        .default([]),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('cta'),
      ...blockBase,
      description: z.string().max(600).optional(),
      primaryCta: blockLinkSchema.optional(),
      secondaryCta: blockLinkSchema.optional(),
      tone: toneSchema,
    })
    .passthrough(),
  z
    .object({
      type: z.literal('faq'),
      ...blockBase,
      group: z.string().max(60).optional(),
      items: z.array(z.object({ question: z.string().max(300), answer: z.string().max(4000) })).max(30).optional(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('stats'),
      ...blockBase,
      items: z
        .array(
          z.object({
            value: z.union([z.number(), z.string().max(20)]),
            label: z.string().max(120),
            prefix: z.string().max(10).optional(),
            suffix: z.string().max(10).optional(),
            tone: toneSchema,
          }),
        )
        .max(8)
        .default([]),
    })
    .passthrough(),
  z
    .object({
      type: z.literal('triptych'),
      ...blockBase,
      items: z.array(z.object({ title: z.string().max(120), description: z.string().max(600).optional() })).max(3).optional(),
    })
    .passthrough(),
])
export type PageBlock = z.infer<typeof pageBlockSchema>

export const pageBlocksSchema = z.array(pageBlockSchema).max(60)
export type PageBlocks = z.infer<typeof pageBlocksSchema>

// -----------------------------------------------------------------------------
// Pages
// -----------------------------------------------------------------------------

export const pageInputSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().max(400000).default(''),
  blocks: pageBlocksSchema.nullable().optional(),
  template: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Nom de gabarit invalide')
    .default('default'),
  locale: localeSchema.default('fr'),
  coverImageUrl: urlOrPathSchema.nullable().optional(),
  showInSitemap: z.boolean().default(true),
  scheduledAt: z.coerce.date().nullable().optional(),
  seo: seoInputSchema.optional(),
})
export type PageInput = z.input<typeof pageInputSchema>
export const pageUpdateSchema = pageInputSchema.partial()
export type PageUpdateInput = z.input<typeof pageUpdateSchema>

// -----------------------------------------------------------------------------
// Actualités
// -----------------------------------------------------------------------------

export const articleInputSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().max(400000).default(''),
  coverImageUrl: urlOrPathSchema.nullable().optional(),
  coverAlt: z.string().trim().max(200).nullable().optional(),
  categoryId: idSchema.nullable().optional(),
  isCommunique: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  locale: localeSchema.default('fr'),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  scheduledAt: z.coerce.date().nullable().optional(),
  seo: seoInputSchema.optional(),
})
export type ArticleInput = z.input<typeof articleInputSchema>
export const articleUpdateSchema = articleInputSchema.partial()
export type ArticleUpdateInput = z.input<typeof articleUpdateSchema>

export const articleListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  categoryId: idSchema.optional(),
  isCommunique: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  tag: z.string().trim().max(40).optional(),
})
export type ArticleListQuery = z.input<typeof articleListQuerySchema>

export const publicArticleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  categorySlug: slugSchema.optional(),
  tag: z.string().trim().max(40).optional(),
  q: z.string().trim().max(200).optional(),
  communique: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
})
export type PublicArticleQuery = z.input<typeof publicArticleQuerySchema>

// -----------------------------------------------------------------------------
// Catégories, partenaires, FAQ
// -----------------------------------------------------------------------------

export const categoryKinds = ['article', 'resource', 'course', 'service', 'event'] as const
export const categoryKindSchema = z.enum(categoryKinds)

export const categoryInputSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  color: hexColorSchema.nullable().optional(),
  kind: categoryKindSchema.default('article'),
  position: z.number().int().min(0).max(10000).default(0),
})
export type CategoryInput = z.input<typeof categoryInputSchema>
export const categoryUpdateSchema = categoryInputSchema.partial()

export const categoryListQuerySchema = paginationQuerySchema.extend({ kind: categoryKindSchema.optional() })

export const partnerInputSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(2).max(160),
  acronym: z.string().trim().max(30).nullable().optional(),
  kind: partnerKindSchema.default('PARTNER'),
  sector: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  logoUrl: urlOrPathSchema.nullable().optional(),
  website: absoluteUrlSchema.nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().length(2).toUpperCase().default('GA'),
  position: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
})
export type PartnerInput = z.input<typeof partnerInputSchema>
export const partnerUpdateSchema = partnerInputSchema.partial()

export const partnerListQuerySchema = paginationQuerySchema.extend({
  kind: partnerKindSchema.optional(),
  isActive: z.coerce.boolean().optional(),
})

export const faqInputSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().min(2).max(20000),
  group: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Groupe invalide (minuscules, chiffres, tirets)')
    .default('general'),
  position: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
})
export type FaqInput = z.input<typeof faqInputSchema>
export const faqUpdateSchema = faqInputSchema.partial()

export const faqListQuerySchema = paginationQuerySchema.extend({
  group: z.string().trim().max(60).optional(),
  isActive: z.coerce.boolean().optional(),
})

// -----------------------------------------------------------------------------
// Services et demandes de service
// -----------------------------------------------------------------------------

export const serviceFormFieldTypes = ['text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'file'] as const

export const serviceFormFieldSchema = z.object({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/, 'Nom de champ invalide'),
  label: z.string().trim().min(1).max(120),
  type: z.enum(serviceFormFieldTypes),
  required: z.boolean().default(false),
  placeholder: z.string().max(160).optional(),
  help: z.string().max(300).optional(),
  options: z.array(z.string().max(120)).max(50).optional(),
})
export type ServiceFormField = z.infer<typeof serviceFormFieldSchema>
export const serviceFormSchema = z.array(serviceFormFieldSchema).max(30)

const serviceBaseSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(2).max(160),
  summary: z.string().trim().max(500).nullable().optional(),
  description: z.string().max(200000).default(''),
  conditions: z.string().max(50000).nullable().optional(),
  icon: iconNameSchema.nullable().optional(),
  categoryId: idSchema.nullable().optional(),
  isPaid: z.boolean().default(false),
  priceAmount: moneySchema.nullable().optional(),
  currency: z.string().length(3).toUpperCase().default('XAF'),
  requiresAccount: z.boolean().default(true),
  formSchema: serviceFormSchema.nullable().optional(),
  slaDays: z.number().int().min(0).max(365).nullable().optional(),
  position: z.number().int().min(0).max(10000).default(0),
  seo: seoInputSchema.optional(),
})

export const serviceInputSchema = serviceBaseSchema.refine(
  (v) => !v.isPaid || (typeof v.priceAmount === 'number' && v.priceAmount > 0),
  { path: ['priceAmount'], message: 'Un service payant doit avoir un tarif strictement positif' },
)
export type ServiceInput = z.input<typeof serviceInputSchema>
export const serviceUpdateSchema = serviceBaseSchema.partial()
export type ServiceUpdateInput = z.input<typeof serviceUpdateSchema>

/** Entrée d'une demande de service (le serviceId est passé séparément). */
export const serviceRequestInputSchema = serviceRequestFormSchema.omit({ serviceId: true })
export type ServiceRequestInput = z.input<typeof serviceRequestInputSchema>

export const serviceRequestUpdateSchema = z.object({
  internalNote: z.string().trim().max(5000).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  organization: z.string().trim().max(160).nullable().optional(),
  payload: z.record(z.unknown()).nullable().optional(),
})

export const serviceRequestListQuerySchema = paginationQuerySchema.extend({
  status: serviceRequestStatusSchema.optional(),
  serviceId: idSchema.optional(),
  assigneeId: idSchema.optional(),
  mine: z.coerce.boolean().optional(),
})
export type ServiceRequestListQuery = z.input<typeof serviceRequestListQuerySchema>

// -----------------------------------------------------------------------------
// Ressources documentaires
// -----------------------------------------------------------------------------

export const resourceInputSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  kind: resourceKindSchema.default('DOCUMENT'),
  categoryId: idSchema.nullable().optional(),
  organizationId: idSchema.nullable().optional(),
  accessLevel: accessLevelSchema.default('PUBLIC'),
  fileUrl: z.string().trim().max(2048).nullable().optional(),
  fileName: z.string().trim().max(255).nullable().optional(),
  fileSize: z.number().int().min(0).nullable().optional(),
  mimeType: z.string().trim().max(120).nullable().optional(),
  previewUrl: urlOrPathSchema.nullable().optional(),
  externalUrl: absoluteUrlSchema.nullable().optional(),
  language: localeSchema.default('fr'),
  source: z.string().trim().max(200).nullable().optional(),
  authorName: z.string().trim().max(160).nullable().optional(),
  publishedOn: z.coerce.date().nullable().optional(),
  keywords: z.array(z.string().trim().max(40)).max(20).default([]),
  /** Tarif d'une ressource PREMIUM : crée ou met à jour l'offre (kind RESOURCE) associée. */
  priceAmount: moneySchema.nullable().optional(),
  currency: z.string().length(3).toUpperCase().default('XAF'),
})
export type ResourceInput = z.input<typeof resourceInputSchema>
export const resourceUpdateSchema = resourceInputSchema.partial()
export type ResourceUpdateInput = z.input<typeof resourceUpdateSchema>

export const resourceListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  kind: resourceKindSchema.optional(),
  accessLevel: accessLevelSchema.optional(),
  categoryId: idSchema.optional(),
  organizationId: idSchema.optional(),
})
export type ResourceListQuery = z.input<typeof resourceListQuerySchema>

export const publicResourceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(200).optional(),
  kind: resourceKindSchema.optional(),
  categorySlug: slugSchema.optional(),
  accessLevel: accessLevelSchema.optional(),
  organizationId: idSchema.optional(),
})
export type PublicResourceQuery = z.input<typeof publicResourceQuerySchema>

// -----------------------------------------------------------------------------
// Médias
// -----------------------------------------------------------------------------

export const mediaFolderSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9/_-]*$/, 'Dossier invalide')
  .default('uploads')

export const mediaRegisterSchema = z.object({
  key: z.string().trim().min(1).max(500),
  url: z.string().trim().min(1).max(2048),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(120),
  size: z.number().int().min(0),
  width: z.number().int().min(0).nullable().optional(),
  height: z.number().int().min(0).nullable().optional(),
  alt: z.string().trim().max(300).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  visibility: mediaVisibilitySchema.default('PUBLIC'),
  folder: mediaFolderSchema,
})
export type MediaRegisterInput = z.input<typeof mediaRegisterSchema>

export const mediaUpdateSchema = z.object({
  alt: z.string().trim().max(300).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  folder: mediaFolderSchema.optional(),
})

export const mediaUploadOptionsSchema = z.object({
  folder: mediaFolderSchema,
  visibility: mediaVisibilitySchema.default('PUBLIC'),
  alt: z.string().trim().max(300).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  maxMb: z.number().int().min(1).max(200).optional(),
})
export type MediaUploadOptions = z.input<typeof mediaUploadOptionsSchema>

export const mediaListQuerySchema = paginationQuerySchema.extend({
  folder: z.string().trim().max(80).optional(),
  visibility: mediaVisibilitySchema.optional(),
  /** Préfixe MIME (« image/ », « application/pdf »). */
  mimeType: z.string().trim().max(120).optional(),
})
export type MediaListQuery = z.input<typeof mediaListQuerySchema>

// -----------------------------------------------------------------------------
// Menus
// -----------------------------------------------------------------------------

export interface MenuItemInput {
  label: string
  href: string
  icon?: string | null
  isExternal?: boolean
  children?: MenuItemInput[]
}

export const menuItemInputSchema: z.ZodType<MenuItemInput> = z.lazy(() =>
  z.object({
    label: z.string().trim().min(1).max(80),
    href: urlOrPathSchema,
    icon: iconNameSchema.nullable().optional(),
    isExternal: z.boolean().optional(),
    children: z.array(menuItemInputSchema).max(30).optional(),
  }),
)

export const menuInputSchema = z.object({
  location: menuLocationSchema,
  name: z.string().trim().max(80).optional(),
  items: z.array(menuItemInputSchema).max(40),
})
export type MenuInput = z.input<typeof menuInputSchema>

// -----------------------------------------------------------------------------
// Formulaires publics et newsletter
// -----------------------------------------------------------------------------

export const formListQuerySchema = paginationQuerySchema.extend({
  kind: formKindSchema.optional(),
  status: formSubmissionStatusSchema.optional(),
  assignedTo: idSchema.optional(),
})
export type FormListQuery = z.input<typeof formListQuerySchema>

export const formUpdateSchema = z.object({
  status: formSubmissionStatusSchema.optional(),
  assignedTo: idSchema.nullable().optional(),
})

export const newsletterListQuerySchema = paginationQuerySchema.extend({
  state: z.enum(['pending', 'confirmed', 'unsubscribed']).optional(),
})

// -----------------------------------------------------------------------------
// Événements
// -----------------------------------------------------------------------------

const eventBaseSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(600).nullable().optional(),
  description: z.string().max(200000).default(''),
  kind: eventKindSchema.default('EVENT'),
  categoryId: idSchema.nullable().optional(),
  coverImageUrl: urlOrPathSchema.nullable().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  mode: sessionModeSchema.default('IN_PERSON'),
  meetingUrl: absoluteUrlSchema.nullable().optional(),
  replayUrl: absoluteUrlSchema.nullable().optional(),
  speakerName: z.string().trim().max(120).nullable().optional(),
  speakerTitle: z.string().trim().max(160).nullable().optional(),
  speakerBio: z.string().max(20000).nullable().optional(),
  speakerImageUrl: urlOrPathSchema.nullable().optional(),
  capacity: z.number().int().min(1).max(100000).nullable().optional(),
  isFree: z.boolean().default(true),
  priceAmount: moneySchema.nullable().optional(),
  currency: z.string().length(3).toUpperCase().default('XAF'),
  issuesCertificate: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seo: seoInputSchema.optional(),
})

export const eventInputSchema = eventBaseSchema
  .refine((v) => !v.endsAt || v.endsAt.getTime() >= v.startsAt.getTime(), {
    path: ['endsAt'],
    message: 'La date de fin doit être postérieure à la date de début',
  })
  .refine((v) => v.isFree || (typeof v.priceAmount === 'number' && v.priceAmount > 0), {
    path: ['priceAmount'],
    message: 'Un événement payant doit avoir un tarif strictement positif',
  })
export type EventInput = z.input<typeof eventInputSchema>
export const eventUpdateSchema = eventBaseSchema.partial()
export type EventUpdateInput = z.input<typeof eventUpdateSchema>

export const eventListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  kind: eventKindSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
export type EventListQuery = z.input<typeof eventListQuerySchema>

export const waitingListInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
  fullName: z.string().trim().min(2).max(120),
})
export type WaitingListInput = z.input<typeof waitingListInputSchema>

// -----------------------------------------------------------------------------
// Révisions
// -----------------------------------------------------------------------------

export const revisionListQuerySchema = paginationQuerySchema.extend({ pageId: idSchema })
