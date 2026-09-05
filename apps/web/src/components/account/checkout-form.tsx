'use client'

import { useActionState, useState } from 'react'
import { CreditCard, Smartphone, Tag } from 'lucide-react'
import { paymentMethodLabels } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, FormField, Input, Label, RadioGroup, RadioGroupItem, cn } from '@fetrag/ui'
import { idleState, type ActionState } from '@/server/account/types'
import { applyCouponAction, payOrderAction, type CheckoutField } from '@/server/account/payments'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

type Method = 'MOBILE_MONEY' | 'CARD'

export interface CheckoutFormProps {
  orderId: string
  totalLabel: string
  defaultMethod: Method
  defaultPhone: string
  /** Un coupon peut être saisi tant qu'aucune remise n'est appliquée. */
  couponAllowed: boolean
  providerId: string
  paymentsEnabled: boolean
}

const methods: Array<{ value: Method; description: string; icon: typeof Smartphone }> = [
  { value: 'MOBILE_MONEY', description: 'Airtel Money ou Moov Money : validez le paiement depuis votre téléphone.', icon: Smartphone },
  { value: 'CARD', description: 'Carte bancaire Visa ou Mastercard via notre prestataire sécurisé.', icon: CreditCard },
]

/** Choix du moyen de paiement, numéro Mobile Money, code promotionnel et lancement du paiement. */
export function CheckoutForm({ orderId, totalLabel, defaultMethod, defaultPhone, couponAllowed, providerId, paymentsEnabled }: CheckoutFormProps) {
  const [method, setMethod] = useState<Method>(defaultMethod)
  const [payState, payAction] = useActionState<ActionState<CheckoutField>, FormData>(payOrderAction, idleState)
  const [couponState, couponAction] = useActionState<ActionState<CheckoutField>, FormData>(applyCouponAction, idleState)
  const couponApplied = couponState.status === 'success'

  return (
    <div className="flex flex-col gap-6">
      {couponAllowed && !couponApplied ? (
        <form action={couponAction} className="flex flex-col gap-3 rounded-2xl border border-dashed border-gold-300 bg-gold-50/60 p-4" noValidate>
          <input type="hidden" name="orderId" value={orderId} />
          <FormStatus state={couponState} withToast={false} />
          <FormField label="Code promotionnel" htmlFor="couponCode" error={couponState.fieldErrors?.couponCode} hint="Codes transmis par la fédération ou votre organisation.">
            <div id="couponCode-group" className="flex gap-2">
              <Input id="couponCode" name="couponCode" leadingIcon={Tag} placeholder="Ex. SECTION2026" maxLength={40} className="uppercase" />
              <SubmitButton variant="gold" size="md" pendingLabel="Vérification du code" className="shrink-0">
                Appliquer
              </SubmitButton>
            </div>
          </FormField>
        </form>
      ) : null}
      {couponApplied ? (
        <Alert variant="success">
          <AlertTitle>Code appliqué</AlertTitle>
          <AlertDescription>{couponState.message} Le nouveau total apparaît dans le récapitulatif.</AlertDescription>
        </Alert>
      ) : null}

      <form action={payAction} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="orderId" value={orderId} />
        <FormStatus state={payState} />
        {payState.status === 'success' && payState.data?.instructions ? (
          <Alert variant="info">
            <AlertTitle>Validez le paiement sur votre téléphone</AlertTitle>
            <AlertDescription>
              Une demande de confirmation vous a été envoyée. Une fois validée, votre commande sera confirmée automatiquement ; vous recevrez un email et votre reçu.
            </AlertDescription>
          </Alert>
        ) : null}

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-navy">Moyen de paiement</legend>
          <RadioGroup name="method" value={method} onValueChange={(value) => setMethod(value as Method)} className="grid gap-3 sm:grid-cols-2">
            {methods.map((item) => {
              const Icon = item.icon
              const id = `method-${item.value}`
              const active = method === item.value
              return (
                <label
                  key={item.value}
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-4 transition',
                    active ? 'border-blue-500 shadow-glow-blue' : 'border-neutral-200 hover:border-blue-300',
                  )}
                >
                  <RadioGroupItem id={id} value={item.value} className="mt-1" />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="inline-flex items-center gap-2 font-semibold text-navy">
                      <Icon className="size-4 text-blue-600" strokeWidth={1.75} aria-hidden="true" />
                      {paymentMethodLabels[item.value]}
                    </span>
                    <span className="text-xs text-neutral-600">{item.description}</span>
                  </span>
                </label>
              )
            })}
          </RadioGroup>
        </fieldset>

        {method === 'MOBILE_MONEY' ? (
          <FormField label="Numéro Mobile Money" htmlFor="phoneNumber" required error={payState.fieldErrors?.phoneNumber} hint="Le numéro qui recevra la demande de confirmation (ex. 077 52 27 98).">
            <Input id="phoneNumber" name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" defaultValue={defaultPhone} leadingIcon={Smartphone} maxLength={20} required />
          </FormField>
        ) : (
          <input type="hidden" name="phoneNumber" value="" />
        )}

        {providerId === 'sandbox' ? (
          <p className="rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-600">
            Environnement de démonstration : aucun débit réel. Vous choisirez l’issue du paiement sur la page suivante.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-600">
            Montant à régler : <span className="font-display text-xl font-semibold text-navy">{totalLabel}</span>
          </p>
          <SubmitButton variant="primary" size="lg" pendingLabel="Connexion au fournisseur de paiement" disabled={!paymentsEnabled} leftIcon={<Label className="sr-only">Payer</Label>}>
            Payer {totalLabel}
          </SubmitButton>
        </div>
        {!paymentsEnabled ? (
          <Alert variant="warning">
            <AlertDescription>Les paiements en ligne sont momentanément indisponibles. Contactez la fédération pour régler par virement ou en espèces.</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </div>
  )
}
