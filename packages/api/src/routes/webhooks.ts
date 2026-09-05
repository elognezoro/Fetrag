// Webhooks PSP : POST /payments/webhooks/{provider} (et alias /webhooks/payments/{provider}).
// Corps BRUT transmis tel quel au service (la signature HMAC porte sur les octets reçus) : aucun validateur
// de corps n'est déclaré (un validateur JSON re-sérialiserait la charge utile). Sans authentification.
import type { Context } from 'hono'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { processWebhook } from '@fetrag/payments'
import type { ApiEnv } from '../env'
import { errorResponses, jsonContent } from '../lib/responses'
import { webhookRateLimit } from '../middleware/rate-limit'

const providerParams = z.object({
  provider: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Identifiant de fournisseur invalide')
    .openapi({ param: { name: 'provider', in: 'path' }, example: 'sandbox', description: 'sandbox, airtel-money, moov-money' }),
})

const webhookResultSchema = z
  .object({
    received: z.literal(true),
    webhookEventId: z.string(),
    duplicate: z.boolean().openapi({ description: 'Événement déjà journalisé (provider + externalId) : ignoré' }),
    jobId: z.string().optional(),
  })
  .openapi('WebhookResult')

function webhookRoute(path: '/payments/webhooks/{provider}' | '/webhooks/payments/{provider}', hide: boolean) {
  return createRoute({
    method: 'post',
    path,
    tags: ['Paiements'],
    summary: 'Réception d’un webhook de paiement',
    description:
      'Point d’entrée des notifications du fournisseur de paiement. Le corps brut est vérifié (signature HMAC, en-tête `X-Fetrag-Signature` ou équivalent), ' +
      'journalisé dans WebhookEvent puis traité de façon asynchrone par le job `webhook.process`. Répond 202 dès la journalisation.',
    hide,
    middleware: [webhookRateLimit],
    request: {
      params: providerParams,
      // Schéma OpenAPI brut (non Zod) : documente le corps sans installer de validateur qui consommerait le flux.
      body: {
        description: 'Charge utile propre au fournisseur (JSON), signée par le secret partagé',
        required: true,
        content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
      },
    },
    responses: {
      202: jsonContent(webhookResultSchema, 'Webhook journalisé'),
      ...errorResponses(400, 429, 500),
    },
  })
}

export const webhookRoutes = new OpenAPIHono<ApiEnv>()

async function handleWebhook(c: Context<ApiEnv>, provider: string) {
  const rawBody = await c.req.text()
  const log = c.get('logger')
  log?.info('payments.webhook.received', { provider, bytes: rawBody.length })
  const result = await processWebhook(provider, c.req.raw.headers, rawBody)
  log?.info('payments.webhook.journaled', { provider, webhookEventId: result.webhookEventId, duplicate: result.duplicate })
  c.header('Cache-Control', 'no-store')
  return c.json({ received: true as const, webhookEventId: result.webhookEventId, duplicate: result.duplicate, ...(result.jobId ? { jobId: result.jobId } : {}) }, 202)
}

webhookRoutes.openapi(webhookRoute('/payments/webhooks/{provider}', false), async (c) => {
  const { provider } = c.req.valid('param')
  return handleWebhook(c, provider)
})

webhookRoutes.openapi(webhookRoute('/webhooks/payments/{provider}', true), async (c) => {
  const { provider } = c.req.valid('param')
  return handleWebhook(c, provider)
})
