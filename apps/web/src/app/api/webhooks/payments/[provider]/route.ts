import { NextResponse, type NextRequest } from 'next/server'
import { isDomainError } from '@fetrag/domain'
import { logger } from '@fetrag/observability'
import { isPaymentProviderId, processWebhook } from '@fetrag/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 256 * 1024

interface RouteContext {
  params: Promise<{ provider: string }>
}

/**
 * Webhook des fournisseurs de paiement : le corps brut est lu tel quel (la signature HMAC porte sur les octets reçus),
 * puis `processWebhook` vérifie la signature, journalise `WebhookEvent` (doublons ignorés) et met en file `webhook.process`.
 * Toujours répondre rapidement : le traitement métier est asynchrone.
 */
export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { provider } = await context.params
  if (!isPaymentProviderId(provider)) {
    return NextResponse.json({ ok: false, error: 'unknown_provider' }, { status: 404 })
  }

  const rawBody = await request.text()
  if (rawBody.length === 0) return NextResponse.json({ ok: false, error: 'empty_body' }, { status: 400 })
  if (rawBody.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })

  try {
    const result = await processWebhook(provider, request.headers, rawBody)
    logger.info('webhook.received', { provider, webhookEventId: result.webhookEventId, duplicate: result.duplicate })
    return NextResponse.json(
      { ok: true, received: true, duplicate: result.duplicate, eventId: result.webhookEventId },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    if (isDomainError(error)) {
      logger.warn('webhook.rejected', { provider, code: error.code, message: error.message })
      return NextResponse.json({ ok: false, error: error.code.toLowerCase() }, { status: error.status, headers: { 'Cache-Control': 'no-store' } })
    }
    logger.error('webhook.failed', { provider, error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ ok: false, error: 'processing_failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

/** Les fournisseurs vérifient parfois la disponibilité de l'URL par un GET. */
export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { provider } = await context.params
  if (!isPaymentProviderId(provider)) return NextResponse.json({ ok: false, error: 'unknown_provider' }, { status: 404 })
  return NextResponse.json({ ok: true, provider, method: 'POST' }, { headers: { 'Cache-Control': 'no-store' } })
}
