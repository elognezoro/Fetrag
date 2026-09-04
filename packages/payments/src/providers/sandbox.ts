import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { getEnvSafe, resolvePublicUrl } from '@fetrag/config'
import { paymentWebhookSchema } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { ForbiddenError, randomCode, ValidationError } from '@fetrag/domain'
import {
  headerValue,
  type CreatePaymentContext,
  type CreatePaymentResult,
  type HeadersLike,
  type ParsedWebhook,
  type PaymentProvider,
  type PaymentStatusResult,
  type ReconcileItem,
  type RefundResult,
} from '../provider'

/** En-tête portant la signature HMAC-SHA256 (hexadécimal) du corps brut. */
export const SANDBOX_SIGNATURE_HEADER = 'x-fetrag-signature'

/** Au-delà de ce délai, un paiement sandbox jamais simulé est considéré abandonné. */
const SANDBOX_EXPIRY_MS = 24 * 3600_000

function webhookSecret(): string {
  return getEnvSafe().PAYMENT_WEBHOOK_SECRET ?? 'change-me'
}

/** Signature HMAC-SHA256 d'un corps de webhook (utilisée par `simulate` et les tests). */
export function signSandboxPayload(rawBody: string, secret: string = webhookSecret()): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/**
 * Fournisseur de démonstration (ADR-003) : aucun appel externe.
 * Le parcours client est une page `/paiement/<orderId>/sandbox` de la vitrine qui déclenche
 * `sandbox.simulate(paymentId, 'success' | 'failure')`, lequel génère un webhook signé.
 */
export class SandboxProvider implements PaymentProvider {
  readonly id = 'sandbox' as const

  async createPayment(ctx: CreatePaymentContext): Promise<CreatePaymentResult> {
    const providerRef = `SBX-${randomCode(10)}`
    const url = `${resolvePublicUrl('web')}/paiement/${ctx.orderId}/sandbox?paymentId=${encodeURIComponent(ctx.paymentId)}`
    return {
      providerRef,
      status: 'PENDING',
      nextAction: { type: 'redirect', url, message: 'Paiement de démonstration : choisissez l’issue sur la page suivante.' },
      raw: { sandbox: true, amount: ctx.amount, currency: ctx.currency, method: ctx.method },
    }
  }

  async getStatus(providerRef: string): Promise<PaymentStatusResult> {
    const payment = await prisma.payment.findFirst({
      where: { provider: this.id, providerRef },
      select: { status: true, amount: true, createdAt: true },
    })
    if (!payment) return { providerRef, status: 'FAILED', raw: { reason: 'unknown_reference' } }
    const abandoned = payment.status === 'PENDING' && Date.now() - payment.createdAt.getTime() > SANDBOX_EXPIRY_MS
    return { providerRef, status: abandoned ? 'FAILED' : payment.status, amount: payment.amount, raw: { abandoned } }
  }

  async refund(providerRef: string, amount: number): Promise<RefundResult> {
    return { providerRef: `SBXR-${randomCode(10)}`, status: 'PROCESSED', raw: { sandbox: true, original: providerRef, amount } }
  }

  async handleWebhook(headers: HeadersLike, rawBody: string): Promise<ParsedWebhook> {
    const signature = headerValue(headers, SANDBOX_SIGNATURE_HEADER)
    if (!signature) throw new ForbiddenError('Signature de webhook absente')
    if (!safeEqual(signature, signSandboxPayload(rawBody))) throw new ForbiddenError('Signature de webhook invalide')

    let json: unknown
    try {
      json = JSON.parse(rawBody)
    } catch {
      throw new ValidationError('Corps de webhook illisible (JSON attendu)')
    }
    const parsed = paymentWebhookSchema.safeParse(json)
    if (!parsed.success) {
      throw new ValidationError('Webhook sandbox invalide', { issues: parsed.error.issues.map((i) => i.message) })
    }
    if (parsed.data.provider !== this.id) {
      throw new ValidationError('Fournisseur de webhook inattendu', { provider: parsed.data.provider })
    }
    return parsed.data
  }

  async reconcile(): Promise<ReconcileItem[]> {
    const threshold = new Date(Date.now() - SANDBOX_EXPIRY_MS)
    const abandoned = await prisma.payment.findMany({
      where: { provider: this.id, status: 'PENDING', createdAt: { lt: threshold }, providerRef: { not: null } },
      select: { providerRef: true },
      take: 100,
    })
    return abandoned.flatMap((p) => (p.providerRef ? [{ providerRef: p.providerRef, status: 'FAILED' as const }] : []))
  }

  /** Construit un webhook signé pour un paiement (succès ou échec). */
  buildWebhook(input: { paymentRef: string; amount: number; currency: string; outcome: 'success' | 'failure' }): {
    body: string
    headers: Record<string, string>
    externalId: string
  } {
    const externalId = `evt_${randomUUID()}`
    const payload: ParsedWebhook = {
      provider: this.id,
      eventType: input.outcome === 'success' ? 'payment.succeeded' : 'payment.failed',
      externalId,
      paymentRef: input.paymentRef,
      status: input.outcome === 'success' ? 'SUCCEEDED' : 'FAILED',
      amount: input.amount,
      currency: input.currency,
      raw: { simulated: true, at: new Date().toISOString(), reason: input.outcome === 'failure' ? 'Refus simulé' : undefined },
    }
    const body = JSON.stringify(payload)
    return {
      body,
      externalId,
      headers: { [SANDBOX_SIGNATURE_HEADER]: signSandboxPayload(body), 'content-type': 'application/json' },
    }
  }
}
