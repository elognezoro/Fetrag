// Formulaires publics : POST /forms/{kind} (contact, support, membership, partnership) et POST /newsletter.
// Validation Zod des contrats partagés, pot de miel `website`, limitation stricte de débit.
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { contactFormSchema, formKindLabels, membershipFormSchema, newsletterSchema, partnershipFormSchema } from '@fetrag/contracts'
import { forms, newsletter } from '@fetrag/cms'
import type { ApiEnv } from '../env'
import { errorResponses, jsonContent } from '../lib/responses'
import { requestMeta } from '../lib/request'
import { strictRateLimit } from '../middleware/rate-limit'

const publicFormKinds = ['contact', 'support', 'membership', 'partnership'] as const
type PublicFormKind = (typeof publicFormKinds)[number]

const kindToFormKind = {
  contact: 'CONTACT',
  support: 'SUPPORT',
  membership: 'MEMBERSHIP',
  partnership: 'PARTNERSHIP',
} as const

const formParams = z.object({
  kind: z.enum(publicFormKinds).openapi({ param: { name: 'kind', in: 'path' }, example: 'contact' }),
})

/** Union documentée des charges utiles (le schéma exact est choisi selon `kind`). */
const formBodySchema = z
  .union([
    contactFormSchema.openapi('ContactForm'),
    membershipFormSchema.openapi('MembershipForm'),
    partnershipFormSchema.openapi('PartnershipForm'),
  ])
  .openapi('FormPayload', {
    description:
      'Champs communs : fullName, email, phone?, subject?, message, organization?, consent (true), website (pot de miel, vide). ' +
      'Adhésion : sector?, employer?, jobTitle?, interest. Partenariat : organization (requis), partnershipType.',
  })

const formResultSchema = z
  .object({
    reference: z.string().openapi({ example: 'MSG-2026-7K2P9Q' }),
    kind: z.enum(['CONTACT', 'SUPPORT', 'SERVICE', 'MEMBERSHIP', 'PARTNERSHIP']),
    label: z.string(),
    message: z.string(),
  })
  .openapi('FormResult')

const submitRoute = createRoute({
  method: 'post',
  path: '/forms/{kind}',
  tags: ['Formulaires'],
  summary: 'Envoyer un formulaire (contact, assistance, adhésion, partenariat)',
  description:
    'Enregistre la soumission, accuse réception par email et notifie l’équipe concernée. ' +
    'Le champ `website` doit rester vide (protection anti-robot). Limité à 10 envois par minute et par adresse IP.',
  middleware: [strictRateLimit],
  request: {
    params: formParams,
    body: { content: { 'application/json': { schema: formBodySchema } }, required: true },
  },
  responses: {
    201: jsonContent(formResultSchema, 'Soumission enregistrée'),
    ...errorResponses(400, 429, 500),
  },
})

const newsletterResultSchema = z
  .object({
    state: z.enum(['pending', 'confirmed', 'unsubscribed', 'already_confirmed']),
    email: z.string(),
    confirmationSent: z.boolean(),
    message: z.string(),
  })
  .openapi('NewsletterResult')

const newsletterRoute = createRoute({
  method: 'post',
  path: '/newsletter',
  tags: ['Formulaires'],
  summary: 'S’abonner à la lettre d’information de la FETRAG',
  description: 'Double opt-in : un email de confirmation est envoyé. `consent` doit valoir true ; `website` (pot de miel) doit rester vide.',
  middleware: [strictRateLimit],
  request: { body: { content: { 'application/json': { schema: newsletterSchema.openapi('NewsletterInput') } }, required: true } },
  responses: {
    202: jsonContent(newsletterResultSchema, 'Demande d’abonnement prise en compte'),
    ...errorResponses(400, 412, 429, 500),
  },
})

export const formRoutes = new OpenAPIHono<ApiEnv>()

function schemaFor(kind: PublicFormKind) {
  switch (kind) {
    case 'membership':
      return membershipFormSchema
    case 'partnership':
      return partnershipFormSchema
    default:
      return contactFormSchema
  }
}

formRoutes.openapi(submitRoute, async (c) => {
  const { kind } = c.req.valid('param')
  const formKind = kindToFormKind[kind]
  // Validation ciblée selon le type (le validateur d'union ne distingue pas les variantes par `kind`).
  const raw = (await c.req.json()) as Record<string, unknown>
  const input = schemaFor(kind).parse({ ...raw, kind: formKind })
  const meta = requestMeta(c)
  const result = await forms.submit(formKind, input, { ...meta, userId: c.get('principal')?.id ?? null })
  c.header('Cache-Control', 'no-store')
  return c.json(
    {
      reference: result.reference,
      kind: result.kind,
      label: formKindLabels[result.kind],
      message: 'Votre message a bien été transmis à la FETRAG. Un accusé de réception vous a été envoyé par email.',
    },
    201,
  )
})

formRoutes.openapi(newsletterRoute, async (c) => {
  const input = c.req.valid('json')
  const meta = requestMeta(c)
  const result = await newsletter.subscribe(input, { ...meta, source: 'api', userId: c.get('principal')?.id ?? null })
  const message =
    result.state === 'already_confirmed'
      ? 'Cette adresse est déjà abonnée à la lettre d’information.'
      : result.confirmationSent
        ? 'Un email de confirmation vient de vous être envoyé.'
        : 'Votre demande a été prise en compte.'
  c.header('Cache-Control', 'no-store')
  return c.json({ state: result.state, email: result.email, confirmationSent: result.confirmationSent, message }, 202)
})
