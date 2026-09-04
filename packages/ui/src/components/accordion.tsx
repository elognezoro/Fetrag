'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

import { cn } from '../lib/cn'

/** Accordéon accessible (Radix Accordion) : FAQ, détails de module. */
export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        'rounded-xl border border-neutral-200 bg-white transition-shadow data-[state=open]:shadow-soft',
        className,
      )}
      {...props}
    />
  )
})

export const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex min-h-11 flex-1 items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-navy',
          'transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 rounded-xl',
          '[&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-blue-700',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className="size-5 shrink-0 text-neutral-500 transition-transform duration-180 ease-out-expo"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})

export const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm leading-relaxed text-neutral-700 data-[state=open]:animate-rise"
      {...props}
    >
      <div className={cn('px-5 pb-5 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
})
