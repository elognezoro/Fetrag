import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { Button, Emblem, Ribbon, RingBackdrop } from '@fetrag/ui'

interface SectionNotFoundProps {
  eyebrow?: string
  title: string
  description: string
  /** Lien principal de retour. */
  backHref: string
  backLabel: string
  backIcon?: LucideIcon
}

/** État « introuvable » d'une section apprenant : emblème, ruban, retour contextuel et tableau de bord. */
export function SectionNotFound({ eyebrow = 'Introuvable', title, description, backHref, backLabel, backIcon: BackIcon = ArrowLeft }: SectionNotFoundProps) {
  return (
    <div className="relative isolate overflow-hidden">
      <RingBackdrop position="top-right" opacity={0.05} />
      <div className="container-fetrag flex flex-col items-center py-16 text-center sm:py-24">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-white shadow-soft ring-8 ring-blue-50">
          <Emblem size={60} decorative />
        </div>
        <Ribbon tone="gold">{eyebrow}</Ribbon>
        <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-lg text-neutral-600">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild variant="primary">
            <Link href={backHref}>
              <BackIcon aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" />
              Tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
