import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button, EmptyState } from '@fetrag/ui'

interface StaffNotFoundProps {
  title: string
  description: string
  backHref: string
  backLabel: string
}

/** Page introuvable d'un espace institutionnel (ressource inexistante ou hors de votre portée). */
export function StaffNotFound({ title, description, backHref, backLabel }: StaffNotFoundProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-soft">
      <EmptyState
        icon={SearchX}
        title={title}
        description={description}
        action={
          <Button asChild variant="primary">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        }
      />
    </div>
  )
}
