import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RingBackdrop } from '@fetrag/ui'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/** Mise en page des écrans d'authentification : trame d'anneaux et carte centrée. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-[calc(100dvh-var(--header-height))] overflow-hidden py-10 sm:py-16">
      <RingBackdrop className="pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-50/80 to-transparent" />
      <div className="container-fetrag flex justify-center">{children}</div>
    </div>
  )
}
