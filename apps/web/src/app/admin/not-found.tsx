import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Button, EmptyState } from '@fetrag/ui'

/** Élément d'administration introuvable (supprimé, identifiant erroné ou hors périmètre). */
export default function AdminNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 py-6">
      <EmptyState
        icon={SearchX}
        title="Élément introuvable"
        description="Ce contenu, cette demande ou cet utilisateur n’existe pas ou a été supprimé. Vérifiez le lien ou revenez à la liste."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/admin">Retour au tableau de bord</Link>
          </Button>
        }
      />
    </div>
  )
}
