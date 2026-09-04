'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'

import { cn } from '../lib/cn'

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  invalid?: boolean
}

/** Case à cocher accessible (Radix). Supporte l'état indéterminé. */
export const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox({ className, invalid, ...props }, ref) {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
        className={cn(
          'peer inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-neutral-400 bg-white',
          'transition-colors duration-180 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
          'data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white',
          'data-[state=indeterminate]:border-blue-500 data-[state=indeterminate]:bg-blue-500 data-[state=indeterminate]:text-white',
          'aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {props.checked === 'indeterminate' ? (
            <Minus className="size-3.5" strokeWidth={3} aria-hidden="true" />
          ) : (
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  },
)
