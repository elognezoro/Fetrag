'use client'

import type { ReactNode } from 'react'
import { Toaster, TooltipProvider } from '@fetrag/ui'

/** Fournisseurs client globaux : infobulles Radix et notifications toast (sonner). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
