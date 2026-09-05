import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/** Les espaces institutionnels lisent la session : rendu dynamique, jamais indexé. */
export const dynamic = 'force-dynamic'

export default function StaffGroupLayout({ children }: { children: ReactNode }) {
  return children
}
