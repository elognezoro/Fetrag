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
 * Squelette Airtel Money (Gabon) - à brancher au cadrage (README.md du package).
 *
 * Endpoints de l'API Airtel Money Open API (à confirmer avec le contrat commercial) :
 * - Authentification : `POST /auth/oauth2/token` (client_credentials) → jeton porteur.
 * - Encaissement (USSD push) : `POST /merchant/v1/payments/` avec `reference`, `subscriber.msisdn`,
 *   `transaction.amount`, `transaction.id` (= idempotencyKey) ; le client valide sur son téléphone.
 * - Statut : `GET /standard/v1/payments/{transactionId}`.
 * - Remboursement : `POST /standard/v1/payments/refund` avec `transaction.airtel_money_id`.
 * - Webhook (callback) : configuré dans le portail marchand ; corps JSON `transaction.{id,status_code,message,airtel_money_id}`,
 *   signature à vérifier (clé partagée) avant de renvoyer un `ParsedWebhook`.
 * Variables attendues : AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_BASE_URL, AIRTEL_COUNTRY=GA, AIRTEL_CURRENCY=XAF.
 */
export class AirtelMoneyProvider implements PaymentProvider {
  readonly id = 'airtel-money' as const

  private notConfigured(): never {
    throw new PreconditionError('Fournisseur Airtel Money non configuré : voir packages/payments/README.md', {
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
