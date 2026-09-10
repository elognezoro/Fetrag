'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '../lib/cn'

/** Onglets accessibles (Radix Tabs). */
export const Tabs = TabsPrimitive.Root

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** `pill` : capsule grise avec onglet actif blanc ; `underline` : filet bleu sous l'onglet actif. */
  variant?: 'pill' | 'underline'
}

export const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  function TabsList({ className, variant = 'pill', ...props }, ref) {
    return (
      <TabsPrimitive.List
        ref={ref}
        data-variant={variant}
        className={cn(
          'group/tabs inline-flex max-w-full items-center overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] sm:[mask-image:none]',
          variant === 'pill' && 'gap-1 rounded-full bg-neutral-100 p-1',
          variant === 'underline' && 'gap-1 border-b border-neutral-200',
          className,
        )}
        {...props}
      />
    )
  },
)

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-4 text-sm font-semibold text-neutral-600',
        'transition-[background-color,color,box-shadow] duration-180 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        'group-data-[variant=pill]/tabs:rounded-full group-data-[variant=pill]/tabs:data-[state=active]:bg-white group-data-[variant=pill]/tabs:data-[state=active]:text-blue-700 group-data-[variant=pill]/tabs:data-[state=active]:shadow-soft',
        'group-data-[variant=underline]/tabs:-mb-px group-data-[variant=underline]/tabs:border-b-2 group-data-[variant=underline]/tabs:border-transparent group-data-[variant=underline]/tabs:px-3 group-data-[variant=underline]/tabs:py-3 group-data-[variant=underline]/tabs:data-[state=active]:border-blue-500 group-data-[variant=underline]/tabs:data-[state=active]:text-blue-700',
        className,
      )}
      {...props}
    />
  )
})

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('mt-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40', className)}
      {...props}
    />
  )
})
