'use client'

import { useActionState } from 'react'
import { CreditCard } from 'lucide-react'
import { purchaseResourceAction, type ResourcePurchaseState } from '@/server/public/actions/resources'
import { FormStatus } from './form-status'
import { SubmitButton } from './submit-button'

interface ResourcePurchaseFormProps {
  resourceId: string
  slug: string
  priceLabel: string
}

const initial: ResourcePurchaseState = { status: 'idle' }

/** Achat d'une ressource premium : crée la commande et redirige vers le paiement. */
export function ResourcePurchaseForm({ resourceId, slug, priceLabel }: ResourcePurchaseFormProps) {
  const [state, action] = useActionState(purchaseResourceAction, initial)
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="resourceId" value={resourceId} />
      <input type="hidden" name="slug" value={slug} />
      <FormStatus state={state} withToast={false} />
      <SubmitButton variant="gold" size="lg" pendingLabel="Préparation du paiement" leftIcon={<CreditCard aria-hidden="true" />}>
        Acheter pour {priceLabel}
      </SubmitButton>
    </form>
  )
}
