import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { Button, EmptyState } from '@fetrag/ui'

/** Commande inconnue ou n'appartenant pas au compte connecté. */
export default function OrderNotFound() {
  return (
    <EmptyState
      icon={CreditCard}
      title="Commande introuvable"
      description="Cette commande n’existe pas ou n’est pas rattachée à votre compte. Retrouvez l’ensemble de vos paiements depuis votre espace."
      action={
        <Button asChild variant="primary" size="sm">
          <Link href="/espace/paiements">Mes paiements</Link>
        </Button>
      }
    />
  )
}
