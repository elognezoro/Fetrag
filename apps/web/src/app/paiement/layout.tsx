import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RingBackdrop } from '@fetrag/ui'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Paiement', template: '%s | Paiement FETRAG' },
  robots: { index: false, follow: false },
}

/** Parcours de paiement : mise en page resserrée, trame d'anneaux, sans navigation latérale. */
export default function PaymentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[calc(100dvh-var(--header-height))] overflow-hidden bg-neutral-50 py-8 sm:py-12">
      <RingBackdrop position="top-right" opacity={0.06} className="-z-10" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-50/80 to-transparent" />
      <div className="container-fetrag">{children}</div>
    </div>
  )
}
