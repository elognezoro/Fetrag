import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { Button, EmptyState } from '@fetrag/ui'

/** Commande introuvable dans le parcours de paiement. */
export default function PaymentNotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <EmptyState
        icon={CreditCard}
        title="Commande introuvable"
        description="Le lien de paiement est invalide, expiré ou rattaché à un autre compte. Retrouvez vos commandes depuis votre espace personnel."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/espace/paiements">Mes paiements</Link>
          </Button>
        }
      />
    </div>
  )
}
