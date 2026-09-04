import type { PaymentMethod, PaymentStatus } from '@fetrag/db'
import type { paymentWebhookSchema, z } from '@fetrag/contracts'

/** Identifiants de fournisseurs connus (`PAYMENT_PROVIDER`). */
export type PaymentProviderId = 'sandbox' | 'airtel-money' | 'moov-money'

/** Webhook normalisé après vérification de signature (schéma partagé `paymentWebhookSchema`). */
export type ParsedWebhook = z.infer<typeof paymentWebhookSchema>

/** Suite à donner côté client après la création d'un paiement. */
export interface NextAction {
  type: 'redirect' | 'instructions' | 'none'
  url?: string
  message?: string
}

export interface CreatePaymentContext {
  paymentId: string
  orderId: string
  orderReference: string
  /** Montant entier en XAF. */
  amount: number
  currency: string
  method: PaymentMethod
  phoneNumber?: string | null
  customer: { id: string; email: string; name: string | null }
  description: string
  /** URL de retour après le parcours du fournisseur. */
  returnUrl: string
  /** Clé d'idempotence transmise au fournisseur (obligatoire, chapitre 17). */
  idempotencyKey: string
}

export interface CreatePaymentResult {
  providerRef: string
  status: PaymentStatus
  nextAction: NextAction
  raw?: Record<string, unknown>
}

export interface PaymentStatusResult {
  providerRef: string
  status: PaymentStatus
  amount?: number
  raw?: Record<string, unknown>
}

export interface RefundResult {
  providerRef: string
  status: 'PROCESSED' | 'REQUESTED' | 'REJECTED'
  raw?: Record<string, unknown>
}

export interface ReconcileItem {
  providerRef: string
  status: PaymentStatus
}

/** En-têtes HTTP sous forme `Headers` ou objet simple (routes Next / Hono). */
export type HeadersLike = Headers | Record<string, string | string[] | undefined>

/** Interface PSP stable (ADR-003, chapitre 19). Le domaine ne connaît que cette abstraction. */
export interface PaymentProvider {
  readonly id: PaymentProviderId
  createPayment(ctx: CreatePaymentContext): Promise<CreatePaymentResult>
  getStatus(providerRef: string): Promise<PaymentStatusResult>
  refund(providerRef: string, amount: number): Promise<RefundResult>
  /** Vérifie la signature et normalise le webhook ; lève `ForbiddenError` si la signature est invalide. */
  handleWebhook(headers: HeadersLike, rawBody: string): Promise<ParsedWebhook>
  /** Statuts connus du fournisseur pour les paiements en attente (rapprochement). */
  reconcile(): Promise<ReconcileItem[]>
}

/** Lit un en-tête quelle que soit la forme des headers. */
export function headerValue(headers: HeadersLike, name: string): string | undefined {
  if (headers instanceof Headers) return headers.get(name) ?? undefined
  const lower = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lower) continue
    return Array.isArray(value) ? value[0] : value
  }
  return undefined
}

/** Statuts de paiement définitifs. */
export const terminalPaymentStatuses: readonly PaymentStatus[] = ['SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED']

export function isTerminalStatus(status: PaymentStatus): boolean {
  return terminalPaymentStatuses.includes(status)
}
