// @fetrag/payments - Interface PSP stable (createPayment, getStatus, refund, handleWebhook, reconcile) + adaptateurs (sandbox, mobile money).

import { registerPaymentJobHandlers } from './register-handlers'

export type {
  PaymentProvider,
  PaymentProviderId,
  ParsedWebhook,
  NextAction,
  CreatePaymentContext,
  CreatePaymentResult,
  PaymentStatusResult,
  RefundResult,
  ReconcileItem,
  HeadersLike,
} from './provider'
export { headerValue, isTerminalStatus, terminalPaymentStatuses } from './provider'

export {
  getPaymentProvider,
  getPaymentProviderById,
  setPaymentProvider,
  isPaymentProviderId,
  SandboxProvider,
  AirtelMoneyProvider,
  MoovMoneyProvider,
} from './providers/index'
export { signSandboxPayload, SANDBOX_SIGNATURE_HEADER } from './providers/sandbox'

export { createCheckout, retryPayment } from './checkout'
export type { CheckoutResult } from './checkout'
export { confirmPayment } from './confirm'
export type { ConfirmPaymentOptions, ConfirmPaymentResult } from './confirm'
export { fulfillOrder } from './fulfill'
export type { FulfillmentResult } from './fulfill'
export { processWebhook, processWebhookEvent } from './webhooks'
export type { ProcessWebhookResult } from './webhooks'
export { refundPayment, refundInputSchema } from './refund'
export { reconcile, RECONCILE_AFTER_MS } from './reconcile'
export type { ReconcileResult } from './reconcile'
export { orders, orderListQuerySchema } from './orders'
export type { OrderListQuery } from './orders'
export { applyCoupon, normalizeCouponCode } from './coupons'
export type { AppliedCoupon } from './coupons'
export { buildOrderTotals, computeCouponDiscount } from './totals'
export type { CheckoutTotals, CheckoutTotalsInput, CouponLike } from './totals'
export { sandbox, simulate } from './sandbox'
export type { SandboxOutcome, SimulateResult } from './sandbox'
export { issueReceipt } from './receipt'
export { registerPaymentJobHandlers } from './register-handlers'
export { sendPaymentNotification } from './emails'
export type { PaymentEmailKind } from './emails'

// Enregistrement au chargement : tout processus important @fetrag/payments sait traiter `webhook.process`.
registerPaymentJobHandlers()
