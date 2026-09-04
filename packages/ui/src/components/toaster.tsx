'use client'

import * as React from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react'
import { Toaster as SonnerToaster, toast } from 'sonner'

import { cn } from '../lib/cn'

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>

/**
 * Notifications éphémères (sonner) stylées FETRAG.
 * À monter une seule fois dans le layout racine de chaque application.
 */
export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      duration={5000}
      gap={10}
      offset={16}
      className={cn('font-sans', className)}
      icons={{
        success: <CheckCircle2 className="size-5 text-green-700" strokeWidth={1.75} aria-hidden="true" />,
        error: <XCircle className="size-5 text-danger" strokeWidth={1.75} aria-hidden="true" />,
        warning: <AlertTriangle className="size-5 text-gold-700" strokeWidth={1.75} aria-hidden="true" />,
        info: <Info className="size-5 text-blue-600" strokeWidth={1.75} aria-hidden="true" />,
        loading: <Loader2 className="size-5 animate-spin text-blue-600" strokeWidth={1.75} aria-hidden="true" />,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            'group flex items-start gap-3 w-full rounded-xl border border-neutral-200 bg-white p-4 text-ink shadow-lift font-sans',
          title: 'text-sm font-semibold text-navy',
          description: 'text-sm text-neutral-600',
          icon: 'mt-0.5',
          actionButton: 'rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600',
          cancelButton: 'rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-neutral-200',
          closeButton:
            'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 hover:text-navy focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
          success: 'border-green-200 pillar-top-green',
          error: 'border-[#f5c6c6] border-t-[3px] border-t-danger',
          warning: 'border-gold-200 pillar-top-gold',
          info: 'border-blue-200 pillar-top-blue',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { toast }
