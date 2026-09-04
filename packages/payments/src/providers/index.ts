import { getEnvSafe } from '@fetrag/config'
import { PreconditionError, ValidationError } from '@fetrag/domain'
import type { PaymentProvider, PaymentProviderId } from '../provider'
import { AirtelMoneyProvider } from './airtel-money'
import { MoovMoneyProvider } from './moov-money'
import { SandboxProvider } from './sandbox'

const knownIds: readonly PaymentProviderId[] = ['sandbox', 'airtel-money', 'moov-money']

const instances = new Map<PaymentProviderId, PaymentProvider>()
let override: PaymentProvider | undefined

export function isPaymentProviderId(value: string): value is PaymentProviderId {
  return (knownIds as readonly string[]).includes(value)
}

/** Fournisseur par identifiant (webhooks entrants adressés à un fournisseur précis). */
export function getPaymentProviderById(id: string): PaymentProvider {
  if (override && override.id === id) return override
  if (!isPaymentProviderId(id)) throw new ValidationError('Fournisseur de paiement inconnu', { provider: id })
  let instance = instances.get(id)
  if (!instance) {
    instance = id === 'airtel-money' ? new AirtelMoneyProvider() : id === 'moov-money' ? new MoovMoneyProvider() : new SandboxProvider()
    instances.set(id, instance)
  }
  return instance
}

/** Fournisseur configuré par `PAYMENT_PROVIDER` (sandbox par défaut). */
export function getPaymentProvider(): PaymentProvider {
  if (override) return override
  const configured = getEnvSafe().PAYMENT_PROVIDER ?? 'sandbox'
  if (configured === 'stripe') {
    throw new PreconditionError('Le fournisseur stripe n’est pas implémenté ; utiliser sandbox, airtel-money ou moov-money')
  }
  return getPaymentProviderById(configured)
}

/** Remplace le fournisseur courant (tests) ; `undefined` rétablit la configuration. */
export function setPaymentProvider(provider: PaymentProvider | undefined): void {
  override = provider
}

export { SandboxProvider, AirtelMoneyProvider, MoovMoneyProvider }
