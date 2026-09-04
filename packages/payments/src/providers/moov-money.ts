import { PreconditionError } from '@fetrag/domain'
import type {
  CreatePaymentContext,
  CreatePaymentResult,
  HeadersLike,
  ParsedWebhook,
  PaymentProvider,
  PaymentStatusResult,
  ReconcileItem,
  RefundResult,
} from '../provider'

/**
 * Squelette Moov Money (Gabon) - à brancher au cadrage (README.md du package).
 *
 * Endpoints de l'API marchand Moov Money (à confirmer avec l'opérateur) :
 * - Authentification : jeton via `POST /api/v1/auth/token` (identifiants marchand).
 * - Paiement (push) : `POST /api/v1/merchant/push` avec `msisdn`, `amount`, `reference` (= idempotencyKey),
 *   `callbackUrl` ; le client confirme par code PIN.
 * - Statut : `GET /api/v1/merchant/status/{reference}`.
 * - Remboursement : `POST /api/v1/merchant/refund` avec `transactionId` et `amount`.
 * - Webhook : `POST` sur `callbackUrl` avec `reference`, `status`, `transactionId`, signature HMAC dans l'en-tête
 *   (clé partagée) à vérifier avant de renvoyer un `ParsedWebhook`.
 * Variables attendues : MOOV_MERCHANT_ID, MOOV_API_KEY, MOOV_BASE_URL, MOOV_CALLBACK_SECRET.
 */
export class MoovMoneyProvider implements PaymentProvider {
  readonly id = 'moov-money' as const

  private notConfigured(): never {
    throw new PreconditionError('Fournisseur Moov Money non configuré : voir packages/payments/README.md', {
      provider: this.id,
    })
  }

  async createPayment(_ctx: CreatePaymentContext): Promise<CreatePaymentResult> {
    return this.notConfigured()
  }

  async getStatus(_providerRef: string): Promise<PaymentStatusResult> {
    return this.notConfigured()
  }

  async refund(_providerRef: string, _amount: number): Promise<RefundResult> {
    return this.notConfigured()
  }

  async handleWebhook(_headers: HeadersLike, _rawBody: string): Promise<ParsedWebhook> {
    return this.notConfigured()
  }

  async reconcile(): Promise<ReconcileItem[]> {
    return this.notConfigured()
  }
}
