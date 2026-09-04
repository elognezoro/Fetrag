'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '../lib/cn'

/** Groupe de boutons radio (Radix). Navigation clavier par flèches incluse. */
export const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />
})

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  invalid?: boolean
}

/** Bouton radio circulaire, point bleu au centre (écho de l'anneau). */
export const RadioGroupItem = React.forwardRef<React.ComponentRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  function RadioGroupItem({ className, invalid, ...props }, ref) {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
        className={cn(
          'peer aspect-square size-5 shrink-0 rounded-full border-2 border-neutral-400 bg-white text-blue-500',
          'transition-colors duration-180 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
          'data-[state=checked]:border-blue-500 aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <span aria-hidden="true" className="block size-2.5 rounded-full bg-blue-500" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
  },
)
